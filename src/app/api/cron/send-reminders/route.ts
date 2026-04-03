import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendBookingReminder } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");
    const { default: Service } = await import("@/models/Service");
    const { default: User } = await import("@/models/User");

    // Runs once daily at 7AM — find all bookings for today and tomorrow
    // that haven't been reminded yet
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const bookings = await Booking.find({
      status: "confirmed",
      reminderSentAt: null,
      date: { $in: [today, tomorrow] },
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
        console.error(
          `Failed to send reminder for booking ${booking._id}:`,
          err
        );
      }
    }

    return NextResponse.json({ success: true, remindersSent: sentCount });
  } catch (error) {
    console.error("Error in send-reminders cron:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
