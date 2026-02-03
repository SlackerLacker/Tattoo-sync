
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createServerSupabase()
  const url = new URL(request.url)
  const source = url.searchParams.get("source")

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

  if (source === "profiles") {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .eq("studio_id", userProfile.studio_id)
      .eq("role", "client")

    if (error) {
      console.error("Error fetching client profiles:", error)
      return new NextResponse(error.message, { status: 500 })
    }

    return NextResponse.json(profiles)
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
  const redirectTo = process.env.CLIENT_INVITE_REDIRECT_URL || "http://localhost:3000/client"

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

  if (!normalizedEmail) {
    return new NextResponse("Email is required to invite a client", { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(normalizedEmail)) {
    return new NextResponse("Invalid email address", { status: 400 })
  }

  // Get the current user's studio_id
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase.from("profiles").select("studio_id").eq("id", user?.id).single()

  if (!userProfile?.studio_id) {
    return new NextResponse("User is not associated with a studio", { status: 400 })
  }

  let userId: string | null = null
  let invited = false

  const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .single()

  if (profileLookupError && profileLookupError.code !== "PGRST116") {
    console.error("Error checking profile:", profileLookupError)
    return new NextResponse(profileLookupError.message, { status: 500 })
  }

  if (existingProfile?.id) {
    userId = existingProfile.id
  } else {
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo,
    })

    if (inviteError) {
      const alreadyExists = inviteError.message?.toLowerCase().includes("already exists")
      if (alreadyExists) {
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        })
        if (listError) {
          console.error("Error listing users:", listError)
          return new NextResponse(listError.message, { status: 500 })
        }
        const matched = usersData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail)
        if (matched?.id) {
          userId = matched.id
        }
      } else {
        console.error("Error inviting user:", inviteError)
        return new NextResponse(inviteError.message || "Failed to invite user", { status: 500 })
      }
    } else if (inviteData?.user) {
      userId = inviteData.user.id
      invited = true
    }
  }

  if (!userId) {
    return new NextResponse("Failed to create client user", { status: 500 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      full_name,
      email: normalizedEmail,
      phone,
      studio_id: userProfile.studio_id,
      role: "client",
      is_registered: false,
    })
    .select()
    .single()

  if (profileError) {
    console.error("Error upserting profile:", profileError)
    return new NextResponse(profileError.message, { status: 500 })
  }

  const { data: clientData, error: clientError } = await supabaseAdmin
    .from("clients")
    .upsert({ id: userId, full_name, email: normalizedEmail, phone, studio_id: userProfile.studio_id })
    .select()
    .single()

  if (clientError) {
    console.error("Error creating client:", clientError)
    return new NextResponse(clientError.message, { status: 500 })
  }

  return NextResponse.json({ client: clientData, profile, invited })
}
