import { AXE_WCAG_MAP } from '../detector/axe-wcag-map.js';
import { ESLINT_TO_WCAG } from '../runners/wcag-eslint-map.js';

/**
 * Static catalog of WCAG 2.1 + 2.2 Level A and AA success criteria, the shared
 * foundation for conformance reporting (VPAT/ACR, accessibility statements).
 *
 * This is the source of truth for criterion titles, conformance levels, and the
 * standards cross-walk. Automated-coverage data is NOT hard-coded here: it is
 * derived at load time from the detector maps (`AXE_WCAG_MAP`, `ESLINT_TO_WCAG`)
 * so the catalog can never drift from what a11y-fixer actually detects.
 *
 * Honesty note: `hasAutomatedCoverage` means "a11y-fixer has at least one
 * automated detector that fires for this criterion" — NOT "fully machine
 * verifiable". Automated tools can only surface a fraction of real failures for
 * most criteria; a published conformance claim still requires human review.
 */

export type ConformanceLevel = 'A' | 'AA' | 'AAA';
export type WcagVersion = '2.0' | '2.1' | '2.2';

/** Static, hand-maintained metadata for one success criterion. */
export interface SuccessCriterionMeta {
  /** Dotted success-criterion number, e.g. '1.1.1'. */
  id: string;
  /** Short official name, e.g. 'Non-text Content'. */
  title: string;
  level: ConformanceLevel;
  /** WCAG version that introduced the criterion. */
  wcagVersion: WcagVersion;
}

/** A catalog entry: static metadata enriched with derived cross-walk + coverage. */
export interface SuccessCriterion extends SuccessCriterionMeta {
  /** W3C "Understanding" doc URL for the criterion. */
  understandingUrl: string;
  /** EN 301 549 web clause (always `9.<id>` for A/AA web criteria). */
  en301549Clause: string;
  /**
   * axe rule ids and eslint-plugin-jsx-a11y rule names a11y-fixer uses to detect
   * failures of this criterion. Empty when the tool has no automated detector.
   */
  coveringRuleIds: string[];
  /** True when `coveringRuleIds` is non-empty. See honesty note above. */
  hasAutomatedCoverage: boolean;
}

/**
 * Section 508 (Revised, 2017) incorporates WCAG 2.0 Level A and AA by reference
 * rather than renumbering each criterion, so there is no per-criterion 508
 * chapter. These are the document-level provisions a VPAT's 508 tables cite; the
 * WCAG rows are reused under them. Kept here so the Phase 3 renderer has one
 * source of truth.
 */
export const SECTION_508_INCORPORATION = {
  web: 'E205.4', // Web content must conform to WCAG 2.0 Level A and AA
  software: 'E207.2', // Software must conform to WCAG 2.0 Level A and AA
  electronicDocs: 'E205.4',
} as const;

// WCAG 2.1 + 2.2 Level A and AA, in canonical SC order. VPAT/ACR procurement
// targets Level AA, so AAA is omitted — except for a AAA criterion a a11y-fixer
// detector rule can emit (e.g. 2.2.4), which must have metadata so its findings
// never drop silently. 4.1.1 Parsing is included because many VPATs still list
// it, though it is obsolete (always "Supports") in WCAG 2.2.
const META: readonly SuccessCriterionMeta[] = [
  // Principle 1 — Perceivable
  { id: '1.1.1', title: 'Non-text Content', level: 'A', wcagVersion: '2.0' },
  { id: '1.2.1', title: 'Audio-only and Video-only (Prerecorded)', level: 'A', wcagVersion: '2.0' },
  { id: '1.2.2', title: 'Captions (Prerecorded)', level: 'A', wcagVersion: '2.0' },
  { id: '1.2.3', title: 'Audio Description or Media Alternative (Prerecorded)', level: 'A', wcagVersion: '2.0' },
  { id: '1.2.4', title: 'Captions (Live)', level: 'AA', wcagVersion: '2.0' },
  { id: '1.2.5', title: 'Audio Description (Prerecorded)', level: 'AA', wcagVersion: '2.0' },
  { id: '1.3.1', title: 'Info and Relationships', level: 'A', wcagVersion: '2.0' },
  { id: '1.3.2', title: 'Meaningful Sequence', level: 'A', wcagVersion: '2.0' },
  { id: '1.3.3', title: 'Sensory Characteristics', level: 'A', wcagVersion: '2.0' },
  { id: '1.3.4', title: 'Orientation', level: 'AA', wcagVersion: '2.1' },
  { id: '1.3.5', title: 'Identify Input Purpose', level: 'AA', wcagVersion: '2.1' },
  { id: '1.4.1', title: 'Use of Color', level: 'A', wcagVersion: '2.0' },
  { id: '1.4.2', title: 'Audio Control', level: 'A', wcagVersion: '2.0' },
  { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA', wcagVersion: '2.0' },
  { id: '1.4.4', title: 'Resize Text', level: 'AA', wcagVersion: '2.0' },
  { id: '1.4.5', title: 'Images of Text', level: 'AA', wcagVersion: '2.0' },
  { id: '1.4.10', title: 'Reflow', level: 'AA', wcagVersion: '2.1' },
  { id: '1.4.11', title: 'Non-text Contrast', level: 'AA', wcagVersion: '2.1' },
  { id: '1.4.12', title: 'Text Spacing', level: 'AA', wcagVersion: '2.1' },
  { id: '1.4.13', title: 'Content on Hover or Focus', level: 'AA', wcagVersion: '2.1' },
  // Principle 2 — Operable
  { id: '2.1.1', title: 'Keyboard', level: 'A', wcagVersion: '2.0' },
  { id: '2.1.2', title: 'No Keyboard Trap', level: 'A', wcagVersion: '2.0' },
  { id: '2.1.4', title: 'Character Key Shortcuts', level: 'A', wcagVersion: '2.1' },
  { id: '2.2.1', title: 'Timing Adjustable', level: 'A', wcagVersion: '2.0' },
  { id: '2.2.2', title: 'Pause, Stop, Hide', level: 'A', wcagVersion: '2.0' },
  // AAA, included only because axe `meta-refresh-no-exceptions` maps here.
  { id: '2.2.4', title: 'Interruptions', level: 'AAA', wcagVersion: '2.0' },
  { id: '2.3.1', title: 'Three Flashes or Below Threshold', level: 'A', wcagVersion: '2.0' },
  { id: '2.4.1', title: 'Bypass Blocks', level: 'A', wcagVersion: '2.0' },
  { id: '2.4.2', title: 'Page Titled', level: 'A', wcagVersion: '2.0' },
  { id: '2.4.3', title: 'Focus Order', level: 'A', wcagVersion: '2.0' },
  { id: '2.4.4', title: 'Link Purpose (In Context)', level: 'A', wcagVersion: '2.0' },
  { id: '2.4.5', title: 'Multiple Ways', level: 'AA', wcagVersion: '2.0' },
  { id: '2.4.6', title: 'Headings and Labels', level: 'AA', wcagVersion: '2.0' },
  { id: '2.4.7', title: 'Focus Visible', level: 'AA', wcagVersion: '2.0' },
  { id: '2.4.11', title: 'Focus Not Obscured (Minimum)', level: 'AA', wcagVersion: '2.2' },
  { id: '2.5.1', title: 'Pointer Gestures', level: 'A', wcagVersion: '2.1' },
  { id: '2.5.2', title: 'Pointer Cancellation', level: 'A', wcagVersion: '2.1' },
  { id: '2.5.3', title: 'Label in Name', level: 'A', wcagVersion: '2.1' },
  { id: '2.5.4', title: 'Motion Actuation', level: 'A', wcagVersion: '2.1' },
  { id: '2.5.7', title: 'Dragging Movements', level: 'AA', wcagVersion: '2.2' },
  { id: '2.5.8', title: 'Target Size (Minimum)', level: 'AA', wcagVersion: '2.2' },
  // Principle 3 — Understandable
  { id: '3.1.1', title: 'Language of Page', level: 'A', wcagVersion: '2.0' },
  { id: '3.1.2', title: 'Language of Parts', level: 'AA', wcagVersion: '2.0' },
  { id: '3.2.1', title: 'On Focus', level: 'A', wcagVersion: '2.0' },
  { id: '3.2.2', title: 'On Input', level: 'A', wcagVersion: '2.0' },
  { id: '3.2.3', title: 'Consistent Navigation', level: 'AA', wcagVersion: '2.0' },
  { id: '3.2.4', title: 'Consistent Identification', level: 'AA', wcagVersion: '2.0' },
  { id: '3.2.6', title: 'Consistent Help', level: 'A', wcagVersion: '2.2' },
  { id: '3.3.1', title: 'Error Identification', level: 'A', wcagVersion: '2.0' },
  { id: '3.3.2', title: 'Labels or Instructions', level: 'A', wcagVersion: '2.0' },
  { id: '3.3.3', title: 'Error Suggestion', level: 'AA', wcagVersion: '2.0' },
  { id: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)', level: 'AA', wcagVersion: '2.0' },
  { id: '3.3.7', title: 'Redundant Entry', level: 'A', wcagVersion: '2.2' },
  { id: '3.3.8', title: 'Accessible Authentication (Minimum)', level: 'AA', wcagVersion: '2.2' },
  // Principle 4 — Robust
  { id: '4.1.1', title: 'Parsing', level: 'A', wcagVersion: '2.0' },
  { id: '4.1.2', title: 'Name, Role, Value', level: 'A', wcagVersion: '2.0' },
  { id: '4.1.3', title: 'Status Messages', level: 'AA', wcagVersion: '2.1' },
];

/**
 * Builds `wcagId -> ruleIds[]` from the detector maps. `AXE_WCAG_MAP` is
 * axeRuleId -> wcagId; `ESLINT_TO_WCAG` is eslintRuleName -> wcagId. We invert
 * both so the catalog reflects exactly what the tool detects today.
 */
function buildCoverage(): Map<string, string[]> {
  const coverage = new Map<string, string[]>();
  const add = (wcagId: string, ruleId: string): void => {
    const existing = coverage.get(wcagId);
    if (existing) {
      if (!existing.includes(ruleId)) existing.push(ruleId);
    } else {
      coverage.set(wcagId, [ruleId]);
    }
  };
  for (const [ruleId, wcagId] of Object.entries(AXE_WCAG_MAP)) add(wcagId, ruleId);
  for (const [ruleId, wcagId] of Object.entries(ESLINT_TO_WCAG)) add(wcagId, ruleId);
  return coverage;
}

const COVERAGE = buildCoverage();

function understandingUrl(id: string): string {
  // W3C Understanding docs slug the title; link to the WCAG quickref filter
  // instead, which is stable and resolves for every criterion id.
  return `https://www.w3.org/WAI/WCAG22/quickref/#sc-${id.replace(/\./g, '')}`;
}

/** The full catalog: static metadata enriched with cross-walk + live coverage. */
export const SUCCESS_CRITERIA: readonly SuccessCriterion[] = META.map((meta) => {
  const coveringRuleIds = [...(COVERAGE.get(meta.id) ?? [])].sort();
  return {
    ...meta,
    understandingUrl: understandingUrl(meta.id),
    en301549Clause: `9.${meta.id}`,
    coveringRuleIds,
    hasAutomatedCoverage: coveringRuleIds.length > 0,
  };
});

const BY_ID = new Map(SUCCESS_CRITERIA.map((sc) => [sc.id, sc]));

/** Look up a success criterion by dotted id (e.g. '1.4.3'). */
export function getSuccessCriterion(id: string): SuccessCriterion | undefined {
  return BY_ID.get(id);
}

/** True when `id` is a known Level A/AA success-criterion number in the catalog. */
export function isKnownCriterion(id: string): boolean {
  return BY_ID.has(id);
}

/** Success criteria a11y-fixer can detect automatically (non-empty coverage). */
export function criteriaWithAutomatedCoverage(): readonly SuccessCriterion[] {
  return SUCCESS_CRITERIA.filter((sc) => sc.hasAutomatedCoverage);
}
