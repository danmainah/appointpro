const MPESA_ENV = process.env.MPESA_ENVIRONMENT || "sandbox";
const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getMpesaAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  if (!res.ok) {
    throw new Error(`M-Pesa auth failed: ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (parseInt(data.expires_in) - 60) * 1000,
  };

  return data.access_token;
}

export async function initiateSTKPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
}: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const token = await getMpesaAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:Z.]/g, "")
    .slice(0, 14);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`M-Pesa STK push failed: ${errorText}`);
  }

  return res.json();
}

export function parseMpesaCallback(body: Record<string, unknown>) {
  const result = body.Body as Record<string, unknown>;
  const stkCallback = result?.stkCallback as Record<string, unknown>;

  if (!stkCallback) {
    throw new Error("Invalid M-Pesa callback format");
  }

  const resultCode = stkCallback.ResultCode as number;
  const checkoutRequestId = stkCallback.CheckoutRequestID as string;

  if (resultCode !== 0) {
    return {
      success: false,
      checkoutRequestId,
      resultCode,
      resultDesc: stkCallback.ResultDesc as string,
    };
  }

  const metadata = stkCallback.CallbackMetadata as Record<string, unknown>;
  const items = (metadata?.Item as Array<Record<string, unknown>>) || [];
  const parsed: Record<string, string | number> = {};

  for (const item of items) {
    parsed[item.Name as string] = (item.Value as string | number) ?? "";
  }

  return {
    success: true,
    checkoutRequestId,
    amount: parsed.Amount as number,
    mpesaReceiptNumber: parsed.MpesaReceiptNumber as string,
    phoneNumber: String(parsed.PhoneNumber),
  };
}
