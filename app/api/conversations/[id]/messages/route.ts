
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// GET: Fetch messages for a conversation
export async function GET(
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
    // RLS policies should handle security, but good to be explicit
    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(messages)

  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Send a new message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id: conversationId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { content, attachments } = await req.json()

  if (!content && (!attachments || attachments.length === 0)) {
    return NextResponse.json({ error: "Message content or attachment required" }, { status: 400 })
  }

  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        attachments: attachments || []
      })
      .select('*, sender:sender_id(full_name, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json(message)

  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
