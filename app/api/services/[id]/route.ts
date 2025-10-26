import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id

  const { data: service, error } = await supabase.from("services").select("*").eq("id", id).single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(service)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id

  const { data: service, error } = await supabase
    .from("services")
    .update(await request.json())
    .eq("id", id)
    .select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(service)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id

  const { data: service, error } = await supabase.from("services").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(service)
}
