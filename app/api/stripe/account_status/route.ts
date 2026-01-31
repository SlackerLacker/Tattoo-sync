
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: Request) {
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
    return NextResponse.json({ status: "not_created" })
  }

  try {
    const account = await (stripe as any).v2.core.accounts.retrieve(studio.stripe_account_id, {
      include: ["configuration.merchant", "requirements"],
    })

    const readyToProcessPayments = account?.configuration?.merchant?.capabilities?.card_payments?.status === "active"

    const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status
    const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due"

    return NextResponse.json({
      status: "created",
      accountId: studio.stripe_account_id,
      readyToProcessPayments,
      onboardingComplete,
      requirementsStatus
    })
  } catch (error: any) {
    console.error("Account Status Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
