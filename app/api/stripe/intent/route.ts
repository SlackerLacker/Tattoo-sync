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

    const { appointmentId, amount } = await request.json()
    if (!appointmentId || !amount || amount <= 0) {
      return new NextResponse("appointmentId and amount are required", { status: 400 })
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

    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(Number(amount) * 100),
        currency: "usd",
        metadata: {
          appointmentId: appointment.id,
          studioId: appointment.studio_id,
        },
      },
      { stripeAccount: studio.stripe_account_id },
    )

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      stripeAccountId: studio.stripe_account_id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    console.error("[STRIPE_INTENT_ERROR]", error)
    return new NextResponse(message, { status: 500 })
  }
}
