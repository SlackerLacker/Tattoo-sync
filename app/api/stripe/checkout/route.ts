import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
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
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
