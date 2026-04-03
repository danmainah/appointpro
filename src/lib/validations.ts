import { z } from "zod";

// ===== Auth =====
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  title: z.string().min(2, "Title is required"),
  category: z.string().min(1, "Category is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const clientRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

// ===== Service =====
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(5, "Duration must be at least 5 minutes").max(480),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.enum(["USD", "KES"]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// ===== Availability =====
const timeSlotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
});

const dayScheduleSchema = z.object({
  day: z.number().min(0).max(6),
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

export const availabilitySchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  weeklySchedule: z.array(dayScheduleSchema).length(7),
  bufferMinutes: z.number().min(0).max(120).default(15),
});

export const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  available: z.boolean(),
  slots: z.array(timeSlotSchema).nullable(),
});

// ===== Booking =====
export const createBookingSchema = z.object({
  professionalId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
  paymentIntentId: z.string().optional(),
  mpesaCheckoutRequestId: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "no-show"]),
});

// ===== Event =====
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().min(1),
  price: z.number().min(0),
  currency: z.enum(["USD", "KES"]),
  image: z.string().optional(),
});

export const eventRegistrationSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  paymentIntentId: z.string().optional(),
  mpesaCheckoutRequestId: z.string().optional(),
});

// ===== Profile =====
export const profileSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  category: z.string().min(1),
  timezone: z.string().min(1),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  paymentRequired: z.boolean(),
  mpesaEnabled: z.boolean().optional(),
  mpesaPaybillNumber: z.string().optional(),
});

// ===== M-Pesa =====
export const mpesaInitiateSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^2547\d{8}$/, "Phone must be in format 2547XXXXXXXX"),
  amount: z.number().min(1),
  bookingRef: z.string().min(1),
  type: z.enum(["booking", "event"]),
});

// ===== Payment Intent =====
export const createPaymentIntentSchema = z.object({
  amount: z.number().min(50, "Minimum amount is 50 cents"),
  currency: z.enum(["usd", "kes"]),
  professionalStripeAccountId: z.string().min(1),
  bookingRef: z.string().min(1),
  type: z.enum(["booking", "event"]),
});
