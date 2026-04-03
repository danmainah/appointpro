export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CalendarDays, Clock, User, Mail } from "lucide-react";

async function getBooking(token: string) {
  await connectDB();
  const { default: Booking } = await import("@/models/Booking");
  const { default: Service } = await import("@/models/Service");
  const { default: UserModel } = await import("@/models/User");

  const booking = await Booking.findOne({ accessToken: token }).lean();
  if (!booking) return null;

  const [service, professional] = await Promise.all([
    Service.findById(booking.serviceId).select("name duration price currency").lean(),
    UserModel.findById(booking.professionalId).select("name title").lean(),
  ]);

  return { booking, service, professional };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  if (!params.token) notFound();

  const data = await getBooking(params.token);
  if (!data) notFound();

  const { booking, service, professional } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <Badge className={`mt-2 ${statusColors[booking.status] || ""}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.date}</p>
                  <p className="text-sm text-gray-600">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{service?.name || "Service"}</p>
                  <p className="text-sm text-gray-600">
                    {booking.duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {professional?.name || "Professional"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {professional?.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.clientName}</p>
                  <p className="text-sm text-gray-600">
                    {booking.clientEmail}
                  </p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700">Notes:</p>
                <p className="text-sm text-gray-600">{booking.notes}</p>
              </div>
            )}

            {booking.paymentRequired && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <span className="font-medium">Payment</span>
                <Badge
                  variant={
                    booking.paymentStatus === "paid" ? "default" : "secondary"
                  }
                >
                  {booking.paymentStatus}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
