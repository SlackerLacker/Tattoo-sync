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

  const { stripeAccountId } = await req.json()

  if (!stripeAccountId) {
    return NextResponse.json({ error: "Stripe account ID is required" }, { status: 400 })
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId)

    return NextResponse.json({ url: loginLink.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
