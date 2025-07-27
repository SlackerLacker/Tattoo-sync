import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value
  const isAuth = !!token

  const publicPaths = ['/login', '/signup']
  const pathIsPublic = publicPaths.includes(req.nextUrl.pathname)

  if (!isAuth && !pathIsPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuth && pathIsPublic) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
}
