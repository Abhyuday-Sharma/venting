"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Plus, Smile, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide the bottom navigation on specific pages
  if (pathname === "/login" || pathname === "/create-username" || pathname === "/") {
    return null;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Feed",
      href: "/feed",
      icon: MessageSquare,
    },
    {
      label: "Vent",
      href: "/vent",
      icon: Plus,
      isPrimary: true,
    },
    {
      label: "Moments",
      href: "/moments",
      icon: Smile,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 dark:border-white/5 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isProtectedRoute = item.href === "/moments" || item.href === "/settings" || item.href === "/dashboard";
          const targetHref = (!user && isProtectedRoute) ? `/login?redirect=${item.href}` : item.href;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={targetHref} className="relative -top-5 flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform duration-300 active:scale-95",
                    isActive
                      ? "bg-primary shadow-primary/30"
                      : "bg-primary/90 hover:bg-primary"
                  )}
                >
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={targetHref}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 active:scale-95",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-8 h-8 transition-all duration-300",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon
                  className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
