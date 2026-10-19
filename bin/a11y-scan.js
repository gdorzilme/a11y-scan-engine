#!/usr/bin/env node
import { scanUrl } from "../src/index.js";

const USAGE = `Usage: a11y-scan <url> [--json]

Scans one public web page against WCAG 2.0/2.1 A and AA using axe-core.

Options:
  --json     Print the full result as JSON
  -h, --help Show this help`;

function printReport(r) {
  const c = r.counts;
  console.log(`\nAccessibility scan: ${r.url}`);
  console.log(`Scanned at: ${r.scannedAt}\n`);
  console.log(`${r.totalIssues} issue(s) across ${r.distinctRules} rule(s)`);
  console.log(`  Critical: ${c.critical}`);
  console.log(`  Serious:  ${c.serious}`);
  console.log(`  Moderate: ${c.moderate}`);
  console.log(`  Minor:    ${c.minor}`);
  if (r.examples.length) {
    console.log(`\nTop issues:`);
    for (const ex of r.examples) {
      console.log(`  [${ex.impact}] ${ex.summary} (${ex.count}) - ${ex.rule}`);
    }
  }
  console.log(`\nAutomated testing finds only part of accessibility issues. This is not a conformance certification.\n`);
}

async function main(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    console.log(USAGE);
    return args.length === 0 ? 1 : 0;
  }
  const json = args.includes("--json");
  const target = args.find((a) => !a.startsWith("-"));
  if (!target) {
    console.error(USAGE);
    return 1;
  }

  try {
    const result = await scanUrl(target);
    if (json) console.log(JSON.stringify(result, null, 2));
    else printReport(result);
    return 0;
  } catch (err) {
    console.error(`Scan failed: ${err?.message || err}`);
    return 2;
  }
}

main(process.argv).then((code) => {
  process.exitCode = code;
});
