"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";

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
  slug: string;
  paymentRequired: boolean;
}

type Step = "service" | "date" | "time" | "details" | "payment";

function formatPrice(price: number, currency: string) {
  return `KSh ${price.toLocaleString("en-KE")}`;
}

function BookingFlow() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");

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
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const requiresPayment =
    professional?.paymentRequired &&
    selectedService &&
    selectedService.price > 0;

  // Load professional and services
  useEffect(() => {
    fetch("/api/site-info")
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [preselectedService]);

  // Load available slots when date changes
  const loadSlots = useCallback(() => {
    if (!selectedDate || !selectedService || !professional) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(
      `/api/professionals/${professional.slug}/availability?date=${dateStr}&duration=${selectedService.duration}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, professional]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot || !professional)
      return;
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
          demoPaid: requiresPayment ? true : undefined,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Unable to load booking information.</p>
      </div>
    );
  }

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
            </div>
            <div className="space-y-3">
              <Link href={`/booking/confirmation?token=${confirmationToken}`}>
                <Button variant="outline" className="w-full">
                  View Booking Details
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Service" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "details", label: "Details" },
    ...(requiresPayment ? [{ key: "payment" as Step, label: "Payment" }] : []),
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Book an Appointment</h1>
            <p className="text-sm text-gray-500">{professional.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                    i === currentStepIndex
                      ? "bg-blue-600 text-white"
                      : i < currentStepIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mb-5 ${
                    i < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === "service" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose a Service</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep("date");
                  }}
                  className="w-full text-left p-5 rounded-xl border-2 bg-white transition hover:shadow-md hover:border-blue-300 focus:border-blue-600 focus:outline-none"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-blue-600">
                        {service.price === 0
                          ? "Free"
                          : formatPrice(service.price, service.currency)}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick Date */}
        {step === "date" && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Pick a Date</h2>
            <p className="text-sm text-gray-500 mb-4">
              for {selectedService?.name} ({selectedService?.duration} min)
            </p>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setStep("time");
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className="rounded-xl border bg-white shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Pick Time */}
        {step === "time" && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Available Times</h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              — {selectedService?.name}
            </p>

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <p className="text-gray-500 mb-1">
                  No available slots on this date.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  All time slots are booked or the professional is unavailable.
                </p>
                <Button variant="outline" onClick={() => setStep("date")}>
                  Pick another date
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-green-600 font-medium mb-3">
                  {availableSlots.length} slot
                  {availableSlots.length !== 1 ? "s" : ""} available
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("details");
                      }}
                      className="p-3 rounded-lg border-2 bg-white text-center transition hover:border-blue-400 hover:shadow-sm focus:border-blue-600 focus:outline-none"
                    >
                      <span className="font-semibold text-sm">
                        {slot.start}
                      </span>
                      <span className="block text-xs text-gray-400">
                        to {slot.end}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Enter Details */}
        {step === "details" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Details</h2>

            {/* Booking Summary */}
            <div className="bg-white rounded-xl border p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Booking Summary
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Service:</strong> {selectedService?.name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <strong>Time:</strong> {selectedSlot?.start} -{" "}
                  {selectedSlot?.end} ({selectedService?.duration} min)
                </p>
                {selectedService && selectedService.price > 0 && (
                  <p>
                    <strong>Price:</strong>{" "}
                    {formatPrice(
                      selectedService.price,
                      selectedService.currency
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
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
                  placeholder="Any special requirements..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={
                  !formData.clientName || !formData.clientEmail || submitting
                }
                onClick={() => {
                  if (requiresPayment) {
                    setStep("payment");
                  } else {
                    handleSubmitBooking();
                  }
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : requiresPayment ? (
                  "Continue to Payment"
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Payment (demo) */}
        {step === "payment" && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Payment</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pay{" "}
              <strong>
                {selectedService
                  ? formatPrice(selectedService.price, selectedService.currency)
                  : ""}
              </strong>{" "}
              for {selectedService?.name}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
              Demo mode — enter any card details to simulate payment.
            </div>

            <div className="bg-white rounded-xl border p-5 space-y-4">
              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  value={paymentData.cardName}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                    setPaymentData({ ...paymentData, cardNumber: formatted });
                  }}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    value={paymentData.expiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                      setPaymentData({ ...paymentData, expiry: v });
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={
                  !paymentData.cardNumber ||
                  !paymentData.expiry ||
                  !paymentData.cvv ||
                  processingPayment ||
                  submitting
                }
                onClick={async () => {
                  setProcessingPayment(true);
                  // Simulate payment processing
                  await new Promise((r) => setTimeout(r, 1500));
                  setProcessingPayment(false);
                  // Submit booking with payment marked as paid
                  handleSubmitBooking();
                }}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing payment...
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating booking...
                  </>
                ) : (
                  `Pay ${selectedService ? formatPrice(selectedService.price, selectedService.currency) : ""} & Book`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Back Button */}
        {step !== "service" && (
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                const idx = steps.findIndex((s) => s.key === step);
                if (idx > 0) setStep(steps[idx - 1].key);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <BookingFlow />
    </Suspense>
  );
}
