import { unstable_cache } from "next/cache";
import { getPublicVents } from "./firebase";
import { filterVentsForGuests, serializeVentForGuests, type SerializedVent } from "./feed-visibility";

/** Enough to give crawlers real content without bloating the HTML. */
const GUEST_FEED_LIMIT = 50;

/**
 * Server-only: the first page of the public feed as a signed-out visitor sees
 * it, for the initial server render of /feed. Safety-flagged and hidden vents
 * are removed here, before they can reach the HTML. The client still re-fetches
 * after hydration, so signed-in users get their usual full view.
 *
 * Cached for a minute so the dynamic /feed route doesn't query Firestore on
 * every request. A failed fetch returns [] (getPublicVents swallows errors),
 * and the client fetch covers it.
 */
export const getGuestFeedVents = unstable_cache(
  async (): Promise<SerializedVent[]> => {
    const vents = await getPublicVents();
    return filterVentsForGuests(vents).slice(0, GUEST_FEED_LIMIT).map(serializeVentForGuests);
  },
  ["guest-feed-v1"],
  { revalidate: 60 }
);
