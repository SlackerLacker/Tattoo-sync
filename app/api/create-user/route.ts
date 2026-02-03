// app/api/create-user/route.ts (Next.js 13+ with App Router)
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, role, studio_id, full_name } = body

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { role, studio_id, full_name },
    email_confirm: true
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) {
    return NextResponse.json({ error: "User not created." }, { status: 500 })
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: data.user.id,
    role,
    full_name,
    studio_id,
    email,
    is_registered: true,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ user: data.user })
}
// This route handles user creation via Supabase Admin API
