import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const duration = searchParams.get("duration");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date parameter required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: User } = await import("@/models/User");
    const professional = await User.findOne({ slug, isActive: true }).select("_id");

    if (!professional) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const slots = await getAvailableSlots(
      professional._id.toString(),
      date,
      duration ? parseInt(duration) : undefined
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
