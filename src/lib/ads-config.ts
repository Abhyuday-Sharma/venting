/**
 * AdSense identifiers. These are public values (they appear in page HTML), not
 * secrets, but they must be real before ads can serve.
 *
 * BEFORE PRODUCTION: set NEXT_PUBLIC_ADSENSE_CLIENT_ID to your publisher ID
 * (ca-pub-…) and create the ad units, then set the slot env vars below. Also
 * replace the placeholder in public/ads.txt.
 */

export const ADSENSE_CLIENT_PLACEHOLDER = "ca-pub-XXXXXXXXXXXXXXXX";

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ADSENSE_CLIENT_PLACEHOLDER;

export const HAS_REAL_ADSENSE_CLIENT = ADSENSE_CLIENT_ID !== ADSENSE_CLIENT_PLACEHOLDER;

/**
 * Manual ad unit IDs, one per placement. Empty means that placement renders
 * nothing. No fake IDs are hardcoded.
 */
export const AD_SLOTS = {
  guideArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE ?? "",
  feedInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED ?? "",
} as const;
