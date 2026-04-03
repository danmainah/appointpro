import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    slug: { type: String, unique: true },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    category: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    paymentRequired: { type: Boolean, default: false },
    stripeAccountId: { type: String, default: null },
    mpesaEnabled: { type: Boolean, default: false },
    mpesaPaybillNumber: { type: String, default: null },
    googleCalendarConnected: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ slug: 1 });
UserSchema.index({ category: 1, isActive: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
