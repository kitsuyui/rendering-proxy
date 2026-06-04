import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CliUsageError,
  formatCliError,
  getCliExitCode,
  main,
  validateURLArgument,
} from './main'

function packageVersion(): string {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
    version: string
  }
  return pkg.version
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('main entrypoint', () => {
  it('prints package version', async () => {
    const outputs: string[] = []
    vi.spyOn(console, 'log').mockImplementation((message?: unknown) => {
      outputs.push(String(message))
    })

    await main(['--version'])

    expect(outputs.join('')).toContain(packageVersion())
  })

  it('rejects missing commands as usage errors', async () => {
    await expect(main([])).rejects.toMatchObject({
      exitCode: 2,
      message: 'You need at least one command before moving on',
      name: 'CliUsageError',
    })
  })

  it('rejects invalid URLs before starting browser work', async () => {
    expect(() => validateURLArgument('bad host')).toThrow(CliUsageError)
    await expect(main(['cli', '--url', 'bad host'])).rejects.toMatchObject({
      exitCode: 2,
      message: 'Invalid URL: bad host',
      name: 'CliUsageError',
    })
  })

  it('formats usage and runtime errors with distinct exit codes', () => {
    const usageError = new CliUsageError('bad input')
    const runtimeError = new Error('browser failed')

    expect(getCliExitCode(usageError)).toBe(2)
    expect(formatCliError(usageError)).toBe(
      'rendering-proxy: Usage error: bad input',
    )
    expect(getCliExitCode(runtimeError)).toBe(1)
    expect(formatCliError(runtimeError)).toBe(
      'rendering-proxy: Error: browser failed',
    )
  })
})
