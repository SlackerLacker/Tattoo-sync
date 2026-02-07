import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const { paymentIntentId, studioId } = await request.json()

    if (!paymentIntentId || !studioId) {
      return new NextResponse("paymentIntentId and studioId are required", { status: 400 })
    }

    const { data: studio } = await supabaseAdmin
      .from("studios")
      .select("stripe_account_id")
      .eq("id", studioId)
      .single()

    if (!studio?.stripe_account_id) {
      return new NextResponse("Studio payment account not configured", { status: 400 })
    }

    let intent
    try {
      intent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ["latest_charge"] },
        { stripeAccount: studio.stripe_account_id },
      )
    } catch (error) {
      const stripeError = error as { code?: string; raw?: { code?: string } }
      const errorCode = stripeError?.code || stripeError?.raw?.code
      if (errorCode === "resource_missing") {
        intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] })
      } else {
        throw error
      }
    }

    if (intent.status !== "succeeded") {
      return new NextResponse("Payment not completed", { status: 400 })
    }

    const {
      studioId: metaStudioId,
      artistId,
      serviceId,
      appointmentDate,
      startTime,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = intent.metadata || {}

    if (!metaStudioId || !artistId || !serviceId || !appointmentDate || !startTime || !clientEmail) {
      return new NextResponse("Payment metadata incomplete", { status: 400 })
    }

    const normalizedEmail = clientEmail.trim().toLowerCase()
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("studio_id", metaStudioId)
      .eq("email", normalizedEmail)
      .maybeSingle()

    let clientId = existingClient?.id
    if (!clientId) {
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from("clients")
        .insert([
          {
            full_name: clientName || "Client",
            email: normalizedEmail,
            phone: clientPhone || null,
            studio_id: metaStudioId,
          },
        ])
        .select()
        .single()

      if (clientError) {
        return new NextResponse(clientError.message, { status: 500 })
      }

      clientId = newClient.id
    }

    const { data: service } = await supabaseAdmin
      .from("services")
      .select("duration_minutes, price")
      .eq("id", serviceId)
      .eq("studio_id", metaStudioId)
      .single()

    const { data: existingAppointment } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .eq("studio_id", metaStudioId)
      .eq("artist_id", artistId)
      .eq("client_id", clientId)
      .eq("appointment_date", appointmentDate)
      .eq("start_time", startTime)
      .maybeSingle()

    let appointmentId = existingAppointment?.id as string | undefined
    if (!existingAppointment) {
      const { data: createdAppointment } = await supabaseAdmin.from("appointments").insert([
        {
          studio_id: metaStudioId,
          artist_id: artistId,
          client_id: clientId,
          service_id: serviceId,
          appointment_date: appointmentDate,
          start_time: startTime,
          duration: service?.duration_minutes || 60,
          status: "pending",
          price: service?.price || 0,
          deposit_paid: intent.amount_received ? intent.amount_received / 100 : 0,
          payment_status: "paid",
          payment_method: "card",
          notes: notes || null,
        },
      ]).select("id").single()
      appointmentId = createdAppointment?.id
    }

    if (appointmentId) {
      const latestCharge = intent.latest_charge as
        | { payment_method_details?: { card?: { brand?: string; last4?: string } } }
        | null
        | undefined
      await supabaseAdmin.from("payments").insert([
        {
          appointment_id: appointmentId,
          studio_id: metaStudioId,
          amount: intent.amount_received ? intent.amount_received / 100 : 0,
          status: "paid",
          method: "card",
          reference: intent.id,
          card_brand: latestCharge?.payment_method_details?.card?.brand ?? null,
          card_last4: latestCharge?.payment_method_details?.card?.last4 ?? null,
        },
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    console.error("[PUBLIC_BOOKING_CONFIRM_ERROR]", error)
    return new NextResponse(message, { status: 500 })
  }
}
