// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")

  const publicRoutes = ["/login", "/signup"]
  const isPublic = publicRoutes.some((path) => request.nextUrl.pathname.startsWith(path))

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
