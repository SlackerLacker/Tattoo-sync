import { NextResponse, NextRequest } from "next/server"
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const auth = await requireStudioAdmin()
  if (!auth.ok) return auth.error!

  const { full_name, email, role } = await req.json()

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ full_name, email, role })
    .eq("id", params.userId)
    .eq("studio_id", auth.profile.studio_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
