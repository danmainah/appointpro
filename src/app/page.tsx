export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Clock,
  Phone,
  CalendarDays,
  Users,
  DollarSign,
  ArrowRight,
  Scissors,
  Star,
} from "lucide-react";
import { connectDB } from "@/lib/db";

function formatPrice(price: number, currency: string) {
  if (currency === "KES") {
    return `KSh ${price.toLocaleString("en-KE")}`;
  }
  return `KSh ${price.toLocaleString("en-KE")}`;
}

export default async function HomePage() {
  await connectDB();

  const { default: User } = await import("@/models/User");
  const { default: Service } = await import("@/models/Service");
  const { default: Event } = await import("@/models/Event");

  const professional = await User.findOne({ isActive: true }).lean();

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
          <p className="text-slate-400">
            This site is being set up. Check back shortly.
          </p>
        </div>
      </div>
    );
  }

  const services = await Service.find({
    professionalId: professional._id,
    isActive: true,
  })
    .sort({ sortOrder: 1 })
    .lean();

  const today = new Date().toISOString().split("T")[0];
  const events = await Event.find({
    professionalId: professional._id,
    isActive: true,
    date: { $gte: today },
  })
    .sort({ date: 1 })
    .lean();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Open for bookings
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tight">
            {professional.name}
          </h1>
          {professional.title && (
            <p className="text-xl md:text-2xl text-blue-300 font-medium mb-6">
              {professional.title}
            </p>
          )}
          {professional.bio && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed line-clamp-3">
              {professional.bio}
            </p>
          )}
          {professional.location && (
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-10">
              <MapPin className="w-5 h-5" />
              <span>{professional.location}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-lg px-8 py-6 shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
              >
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#services">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
              >
                View Services
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          {services.length > 0 && (
            <div className="flex items-center justify-center gap-8 mt-14 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span>{services.length} services</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Mon - Sat</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
              Choose a service and book your appointment in seconds.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={String(service._id)} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {service.price === 0
                          ? "Free"
                          : formatPrice(service.price, service.currency)}
                      </span>
                    </div>
                    <div className="mt-auto pt-2">
                      <Link href={`/book?service=${service._id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Book Now
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {professional.bio && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">
              About {professional.name}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {professional.bio}
                </p>
              </div>
              <div className="space-y-4">
                {professional.category && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Specialty
                    </p>
                    <p className="font-semibold capitalize">
                      {professional.category}
                    </p>
                  </div>
                )}
                {professional.location && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Location
                    </p>
                    <p className="font-semibold">{professional.location}</p>
                  </div>
                )}
                {services.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Services Offered
                    </p>
                    <p className="font-semibold">{services.length}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Upcoming Events
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
              Join our upcoming events and workshops.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const spotsLeft =
                  event.maxAttendees - event.currentAttendees;
                return (
                  <Card key={String(event._id)} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-KE", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        {(event.location || event.meetingLink) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location || "Online"}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {spotsLeft > 0
                              ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`
                              : "Sold out"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {event.price === 0
                              ? "Free"
                              : formatPrice(event.price, event.currency)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto pt-2">
                        <Link href={`/events/${event._id}`}>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={spotsLeft <= 0}
                          >
                            {spotsLeft > 0 ? "Register" : "Sold Out"}
                            {spotsLeft > 0 && (
                              <ArrowRight className="ml-2 w-4 h-4" />
                            )}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact / Location Section */}
      {(professional.location || professional.phone) && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10">Get in Touch</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {professional.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-lg">{professional.location}</span>
                </div>
              )}
              {professional.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-lg">{professional.phone}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="font-semibold text-lg">{professional.name}</p>
              {professional.title && (
                <p className="text-sm text-slate-400">{professional.title}</p>
              )}
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/book" className="hover:text-white transition-colors">
                Book
              </Link>
              {events.length > 0 && (
                <Link
                  href="/events"
                  className="hover:text-white transition-colors"
                >
                  Events
                </Link>
              )}
              <Link
                href="/client-portal"
                className="hover:text-white transition-colors"
              >
                Client Login
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {professional.name}. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
