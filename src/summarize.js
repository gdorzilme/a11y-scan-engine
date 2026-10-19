/**
 * Turn raw axe-core results into a compact summary.
 *
 * Counts are per affected element (node), grouped by axe's impact levels:
 * critical, serious, moderate, minor. A violation with no impact is
 * counted as minor.
 */

export const IMPACT_LEVELS = ["critical", "serious", "moderate", "minor"];

/**
 * @param {{ violations?: Array<{ id?: string, impact?: string|null, help?: string, nodes?: unknown[] }> }} axeResults
 * @param {{ exampleCount?: number }} [options]
 */
export function summarizeResults(axeResults, { exampleCount = 3 } = {}) {
  const violations = (axeResults && axeResults.violations) || [];
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let totalIssues = 0;

  for (const v of violations) {
    const impact = IMPACT_LEVELS.includes(v.impact) ? v.impact : "minor";
    const nodes = (v.nodes && v.nodes.length) || 1;
    counts[impact] += nodes;
    totalIssues += nodes;
  }

  const examples = [...violations]
    .sort((a, b) => (b.nodes?.length || 0) - (a.nodes?.length || 0))
    .slice(0, exampleCount)
    .map((v) => ({
      rule: v.id,
      impact: IMPACT_LEVELS.includes(v.impact) ? v.impact : "minor",
      count: v.nodes?.length || 1,
      summary: v.help,
    }));

  return {
    totalIssues,
    distinctRules: violations.length,
    counts,
    examples,
  };
}
