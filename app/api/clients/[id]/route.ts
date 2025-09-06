import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const clientData = await request.json()
  if (clientData.name) {
    clientData.full_name = clientData.name
    delete clientData.name
  }

  const { data: client, error } = await supabase.from("clients").update(clientData).eq("id", id).select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const id = request.url.split("/").pop()

  const { data: client, error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
