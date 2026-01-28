
import { createServerSupabase } from "@/lib/supabase-server"
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
    // 1. Get IDs of conversations the user is part of
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at, is_archived')
      .eq('user_id', user.id)
      .eq('is_archived', isArchived) // Filter by archived status

    if (partError) throw partError

    if (!participations || participations.length === 0) {
      return NextResponse.json([])
    }

    const conversationIds = participations.map(p => p.conversation_id)

    // 2. Get the conversations details
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convError) throw convError

    // 3. Enrich conversations with other participants and last message
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      // Get other participants
      const { data: participants, error: pError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id)
        .neq('user_id', user.id) // Exclude self

      if (pError) console.error("Error fetching participants", pError)

      // Fetch profiles for these participants
      let participantProfiles = []
      if (participants && participants.length > 0) {
         const { data: profiles, error: profError } = await supabase
           .from('profiles')
           .select('id, full_name, avatar_url, role')
           .in('id', participants.map(p => p.user_id))

         if (!profError) participantProfiles = profiles
      }

      // Get last message
      const { data: lastMsg, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Calculate unread count (messages created after last_read_at)
      const myParticipation = participations.find(p => p.conversation_id === conv.id)
      const lastRead = myParticipation ? new Date(myParticipation.last_read_at) : new Date(0)

      const { count: unreadCount, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .gt('created_at', lastRead.toISOString())

      return {
        ...conv,
        participants: participantProfiles,
        last_message: lastMsg,
        unread_count: unreadCount || 0
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

  const { participant_ids, studio_id } = await req.json()

  if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
    return NextResponse.json({ error: "Participants required" }, { status: 400 })
  }

  // Include self in participants if not already there
  const allParticipants = new Set([...participant_ids, user.id])

  try {
    // Check if a 1-on-1 conversation already exists between these users (optional optimization)
    // For now, simply create a new one

    // 1. Create Conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({ studio_id })
      .select()
      .single()

    if (convError) throw convError

    // 2. Add Participants
    const participantsData = Array.from(allParticipants).map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }))

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participantsData)

    if (partError) throw partError

    return NextResponse.json(conversation)

  } catch (error: any) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
