// The 4.1.3 judge — the single pure function that turns raw route-change facts
// into a verdict. It is deliberately the ONLY place pass/fail is decided, and it
// runs twice: in the driver (to set the CI check conclusion) and in the backend
// (to mint the signed ledger claim from the received facts). Sharing one function
// guarantees the fast CI signal and the authoritative signed claim never disagree.
import { liveRegionTextChanged, type RouteChangeFacts } from './facts.js';

/** The verdict the judge may return. Never a guessed pass: ambiguity is not-evaluated. */
export type Observation = 'pass' | 'fail' | 'not-evaluated';

/**
 * Judge one SPA route transition against WCAG 4.1.3 (Status Messages):
 *  - `not-evaluated` when the transition never settled — we didn't observe the
 *    end state, so we assert nothing (never a guessed pass OR a false fail, A4);
 *  - `pass` when the route change was ANNOUNCED — either a live region gained new
 *    non-empty text (a real text delta, A1) OR focus moved into newly rendered
 *    content;
 *  - `fail` otherwise — the route changed silently: no announcement, no focus
 *    move. This is the litigated failure the sensor exists to catch.
 */
export function judgeObservation(facts: RouteChangeFacts): Observation {
  if (!facts.settled) return 'not-evaluated';
  const announced = liveRegionTextChanged(facts) || facts.focusMovedIntoNewContent;
  return announced ? 'pass' : 'fail';
}
