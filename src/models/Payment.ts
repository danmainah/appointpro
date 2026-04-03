import mongoose, { Schema, Model } from "mongoose";
import { IPayment } from "@/types";

const PaymentSchema = new Schema<IPayment>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["booking", "event"], required: true },
    referenceId: { type: Schema.Types.ObjectId, required: true },
    method: { type: String, enum: ["stripe", "mpesa"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "KES"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: { type: String, default: null },
    mpesaReceiptNumber: { type: String, default: null },
    mpesaCheckoutRequestId: { type: String, default: null },
    mpesaPhoneNumber: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ referenceId: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ mpesaCheckoutRequestId: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
