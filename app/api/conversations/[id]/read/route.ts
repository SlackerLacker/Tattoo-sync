
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// POST: Mark conversation as read
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase()
  const { id: conversationId } = params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Error marking read:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
