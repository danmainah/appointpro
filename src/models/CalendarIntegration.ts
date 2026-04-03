import mongoose, { Schema, Model } from "mongoose";
import { ICalendarIntegration } from "@/types";

const CalendarIntegrationSchema = new Schema<ICalendarIntegration>({
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  googleAccessToken: { type: String, required: true },
  googleRefreshToken: { type: String, required: true },
  googleTokenExpiry: { type: Date, required: true },
  calendarId: { type: String, default: "primary" },
  updatedAt: { type: Date, default: Date.now },
});

CalendarIntegrationSchema.pre("save", function () {
  this.updatedAt = new Date();
});

const CalendarIntegration: Model<ICalendarIntegration> =
  mongoose.models.CalendarIntegration ||
  mongoose.model<ICalendarIntegration>(
    "CalendarIntegration",
    CalendarIntegrationSchema
  );

export default CalendarIntegration;
