import http from 'node:http'
import sleep from 'sleep-promise'

async function requestServerHead(url: string): Promise<void> {
  const target = new URL(url)
  const req = http.request({
    method: 'HEAD',
    host: target.hostname,
    port: target.port || '80',
    timeout: 1000,
  })

  await new Promise<void>((resolve, reject) => {
    req.on('response', () => {
      resolve()
    })
    req.on('error', (err) => {
      reject(err)
    })
    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'))
    })
    req.end()
  })
}

async function isServerReady(url: string): Promise<boolean> {
  try {
    await requestServerHead(url)
    return true
  } catch {
    return false
  }
}

/**
 * Waits until the server on the specified URL is ready.
 * @param url - The URL to check.
 * @returns void
 */
export const waitServerReady = async (url: string): Promise<void> => {
  const maxRetries = 20
  const delay = 1000
  for (let i = 0; i < maxRetries; i++) {
    if (await isServerReady(url)) {
      return
    }

    await sleep(delay)
  }
  throw new Error(`Server on port ${url} did not become ready in time`)
}
