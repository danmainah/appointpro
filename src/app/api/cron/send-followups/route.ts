import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendBookingFollowUp } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    // Double-check auth (middleware already handles this, but defense in depth)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");
    const { default: User } = await import("@/models/User");
    const { default: Service } = await import("@/models/Service");

    // Find completed bookings from 1-2 days ago without follow-up
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const dateFrom = twoDaysAgo.toISOString().split("T")[0];
    const dateTo = oneDayAgo.toISOString().split("T")[0];

    const bookings = await Booking.find({
      status: "completed",
      followUpSentAt: null,
      date: { $gte: dateFrom, $lte: dateTo },
    }).lean();

    let sentCount = 0;

    for (const booking of bookings) {
      try {
        const [professional, service] = await Promise.all([
          User.findById(booking.professionalId).lean(),
          Service.findById(booking.serviceId).lean(),
        ]);

        if (!professional || !service) continue;

        await sendBookingFollowUp({
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          professionalName: professional.name,
          serviceName: service.name,
        });

        await Booking.updateOne(
          { _id: booking._id },
          { followUpSentAt: new Date() }
        );

        sentCount++;
      } catch (err) {
        console.error(`Failed to send follow-up for booking ${booking._id}:`, err);
      }
    }

    return NextResponse.json({ success: true, followUpsSent: sentCount });
  } catch (error) {
    console.error("Error in send-followups cron:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
