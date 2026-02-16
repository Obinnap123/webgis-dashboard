"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotificationItem {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  status: string;
}

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionUser = session?.user as
    | { id?: string; role?: string; email?: string | null; name?: string | null }
    | undefined;
  const sessionUserId = sessionUser?.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [isSearchingTickets, setIsSearchingTickets] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchInput, setActiveSearchInput] = useState<
    "mobile" | "desktop" | null
  >(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname === "/tickets") {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchSuggestions([]);
      setIsSearchingTickets(false);
      return;
    }

    let isCancelled = false;
    const timeout = setTimeout(async () => {
      setIsSearchingTickets(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: "6",
          offset: "0",
        });
        const response = await fetch(`/api/tickets?${params.toString()}`);
        if (!response.ok || isCancelled) return;

        const data = await response.json();
        if (!data.success || isCancelled) return;

        const suggestions = Array.isArray(data.data?.tickets)
          ? data.data.tickets.map(
              (ticket: { id: string; title: string; status: string }) => ({
                id: ticket.id,
                title: ticket.title,
                status: ticket.status,
              }),
            )
          : [];

        setSearchSuggestions(suggestions);
      } catch {
        if (!isCancelled) {
          setSearchSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingTickets(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    if (!q) {
      router.push("/tickets");
      return;
    }
    router.push(`/tickets?q=${encodeURIComponent(q)}`);
  }

  function handleSearchInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    input: "mobile" | "desktop",
  ) {
    setActiveSearchInput(input);
    setSearchQuery(e.target.value);
    setIsSearchOpen(true);
  }

  function handleSuggestionClick(ticketId: string) {
    setIsSearchOpen(false);
    router.push(`/tickets/${ticketId}`);
  }

  function handleViewAllResults() {
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    if (!q) {
      router.push("/tickets");
      return;
    }
    router.push(`/tickets?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 pl-14 md:px-6 md:pl-16 lg:pl-6">
        <div className="flex items-center gap-4 flex-1" ref={searchRef}>
          {/* Search Bar - Compact on mobile, full on desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-[220px] md:hidden"
          >
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <div className="w-full">
              <Input
                value={searchQuery}
                onFocus={() => {
                  setActiveSearchInput("mobile");
                  if (searchQuery.trim()) setIsSearchOpen(true);
                }}
                onChange={(e) => handleSearchInputChange(e, "mobile")}
                placeholder="Search tickets..."
                className="pl-8 h-8 text-sm bg-muted/50 border-none focus-visible:bg-background"
              />
            </div>
            {isSearchOpen && activeSearchInput === "mobile" && (
              <div className="absolute left-0 right-0 mt-1 rounded-lg border border-border bg-background shadow-lg z-40">
                {isSearchingTickets ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    Searching...
                  </p>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => handleSuggestionClick(ticket.id)}
                        className="w-full border-b border-border px-3 py-2 text-left hover:bg-muted/50 last:border-b-0"
                      >
                        <p className="text-sm text-foreground line-clamp-1">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.status.replace("_", " ")}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-primary hover:bg-muted/50"
                    >
                      View all results
                    </button>
                  </>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No matching tickets.
                  </p>
                )}
              </div>
            )}
          </form>
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-md hidden md:block"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <div className="w-full">
              <Input
                value={searchQuery}
                onFocus={() => {
                  setActiveSearchInput("desktop");
                  if (searchQuery.trim()) setIsSearchOpen(true);
                }}
                onChange={(e) => handleSearchInputChange(e, "desktop")}
                placeholder="Search tickets..."
                className="pl-8 h-9 bg-muted/50 border-none focus-visible:bg-background"
              />
            </div>
            {isSearchOpen && activeSearchInput === "desktop" && (
              <div className="absolute left-0 right-0 mt-1 rounded-lg border border-border bg-background shadow-lg z-40">
                {isSearchingTickets ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Searching...
                  </p>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => handleSuggestionClick(ticket.id)}
                        className="w-full border-b border-border px-3 py-2 text-left hover:bg-muted/50 last:border-b-0"
                      >
                        <p className="text-sm text-foreground line-clamp-1">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.status.replace("_", " ")}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-primary hover:bg-muted/50"
                    >
                      View all results
                    </button>
                  </>
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No matching tickets.
                  </p>
                )}
              </div>
            )}
          </form>
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
