import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// This file demonstrates how you could implement a consolidated API route for
// managing studios (shops) in a Next.js app. It combines the functionality
// currently spread across multiple endpoints (list, create, delete) and
// introduces a consistent `/api/admin/studios` interface. The handler
// includes authorization checks to ensure only superadmins can perform
// these actions.

// Initialize a Supabase client with service‑role privileges. This key must
// only be used on the server – never expose it to the browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

/**
 * Helper to check whether the current user is authenticated and has the
 * `superadmin` role. Returns an object with either `{ ok: true }` or
 * `{ ok: false, error: NextResponse }` so the main handlers can early
 * return on failure.
 */
async function authorizeSuperadmin() {
  const cookieStore = await cookies();
  const supabaseSSR = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  // Check session
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser();
  if (!user) {
    return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  // Fetch role from profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'superadmin') {
    return { ok: false, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true };
}

export async function GET() {
  // Return the list of studios
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;
  const { data, error } = await supabaseAdmin.from('studios').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ studios: data });
}

export async function POST(req: NextRequest) {
  // Create a new studio and its initial user
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;
  const { studioName, studioDomain, userEmail, userPassword, userRole } = await req.json();
  if (!studioName || !studioDomain || !userEmail || !userPassword || !userRole) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // 1. Create the studio record with name and domain
  const { data: studio, error: studioError } = await supabaseAdmin
    .from('studios')
    .insert([{ name: studioName, domain: studioDomain }])
    .select()
    .single();
  if (studioError) {
    return NextResponse.json({ error: studioError.message }, { status: 500 });
  }
  // 2. Create the user via Supabase Admin API
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    password: userPassword,
    email_confirm: true,
  });
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  // 3. Update the user’s profile with studio ID and role
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ studio_id: studio.id, role: userRole })
    .eq('id', userData.user!.id);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  // Delete a studio by ID
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;
  const { studioId } = await req.json();
  if (!studioId) {
    return NextResponse.json({ error: 'Missing studioId' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('studios').delete().eq('id', studioId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}