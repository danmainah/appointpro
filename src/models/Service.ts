import mongoose, { Schema, Model } from "mongoose";
import { IService } from "@/types";

const ServiceSchema = new Schema<IService>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    duration: { type: Number, required: true },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, enum: ["USD", "KES"], default: "USD" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ professionalId: 1, isActive: 1 });

const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);

export default Service;
