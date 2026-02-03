import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const requireStudioAdmin = async () => {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: new NextResponse("Unauthorized", { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, studio_id")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "superadmin"].includes(profile.role)) {
    return { ok: false, error: new NextResponse("Forbidden", { status: 403 }) }
  }

  return { ok: true, profile }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const auth = await requireStudioAdmin()
  if (!auth.ok) return auth.error!

  const { password } = await request.json()
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("studio_id")
    .eq("id", params.userId)
    .single()

  if (!profile || profile.studio_id !== auth.profile.studio_id) {
    return NextResponse.json({ error: "User not in your studio" }, { status: 403 })
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(params.userId, {
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
