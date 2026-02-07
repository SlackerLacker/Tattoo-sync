import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { appointmentId, paymentIntentId } = await request.json()
    if (!appointmentId || !paymentIntentId) {
      return new NextResponse("appointmentId and paymentIntentId are required", { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("studio_id")
      .eq("id", user.id)
      .single()

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, studio_id")
      .eq("id", appointmentId)
      .single()

    if (!appointment || !profile || appointment.studio_id !== profile.studio_id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { data: studio } = await supabase
      .from("studios")
      .select("stripe_account_id")
      .eq("id", appointment.studio_id)
      .single()

    if (!studio?.stripe_account_id) {
      return new NextResponse("Studio payment account not configured", { status: 400 })
    }

    const intent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ["latest_charge"] },
      { stripeAccount: studio.stripe_account_id },
    )

    const latestCharge = intent.latest_charge as
      | { payment_method_details?: { card?: { brand?: string; last4?: string } } }
      | null
      | undefined

    return NextResponse.json({
      reference: intent.id,
      card_brand: latestCharge?.payment_method_details?.card?.brand ?? null,
      card_last4: latestCharge?.payment_method_details?.card?.last4 ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    console.error("[STRIPE_INTENT_DETAILS_ERROR]", error)
    return new NextResponse(message, { status: 500 })
  }
}
