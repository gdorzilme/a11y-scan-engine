# a11y-scan-engine

An automated accessibility scanner for a single web page. It loads the page in headless Chromium with [Playwright](https://playwright.dev), runs [axe-core](https://github.com/dequelabs/axe-core) against WCAG 2.0 and 2.1 Level A and AA, and reports the issues it finds grouped by severity.

It can be used from the command line or imported as a library.

> Automated testing catches only part of real-world accessibility problems. Keyboard traps, screen reader gaps and unclear focus order usually need a human to find. Results from this tool are not a certification of conformance.

## Requirements

- Node.js 18 or newer
- A Playwright Chromium build (installed in the setup step below)

## Setup

```bash
npm install
npx playwright install chromium
```

## Command line

```bash
node bin/a11y-scan.js example.com
node bin/a11y-scan.js https://example.com --json
```

Example output:

```
Accessibility scan: https://example.com/
Scanned at: 2026-10-19T17:56:23.206Z

12 issue(s) across 4 rule(s)
  Critical: 2
  Serious:  7
  Moderate: 3
  Minor:    0

Top issues:
  [serious] Elements must meet minimum color contrast ratio thresholds (7) - color-contrast
  ...
```

Exit codes: `0` success, `1` usage error, `2` scan failed.

## Library

```js
import { scanUrl } from "a11y-scan-engine";

const result = await scanUrl("example.com");
console.log(result.totalIssues, result.counts);
```

`scanUrl(url, options)` returns:

| Field | Meaning |
|---|---|
| `url` | The normalized URL that was scanned |
| `scannedAt` | ISO timestamp |
| `standard` | axe tags used (default WCAG 2.0/2.1 A and AA) |
| `totalIssues` | Number of affected elements across all violations |
| `distinctRules` | Number of distinct axe rules violated |
| `counts` | Affected elements by impact: `critical`, `serious`, `moderate`, `minor` |
| `examples` | Top violations by number of affected elements |

Options: `tags`, `navigationTimeoutMs`, `settleMs`, `exampleCount`, `userAgent`.

## How it works

1. `src/url.js` normalizes the input (bare hostnames get `https://`) and refuses obviously internal hosts.
2. `src/scan.js` opens the page in headless Chromium, waits briefly for late content, and runs axe-core.
3. `src/summarize.js` turns the raw axe results into severity counts and top examples.

The scanner only reads public pages. It does not collect, store or transmit any personal information.

## Roadmap

- [ ] Unit tests for URL handling and result summarizing, plus an integration test against local fixture pages
- [ ] WCAG 2.2 AA rule coverage
- [ ] Full results output with element selectors and remediation guidance
- [ ] Multi-page crawling within a single site
- [ ] HTML and PDF report export
- [ ] Stronger target validation: the full 127.0.0.0/8 loopback range (only 127.0.0.1 is blocked today), IPv6, link-local and cloud metadata addresses, and DNS resolution checks

## License

MIT. See [LICENSE](LICENSE).
