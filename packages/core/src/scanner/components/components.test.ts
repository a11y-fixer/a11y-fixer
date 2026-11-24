import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanComponents, maskNonTemplate } from './index.js';
import { extractRanges } from './extract.js';
import { maskRanges } from './mask.js';
import type { FrameworkSpec } from './spec.js';
import type { Detector, DetectorOptions, A11yViolation } from '../../detector/index.js';

/** Masks `content` with a synthetic spec — exercises the generic primitives directly. */
async function maskWith(content: string, spec: FrameworkSpec): Promise<string | null> {
  const ranges = await extractRanges(content, spec);
  return ranges === null ? null : maskRanges(content, ranges);
}

/**
 * A detector that returns one canned `image-alt` violation for a `logo.png`
 * image. The runner locates it in the markup we actually pass, so if masking
 * failed to remove a decoy `<img>` the located line would move — that's what the
 * tests assert on.
 */
function stubImgDetector(): Detector {
  return {
    async scan(_opts: DetectorOptions): Promise<A11yViolation[]> {
      return [{
        id: 'image-alt',
        wcagId: '1.1.1',
        impact: 'critical',
        description: 'Images must have alternate text',
        helpUrl: '',
        nodes: [{ html: '<img src="logo.png">', target: ['img'], failureSummary: '' }],
      }];
    },
  };
}

describe('maskNonTemplate', () => {
  it('Vue: keeps template markup, blanks <script>/<style> (line numbers preserved)', async () => {
    const vue = [
      '<script setup>',
      'const img = "<img src=\\"logo.png\\">"; // decoy in script',
      '</script>',
      '',
      '<template>',
      '  <img src="logo.png">',
      '</template>',
      '',
      '<style>.x { color: red }</style>',
    ].join('\n');
    const masked = await maskNonTemplate('/c/App.vue', vue);
    expect(masked).not.toBeNull();
    const lines = masked!.split('\n');
    // Same number of lines — positions preserved.
    expect(lines).toHaveLength(9);
    // The only surviving <img> is the template one, on its original line (6).
    expect(lines[5]).toContain('<img src="logo.png">');
    expect(lines[1]).not.toContain('<img');
    expect(masked).not.toContain('<script');
    expect(masked).not.toContain('<template');
  });

  it('Vue: returns null when there is no <template> block', async () => {
    expect(await maskNonTemplate('/c/util.vue', '<script>export const x = 1</script>')).toBeNull();
  });

  it('Svelte: blanks <script> and <style>, keeps the rest in place', async () => {
    const svelte = '<script>let img = "<img src=x>";</script>\n<img src="logo.png">\n<style>a{}</style>';
    const masked = await maskNonTemplate('/c/App.svelte', svelte);
    const lines = masked!.split('\n');
    expect(lines[0]).not.toContain('<img');
    expect(lines[1]).toContain('<img src="logo.png">');
    expect(masked).not.toContain('<style>a{}');
  });

  it('Svelte: blanks a <script> closed with whitespace before > (</script >)', async () => {
    const svelte = '<script>const img = "<img src=decoy>";</script >\n<img src="logo.png">';
    const masked = await maskNonTemplate('/c/App.svelte', svelte);
    expect(masked).not.toContain('decoy');
    expect(masked!.split('\n')[1]).toContain('<img src="logo.png">');
  });

  it('Astro: blanks the leading --- frontmatter fence only', async () => {
    const astro = '---\nconst x = "<img src=decoy>";\n---\n<img src="logo.png">';
    const masked = await maskNonTemplate('/c/App.astro', astro);
    const lines = masked!.split('\n');
    expect(lines[1]).not.toContain('<img');
    expect(lines[3]).toContain('<img src="logo.png">');
  });

  it('Handlebars: passes HTML through unchanged; {{…}} are inert', async () => {
    const hbs = '{{! comment }}\n{{#if show}}<img src="logo.png">{{/if}}\n<a href="{{url}}">{{label}}</a>';
    const masked = await maskNonTemplate('/c/card.hbs', hbs);
    expect(masked).toBe(hbs); // nothing to blank
  });

  it('Blade: blanks <?php ?>, @php…@endphp and {{-- --}}; keeps {{ $x }} markup', async () => {
    const blade = [
      "<?php $a = '<img src=decoy1>'; ?>",
      "@php $b = '<img src=decoy2>'; @endphp",
      '{{-- <img src=decoy3> --}}',
      '<img src="logo.png" alt="{{ $alt }}">',
    ].join('\n');
    const masked = await maskNonTemplate('/c/card.blade.php', blade);
    expect(masked).not.toContain('decoy1');
    expect(masked).not.toContain('decoy2');
    expect(masked).not.toContain('decoy3');
    // Real markup survives on its original line, with the {{ $x }} echo inert.
    expect(masked!.split('\n')[3]).toContain('<img src="logo.png"');
    // Line count preserved — offsets map 1:1.
    expect(masked!.split('\n')).toHaveLength(4);
  });

  it('Blade: an unterminated <?php runs to EOF without throwing', async () => {
    const blade = '<img src="logo.png">\n<?php $x = 1';
    const masked = await maskNonTemplate('/c/x.blade.php', blade);
    expect(masked!.split('\n')[0]).toContain('<img src="logo.png">');
    expect(masked).not.toContain('$x = 1');
  });

  it('Angular external template (.component.html): scanned as-is', async () => {
    const html = '<div>\n  <img src="logo.png">\n</div>';
    const masked = await maskNonTemplate('/c/app.component.html', html);
    expect(masked).toBe(html);
  });

  it('Angular inline (.component.ts): keeps the template: literal, blanks the rest', async () => {
    const ts = [
      "import { Component } from '@angular/core';",
      "const decoy = '<img src=decoy>';",
      '@Component({',
      '  selector: "app-root",',
      '  template: `',
      '    <img src="logo.png">',
      '  `,',
      '})',
      'export class AppComponent {}',
    ].join('\n');
    const masked = await maskNonTemplate('/c/app.component.ts', ts);
    expect(masked).not.toContain('decoy');
    expect(masked!.split('\n')[5]).toContain('<img src="logo.png">');
    expect(masked!.split('\n')).toHaveLength(9);
  });

  it('Angular inline: returns null for a templateUrl component (no inline template)', async () => {
    const ts = "@Component({ templateUrl: './app.component.html' })\nexport class AppComponent {}";
    expect(await maskNonTemplate('/c/app.component.ts', ts)).toBeNull();
  });

  // VALUE CARD
  // Behavior: Blade raw-island opener `<?=` (the short-echo alias of `<?php`,
  //   sharing the `?>` closer) is blanked like a full PHP island.
  // Gap: the existing Blade test only exercises `<?php`, `@php`, `{{--`; the
  //   `<?=` alias branch in extractBlade's earliest-opener scan had no assertion.
  //   A regression dropping alias support would ship silently.
  // Oracle: decoy markup inside `<?= ... ?>` must not survive; real markup does.
  it('Blade: blanks the <?= short-echo alias (shares the ?> closer)', async () => {
    const blade = '<?= $x = "<img src=decoyEcho>" ?>\n<img src="logo.png">';
    const masked = await maskNonTemplate('/c/echo.blade.php', blade);
    expect(masked).not.toContain('decoyEcho');
    expect(masked!.split('\n')[1]).toContain('<img src="logo.png">');
    // Offsets preserved: two lines in, two lines out.
    expect(masked!.split('\n')).toHaveLength(2);
  });

  // VALUE CARD
  // Behavior: an Angular inline `template:` may use a single- or double-quoted
  //   string literal, not only a backtick literal; its interior is kept.
  // Gap: the inline test used only a backtick literal, so the `'`/`"` arms of
  //   extractAngularInline's quote check were unexercised. Narrowing acceptance
  //   to backticks only would regress single-line template components undetected.
  // Oracle: a decoy outside the quoted template is blanked; the template markup
  //   survives on its original line.
  it("Angular inline: keeps a double-quoted template: literal, blanks the rest", async () => {
    const ts = [
      "const decoy = '<img src=decoy>';",
      '@Component({ template: "<img src=\\"logo.png\\">" })',
      'export class AppComponent {}',
    ].join('\n');
    const masked = await maskNonTemplate('/c/inline.component.ts', ts);
    expect(masked).not.toContain('decoy');
    expect(masked!.split('\n')[1]).toContain('<img src=\\"logo.png\\">');
    expect(masked!.split('\n')).toHaveLength(3);
  });

  // VALUE CARD
  // Behavior: an unterminated inline `template:` literal is ambiguous, so the
  //   extractor returns null (skip the file) rather than masking to EOF.
  // Gap: findStringEnd's -1 → null path (unterminated literal) had no test; a
  //   regression that fell through to a partial range would corrupt offsets.
  // Oracle: maskNonTemplate returns null.
  it('Angular inline: returns null when the template: literal is unterminated', async () => {
    const ts = '@Component({ template: `<img src="logo.png">\nexport class AppComponent {}';
    expect(await maskNonTemplate('/c/broken.component.ts', ts)).toBeNull();
  });

  // VALUE CARD
  // Behavior: extractAngularInline anchors on `@Component(`, so a decoy string that
  //   itself contains `template: '…'` BEFORE the decorator cannot capture the match.
  // Gap: the extractor matched the first `template:` anywhere; a decoy like
  //   `const help = "template: 'ok'";` before the real decorator blanked the real
  //   template and scanned the decoy (wrong region, silent false negative).
  // Oracle: the real decorator template survives; the decoy interior does not.
  it('Angular inline: a decoy template: string before @Component does not win', async () => {
    const ts = [
      'const help = "template: \'decoyText\'";',
      '@Component({',
      '  template: `',
      '    <img src="real.png">',
      '  `,',
      '})',
      'export class AppComponent {}',
    ].join('\n');
    const masked = await maskNonTemplate('/c/app.component.ts', ts);
    expect(masked).not.toContain('decoyText');
    expect(masked!.split('\n')[3]).toContain('<img src="real.png">');
    expect(masked!.split('\n')).toHaveLength(7);
  });

  it('Angular inline: returns null when there is no @Component decorator', async () => {
    const ts = 'export const cfg = { template: `<img src=x>` };';
    expect(await maskNonTemplate('/c/not-a.component.ts', ts)).toBeNull();
  });

  // VALUE CARD
  // Behavior: the template: search is bounded to the @Component(...) argument object,
  //   so a decoy template:"…" string in the class body AFTER the decorator does not
  //   win — a templateUrl-only component returns null rather than scanning the decoy.
  // Gap: anchoring only skipped decoys BEFORE the decorator; a class-field string
  //   like `msg = 'template:"<img src=bad>"'` after it still captured the match,
  //   fabricating findings and risking a fixer editing a string literal.
  // Oracle: a templateUrl component with a post-decorator template: decoy → null.
  it('Angular inline: a decoy template: string after the decorator does not win', async () => {
    const ts = [
      "@Component({ templateUrl: './x.component.html' })",
      "export class C { msg = 'template:\"<img src=bad>\"'; }",
    ].join('\n');
    expect(await maskNonTemplate('/c/x.component.ts', ts)).toBeNull();
  });

  it('Angular inline: a paren inside an earlier decorator string does not drop the template', async () => {
    // `)` inside the styles string must not close the decorator-args span early.
    const ts = '@Component({ styles: [\'.s::after{content:")"}\'], template: \'<img src="logo.png">\' })\nexport class C {}';
    const masked = await maskNonTemplate('/c/styled.component.ts', ts);
    expect(masked).not.toBeNull();
    expect(masked!).toContain('<img src="logo.png">');
    expect(masked).not.toContain('content:');
  });

  // VALUE CARD
  // Behavior: Blade's inline `@php(expr)` directive (no `@endphp`) is closed at its
  //   matching `)`, so elements after it are still scanned.
  // Gap: the old `{open:'@php',close:'@endphp'}` island found no closer for the
  //   inline form and blanked to EOF, silently dropping every later element — a
  //   false negative on valid, common Laravel syntax.
  // Oracle: an <img> missing alt AFTER `@php($x=1)` is still present post-mask.
  it('Blade: inline @php(...) does not blank the rest of the file to EOF', async () => {
    const blade = [
      '<img src="first.png">',
      '@php($count = compute(1, 2))',
      '<img src="second.png">',
      '<a href="#"></a>',
    ].join('\n');
    const masked = await maskNonTemplate('/c/list.blade.php', blade);
    expect(masked).not.toContain('$count');
    // Everything after the inline directive survives on its original line.
    expect(masked!.split('\n')[0]).toContain('<img src="first.png">');
    expect(masked!.split('\n')[2]).toContain('<img src="second.png">');
    expect(masked!.split('\n')[3]).toContain('<a href="#">');
    expect(masked!.split('\n')).toHaveLength(4);
  });

  it('Blade: block @php…@endphp still blanks the whole block', async () => {
    const blade = '@php\n$x = "<img src=decoyBlock>";\n@endphp\n<img src="real.png">';
    const masked = await maskNonTemplate('/c/block.blade.php', blade);
    expect(masked).not.toContain('decoyBlock');
    expect(masked!.split('\n')[3]).toContain('<img src="real.png">');
  });

  // VALUE CARD
  // Behavior: maskRanges indexes by UTF-16 code unit, matching the offset space of
  //   parse5/indexOf, so an astral character before a masked region does not shift
  //   the mask.
  // Gap: `[...content]` iterated by code point; an emoji in a Svelte <script>
  //   shifted every later offset by the surrogate count, leaking script bytes into
  //   the HTML axe sees and eating the real markup's opening `<` (missed finding).
  // Oracle: with an emoji inside <script>, the script is fully blanked and the
  //   template <img> survives intact.
  it('masks correctly when an astral character precedes a masked region', async () => {
    const svelte = '<script>const e = "\u{1F600}"; const bad = "<img src=decoyAstral>";</script>\n<img src="logo.png">';
    const masked = await maskNonTemplate('/c/App.svelte', svelte);
    expect(masked).not.toContain('decoyAstral');
    expect(masked).not.toContain('const bad');
    expect(masked!.split('\n')[1]).toBe('<img src="logo.png">');
  });
});

describe('scanComponents', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'components-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('stamps the violation at the template line, ignoring a decoy <img> in <script>', async () => {
    const vue = [
      '<script setup>',
      'const s = "<img src=\\"logo.png\\">";', // decoy, line 2
      '</script>',
      '<template>',
      '  <img src="logo.png">', // real, line 5
      '</template>',
    ].join('\n');
    await writeFile(path.join(dir, 'App.vue'), vue, 'utf8');

    const violations = await scanComponents(dir, stubImgDetector());
    expect(violations).toHaveLength(1);
    const node = violations[0].nodes[0];
    expect(node.sourceFile).toBe(path.join(dir, 'App.vue'));
    expect(node.sourceLine).toBe(5);
  });

  it('returns [] when no component files are present', async () => {
    expect(await scanComponents(dir, stubImgDetector())).toEqual([]);
  });

  it('Blade: stamps the violation at the real <img> line, past a <?php decoy', async () => {
    const blade = [
      "<?php $s = '<img src=\"logo.png\">'; ?>", // decoy, line 1
      '<section>',
      '  <img src="logo.png">', // real, line 3
      '</section>',
    ].join('\n');
    await writeFile(path.join(dir, 'card.blade.php'), blade, 'utf8');

    const violations = await scanComponents(dir, stubImgDetector());
    expect(violations).toHaveLength(1);
    expect(violations[0].nodes[0].sourceLine).toBe(3);
  });

  it('Angular .component.html: drops whole-document rules (treated as a fragment)', async () => {
    await writeFile(path.join(dir, 'app.component.html'), '<div><img src="/logo.png"></div>', 'utf8');
    const detector: Detector = {
      async scan(): Promise<A11yViolation[]> {
        return [
          { id: 'document-title', wcagId: '2.4.2', impact: 'serious', description: '', helpUrl: '', nodes: [{ html: '<html>', target: ['html'], failureSummary: '' }] },
          { id: 'region', wcagId: 'region', impact: 'moderate', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
          { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
        ];
      },
    };
    const violations = await scanComponents(dir, detector);
    expect(violations.map((v) => v.id)).toEqual(['image-alt']);
  });

  it('drops whole-document rules that are artifacts of wrapping a fragment', async () => {
    await writeFile(path.join(dir, 'App.vue'), '<template><img src="/logo.png"></template>', 'utf8');
    const detector: Detector = {
      async scan(): Promise<A11yViolation[]> {
        return [
          { id: 'document-title', wcagId: '2.4.2', impact: 'serious', description: '', helpUrl: '', nodes: [{ html: '<html>', target: ['html'], failureSummary: '' }] },
          { id: 'region', wcagId: 'region', impact: 'moderate', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
          { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
        ];
      },
    };
    const violations = await scanComponents(dir, detector);
    expect(violations.map(v => v.id)).toEqual(['image-alt']);
  });
});

// Direct coverage for the generic FrameworkSpec primitives in extractRanges —
// the extension points future simple-delimiter frameworks (ERB/Twig/Liquid) use,
// so the abstraction is exercised rather than relying only on the built-in specs.
describe('extractRanges primitives', () => {
  it('rawIslands: blanks delimiter-pair regions, incl. an openAliases opener and EOF', async () => {
    const spec: FrameworkSpec = {
      name: 'Test',
      match: /\.x$/i,
      rawIslands: [
        { open: '<%', close: '%>', openAliases: ['<%='] },
        { open: '<!--', close: '-->' },
      ],
    };
    const content = '<%= "<img src=decoyA>" %>\n<!-- <img src=decoyB> -->\n<img src="logo.png">\n<% unterminated';
    const masked = await maskWith(content, spec);
    expect(masked).not.toBeNull();
    expect(masked).not.toContain('decoyA');
    expect(masked).not.toContain('decoyB');
    expect(masked).not.toContain('unterminated'); // runs to EOF
    expect(masked!.split('\n')[2]).toContain('<img src="logo.png">');
    expect(masked!.split('\n')).toHaveLength(4);
  });

  it('blankElements: parse5 blanks the named elements, keeps the rest', async () => {
    const spec: FrameworkSpec = { name: 'T', match: /\.x$/i, blankElements: ['script'] };
    const masked = await maskWith('<script>var bad="<img src=d>";</script>\n<img src="logo.png">', spec);
    expect(masked).not.toContain('var bad');
    expect(masked!.split('\n')[1]).toBe('<img src="logo.png">');
  });

  it('frontmatterFence: blanks a leading ---…--- block only', async () => {
    const spec: FrameworkSpec = { name: 'T', match: /\.x$/i, frontmatterFence: true };
    const masked = await maskWith('---\nx = "<img src=d>"\n---\n<img src="logo.png">', spec);
    expect(masked!.split('\n')[1]).not.toContain('<img');
    expect(masked!.split('\n')[3]).toContain('<img src="logo.png">');
  });

  it('rootElementOnly: parse5 fallback keeps only the block inner content', async () => {
    const spec: FrameworkSpec = { name: 'T', match: /\.x$/i, rootElementOnly: { block: 'template' } };
    const masked = await maskWith('<script>var d="x"</script>\n<template><img src="logo.png"></template>', spec);
    expect(masked).not.toContain('var d');
    expect(masked).not.toContain('<template'); // wrapper tags blanked too
    expect(masked).toContain('<img src="logo.png">');
  });

  it('rootElementOnly: returns null when the block is absent', async () => {
    const spec: FrameworkSpec = { name: 'T', match: /\.x$/i, rootElementOnly: { block: 'template' } };
    expect(await extractRanges('<div>no template here</div>', spec)).toBeNull();
  });
});
