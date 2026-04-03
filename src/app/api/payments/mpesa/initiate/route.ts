import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { mpesaInitiateSchema } from "@/lib/validations";
import { initiateSTKPush } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mpesaInitiateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phoneNumber, amount, bookingRef, type } = parsed.data;

    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: bookingRef,
      transactionDesc: `Payment for ${type}`,
    });

    await connectDB();
    const { default: Payment } = await import("@/models/Payment");

    await Payment.create({
      professionalId: bookingRef.split("-")[0], // Extract from ref or pass separately
      type,
      referenceId: bookingRef,
      method: "mpesa",
      amount,
      currency: "KES",
      status: "pending",
      mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
      mpesaPhoneNumber: phoneNumber,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error("Error initiating M-Pesa payment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
