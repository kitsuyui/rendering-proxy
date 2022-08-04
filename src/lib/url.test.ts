import { ensureURLStartsWithProtocolScheme, isAbsoluteURL } from './url';

describe('url', () => {
  test('isAbsoluteURL', () => {
    expect(isAbsoluteURL('http://example.com')).toBe(true);
    expect(isAbsoluteURL('https://example.com')).toBe(true);
    expect(isAbsoluteURL('//example.com')).toBe(false);
    expect(isAbsoluteURL('/example.com')).toBe(false);
    expect(isAbsoluteURL('example.com')).toBe(false);
  });

  test('ensureURLStartsWithProtocolScheme', () => {
    expect(ensureURLStartsWithProtocolScheme('http://example.com')).toBe(
      'http://example.com'
    );
    expect(ensureURLStartsWithProtocolScheme('https://example.com')).toBe(
      'https://example.com'
    );
    expect(ensureURLStartsWithProtocolScheme('example.com')).toBe(
      'https://example.com'
    );
  });
});
