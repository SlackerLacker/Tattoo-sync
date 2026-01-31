
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

  const { data: profile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()

  if (!profile?.studio_id) {
    return NextResponse.json({ error: "No studio found" }, { status: 400 })
  }

  const { data: studio } = await supabase.from("studios").select("stripe_account_id").eq("id", profile.studio_id).single()

  if (!studio?.stripe_account_id) {
    return NextResponse.json({ error: "Stripe account not created yet" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const baseUrl = appUrl?.startsWith("http") ? appUrl : `https://${appUrl}`

  try {
    const accountLink = await (stripe as any).v2.core.accountLinks.create({
      account: studio.stripe_account_id,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['merchant', 'customer'], // As per guide
          refresh_url: `${baseUrl}/settings`,
          return_url: `${baseUrl}/settings?onboarding=complete`,
        },
      },
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error("Account Link Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
