import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  return NextResponse.json({ 
    authenticated: !!token,
    token: token ? { 
      name: token.name,
      email: token.email,
      picture: token.picture,
      sub: token.sub
    } : null,
    cookies: req.cookies.getAll().map(c => c.name)
  });
} 