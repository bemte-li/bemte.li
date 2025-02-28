import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Allow access to the home page and /solicitar-convite
  if (pathname === '/' || pathname === '/solicitar-convite' || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirect all other routes to the home page
  url.pathname = '/';
  return NextResponse.redirect(url);
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}; 