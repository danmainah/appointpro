import mongoose, { Schema, Model } from "mongoose";
import { IClient } from "@/types";

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    password: { type: String, default: null },
    isRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ClientSchema.index({ email: 1 });

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
