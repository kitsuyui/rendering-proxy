import { type LifecycleEvent, lifeCycleEvents } from '../render'

interface RequestOption {
  waitUntil: LifecycleEvent
  evaluates: string[]
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

function parseOptions(text: string): RequestOption {
  let baseParsed: RequestOption = {
    waitUntil: 'load',
    evaluates: [],
  }
  try {
    baseParsed = JSON.parse(text)
  } catch (_e) {
    // ignore
  }
  let waitUntil: LifecycleEvent = 'load'
  if (lifeCycleEvents.indexOf(baseParsed.waitUntil) > -1) {
    waitUntil = baseParsed.waitUntil as LifecycleEvent
  }
  let evaluates: string[] = []
  if (
    baseParsed.evaluates &&
    Array.isArray(baseParsed.evaluates) &&
    baseParsed.evaluates.every((e: unknown) => typeof e === 'string')
  ) {
    evaluates = baseParsed.evaluates
  }

  return {
    waitUntil,
    evaluates,
  }
}
