// Runtime-sensor regression detection — a debounced pass→fail flip on a `flow:`
// chain. The ledger already RECORDS the transition (each new claim supersedes the
// prior one for the same (flow, criterion)); this reads it to surface the moment a
// previously-announced route change goes silent.
//
// Debounce (A7): we report a flow as regressed iff its CURRENT state is `fail` and
// the most recent DIFFERENT earlier state was `pass`. That is "once per flip": a
// flapping `fail→pass→fail` yields exactly one row (the single current pass→fail),
// never one per failing run, and a recovered `fail→pass` yields none.
import type { Store, SignedClaimRecord } from '../db/store.js';
import type { PublicKeyring } from './claim.js';
import { verifyLedger } from './ledger.js';

/** The honesty caveat every runtime claim carries into the conformance record:
 *  a runtime pass is scoped to the observed flows, never the whole product. */
export const FLOW_SCOPE_CAVEAT =
  'Runtime result applies only to the auto-discovered flows the sensor observed, not the whole product.';

/** A currently-regressed flow: a pass→fail flip that is live on the chain. */
export interface FlowRegression {
  subjectKey: string;
  criterion: string;
  /** assertedAt of the current `fail` claim. */
  regressedAt: string;
  /** assertedAt of the `pass` it regressed from. */
  priorPassAt: string;
  /** The flow-scope caveat, surfaced alongside the alert. */
  caveat: string;
}

/** True when a subject key is a `flow:` subject (the runtime sensor's chain). */
export function isFlowSubject(subjectKey: string): boolean {
  return subjectKey.includes('|flow:');
}

type MinimalClaim = Pick<SignedClaimRecord, 'criterion' | 'state' | 'assertedAt'>;

/**
 * Detect a live regression for one criterion on a single (already-verified) chain,
 * given its claims in append order. Returns null when the current state isn't a
 * regression from a prior pass.
 */
export function detectRegression(
  subjectKey: string,
  criterion: string,
  claims: MinimalClaim[],
): FlowRegression | null {
  const series = claims.filter(c => c.criterion === criterion);
  if (series.length === 0) return null;

  const current = series[series.length - 1];
  if (current.state !== 'fail') return null;

  // Walk backwards to the most recent state that differs from the current `fail`.
  for (let i = series.length - 2; i >= 0; i--) {
    if (series[i].state === 'fail') continue;
    if (series[i].state === 'pass') {
      return {
        subjectKey,
        criterion,
        regressedAt: current.assertedAt,
        priorPassAt: series[i].assertedAt,
        caveat: FLOW_SCOPE_CAVEAT,
      };
    }
    return null; // last change was into fail from a non-pass state: not a pass→fail regression
  }
  return null; // only ever failed: a standing failure, not a regression
}

/**
 * Scan the ledger for live runtime regressions across every `flow:` subject. Only
 * VERIFIED chains are considered — a tampered chain reports no regression (it is
 * surfaced by the separate chain-tamper alert instead). `subjectKeys` may scope the
 * scan to one installation's subjects.
 */
export async function flowRegressions(
  store: Store,
  keyring: PublicKeyring,
  subjectKeys?: string[],
): Promise<FlowRegression[]> {
  const keys = (subjectKeys ?? (await store.listSubjectKeys())).filter(isFlowSubject);
  keys.sort((a, b) => a.localeCompare(b));

  const out: FlowRegression[] = [];
  for (const subjectKey of keys) {
    const verdict = await verifyLedger(store, subjectKey, keyring);
    if (!verdict.ok) continue;
    const claims = await store.listClaims(subjectKey);
    const criteria = new Set(claims.map(c => c.criterion));
    for (const criterion of [...criteria].sort((a, b) => a.localeCompare(b))) {
      const regression = detectRegression(subjectKey, criterion, claims);
      if (regression) out.push(regression);
    }
  }
  return out;
}
