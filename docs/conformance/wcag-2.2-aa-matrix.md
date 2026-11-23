# WCAG 2.2 A + AA criterion classification matrix (Phase 0 / D-lite)

**Status:** design spec. This is the product spec for the evidence producers:
each criterion is assigned to the producer class that can assert it (see
[`claim-model.md`](./claim-model.md) → `ClaimMethod`). It tells Phase 1–3 what
to build and tells Phase 4 what the warranty can and cannot cover.

## The four buckets

| bucket | producer / phase | can it back a warranty claim unaided? |
|---|---|---|
| **M — machine-decidable** | deterministic scanner/fixer, Phase 1 (live today) | yes — confidence 1.0 |
| **R — runtime-observable** | rendered-DOM sensor, Phase 2 | yes for directly observed facts |
| **S — semantic** | AI agent proposes, human confirms, Phase 3 | **no** — must escalate to a human claim |
| **H — human-only** | qualified audit, all phases | yes — the trust ceiling |

Many criteria are **split**: part is machine-checkable (presence of an attribute),
part needs judgment (is the attribute's value meaningful). The **Primary** column is
the bucket that decides *conformance*; the **Split** column names the cheaper check
that still produces useful evidence. A criterion whose Primary is S or H cannot be
auto-passed — that's the whole point of separating detection from conformance.

## Level A

| SC | Name | Primary | Split / notes | Status in repo |
|---|---|---|---|---|
| 1.1.1 | Non-text Content | **S** | M detects *missing* alt/name; adequacy of the text is semantic | M-detect + AI alt-text fixers live |
| 1.2.1 | Audio-only / Video-only (Prerecorded) | **H** | M can flag media lacking an alternative; alternative *content* is human | detect-only |
| 1.2.2 | Captions (Prerecorded) | **H** | M flags missing caption track; caption accuracy is human | detect-only (`video-caption`) |
| 1.2.3 | Audio Description / Media Alt | **H** | M flags absence; content is human | detect-only |
| 1.3.1 | Info and Relationships | **M** | S for whether visual structure is *fully* conveyed; M covers lists, headings, table headers, labels, roles | broad M fixers live |
| 1.3.2 | Meaningful Sequence | **R** | DOM order vs. visual order needs render; H for ambiguous cases | not covered |
| 1.3.3 | Sensory Characteristics | **S** | "the round button on the right" — content meaning | detect-only |
| 1.4.1 | Use of Color | **H** | R can flag color-only link cues (partial, live: `link-in-text-block`); full check is human | partial M (`link-in-text-block`) |
| 1.4.2 | Audio Control | **M** | autoplay detection is deterministic | fixer live (`no-autoplay-audio`) |
| 2.1.1 | Keyboard | **R** | M covers `tabindex`, `scrollable-region-focusable`, image maps; full operability is runtime | partial M fixers live |
| 2.1.2 | No Keyboard Trap | **R** | pure runtime interaction | not covered |
| 2.1.4 | Character Key Shortcuts | **R** | detect single-key handlers at runtime; H for remap adequacy | not covered |
| 2.2.1 | Timing Adjustable | **M** | meta-refresh is M (fixer live); session timeouts are R/H | partial M (`meta-refresh`) |
| 2.2.2 | Pause, Stop, Hide | **M** | blink/marquee M (live); JS-driven motion is R | partial M (`blink`/`marquee`) |
| 2.3.1 | Three Flashes or Below Threshold | **H** | flash analysis of rendered animation; R-assisted, human-confirmed | detect-only |
| 2.4.1 | Bypass Blocks | **M** | skip-link / landmark presence is detectable | detect-only (`bypass`, `region`) |
| 2.4.2 | Page Titled | **M** | S for whether title is *descriptive*; presence is M | fixer live (`document-title`) |
| 2.4.3 | Focus Order | **R** | tab order vs. meaning needs render | partial M (`tabindex`) |
| 2.4.4 | Link Purpose (In Context) | **S** | M detects empty/generic link text; purpose is semantic | AI link-name fixers live |
| 2.5.1 | Pointer Gestures | **R** | detect multipoint/path gestures at runtime; H for alternative adequacy | not covered |
| 2.5.2 | Pointer Cancellation | **R** | runtime pointer-event behavior | not covered |
| 2.5.3 | Label in Name | **M** | visible label ⊆ accessible name is comparable programmatically; S when label is an image | not covered — **high-value M gap** |
| 2.5.4 | Motion Actuation | **R** | device-motion handlers at runtime; H for alternative | not covered |
| 3.1.1 | Language of Page | **M** | `html[lang]` presence + validity | fixers live (`html-has-lang`, `html-lang-valid`) |
| 3.2.1 | On Focus | **R** | context change on focus — runtime | not covered |
| 3.2.2 | On Input | **R** | context change on input — runtime | not covered |
| 3.2.6 | Consistent Help *(new in 2.2)* | **R** | help-mechanism location across pages; H for equivalence | not covered |
| 3.3.1 | Error Identification | **R** | errors surfaced in text at runtime; S for message adequacy | not covered |
| 3.3.2 | Labels or Instructions | **M** | M detects missing labels (live); S for instruction adequacy | fixers live (`label`, name fixers) |
| 3.3.7 | Redundant Entry *(new in 2.2)* | **R** | multi-step flow state — runtime | not covered |
| 4.1.2 | Name, Role, Value | **M** | the big automatable one: name/role/value are programmatic; name *quality* is S | broad ARIA + name fixers live |
| ~~4.1.1~~ | ~~Parsing~~ | **N/A** | **removed in WCAG 2.2** — always satisfied; no claim emitted | n/a |

## Level AA

| SC | Name | Primary | Split / notes | Status in repo |
|---|---|---|---|---|
| 1.2.4 | Captions (Live) | **H** | live media, human | detect-only |
| 1.2.5 | Audio Description (Prerecorded) | **H** | content, human | detect-only |
| 1.3.4 | Orientation | **R** | no orientation lock — check rendered/CSS at runtime | not covered |
| 1.3.5 | Identify Input Purpose | **M** | `autocomplete` token validity is M (live); choosing the *right* token is S | fixer live (`autocomplete-valid`) |
| 1.4.3 | Contrast (Minimum) | **M** | static computed colors M (live); overlaid/image/dynamic text is R | fixer live (`color-contrast`) |
| 1.4.4 | Resize Text | **R** | 200% zoom behavior — runtime | partial M (`meta-viewport`) |
| 1.4.5 | Images of Text | **S** | detecting text baked into images (OCR + judgment) | not covered |
| 1.4.10 | Reflow | **R** | 320px no horizontal scroll — runtime | not covered |
| 1.4.11 | Non-text Contrast | **R** | UI-component/graphics contrast on rendered pixels | not covered |
| 1.4.12 | Text Spacing | **R** | apply spacing overrides, check no clipping — runtime | not covered |
| 1.4.13 | Content on Hover or Focus | **R** | dismissable / hoverable / persistent — runtime | not covered |
| 2.4.5 | Multiple Ways | **R** | site-level navigation presence; H for equivalence | not covered |
| 2.4.6 | Headings and Labels | **M** | M detects missing/empty + order (live); S for descriptiveness | fixers live (`heading-order`, `empty-heading`) |
| 2.4.7 | Focus Visible | **R** | rendered focus indicator — runtime | not covered |
| 2.4.11 | Focus Not Obscured (Minimum) *(new in 2.2)* | **R** | sticky-header overlap of focused element — runtime | not covered |
| 2.5.7 | Dragging Movements *(new in 2.2)* | **R** | drag handlers + single-pointer alternative — runtime | not covered |
| 2.5.8 | Target Size (Minimum) *(new in 2.2)* | **R** | 24×24px rendered target size + spacing exception — runtime | not covered |
| 3.1.2 | Language of Parts | **M** | `lang` validity on parts is M; knowing a passage *changed* language is S | fixer live (`valid-lang`) |
| 3.2.3 | Consistent Navigation | **R** | cross-page nav consistency — runtime/multi-page | not covered |
| 3.2.4 | Consistent Identification | **S** | same function → same name across pages; judgment | not covered |
| 3.3.3 | Error Suggestion | **S** | suggesting a correction requires understanding intent | not covered |
| 3.3.4 | Error Prevention (Legal/Financial/Data) | **H** | reversible / checked / confirmed — process + human | not covered |
| 3.3.8 | Accessible Authentication (Minimum) *(new in 2.2)* | **R** | detect cognitive-function-test auth (captcha, memorized secret) at runtime; S for exception adequacy | not covered |
| 4.1.3 | Status Messages | **R** | `aria-live` / role announcement on dynamic change — runtime | not covered |

## Tally (55 criteria; 4.1.1 removed)

| Primary bucket | count | share | producer / phase |
|---|---|---|---|
| **M** machine-decidable | 13 | ~24% | deterministic, Phase 1 (live) |
| **R** runtime-observable | 24 | ~44% | sensor, Phase 2 |
| **S** semantic | 7 | ~13% | AI agent, Phase 3 |
| **H** human-only | 10 | ~18% | audit, all phases |
| **N/A** removed | 1 (4.1.1) | — | — |

**The strategic read:** the machine-decidable M bucket is ~24% of A+AA — that's the
ceiling of the current product, and it's nearly all shipped. The single biggest
untapped slice is **R (44%)** — the runtime sensor (Phase 2) roughly *doubles*
provable coverage and is a bigger unlock than the AI agent. This reorders nothing
in the plan (Phase 1 ledger still comes first, it's the spine), but it confirms
Phase 2 is the high-leverage producer, and it flags **2.5.3 Label in Name** as a
cheap M win the deterministic tier doesn't yet cover.

## Phase 2 / Phase 3 entry points (first criterion each)

- **Phase 2 sensor first slice:** **4.1.3 Status Messages** or **2.4.11 Focus Not
  Obscured** — both are purely observable (live-region announcement; focused-element
  overlap), both are common real failures, neither needs content judgment. The plan
  names SPA route-change announcement, which is 4.1.3 territory. Start there.
- **Phase 3 agent first slice:** **1.1.1 meaningful alt text** — already has the
  deterministic detector and an AI fixer to turn into an agent tool; the human-override
  rate on its proposals is the confidence signal the plan wants to measure.
- **Cheap M gap to close independently of the phases:** **2.5.3 Label in Name** —
  deterministic string-subset check (visible label ⊆ accessible name), fits the
  existing core fixer tier.

## Caveats

- Buckets are assigned for **conformance assertion**, not detection. Almost every
  criterion has *some* machine-detectable failure signal; the bucket reflects what's
  needed to responsibly assert `pass`.
- Split criteria produce evidence from the cheaper producer even when Primary is S/H
  (e.g. 1.1.1 gets an M `fail` claim for missing alt, and only needs the agent/human
  for adequacy). This is why the claim model separates `method` from `state`.
- WCAG version is pinned to **2.2**. A new version is a new matrix; claims carry
  `wcag_version` so old claims stay valid under their own version.
