#!/usr/bin/env bash
#
# Runs the COMMITTED github-action bundle the way a consumer's workflow runs it:
# an isolated checkout with no workspace node_modules on the module-resolution
# path, installing only what action.yml installs. This is the only test that
# exercises the real `node dist/index.js` scan — every other test either mocks
# @a11y-fixer/core or runs inside the workspace (where pnpm has already installed
# the plugins, so the createRequire() runtime deps resolve spuriously).
#
# Guards against the class of bug where ncc externalizes a createRequire()'d
# dependency that nothing installs at runtime (e.g. eslint-plugin-jsx-a11y).
#
# Needs a license signing key to mint a key (the ESLint scanner is only built
# after the license check passes). Provide it via LICENSE_SIGNING_KEY (PEM
# contents, e.g. a CI secret) or the default local path below. With no key the
# test soft-skips (exit 0) so forks without the secret aren't blocked.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIGNING_KEY_PATH="${LICENSE_SIGNING_KEY_PATH:-$HOME/a11y-fixer-LICENSE-SIGNING-KEY.pem}"

if [[ -n "${LICENSE_SIGNING_KEY:-}" ]]; then
  : # issue-license.mjs reads LICENSE_SIGNING_KEY from the environment
elif [[ -f "$SIGNING_KEY_PATH" ]]; then
  LICENSE_SIGNING_KEY="$(cat "$SIGNING_KEY_PATH")"
  export LICENSE_SIGNING_KEY
else
  echo "::notice::test-action-bundle: no signing key (set LICENSE_SIGNING_KEY or place one at $SIGNING_KEY_PATH); skipping."
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Mirror the action layout so createRequire() resolves up from dist/ into the
# action package's own node_modules — NOT the repo's workspace node_modules.
AD="$TMP/action/packages/github-action"
mkdir -p "$AD"
cp -R "$REPO_ROOT/packages/github-action/dist" "$AD/dist"
# Copy the real manifest too: a consumer's checkout has it, and it carries
# pnpm-only `workspace:*` deps that npm can't parse. Without this the deps
# install ran against an empty dir and silently dodged the EUNSUPPORTEDPROTOCOL
# bug that hit real consumers; install-action-runtime-deps.sh must cope with it.
cp "$REPO_ROOT/packages/github-action/package.json" "$AD/package.json"

# Guard the "createRequire is not a function" class: only the main index.js may
# call createRequire (core's ESLint scanner). A lazy chunk (NNN.index.js) doing
# so means ncc code-split a dynamic import and failed to bind the `node:module`
# ESM external there, so createRequire is undefined and the scan dies. Keeping
# puppeteer-core / @axe-core/puppeteer external (see install-action-runtime-deps.sh)
# avoids that split; this catches a regression without needing a browser.
BAD_CHUNKS="$(grep -lE '\(0,[A-Za-z_$]+\.createRequire\)\(import\.meta\.url\)' "$AD"/dist/*.index.js 2>/dev/null || true)"
if [[ -n "$BAD_CHUNKS" ]]; then
  echo "::error::lazy chunk references createRequire with an unbound node:module external (the 'createRequire is not a function' bug): $BAD_CHUNKS"
  exit 1
fi

echo "=== installing runtime deps (same script action.yml uses) ==="
bash "$REPO_ROOT/scripts/install-action-runtime-deps.sh" "$AD"

KEY="$(node "$REPO_ROOT/scripts/issue-license.mjs" --sub "ci@a11y-fixer.test" --days 1 --no-ledger 2>/dev/null)"
[[ -n "$KEY" ]] || { echo "::error::failed to mint a license key"; exit 1; }

mkdir -p "$TMP/src"
cat > "$TMP/src/App.jsx" <<'EOF'
export default function App() {
  return (<div><img src="logo.png" /><a href="/pricing"></a></div>);
}
EOF

echo "=== running committed bundle: check mode ==="
set +e
OUT="$(env "INPUT_LICENSE-KEY=$KEY" INPUT_DIR="$TMP/src" INPUT_MODE=check \
  node "$AD/dist/index.js" 2>&1)"
CODE=$?
set -e
echo "$OUT"

if grep -q "Cannot find module" <<<"$OUT"; then
  echo "::error::bundle is missing a runtime dependency that core loads via createRequire() — add it to scripts/install-action-runtime-deps.sh"
  exit 1
fi
if [[ "$CODE" -eq 0 ]]; then
  echo "::error::check mode should fail on the broken fixture but exited 0"
  exit 1
fi
grep -q "WCAG 1.1.1" <<<"$OUT" || { echo "::error::expected a WCAG 1.1.1 (img alt) violation in the output"; exit 1; }

echo "✓ committed bundle scans correctly with runtime deps installed"

# --- GitHub-native reporting path (report.ts) is bundled and reachable ---------
# Guards the class of bug where report.ts (Check Run + annotations + sticky
# comment) fails to bundle or throws on load. We give the bundle a github-token
# and a public-repo event context so reportToGitHub() runs. Offline, the octokit
# call fails and the code warns + falls back to inline annotations — exactly the
# best-effort path. The proof is that we reach that warning rather than a
# "Cannot find module ./report.js": report.ts executed inside the real bundle.
cat > "$TMP/event.json" <<'EOF'
{ "repository": { "private": false } }
EOF
# No license key here: a public-repo event payload runs the free tier, which also
# exercises repoIsPublic() reading the event payload inside the bundle.
echo "=== running committed bundle: check mode + reporting (public tier, offline best-effort) ==="
set +e
ROUT="$(env INPUT_DIR="$TMP/src" INPUT_MODE=check \
  "INPUT_GITHUB-TOKEN=placeholder-not-a-real-token" \
  GITHUB_REPOSITORY="a11y-fixer/bundle-test" GITHUB_SHA="0000000000000000000000000000000000000000" \
  GITHUB_EVENT_NAME=push GITHUB_EVENT_PATH="$TMP/event.json" \
  node "$AD/dist/index.js" 2>&1)"
set -e
echo "$ROUT"

if grep -q "Cannot find module" <<<"$ROUT"; then
  echo "::error::reporting path missing a bundled module (report.ts not bundled?) — check the ncc build"
  exit 1
fi
# The free public-repo tier line proves repoIsPublic() read the event payload,
# and the check-run warning proves postCheckRun() in report.ts ran end to end.
grep -q "free public-repo tier" <<<"$ROUT" \
  || { echo "::error::expected the public-repo tier log — repoIsPublic() did not read the event payload in the bundle"; exit 1; }
grep -q "a11y-fixer check run" <<<"$ROUT" \
  || { echo "::error::expected the Check Run reporting path (report.ts) to run in the bundle"; exit 1; }

echo "✓ committed bundle runs the GitHub-native reporting path (report.ts)"
