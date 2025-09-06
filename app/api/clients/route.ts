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

  // --- Start Debugging ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error getting user or no user found:", userError)
    return new NextResponse("User not authenticated", { status: 401 })
  }
  console.log("Authenticated user ID:", user.id)

  const clientData = await request.json()
  console.log("Incoming client data:", clientData)
  // --- End Debugging ---

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
