import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL('/dashboard', requestUrl));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.headers.get(`cookie`)?.split('; ')
            .find(c => c.startsWith(name + '='))
            ?.split('=')[1];
        },
        set(name, value, options) {
          response.headers.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; Secure`);
        },
        remove(name) {
          response.headers.append('Set-Cookie', `${name}=; Max-Age=0`);
        }
      }
    }
  );

  const body = await request.json();
  const { email, password } = body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
