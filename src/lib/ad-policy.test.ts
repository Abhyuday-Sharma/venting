import { describe, it, expect } from "vitest";
import { areAdsAllowedOnPath, feedAdPositions } from "./ad-policy";

describe("areAdsAllowedOnPath", () => {
  it.each(["/", "/showcase", "/about", "/updates", "/guides", "/guides/why-venting-can-feel-relieving", "/feed"])(
    "allows %s",
    (path) => expect(areAdsAllowedOnPath(path)).toBe(true)
  );

  it.each([
    "/vent",
    "/dashboard",
    "/dashboard/mood-tracks",
    "/moments",
    "/moments/my-moments",
    "/login",
    "/create-username",
    "/welcome",
    "/settings",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/privacy",
    "/terms",
    "/contact",
    "/account-deletion",
    "/support",
    "/support/success",
    "/u/someone",
    "/profile/abc",
  ])("blocks %s", (path) => expect(areAdsAllowedOnPath(path)).toBe(false));

  it("blocks unknown routes by default", () => {
    expect(areAdsAllowedOnPath("/something-new")).toBe(false);
    expect(areAdsAllowedOnPath("")).toBe(false);
    expect(areAdsAllowedOnPath(null)).toBe(false);
  });

  it("doesn't treat look-alike paths as allowed", () => {
    expect(areAdsAllowedOnPath("/feedback")).toBe(false);
    expect(areAdsAllowedOnPath("/ventures")).toBe(false);
  });
});

describe("feedAdPositions", () => {
  const plain = (n: number) => Array.from({ length: n }, () => ({ safetyFlag: false }));

  it("places an ad after every Nth card, never after the last", () => {
    expect([...feedAdPositions(plain(13), 6)]).toEqual([5, 11]);
    expect([...feedAdPositions(plain(12), 6)]).toEqual([5]);
    expect([...feedAdPositions(plain(6), 6)]).toEqual([]);
  });

  it("skips a slot when the card before it is flagged", () => {
    const vents = plain(13);
    vents[5] = { safetyFlag: true };
    expect([...feedAdPositions(vents, 6)]).toEqual([11]);
  });

  it("skips a slot when the card after it is flagged", () => {
    const vents = plain(13);
    vents[6] = { safetyFlag: true };
    expect([...feedAdPositions(vents, 6)]).toEqual([11]);
  });

  it("returns nothing for a nonsense interval", () => {
    expect(feedAdPositions(plain(10), 0).size).toBe(0);
  });
});
