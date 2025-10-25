import { createServerSupabase } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*, clients:clients(*), artists:artists(*), services:services(*)")
    .eq("id", params.id)
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(await request.json())
    .eq("id", params.id)
    .select("*, clients:clients(*), artists:artists(*), services:services(*)")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointment, error } = await supabase.from("appointments").delete().eq("id", params.id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}
