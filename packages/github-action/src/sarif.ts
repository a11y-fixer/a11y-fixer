import zlib from 'node:zlib';
import crypto from 'node:crypto';
import type { A11yViolation } from '@a11y-fixer/core';
import { toRepoRelative } from './report.js';

/**
 * Phase 2: turn accessibility violations into SARIF 2.1.0 and upload them to the
 * GitHub code-scanning API so they render as alerts in the Security tab — the
 * same surface CodeQL/Dependabot use.
 *
 * PUBLIC-REPO ONLY. Private repositories need paid GitHub Code Security to
 * ingest and render SARIF (the upload 403s otherwise), so the caller gates this
 * on repo visibility. Everything here is best-effort: a failure must never fail
 * a run whose Phase 1 surfaces (Check Run, annotations, sticky comment) already
 * succeeded.
 */

const TOOL_NAME = 'a11y-fixer';
const INFORMATION_URI = 'https://a11y-fixer.com';
const SARIF_VERSION = '2.1.0';
const SARIF_SCHEMA =
  'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json';

/** SARIF result/rule severity. Note the enum differs from the Checks API's. */
export type SarifLevel = 'error' | 'warning' | 'note' | 'none';

/**
 * axe impact → SARIF level. Mirrors the Checks API mapping in report.ts but uses
 * SARIF's enum (`note`, not `notice`): critical/serious are errors, moderate
 * warns, minor is a note.
 */
export function impactToSarifLevel(impact: A11yViolation['impact']): SarifLevel {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'error';
    case 'moderate':
      return 'warning';
    default:
      return 'note';
  }
}

export interface SarifRule {
  id: string;
  name?: string;
  shortDescription: { text: string };
  helpUri?: string;
  defaultConfiguration: { level: SarifLevel };
  properties?: { tags: string[] };
}

export interface SarifResult {
  ruleId: string;
  level: SarifLevel;
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region: { startLine: number; startColumn?: number };
    };
  }>;
  partialFingerprints: { primaryLocationLineHash: string };
}

export interface SarifLog {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        informationUri: string;
        rules: SarifRule[];
      };
    };
    results: SarifResult[];
  }>;
}

/** A minimal REST surface, so this module is testable without a live octokit. */
export interface SarifOctokitLike {
  rest: {
    codeScanning: {
      uploadSarif(params: Record<string, unknown>): Promise<unknown>;
    };
  };
}

/** Stable fingerprint so re-runs update the same alert instead of churning. */
function fingerprint(ruleId: string, uri: string, line: number): string {
  return crypto.createHash('sha256').update(`${ruleId}:${uri}:${line}`).digest('hex').slice(0, 16);
}

/**
 * Build a SARIF 2.1.0 log from violations. One rule per unique violation id;
 * one result per node that carries a source location. Nodes without a location
 * (URL-only scans) produce no results, exactly like inline annotations. An empty
 * violations list yields a valid run with no results — which is what *clears*
 * stale alerts in the Security tab once issues are fixed. Never throws.
 */
export function toSarif(violations: A11yViolation[]): SarifLog {
  const rules = new Map<string, SarifRule>();
  const results: SarifResult[] = [];

  for (const v of violations) {
    if (!rules.has(v.id)) {
      rules.set(v.id, {
        id: v.id,
        name: v.id,
        shortDescription: { text: v.description },
        helpUri: v.helpUrl || undefined,
        defaultConfiguration: { level: impactToSarifLevel(v.impact) },
        properties: { tags: ['accessibility', 'wcag', `WCAG-${v.wcagId}`] },
      });
    }
    for (const node of v.nodes ?? []) {
      if (!node.sourceFile || !node.sourceLine) continue;
      const uri = toRepoRelative(node.sourceFile);
      results.push({
        ruleId: v.id,
        level: impactToSarifLevel(v.impact),
        message: { text: `${v.description} (WCAG ${v.wcagId})\n${v.helpUrl}` },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri },
              region: {
                startLine: node.sourceLine,
                ...(node.sourceColumn ? { startColumn: node.sourceColumn } : {}),
              },
            },
          },
        ],
        partialFingerprints: { primaryLocationLineHash: fingerprint(v.id, uri, node.sourceLine) },
      });
    }
  }

  return {
    $schema: SARIF_SCHEMA,
    version: SARIF_VERSION,
    runs: [
      {
        tool: {
          driver: {
            name: TOOL_NAME,
            informationUri: INFORMATION_URI,
            rules: [...rules.values()],
          },
        },
        results,
      },
    ],
  };
}

/** gzip + base64 the SARIF JSON, the exact encoding the code-scanning API wants. */
export function encodeSarif(log: SarifLog): string {
  return zlib.gzipSync(Buffer.from(JSON.stringify(log), 'utf8')).toString('base64');
}

/**
 * Upload violations as SARIF to the code-scanning API. Caller must gate on a
 * public repo and wrap in try/catch — this throws on an API error (e.g. a 403
 * when `security-events: write` is missing, or Code Security is off) so the
 * caller can warn without failing the run.
 */
export async function uploadSarif(
  octokit: SarifOctokitLike,
  target: { owner: string; repo: string; ref: string; commitSha: string },
  violations: A11yViolation[],
): Promise<void> {
  await octokit.rest.codeScanning.uploadSarif({
    owner: target.owner,
    repo: target.repo,
    commit_sha: target.commitSha,
    ref: target.ref,
    sarif: encodeSarif(toSarif(violations)),
  });
}
