import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()

  if (!profile?.studio_id) {
    return new NextResponse("User is not associated with a studio", { status: 400 })
  }

  const { data: links, error } = await supabase
    .from("booking_links")
    .select("*")
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(links)
}

export async function POST(request: Request) {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()

  if (!profile?.studio_id) {
    return new NextResponse("User is not associated with a studio", { status: 400 })
  }

  const payload = await request.json()
  const bookingSlug = typeof payload.booking_slug === "string" ? payload.booking_slug.trim() : ""

  if (!bookingSlug) {
    return new NextResponse("booking_slug is required", { status: 400 })
  }

  const { data: link, error } = await supabase
    .from("booking_links")
    .insert([
      {
        studio_id: profile.studio_id,
        booking_slug: bookingSlug,
        label: payload.label || null,
        source: payload.source || null,
        is_active: payload.is_active ?? true,
      },
    ])
    .select()
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(link)
}
