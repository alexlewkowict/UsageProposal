import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = ['/auth/signin'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || 
    req.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // Skip middleware for API routes and static files
  if (
    path.startsWith('/api/auth') || 
    path.startsWith('/_next/') || 
    path.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Redirect to sign-in if accessing a protected route without authentication
  if (!token && !isPublicPath) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Redirect to home if accessing sign-in while already authenticated
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 