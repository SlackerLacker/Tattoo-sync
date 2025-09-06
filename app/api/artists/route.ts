import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: artists, error } = await supabase.from("artists").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artists)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse("User not authenticated", { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return new NextResponse("User profile not found", { status: 404 })
  }

  const artistData = await request.json()
  artistData.studio_id = profile.studio_id

  const { data: artist, error } = await supabase.from("artists").insert([artistData]).select()

  if (error) {
    console.error(error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}
