
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, studio_id")
      .eq("id", user.id)
      .single()

    const isAdmin = ["admin", "superadmin"].includes(profile?.role)
    const db = isAdmin ? supabaseAdmin : supabase

    if (isAdmin) {
      const { data: convo, error: convoError } = await db
        .from("conversations")
        .select("id, studio_id")
        .eq("id", conversationId)
        .single()

      if (convoError) throw convoError
      if (!convo || !profile?.studio_id || convo.studio_id !== profile.studio_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { error } = await db
        .from("conversation_participants")
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_archived,
        })

      if (error) throw error
    } else {
      const { error } = await db
        .from('conversation_participants')
        .update({ is_archived })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      if (error) throw error
    }

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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, studio_id")
      .eq("id", user.id)
      .single()

    const isAdmin = ["admin", "superadmin"].includes(profile?.role)
    const db = isAdmin ? supabaseAdmin : supabase

    if (isAdmin) {
      const { data: convo, error: convoError } = await db
        .from("conversations")
        .select("id, studio_id")
        .eq("id", conversationId)
        .single()

      if (convoError) throw convoError
      if (!convo || !profile?.studio_id || convo.studio_id !== profile.studio_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Delete the participation row
    const { error } = await db
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
