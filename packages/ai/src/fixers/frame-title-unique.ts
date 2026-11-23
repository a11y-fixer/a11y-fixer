import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';

/** Escapes a string for use inside a double-quoted HTML/JSX attribute. */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Sets the `<iframe>`'s `title` on `line` to `title`, replacing an existing
 * `title` value or adding the attribute when absent. Returns the rewritten line,
 * or `null` when there's no `<iframe>` opening tag on the line.
 */
export function setIframeTitleOnLine(line: string, title: string): string | null {
  if (!/<iframe\b/i.test(line)) return null;
  const escaped = escapeAttr(title);

  const existing = /(\btitle\s*=\s*)(["'])[\s\S]*?\2/i;
  if (existing.test(line)) {
    return line.replace(existing, `$1$2${escaped}$2`);
  }
  return line.replace(/<iframe\b/i, `<iframe title="${escaped}"`);
}

/**
 * Fixes axe `frame-title-unique` (WCAG 4.1.2): multiple `<iframe>`s sharing the
 * same (or an empty) `title`, so assistive tech can't tell them apart. The repair
 * is to give this frame a distinct AI-generated title inferred from its `src` and
 * surrounding markup, replacing the duplicate value. A frame with no source
 * location, or whose `<iframe>` isn't on the recorded line, is human-flagged.
 */
export class FrameTitleUniqueFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'ai-assisted' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'frame-title-unique';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate a distinct iframe title');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply a distinct title');
    }

    const source = await readSourceLine(node.sourceFile, node.sourceLine);
    const markup = source?.line ?? node.html;
    const context = source?.context
      ? `Iframe with a duplicate title — give it a distinct, descriptive title: ${source.line}\nSurrounding code:\n${source.context}`
      : `Iframe with a duplicate title — give it a distinct, descriptive title: ${node.html}`;

    let name: string;
    try {
      name = (await this.aiProvider.suggestAccessibleName(markup, context)).trim();
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (name.length === 0) {
      return this.humanFlag(violation, 'AI returned an empty iframe title');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested title "${name}" — could not read source file`);
    }

    const lines = content.split('\n');
    const idx = node.sourceLine - 1;
    const original = lines[idx];
    if (original === undefined) {
      return this.humanFlag(violation, `Suggested title "${name}" — recorded line is out of range`);
    }

    const updated = setIframeTitleOnLine(original, name);
    if (updated === null) {
      return this.humanFlag(violation, `Suggested title "${name}" — no <iframe> on the recorded line`);
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested title "${name}" — could not write the file`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Set a distinct AI-generated iframe title: "${name}"`,
      before: markup,
      after: updated.trim(),
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
    };
  }

  private humanFlag(violation: A11yViolation, note: string): FixResult {
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before: violation.nodes[0]?.html ?? '',
      humanNote: note,
    };
  }
}
