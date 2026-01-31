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
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(product)
}

<<<<<<< HEAD
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
=======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be
  const { data: product, error } = await supabase
    .from("products")
    .update(await request.json())
    .eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(product)
}

<<<<<<< HEAD
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: product, error } = await supabase.from("products").delete().eq("id", params.id)
=======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
  const { data: product, error } = await supabase.from("products").delete().eq("id", id)
>>>>>>> jules-5480036992904768726-6ad232be

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(product)
}
