import mongoose, { Schema, Model } from "mongoose";
import { IEvent } from "@/types";

const EventSchema = new Schema<IEvent>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, default: null },
    meetingLink: { type: String, default: null },
    maxAttendees: { type: Number, required: true },
    currentAttendees: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    currency: { type: String, enum: ["USD", "KES"], default: "USD" },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

EventSchema.index({ professionalId: 1 });
EventSchema.index({ date: 1, isActive: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
