import type { SourceMapper, SourceLocation } from './index.js';
import type { A11yNode } from '../detector/index.js';
import { readFile } from 'node:fs/promises';
import { collectFiles } from './walk-files.js';

interface SourceAttr {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

export class ReactJSXMapper implements SourceMapper {
  constructor(private readonly rootDir: string) {}

  async locate(node: A11yNode): Promise<SourceLocation | null> {
    const fromSource = tryParseSourceAttr(node.html);
    if (fromSource) {
      return {
        file: fromSource.fileName,
        line: fromSource.lineNumber,
        column: fromSource.columnNumber,
      };
    }

    return this.fingerprintSearch(node);
  }

  private async fingerprintSearch(node: A11yNode): Promise<SourceLocation | null> {
    const tagMatch = node.html.match(/^<(\w+)/);
    if (!tagMatch) return null;
    const tag = tagMatch[1];

    const textMatch = node.html.match(/>([^<]{3,50})</);
    const text = textMatch?.[1]?.trim();

    const jsxFiles = await collectFiles(this.rootDir, /\.(tsx|jsx)$/);

    for (const file of jsxFiles) {
      const content = await readFile(file, 'utf8').catch(() => null);
      if (!content) continue;

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const hasTag = line.includes(`<${tag}`) || line.includes(`<${capitalize(tag)}`);
        if (!hasTag) continue;
        if (text && !content.includes(text)) continue;

        return { file, line: i + 1, column: 1 };
      }
    }

    return null;
  }
}

function tryParseSourceAttr(html: string): SourceAttr | null {
  // __source props injected by @babel/plugin-transform-react-jsx-source appear
  // as data attributes in the rendered DOM: data-__source="file:line:col"
  const match = html.match(/data-__source="([^"]+)"/);
  if (!match) return null;

  const parts = match[1].split(':');
  if (parts.length < 2) return null;

  const col = parts.length >= 3 ? parseInt(parts[parts.length - 1], 10) : 1;
  const line = parseInt(parts[parts.length - 2], 10);
  const fileName = parts.slice(0, parts.length - 2).join(':');

  if (!fileName || isNaN(line)) return null;
  return { fileName, lineNumber: line, columnNumber: col };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
