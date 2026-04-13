import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// No server-side auth redirect — Supabase sessions live in localStorage (client-side only).
// Auth protection is handled client-side inside each protected page.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
