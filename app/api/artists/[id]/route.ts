import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: artist, error } = await supabase
    .from("artists")
    .update(await request.json())
    .eq("id", params.id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: artist, error } = await supabase.from("artists").delete().eq("id", params.id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}
