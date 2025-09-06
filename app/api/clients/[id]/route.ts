import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)

  const clientData = await request.json()
  if (clientData.name) {
    clientData.full_name = clientData.name
    delete clientData.name
  }

  const { data: client, error } = await supabase
    .from("clients")
    .update(clientData)
    .eq("id", params.id)
    .select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: client, error } = await supabase.from("clients").delete().eq("id", params.id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
