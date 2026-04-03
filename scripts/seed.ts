import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const { default: User } = await import("../src/models/User");
  const { default: Client } = await import("../src/models/Client");
  const { default: Service } = await import("../src/models/Service");
  const { default: Availability } = await import("../src/models/Availability");
  const { default: Booking } = await import("../src/models/Booking");
  const { default: Event } = await import("../src/models/Event");

  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Service.deleteMany({}),
    Availability.deleteMany({}),
    Booking.deleteMany({}),
    Event.deleteMany({}),
  ]);

  // --- THE PROFESSIONAL (site owner) ---
  console.log("👤 Creating professional...");
  const password = await bcrypt.hash("password123", 10);

  const professional = await User.create({
    name: "Dan's Barber Shop",
    email: "admin@demo.com",
    password,
    slug: "dan-barber",
    title: "Premium Grooming & Barbering Services",
    bio: "Welcome to Dan's Barber Shop — Nairobi's finest grooming destination. With over 8 years of experience, we specialize in classic cuts, modern styles, beard grooming, and hot towel shaves. Walk in looking good, walk out looking great.\n\nOur shop offers a relaxed atmosphere where you can unwind while getting a fresh look. We use premium products and stay up to date with the latest trends in men's grooming.",
    phone: "+254 712 345 678",
    location: "Westlands, Nairobi",
    category: "beauty",
    timezone: "Africa/Nairobi",
    paymentRequired: true,
    isActive: true,
    isVerified: true,
  });

  console.log("   ✅ Professional created");

  // --- SERVICES ---
  console.log("💼 Creating services...");
  const services = await Service.insertMany([
    {
      professionalId: professional._id,
      name: "Classic Haircut",
      description: "Precision cut with clippers and scissors. Includes wash and style.",
      duration: 30,
      price: 800,
      currency: "KES",
      sortOrder: 0,
    },
    {
      professionalId: professional._id,
      name: "Haircut & Beard Trim",
      description: "Full haircut plus beard shaping and trim. Our most popular combo.",
      duration: 45,
      price: 1200,
      currency: "KES",
      sortOrder: 1,
    },
    {
      professionalId: professional._id,
      name: "Hot Towel Shave",
      description: "Luxurious straight-razor shave with hot towel treatment and aftershave balm.",
      duration: 30,
      price: 1000,
      currency: "KES",
      sortOrder: 2,
    },
    {
      professionalId: professional._id,
      name: "Beard Grooming",
      description: "Beard wash, conditioning, trim, and shaping. Keep your beard looking sharp.",
      duration: 20,
      price: 600,
      currency: "KES",
      sortOrder: 3,
    },
    {
      professionalId: professional._id,
      name: "Kids Haircut",
      description: "Gentle haircut for children under 12. Patient and kid-friendly service.",
      duration: 20,
      price: 500,
      currency: "KES",
      sortOrder: 4,
    },
    {
      professionalId: professional._id,
      name: "Full Grooming Package",
      description: "The works — haircut, beard trim, hot towel shave, and scalp massage. Walk out feeling like a new man.",
      duration: 75,
      price: 2500,
      currency: "KES",
      sortOrder: 5,
    },
  ]);
  console.log(`   ✅ Created ${services.length} services`);

  // --- AVAILABILITY ---
  console.log("📅 Creating availability...");
  await Availability.create({
    professionalId: professional._id,
    timezone: "Africa/Nairobi",
    weeklySchedule: [
      { day: 0, enabled: false, slots: [] }, // Sunday off
      { day: 1, enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] },
      { day: 2, enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] },
      { day: 3, enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] },
      { day: 4, enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] },
      { day: 5, enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }] },
      { day: 6, enabled: true, slots: [{ start: "09:00", end: "15:00" }] }, // Saturday shorter
    ],
    overrides: [],
    bufferMinutes: 10,
  });
  console.log("   ✅ Availability set");

  // --- DEMO CLIENTS ---
  console.log("👥 Creating demo clients...");
  const clients = await Client.insertMany([
    { name: "John Kamau", email: "john@example.com", phone: "+254 700 111 222", isRegistered: false },
    { name: "Mary Otieno", email: "mary@example.com", phone: "+254 700 333 444", isRegistered: false },
    { name: "David Njoroge", email: "david@example.com", phone: "+254 700 555 666", isRegistered: false },
    { name: "Peter Mwangi", email: "peter@example.com", phone: "+254 700 777 888", isRegistered: false },
  ]);
  console.log(`   ✅ Created ${clients.length} clients`);

  // --- DEMO BOOKINGS ---
  console.log("📋 Creating demo bookings...");
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  await Booking.insertMany([
    {
      professionalId: professional._id, clientId: clients[0]._id, serviceId: services[0]._id,
      clientName: "John Kamau", clientEmail: "john@example.com", clientPhone: "+254 700 111 222",
      date: fmt(today), startTime: "09:00", endTime: "09:30", duration: 30,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professional._id, clientId: clients[1]._id, serviceId: services[1]._id,
      clientName: "Mary Otieno", clientEmail: "mary@example.com", clientPhone: "+254 700 333 444",
      date: fmt(today), startTime: "14:00", endTime: "14:45", duration: 45,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professional._id, clientId: clients[2]._id, serviceId: services[5]._id,
      clientName: "David Njoroge", clientEmail: "david@example.com",
      date: fmt(addDays(today, 1)), startTime: "10:00", endTime: "11:15", duration: 75,
      status: "pending", paymentRequired: true, paymentStatus: "pending",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professional._id, clientId: clients[3]._id, serviceId: services[0]._id,
      clientName: "Peter Mwangi", clientEmail: "peter@example.com",
      date: fmt(addDays(today, 2)), startTime: "08:00", endTime: "08:30", duration: 30,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    // Past completed
    {
      professionalId: professional._id, clientId: clients[0]._id, serviceId: services[1]._id,
      clientName: "John Kamau", clientEmail: "john@example.com",
      date: fmt(addDays(today, -2)), startTime: "09:00", endTime: "09:45", duration: 45,
      status: "completed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professional._id, clientId: clients[1]._id, serviceId: services[2]._id,
      clientName: "Mary Otieno", clientEmail: "mary@example.com",
      date: fmt(addDays(today, -5)), startTime: "11:00", endTime: "11:30", duration: 30,
      status: "completed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
  ]);
  console.log("   ✅ Created 6 bookings");

  // --- EVENTS ---
  console.log("🎉 Creating events...");
  await Event.insertMany([
    {
      professionalId: professional._id,
      title: "Grand Opening Week — 50% Off All Services",
      description: "Celebrate our new location in Westlands! All services are half price for the entire opening week. First come, first served. Bring a friend and both get an extra 10% off.",
      date: fmt(addDays(today, 7)),
      startTime: "08:00",
      endTime: "18:00",
      location: "Dan's Barber Shop, Westlands",
      maxAttendees: 50,
      currentAttendees: 18,
      price: 0,
      currency: "KES",
      isActive: true,
    },
    {
      professionalId: professional._id,
      title: "Men's Grooming Masterclass",
      description: "Learn the basics of at-home grooming — beard maintenance, skin care routine, and how to communicate with your barber for the perfect cut. Refreshments provided.",
      date: fmt(addDays(today, 14)),
      startTime: "14:00",
      endTime: "16:00",
      location: "Dan's Barber Shop, Westlands",
      maxAttendees: 15,
      currentAttendees: 6,
      price: 500,
      currency: "KES",
      isActive: true,
    },
  ]);
  console.log("   ✅ Created 2 events");

  console.log("\n✅ Seed complete!\n");
  console.log("=== Admin Login ===");
  console.log("  Email:    admin@demo.com");
  console.log("  Password: password123");
  console.log("");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
