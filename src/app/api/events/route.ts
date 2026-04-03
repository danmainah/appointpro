import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { default: Event } = await import("@/models/Event");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const professionalId = searchParams.get("professionalId");

    const query: Record<string, unknown> = { isActive: true };
    if (professionalId) query.professionalId = professionalId;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("professionalId", "name slug image")
        .sort({ date: 1, startTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    return NextResponse.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
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
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: Event } = await import("@/models/Event");

    const event = await Event.create({
      ...parsed.data,
      professionalId: session.user.id,
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
