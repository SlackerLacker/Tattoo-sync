import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

const ADMIN_EMAIL = "fromashesllc@gmail.com"

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

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 })
  }

  try {
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("id, name, stripe_account_id")
      .eq("id", studio_id)
      .single()

    if (studioError) {
      return NextResponse.json({ error: studioError.message }, { status: 500 })
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [ADMIN_EMAIL],
        subject: `Stripe Connect request from ${studio?.name ?? "a studio"}`,
        text: [
          "A studio has requested Stripe Connect access.",
          "",
          `Studio: ${studio?.name ?? "Unknown"}`,
          `Studio ID: ${studio?.id ?? studio_id}`,
          `Owner Email: ${user.email ?? "Unknown"}`,
          `Existing Stripe Account ID: ${studio?.stripe_account_id ?? "Not set"}`,
        ].join("\n"),
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error("Resend error:", errorText)
      return NextResponse.json({ error: "Failed to send email." }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
