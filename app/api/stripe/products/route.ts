
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()
  if (!profile?.studio_id) return NextResponse.json({ error: "No studio" }, { status: 400 })

  const { data: studio } = await supabase.from("studios").select("stripe_account_id").eq("id", profile.studio_id).single()
  if (!studio?.stripe_account_id) return NextResponse.json({ error: "No Stripe account" }, { status: 400 })

  try {
    const { name, description, priceInCents } = await req.json()

    const product = await stripe.products.create({
      name,
      description,
      default_price_data: {
        unit_amount: priceInCents,
        currency: 'usd',
      },
    }, {
      stripeAccount: studio.stripe_account_id,
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("Create Product Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
