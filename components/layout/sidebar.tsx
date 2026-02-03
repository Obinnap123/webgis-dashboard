"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  Briefcase
} from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tickets", href: "/tickets", icon: Ticket },
  ];

  const adminItems = [{ label: "Users", href: "/admin/users", icon: Users }];

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Modern SaaS Style */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-border bg-card text-card-foreground transition-transform duration-300 lg:translate-x-0 hidden lg:flex flex-col",
          isOpen ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Briefcase className="h-6 w-6" />
            <span>TicketHub</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 p-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="space-y-1">
              <h4 className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2">
                Admin
              </h4>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
              {session?.user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">
                {session?.user?.email}
              </span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {(session?.user as any)?.role?.toLowerCase() || 'User'}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
