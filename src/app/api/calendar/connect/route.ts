import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).role !== "professional"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = getAuthUrl(session.user.id);

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
