import { google } from "googleapis";
import crypto from "crypto";
import { connectDB } from "./db";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encrypt, decrypt };

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(state: string) {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    state,
    prompt: "consent",
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getAuthedCalendarClient(professionalId: string) {
  await connectDB();
  // Dynamic import to avoid circular deps
  const { default: CalendarIntegration } = await import(
    "@/models/CalendarIntegration"
  );

  const integration = await CalendarIntegration.findOne({ professionalId });
  if (!integration) throw new Error("Google Calendar not connected");

  const client = getOAuth2Client();
  const accessToken = decrypt(integration.googleAccessToken);
  const refreshToken = decrypt(integration.googleRefreshToken);

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: integration.googleTokenExpiry.getTime(),
  });

  // Handle token refresh
  client.on("tokens", async (tokens) => {
    const update: Record<string, unknown> = {};
    if (tokens.access_token) {
      update.googleAccessToken = encrypt(tokens.access_token);
    }
    if (tokens.expiry_date) {
      update.googleTokenExpiry = new Date(tokens.expiry_date);
    }
    if (Object.keys(update).length > 0) {
      await CalendarIntegration.updateOne({ professionalId }, update);
    }
  });

  return google.calendar({ version: "v3", auth: client });
}

export async function createCalendarEvent(
  professionalId: string,
  booking: {
    clientName: string;
    serviceName: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
  },
  timezone: string
) {
  const calendar = await getAuthedCalendarClient(professionalId);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${booking.serviceName} - ${booking.clientName}`,
      description: booking.notes || `Booking via AppointPro`,
      start: {
        dateTime: `${booking.date}T${booking.startTime}:00`,
        timeZone: timezone,
      },
      end: {
        dateTime: `${booking.date}T${booking.endTime}:00`,
        timeZone: timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 30 }],
      },
    },
  });

  return event.data.id;
}

export async function updateCalendarEvent(
  professionalId: string,
  googleEventId: string,
  booking: {
    clientName: string;
    serviceName: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
  },
  timezone: string
) {
  const calendar = await getAuthedCalendarClient(professionalId);

  await calendar.events.patch({
    calendarId: "primary",
    eventId: googleEventId,
    requestBody: {
      summary: `${booking.serviceName} - ${booking.clientName}`,
      description: booking.notes || `Booking via AppointPro`,
      start: {
        dateTime: `${booking.date}T${booking.startTime}:00`,
        timeZone: timezone,
      },
      end: {
        dateTime: `${booking.date}T${booking.endTime}:00`,
        timeZone: timezone,
      },
    },
  });
}

export async function deleteCalendarEvent(
  professionalId: string,
  googleEventId: string
) {
  const calendar = await getAuthedCalendarClient(professionalId);

  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
  });
}
