/**
 * URL validation for scan targets.
 *
 * Accepts bare hostnames ("example.com") by assuming https, and refuses
 * obviously internal targets (localhost, private IPv4 ranges, .local).
 * This is a basic guardrail, not a complete SSRF defence. See the README
 * roadmap for planned hardening.
 */

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.0\.0\.1$/,
  /^0\.0\.0\.0$/,
  /\.local$/i,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

export function isBlockedHost(hostname) {
  return BLOCKED_HOST_PATTERNS.some((re) => re.test(hostname));
}

/**
 * Normalize user input into a scannable URL string, or return null if it
 * is not a valid, allowed http(s) URL.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function normalizeUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  let candidate = raw.trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (isBlockedHost(parsed.hostname)) return null;
  return parsed.toString();
}
