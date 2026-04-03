import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();
    const { default: User } = await import("@/models/User");
    const { default: Service } = await import("@/models/Service");

    const professional = await User.findOne({ slug, isActive: true })
      .select("-password -stripeAccountId")
      .lean();

    if (!professional) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const services = await Service.find({
      professionalId: professional._id,
      isActive: true,
    })
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json({ professional, services });
  } catch (error) {
    console.error("Error fetching professional:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
