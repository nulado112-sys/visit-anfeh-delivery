import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coming Soon — Visit Anfeh Delivery</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0C2B35;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .card { text-align: center; padding: 48px 40px; }
    .logo {
      width: 88px;
      height: 88px;
      border-radius: 18px;
      object-fit: cover;
      margin: 0 auto 28px;
      display: block;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    h1 {
      color: #ffffff;
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: -0.03em;
    }
    h1 span { color: #1AABBD; }
    p { margin-top: 12px; color: #64748b; font-size: 1rem; }
    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #F9B233;
      margin-bottom: 20px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.75); }
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="/logos/visit-anfeh-delivery-logo.jpg" alt="Visit Anfeh Delivery" class="logo" />
    <div class="dot"></div>
    <h1>Visit Anfeh <span>Delivery</span></h1>
    <p>Coming soon. Stay tuned!</p>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}

export const config = {
  matcher: ["/((?!logos|_next|favicon.ico).*)"],
};
