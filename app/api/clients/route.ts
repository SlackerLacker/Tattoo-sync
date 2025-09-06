import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: clients, error } = await supabase.from("clients").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: client, error } = await supabase.from("clients").insert([await request.json()])

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(client)
}
