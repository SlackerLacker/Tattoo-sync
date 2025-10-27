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

  const { studio_id } = await req.json()

  if (!studio_id) {
    return NextResponse.json({ error: "Studio ID is required" }, { status: 400 })
  }

  try {
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("stripe_account_id")
      .eq("id", studio_id)
      .single()

    if (studioError) {
      return NextResponse.json({ error: studioError.message }, { status: 500 })
    }

    let accountId = studio.stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // Or dynamically determine the country
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      const { error: updateError } = await supabase
        .from("studios")
        .update({ stripe_account_id: accountId })
        .eq("id", studio_id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
