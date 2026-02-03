
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendEmail } from "@/lib/email"
import { NextResponse } from "next/server"

// GET: List conversations for the current user
export async function GET(req: Request) {
  const supabase = createServerSupabase()
  const url = new URL(req.url)
  const isArchived = url.searchParams.get("archived") === "true"

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

    if (!profile?.studio_id) {
      return NextResponse.json({ error: "User is not associated with a studio" }, { status: 400 })
    }

    const isAdmin = ["admin", "superadmin"].includes(profile.role)
    const db = isAdmin ? supabaseAdmin : supabase

    let conversationIds: string[] = []
    let participations: any[] = []
    const participationMap = new Map<string, { is_archived: boolean; last_read_at?: string }>()

    if (isAdmin) {
      const { data: conversations, error: convError } = await db
        .from('conversations')
        .select('*')
        .eq('studio_id', profile.studio_id)
        .order('updated_at', { ascending: false })

      if (convError) throw convError

      conversationIds = (conversations || []).map((conv) => conv.id)

      if (conversationIds.length === 0) {
        return NextResponse.json([])
      }

      const { data: archivedRows, error: archiveError } = await db
        .from("conversation_participants")
        .select("conversation_id, last_read_at, is_archived")
        .eq("user_id", user.id)
        .in("conversation_id", conversationIds)

      if (archiveError) throw archiveError
      participations = archivedRows || []
      for (const row of archivedRows || []) {
        participationMap.set(row.conversation_id, {
          is_archived: row.is_archived === true,
          last_read_at: row.last_read_at,
        })
      }

      if (isArchived) {
        conversationIds = conversationIds.filter((id) => participationMap.get(id)?.is_archived === true)
      } else {
        conversationIds = conversationIds.filter((id) => {
          const participation = participationMap.get(id)
          return participation ? participation.is_archived !== true : false
        })
      }

      if (conversationIds.length === 0) {
        return NextResponse.json([])
      }
    } else {
      // 1. Get IDs of conversations the user is part of
      const { data: partRows, error: partError } = await db
        .from('conversation_participants')
        .select('conversation_id, last_read_at, is_archived')
        .eq('user_id', user.id)
        .eq('is_archived', isArchived) // Filter by archived status

      if (partError) throw partError

      if (!partRows || partRows.length === 0) {
        return NextResponse.json([])
      }

      participations = partRows
      for (const row of partRows || []) {
        participationMap.set(row.conversation_id, {
          is_archived: row.is_archived === true,
          last_read_at: row.last_read_at,
        })
      }
      conversationIds = partRows.map(p => p.conversation_id)
    }

    // 2. Get the conversations details
    const { data: conversations, error: convError } = await db
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convError) throw convError

    // 3. Enrich conversations with other participants and last message
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      // Get other participants
      const { data: participants, error: pError } = await db
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id)
        .neq('user_id', user.id) // Exclude self

      if (pError) console.error("Error fetching participants", pError)

      // Fetch profiles for these participants
      let participantProfiles: any[] = []
      if (participants && participants.length > 0) {
         const { data: profiles, error: profError } = await db
           .from('profiles')
           .select('id, full_name, avatar_url, role')
           .in('id', participants.map((p: any) => p.user_id))

         if (!profError && profiles) participantProfiles = profiles
      }

      // Get last message
      const { data: lastMsg, error: msgError } = await db
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Calculate unread count (messages created after last_read_at)
      const myParticipation = participations.find(p => p.conversation_id === conv.id)
      const lastRead = myParticipation ? new Date(myParticipation.last_read_at) : new Date(0)

      const { count: unreadCount, error: countError } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .gt('created_at', lastRead.toISOString())

      return {
        ...conv,
        participants: participantProfiles,
        last_message: lastMsg,
        unread_count: unreadCount || 0,
        is_archived: participationMap.get(conv.id)?.is_archived === true
      }
    }))

    return NextResponse.json(enrichedConversations)

  } catch (error: any) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new conversation
export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { participant_ids, studio_id: requestedStudioId, initial_message } = await req.json()

  if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
    return NextResponse.json({ error: "Participants required" }, { status: 400 })
  }

  // Include self in participants if not already there
  const allParticipants = new Set([...participant_ids, user.id])

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, studio_id")
      .eq("id", user.id)
      .single()

    const isAdmin = ["admin", "superadmin"].includes(profile?.role)
    const db = isAdmin ? supabaseAdmin : supabase
    const studioId =
      profile?.role === "superadmin" && requestedStudioId ? requestedStudioId : profile?.studio_id

    console.log("Create conversation context:", {
      userId: user.id,
      role: profile?.role,
      profileStudioId: profile?.studio_id,
      requestedStudioId,
      resolvedStudioId: studioId,
      isAdmin,
    })

    if (!studioId) {
      return NextResponse.json({ error: "User is not associated with a studio" }, { status: 400 })
    }

    // Check if a 1-on-1 conversation already exists between these users (optional optimization)
    // For now, simply create a new one

    // 1. Create Conversation
    const { data: conversation, error: convError } = await db
      .from('conversations')
      .insert({ studio_id: studioId })
      .select()
      .single()

    if (convError) throw convError

    // 2. Add Participants
    const participantsData = Array.from(allParticipants).map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }))

    const { error: partError } = await db
      .from('conversation_participants')
      .insert(participantsData)

    if (partError) throw partError

    if (initial_message && String(initial_message).trim()) {
      const { error: msgError } = await db
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: String(initial_message).trim(),
        })

      if (msgError) throw msgError
    }

    const recipientIds = Array.from(allParticipants).filter((id) => id !== user.id)
    if (recipientIds.length > 0) {
      try {
        const { data: recipientProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email, studio_id")
          .in("id", recipientIds)

        const { data: recipientSettings } = await supabaseAdmin
          .from("user_notification_settings")
          .select("user_id, email_enabled, in_app_enabled, notify_new_conversation")
          .in("user_id", recipientIds)

        const settingsMap = new Map(
          (recipientSettings || []).map((row) => [row.user_id, row])
        )

        if (recipientProfiles && recipientProfiles.length > 0) {
          const notifications = recipientProfiles
            .filter((recipient) => {
              const settings = settingsMap.get(recipient.id)
              return settings?.in_app_enabled !== false && settings?.notify_new_conversation !== false
            })
            .map((recipient) => ({
              user_id: recipient.id,
              studio_id: recipient.studio_id,
              type: "conversation_started",
              title: "New conversation started",
              body: "You have a new conversation.",
              data: { conversation_id: conversation.id, created_by: user.id },
            }))

          if (notifications.length > 0) {
            await supabaseAdmin.from("notifications").insert(notifications)
          }

          const emailRecipients = recipientProfiles
            .filter((recipient) => {
              const settings = settingsMap.get(recipient.id)
              return (
                !!recipient.email &&
                settings?.email_enabled !== false &&
                settings?.notify_new_conversation !== false
              )
            })
            .map((recipient) => recipient.email)

          if (emailRecipients.length > 0) {
            await sendEmail({
              to: emailRecipients,
              subject: "You have a new conversation",
              html: `<p>You have a new conversation in InkSync.</p>`,
            })
          }
        }
      } catch (notifyError) {
        console.error("Notification/email failed:", notifyError)
      }
    }

    return NextResponse.json(conversation)

  } catch (error: any) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
