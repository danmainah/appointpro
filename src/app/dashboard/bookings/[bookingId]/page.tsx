"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar, Clock, CreditCard, FileText } from "lucide-react";

interface BookingDetail {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  paymentRequired: boolean;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  serviceId: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    currency: string;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

const paymentStatusColors: Record<string, string> = {
  none: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-purple-100 text-purple-800",
};

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!session) return;
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBooking(data.booking);
      } catch {
        toast.error("Failed to load booking");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [session, bookingId]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setBooking((prev) => (prev ? { ...prev, status: data.booking.status } : prev));
      toast.success(`Booking ${status}`);
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Booking not found</p>
        <Button variant="link" onClick={() => router.push("/dashboard/bookings")}>
          Back to bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/bookings")}>
          <ArrowLeft className="mr-1 size-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-sm text-muted-foreground">ID: {booking._id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{booking.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{booking.clientEmail}</p>
            </div>
            {booking.clientPhone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.clientPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">
                {booking.serviceId?.name ?? "Deleted service"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{booking.date}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{booking.duration} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Booking Status</p>
              <Badge
                variant="secondary"
                className={`mt-1 ${statusColors[booking.status] ?? ""}`}
              >
                {booking.status}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">
                <CreditCard className="mr-1 inline size-3" />
                Payment
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={paymentStatusColors[booking.paymentStatus] ?? ""}
                >
                  {booking.paymentStatus}
                </Badge>
                {booking.serviceId && booking.serviceId.price > 0 && (
                  <span className="text-sm font-medium">
                    {booking.serviceId.currency} {booking.serviceId.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {booking.notes || "No notes provided."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {(booking.status === "pending" || booking.status === "confirmed") && (
        <Card>
          <CardContent className="flex flex-wrap gap-3 pt-6">
            {booking.status === "pending" && (
              <Button
                onClick={() => updateStatus("confirmed")}
                disabled={updating}
              >
                Confirm Booking
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => updateStatus("completed")}
              disabled={updating}
            >
              Mark Completed
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatus("cancelled")}
              disabled={updating}
            >
              Cancel Booking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
