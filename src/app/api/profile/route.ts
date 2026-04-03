import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: User } = await import("@/models/User");

    const user = await User.findById(session.user.id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: User } = await import("@/models/User");

    // Check slug uniqueness
    if (parsed.data.slug) {
      const existing = await User.findOne({
        slug: parsed.data.slug,
        _id: { $ne: session.user.id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This URL slug is already taken" },
          { status: 409 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(session.user.id, parsed.data, {
      new: true,
    }).select("-password");

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
