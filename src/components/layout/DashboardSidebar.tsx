"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Briefcase,
  CalendarDays,
  Users,
  Settings,
  CreditCard,
  Plug,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Availability", href: "/dashboard/availability", icon: Clock },
  { label: "Services", href: "/dashboard/services", icon: Briefcase },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
];

const settingsNav = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  {
    label: "Payment Settings",
    href: "/dashboard/settings/payments",
    icon: CreditCard,
  },
  {
    label: "Integrations",
    href: "/dashboard/settings/integrations",
    icon: Plug,
  },
];

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Brand */}
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight"
          onClick={onNavigate}
        >
          AppointPro
        </Link>
      </div>

      <Separator className="bg-slate-700" />

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings section */}
      <div className="px-3 pb-4">
        <Separator className="mb-4 bg-slate-700" />
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Settings
        </p>
        <div className="space-y-1">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
