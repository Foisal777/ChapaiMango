/**
 * Short, branded order tracking IDs — e.g. `CMH-7K3QX9`.
 *
 * Every order gets one at checkout (and, once the SQL migration in
 * `supabase/cmh-tracking-and-storage.sql` has run, the database also
 * generates/backfills one via trigger, so admin-created or legacy
 * rows are covered too).
 *
 * Format: `CMH-` + 6 chars from a Crockford-style alphabet with the
 * easily-confused glyphs removed (no 0/O, 1/I/L). 31^6 ≈ 887M
 * combinations; collisions are retried by the DB unique index and,
 * on the client insert path, by the checkout fallback.
 */

export const TRACKING_PREFIX = "CMH";
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // 31 chars, no 0/O/1/I/L
export const TRACKING_CODE_LENGTH = 6;

export function generateTrackingId(): string {
  const bytes = new Uint8Array(TRACKING_CODE_LENGTH);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${TRACKING_PREFIX}-${code}`;
}

/** Normalise user input: `cmh7k3qx9`, `CMH 7K3QX9`, `CMH-7K3QX9` → `CMH-7K3QX9`. Returns null if it isn't a CMH id. */
export function normalizeTrackingId(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  const m = cleaned.match(/^CMH-?([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6})$/);
  return m ? `${TRACKING_PREFIX}-${m[1]}` : null;
}

export function isTrackingId(raw: string): boolean {
  return normalizeTrackingId(raw) !== null;
}

/** Display helper: prefer the short CMH id, fall back to a truncated UUID. */
export function displayOrderId(order: { tracking_id?: string | null; id?: string | null }): string {
  if (order.tracking_id) return order.tracking_id;
  if (order.id) return order.id.length > 12 ? `#${order.id.slice(0, 8)}` : order.id;
  return "—";
}
