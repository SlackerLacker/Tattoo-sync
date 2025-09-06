import { createServerSupabase } from "@/lib/supabase/server-client"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: services, error } = await supabase.from("services").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(services)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: service, error } = await supabase.from("services").insert([await request.json()])

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(service)
}
