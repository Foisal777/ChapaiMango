/**
 * Bangladeshi phone-number helpers used by the auth forms (Supabase
 * needs phone numbers in E.164 format, e.g. +8801712345678).
 *
 *   01712345678        -> +8801712345678
 *   1712345678         -> +8801712345678
 *   8801712345678      -> +8801712345678
 *   +8801712345678     -> +8801712345678 (unchanged)
 *
 * Anything that doesn't look like a BD phone is returned as-is so the
 * caller's validation can flag it.
 */
export function normalizeBdPhone(input: string): string {
  if (!input) return input;
  const cleaned = input.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00880")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("880")) return "+" + cleaned;
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return "+880" + cleaned.slice(1);
  }
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    return "+880" + cleaned;
  }
  return cleaned;
}

/**
 * Loose validation — true when the input normalises to a +880 number
 * with the expected 13 digits (country code + 10-digit subscriber).
 */
export function isValidBdPhone(input: string): boolean {
  const e164 = normalizeBdPhone(input);
  return /^\+8801\d{9}$/.test(e164);
}

/**
 * Pretty-print a phone for the UI: +8801712345678 -> 01712-345678.
 * Falls back to the raw input if it doesn't look BD.
 */
export function formatBdPhone(input: string | null | undefined): string {
  if (!input) return "";
  const e164 = normalizeBdPhone(input);
  const m = e164.match(/^\+880(1\d{4})(\d{6})$/);
  if (!m) return input;
  return `${m[1]}-${m[2]}`;
}
