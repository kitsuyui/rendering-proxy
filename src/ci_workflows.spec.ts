import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('test workflow failure handling', () => {
  const testWorkflowPath = '.github/workflows/test.yml'
  const testWorkflowIt = existsSync(testWorkflowPath) ? it : it.skip

  testWorkflowIt('runs all matrix entries without masking failures', () => {
    const workflow = readFileSync(testWorkflowPath, 'utf8')

    expect(workflow).toContain('fail-fast: false')
    expect(workflow).not.toMatch(/^\s*continue-on-error:\s*true\s*$/m)
  })
})
