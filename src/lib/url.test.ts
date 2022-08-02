import { isAbsoluteURL } from './url';

describe('url', () => {
  test('isAbsoluteURL', () => {
    expect(isAbsoluteURL('http://example.com')).toBe(true);
    expect(isAbsoluteURL('https://example.com')).toBe(true);
    expect(isAbsoluteURL('//example.com')).toBe(false);
    expect(isAbsoluteURL('/example.com')).toBe(false);
    expect(isAbsoluteURL('example.com')).toBe(false);
  });
});
