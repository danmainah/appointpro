import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");
    const { default: Service } = await import("@/models/Service");

    const userId = session.user.id;
    const today = new Date().toISOString().split("T")[0];

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const sundayEnd = new Date(weekStart);
    sundayEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = sundayEnd.toISOString().split("T")[0];

    // Get start of current month
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthEnd = nextMonth.toISOString().split("T")[0];

    // Run all queries in parallel
    const [
      todayBookings,
      weekBookings,
      totalClients,
      monthRevenue,
      upcomingBookings,
    ] = await Promise.all([
      // Today's bookings count
      Booking.countDocuments({
        professionalId: userId,
        date: today,
        status: { $nin: ["cancelled"] },
      }),
      // This week's bookings count
      Booking.countDocuments({
        professionalId: userId,
        date: { $gte: weekStartStr, $lte: weekEndStr },
        status: { $nin: ["cancelled"] },
      }),
      // Unique clients count
      Booking.distinct("clientEmail", { professionalId: userId }),
      // Revenue this month (from paid bookings)
      Booking.aggregate([
        {
          $match: {
            professionalId: userId,
            date: { $gte: monthStart, $lt: monthEnd },
            paymentStatus: "paid",
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            total: { $sum: "$service.price" },
          },
        },
      ]),
      // Upcoming bookings (today + future, confirmed/pending)
      Booking.find({
        professionalId: userId,
        date: { $gte: today },
        status: { $in: ["confirmed", "pending"] },
      })
        .populate("serviceId", "name duration price currency")
        .sort({ date: 1, startTime: 1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({
      todayBookings,
      weekBookings,
      totalClients: totalClients.length,
      monthRevenue: monthRevenue[0]?.total || 0,
      upcomingBookings,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
