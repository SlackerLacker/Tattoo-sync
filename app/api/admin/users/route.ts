import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authorizeSuperadmin } from "@api/admin/_helpers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// List all users (profiles)
export async function GET() {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) {
    // auth.error is a NextResponse with 401/403 already set by the helper
    return auth.error!;
  }

  // You can either use the supabase client returned by the helper...
  // const { supabaseAdmin } = auth;
  // or fall back to the module‑level supabaseAdmin instance.

  const { data, error } = await supabaseAdmin.from("profiles").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;

  const { email, password, role, studioId, full_name } = await req.json();

  if (!email || !password || !role || !studioId || studioId === '') {
    return NextResponse.json(
      { error: "Missing required fields: email, password, role, studioId" },
      { status: 400 }
    );
  }

  // Create the auth user
  const { data: newUser, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { display_name: full_name ?? ''},
      email_confirm: true, // Automatically confirm the email
    });
  if (userError) {
    return NextResponse.json(
      { error: userError.message || "Failed to create user" },
      { status: 500 }
    );
  }

  // Upsert the profile with role and studio_id
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: newUser.user.id,
    email,
    full_name: full_name ?? null,
    role,
    studio_id: studioId,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "User created", userId: newUser.user.id },
    { status: 201 }
  );
}
