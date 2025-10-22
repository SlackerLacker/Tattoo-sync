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

  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("studio_id")
    .eq("id", user.id)
    .single()

  if (profileError || !userProfile) {
    return new NextResponse("User profile not found", { status: 404 })
  }

  const clientData = await request.json()
  if (clientData.name) {
    clientData.full_name = clientData.name
    delete clientData.name
  }

  const { data: newClient, error: rpcError } = await supabase.rpc(
    "create_client_with_profile",
    {
      p_full_name: clientData.full_name,
      p_email: clientData.email,
      p_phone: clientData.phone || null,
      p_studio_id: userProfile.studio_id,
    },
  )

  if (rpcError) {
    console.error("Supabase RPC error:", rpcError)
    return new NextResponse(rpcError.message, { status: 500 })
  }

  return NextResponse.json(newClient)
}
