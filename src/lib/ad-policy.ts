/**
 * Where ads may appear on Venting, in one place.
 *
 * Venting hosts emotional and sometimes crisis-adjacent writing, so ads are
 * opt-in per route: a page only shows an ad if its path is explicitly allowed
 * here, AND the page itself renders an <AdSlot>. Blocked paths win over allowed
 * ones. Auto ads must stay OFF in the AdSense dashboard, or Google would place
 * ads outside these rules.
 *
 * Allowed: landing, showcase, about, updates, guides, and inline in the public feed.
 * Never: the vent composer, dashboard, mood tracking, moments, login/signup,
 * onboarding, settings, legal pages, contact, account deletion, support/donations.
 * The support/crisis modal is a dialog, not a route. It never contains an
 * AdSlot, and this list keeps ads off the pages that open it.
 */

const ALLOWED_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/showcase\/?$/,
  /^\/about\/?$/,
  /^\/updates\/?$/,
  /^\/guides(\/.*)?$/,
  /^\/feed\/?$/,
];

const BLOCKED_PREFIXES = [
  "/vent",
  "/dashboard",
  "/moments",
  "/bright-spots",
  "/login",
  "/signup",
  "/create-username",
  "/welcome",
  "/settings",
  "/feedback",
  "/legal",
  "/privacy",
  "/terms",
  "/contact",
  "/account-deletion",
  "/support",
  "/profile",
  "/u/",
];

export function areAdsAllowedOnPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const blocked = BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`));
  if (blocked) return false;
  return ALLOWED_PATTERNS.some((re) => re.test(pathname));
}

/** Minimum number of vent cards between feed ads. */
export const FEED_AD_INTERVAL = 6;

/**
 * Indexes of feed cards to place an ad *after*. An ad goes after every
 * `interval` cards, but only where neither neighbouring card is safety-flagged.
 * If a slot is blocked it is skipped, never moved closer to the next one.
 */
export function feedAdPositions(
  vents: ReadonlyArray<{ safetyFlag?: boolean }>,
  interval: number = FEED_AD_INTERVAL
): Set<number> {
  const positions = new Set<number>();
  if (interval < 1) return positions;
  for (let i = interval - 1; i < vents.length - 1; i += interval) {
    const before = vents[i];
    const after = vents[i + 1];
    if (before?.safetyFlag || after?.safetyFlag) continue;
    positions.add(i);
  }
  return positions;
}
