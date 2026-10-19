import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { normalizeUrl } from "./url.js";
import { summarizeResults } from "./summarize.js";

export const DEFAULT_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const DEFAULTS = {
  tags: DEFAULT_TAGS,
  navigationTimeoutMs: 25000,
  settleMs: 1500,
  exampleCount: 3,
  userAgent:
    "Mozilla/5.0 (compatible; a11y-scan-engine/0.1; +https://github.com/gdorzilme/a11y-scan-engine)",
};

/**
 * Scan a single public web page for automatically detectable WCAG issues.
 *
 * Loads the page in headless Chromium, runs axe-core with the given WCAG
 * tags, and returns a severity summary. Automated testing finds only part
 * of real-world accessibility issues; results are not a conformance claim.
 *
 * @param {string} input  URL or bare hostname, e.g. "example.com"
 * @param {Partial<typeof DEFAULTS>} [options]
 */
export async function scanUrl(input, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const url = normalizeUrl(input);
  if (!url) {
    throw new Error(`Invalid or disallowed URL: ${input}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ userAgent: opts.userAgent });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: opts.navigationTimeoutMs });
    // Give late-rendering content a moment, but cap it.
    await page.waitForTimeout(opts.settleMs);

    const results = await new AxeBuilder({ page }).withTags(opts.tags).analyze();

    return {
      url,
      scannedAt: new Date().toISOString(),
      standard: opts.tags,
      ...summarizeResults(results, { exampleCount: opts.exampleCount }),
    };
  } finally {
    await browser.close();
  }
}
