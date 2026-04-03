import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    await connectDB();
    const { default: Payment } = await import("@/models/Payment");
    const { default: Booking } = await import("@/models/Booking");
    const { default: EventRegistration } = await import(
      "@/models/EventRegistration"
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const payment = await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "completed", completedAt: new Date() },
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
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        await Payment.updateOne(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "failed" }
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
