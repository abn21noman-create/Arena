import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison after fixed-length hashing; query-string secrets are never accepted. */
export function isValidCronAuthorization(
  authorization: string | null,
  secret: string
): boolean {
  if (!authorization || !secret) return false;
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`));
}
