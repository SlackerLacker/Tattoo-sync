
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

  // Handle V2 Thin Events
  try {
    // Attempt to parse as thin event first if it matches specific criteria or try/catch
    // However, constructEvent is for V1 signed events. Thin events also use signatures.
    // The SDK might differentiate.
    // Let's assume standard events first.

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
        // Not a standard V1 event, try V2 Thin Event
        try {
             const thinEvent = (stripe as any).parseThinEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
             const v2Event = await (stripe as any).v2.core.events.retrieve(thinEvent.id)

             // Handle V2 Events
             if (v2Event.type === 'v2.account.requirements.updated' || v2Event.type.includes('capability_status_updated')) {
                 console.log("Received V2 Account Update:", v2Event.type)
                 // In a real app, update local DB with new status
             }
             return new NextResponse(null, { status: 200 })
        } catch (v2Err) {
            console.error("Webhook signature verification failed.", v2Err)
            return new NextResponse(`Webhook Error`, { status: 400 })
        }
    }

    // Handle V1 Events
    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === "checkout.session.completed") {
      const { appointmentId } = session.metadata || {}

      if (appointmentId) {
        try {
          const { error } = await supabaseAdmin
            .from("appointments")
            .update({ payment_status: "paid", status: "completed" })
            .eq("id", appointmentId)

          if (error) throw error
        } catch (error) {
          console.error("Error updating appointment:", error)
          return new NextResponse("Internal Server Error", { status: 500 })
        }
      }
    } else if (event.type.startsWith("customer.subscription")) {
        console.log("Received Subscription Event:", event.type)
        // TODO: Update user subscription status in database
        // const subscription = event.data.object as Stripe.Subscription
        // const customerId = subscription.customer
        // await supabaseAdmin.from('subscriptions').upsert(...)
    }

    return new NextResponse(null, { status: 200 })

  } catch (err: any) {
    console.error("Webhook Error:", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }
}
