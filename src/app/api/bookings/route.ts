import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createBookingSchema } from "@/lib/validations";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectDB();

    const { default: User } = await import("@/models/User");
    const { default: Service } = await import("@/models/Service");
    const { default: Booking } = await import("@/models/Booking");
    const { default: Client } = await import("@/models/Client");

    // Fetch professional and service
    const [professional, service] = await Promise.all([
      User.findById(data.professionalId),
      Service.findById(data.serviceId),
    ]);

    if (!professional || !professional.isActive) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Calculate end time
    const [hours, minutes] = data.startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration;
    const endTime = `${Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    // Check for double-booking (atomic check)
    const existingBooking = await Booking.findOne({
      professionalId: data.professionalId,
      date: data.date,
      status: { $nin: ["cancelled"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: data.startTime },
        },
      ],
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Upsert client record
    const client = await Client.findOneAndUpdate(
      { email: data.clientEmail.toLowerCase() },
      {
        $setOnInsert: {
          name: data.clientName,
          email: data.clientEmail.toLowerCase(),
          phone: data.clientPhone || null,
          isRegistered: false,
        },
      },
      { upsert: true, new: true }
    );

    // Create booking
    const accessToken = crypto.randomUUID();
    const booking = await Booking.create({
      professionalId: data.professionalId,
      clientId: client._id,
      serviceId: data.serviceId,
      clientName: data.clientName,
      clientEmail: data.clientEmail.toLowerCase(),
      clientPhone: data.clientPhone || null,
      date: data.date,
      startTime: data.startTime,
      endTime,
      duration: service.duration,
      status: "confirmed",
      notes: data.notes || null,
      paymentRequired: professional.paymentRequired && service.price > 0,
      paymentStatus:
        professional.paymentRequired && service.price > 0
          ? data.demoPaid ? "paid" : "pending"
          : "none",
      accessToken,
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      professionalName: professional.name,
      serviceName: service.name,
      date: data.date,
      startTime: data.startTime,
      endTime,
      duration: service.duration,
      accessToken,
    }).catch((err) => console.error("Failed to send confirmation email:", err));

    // Sync to Google Calendar if connected (non-blocking)
    if (professional.googleCalendarConnected) {
      import("@/lib/google-calendar")
        .then(({ createCalendarEvent }) =>
          createCalendarEvent(
            professional._id.toString(),
            {
              clientName: data.clientName,
              serviceName: service.name,
              date: data.date,
              startTime: data.startTime,
              endTime,
              notes: data.notes,
            },
            professional.timezone || "UTC"
          )
        )
        .then(async (googleEventId) => {
          if (googleEventId) {
            await Booking.updateOne(
              { _id: booking._id },
              { googleEventId }
            );
          }
        })
        .catch((err) =>
          console.error("Failed to sync to Google Calendar:", err)
        );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      accessToken,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const query: Record<string, unknown> = {
      professionalId: session.user.id,
    };
    if (status) query.status = status;
    if (date) query.date = date;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("serviceId", "name duration price currency")
        .sort({ date: -1, startTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
