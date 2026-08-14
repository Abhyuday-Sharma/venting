import { describe, it, expect } from 'vitest';
import { generateIncognitoName, getIncognitoAvatar } from './incognito';

describe('generateIncognitoName', () => {
  it('produces a two-word "Adjective Noun" pseudonym', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateIncognitoName()).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    }
  });

  it('varies across calls so posts are not trivially linkable', () => {
    const names = new Set(Array.from({ length: 100 }, generateIncognitoName));
    expect(names.size).toBeGreaterThan(10);
  });
});

describe('getIncognitoAvatar', () => {
  it('is stable for a given name', () => {
    expect(getIncognitoAvatar('Quiet Falcon')).toBe(getIncognitoAvatar('Quiet Falcon'));
  });

  it('differs between names', () => {
    expect(getIncognitoAvatar('Quiet Falcon')).not.toBe(getIncognitoAvatar('Brave Otter'));
  });

  it('url-encodes the seed so the space does not break the URL', () => {
    const url = getIncognitoAvatar('Quiet Falcon');
    expect(url).toBe('https://api.dicebear.com/9.x/shapes/svg?seed=Quiet%20Falcon');
    expect(() => new URL(url)).not.toThrow();
  });

  it('encodes seeds containing URL-significant characters', () => {
    const url = getIncognitoAvatar('a&b=c?d');
    expect(url).toContain('seed=a%26b%3Dc%3Fd');
    expect(new URL(url).searchParams.get('seed')).toBe('a&b=c?d');
  });

  it('builds a usable avatar URL for any generated name', () => {
    const url = getIncognitoAvatar(generateIncognitoName());
    expect(new URL(url).hostname).toBe('api.dicebear.com');
  });
});
