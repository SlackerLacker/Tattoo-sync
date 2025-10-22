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

  // The RPC function 'create_client_with_profile' is causing a not-null violation on the profiles.id.
  // Instead of relying on the broken function, we will perform the inserts directly from the code.

  // Step 1: Generate a new UUID for the client. This will be used for both profiles and clients tables.
  const newClientId = crypto.randomUUID()

  // Step 2: Insert into the 'profiles' table.
  const { error: profileInsertError } = await supabase.from("profiles").insert({
    id: newClientId,
    full_name: clientData.full_name,
    email: clientData.email,
    studio_id: userProfile.studio_id,
    role: "client",
  })

  if (profileInsertError) {
    console.error("Error creating profile for client:", profileInsertError)
    return new NextResponse(profileInsertError.message, { status: 500 })
  }

  // Step 3: Insert into the 'clients' table.
  const { data: newClient, error: clientInsertError } = await supabase
    .from("clients")
    .insert({
      id: newClientId,
      full_name: clientData.full_name,
      email: clientData.email,
      phone: clientData.phone || null,
      studio_id: userProfile.studio_id,
    })
    .select()
    .single()

  if (clientInsertError) {
    console.error("Error creating client record:", clientInsertError)
    // Attempt to roll back the profile creation if the client creation fails.
    await supabase.from("profiles").delete().eq("id", newClientId)
    return new NextResponse(clientInsertError.message, { status: 500 })
  }

  return NextResponse.json(newClient)
}
