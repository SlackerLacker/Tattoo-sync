import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

<<<<<<< HEAD
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id
=======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be

  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

<<<<<<< HEAD
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id
=======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be

  const clientData = await request.json()

  const { data: client, error } = await supabase.from("clients").update(clientData).eq("id", id).select()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}

<<<<<<< HEAD
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id
=======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be

  const { data: client, error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
