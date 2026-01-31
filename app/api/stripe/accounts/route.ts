
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

  // Fetch profile and studio details
  const { data: profile } = await supabase
    .from("profiles")
    .select("studio_id, full_name, email, studios(name, stripe_account_id)")
    .eq("id", user.id)
    .single()

  if (!profile?.studio_id) {
    return NextResponse.json({ error: "No studio associated with user" }, { status: 400 })
  }

  const studio = profile.studios as any; // Cast to avoid TS issues if types aren't perfect

  if (studio?.stripe_account_id) {
    return NextResponse.json({
        message: "Stripe account already exists",
        accountId: studio.stripe_account_id
    })
  }

  try {
    // Create Stripe V2 Connected Account
    // The SDK provided instructions:
    // const account = await stripeClient.v2.core.accounts.create({...})

    // Cast stripe to any to bypass potential missing type definitions for V2
    const account = await (stripe as any).v2.core.accounts.create({
      display_name: studio.name || profile.full_name,
      contact_email: profile.email,
      identity: {
        country: 'US', // Hardcoded for US as per requirements/guide
      },
      dashboard: {
        type: 'full', // 'dashboard: "full"' in guide object property
      },
      defaults: {
          responsibilities: {
            fees_collector: 'stripe',
            losses_collector: 'stripe',
          },
       },
      configuration: {
        merchant: {
           capabilities: {
             card_payments: {
               requested: true,
             },
           },
        },
      },
    })

    // Save the account ID to the database
    const { error: dbError } = await supabase
        .from("studios")
        .update({ stripe_account_id: account.id })
        .eq("id", profile.studio_id)

    if (dbError) {
        throw new Error(`Database update failed: ${dbError.message}`)
    }

    return NextResponse.json({ account })
  } catch (error: any) {
    console.error("Stripe Account Creation Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
