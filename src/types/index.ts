import { Types } from "mongoose";

// ===== User (Professional) =====
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image: string | null;
  slug: string;
  title: string;
  bio: string;
  phone: string;
  location: string;
  category: string;
  timezone: string;
  paymentRequired: boolean;
  stripeAccountId: string | null;
  mpesaEnabled: boolean;
  mpesaPaybillNumber: string | null;
  googleCalendarConnected: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Client =====
export interface IClient {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string | null;
  password: string | null;
  isRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Service =====
export interface IService {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: "USD" | "KES";
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Availability =====
export interface ITimeSlot {
  start: string;
  end: string;
}

export interface IDaySchedule {
  day: number;
  enabled: boolean;
  slots: ITimeSlot[];
}

export interface IDateOverride {
  date: string;
  available: boolean;
  slots: ITimeSlot[] | null;
}

export interface IAvailability {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  timezone: string;
  weeklySchedule: IDaySchedule[];
  overrides: IDateOverride[];
  bufferMinutes: number;
  updatedAt: Date;
}

// ===== Booking =====
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";
export type PaymentStatus = "none" | "pending" | "paid" | "refunded";

export interface IBooking {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  clientId: Types.ObjectId | null;
  serviceId: Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  notes: string | null;
  paymentRequired: boolean;
  paymentStatus: PaymentStatus;
  paymentId: Types.ObjectId | null;
  googleEventId: string | null;
  reminderSentAt: Date | null;
  followUpSentAt: Date | null;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Event =====
export interface IEvent {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingLink: string | null;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  currency: "USD" | "KES";
  isActive: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Event Registration =====
export interface IEventRegistration {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  clientId: Types.ObjectId | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  paymentStatus: PaymentStatus;
  paymentId: Types.ObjectId | null;
  accessToken: string;
  createdAt: Date;
}

// ===== Payment =====
export type PaymentMethod = "stripe" | "mpesa";
export type PaymentType = "booking" | "event";
export type PaymentRecordStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface IPayment {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  type: PaymentType;
  referenceId: Types.ObjectId;
  method: PaymentMethod;
  amount: number;
  currency: "USD" | "KES";
  status: PaymentRecordStatus;
  stripePaymentIntentId: string | null;
  mpesaReceiptNumber: string | null;
  mpesaCheckoutRequestId: string | null;
  mpesaPhoneNumber: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Calendar Integration =====
export interface ICalendarIntegration {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;
  googleAccessToken: string;
  googleRefreshToken: string;
  googleTokenExpiry: Date;
  calendarId: string;
  updatedAt: Date;
}

// ===== Auth Session =====
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "professional" | "client";
  slug?: string;
  image?: string;
}
