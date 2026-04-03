import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateBookingStatusSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    await connectDB();
    const { default: Booking } = await import("@/models/Booking");

    // Check for access token (guest access) or auth session
    const token = new URL(req.url).searchParams.get("token");
    const session = await auth();

    let booking;
    if (token) {
      booking = await Booking.findOne({ _id: bookingId, accessToken: token })
        .populate("serviceId", "name duration price currency")
        .lean();
    } else if (session?.user) {
      booking = await Booking.findOne({
        _id: bookingId,
        professionalId: session.user.id,
      })
        .populate("serviceId", "name duration price currency")
        .lean();
    }

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await req.json();
    const parsed = updateBookingStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: Booking } = await import("@/models/Booking");

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, professionalId: session.user.id },
      { status: parsed.data.status },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If cancelled and has Google Calendar event, delete it
    if (parsed.data.status === "cancelled" && booking.googleEventId) {
      import("@/lib/google-calendar")
        .then(({ deleteCalendarEvent }) =>
          deleteCalendarEvent(session.user.id, booking.googleEventId!)
        )
        .catch((err) =>
          console.error("Failed to delete calendar event:", err)
        );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
