<<<<<<< HEAD

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { appointment } = await request.json()

    if (!appointment) {
      return new NextResponse("Appointment data is required", { status: 400 })
    }

    // Basic validation
    if (!appointment.price || !appointment.artists?.name || !appointment.services?.name) {
      return new NextResponse("Incomplete appointment data for checkout.", { status: 400 })
    }

    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Appointment: ${appointment.services.name}`,
            description: `With ${appointment.artists.name} for ${appointment.clients?.full_name || "client"}`,
          },
          unit_amount: Math.round(appointment.price * 100), // Ensure it's an integer
        },
        quantity: 1,
      },
    ]

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    // Ensure the URL has a protocol, defaulting to https if missing.
    const baseUrl = appUrl?.startsWith("http") ? appUrl : `https://${appUrl}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/schedule/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/schedule?payment_status=cancelled`,
      metadata: {
        appointmentId: appointment.id,
      },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR] An unexpected error occurred:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
=======
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { appointment_id, amount, tip } = await req.json()

  if (!appointment_id || !amount) {
    return NextResponse.json({ error: "Appointment ID and amount are required" }, { status: 400 })
  }

  try {
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*, studio:studios(stripe_account_id)")
      .eq("id", appointment_id)
      .single()

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 })
    }

    const stripeAccountId = appointment.studio.stripe_account_id
    const totalAmount = amount + (tip || 0)
    const platformFee = 500 // $5 platform fee in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment on ${new Date(appointment.start_time).toLocaleDateString()}`,
            },
            unit_amount: totalAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointments`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointments`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      metadata: {
        appointmentId: appointment_id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
>>>>>>> jules-5480036992904768726-6ad232be
  }
}
