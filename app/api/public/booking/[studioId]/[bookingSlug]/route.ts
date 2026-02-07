import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(
  _request: Request,
  { params }: { params: { studioId: string; bookingSlug: string } },
) {
  const { studioId, bookingSlug } = params

  const { data: bookingLink, error: linkError } = await supabaseAdmin
    .from("booking_links")
    .select("*")
    .eq("studio_id", studioId)
    .eq("booking_slug", bookingSlug)
    .eq("is_active", true)
    .single()

  if (linkError || !bookingLink) {
    return new NextResponse("Booking link not found", { status: 404 })
  }

  const { data: studio, error: studioError } = await supabaseAdmin
    .from("studios")
    .select("*")
    .eq("id", studioId)
    .single()

  if (studioError || !studio) {
    return new NextResponse("Studio not found", { status: 404 })
  }

  const { data: artists, error: artistError } = await supabaseAdmin
    .from("artists")
    .select("*")
    .eq("studio_id", studioId)
    .eq("status", "active")

  if (artistError) {
    return new NextResponse(artistError.message, { status: 500 })
  }

  const { data: services, error: serviceError } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("studio_id", studioId)

  if (serviceError) {
    return new NextResponse(serviceError.message, { status: 500 })
  }

  return NextResponse.json({
    bookingLink,
    studio,
    artists: artists || [],
    services: services || [],
  })
}
