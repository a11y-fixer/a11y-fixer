# Security Policy

## Supported versions

a11y-fixer-pro is distributed as a GitHub Action consumed by git tag. Security
fixes land on `main` and are published by moving the floating `v1` tag (and
cutting a GitHub Release). Only the latest `v1` release is supported; users are
encouraged to pin to a full commit SHA for tamper-evidence (see the README).

| Version        | Supported |
| -------------- | --------- |
| `v1` (latest)  | ✅        |
| older tags     | ❌        |

## Reporting a vulnerability

**Do not open a public issue for security reports.**

Report privately via GitHub's **"Report a vulnerability"** button on the
repository's **Security** tab (GitHub Private Vulnerability Reporting), or email
**security@a11y-fixer.com**.

Please include:

- A description of the issue and its impact.
- Steps to reproduce (a minimal repo or workflow is ideal).
- Affected version / commit SHA.

### What to expect

- **Acknowledgement:** within 3 business days.
- **Triage & severity assessment:** within 7 business days.
- **Fix or mitigation plan:** communicated after triage; timeline depends on
  severity. Critical issues affecting the license signing path or secret
  handling are prioritized.
- We will keep you updated through resolution and credit you in the release
  notes unless you prefer to remain anonymous.

## Safe harbor

We will not pursue or support legal action against researchers who, in good
faith:

- Make a reasonable effort to avoid privacy violations, data destruction, and
  service disruption.
- Only interact with accounts they own or have explicit permission to test.
- Report promptly and give us reasonable time to remediate before public
  disclosure.
- Do not exfiltrate customer data or exploit an issue beyond what is needed to
  demonstrate it.

## Scope

In scope: this repository (the GitHub Action and its bundled packages).

Out of scope here: the `a11y-fixer.com` website (reported to the same contact,
but maintained in a separate repository) and third-party services the Action
integrates with (Anthropic, GitHub) — report those to their respective vendors.
