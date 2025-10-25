
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { appointment } = await request.json()

    if (!appointment) {
      return new NextResponse("Appointment data is required", { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with ${appointment.artists.name} for ${appointment.services.name}`,
              description: `Client: ${appointment.clients.full_name}`,
            },
            unit_amount: appointment.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/schedule?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/schedule?payment_status=cancelled`,
      metadata: {
        appointmentId: appointment.id,
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
