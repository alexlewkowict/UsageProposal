import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip middleware for these paths
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect unauthenticated users to login page
  if (!token && pathname !== '/auth/signin') {
    const url = new URL('/auth/signin', req.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login page
  if (token && pathname === '/auth/signin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 