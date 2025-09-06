import { createServerSupabase } from "@/lib/supabase/server-client"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: artists, error } = await supabase.from("artists").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artists)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: artist, error } = await supabase.from("artists").insert([await request.json()])

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}
