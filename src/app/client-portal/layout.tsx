import Link from "next/link";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            AppointPro
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/client-portal"
              className="text-gray-600 hover:text-gray-900"
            >
              My Bookings
            </Link>
            <Link
              href="/professionals"
              className="text-gray-600 hover:text-gray-900"
            >
              Browse
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
