"use client";

import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 pl-14 md:px-6 md:pl-16 lg:pl-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Bar - Compact on mobile, full on desktop */}
          <div className="relative w-full max-w-[220px] md:hidden">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <div className="w-full">
              <Input
                placeholder="Search..."
                className="pl-8 h-8 text-sm bg-muted/50 border-none focus-visible:bg-background"
              />
            </div>
          </div>
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <div className="w-full">
              <Input
                placeholder="Search..."
                className="pl-8 h-9 bg-muted/50 border-none focus-visible:bg-background"
              // Remove label/error wrapper logic if we want pure input, 
              // but since we kept the wrapper in Input component, we pass no label/error.
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-none">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {(session?.user as any)?.role?.toLowerCase() || 'User'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
