import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const artistId = request.url.split("/").slice(-2, -1)[0] // Get the [id] from the URL

  try {
    // Get count of existing pieces for this artist to determine the new position
    const { count, error: countError } = await supabase
      .from("portfolio_pieces")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId)

    if (countError) {
      console.error("Error getting portfolio count:", countError)
      return new NextResponse(countError.message, { status: 500 })
    }

    const pieceData = await request.json()
    pieceData.artist_id = artistId
    pieceData.is_public = true // Ensure the piece is public by default
    pieceData.position = count || 0 // Set the position to the current count

    const { data, error } = await supabase
      .from("portfolio_pieces")
      .insert([pieceData])
      .select()

    if (error) {
      console.error("Error inserting portfolio piece:", error)
      return new NextResponse(error.message, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error parsing JSON or processing request:", err)
    return new NextResponse("Invalid request body", { status: 400 })
  }
}
