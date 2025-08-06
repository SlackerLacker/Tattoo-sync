// app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authorizeSuperadmin } from '../../_helpers'; // go up two directories to admin/_helpers

// service‑role client for privileged updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Update a user’s role
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;

  const { role } = await req.json();
  if (!role) {
    return NextResponse.json(
      { error: 'Role is required' },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', params.userId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'User role updated' });
}

// Remove or disassociate a user from a studio
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;

  // Here we simply clear the studio_id to disassociate the user.
  // If you want to completely delete the profile or call the Supabase Auth admin API
  // to remove the auth user, you can do that instead.
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ studio_id: null })
    .eq('id', params.userId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'User removed from studio' });
}
