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

  // Step 1: Fetch the artist
  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single()

  if (artistError || !artist) {
    return new NextResponse(artistError?.message || "Artist not found", { status: 404 })
  }

  // Step 2: Fetch the portfolio pieces for that artist
  const { data: portfolioPieces, error: piecesError } = await supabase
    .from("portfolio_pieces")
    .select("*")
    .eq("artist_id", id)
    .order("position", { ascending: true })

  if (piecesError) {
    // Log the error but don't fail the whole request
    console.error("Error fetching portfolio pieces:", piecesError)
    artist.portfolio = []
  } else {
    artist.portfolio = portfolioPieces
  }

  return NextResponse.json(artist)
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

<<<<<<< HEAD
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const id = params.id
=======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerSupabase()
  const { id } = await params
>>>>>>> jules-5480036992904768726-6ad232be

  const { data: artist, error } = await supabase.from("artists").delete().eq("id", id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(artist)
}
