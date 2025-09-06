import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const { data: artist, error } = await supabase.from("artists").select("*").eq("id", id).single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const { data: artist, error } = await supabase
    .from("artists")
    .update(await request.json())
    .eq("id", id)
    .select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const { data: artist, error } = await supabase.from("artists").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}
