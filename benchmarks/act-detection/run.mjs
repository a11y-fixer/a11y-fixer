/**
 * Detection benchmark. For each covered ACT rule, scans its vendored test-case
 * fixtures with the REAL product scanner (`scanSource(dir, { html: true })`, the
 * same call the Action uses) and checks the matching axe rule fires on `failed`
 * cases and stays silent on `passed`/`inapplicable` cases.
 *
 *   failed case  + rule fired      = true positive  (correct detection)
 *   failed case  + rule silent     = false negative (missed violation)
 *   passed/inapp + rule fired      = false positive (spurious violation)
 *   passed/inapp + rule silent     = true negative  (correctly clean)
 *
 * Prints a per-rule precision/recall table, writes results.json, and — when
 * baseline.json exists — exits non-zero on any regression (fewer true positives
 * or more false positives than the committed baseline). ACT fixtures probe
 * accessible-name edge cases axe computes slightly differently, so some mismatch
 * is expected and baked into the baseline; the gate only catches *changes*.
 *
 * Requires Chrome (puppeteer) for the HTML scan path.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from '@a11y-fixer/core';
import { COVERED_RULES } from './rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, 'fixtures');

async function scanRule(rule) {
  const dir = join(FIXTURES, rule.act);
  if (!existsSync(dir)) throw new Error(`Missing fixtures for ${rule.act}; run \`pnpm --filter @a11y-fixer/bench-act-detection run fetch\` first.`);

  // testcaseIds present on disk for this rule.
  const files = (await readdir(dir)).filter((f) => f.endsWith('.html'));
  const allIds = new Set(files.map((f) => basename(f, '.html')));

  // testcaseIds on which the rule's specific axe id actually fired.
  const fired = new Set();
  const accepted = new Set(rule.axe);
  const violations = await scanSource(dir, { html: true });
  for (const v of violations) {
    if (!accepted.has(v.id)) continue;
    for (const node of v.nodes) {
      if (node.sourceFile) fired.add(basename(node.sourceFile, '.html'));
    }
  }
  return { allIds, fired };
}

function scoreRule(rule, cases, fired) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  const mismatches = [];
  for (const c of cases) {
    const detected = fired.has(c.testcaseId);
    const positive = c.expected === 'failed';
    if (positive && detected) tp++;
    else if (positive && !detected) { fn++; mismatches.push({ ...c, kind: 'false-negative' }); }
    else if (!positive && detected) { fp++; mismatches.push({ ...c, kind: 'false-positive' }); }
    else tn++;
  }
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  return { axe: rule.axe.join('+'), wcag: rule.wcag, name: rule.name, n: cases.length, tp, fp, fn, tn, precision, recall, mismatches };
}

function pct(x) {
  return `${(x * 100).toFixed(0)}%`;
}

async function main() {
  const manifest = JSON.parse(await readFile(join(FIXTURES, 'manifest.json'), 'utf8'));
  const byRule = new Map();
  for (const c of manifest.cases) {
    if (!byRule.has(c.actRuleId)) byRule.set(c.actRuleId, []);
    byRule.get(c.actRuleId).push(c);
  }

  const results = [];
  for (const rule of COVERED_RULES) {
    const cases = byRule.get(rule.act) ?? [];
    process.stderr.write(`Scanning ${rule.axe} (${cases.length} cases)... `);
    const { fired } = await scanRule(rule);
    results.push(scoreRule(rule, cases, fired));
    process.stderr.write('done\n');
  }

  // Report
  console.log('\nACT detection benchmark — ' + manifest.count + ' cases, snapshot ' + manifest.fetchedAt + '\n');
  console.log('axe rule family       WCAG    n   TP FP FN TN   prec  recall');
  console.log('--------------------  -----  --  -- -- -- --  -----  ------');
  for (const r of results) {
    const label = r.axe.length > 20 ? r.axe.slice(0, 19) + '…' : r.axe;
    console.log(
      `${label.padEnd(20)}  ${r.wcag.padEnd(5)}  ${String(r.n).padStart(2)}   ${String(r.tp).padStart(2)} ${String(r.fp).padStart(2)} ${String(r.fn).padStart(2)} ${String(r.tn).padStart(2)}  ${pct(r.precision).padStart(5)}  ${pct(r.recall).padStart(5)}`,
    );
  }
  const tot = results.reduce((a, r) => ({ tp: a.tp + r.tp, fp: a.fp + r.fp, fn: a.fn + r.fn, tn: a.tn + r.tn }), { tp: 0, fp: 0, fn: 0, tn: 0 });
  console.log('------------------  -----  --  -- -- -- --  -----  ------');
  console.log(`${'TOTAL'.padEnd(18)}  ${''.padEnd(5)}  ${String(manifest.count).padStart(2)}   ${String(tot.tp).padStart(2)} ${String(tot.fp).padStart(2)} ${String(tot.fn).padStart(2)} ${String(tot.tn).padStart(2)}`);

  const mismatches = results.flatMap((r) => r.mismatches.map((m) => `  ${r.axe} ${m.kind}: ${m.title} (${m.expected})`));
  if (mismatches.length) {
    console.log('\nMismatches vs ACT expected outcome (baked into baseline):');
    console.log(mismatches.join('\n'));
  }

  const resultsPath = join(HERE, 'results.json');
  const scored = results.map(({ mismatches, ...r }) => r);
  await writeFile(resultsPath, JSON.stringify({ snapshot: manifest.fetchedAt, rules: scored, total: tot }, null, 2) + '\n', 'utf8');
  console.log(`\nWrote ${resultsPath}`);

  // Gate on regression vs baseline.
  const baselinePath = join(HERE, 'baseline.json');
  if (!existsSync(baselinePath)) {
    console.log('\nNo baseline.json — copy results.json to baseline.json to establish the gate.');
    return;
  }
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  const baseByAxe = new Map(baseline.rules.map((r) => [r.axe, r]));
  const regressions = [];
  for (const r of scored) {
    const b = baseByAxe.get(r.axe);
    if (!b) continue;
    if (r.tp < b.tp) regressions.push(`${r.axe}: true positives ${b.tp} -> ${r.tp}`);
    if (r.fp > b.fp) regressions.push(`${r.axe}: false positives ${b.fp} -> ${r.fp}`);
  }
  if (regressions.length) {
    console.error('\nDETECTION REGRESSION vs baseline:\n  ' + regressions.join('\n  '));
    process.exit(1);
  }
  console.log('\nNo regression vs baseline. ✓');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
