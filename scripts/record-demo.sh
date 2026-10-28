#!/usr/bin/env bash
# Records a terminal demo of a11y-fixer using asciinema.
# If asciinema isn't installed, falls back to running commands and saving output.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="node $ROOT/packages/cli/dist/index.js"
FIXTURES="$ROOT/tests/fixtures"
OUT_DIR="$ROOT/docs"
CAST="$OUT_DIR/demo.cast"

mkdir -p "$OUT_DIR"

# Build first
echo "==> Building..."
cd "$ROOT" && pnpm build

echo ""
echo "==> Build complete. Starting demo..."
echo ""

# ROOT is injected as an env var when this inner script is executed.
DEMO_SCRIPT=$(cat <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
CLI="node $ROOT/packages/cli/dist/index.js"
FIXTURES="$ROOT/tests/fixtures"

echo "--- Broken fixture (HTML) ---"
cat "$FIXTURES/broken.html"
echo ""
sleep 1

echo "--- Broken fixture (React) ---"
cat "$FIXTURES/BrokenComponent.tsx"
echo ""
sleep 1

echo "--- Scanning for violations ---"
$CLI scan "$FIXTURES"
sleep 1

echo ""
echo "--- CI check (exits 1 on violations) ---"
$CLI check "$FIXTURES" || echo "Exit code: $?"
sleep 1

echo ""
echo "--- Dry run: preview fixes without applying ---"
$CLI fix --dry-run "$FIXTURES"
sleep 1

echo ""
echo "--- Applying fixes to a temp copy ---"
TMP=$(mktemp -d)
cp -r "$FIXTURES/." "$TMP/"
$CLI fix "$TMP"
sleep 1

echo ""
echo "--- Re-checking after fix ---"
$CLI check "$TMP" || echo "Exit code: $?"
rm -rf "$TMP"
SCRIPT
)

TMPSCRIPT=$(mktemp /tmp/a11y-demo-XXXXXX.sh)
echo "$DEMO_SCRIPT" > "$TMPSCRIPT"
chmod +x "$TMPSCRIPT"

if command -v asciinema &>/dev/null; then
  echo "==> Recording with asciinema → $CAST"
  ROOT="$ROOT" asciinema rec --command "ROOT=$ROOT bash $TMPSCRIPT" --title "a11y-fixer demo" "$CAST"
  rm -f "$TMPSCRIPT"

  if command -v svg-term &>/dev/null; then
    echo "==> Exporting to SVG → $OUT_DIR/demo.svg"
    svg-term --in "$CAST" --out "$OUT_DIR/demo.svg" --window --width 100 --height 40
    echo "==> Done! Embed in README with: ![Demo](docs/demo.svg)"
  else
    echo "==> svg-term not found. Install with: npm install -g svg-term-cli"
    echo "==> Cast saved to: $CAST"
    echo "==> Run: svg-term --in $CAST --out docs/demo.svg --window"
  fi
else
  echo "==> asciinema not found. Install with: brew install asciinema"
  echo "==> Running demo now and saving output to $OUT_DIR/demo.txt"
  echo ""
  ROOT="$ROOT" bash "$TMPSCRIPT" 2>&1 | tee "$OUT_DIR/demo.txt"
  rm -f "$TMPSCRIPT"
  echo ""
  echo "==> Output saved to $OUT_DIR/demo.txt"
fi
