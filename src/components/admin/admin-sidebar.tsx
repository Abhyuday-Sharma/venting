"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  LayoutDashboard,
  ShieldAlert,
  MessageSquareHeart,
  FileText,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const [feedbackCount, setFeedbackCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live count subscriptions for sidebar badges
  useEffect(() => {
    if (!user) return;

    // Listen to pending reports
    const reportsQ = query(collection(db, "reports"), where("status", "==", "pending"));
    const unsubReports = onSnapshot(
      reportsQ,
      (snapshot) => {
        setPendingReportsCount(snapshot.size);
      },
      (err) => console.warn("Reports badge count error:", err.message)
    );

    // Listen to total feedback
    const feedbackQ = collection(db, "feedback");
    const unsubFeedback = onSnapshot(
      feedbackQ,
      (snapshot) => {
        setFeedbackCount(snapshot.size);
      },
      (err) => console.warn("Feedback badge count error:", err.message)
    );

    return () => {
      unsubReports();
      unsubFeedback();
    };
  }, [user]);

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
      exact: true,
    },
    {
      title: "Reports Queue",
      href: "/admin/reports",
      icon: ShieldAlert,
      badge: pendingReportsCount > 0 ? (
        <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 font-bold animate-pulse">
          {pendingReportsCount}
        </Badge>
      ) : null,
    },
    {
      title: "User Feedback",
      href: "/admin/feedback",
      icon: MessageSquareHeart,
      badge: feedbackCount > 0 ? (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 font-medium">
          {feedbackCount}
        </Badge>
      ) : null,
    },
    {
      title: "Audit Log",
      href: "/admin/audit-log",
      icon: FileText,
      badge: null,
    },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border-r border-border/40 select-none">
      {/* Brand Header with Venting Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
        <Link href="/admin" className="flex items-center gap-2 group">
          <Image
            src="/ventingmain.png"
            alt="Venting Logo"
            width={727}
            height={213}
            priority
            className="w-24 h-auto dark:invert hover:opacity-90 transition-opacity drop-shadow-sm"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
          Moderation & Data
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
              <span className="truncate">{item.title}</span>
              {item.badge}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Quick Links
          </p>
          <a
            href="https://venting.in/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="truncate">Public Live Feed</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
          </a>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/40 space-y-3 bg-muted/20">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Operator"} />
            <AvatarFallback className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
              {getInitials(user?.displayName || user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold truncate leading-tight">
                {user?.displayName || user?.username || "Operator"}
              </p>
              <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase h-4 font-mono font-bold">
                {user?.role || "Admin"}
              </Badge>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate leading-tight mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operator Verified</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-1">
            <ModeToggle />
            <span className="text-[11px] text-muted-foreground ml-1">Theme</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Header with Hamburger Trigger */}
      <div className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/ventingmain.png"
            alt="Venting Logo"
            width={727}
            height={213}
            priority
            className="w-24 h-auto dark:invert"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ModeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation</SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
