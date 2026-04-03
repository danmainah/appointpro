export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign } from "lucide-react";

async function getProfessional(slug: string) {
  await connectDB();
  const { default: User } = await import("@/models/User");
  return User.findOne({ slug, isActive: true })
    .select("-password")
    .lean();
}

async function getServices(professionalId: string) {
  await connectDB();
  const { default: Service } = await import("@/models/Service");
  return Service.find({ professionalId, isActive: true })
    .sort({ sortOrder: 1 })
    .lean();
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const professional = await getProfessional(slug);
  if (!professional) notFound();

  const services = await getServices(String(professional._id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-semibold text-slate-600 shrink-0">
              {professional.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{professional.name}</h1>
              <p className="text-gray-600 text-lg">{professional.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant="secondary">{professional.category}</Badge>
                {professional.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {professional.location}
                  </span>
                )}
              </div>
              {professional.bio && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {professional.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        {services.length === 0 ? (
          <p className="text-gray-500">
            No services available at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={String(service._id)}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {service.price > 0
                          ? `${service.currency} ${(service.price / 100).toFixed(2)}`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/professionals/${slug}/book?service=${service._id}`}
                  >
                    <Button>Book Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
