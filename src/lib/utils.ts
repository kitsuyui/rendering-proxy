import http from 'node:http'
import sleep from 'sleep-promise'

/**
 * Waits until the server on the specified URL is ready.
 * @param url - The URL to check.
 * @returns void
 */
export const waitServerReady = async (url: string): Promise<void> => {
  const maxRetries = 20
  const delay = 1000
  for (let i = 0; i < maxRetries; i++) {
    try {
      // curl is not installed in some environments
      const req = http.request({
        method: 'HEAD',
        host: new URL(url).hostname,
        port: new URL(url).port || '80',
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
      return
    } catch (_error) {
      await sleep(delay)
    }
  }
  throw new Error(`Server on port ${url} did not become ready in time`)
}
