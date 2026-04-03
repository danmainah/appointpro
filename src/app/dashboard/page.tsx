"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Users, DollarSign, CalendarDays, Clock } from "lucide-react";

interface UpcomingBooking {
  _id: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceId: { name: string; duration: number; price: number; currency: string } | null;
}

interface Stats {
  todayBookings: number;
  weekBookings: number;
  totalClients: number;
  monthRevenue: number;
  upcomingBookings: UpcomingBooking[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
};

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionStatus]);

  const name = session?.user?.name ?? "there";

  const statCards = [
    {
      title: "Today's Bookings",
      value: stats?.todayBookings ?? 0,
      icon: CalendarCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "This Week",
      value: stats?.weekBookings ?? 0,
      icon: CalendarDays,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Revenue This Month",
      value: `KSh ${(stats?.monthRevenue ?? 0).toLocaleString("en-KE")}`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your appointments and activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !stats?.upcomingBookings?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No upcoming bookings
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Your upcoming appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingBookings.map((booking) => (
                <Link
                  key={booking._id}
                  href={`/dashboard/bookings/${booking._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{booking.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {booking.serviceId?.name ?? "Service"} &middot;{" "}
                        {booking.date} &middot; {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[booking.status] || ""}>
                    {booking.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
