import { getTimeRemaining, getUrgencyLevel, formatDate } from "../lib/utils";
import { isTokenExpired } from "../lib/auth-storage";

function buildUnsignedJwt(payload) {
  const base64Url = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  const header = base64Url({ alg: "HS256", typ: "JWT" });
  const body = base64Url(payload);
  return `${header}.${body}.signature`;
}

describe("Utility Functions", () => {
  describe("getTimeRemaining", () => {
    it("should calculate days, hours, minutes correctly", () => {
      const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      const result = getTimeRemaining(future);

      expect(result.isOverdue).toBe(false);
      expect(result.days).toBeGreaterThanOrEqual(1);
    });

    it("should detect overdue deadlines", () => {
      const past = new Date(Date.now() - 1000); // 1 second ago
      const result = getTimeRemaining(past);

      expect(result.isOverdue).toBe(true);
      expect(result.days).toBe(0);
    });
  });

  describe("getUrgencyLevel", () => {
    it("should return critical for <= 2 days", () => {
      expect(getUrgencyLevel(1)).toBe("critical");
      expect(getUrgencyLevel(2)).toBe("critical");
    });

    it("should return high for <= 7 days", () => {
      expect(getUrgencyLevel(5)).toBe("high");
      expect(getUrgencyLevel(7)).toBe("high");
    });

    it("should return medium for <= 14 days", () => {
      expect(getUrgencyLevel(10)).toBe("medium");
      expect(getUrgencyLevel(14)).toBe("medium");
    });

    it("should return low for > 14 days", () => {
      expect(getUrgencyLevel(15)).toBe("low");
      expect(getUrgencyLevel(30)).toBe("low");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2026-01-30T12:00:00");
      const formatted = formatDate(date);

      expect(formatted).toContain("Jan");
      expect(formatted).toContain("30");
      expect(formatted).toContain("2026");
    });
  });

  describe("isTokenExpired", () => {
    it("returns true for expired token", () => {
      const token = buildUnsignedJwt({ exp: 1000 });
      expect(isTokenExpired(token, 1000 * 1000 + 1)).toBe(true);
    });

    it("returns false for non-expired token", () => {
      const token = buildUnsignedJwt({ exp: 3000 });
      expect(isTokenExpired(token, 2000 * 1000)).toBe(false);
    });

    it("treats malformed token as expired", () => {
      expect(isTokenExpired("not-a-jwt")).toBe(true);
    });
  });
});
