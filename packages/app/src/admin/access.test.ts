import { describe, expect, it } from 'vitest';
import { isAdminLogin, parseAdminLogins } from './access.js';

describe('parseAdminLogins', () => {
  it('splits on commas, whitespace, and newlines; lower-cases; drops blanks', () => {
    expect(parseAdminLogins('Alice, bob\n  CAROL ')).toEqual(['alice', 'bob', 'carol']);
  });

  it('returns an empty list for empty/undefined input', () => {
    expect(parseAdminLogins('')).toEqual([]);
    expect(parseAdminLogins(undefined)).toEqual([]);
    expect(parseAdminLogins(null)).toEqual([]);
  });
});

describe('isAdminLogin', () => {
  const allowed = parseAdminLogins('alice,bob');

  it('matches case-insensitively', () => {
    expect(isAdminLogin('Alice', allowed)).toBe(true);
    expect(isAdminLogin('BOB', allowed)).toBe(true);
  });

  it('rejects non-members and empty logins', () => {
    expect(isAdminLogin('mallory', allowed)).toBe(false);
    expect(isAdminLogin(null, allowed)).toBe(false);
    expect(isAdminLogin('', allowed)).toBe(false);
    expect(isAdminLogin('alice', [])).toBe(false);
  });
});
