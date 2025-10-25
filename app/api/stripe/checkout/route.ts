
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  console.log("POST /api/stripe/checkout endpoint hit")
  try {
    const supabase = createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return new NextResponse("Unauthorized", { status: 401 })
    }
    console.log("User authenticated:", user.id)

    const { appointment } = await request.json()
    console.log("Received appointment data:", JSON.stringify(appointment, null, 2))

    if (!appointment) {
      console.error("Appointment data is missing from the request body")
      return new NextResponse("Appointment data is required", { status: 400 })
    }

    // Basic validation
    if (!appointment.price || !appointment.artists?.name || !appointment.services?.name) {
      console.error("Incomplete appointment data:", appointment)
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

    console.log("Creating Stripe session with line items:", JSON.stringify(lineItems, null, 2))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/schedule?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/schedule?payment_status=cancelled`,
      metadata: {
        appointmentId: appointment.id,
      },
    })

    console.log("Stripe session created successfully:", session.id)
    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR] An unexpected error occurred:", error)
    // Check for specific Stripe error types if needed
    // if (error instanceof Stripe.errors.StripeError) { ... }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
