import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: existing, error } = await supabase
      .from("user_notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    if (existing) {
      return NextResponse.json(existing)
    }

    const defaults = {
      user_id: user.id,
      email_enabled: true,
      sms_enabled: true,
      in_app_enabled: true,
      new_bookings: true,
      cancellations: true,
      payments: true,
      reviews: true,
      reminders: true,
      reminder_time: 24,
      notify_new_conversation: true,
      notify_new_message: true,
    }

    const { data: inserted, error: insertError } = await supabase
      .from("user_notification_settings")
      .insert(defaults)
      .select("*")
      .single()

    if (insertError) throw insertError

    return NextResponse.json(inserted)
  } catch (error: any) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const update = {
      email_enabled: !!payload.email_enabled,
      sms_enabled: !!payload.sms_enabled,
      in_app_enabled: !!payload.in_app_enabled,
      new_bookings: !!payload.new_bookings,
      cancellations: !!payload.cancellations,
      payments: !!payload.payments,
      reviews: !!payload.reviews,
      reminders: !!payload.reminders,
      reminder_time: Number(payload.reminder_time || 24),
      notify_new_conversation: !!payload.notify_new_conversation,
      notify_new_message: !!payload.notify_new_message,
    }

    const { data, error } = await supabase
      .from("user_notification_settings")
      .update(update)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
