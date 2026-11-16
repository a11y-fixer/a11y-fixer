# Data flow & subprocessors

Audit-support document (SOC2 evidence for data handling and vendor management).
It describes what data moves where when the Action runs, and the third parties
involved.

## Trust-boundary summary

a11y-fixer-pro runs **entirely inside the customer's own CI runner**. It has no
hosted backend, database, or API that we operate. The only data that leaves the
customer's trust boundary is sent to **Anthropic**, under the **customer's own
API key**, and only when AI fixing is enabled. There is **no telemetry,
analytics, or phone-home** — license verification is fully offline.

## Data-flow diagram

```
┌────────────────────────── Customer trust boundary ──────────────────────────┐
│                                                                              │
│   Customer repo / CI runner (GitHub Actions)                                 │
│                                                                              │
│   source code / HTML / page screenshots                                      │
│        │                                                                     │
│        ├─ axe-core + puppeteer scan (local, in-runner)                       │
│        │                                                                     │
│        ├─ AI fix generation ───────────────────────────┐  (only if          │
│        │                                                │   anthropic-api-key │
│        │                                                ▼   is supplied)      │
│        │                                      ┌──────────────────┐           │
│        │                                      │  Anthropic API   │  ← vendor  │
│        │   code context + base64 PNG  ───────▶│ claude-haiku-4-5 │  (egress)  │
│        │                                      └──────────────────┘           │
│        │                                                │                     │
│        │                           generated alt/link/aria text              │
│        │                                                │                     │
│        ▼                                                ▼                     │
│   Persistence — all stays in the customer's boundary:                        │
│     • AI cache file (optional)   packages/ai/src/provider/caching.ts         │
│     • learning store .a11y-fixer/learning.jsonl   learning-store.ts          │
│     • fix output → PR in the customer's own repo   index.ts (maybeOpenPR)    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## What data moves, and where

| Data                                   | Destination                     | Notes |
| -------------------------------------- | ------------------------------- | ----- |
| Source/HTML context + page screenshots | **Anthropic API** (`claude-haiku-4-5`) | Only when `anthropic-api-key` is set. See `packages/ai/src/provider/anthropic.ts`. Customer's own key. |
| Accessibility findings                 | Stays in-runner                 | axe-core + puppeteer scan, local. |
| AI results (cache)                     | Customer workspace / CI cache   | `sha256(request) → result` JSON. `packages/ai/src/provider/caching.ts`. Optional (`cache-file`). |
| Accepted fix values (learning)         | Customer's own repo             | `.a11y-fixer/learning.jsonl`, few-shot house-style examples. `packages/github-action/src/learning-store.ts`. On by default; `learning: off` disables. |
| Generated fixes                        | PR in customer's own repo       | `maybeOpenPR` in `packages/github-action/src/index.ts`. |
| Session cookies (auth scans)           | Injected into the page in-runner | `packages/github-action/src/cookies-scanner.ts`; masked in logs; not persisted. |

**No data is persisted to any infrastructure the maintainer operates.**

## Subprocessors / third-party services

| Vendor   | Role                                              | Customer data involved | Vendor SOC2 to track |
| -------- | ------------------------------------------------- | ---------------------- | -------------------- |
| Anthropic| AI generation (alt/link/aria text)                | Source context + screenshots, under customer's key | Yes — obtain Anthropic's report |
| GitHub   | Code hosting, Actions runner, PRs, secrets        | All (customer's own platform) | Yes |
| Vercel   | Hosts the separate `a11y-fixer.com` site          | N/A to this repo; relevant to the site | Yes (for the site's audit) |
| npm      | Distribution of `@a11y-fixer/core` / `/cli`       | None (public packages) | N/A |

> **Vendor management:** collect and retain each listed vendor's current SOC2
> (or equivalent) report, and review annually. The `a11y-fixer.com` site and its
> Vercel/payment/datastore subprocessors are **out of scope for this repo** and
> require their own data-flow documentation.
