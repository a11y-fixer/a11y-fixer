import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { locateElementInHtml } from './html-locate.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(
  path.resolve(here, '../../../../tests/fixtures/broken.html'),
  'utf8',
);

describe('locateElementInHtml', () => {
  it('locates an <img> by its src attribute', () => {
    const pos = locateElementInHtml(fixture, { html: '<img src="logo.png">' });
    expect(pos?.line).toBe(8);
  });

  it('locates a <button> by tag (no distinguishing attribute)', () => {
    const pos = locateElementInHtml(fixture, {
      html: '<button><svg aria-hidden="true"><path d="M0 0"></path></svg></button>',
    });
    expect(pos?.line).toBe(11);
  });

  it('locates an <input> by its type/placeholder', () => {
    const pos = locateElementInHtml(fixture, {
      html: '<input type="text" placeholder="Enter your email">',
    });
    expect(pos?.line).toBe(14);
  });

  it('locates the <html> element (whole-document rule)', () => {
    const pos = locateElementInHtml(fixture, { html: '<html>' });
    expect(pos?.line).toBe(2);
  });

  it('locates an <a> by its inner text', () => {
    const pos = locateElementInHtml(fixture, { html: '<a href="/about">click here</a>' });
    expect(pos?.line).toBe(20);
  });

  it('locates an <h3> by tag', () => {
    const pos = locateElementInHtml(fixture, { html: '<h3>Skipped h2</h3>' });
    expect(pos?.line).toBe(24);
  });

  it('returns a 1-indexed column for the opening tag', () => {
    // The <img> is indented two spaces on its line.
    const pos = locateElementInHtml(fixture, { html: '<img src="logo.png">' });
    expect(pos?.column).toBe(3);
  });

  it('prefers the element whose attribute uniquely matches', () => {
    const html = `
      <a href="/one">Home</a>
      <a href="/two">About</a>
    `;
    const pos = locateElementInHtml(html, { html: '<a href="/two">About</a>' });
    expect(pos?.line).toBe(3);
  });

  it('returns null when no element of that tag exists', () => {
    expect(locateElementInHtml(fixture, { html: '<video src="x.mp4"></video>' })).toBeNull();
  });

  it('returns null for an unparseable snippet', () => {
    expect(locateElementInHtml(fixture, { html: 'not html at all' })).toBeNull();
  });
});
