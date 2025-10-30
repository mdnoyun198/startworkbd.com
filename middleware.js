import { NextResponse } from "next/server";

// Protected pages (login না থাকলে redirect /login)
const protectedPaths = ["/home", "/profile",];


// Public pages (login থাকলে redirect /home)
const publicPaths = ["/login", "/signup", "/"];


export function middleware(req) {

  const { cookies, nextUrl } = req;
  const url = nextUrl.clone();
  const token = cookies.get("accessToken")?.value;

  // Logged in user → public pages blocked
  if (token && publicPaths.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
  }

  // Not logged in → protected pages blocked
  if (!token && protectedPaths.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
  
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)"
  ],
};
