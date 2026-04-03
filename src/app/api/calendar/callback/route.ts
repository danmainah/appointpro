import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { exchangeCodeForTokens, encrypt } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // professionalId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/settings/integrations?error=access_denied",
          process.env.NEXTAUTH_URL!
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/settings/integrations?error=missing_params",
          process.env.NEXTAUTH_URL!
        )
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    await connectDB();
    const { default: CalendarIntegration } = await import(
      "@/models/CalendarIntegration"
    );
    const { default: User } = await import("@/models/User");

    // Upsert calendar integration
    await CalendarIntegration.findOneAndUpdate(
      { professionalId: state },
      {
        professionalId: state,
        googleAccessToken: encrypt(tokens.access_token!),
        googleRefreshToken: encrypt(tokens.refresh_token!),
        googleTokenExpiry: new Date(tokens.expiry_date!),
        calendarId: "primary",
      },
      { upsert: true, new: true }
    );

    // Mark user as connected
    await User.updateOne(
      { _id: state },
      { googleCalendarConnected: true }
    );

    return NextResponse.redirect(
      new URL(
        "/dashboard/settings/integrations?success=true",
        process.env.NEXTAUTH_URL!
      )
    );
  } catch (error) {
    console.error("Google Calendar callback error:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard/settings/integrations?error=callback_failed",
        process.env.NEXTAUTH_URL!
      )
    );
  }
}
