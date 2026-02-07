import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabase()
  const payload = await request.json()

  const {
    appointment_id,
    studio_id,
    amount,
    status = "paid",
    method = null,
    reference = null,
    card_brand = null,
    card_last4 = null,
  } = payload || {}

  if (!appointment_id || !studio_id) {
    return new NextResponse("appointment_id and studio_id are required", { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.studio_id !== studio_id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert([
      {
        appointment_id,
        studio_id,
        amount: Number(amount || 0),
        status,
        method,
        reference,
        card_brand,
        card_last4,
      },
    ])
    .select()
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(payment)
}
