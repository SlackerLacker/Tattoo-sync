import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: products, error } = await supabase.from("products").select("*")

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: product, error } = await supabase.from("products").insert([await request.json()])

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(product)
}
