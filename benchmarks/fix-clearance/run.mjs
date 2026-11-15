/**
 * Fix benchmark. For every ACT `failed` case of a covered rule that the scanner
 * actually detects, runs the real fix pipeline — scan → `buildFullRegistry` +
 * `applyAll` → re-scan — and measures the CLEAR-RATE: the share of detected
 * violations the fixers actually remove without introducing new ones.
 *
 * This reuses the vendored ACT corpus from ../act-detection/fixtures as a
 * ready, single-violation fix corpus for the covered rules. (AccessGuru's
 * larger expert-fix corpus can be dropped in later for fix-*similarity* scoring;
 * see README. Clear-rate needs no reference fix, only a re-scan.)
 *
 * Default run is deterministic and free: a fake provider returns fixed
 * accessible-name strings, so no ANTHROPIC_API_KEY and no network. Clear-rate
 * only asks whether a valid name was inserted and the violation cleared — it
 * does not depend on the text's quality — so the fake provider is sufficient to
 * gate fixer dispatch + application in CI. Pass `--real` to use the Anthropic
 * provider (requires a key) when you also want to eyeball fix quality.
 *
 * Requires Chrome (puppeteer) for the HTML scan path.
 */
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from '@a11y-fixer/core';
import { buildFullRegistry } from '@a11y-fixer/ai';
import { COVERED_RULES } from '../act-detection/rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(HERE, '..', 'act-detection', 'fixtures');
const REAL = process.argv.includes('--real');

/** Deterministic provider: mirrors pipeline.e2e.test.ts's fakeProvider. */
const fakeProvider = {
  available: () => true,
  describeImage: async () => 'Company logo',
  suggestAltText: async () => 'Company logo',
  rewriteLinkText: async () => 'View the pricing page',
  suggestAccessibleName: async () => 'Submit',
};

async function provider() {
  if (!REAL) return fakeProvider;
  const { AnthropicProvider } = await import('@a11y-fixer/ai');
  return new AnthropicProvider();
}

async function attempt(rule, fixtureRel, prov) {
  const dir = await mkdtemp(join(tmpdir(), 'a11y-fix-'));
  try {
    const src = await readFile(join(CORPUS, fixtureRel), 'utf8');
    const file = join(dir, 'page.html');
    await writeFile(file, src, 'utf8');

    const accepted = new Set(rule.axe);
    const before = await scanSource(dir, { html: true });
    const detected = before.some((v) => accepted.has(v.id));
    if (!detected) return { status: 'undetected' };

    const registry = buildFullRegistry(prov, dir);
    await registry.applyAll(before);
    const after = await scanSource(dir, { html: true });

    const cleared = !after.some((v) => accepted.has(v.id));
    const introduced = after.length > before.length;
    return { status: cleared && !introduced ? 'cleared' : 'not-cleared', before: before.length, after: after.length, introduced };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(join(CORPUS, 'manifest.json'), 'utf8'));
  if (!existsSync(CORPUS)) throw new Error('Missing ACT corpus; run the act-detection fetch first.');
  const prov = await provider();
  console.error(`Provider: ${REAL ? 'AnthropicProvider (--real)' : 'fake (deterministic)'}`);

  const results = [];
  for (const rule of COVERED_RULES) {
    const failed = manifest.cases.filter((c) => c.actRuleId === rule.act && c.expected === 'failed');
    let detected = 0, cleared = 0, notCleared = 0, undetected = 0, introduced = 0;
    const misses = [];
    for (const c of failed) {
      process.stderr.write(`${rule.axe[0]} ${c.title}... `);
      const r = await attempt(rule, c.file, prov);
      process.stderr.write(r.status + (r.introduced ? ' (+new)' : '') + '\n');
      if (r.status === 'undetected') { undetected++; continue; }
      detected++;
      if (r.introduced) introduced++;
      if (r.status === 'cleared') cleared++;
      else { notCleared++; misses.push(`${c.title} (${r.before}->${r.after}${r.introduced ? ', introduced new' : ''})`); }
    }
    const rate = detected === 0 ? 1 : cleared / detected;
    results.push({ axe: rule.axe.join('+'), wcag: rule.wcag, failed: failed.length, undetected, detected, cleared, notCleared, introduced, clearRate: rate, misses });
  }

  console.log('\nFix clearance benchmark (' + (REAL ? 'real provider' : 'fake provider') + ')\n');
  console.log('axe rule family       WCAG   failed  undet  det  cleared  clear-rate');
  console.log('--------------------  -----  ------  -----  ---  -------  ----------');
  for (const r of results) {
    const label = r.axe.length > 20 ? r.axe.slice(0, 19) + '…' : r.axe;
    console.log(
      `${label.padEnd(20)}  ${r.wcag.padEnd(5)}  ${String(r.failed).padStart(6)}  ${String(r.undetected).padStart(5)}  ${String(r.detected).padStart(3)}  ${String(r.cleared).padStart(7)}  ${(r.clearRate * 100).toFixed(0).padStart(9)}%`,
    );
  }
  const tot = results.reduce((a, r) => ({ detected: a.detected + r.detected, cleared: a.cleared + r.cleared, introduced: a.introduced + r.introduced }), { detected: 0, cleared: 0, introduced: 0 });
  if (tot.introduced) console.log(`\n⚠ fixes introduced NEW violations in ${tot.introduced} case(s).`);
  console.log('--------------------  -----  ------  -----  ---  -------  ----------');
  console.log(`${'TOTAL'.padEnd(20)}  ${''.padEnd(5)}  ${''.padStart(6)}  ${''.padStart(5)}  ${String(tot.detected).padStart(3)}  ${String(tot.cleared).padStart(7)}  ${(tot.detected ? (tot.cleared / tot.detected) * 100 : 100).toFixed(0).padStart(9)}%`);

  const anyMiss = results.filter((r) => r.misses.length);
  if (anyMiss.length) {
    console.log('\nNot cleared:');
    for (const r of anyMiss) for (const m of r.misses) console.log(`  ${r.axe}: ${m}`);
  }

  const resultsPath = join(HERE, 'results.json');
  await writeFile(resultsPath, JSON.stringify({ provider: REAL ? 'real' : 'fake', rules: results.map(({ misses, ...r }) => r), total: tot }, null, 2) + '\n', 'utf8');
  console.log(`\nWrote ${resultsPath}`);

  // Gate (deterministic runs only): every detected violation must clear.
  if (!REAL) {
    const baselinePath = join(HERE, 'baseline.json');
    if (!existsSync(baselinePath)) {
      console.log('\nNo baseline.json — copy results.json to baseline.json to establish the gate.');
      return;
    }
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    const baseByAxe = new Map(baseline.rules.map((r) => [r.axe, r]));
    const regressions = [];
    for (const r of results) {
      const b = baseByAxe.get(r.axe);
      if (!b) continue;
      if (r.cleared < b.cleared) regressions.push(`${r.axe}: cleared ${b.cleared} -> ${r.cleared}`);
      // Trading one violation for another is a regression even if clear-rate holds.
      if (r.introduced > (b.introduced ?? 0)) regressions.push(`${r.axe}: introduced-new ${b.introduced ?? 0} -> ${r.introduced}`);
    }
    if (regressions.length) {
      console.error('\nFIX REGRESSION vs baseline:\n  ' + regressions.join('\n  '));
      process.exit(1);
    }
    console.log('\nNo regression vs baseline. ✓');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
