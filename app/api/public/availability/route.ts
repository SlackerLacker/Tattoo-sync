import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const studioId = url.searchParams.get("studioId")
  const artistId = url.searchParams.get("artistId")
  const date = url.searchParams.get("date")

  if (!studioId || !artistId || !date) {
    return new NextResponse("studioId, artistId, and date are required", { status: 400 })
  }

  const { data: appointments, error } = await supabaseAdmin
    .from("appointments")
    .select("id, artist_id, appointment_date, start_time, duration, status")
    .eq("studio_id", studioId)
    .eq("artist_id", artistId)
    .gte("appointment_date", `${date}T00:00:00`)
    .lte("appointment_date", `${date}T23:59:59`)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointments || [])
}
