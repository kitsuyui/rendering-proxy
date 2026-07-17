# rendering-proxy

[![npm version](https://badge.fury.io/js/rendering-proxy.svg)](https://badge.fury.io/js/rendering-proxy)
![Coverage](https://raw.githubusercontent.com/kitsuyui/octocov-central/main/badges/kitsuyui/rendering-proxy/coverage.svg)
[![TODO/expect-error](https://raw.githubusercontent.com/kitsuyui/rendering-proxy/gh-counter-assets/badges/maintenance-comments.svg)](https://github.com/kitsuyui/rendering-proxy/search?q=%28TODO+OR+%22%40ts-expect-error%22%29+path%3Asrc&type=code)
[![Build Size Report](https://raw.githubusercontent.com/kitsuyui/rendering-proxy/gh-build-size-assets/badges/total.svg)](https://github.com/kitsuyui/rendering-proxy/blob/gh-build-size-assets/report.md)
[![test](https://github.com/kitsuyui/rendering-proxy/actions/workflows/test.yml/badge.svg)](https://github.com/kitsuyui/rendering-proxy/actions/workflows/test.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/kitsuyui/rendering-proxy.svg)](https://hub.docker.com/r/kitsuyui/rendering-proxy/)

Fetching rendered DOM easily and simply. Like cURL.
Using [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md).
The repository tracks `TODO` and `@ts-expect-error` markers with [`gh-counter`](https://github.com/kitsuyui/gh-counter).
It also tracks built `dist/` artifact size with [`gh-build-size`](https://github.com/kitsuyui/gh-build-size).

![rendering-proxy](https://user-images.githubusercontent.com/2596972/43354885-7dad9750-928e-11e8-9220-821348efca5e.png)

So this library provides simplicity in these cases:

- Crawlers
- Text browsers
- Command line interface like curl wget

# Installation

published on [npm](https://www.npmjs.com/package/rendering-proxy)

```sh
$ npm install rendering-proxy
```

```sh
$ yarn add rendering-proxy
```

```sh
$ bun add rendering-proxy
```

# Usage

```console
$ rendering-proxy --help
rendering-proxy <command>

Commands:
  rendering-proxy cli [url]  CLi mode
  rendering-proxy server     Server mode

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## CLI mode

```console
$ yarn run rendering-proxy cli https://example.com/
<html><head>
...
</body></html>
```

## Server mode

```console
$ yarn run rendering-proxy server --port=8080
```

```console
$ curl http://localhost:8080/https://example.com/
<html><head>
...
</body></html>
```

## evaluate

### CLI mode

When `-e`, `--evaluate` is specified, JavaScript code is evaluated before getting DOM.

```console
$ yarn run rendering-proxy cli https://example.com/ -e 'document.title = "updated"' -e 'document.title += " twice"'
<!DOCTYPE html><html><head>
    <title>updated twice</title>
...
```

### Server mode

Send the options via request header `X-Rendering-Proxy` (case-insensitive).
Receive the results via response header `X-Rendering-Proxy` (case-insensitive).

```console
curl -H 'X-Rendering-Proxy: {"evaluates": ["1 + 1"], "waitUntil": "load"}' --include http://localhost:8080/https://example.com/
HTTP/1.1 200 OK
...
x-rendering-proxy: [{"success":true,"result":2,"script":"1 + 1"}]
x-rendering-proxy-version: 1
...

<!DOCTYPE html><html><head>
    <title>Example Domain</title>
```

#### Protocol schema (v1)

**Request header** `X-Rendering-Proxy` — JSON object:

| field | type | default | description |
| --- | --- | --- | --- |
| `waitUntil` | `"load"` \| `"domcontentloaded"` \| `"networkidle"` \| `"commit"` | `"load"` | Playwright lifecycle event to wait for. Unknown values fall back to `"load"` with a server-side warning. |
| `evaluates` | `string[]` | `[]` | JavaScript snippets to evaluate before capturing the DOM. |
| `timeout` | `number` (ms) | none | Navigation timeout in milliseconds. |

Requests with a non-object `X-Rendering-Proxy` JSON payload or with fields of the wrong type are rejected with `400 Bad Request`.

**Response header** `X-Rendering-Proxy` — JSON array of `EvaluateResult`:

```ts
type EvaluateResult =
  | { success: true;  script: string; result: unknown }
  | { success: false; script: string; result: string  }
```

**Response header** `X-Rendering-Proxy-Version` — integer string (e.g. `"1"`).
Clients can use this to detect schema changes across server upgrades.

## Development

Install [lefthook](https://github.com/evilmartians/lefthook) and register the Git hooks:

```sh
lefthook install
```

This sets up two hooks that mirror what CI runs:

- **pre-commit**: runs `bun run lint` and `bun run typecheck` on every commit.
- **pre-push**: runs `bun run lint`, `bun run typecheck`, and `bun run test` before each push.

CI still runs the full suite on every pull request and push to main — the hooks bring that feedback earlier, to your local machine.

## Programmatic API

`rendering-proxy` exports two namespaces for programmatic use:

```ts
import { server, cli } from 'rendering-proxy'
```

### `server.main(options?)`

Starts the rendering proxy HTTP server. Exits when the process receives `SIGTERM` or `SIGINT`.

```ts
import { server } from 'rendering-proxy'

await server.main({ port: 8080, name: 'chromium', headless: true })
```

Options:

| Option | Type | Default | Description |
|---|---|---|---|
| `port` | `number` | `8080` | Port to listen on |
| `name` | `'chromium' \| 'firefox' \| 'webkit'` | `'chromium'` | Browser engine |
| `headless` | `boolean` | `true` | Run browser in headless mode |

### `server.createServer({ browser, port })`

Creates an `http.Server` backed by a pre-launched Playwright `Browser` instance.

```ts
import { chromium } from 'playwright'
import { server } from 'rendering-proxy'

const browser = await chromium.launch()
const httpServer = await server.createServer({ browser, port: 8080 })
// Use httpServer.close() to stop
```

### `server.createHandler(browser)`

Returns a `(req, res) => void` handler suitable for use with an existing `http.Server`.

```ts
import http from 'node:http'
import { chromium } from 'playwright'
import { server } from 'rendering-proxy'

const browser = await chromium.launch()
const httpServer = http.createServer(server.createHandler(browser))
httpServer.listen(8080)
```

### `cli.renderToStream(request, writable)`

Renders a URL and writes the resulting HTML to any `Writable` stream.

```ts
import { cli } from 'rendering-proxy'

await cli.renderToStream(
  {
    url: 'https://example.com',
    name: 'chromium',
    waitUntil: 'networkidle',
    evaluates: ['document.title = "patched"'],
  },
  process.stdout,
)
```

### `cli.main(request)`

Renders a URL and writes to `process.stdout`. Equivalent to the CLI command.

```ts
import { cli } from 'rendering-proxy'

await cli.main({ url: 'https://example.com', name: 'chromium' })
```

## LICENSE

The 3-Clause BSD License. See also LICENSE file.
