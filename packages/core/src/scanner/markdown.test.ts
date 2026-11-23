import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanContent, scanMarkdown, collectMarkdownHeadings } from './markdown.js';

const FILE = '/repo/doc.md';
const ids = (c: string) => scanContent(FILE, c).map(v => v.id);

describe('scanContent — image alt (1.1.1)', () => {
  it('flags an inline image with empty alt', () => {
    expect(ids('![](logo.png)')).toEqual(['md-image-alt']);
  });
  it('flags whitespace-only alt', () => {
    expect(ids('![   ](logo.png)')).toEqual(['md-image-alt']);
  });
  it('does not flag an image that has alt text', () => {
    expect(ids('![Company logo](logo.png)')).toEqual([]);
  });
  it('flags a reference-style image with empty alt', () => {
    expect(ids('![][logo]\n\n[logo]: /logo.png')).toContain('md-image-alt');
  });
  it('flags a raw <img> with no alt', () => {
    expect(ids('text <img src="x.png"> more')).toEqual(['md-html-img-alt']);
  });
  it('does not flag a raw <img> that has alt', () => {
    expect(ids('text <img src="x.png" alt="A chart"> more')).toEqual([]);
  });
});

describe('scanContent — link text (2.4.4)', () => {
  it('flags generic inline link text', () => {
    expect(ids('Read [here](https://x.com).')).toEqual(['md-link-text']);
  });
  it('flags empty link text', () => {
    expect(ids('[](https://x.com)')).toEqual(['md-link-text']);
  });
  it('flags a bare URL used as its own text', () => {
    expect(ids('[https://x.com](https://x.com)')).toEqual(['md-link-text']);
  });
  it('flags generic reference-style link text', () => {
    expect(ids('[click here][ref]\n\n[ref]: https://x.com')).toContain('md-link-text');
  });
  it('does not flag descriptive link text', () => {
    expect(ids('[the onboarding guide](https://x.com)')).toEqual([]);
  });
  it('does not flag an autolink', () => {
    expect(ids('Visit <https://example.com> today.')).toEqual([]);
  });
});

describe('scanContent — heading order (2.4.6)', () => {
  it('flags a skipped heading level', () => {
    expect(ids('# Title\n\n### Skipped')).toEqual(['md-heading-order']);
  });
  it('does not flag consecutive levels', () => {
    expect(ids('# Title\n\n## Section\n\n### Sub')).toEqual([]);
  });
  it('does not flag going back up', () => {
    expect(ids('# A\n\n## B\n\n# C')).toEqual([]);
  });
});

describe('scanContent — table headers (1.3.1)', () => {
  it('flags a table with an empty header cell', () => {
    expect(ids('| | Status |\n| --- | --- |\n| a | ok |')).toEqual(['md-table-header']);
  });
  it('does not flag a fully-labelled header', () => {
    expect(ids('| Name | Status |\n| --- | --- |\n| a | ok |')).toEqual([]);
  });
});

describe('scanContent — code fences are not prose', () => {
  it('does not flag a generic link inside a fenced code block', () => {
    expect(ids('```\nsee [here](https://x.com)\n```')).toEqual([]);
  });
  it('does not flag an image inside inline code', () => {
    expect(ids('Use `![](x.png)` syntax.')).toEqual([]);
  });
});

describe('scanContent — positions', () => {
  it('records the 1-indexed line and column of the construct', () => {
    const v = scanContent(FILE, 'xx ![](a.png)')[0];
    expect(v.nodes[0].sourceLine).toBe(1);
    expect(v.nodes[0].sourceColumn).toBe(4); // points at the `!`
  });
  it('emits multiple same-line constructs rightmost-first', () => {
    const vs = scanContent(FILE, '[here](u) and ![](a.png)');
    expect(vs.map(v => v.nodes[0].sourceColumn)).toEqual([15, 1]);
  });
});

describe('scanContent — MDX (.mdx)', () => {
  const MDX = '/repo/doc.mdx';
  const mdxIds = (c: string) => scanContent(MDX, c).map(v => v.id);

  it('parses MDX syntax (imports/JSX) without choking, flagging native markdown', () => {
    const doc = "import Chart from './Chart'\n\n![](logo.png)\n\n<Chart/>";
    expect(mdxIds(doc)).toEqual(['md-image-alt']);
  });
  it('flags a JSX <img> with no alt', () => {
    expect(mdxIds('<img src="logo.png" />')).toEqual(['md-html-img-alt']);
  });
  it('flags a JSX <img> with empty alt', () => {
    expect(mdxIds('<img src="logo.png" alt="" />')).toEqual(['md-html-img-alt']);
  });
  it('does not flag a JSX <img> that has alt text', () => {
    expect(mdxIds('<img src="logo.png" alt="A logo" />')).toEqual([]);
  });
  it('does not flag a JSX <img> whose alt is a dynamic expression', () => {
    expect(mdxIds('<img src="logo.png" alt={caption} />')).toEqual([]);
  });
  it('still covers native markdown links in MDX', () => {
    expect(mdxIds('Read [here](https://x.com) now')).toEqual(['md-link-text']);
  });
});

describe('collectMarkdownHeadings', () => {
  it('returns levels and lines in document order', () => {
    expect(collectMarkdownHeadings('# A\n\n### B')).toEqual([
      { level: 1, line: 1, column: 1 },
      { level: 3, line: 3, column: 1 },
    ]);
  });
});

describe('scanMarkdown — file walk', () => {
  it('scans .md/.markdown files and skips node_modules/.git', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'md-scan-'));
    try {
      await writeFile(path.join(dir, 'a.md'), '![](x.png)');
      await writeFile(path.join(dir, 'b.markdown'), 'See [here](https://x.com)');
      await writeFile(path.join(dir, 'c.txt'), '![](ignored.png)');
      const vs = await scanMarkdown(dir);
      expect(vs.map(v => v.id).sort()).toEqual(['md-image-alt', 'md-link-text']);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
