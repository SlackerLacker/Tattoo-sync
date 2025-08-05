import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabaseSSR = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabaseSSR.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get request body
  const { studioName, ownerEmail, password } = await req.json();

  if (!studioName || !ownerEmail || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Create studio
  const { data: studio, error: studioError } = await supabaseAdmin
    .from("studios")
    .insert([{ name: studioName }])
    .select()
    .single();

  if (studioError) {
    return NextResponse.json({ error: studioError.message }, { status: 500 });
  }

  // 2. Create user
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
    });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // 3. Update profile with studio ID and role
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      studio_id: studio.id,
      role: "admin",
    })
    .eq("id", userData.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
