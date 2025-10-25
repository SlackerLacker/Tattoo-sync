
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const { appointmentId } = session.metadata!

    try {
      const { error } = await supabaseAdmin
        .from("appointments")
        .update({ payment_status: "paid", status: "completed" })
        .eq("id", appointmentId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error updating appointment after successful payment:", error)
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
