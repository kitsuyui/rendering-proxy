import { describe, expect, it, vi } from 'vitest'
// waitForProcessExit
import { waitForProcessExit } from './wait_for_exit'

describe('waitForProcessExit', () => {
  let called = false

  type MockType = (code?: string | number | null | undefined) => never
  const spy = vi.spyOn(process, 'exit').mockImplementation(((
    code?: string | number | null | undefined,
  ) => {
    called = true
    process.emit('exit', code ?? 0)
  }) as MockType)

  it('wait for process.exit', async () => {
    setTimeout(() => {
      process.exit(0)
    }, 200)
    expect(called).toBe(false)
    await waitForProcessExit()
    expect(called).toBe(true)
    spy.mockClear()
  })
})
