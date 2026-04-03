import { connectDB } from "./db";

interface TimeSlot {
  start: string;
  end: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function slotsOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number }
): boolean {
  return a.start < b.end && b.start < a.end;
}

export async function getAvailableSlots(
  professionalId: string,
  date: string,
  serviceDuration?: number
): Promise<TimeSlot[]> {
  await connectDB();

  const { default: Availability } = await import("@/models/Availability");
  const { default: Booking } = await import("@/models/Booking");

  const availability = await Availability.findOne({ professionalId });
  if (!availability) return [];

  const dateObj = new Date(date + "T00:00:00Z");
  const dayOfWeek = dateObj.getUTCDay();

  // Check for date-specific override
  const override = availability.overrides?.find(
    (o: { date: string }) => o.date === date
  );
  if (override && !override.available) return [];

  // Get slots for this day
  let daySlots: TimeSlot[];
  if (override && override.slots) {
    daySlots = override.slots;
  } else {
    const daySchedule = availability.weeklySchedule?.find(
      (d: { day: number }) => d.day === dayOfWeek
    );
    if (!daySchedule || !daySchedule.enabled) return [];
    daySlots = daySchedule.slots || [];
  }

  // Get existing bookings for this date
  const existingBookings = await Booking.find({
    professionalId,
    date,
    status: { $nin: ["cancelled"] },
  }).select("startTime endTime");

  const buffer = availability.bufferMinutes || 15;
  const duration = serviceDuration || 60;

  // Convert existing bookings to minute ranges with buffer
  const bookedRanges = existingBookings.map(
    (b: { startTime: string; endTime: string }) => ({
      start: timeToMinutes(b.startTime) - buffer,
      end: timeToMinutes(b.endTime) + buffer,
    })
  );

  // Generate available time slots
  const availableSlots: TimeSlot[] = [];

  for (const slot of daySlots) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    // Generate sub-slots of the requested duration
    for (let start = slotStart; start + duration <= slotEnd; start += 30) {
      const candidateRange = { start, end: start + duration };

      // Check if this candidate overlaps with any booked range
      const hasConflict = bookedRanges.some((booked: { start: number; end: number }) =>
        slotsOverlap(candidateRange, booked)
      );

      if (!hasConflict) {
        availableSlots.push({
          start: minutesToTime(start),
          end: minutesToTime(start + duration),
        });
      }
    }
  }

  return availableSlots;
}
