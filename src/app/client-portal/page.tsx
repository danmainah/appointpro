"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Loader2 } from "lucide-react";

interface Booking {
  _id: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  serviceId: { name: string; duration: number; price: number; currency: string } | null;
  accessToken: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function ClientPortalPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-gray-600 mb-8">Your upcoming and past bookings</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No bookings yet</p>
          <a
            href="/professionals"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Browse professionals
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <a
              key={booking._id}
              href={`/booking/confirmation?token=${booking.accessToken}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.serviceId?.name || "Appointment"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{booking.date}</span>
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={statusColors[booking.status] || ""}
                  >
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
