import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  // Protect dashboard routes — require professional role
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.user && (token.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect client portal — require client role
  if (pathname.startsWith("/client-portal")) {
    if (!token) {
      return NextResponse.redirect(new URL("/client/login", req.url));
    }
    if (token.user && (token.user as Record<string, unknown>).role !== "client") {
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
});

export const config = {
  matcher: ["/dashboard/:path*", "/client-portal/:path*", "/api/cron/:path*"],
};
