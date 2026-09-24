import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = "test-ip-1";
    const res1 = checkRateLimit(key, 3, 10000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, 3, 10000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, 3, 10000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const key = "test-ip-2";
    checkRateLimit(key, 2, 10000);
    checkRateLimit(key, 2, 10000);

    const res = checkRateLimit(key, 2, 10000);
    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.resetInSeconds).toBeGreaterThan(0);
  });

  it("differentiates between distinct keys", () => {
    const keyA = "ip-a";
    const keyB = "ip-b";

    checkRateLimit(keyA, 1, 10000);
    const blockedA = checkRateLimit(keyA, 1, 10000);
    expect(blockedA.success).toBe(false);

    const allowedB = checkRateLimit(keyB, 1, 10000);
    expect(allowedB.success).toBe(true);
  });
});
