import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabase()

  try {
    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds)) {
      return new NextResponse("Invalid request body: 'orderedIds' must be an array.", { status: 400 })
    }

    const updates = orderedIds.map((id, index) =>
      supabase.from("portfolio_pieces").update({ position: index }).eq("id", id)
    )

    // Supabase doesn't have a simple transaction for multiple updates in JS,
    // but we can run them in parallel. PostgREST and RLS will ensure security.
    const results = await Promise.all(updates)

    const error = results.find((result) => result.error)
    if (error) {
      console.error("Error reordering portfolio pieces:", error.error)
      return new NextResponse(error.error.message, { status: 400 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error("Error processing request:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
