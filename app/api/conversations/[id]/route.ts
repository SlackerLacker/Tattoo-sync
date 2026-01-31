
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// PATCH: Archive/Unarchive conversation
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id: conversationId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { is_archived } = await req.json()

  try {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_archived })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error archiving conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: "Delete" conversation (Leave or Hide)
// For now, we'll implement this as removing the participant row.
// If all participants leave, the conversation remains orphaned or could be cleaned up.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id: conversationId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete the participation row
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
