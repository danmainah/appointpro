"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, LayoutDashboard, CalendarDays, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Events", href: "/#events" },
  { label: "Book Now", href: "/book" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const role = (user as Record<string, unknown>)?.role;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 text-lg font-bold tracking-tight">
          AppointPro
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1.5 outline-none hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name ?? ""} />
                  )}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                {role === "professional" ? (
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem render={<Link href="/client-portal" />}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/client/login">
                <Button variant="ghost" className="text-sm">My Bookings</Button>
              </Link>
              <Link href="/book">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  Book Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="flex flex-col gap-4 pt-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {role === "professional" ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium"
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      href="/client-portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium"
                    >
                      My Bookings
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-left text-sm font-medium text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/client/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium"
                >
                  My Bookings
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
