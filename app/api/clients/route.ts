
import { createServerSupabase } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createServerSupabase()

  // Get the current user's studio_id
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: userProfile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()

  if (!userProfile?.studio_id) {
    return new NextResponse("User is not associated with a studio", { status: 400 })
  }

  // Fetch clients associated with the studio
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("studio_id", userProfile.studio_id)

  if (error) {
    console.error("Error fetching clients:", error)
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const { full_name, email, phone } = await request.json()
  const supabase = createServerSupabase()

  // Get the current user's studio_id
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase.from("profiles").select("studio_id").eq("id", user?.id).single()

  if (!userProfile?.studio_id) {
    return new NextResponse("User is not associated with a studio", { status: 400 })
  }

  // First, create a profile for the new client
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: crypto.randomUUID(),
        full_name,
        email,
        phone,
        studio_id: userProfile.studio_id,
        role: "client",
      },
    ])
    .select()

  if (profileError) {
    console.error("Error creating profile:", profileError)
    return new NextResponse(profileError.message, { status: 500 })
  }

  const profile = profileData[0]

  // Then, create the client and link it to the profile
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .insert([{ id: profile.id, full_name, email, phone, studio_id: userProfile.studio_id }])
    .select()

  if (clientError) {
    console.error("Error creating client:", clientError)
    // If client creation fails, we should roll back the profile creation
    await supabase.from("profiles").delete().eq("id", profile.id)
    return new NextResponse(clientError.message, { status: 500 })
  }

  return NextResponse.json(clientData[0])
}
