import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

const ALLOWED_SECTIONS = ["shop", "appointments", "payments", "appearance", "security", "notifications"] as const
type SectionKey = (typeof ALLOWED_SECTIONS)[number]

const ensureAuthorizedStudio = async (supabase: ReturnType<typeof createServerSupabase>, studioId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: new NextResponse("Unauthorized", { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.studio_id !== studioId) {
    return { ok: false, response: new NextResponse("Forbidden", { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const studioId = params.id

  const auth = await ensureAuthorizedStudio(supabase, studioId)
  if (!auth.ok) return auth.response

  const { data, error } = await supabase.from("studio_settings").select("*").eq("studio_id", studioId).maybeSingle()
  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  if (data) {
    return NextResponse.json(data)
  }

  const { data: created, error: createError } = await supabase
    .from("studio_settings")
    .insert({ studio_id: studioId })
    .select("*")
    .single()

  if (createError) {
    return new NextResponse(createError.message, { status: 500 })
  }

  return NextResponse.json(created)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const studioId = params.id
  const payload = await request.json()

  const auth = await ensureAuthorizedStudio(supabase, studioId)
  if (!auth.ok) return auth.response

  const section = payload?.section as SectionKey | undefined
  if (!section || !ALLOWED_SECTIONS.includes(section)) {
    return new NextResponse("Invalid section", { status: 400 })
  }

  const updates: Record<string, any> = {
    studio_id: studioId,
    [section]: payload?.data ?? {},
  }

  const { data, error } = await supabase
    .from("studio_settings")
    .upsert(updates, { onConflict: "studio_id" })
    .select("*")
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  if (section === "appointments") {
    const appointmentData = payload?.data || {}
    const studioUpdates: Record<string, any> = {}
    if ("allowOnlineBooking" in appointmentData) studioUpdates.allow_online_booking = appointmentData.allowOnlineBooking
    if ("requireDeposit" in appointmentData) studioUpdates.require_deposit = appointmentData.requireDeposit
    if ("depositAmount" in appointmentData) studioUpdates.deposit_amount = appointmentData.depositAmount
    if ("depositPercentage" in appointmentData) studioUpdates.deposit_percentage = appointmentData.depositPercentage

    if (Object.keys(studioUpdates).length > 0) {
      const { error: studioError } = await supabase.from("studios").update(studioUpdates).eq("id", studioId)
      if (studioError) {
        return new NextResponse(studioError.message, { status: 500 })
      }
    }
  }

  return NextResponse.json(data)
}
