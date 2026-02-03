
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = ["admin", "superadmin"].includes(profile?.role || "")
    const db = isAdmin ? supabaseAdmin : supabase

    // RLS policies should handle security, but good to be explicit
    // Fetch messages
    const { data: messages, error } = await db
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

    try {
      const { data: participantRows } = await supabaseAdmin
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)

      const recipientIds = (participantRows || [])
        .map((row) => row.user_id)
        .filter((id) => id && id !== user.id)

      if (recipientIds.length > 0) {
        const { data: recipientProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, studio_id, email")
          .in("id", recipientIds)

        const { data: recipientSettings } = await supabaseAdmin
          .from("user_notification_settings")
          .select("user_id, email_enabled, in_app_enabled, notify_new_message")
          .in("user_id", recipientIds)

        const settingsMap = new Map(
          (recipientSettings || []).map((row) => [row.user_id, row])
        )

        const notifications = (recipientProfiles || [])
          .filter((recipient) => {
            const settings = settingsMap.get(recipient.id)
            return settings?.in_app_enabled !== false && settings?.notify_new_message !== false
          })
          .map((recipient) => ({
            user_id: recipient.id,
            studio_id: recipient.studio_id,
            type: "new_message",
            title: "New message",
            body: content ? content.slice(0, 140) : "You received a message.",
            data: { conversation_id: conversationId, message_id: message.id, sender_id: user.id },
          }))

        if (notifications.length > 0) {
          await supabaseAdmin.from("notifications").insert(notifications)
        }

        const emailRecipients = (recipientProfiles || [])
          .filter((recipient) => {
            const settings = settingsMap.get(recipient.id)
            return settings?.email_enabled !== false && settings?.notify_new_message !== false
          })
          .map((recipient) => ({
            user_id: recipient.id,
            studio_id: recipient.studio_id,
            conversation_id: conversationId,
          }))

        if (emailRecipients.length > 0) {
          const delayMinutes = Number(process.env.MESSAGE_EMAIL_DIGEST_MINUTES || "15")
          const nextSendAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()

          const digestRows = emailRecipients.map((recipient) => ({
            user_id: recipient.user_id,
            studio_id: recipient.studio_id,
            conversation_id: recipient.conversation_id,
            last_message_at: message.created_at,
            last_message_preview: content ? content.slice(0, 160) : "New message",
            pending_count: 1,
            next_send_at: nextSendAt,
          }))

          await supabaseAdmin
            .from("message_email_digests")
            .upsert(digestRows, { onConflict: "user_id,conversation_id" })
        }
      }
    } catch (notifyError) {
      console.error("Message notification failed:", notifyError)
    }

    return NextResponse.json(message)

  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
