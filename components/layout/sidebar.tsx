"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

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
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 text-white lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="border-b border-gray-700 px-6 py-8">
            <h1 className="text-2xl font-bold">TicketHub</h1>
            <p className="text-sm text-gray-400">Service Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="border-t border-gray-700 my-4 pt-4">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase">
                    Admin
                  </p>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-700 px-4 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-medium">{session?.user?.email}</p>
              <span className="text-xs text-gray-500">
                {(session?.user as any)?.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-white transition-colors"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
