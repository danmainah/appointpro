import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarCheck,
  CreditCard,
  Bell,
  Users,
  Briefcase,
  Scissors,
  Scale,
  Heart,
  GraduationCap,
  Dumbbell,
  Brain,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    description:
      "Clients book in seconds. Pick a service, choose a time, done.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Accept Stripe, Google Pay, Apple Pay, or M-Pesa. Or keep it free.",
  },
  {
    icon: Bell,
    title: "Auto Reminders",
    description:
      "Automated email confirmations, 24h reminders, and follow-ups.",
  },
  {
    icon: Users,
    title: "Google Calendar Sync",
    description:
      "Bookings auto-sync to your Google Calendar. Never double-book.",
  },
];

const CATEGORIES = [
  { icon: Briefcase, label: "Consulting", value: "consulting" },
  { icon: Scale, label: "Legal", value: "legal" },
  { icon: Heart, label: "Health", value: "health" },
  { icon: Scissors, label: "Beauty", value: "beauty" },
  { icon: Dumbbell, label: "Fitness", value: "fitness" },
  { icon: GraduationCap, label: "Education", value: "education" },
  { icon: Brain, label: "Therapy", value: "therapy" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Book Appointments
            <br />
            <span className="text-blue-400">With Top Professionals</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Find and book consultants, lawyers, barbers, therapists, and more.
            Instant booking, automatic reminders, seamless payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/professionals">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              >
                Find a Professional
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-slate-500 text-white hover:bg-slate-800"
              >
                Join as Professional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/professionals?category=${cat.value}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer text-center h-full">
                  <CardContent className="pt-6 pb-4">
                    <cat.icon className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                    <p className="font-medium text-sm">{cat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Everything You Need to Manage Appointments
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Whether you&apos;re a solo professional or a growing team,
            AppointPro has the tools to streamline your booking workflow.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Your Bookings?
          </h2>
          <p className="text-slate-300 mb-8">
            Join hundreds of professionals who use AppointPro to manage their
            appointments effortlessly.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
            >
              Get Started — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2026 AppointPro. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/professionals" className="hover:text-gray-900">
              Professionals
            </Link>
            <Link href="/events" className="hover:text-gray-900">
              Events
            </Link>
            <Link href="/login" className="hover:text-gray-900">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
