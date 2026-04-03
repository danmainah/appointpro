import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { clientRegisterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = clientRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    await connectDB();
    const { default: Client } = await import("@/models/Client");

    // Check if a registered client with this email already exists
    const existingRegistered = await Client.findOne({
      email: email.toLowerCase(),
      isRegistered: true,
    });
    if (existingRegistered) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if a guest client exists with this email — upgrade to registered
    const existingGuest = await Client.findOne({
      email: email.toLowerCase(),
      isRegistered: false,
    });

    let client;
    if (existingGuest) {
      existingGuest.name = name;
      existingGuest.password = hashedPassword;
      existingGuest.isRegistered = true;
      if (phone) existingGuest.phone = phone;
      client = await existingGuest.save();
    } else {
      client = await Client.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        isRegistered: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: client._id.toString(),
          email: client.email,
          name: client.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Client registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
