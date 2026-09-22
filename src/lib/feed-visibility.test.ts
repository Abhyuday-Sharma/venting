import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import type { Vent } from "./types";
import {
  deserializeVent,
  filterVentsForGuests,
  isVisibleToGuests,
  serializeVentForGuests,
} from "./feed-visibility";

const vent = (overrides: Partial<Vent> = {}): Vent => ({
  id: "v1",
  userId: "uid-1",
  text: "hello",
  mood: 5,
  timestamp: Timestamp.fromMillis(1_700_000_000_000),
  ...overrides,
});

describe("isVisibleToGuests", () => {
  it("shows ordinary vents", () => {
    expect(isVisibleToGuests(vent())).toBe(true);
    expect(isVisibleToGuests(vent({ safetyFlag: false, isHidden: false }))).toBe(true);
  });

  it("hides safety-flagged vents", () => {
    expect(isVisibleToGuests(vent({ safetyFlag: true }))).toBe(false);
  });

  it("hides vents hidden by moderation", () => {
    expect(isVisibleToGuests(vent({ isHidden: true }))).toBe(false);
  });
});

describe("filterVentsForGuests", () => {
  it("keeps order and drops only flagged or hidden vents", () => {
    const list = [
      vent({ id: "a" }),
      vent({ id: "b", safetyFlag: true }),
      vent({ id: "c" }),
      vent({ id: "d", isHidden: true }),
    ];
    expect(filterVentsForGuests(list).map((v) => v.id)).toEqual(["a", "c"]);
  });
});

describe("serializeVentForGuests / deserializeVent", () => {
  it("round-trips timestamps through millis", () => {
    const original = vent({ expiresAt: Timestamp.fromMillis(1_800_000_000_000) });
    const serialized = serializeVentForGuests(original);

    expect(serialized.timestamp).toBe(1_700_000_000_000);
    expect(serialized.expiresAt).toBe(1_800_000_000_000);
    expect(JSON.parse(JSON.stringify(serialized))).toEqual(serialized);

    const restored = deserializeVent(serialized);
    expect(restored.timestamp.toMillis()).toBe(1_700_000_000_000);
    expect(restored.expiresAt?.toMillis()).toBe(1_800_000_000_000);
  });

  it("keeps a missing expiry as null", () => {
    expect(serializeVentForGuests(vent()).expiresAt).toBeNull();
    expect(deserializeVent(serializeVentForGuests(vent())).expiresAt).toBeNull();
  });

  it("drops the author uid from incognito vents but keeps it on named ones", () => {
    expect(serializeVentForGuests(vent({ isIncognito: true })).userId).toBe("");
    expect(serializeVentForGuests(vent({ isIncognito: false })).userId).toBe("uid-1");
  });
});
