import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointments, error } = await supabase.from("appointments").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse("User not authenticated", { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return new NextResponse("User profile not found", { status: 404 })
  }

  const appointmentData = await request.json()
  console.log("Received appointment data:", appointmentData)
  appointmentData.studio_id = profile.studio_id

  const { data: appointment, error } = await supabase.from("appointments").insert([appointmentData]).select()

  if (error) {
    console.error("Error creating appointment:", error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}
