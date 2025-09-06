import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointments, error } = await supabase.from("appointments").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: appointment, error } = await supabase.from("appointments").insert([await request.json()])

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(appointment)
}
