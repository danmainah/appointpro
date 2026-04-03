export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
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
  ArrowRight,
  Scissors,
  Star,
} from "lucide-react";
import { connectDB } from "@/lib/db";

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString("en-KE")}`;
}

// Service images (barber/grooming themed)
const SERVICE_IMAGES: Record<string, string> = {
  "Classic Haircut": "/images/classic-haircut.jpg",
  "Haircut & Beard Trim": "/images/haircut-beard.jpg",
  "Hot Towel Shave": "/images/hot-towel.jpg",
  "Beard Grooming": "/images/beard-grooming.jpg",
  "Kids Haircut": "/images/kids-haircut.jpg",
  "Full Grooming Package": "/images/full-package.jpg",
};

const HERO_IMAGE = "/images/about.jpg";
const SHOP_IMAGE = "/images/hero.jpg";
const DEFAULT_SERVICE_IMAGE = "/images/classic-haircut.jpg";

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
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={SHOP_IMAGE}
            alt="Barber shop"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Open for bookings
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              {professional.name}
            </h1>
            {professional.title && (
              <p className="text-xl md:text-2xl text-blue-300 font-medium mb-6">
                {professional.title}
              </p>
            )}
            {professional.bio && (
              <p className="text-lg text-slate-300 mb-8 leading-relaxed line-clamp-3">
                {professional.bio}
              </p>
            )}
            {professional.location && (
              <div className="flex items-center gap-2 text-slate-400 mb-8">
                <MapPin className="w-5 h-5" />
                <span>{professional.location}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
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
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white text-lg px-8 py-6 border border-white/30"
                >
                  View Services
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            {services.length > 0 && (
              <div className="flex items-center gap-8 mt-12 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  <span>{services.length} services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Mon - Sat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>5.0 rating</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Our Services</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Choose a service and book your appointment in seconds.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const imageUrl =
                  SERVICE_IMAGES[service.name] || DEFAULT_SERVICE_IMAGE;
                return (
                  <Card
                    key={String(service._id)}
                    className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {service.price === 0 ? (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          FREE
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                          {formatPrice(service.price)}
                        </span>
                      )}
                    </div>
                    <CardContent className="flex-1 flex flex-col gap-3 p-5">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="mt-auto pt-3">
                        <Link href={`/book?service=${service._id}`}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Book Now
                            <ArrowRight className="ml-2 w-4 h-4" />
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

      {/* About Section */}
      {professional.bio && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              About Us
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={HERO_IMAGE}
                  alt={`About ${professional.name}`}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Text */}
              <div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-6">
                  {professional.bio}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {services.length}
                    </p>
                    <p className="text-sm text-gray-500">Services</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">8+</p>
                    <p className="text-sm text-gray-500">Years</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">5.0</p>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section id="events" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Upcoming Events</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Join our upcoming events and workshops.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => {
                const spotsLeft =
                  event.maxAttendees - event.currentAttendees;
                return (
                  <Card
                    key={String(event._id)}
                    className="flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      {event.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-gray-600">
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
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {spotsLeft > 0
                                ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`
                                : "Sold out"}
                            </span>
                          </div>
                          <span className="font-bold text-blue-600">
                            {event.price === 0
                              ? "Free"
                              : formatPrice(event.price)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto pt-3">
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

      {/* Contact / CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Fresh Look?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Book your appointment today and experience the best grooming
            services in {professional.location || "town"}.
          </p>
          <Link href="/book">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-lg px-10 py-6 shadow-lg shadow-blue-600/25"
            >
              Book Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-8 mt-10 text-slate-400">
            {professional.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{professional.location}</span>
              </div>
            )}
            {professional.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>{professional.phone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-semibold">{professional.name}</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/book" className="hover:text-white transition-colors">
                Book
              </Link>
              {events.length > 0 && (
                <Link
                  href="#events"
                  className="hover:text-white transition-colors"
                >
                  Events
                </Link>
              )}
              <Link
                href="/client/login"
                className="hover:text-white transition-colors"
              >
                Client Login
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} {professional.name}. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
