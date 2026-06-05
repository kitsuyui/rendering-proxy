import { type LifecycleEvent, lifeCycleEvents } from '../render'

interface RequestOption {
  waitUntil: LifecycleEvent
  evaluates: string[]
  timeout: number | undefined
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

function normalizeWaitUntil(value: unknown): LifecycleEvent {
  return lifeCycleEvents.includes(value as LifecycleEvent)
    ? (value as LifecycleEvent)
    : 'load'
}

function normalizeEvaluates(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : []
}

function normalizeTimeout(value: unknown): number | undefined {
  return typeof value === 'number' && value > 0 ? value : undefined
}

function parseOptions(text: string): RequestOption {
  const baseParsed = tryParseOptions(text) as Partial<RequestOption> | null

  return {
    waitUntil: normalizeWaitUntil(baseParsed?.waitUntil),
    evaluates: normalizeEvaluates(baseParsed?.evaluates),
    timeout: normalizeTimeout(baseParsed?.timeout),
  }
}
