import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/db',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next.js internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // e.g. favicon.ico, images, fonts
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
  ) {
    // If user already logged in and visits /login, redirect to /
    if (pathname === '/login') {
      const session = request.cookies.get('atb_session')?.value;
      if (session) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Check session cookie
  const sessionCookie = request.cookies.get('atb_session')?.value;

  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: Please authenticate at /login' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and image assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
