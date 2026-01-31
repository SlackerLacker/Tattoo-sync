
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

<<<<<<< HEAD
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
=======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*, clients:clients(*), artists:artists(*), services:services(*)")
    .eq("id", id)
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}

<<<<<<< HEAD
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
=======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be
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

<<<<<<< HEAD
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: appointment, error } = await supabase.from("appointments").delete().eq("id", params.id)
=======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
  const { data: appointment, error } = await supabase.from("appointments").delete().eq("id", id)
>>>>>>> jules-5480036992904768726-6ad232be

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}
