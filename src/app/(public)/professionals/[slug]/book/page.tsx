"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface Professional {
  _id: string;
  name: string;
  title: string;
  paymentRequired: boolean;
  stripeAccountId: string | null;
  mpesaEnabled: boolean;
}

type Step = "service" | "date" | "time" | "details" | "confirm";

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");

  const [slug, setSlug] = useState("");
  const [step, setStep] = useState<Step>("service");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  // Resolve params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Load professional and services
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/professionals/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProfessional(data.professional);
        setServices(data.services || []);
        if (preselectedService) {
          const svc = data.services?.find(
            (s: Service) => s._id === preselectedService
          );
          if (svc) {
            setSelectedService(svc);
            setStep("date");
          }
        }
      });
  }, [slug, preselectedService]);

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService || !professional) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(
      `/api/professionals/${slug}/availability?date=${dateStr}&duration=${selectedService.duration}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, professional, slug]);

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot || !professional) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional._id,
          serviceId: selectedService._id,
          date: selectedDate.toISOString().split("T")[0],
          startTime: selectedSlot.start,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConfirmationToken(data.accessToken);
        setBookingComplete(true);
      } else {
        alert(data.error || "Failed to create booking");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to {formData.clientEmail}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
              <p>
                <strong>Service:</strong> {selectedService?.name}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong>Time:</strong> {selectedSlot?.start} -{" "}
                {selectedSlot?.end}
              </p>
              <p>
                <strong>Professional:</strong> {professional?.name}
              </p>
            </div>
            <a
              href={`/booking/confirmation?token=${confirmationToken}`}
              className="text-slate-900 underline"
            >
              View booking details
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Book with {professional.name}</h1>
          <p className="text-gray-600">{professional.title}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(["service", "date", "time", "details"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? "bg-slate-900 text-white"
                    : (["service", "date", "time", "details"] as Step[]).indexOf(step) > i
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div className="w-8 h-0.5 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Step: Select Service */}
        {step === "service" && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep("date");
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedService?._id === service._id
                      ? "border-slate-900 bg-slate-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-semibold">
                        {service.price > 0
                          ? `${service.currency} ${(service.price / 100).toFixed(2)}`
                          : "Free"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.duration} min
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step: Pick Date */}
        {step === "date" && (
          <Card>
            <CardHeader>
              <CardTitle>Pick a Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setStep("time");
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        )}

        {/* Step: Pick Time */}
        {step === "time" && (
          <Card>
            <CardHeader>
              <CardTitle>
                Pick a Time —{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No available slots on this date.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setStep("date")}
                  >
                    Pick another date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("details");
                      }}
                      className={`p-3 rounded-lg border-2 text-center transition ${
                        selectedSlot?.start === slot.start
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium">{slot.start}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Enter Details */}
        {step === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, clientPhone: e.target.value })
                  }
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Booking Summary</h4>
                <p className="text-sm">
                  <strong>Service:</strong> {selectedService?.name}
                </p>
                <p className="text-sm">
                  <strong>Date:</strong>{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {selectedSlot?.start} -{" "}
                  {selectedSlot?.end}
                </p>
                {selectedService && selectedService.price > 0 && (
                  <p className="text-sm">
                    <strong>Price:</strong>{" "}
                    {selectedService.currency}{" "}
                    {(selectedService.price / 100).toFixed(2)}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={
                  !formData.clientName || !formData.clientEmail || submitting
                }
                onClick={handleSubmitBooking}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step !== "service" && (
            <Button
              variant="outline"
              onClick={() => {
                const steps: Step[] = ["service", "date", "time", "details"];
                const idx = steps.indexOf(step);
                if (idx > 0) setStep(steps[idx - 1]);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
