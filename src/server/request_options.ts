import { type LifecycleEvent, lifeCycleEvents } from '../render'

// Increment when the request/response JSON schema changes in a backward-incompatible way.
export const PROTOCOL_VERSION = 1

interface RequestOption {
  waitUntil: LifecycleEvent
  evaluates: string[]
  timeout: number | undefined
}

type RequestOptionInput = {
  waitUntil?: unknown
  evaluates?: unknown
  timeout?: unknown
}

export function parseRenderingProxyHeader(
  headerValue: undefined | string | string[],
): RequestOption {
  if (typeof headerValue === 'string') {
    return parseOptions(headerValue)
  }
  if (Array.isArray(headerValue)) {
    return parseOptions(headerValue.join(''))
  }
  return parseOptions('')
}

function tryParseOptions(text: string): unknown {
  if (text === '') return null
  return JSON.parse(text)
}

function isRequestOptionInput(value: unknown): value is RequestOptionInput {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeWaitUntil(value: unknown): LifecycleEvent {
  if (lifeCycleEvents.includes(value as LifecycleEvent)) {
    return value as LifecycleEvent
  }
  console.warn(
    `X-Rendering-Proxy: unknown waitUntil value ${JSON.stringify(value)}, falling back to "load"`,
  )
  return 'load'
}

function normalizeEvaluates(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    return []
  }
  return value
}

function normalizeTimeout(value: unknown): number | undefined {
  return typeof value === 'number' && value > 0 ? value : undefined
}

function validateWaitUntil(value: RequestOptionInput): void {
  if ('waitUntil' in value && typeof value.waitUntil !== 'string') {
    throw new TypeError('X-Rendering-Proxy.waitUntil must be a string')
  }
}

function validateEvaluates(value: RequestOptionInput): void {
  if (
    'evaluates' in value &&
    (!Array.isArray(value.evaluates) ||
      !value.evaluates.every((item) => typeof item === 'string'))
  ) {
    throw new TypeError('X-Rendering-Proxy.evaluates must be a string array')
  }
}

function validateTimeout(value: RequestOptionInput): void {
  if ('timeout' in value && typeof value.timeout !== 'number') {
    throw new TypeError('X-Rendering-Proxy.timeout must be a number')
  }
}

function validateOptionsShape(value: unknown): RequestOptionInput | null {
  if (value === null) {
    return null
  }
  if (!isRequestOptionInput(value)) {
    throw new TypeError('X-Rendering-Proxy must be a JSON object')
  }
  validateWaitUntil(value)
  validateEvaluates(value)
  validateTimeout(value)
  return value
}

function parseOptions(text: string): RequestOption {
  const baseParsed = validateOptionsShape(tryParseOptions(text))

  return {
    waitUntil: normalizeWaitUntil(baseParsed?.waitUntil),
    evaluates: normalizeEvaluates(baseParsed?.evaluates),
    timeout: normalizeTimeout(baseParsed?.timeout),
  }
}
