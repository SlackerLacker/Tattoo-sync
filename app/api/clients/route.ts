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

  const clientData = await request.json()
  if (clientData.name) {
    clientData.full_name = clientData.name
    delete clientData.name
  }

  const { data: client, error } = await supabase.from("clients").insert([clientData])

  if (error) {
    console.error(error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
