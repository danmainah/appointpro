import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // Import models
  const { default: User } = await import("../src/models/User");
  const { default: Client } = await import("../src/models/Client");
  const { default: Service } = await import("../src/models/Service");
  const { default: Availability } = await import("../src/models/Availability");
  const { default: Booking } = await import("../src/models/Booking");
  const { default: Event } = await import("../src/models/Event");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Service.deleteMany({}),
    Availability.deleteMany({}),
    Booking.deleteMany({}),
    Event.deleteMany({}),
  ]);

  // --- PROFESSIONALS ---
  console.log("👤 Creating professionals...");
  const password = await bcrypt.hash("password123", 10);

  const professionals = await User.insertMany([
    {
      name: "Dr. Sarah Mitchell",
      email: "sarah@demo.com",
      password,
      slug: "dr-sarah-mitchell",
      title: "Licensed Therapist & Counselor",
      bio: "With over 15 years of experience in cognitive behavioral therapy, I help individuals overcome anxiety, depression, and relationship challenges. My approach is warm, evidence-based, and tailored to each client's unique needs.",
      phone: "+254 712 345 678",
      location: "Nairobi, Kenya",
      category: "therapy",
      timezone: "Africa/Nairobi",
      paymentRequired: true,
      isActive: true,
      isVerified: true,
    },
    {
      name: "James Kariuki",
      email: "james@demo.com",
      password,
      slug: "james-kariuki",
      title: "Business Strategy Consultant",
      bio: "I help startups and SMEs develop actionable growth strategies. Specializing in market entry, fundraising preparation, and operational efficiency across East Africa.",
      phone: "+254 723 456 789",
      location: "Nairobi, Kenya",
      category: "consulting",
      timezone: "Africa/Nairobi",
      paymentRequired: true,
      isActive: true,
      isVerified: true,
    },
    {
      name: "Amina Hassan",
      email: "amina@demo.com",
      password,
      slug: "amina-hassan",
      title: "Family Law Attorney",
      bio: "Experienced family law attorney specializing in divorce, custody, and estate planning. I provide compassionate legal guidance through life's most challenging transitions.",
      phone: "+254 734 567 890",
      location: "Mombasa, Kenya",
      category: "legal",
      timezone: "Africa/Nairobi",
      paymentRequired: false,
      isActive: true,
      isVerified: true,
    },
    {
      name: "Kevin Ochieng",
      email: "kevin@demo.com",
      password,
      slug: "kevin-ochieng",
      title: "Certified Personal Trainer",
      bio: "Transform your body and mind with personalized fitness programs. Whether you're a beginner or athlete, I'll design a plan that fits your goals and lifestyle.",
      phone: "+254 745 678 901",
      location: "Nairobi, Kenya",
      category: "fitness",
      timezone: "Africa/Nairobi",
      paymentRequired: true,
      isActive: true,
      isVerified: true,
    },
    {
      name: "Grace Wanjiku",
      email: "grace@demo.com",
      password,
      slug: "grace-wanjiku",
      title: "Senior Hairstylist & Beauty Expert",
      bio: "Award-winning hairstylist with 8 years of experience in braids, locs, natural hair care, and modern cuts. Your hair is your crown — let me help you wear it proudly.",
      phone: "+254 756 789 012",
      location: "Westlands, Nairobi",
      category: "beauty",
      timezone: "Africa/Nairobi",
      paymentRequired: true,
      isActive: true,
      isVerified: true,
    },
    {
      name: "Dr. Peter Mwangi",
      email: "peter@demo.com",
      password,
      slug: "dr-peter-mwangi",
      title: "General Practitioner",
      bio: "Providing comprehensive primary healthcare services including general check-ups, chronic disease management, and preventive care. Your health, my priority.",
      phone: "+254 767 890 123",
      location: "Karen, Nairobi",
      category: "health",
      timezone: "Africa/Nairobi",
      paymentRequired: true,
      isActive: true,
      isVerified: true,
    },
  ]);

  console.log(`   Created ${professionals.length} professionals`);

  // --- SERVICES ---
  console.log("💼 Creating services...");
  const servicesData = [
    // Sarah - Therapy
    { professionalId: professionals[0]._id, name: "Initial Consultation", description: "60-minute introductory session to discuss your goals and create a treatment plan.", duration: 60, price: 5000, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[0]._id, name: "Individual Therapy Session", description: "Standard 50-minute one-on-one therapy session.", duration: 50, price: 4000, currency: "KES", sortOrder: 1 },
    { professionalId: professionals[0]._id, name: "Couples Counseling", description: "90-minute session for couples working through relationship challenges.", duration: 90, price: 7000, currency: "KES", sortOrder: 2 },

    // James - Consulting
    { professionalId: professionals[1]._id, name: "Strategy Discovery Call", description: "Free 30-minute call to understand your business needs.", duration: 30, price: 0, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[1]._id, name: "Business Strategy Session", description: "Deep-dive 2-hour session on your business growth strategy.", duration: 120, price: 15000, currency: "KES", sortOrder: 1 },
    { professionalId: professionals[1]._id, name: "Pitch Deck Review", description: "1-hour review and feedback on your investor pitch deck.", duration: 60, price: 8000, currency: "KES", sortOrder: 2 },

    // Amina - Legal
    { professionalId: professionals[2]._id, name: "Free Legal Consultation", description: "30-minute initial consultation to discuss your case.", duration: 30, price: 0, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[2]._id, name: "Legal Advisory Session", description: "1-hour detailed legal advisory session.", duration: 60, price: 5000, currency: "KES", sortOrder: 1 },

    // Kevin - Fitness
    { professionalId: professionals[3]._id, name: "Fitness Assessment", description: "45-minute initial assessment including body composition and fitness level evaluation.", duration: 45, price: 2000, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[3]._id, name: "Personal Training Session", description: "1-hour personal training session tailored to your goals.", duration: 60, price: 3000, currency: "KES", sortOrder: 1 },
    { professionalId: professionals[3]._id, name: "Nutrition Consultation", description: "45-minute nutrition planning and meal prep guidance.", duration: 45, price: 2500, currency: "KES", sortOrder: 2 },

    // Grace - Beauty
    { professionalId: professionals[4]._id, name: "Haircut & Styling", description: "Precision cut and professional styling.", duration: 60, price: 2000, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[4]._id, name: "Braids & Twists", description: "Full head braids or twists — various styles available.", duration: 180, price: 5000, currency: "KES", sortOrder: 1 },
    { professionalId: professionals[4]._id, name: "Hair Treatment", description: "Deep conditioning, protein treatment, or scalp treatment.", duration: 90, price: 3500, currency: "KES", sortOrder: 2 },

    // Peter - Health
    { professionalId: professionals[5]._id, name: "General Check-up", description: "Comprehensive general health examination.", duration: 30, price: 3000, currency: "KES", sortOrder: 0 },
    { professionalId: professionals[5]._id, name: "Follow-up Visit", description: "Follow-up appointment for ongoing treatment.", duration: 20, price: 2000, currency: "KES", sortOrder: 1 },
  ];

  const services = await Service.insertMany(servicesData);
  console.log(`   Created ${services.length} services`);

  // --- AVAILABILITY ---
  console.log("📅 Creating availability schedules...");
  const defaultSchedule = [
    { day: 0, enabled: false, slots: [] }, // Sunday
    { day: 1, enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
    { day: 2, enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
    { day: 3, enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
    { day: 4, enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
    { day: 5, enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
    { day: 6, enabled: true, slots: [{ start: "10:00", end: "14:00" }] }, // Saturday half-day
  ];

  await Availability.insertMany(
    professionals.map((pro) => ({
      professionalId: pro._id,
      timezone: "Africa/Nairobi",
      weeklySchedule: defaultSchedule,
      overrides: [],
      bufferMinutes: 15,
    }))
  );
  console.log(`   Created ${professionals.length} availability schedules`);

  // --- DEMO CLIENTS ---
  console.log("👥 Creating demo clients...");
  const clients = await Client.insertMany([
    { name: "John Kamau", email: "john@example.com", phone: "+254 700 111 222", isRegistered: false },
    { name: "Mary Otieno", email: "mary@example.com", phone: "+254 700 333 444", isRegistered: false },
    { name: "David Njoroge", email: "david@example.com", phone: "+254 700 555 666", isRegistered: false },
    { name: "Lucy Akinyi", email: "lucy@example.com", phone: "+254 700 777 888", isRegistered: false },
    { name: "Michael Wafula", email: "michael@example.com", phone: "+254 700 999 000", isRegistered: false },
  ]);
  console.log(`   Created ${clients.length} clients`);

  // --- DEMO BOOKINGS ---
  console.log("📋 Creating demo bookings...");
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  const bookings = await Booking.insertMany([
    // Today's bookings for Sarah
    {
      professionalId: professionals[0]._id, clientId: clients[0]._id, serviceId: services[0]._id,
      clientName: "John Kamau", clientEmail: "john@example.com", clientPhone: "+254 700 111 222",
      date: formatDate(today), startTime: "09:00", endTime: "10:00", duration: 60,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professionals[0]._id, clientId: clients[1]._id, serviceId: services[1]._id,
      clientName: "Mary Otieno", clientEmail: "mary@example.com", clientPhone: "+254 700 333 444",
      date: formatDate(today), startTime: "14:00", endTime: "14:50", duration: 50,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    // Tomorrow
    {
      professionalId: professionals[0]._id, clientId: clients[2]._id, serviceId: services[2]._id,
      clientName: "David Njoroge", clientEmail: "david@example.com",
      date: formatDate(addDays(today, 1)), startTime: "10:00", endTime: "11:30", duration: 90,
      status: "pending", paymentRequired: true, paymentStatus: "pending",
      accessToken: crypto.randomUUID(),
    },
    // James's bookings
    {
      professionalId: professionals[1]._id, clientId: clients[3]._id, serviceId: services[4]._id,
      clientName: "Lucy Akinyi", clientEmail: "lucy@example.com", clientPhone: "+254 700 777 888",
      date: formatDate(addDays(today, 2)), startTime: "09:00", endTime: "11:00", duration: 120,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    // Kevin's bookings
    {
      professionalId: professionals[3]._id, clientId: clients[4]._id, serviceId: services[10]._id,
      clientName: "Michael Wafula", clientEmail: "michael@example.com",
      date: formatDate(addDays(today, 1)), startTime: "15:00", endTime: "16:00", duration: 60,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    // Past completed bookings
    {
      professionalId: professionals[0]._id, clientId: clients[0]._id, serviceId: services[1]._id,
      clientName: "John Kamau", clientEmail: "john@example.com",
      date: formatDate(addDays(today, -3)), startTime: "09:00", endTime: "09:50", duration: 50,
      status: "completed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    {
      professionalId: professionals[0]._id, clientId: clients[1]._id, serviceId: services[1]._id,
      clientName: "Mary Otieno", clientEmail: "mary@example.com",
      date: formatDate(addDays(today, -7)), startTime: "14:00", endTime: "14:50", duration: 50,
      status: "completed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
    // Grace's booking
    {
      professionalId: professionals[4]._id, clientId: clients[3]._id, serviceId: services[12]._id,
      clientName: "Lucy Akinyi", clientEmail: "lucy@example.com",
      date: formatDate(addDays(today, 3)), startTime: "10:00", endTime: "11:00", duration: 60,
      status: "confirmed", paymentRequired: true, paymentStatus: "paid",
      accessToken: crypto.randomUUID(),
    },
  ]);
  console.log(`   Created ${bookings.length} bookings`);

  // --- EVENTS ---
  console.log("🎉 Creating demo events...");
  await Event.insertMany([
    {
      professionalId: professionals[1]._id,
      title: "Startup Fundraising Masterclass",
      description: "Learn how to raise your first round of funding. We'll cover pitch deck creation, investor outreach, term sheets, and common mistakes to avoid. Includes Q&A session.",
      date: formatDate(addDays(today, 14)),
      startTime: "10:00",
      endTime: "13:00",
      location: "iHub Nairobi, 6th Floor",
      maxAttendees: 30,
      currentAttendees: 12,
      price: 2500,
      currency: "KES",
      isActive: true,
    },
    {
      professionalId: professionals[3]._id,
      title: "Weekend Fitness Bootcamp",
      description: "Intense 2-hour outdoor fitness bootcamp. Suitable for all fitness levels. Bring water, a mat, and your determination!",
      date: formatDate(addDays(today, 7)),
      startTime: "07:00",
      endTime: "09:00",
      location: "Uhuru Gardens, Nairobi",
      maxAttendees: 20,
      currentAttendees: 8,
      price: 1000,
      currency: "KES",
      isActive: true,
    },
    {
      professionalId: professionals[0]._id,
      title: "Stress Management Workshop",
      description: "A free online workshop on managing stress and anxiety in the workplace. Learn practical techniques including mindfulness, breathing exercises, and boundary-setting.",
      date: formatDate(addDays(today, 10)),
      startTime: "18:00",
      endTime: "19:30",
      meetingLink: "https://meet.google.com/demo-link",
      location: "Online",
      maxAttendees: 50,
      currentAttendees: 23,
      price: 0,
      currency: "KES",
      isActive: true,
    },
    {
      professionalId: professionals[2]._id,
      title: "Know Your Rights: Family Law Basics",
      description: "Free public seminar covering basics of family law in Kenya — marriage, divorce, child custody, and inheritance rights.",
      date: formatDate(addDays(today, 21)),
      startTime: "14:00",
      endTime: "16:00",
      location: "Mombasa Law Society Hall",
      maxAttendees: 40,
      currentAttendees: 5,
      price: 0,
      currency: "KES",
      isActive: true,
    },
  ]);
  console.log("   Created 4 events");

  console.log("\n✅ Seed complete!\n");
  console.log("Demo login credentials (all professionals):");
  console.log("  Email: sarah@demo.com  |  Password: password123  (Therapist)");
  console.log("  Email: james@demo.com  |  Password: password123  (Consultant)");
  console.log("  Email: amina@demo.com  |  Password: password123  (Lawyer)");
  console.log("  Email: kevin@demo.com  |  Password: password123  (Trainer)");
  console.log("  Email: grace@demo.com  |  Password: password123  (Hairstylist)");
  console.log("  Email: peter@demo.com  |  Password: password123  (Doctor)");
  console.log("");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
