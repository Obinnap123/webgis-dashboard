"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotificationItem {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const sessionUser = session?.user as
    | { id?: string; role?: string; email?: string | null; name?: string | null }
    | undefined;
  const sessionUserId = sessionUser?.id;
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNotifications() {
      const response = await fetch("/api/notifications");
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0);
        setNotifications(data.data.notifications || []);
      }
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [sessionUserId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function refreshNotifications() {
    const response = await fetch("/api/notifications");
    if (!response.ok) return;
    const data = await response.json();
    if (!data.success) return;
    setUnreadCount(data.data.unreadCount || 0);
    setNotifications(data.data.notifications || []);
  }

  async function markAsRead(id?: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    await refreshNotifications();
  }

  async function handleBellClick() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (!nextOpen) return;
    setIsLoading(true);
    try {
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  }

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
          <div className="relative" ref={panelRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBellClick}
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Open notifications"
            >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
            )}
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                  <button
                    onClick={() => markAsRead()}
                    disabled={unreadCount === 0}
                    className="text-xs font-medium text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-auto">
                  {isLoading ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      Loading notifications...
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex w-full flex-col gap-1 border-b border-border px-3 py-3 text-left hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {sessionUser?.role?.toLowerCase() || "User"}
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
