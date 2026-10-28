import { describe, it, expect } from 'vitest';
import { titleFromSrc } from './title-from-src.js';

describe('titleFromSrc', () => {
  it('uses the last path segment and drops the extension', () => {
    expect(titleFromSrc('/videos/getting-started.html')).toBe('getting started');
  });

  it('turns underscores into spaces', () => {
    expect(titleFromSrc('/a/submit_form.gif')).toBe('submit form');
  });

  it('drops query strings and hashes', () => {
    expect(titleFromSrc('https://x.com/path/my_page.php?id=3#top')).toBe('my page');
  });

  it('decodes percent-encoded segments', () => {
    expect(titleFromSrc('/a/hello%20world.png')).toBe('hello world');
  });

  it('tolerates a malformed percent-encoding', () => {
    expect(titleFromSrc('/a/bad%ZZname.png')).toBe('bad%ZZname');
  });

  it('returns null when nothing sensible remains', () => {
    expect(titleFromSrc('/')).toBeNull();
  });
});
