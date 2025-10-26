import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createServerSupabase()
  const { data: services, error } = await supabase.from("services").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(services)
}

export async function POST(request: Request) {
  const supabase = createServerSupabase()
  const serviceData = await request.json()
  const { data: service, error } = await supabase.from("services").insert([serviceData]).select()

  if (error) {
    console.error(error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(service)
}
