/**
 * Downloads a pinned snapshot of the W3C ACT Rules test cases for the rules this
 * product covers (see rules.mjs) and vendors them under ./fixtures so the
 * benchmark is deterministic and runnable offline in CI.
 *
 * Writes:
 *   fixtures/<actRuleId>/<testcaseId>.html   — the fixture pages
 *   fixtures/manifest.json                   — { source, fetchedAt, cases[] }
 *
 * Re-run this only to refresh the snapshot; commit the result. The index lives
 * at act-rules.github.io and each case carries its own fixture URL + expected
 * outcome (passed | failed | inapplicable).
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACT_RULE_IDS } from './rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, 'fixtures');
const INDEX_URL = 'https://act-rules.github.io/testcases.json';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function main() {
  console.log(`Fetching ACT test case index: ${INDEX_URL}`);
  const index = await getJson(INDEX_URL);
  const wanted = new Set(ACT_RULE_IDS);
  const cases = index.testcases.filter((t) => wanted.has(t.ruleId));
  console.log(`Matched ${cases.length} cases across ${wanted.size} covered rules.`);

  await rm(FIXTURES, { recursive: true, force: true });
  const manifest = [];
  for (const t of cases) {
    const rel = join(t.ruleId, `${t.testcaseId}.html`);
    const dest = join(FIXTURES, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, await getText(t.url), 'utf8');
    manifest.push({
      actRuleId: t.ruleId,
      ruleName: t.ruleName,
      testcaseId: t.testcaseId,
      title: t.testcaseTitle,
      expected: t.expected, // passed | failed | inapplicable
      file: rel,
    });
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  await writeFile(
    join(FIXTURES, 'manifest.json'),
    JSON.stringify(
      { source: INDEX_URL, fetchedAt: new Date().toISOString().slice(0, 10), count: manifest.length, cases: manifest },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(`Wrote ${manifest.length} fixtures + manifest.json to fixtures/.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
