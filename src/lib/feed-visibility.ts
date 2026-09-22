import { Timestamp } from "firebase/firestore";
import type { Vent } from "./types";
import { toMillis } from "./date-utils";

/**
 * What signed-out visitors (and therefore crawlers and ad reviewers) may see in
 * the public feed.
 *
 * Vents the safety system flagged (`safetyFlag`) stay published for signed-in
 * users exactly as before; this only keeps them out of the guest view. It does
 * not change moderation: nothing here decides who is blocked, flagged, or shown
 * the support modal.
 */
export function isVisibleToGuests(vent: Pick<Vent, "safetyFlag" | "isHidden">): boolean {
  return vent.safetyFlag !== true && vent.isHidden !== true;
}

export function filterVentsForGuests<T extends Pick<Vent, "safetyFlag" | "isHidden">>(vents: T[]): T[] {
  return vents.filter(isVisibleToGuests);
}

/**
 * A vent in a form that can cross the server → client boundary and be cached:
 * Firestore Timestamps become epoch millis.
 */
export type SerializedVent = Omit<Vent, "timestamp" | "expiresAt"> & {
  timestamp: number;
  expiresAt: number | null;
};

/**
 * Serialize a vent for the guest server render. The author's uid is dropped
 * from incognito vents: the page HTML is indexable, and a uid resolves to a
 * profile page, which would undo the anonymity the author chose.
 */
export function serializeVentForGuests(vent: Vent): SerializedVent {
  const { timestamp, expiresAt, ...rest } = vent;
  return {
    ...rest,
    userId: vent.isIncognito ? "" : vent.userId,
    timestamp: toMillis(timestamp),
    expiresAt: expiresAt ? toMillis(expiresAt) : null,
  };
}

export function deserializeVent(vent: SerializedVent): Vent {
  return {
    ...vent,
    timestamp: Timestamp.fromMillis(vent.timestamp),
    expiresAt: vent.expiresAt ? Timestamp.fromMillis(vent.expiresAt) : null,
  };
}
