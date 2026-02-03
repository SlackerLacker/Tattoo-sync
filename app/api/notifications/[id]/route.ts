import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { read } = await req.json().catch(() => ({ read: true }))
  const readAt = read ? new Date().toISOString() : null

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
