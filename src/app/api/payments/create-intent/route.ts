import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createPaymentIntentSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPaymentIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, currency, bookingRef, type } = parsed.data;

    // DON'T use transfer_data for now (Stripe Connect setup comes later)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      metadata: { bookingRef, type },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
