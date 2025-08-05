import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ 1. Prevent redirect loops for _next, static files, or favicon/api
  const pathname = req.nextUrl.pathname;
  const isAsset = pathname.startsWith("/_next")
               || pathname.startsWith("/favicon.ico")
               || pathname.startsWith("/icon")
               || pathname.startsWith("/images")
               || pathname.startsWith("/fonts")
               || pathname.startsWith("/api")
               || pathname.endsWith(".js") // critical for chunks
               || pathname.endsWith(".css");

  if (isAsset) return res;

  // ✅ 2. Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuth = !!session;
  const publicPaths = ["/login", "/signup"];
  const isPublic = publicPaths.includes(pathname);

  // ✅ 3. Handle redirects correctly
  if (!isAuth && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}
