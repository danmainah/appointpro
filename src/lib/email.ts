import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY || "";
const IS_DEMO = !API_KEY || API_KEY.startsWith("re_placeholder");

export const resend = new Resend(API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

function demoLog(type: string, to: string, subject: string) {
  console.log(`📧 [DEMO] Would send ${type} email to ${to}: "${subject}"`);
  return Promise.resolve({ data: { id: "demo" }, error: null });
}

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  professionalName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  accessToken: string;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (IS_DEMO) return demoLog("confirmation", data.clientEmail, `Booking Confirmed - ${data.serviceName}`);
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/booking/confirmation?token=${data.accessToken}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `Booking Confirmed - ${data.serviceName} with ${data.professionalName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Booking Confirmed!</h2>
        <p>Hi ${data.clientName},</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Professional:</strong> ${data.professionalName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Duration:</strong> ${data.duration} minutes</p>
        </div>
        <a href="${confirmationUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          View Booking Details
        </a>
        <p style="color: #666; margin-top: 20px; font-size: 14px;">
          If you need to make changes, please contact the professional directly.
        </p>
      </div>
    `,
  });
}

export async function sendBookingReminder(data: BookingEmailData) {
  if (IS_DEMO) return demoLog("reminder", data.clientEmail, `Reminder - ${data.serviceName}`);
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/booking/confirmation?token=${data.accessToken}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `Reminder: ${data.serviceName} tomorrow with ${data.professionalName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Appointment Reminder</h2>
        <p>Hi ${data.clientName},</p>
        <p>This is a friendly reminder that you have an appointment coming up tomorrow:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Professional:</strong> ${data.professionalName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
        </div>
        <a href="${confirmationUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          View Booking Details
        </a>
        <p style="color: #666; margin-top: 20px; font-size: 14px;">
          Can't make it? Please let us know as soon as possible.
        </p>
      </div>
    `,
  });
}

export async function sendBookingFollowUp(
  data: Pick<
    BookingEmailData,
    "clientName" | "clientEmail" | "professionalName" | "serviceName"
  >
) {
  if (IS_DEMO) return demoLog("follow-up", data.clientEmail, `Follow-up - ${data.serviceName}`);
  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `How was your ${data.serviceName} with ${data.professionalName}?`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">How was your appointment?</h2>
        <p>Hi ${data.clientName},</p>
        <p>We hope you enjoyed your <strong>${data.serviceName}</strong> session with <strong>${data.professionalName}</strong>.</p>
        <p>We'd love to hear how it went. Feel free to book your next appointment whenever you're ready!</p>
        <p style="color: #666; margin-top: 20px; font-size: 14px;">
          Thank you for using AppointPro.
        </p>
      </div>
    `,
  });
}

export async function sendEventRegistrationConfirmation(data: {
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  accessToken: string;
}) {
  if (IS_DEMO) return demoLog("event registration", data.clientEmail, `Registration - ${data.eventTitle}`);
  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `Registration Confirmed - ${data.eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">You're Registered!</h2>
        <p>Hi ${data.clientName},</p>
        <p>You've successfully registered for:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Event:</strong> ${data.eventTitle}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ""}
        </div>
        <p style="color: #666; margin-top: 20px; font-size: 14px;">
          We look forward to seeing you there!
        </p>
      </div>
    `,
  });
}
