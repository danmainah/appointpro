import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { eventRegistrationSchema } from "@/lib/validations";
import { sendEventRegistrationConfirmation } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const parsed = eventRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectDB();

    const { default: Event } = await import("@/models/Event");
    const { default: EventRegistration } = await import(
      "@/models/EventRegistration"
    );
    const { default: Client } = await import("@/models/Client");

    // Check event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return NextResponse.json(
        { error: "Event not found or inactive" },
        { status: 404 }
      );
    }

    // Check capacity — atomically increment to prevent race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        isActive: true,
        $expr: { $lt: ["$currentAttendees", "$maxAttendees"] },
      },
      { $inc: { currentAttendees: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Event is full" },
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

    // Create registration
    const accessToken = crypto.randomUUID();
    const registration = await EventRegistration.create({
      eventId,
      clientId: client._id,
      clientName: data.clientName,
      clientEmail: data.clientEmail.toLowerCase(),
      clientPhone: data.clientPhone || null,
      paymentStatus: event.price > 0 ? "pending" : "none",
      accessToken,
    });

    // Send confirmation email (non-blocking)
    sendEventRegistrationConfirmation({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      eventTitle: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || null,
      accessToken,
    }).catch((err) =>
      console.error("Failed to send event registration email:", err)
    );

    return NextResponse.json({
      success: true,
      registrationId: registration._id,
      accessToken,
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
