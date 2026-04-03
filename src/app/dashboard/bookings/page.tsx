"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Eye, Check, X, CheckCircle2, Loader2 } from "lucide-react";

interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  notes: string | null;
  serviceId: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    currency: string;
  } | null;
}

const STATUS_TABS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function BookingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          // Session not ready yet — will retry when session updates
          setFetchError(true);
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Wait for session to be ready before fetching
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchBookings();
    }
  }, [sessionStatus, fetchBookings]);

  async function updateStatus(bookingId: string, status: string) {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  }

  // Show loading while session is being established
  if (sessionStatus === "loading") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your appointment bookings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Unable to load bookings. Please try again.
          </p>
          <Button onClick={fetchBookings} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No bookings found
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {activeTab !== "all"
              ? `No ${activeTab} bookings. Try a different filter.`
              : "Bookings will appear here once clients start scheduling."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    {booking.clientName}
                  </TableCell>
                  <TableCell>
                    {booking.serviceId?.name ?? "Deleted service"}
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    {booking.startTime} - {booking.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[booking.status] ?? ""}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/bookings/${booking._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                      {booking.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingId === booking._id}
                          onClick={() => updateStatus(booking._id, "confirmed")}
                          title="Confirm"
                        >
                          <Check className="size-4 text-blue-600" />
                        </Button>
                      )}
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingId === booking._id}
                            onClick={() =>
                              updateStatus(booking._id, "completed")
                            }
                            title="Complete"
                          >
                            <CheckCircle2 className="size-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingId === booking._id}
                            onClick={() =>
                              updateStatus(booking._id, "cancelled")
                            }
                            title="Cancel"
                          >
                            <X className="size-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
