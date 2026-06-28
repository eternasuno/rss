import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session_token');

  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
