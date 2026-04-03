import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    const { default: Booking } = await import("@/models/Booking");

    // Aggregate unique clients from bookings
    const clients = await Booking.aggregate([
      { $match: { professionalId: { $toObjectId: session.user.id } } },
      {
        $group: {
          _id: "$clientEmail",
          name: { $first: "$clientName" },
          email: { $first: "$clientEmail" },
          phone: { $first: "$clientPhone" },
          totalBookings: { $sum: 1 },
          lastVisit: { $max: "$date" },
        },
      },
      { $sort: { lastVisit: -1 } },
    ]);

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
