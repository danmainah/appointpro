import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    const { default: User } = await import("@/models/User");
    const { default: Service } = await import("@/models/Service");

    const professional = await User.findOne({ isActive: true })
      .select("-password")
      .lean();

    if (!professional) {
      return NextResponse.json(
        { error: "No professional found" },
        { status: 404 }
      );
    }

    const services = await Service.find({
      professionalId: professional._id,
      isActive: true,
    })
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json({ professional, services });
  } catch (error) {
    console.error("Error fetching site info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
