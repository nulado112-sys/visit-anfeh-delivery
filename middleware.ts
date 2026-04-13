import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a logged-in Supabase user
const PROTECTED = ["/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Supabase stores the session in a cookie named after the project ref
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace("https://", "")
    .split(".")[0];

  const sessionCookie =
    request.cookies.get(`sb-${projectRef}-auth-token`) ||
    request.cookies.get("sb-access-token");

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
