
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const studioId = params.id
  const { stripe_account_id } = await request.json()

  // Get the current user and their profile to verify ownership
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  // Check if the user is associated with the studio they're trying to edit
  if (!profile || profile.studio_id !== studioId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Update the studio's Stripe account ID
  const { data, error } = await supabase
    .from("studios")
    .update({ stripe_account_id })
    .eq("id", studioId)
    .select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(data)
}
