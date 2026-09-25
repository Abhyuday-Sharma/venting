"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function AdminTopBar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("/reports")) return "Reports Moderation Queue";
    if (pathname.includes("/feedback")) return "User Feedback Inbox";
    if (pathname.includes("/audit-log")) return "Moderation Audit Log";
    return "Command Center Overview";
  };

  return (
    <header className="hidden md:flex h-16 items-center justify-between px-6 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="/ventingmain.png"
            alt="Venting Logo"
            width={727}
            height={213}
            priority
            className="w-20 h-auto dark:invert opacity-80"
          />
          <span className="text-muted-foreground/60 text-sm">/</span>
          <span className="font-semibold text-sm tracking-tight text-foreground font-headline">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right: Live Sync + Dark/Light Mode Toggle + Public App Link */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Sync</span>
        </Badge>

        <a
          href="https://venting.in/feed"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
        >
          <span>Public App</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Prominent Dark/Light Mode Switcher */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-border/40">
          <ModeToggle />
          <span className="text-xs text-muted-foreground font-medium hidden xl:inline">
            Theme
          </span>
        </div>
      </div>
    </header>
  );
}
