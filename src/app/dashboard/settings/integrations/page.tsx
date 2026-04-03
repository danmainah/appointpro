"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Google Calendar connected successfully!");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setCalendarConnected(data.profile?.googleCalendarConnected || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-gray-600">Connect external services</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            <CardTitle>Google Calendar</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Automatically sync your bookings to Google Calendar. New bookings
            will appear as events, and cancellations will be removed.
          </p>
          {calendarConnected ? (
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Connected
              </Badge>
              <span className="text-sm text-gray-500">
                Bookings are syncing to your Google Calendar
              </span>
            </div>
          ) : (
            <a href="/api/calendar/connect">
              <Button>Connect Google Calendar</Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
