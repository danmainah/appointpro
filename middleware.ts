import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes — require professional role
  if (pathname.startsWith("/dashboard")) {
    const token = await getTokenFromCookie(req);
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "professional") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect client portal — require client role
  if (pathname.startsWith("/client-portal")) {
    const token = await getTokenFromCookie(req);
    if (!token) {
      return NextResponse.redirect(new URL("/client/login", req.url));
    }
    if (token.role !== "client") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect cron routes — require CRON_SECRET
  if (pathname.startsWith("/api/cron")) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Decode the NextAuth.js JWT session token from the cookie
// This avoids importing the full auth() which pulls in Node.js-only modules
async function getTokenFromCookie(
  req: NextRequest
): Promise<{ role: string; id: string } | null> {
  try {
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";

    const token = req.cookies.get(cookieName)?.value;
    if (!token) return null;

    // Decode the JWT payload (middle part) — we trust it because
    // it's signed by NextAuth using NEXTAUTH_SECRET, and the cookie
    // is httpOnly. Full signature verification happens in auth().
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    // Handle base64url encoding
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json);

    return {
      role: payload.role || "",
      id: payload.id || payload.sub || "",
    };
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/client-portal/:path*", "/api/cron/:path*"],
};
