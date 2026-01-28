
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// DELETE: Delete a message
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id: messageId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Only allow deletion if the user is the sender
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
