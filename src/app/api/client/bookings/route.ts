import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Client } = await import("@/models/Client");
    const { default: Booking } = await import("@/models/Booking");

    const client = await Client.findById(session.user.id);
    if (!client) {
      return NextResponse.json({ bookings: [] });
    }

    const bookings = await Booking.find({
      clientEmail: client.email,
    })
      .populate("serviceId", "name duration price currency")
      .sort({ date: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching client bookings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
