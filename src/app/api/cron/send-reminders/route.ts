import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendBookingReminder } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    // Double-check auth (middleware already handles this, but defense in depth)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");
    const { default: Service } = await import("@/models/Service");
    const { default: User } = await import("@/models/User");

    // Find bookings in the next 24-25 hours that haven't been reminded
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const targetDate24 = in24h.toISOString().split("T")[0];
    const targetDate25 = in25h.toISOString().split("T")[0];
    const targetTime24 = in24h.toISOString().split("T")[1].slice(0, 5);
    const targetTime25 = in25h.toISOString().split("T")[1].slice(0, 5);

    // Build query for bookings happening in the 24-25h window
    const dateConditions = [];

    if (targetDate24 === targetDate25) {
      // Same day: single date, time range
      dateConditions.push({
        date: targetDate24,
        startTime: { $gte: targetTime24, $lte: targetTime25 },
      });
    } else {
      // Spans midnight: two conditions
      dateConditions.push({
        date: targetDate24,
        startTime: { $gte: targetTime24 },
      });
      dateConditions.push({
        date: targetDate25,
        startTime: { $lte: targetTime25 },
      });
    }

    const bookings = await Booking.find({
      status: "confirmed",
      reminderSentAt: null,
      $or: dateConditions,
    }).lean();

    let sentCount = 0;

    for (const booking of bookings) {
      try {
        const [professional, service] = await Promise.all([
          User.findById(booking.professionalId).lean(),
          Service.findById(booking.serviceId).lean(),
        ]);

        if (!professional || !service) continue;

        await sendBookingReminder({
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          professionalName: professional.name,
          serviceName: service.name,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          accessToken: booking.accessToken,
        });

        await Booking.updateOne(
          { _id: booking._id },
          { reminderSentAt: new Date() }
        );

        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking._id}:`, err);
      }
    }

    return NextResponse.json({ success: true, remindersSent: sentCount });
  } catch (error) {
    console.error("Error in send-reminders cron:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
