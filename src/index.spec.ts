import { describe, expect, test } from 'vitest'

import * as RenderingProxy from './'

describe('RenderingProxy', () => {
  test('test imports', () => {
    expect(RenderingProxy).toBeDefined()
    expect(RenderingProxy.cli).toBeDefined()
    expect(RenderingProxy.cli.main).toBeDefined()
    expect(RenderingProxy.server).toBeDefined()
    expect(RenderingProxy.server.main).toBeDefined()
  })
})
