import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendEmail } from "@/lib/email"
import { NextResponse } from "next/server"

type DigestRow = {
  user_id: string
  studio_id: string | null
  conversation_id: string
  last_message_at: string
  last_message_preview: string | null
  pending_count: number
}

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const headerSecret = req.headers.get("x-cron-secret")
    if (headerSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const now = new Date().toISOString()
    const { data: rows, error } = await supabaseAdmin
      .from("message_email_digests")
      .select("user_id, studio_id, conversation_id, last_message_at, last_message_preview, pending_count")
      .lte("next_send_at", now)
      .gt("pending_count", 0)
      .limit(200)

    if (error) throw error
    if (!rows || rows.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const recipientIds = Array.from(new Set(rows.map((row) => row.user_id)))
    const conversationIds = Array.from(new Set(rows.map((row) => row.conversation_id)))

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", recipientIds)

    const { data: settings } = await supabaseAdmin
      .from("user_notification_settings")
      .select("user_id, email_enabled, notify_new_message")
      .in("user_id", recipientIds)

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))
    const settingsMap = new Map((settings || []).map((s) => [s.user_id, s]))

    const { data: participantRows } = await supabaseAdmin
      .from("conversation_participants")
      .select("user_id, conversation_id, last_read_at")
      .in("user_id", recipientIds)
      .in("conversation_id", conversationIds)

    const lastReadMap = new Map<string, string>()
    for (const row of participantRows || []) {
      lastReadMap.set(`${row.user_id}:${row.conversation_id}`, row.last_read_at)
    }

    const grouped = new Map<string, DigestRow[]>()
    for (const row of rows as DigestRow[]) {
      const lastRead = lastReadMap.get(`${row.user_id}:${row.conversation_id}`)
      if (lastRead && new Date(lastRead).getTime() >= new Date(row.last_message_at).getTime()) {
        continue
      }
      if (!grouped.has(row.user_id)) grouped.set(row.user_id, [])
      grouped.get(row.user_id)?.push(row)
    }

    let sentCount = 0
    for (const [userId, userRows] of grouped.entries()) {
      const profile = profileMap.get(userId)
      const prefs = settingsMap.get(userId)
      if (!profile?.email || prefs?.email_enabled === false || prefs?.notify_new_message === false) {
        continue
      }

      const totalMessages = userRows.reduce((sum, row) => sum + (row.pending_count || 0), 0)
      const items = userRows
        .map(
          (row) =>
            `<li><strong>${row.pending_count} new</strong> in a conversation · ${
              row.last_message_preview || "New message"
            }</li>`
        )
        .join("")

      await sendEmail({
        to: profile.email,
        subject: `You have ${totalMessages} new message${totalMessages === 1 ? "" : "s"}`,
        html: `<p>Hi ${profile.full_name || "there"},</p>
<p>You have ${totalMessages} new message${totalMessages === 1 ? "" : "s"} waiting.</p>
<ul>${items}</ul>
<p>Open InkSync to reply.</p>`,
      })

      sentCount += 1
    }

    const resetUpdates = rows.map((row) => ({
      user_id: row.user_id,
      conversation_id: row.conversation_id,
      pending_count: 0,
      next_send_at: null,
      last_sent_at: now,
    }))

    await supabaseAdmin
      .from("message_email_digests")
      .upsert(resetUpdates, { onConflict: "user_id,conversation_id" })

    return NextResponse.json({ sent: sentCount })
  } catch (error: any) {
    console.error("Digest send failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
