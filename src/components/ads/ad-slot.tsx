"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { areAdsAllowedOnPath } from "@/lib/ad-policy";
import { ADSENSE_CLIENT_ID, HAS_REAL_ADSENSE_CLIENT } from "@/lib/ads-config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  /** AdSense ad unit ID (data-ad-slot). Take it from AD_SLOTS in ads-config. */
  slot: string;
  /** Height reserved before the ad loads, to avoid layout shift. */
  minHeight?: number;
  className?: string;
}

/**
 * A single manual AdSense unit.
 *
 * Renders nothing unless all of these hold: a real publisher ID is configured,
 * this slot has an ID, and the current route is allowed by ad-policy. Ads never
 * appear by accident on a blocked page, or before AdSense is set up. Hidden in
 * the installed app (TWA/PWA) via the `is-standalone` class the root layout sets.
 */
export function AdSlot({ slot, minHeight = 250, className }: AdSlotProps) {
  const pathname = usePathname();
  const enabled = HAS_REAL_ADSENSE_CLIENT && slot.length > 0 && areAdsAllowedOnPath(pathname);

  if (!enabled) return null;

  // Not keyed by pathname: App Router already mounts a fresh page (and so a fresh
  // <ins>) on navigation, including between two /guides/[slug] pages. Keying by
  // pathname made the outgoing page's slot remount under the new URL and push a
  // second, orphaned request.
  return <AdUnit key={slot} slot={slot} minHeight={minHeight} className={className} />;
}

function AdUnit({ slot, minHeight, className }: Required<Pick<AdSlotProps, "slot" | "minHeight">> & { className?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = insRef.current;
    // One push per <ins>. Our own marker, not AdSense's data-adsbygoogle-status:
    // that attribute only appears once the script has loaded, so it can't stop a
    // re-run effect (e.g. React strict mode) from queueing a duplicate before then.
    if (!ins || ins.dataset.adPushed || ins.getAttribute("data-adsbygoogle-status")) return;
    ins.dataset.adPushed = "true";
    try {
      // Works before the AdSense script has loaded: it's a plain array queue
      // that the script drains when it arrives.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // Blocked by an extension, script failed, etc. The page must not break.
      console.warn("AdSense slot could not be initialised:", err);
    }
  }, []);

  return (
    <aside aria-label="Advertisement" className={cn("ad-slot my-6 w-full overflow-hidden", className)} style={{ minHeight }}>
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1 text-center">Advertisement</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: minHeight - 16 }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
