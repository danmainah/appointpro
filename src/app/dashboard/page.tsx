"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, Users, DollarSign, CalendarDays } from "lucide-react";

const stats = [
  {
    title: "Today's Bookings",
    value: "0",
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "This Week",
    value: "0",
    icon: CalendarDays,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Total Clients",
    value: "0",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Revenue This Month",
    value: "$0",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "there";

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
        {stats.map((stat) => {
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
                <p className="text-2xl font-bold">{stat.value}</p>
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarCheck className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No upcoming bookings
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Your upcoming appointments will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
