import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: clients, error } = await supabase.from("clients").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(clients)
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

  const clientData = await request.json()
  clientData.studio_id = profile.studio_id

  if (clientData.name) {
    clientData.full_name = clientData.name
    delete clientData.name
  }

  const { data: client, error } = await supabase.from("clients").insert([clientData])

  if (error) {
    console.error("Supabase insert error:", error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
