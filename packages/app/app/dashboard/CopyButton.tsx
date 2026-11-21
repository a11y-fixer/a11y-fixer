'use client';

// Minimal copy-to-clipboard button for the setup panel. Client component so the
// license key / workflow YAML are one click to copy. Falls back silently if the
// Clipboard API is unavailable (the text is still selectable in the page).
import { useState } from 'react';

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op; text is selectable.
    }
  }

  return (
    <button type="button" onClick={copy}>
      {copied ? 'Copied ✓' : label}
    </button>
  );
}
