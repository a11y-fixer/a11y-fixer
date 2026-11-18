import { describe, it, expect } from 'vitest';
import { detectLangFromSource } from './detect-lang.js';

describe('detectLangFromSource', () => {
  it('prefers a content-language meta tag', () => {
    const html = [
      '<!doctype html>',
      '<html>',
      '<head><meta http-equiv="content-language" content="de"></head>',
      '<body lang="fr"></body>',
      '</html>',
    ].join('\n');
    expect(detectLangFromSource(html)).toBe('de');
  });

  it('takes the first token of a comma-separated content-language', () => {
    const html = '<meta http-equiv="Content-Language" content="fr, en">';
    expect(detectLangFromSource(html)).toBe('fr');
  });

  it('falls back to an existing lang attribute elsewhere', () => {
    const html = '<html>\n<body><p lang="ja">こんにちは</p></body>\n</html>';
    expect(detectLangFromSource(html)).toBe('ja');
  });

  it('falls back to an xml:lang attribute', () => {
    const html = '<section xml:lang="pt-br">olá</section>';
    expect(detectLangFromSource(html)).toBe('pt-BR');
  });

  it('canonicalizes the detected value', () => {
    const html = '<meta http-equiv="content-language" content="EN_us">';
    expect(detectLangFromSource(html)).toBe('en-US');
  });

  it('returns null when no language signal is present', () => {
    const html = '<!doctype html>\n<html>\n<head></head>\n<body></body>\n</html>';
    expect(detectLangFromSource(html)).toBeNull();
  });

  it('skips a structurally invalid signal rather than returning it', () => {
    const html = '<meta http-equiv="content-language" content="xx_yy_zz">';
    expect(detectLangFromSource(html)).toBeNull();
  });
});
