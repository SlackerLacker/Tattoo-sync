import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Example API route for listing users (profiles) in an admin context. This
// handler uses the Supabase service role to retrieve all user profiles and
// ensures only superadmins can call it.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

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
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser();
  if (!user) {
    return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
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
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;
  const { data, error } = await supabaseAdmin.from('profiles').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ users: data });
}