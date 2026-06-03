import { describe, it } from 'vitest'

import { waitForProcessExit } from './wait_for_exit'

describe('waitForProcessExit', () => {
  it('resolves when SIGTERM is received', async () => {
    setTimeout(() => {
      process.emit('SIGTERM')
    }, 50)
    await waitForProcessExit()
  })

  it('resolves when SIGINT is received', async () => {
    setTimeout(() => {
      process.emit('SIGINT')
    }, 50)
    await waitForProcessExit()
  })
})
