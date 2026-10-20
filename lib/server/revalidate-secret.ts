import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison that does not leak the secret's length. */
export function secretMatches(given: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}
