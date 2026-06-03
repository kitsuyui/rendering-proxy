import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const lockedPlaywrightVersion = () => {
  const lockfile = readFileSync('bun.lock', 'utf8')
  const match = lockfile.match(/"playwright": \["playwright@([^"]+)"/)

  if (!match) {
    throw new Error('Cannot find the locked Playwright version in bun.lock')
  }
  return match[1]
}

describe('Playwright container image versions', () => {
  it('matches the locked Playwright version in Docker and CI', () => {
    const image = `mcr.microsoft.com/playwright:v${lockedPlaywrightVersion()}-noble`

    expect(readFileSync('docker/Dockerfile', 'utf8')).toContain(`FROM ${image}`)
    expect(readFileSync('.github/workflows/test.yml', 'utf8')).toContain(
      `image: ${image}`,
    )
    expect(readFileSync('.github/workflows/octocov.yml', 'utf8')).toContain(
      `image: ${image}`,
    )
  })
})
