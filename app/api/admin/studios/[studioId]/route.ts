// app/api/admin/studios/[studioId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authorizeSuperadmin } from '../../_helpers'; // reuse your auth helper

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function GET(
  req: NextRequest,
  { params }: { params: { studioId: string } },
) {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;

  // Fetch the studio and its users (profiles with matching studio_id)
  const { data: studio, error: studioError } = await supabaseAdmin
    .from('studios')
    .select('*')
    .eq('id', params.studioId)
    .single();

  const { data: users, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('studio_id', params.studioId);

  if (studioError || userError) {
    return NextResponse.json(
      { error: studioError?.message || userError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ studio, users });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { studioId: string } },
) {
  const auth = await authorizeSuperadmin();
  if (!auth.ok) return auth.error!;

  const { studioName } = await req.json();

  const { error } = await supabaseAdmin
    .from('studios')
    .update({ name: studioName })
    .eq('id', params.studioId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Studio updated' });
}
