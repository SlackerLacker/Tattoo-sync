import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const {
      studioId,
      bookingSlug,
      artistId,
      serviceId,
      appointmentDate,
      startTime,
      client,
      notes,
    } = payload || {}

    if (!studioId || !bookingSlug || !artistId || !serviceId || !appointmentDate || !startTime || !client?.email) {
      return new NextResponse("Missing required booking data", { status: 400 })
    }

    const { data: bookingLink } = await supabaseAdmin
      .from("booking_links")
      .select("id, booking_slug, studio_id")
      .eq("studio_id", studioId)
      .eq("booking_slug", bookingSlug)
      .eq("is_active", true)
      .single()

    if (!bookingLink) {
      return new NextResponse("Booking link not found", { status: 404 })
    }

    const { data: studio } = await supabaseAdmin
      .from("studios")
      .select("*")
      .eq("id", studioId)
      .single()

    if (!studio) {
      return new NextResponse("Studio not found", { status: 404 })
    }

    const { data: service } = await supabaseAdmin
      .from("services")
      .select("id, name, price, duration_minutes")
      .eq("id", serviceId)
      .eq("studio_id", studioId)
      .single()

    if (!service) {
      return new NextResponse("Service not found", { status: 404 })
    }

    const normalizedEmail = String(client.email).trim().toLowerCase()
    const servicePrice = Number(service.price || 0)
    const depositValue = studio.require_deposit
      ? studio.deposit_percentage
        ? Math.round((servicePrice * Number(studio.deposit_amount || 0)) / 100)
        : Math.round(Number(studio.deposit_amount || 0))
      : 0

    const baseUrl = new URL(request.url).origin

    if (!depositValue || depositValue <= 0) {
      const { data: existingClient } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("studio_id", studioId)
        .eq("email", normalizedEmail)
        .maybeSingle()

      let clientId = existingClient?.id
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabaseAdmin
          .from("clients")
          .insert([
            {
              full_name: client.full_name || "Client",
              email: normalizedEmail,
              phone: client.phone || null,
              studio_id: studioId,
            },
          ])
          .select()
          .single()

        if (clientError) {
          return new NextResponse(clientError.message, { status: 500 })
        }

        clientId = newClient.id
      }

      await supabaseAdmin.from("appointments").insert([
        {
          studio_id: studioId,
          artist_id: artistId,
          client_id: clientId,
          service_id: serviceId,
          appointment_date: appointmentDate,
          start_time: startTime,
          duration: service.duration_minutes || 60,
          status: "pending",
          price: servicePrice,
          deposit_paid: 0,
          payment_status: "unpaid",
          notes: notes || null,
        },
      ])

      return NextResponse.json({
        checkoutUrl: `${baseUrl}/studios/${studioId}/book/${bookingSlug}/confirmation`,
      })
    }

    if (!studio.stripe_account_id) {
      return new NextResponse("Studio payment account not configured", { status: 400 })
    }

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Deposit for ${service.name}`,
                description: `Booking at ${studio.name || "Studio"}`,
              },
              unit_amount: Math.max(0, depositValue) * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/studios/${studioId}/book/${bookingSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/studios/${studioId}/book/${bookingSlug}?cancelled=1`,
        metadata: {
          studioId,
          bookingSlug,
          artistId,
          serviceId,
          appointmentDate,
          startTime,
          clientName: client.full_name || "Client",
          clientEmail: normalizedEmail,
          clientPhone: client.phone || "",
          notes: notes || "",
        },
      },
      { stripeAccount: studio.stripe_account_id },
    )

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    console.error("[PUBLIC_BOOKING_CHECKOUT_ERROR]", error)
    return new NextResponse(message, { status: 500 })
  }
}
