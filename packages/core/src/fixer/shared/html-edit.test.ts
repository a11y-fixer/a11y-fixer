import { describe, it, expect } from 'vitest';
import { setElementText } from './html-edit.js';

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

describe('setElementText', () => {
  it('fills an empty heading on the given line', () => {
    const src = '<header>x</header>\n<h2></h2>\n<p>y</p>';
    expect(setElementText(src, 2, HEADINGS, 'Pricing')).toBe('<header>x</header>\n<h2>Pricing</h2>\n<p>y</p>');
  });

  it('replaces existing whitespace-only text', () => {
    expect(setElementText('<h1>   </h1>', 1, HEADINGS, 'Title')).toBe('<h1>Title</h1>');
  });

  it('returns null when the element has child markup', () => {
    expect(setElementText('<h2><span>hi</span></h2>', 1, HEADINGS, 'X')).toBeNull();
  });

  it('returns null when no matching element is on the line', () => {
    expect(setElementText('<p></p>', 1, HEADINGS, 'X')).toBeNull();
  });

  it('returns null when the text is already set', () => {
    expect(setElementText('<h2>Same</h2>', 1, HEADINGS, 'Same')).toBeNull();
  });
});
