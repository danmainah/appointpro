import mongoose, { Schema, Model } from "mongoose";
import { IBooking } from "@/types";

const BookingSchema = new Schema<IBooking>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientPhone: { type: String, default: null },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    notes: { type: String, default: null },
    paymentRequired: { type: Boolean, default: false },
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
    googleEventId: { type: String, default: null },
    reminderSentAt: { type: Date, default: null },
    followUpSentAt: { type: Date, default: null },
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);

BookingSchema.index({ professionalId: 1, date: 1 });
BookingSchema.index({ clientEmail: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ accessToken: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
