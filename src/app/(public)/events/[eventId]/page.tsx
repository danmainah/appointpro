"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MapPin,
  Users,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface EventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingLink: string | null;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  currency: string;
  isActive: boolean;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });

  useEffect(() => {
    params.then((p) => setEventId(p.eventId));
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleRegister = async () => {
    if (!form.clientName || !form.clientEmail) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setRegistered(true);
      } else {
        const data = await res.json();
        alert(data.error || "Registration failed");
      }
    } catch {
      alert("Something went wrong");
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You&apos;re Registered!</h2>
            <p className="text-gray-600 mb-4">
              A confirmation email has been sent to {form.clientEmail}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
              {event.location && <p><strong>Location:</strong> {event.location}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFull = event.currentAttendees >= event.maxAttendees;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              {event.price > 0 ? (
                <Badge className="text-base px-3 py-1">
                  {event.currency} {(event.price / 100).toFixed(2)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-base px-3 py-1">
                  Free
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 leading-relaxed">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarDays className="w-5 h-5" />
                <div>
                  <p className="font-medium">{event.date}</p>
                  <p className="text-sm">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <p>{event.location}</p>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <p>
                  {event.currentAttendees}/{event.maxAttendees} registered
                </p>
              </div>
              {event.meetingLink && (
                <div className="flex items-center gap-3 text-gray-600">
                  <ExternalLink className="w-5 h-5" />
                  <p>Online event</p>
                </div>
              )}
            </div>

            {/* Registration */}
            {isFull ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  This event is full
                </p>
              </div>
            ) : !showForm ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                Register for This Event
              </Button>
            ) : (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Register</h3>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm({ ...form, clientEmail: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) =>
                      setForm({ ...form, clientPhone: e.target.value })
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!form.clientName || !form.clientEmail || submitting}
                  onClick={handleRegister}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Confirm Registration"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
