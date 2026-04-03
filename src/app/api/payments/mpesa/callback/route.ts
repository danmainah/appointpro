import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { parseMpesaCallback } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = parseMpesaCallback(body);

    await connectDB();
    const { default: Payment } = await import("@/models/Payment");
    const { default: Booking } = await import("@/models/Booking");
    const { default: EventRegistration } = await import(
      "@/models/EventRegistration"
    );

    if (result.success) {
      const payment = await Payment.findOneAndUpdate(
        { mpesaCheckoutRequestId: result.checkoutRequestId },
        {
          status: "completed",
          mpesaReceiptNumber: result.mpesaReceiptNumber,
          completedAt: new Date(),
        },
        { new: true }
      );

      if (payment) {
        if (payment.type === "booking") {
          await Booking.updateOne(
            { _id: payment.referenceId },
            { paymentStatus: "paid" }
          );
        } else if (payment.type === "event") {
          await EventRegistration.updateOne(
            { _id: payment.referenceId },
            { paymentStatus: "paid" }
          );
        }
      }
    } else {
      await Payment.updateOne(
        { mpesaCheckoutRequestId: result.checkoutRequestId },
        { status: "failed" }
      );
    }

    // Daraja requires this response format
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    // Still return success to Daraja to prevent retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
