
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

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

    if (!appointment.studio?.stripe_account_id) {
        return NextResponse.json({ error: "Studio not connected to Stripe" }, { status: 400 })
    }

    const stripeAccountId = appointment.studio.stripe_account_id
    const totalAmount = amount + (tip || 0)
    const platformFee = 500 // $5 platform fee in cents

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = appUrl?.startsWith("http") ? appUrl : `https://${appUrl}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment on ${new Date(appointment.appointment_date).toLocaleDateString()}`, // Fixed: use appointment_date
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents and ensure integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/schedule`, // Redirect back to schedule
      cancel_url: `${baseUrl}/schedule`,
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
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 })
  }
}
