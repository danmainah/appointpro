import mongoose, { Schema, Model } from "mongoose";
import { IAvailability } from "@/types";

const TimeSlotSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const DayScheduleSchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    enabled: { type: Boolean, required: true },
    slots: { type: [TimeSlotSchema], default: [] },
  },
  { _id: false }
);

const DateOverrideSchema = new Schema(
  {
    date: { type: String, required: true },
    available: { type: Boolean, required: true },
    slots: { type: [TimeSlotSchema], default: null },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailability>({
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  timezone: { type: String, default: "UTC" },
  weeklySchedule: { type: [DayScheduleSchema], default: [] },
  overrides: { type: [DateOverrideSchema], default: [] },
  bufferMinutes: { type: Number, default: 15 },
  updatedAt: { type: Date, default: Date.now },
});

AvailabilitySchema.pre("save", function () {
  this.updatedAt = new Date();
});

const Availability: Model<IAvailability> =
  mongoose.models.Availability ||
  mongoose.model<IAvailability>("Availability", AvailabilitySchema);

export default Availability;
