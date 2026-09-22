import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_LINKS, SOCIAL_LINKS } from "@/lib/site-config";

const XLogo = () => (
  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.949L3.545 2.14H1.48l9.42 11.56Z" />
  </svg>
);

interface PublicFooterProps {
  /**
   * The mobile bottom navigation is fixed to the viewport on most pages, so the
   * footer reserves room under itself to stay readable above it. Pass false on
   * pages where the bottom navigation is hidden.
   */
  hasBottomNav?: boolean;
  className?: string;
}

/**
 * Site-wide footer. Visible at every width so guests on phones can always reach
 * the legal, contact and about pages without signing in.
 */
export function PublicFooter({ hasBottomNav = true, className }: PublicFooterProps) {
  return (
    <footer
      className={cn(
        "container mx-auto px-4 md:px-8 pt-8 border-t border-border/30 dark:border-white/5",
        hasBottomNav ? "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8" : "pb-8",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-6 md:gap-8">
        <Link href="/" className="flex justify-start" aria-label="Venting home">
          <Image
            src="/ventingmain.png"
            alt="Venting Logo"
            width={727}
            height={213}
            className="w-28 md:w-32 h-auto opacity-60 dark:invert"
          />
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-1 gap-y-0 text-sm">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="link" size="sm" className="h-8 px-2 text-muted-foreground">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Follow Us</h3>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="icon">
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer">
                <XLogo />
                <span className="sr-only">X (formerly Twitter)</span>
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Instagram</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Venting is a self-help space, not a medical service. In an emergency, contact your local emergency services.
      </p>
    </footer>
  );
}
