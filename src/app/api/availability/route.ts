import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { availabilitySchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).role !== "professional"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Availability } = await import("@/models/Availability");

    const availability = await Availability.findOne({
      professionalId: session.user.id,
    }).lean();

    if (!availability) {
      return NextResponse.json(
        { error: "No availability set" },
        { status: 404 }
      );
    }

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).role !== "professional"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = availabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: Availability } = await import("@/models/Availability");

    const availability = await Availability.findOneAndUpdate(
      { professionalId: session.user.id },
      {
        ...parsed.data,
        professionalId: session.user.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, availability });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
