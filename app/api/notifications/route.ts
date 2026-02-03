import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const supabase = createServerSupabase()
  const url = new URL(req.url)
  const countOnly = url.searchParams.get("count") === "true"
  const unreadOnly = url.searchParams.get("unread") === "true"
  const limit = Number(url.searchParams.get("limit") || "50")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    if (countOnly) {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null)

      if (error) throw error
      return NextResponse.json({ count: count || 0 })
    }

    let query = supabase
      .from("notifications")
      .select("id, type, title, body, data, created_at, read_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.is("read_at", null)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
