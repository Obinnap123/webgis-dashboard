"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-muted/30">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Header */}
          <Header />

          {/* Content area */}
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="p-6 w-full">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
