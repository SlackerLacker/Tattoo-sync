import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id } = await params

  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id } = await params

  const clientData = await request.json()

  const { data: client, error } = await supabase.from("clients").update(clientData).eq("id", id).select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase()
  const { id } = await params

  const { data: client, error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
