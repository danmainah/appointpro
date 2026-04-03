export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "consulting", label: "Consulting" },
  { value: "legal", label: "Legal" },
  { value: "health", label: "Health" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
  { value: "education", label: "Education" },
  { value: "therapy", label: "Therapy" },
  { value: "other", label: "Other" },
];

async function getProfessionals(
  search?: string,
  category?: string
) {
  await connectDB();
  const { default: User } = await import("@/models/User");

  const query: Record<string, unknown> = { isActive: true };
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  return User.find(query)
    .select("name slug title bio category location image")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const professionals = await getProfessionals(params.search, params.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Find a Professional</h1>
        <p className="text-gray-600 mb-8">
          Browse our network of verified professionals and book your appointment
        </p>

        {/* Filters */}
        <form className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            name="search"
            placeholder="Search by name, title, or specialty..."
            defaultValue={params.search}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <select
            name="category"
            defaultValue={params.category}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {professionals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No professionals found. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <Link
                key={String(pro._id)}
                href={`/professionals/${pro.slug}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-600">
                        {pro.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {pro.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 truncate">
                          {pro.title}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {pro.bio || "No bio available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {pro.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {pro.location}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {pro.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
