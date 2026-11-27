/**
 * Validates an AI-suggested accessible name before it is written into source.
 *
 * The name a model returns is usually a clean short phrase, but a context-poor
 * element — e.g. an icon-only `<button>` whose only child is an empty `<svg>` —
 * can make the model refuse or "think out loud", returning multi-line
 * explanatory prose that would be nonsense as an `aria-label`. Writing that
 * verbatim is worse than not fixing: it ships a garbage label *and* marks the
 * violation resolved. This returns the cleaned name, or `null` when the output
 * does not look like a usable accessible name, so the caller can human-flag
 * instead of inserting it.
 */
export function sanitizeAccessibleName(raw: string): string | null {
  const name = raw.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!name) return null;

  // A real aria-label is a single short phrase. Reject multi-line output and
  // anything implausibly long for a control name.
  if (/[\r\n]/.test(name)) return null;
  if (name.length > 80) return null;

  // Reject echoed JSX/template expressions: a model shown `<button>{label}` may
  // answer e.g. "Toggle {key} state". Written literally that ships the braces as
  // visible label text (an aria-label is a plain string, not JSX), so human-flag
  // instead of inserting unresolved interpolation.
  if (/[{}]/.test(name)) return null;

  // Reject the model's refusal / meta-commentary tells. These phrases do not
  // occur in legitimate short control labels but dominate "I need more
  // context…"-style non-answers.
  if (
    /\b(i need|i cannot|i can'?t|unable to|i'?m sorry|sorry|unfortunately|as an ai|aria-label|context clues?|no visual|based on (typical|the)|for example|i would|please provide|here (are|is))\b/i.test(
      name,
    )
  ) {
    return null;
  }

  return name;
}
