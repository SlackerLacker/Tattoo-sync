import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const artistId = request.url.split("/").slice(-2, -1)[0] // Get the [id] from the URL

  try {
    const pieceData = await request.json()
    pieceData.artist_id = artistId

    console.log("Attempting to insert portfolio piece with artist_id:", artistId)
    console.log("Final data for insert:", pieceData)

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
