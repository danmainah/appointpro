import mongoose, { Schema, Model } from "mongoose";
import { IEventRegistration } from "@/types";

const EventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ["none", "pending", "paid", "refunded"],
    default: "none",
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
    default: null,
  },
  accessToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

EventRegistrationSchema.index({ eventId: 1 });
EventRegistrationSchema.index({ clientEmail: 1, eventId: 1 });

const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>(
    "EventRegistration",
    EventRegistrationSchema
  );

export default EventRegistration;
