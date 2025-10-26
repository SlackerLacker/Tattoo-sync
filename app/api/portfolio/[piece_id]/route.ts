import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { piece_id: string } }) {
  const supabase = createServerSupabase()
  const pieceId = params.piece_id

  if (!pieceId) {
    return new NextResponse("Missing piece ID", { status: 400 })
  }

  try {
    const { is_public } = await request.json()
    if (typeof is_public !== "boolean") {
      return new NextResponse("Invalid 'is_public' value", { status: 400 })
    }

    const { error, data } = await supabase
      .from("portfolio_pieces")
      .update({ is_public })
      .eq("id", pieceId)
      .select()

    if (error) {
      console.error("Error updating portfolio piece status:", error)
      return new NextResponse(error.message, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error processing request:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { piece_id: string } }) {
  const supabase = createServerSupabase()
  const pieceId = params.piece_id

  if (!pieceId) {
    return new NextResponse("Missing piece ID", { status: 400 })
  }

  try {
    const pieceData = await request.json()
    const { error, data } = await supabase
      .from("portfolio_pieces")
      .update(pieceData)
      .eq("id", pieceId)
      .select()

    if (error) {
      console.error("Error updating portfolio piece:", error)
      return new NextResponse(error.message, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error processing request:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { piece_id: string } }) {
  const supabase = createServerSupabase()
  const pieceId = params.piece_id

  if (!pieceId) {
    return new NextResponse("Missing piece ID", { status: 400 })
  }

  try {
    const { error } = await supabase.from("portfolio_pieces").delete().eq("id", pieceId)

    if (error) {
      console.error("Error deleting portfolio piece:", error)
      return new NextResponse(error.message, { status: 400 })
    }

    return new NextResponse(null, { status: 204 }) // 204 No Content is standard for successful DELETE
  } catch (err) {
    console.error("Error processing request:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
