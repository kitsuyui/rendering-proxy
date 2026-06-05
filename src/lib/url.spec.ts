import { describe, expect, it } from 'vitest'

import { ensureURLStartsWithProtocolScheme, isAbsoluteURL } from './url'

describe('isAbsoluteURL', () => {
  it('returns true when given absolute URL', () => {
    expect(isAbsoluteURL('http://example.com')).toBe(true)
    expect(isAbsoluteURL('https://example.com')).toBe(true)
  })

  it('returns false when given relative/insufficient URL', () => {
    expect(isAbsoluteURL('//example.com')).toBe(false)
    expect(isAbsoluteURL('/example.com')).toBe(false)
    expect(isAbsoluteURL('example.com')).toBe(false)
  })
})

describe('ensureURLStartsWithProtocolScheme', () => {
  it('returns given URL when it starts with protocol scheme', () => {
    expect(ensureURLStartsWithProtocolScheme('http://example.com')).toBe(
      'http://example.com',
    )
    expect(ensureURLStartsWithProtocolScheme('https://example.com')).toBe(
      'https://example.com',
    )
  })

  it('returns completed URL when given URL without protocol scheme', () => {
    expect(ensureURLStartsWithProtocolScheme('example.com')).toBe(
      'https://example.com',
    )
  })

  it('throws when given URL with non-http/https scheme', () => {
    expect(() =>
      ensureURLStartsWithProtocolScheme('file:///etc/passwd'),
    ).toThrow('Unsupported URL scheme: file:')
    expect(() =>
      ensureURLStartsWithProtocolScheme('data:text/html,hello'),
    ).toThrow('Unsupported URL scheme: data:')
    expect(() =>
      ensureURLStartsWithProtocolScheme('ftp://example.com'),
    ).toThrow('Unsupported URL scheme: ftp:')
  })
})
