import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = ['/auth/signin'];
  const isPublicPath = publicPaths.includes(path);
  
  // Special paths that should be excluded from middleware
  const excludedPaths = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/google-logo.svg'
  ];
  
  // Check if the path should be excluded from middleware
  const isExcludedPath = excludedPaths.some(prefix => path.startsWith(prefix));
  
  if (isExcludedPath) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });
  
  // If the user is not logged in and trying to access a protected route
  if (!token && !isPublicPath) {
    const url = new URL('/auth/signin', req.url);
    url.searchParams.set('callbackUrl', encodeURI(req.url));
    return NextResponse.redirect(url);
  }
  
  // If the user is logged in and trying to access a public route
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

// Update the matcher to exclude API routes
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|google-logo.svg).*)'
  ],
}; 