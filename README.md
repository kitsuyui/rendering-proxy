# rendering-proxy

[![codecov](https://codecov.io/gh/kitsuyui/rendering-proxy/branch/main/graph/badge.svg?token=zX1IVwqQab)](https://codecov.io/gh/kitsuyui/rendering-proxy)
[![test](https://github.com/kitsuyui/rendering-proxy/actions/workflows/test.yml/badge.svg)](https://github.com/kitsuyui/rendering-proxy/actions/workflows/test.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/kitsuyui/rendering-proxy.svg)](https://hub.docker.com/r/kitsuyui/rendering-proxy/)


Fetching rendered DOM easily and simply. Like cURL.
Using [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md).

![rendering-proxy](https://user-images.githubusercontent.com/2596972/43354885-7dad9750-928e-11e8-9220-821348efca5e.png)

So this library provides simplicity in these cases:

- Crawlers
- Text browsers
- Command line interface like curl wget

# Usage

## Server mode

```console
$ docker run -d -p 8080:8080 kitsuyui/rendering-proxy
$ curl localhost:8080/https://example.com/
<html><head>
...
</body></html>
```

## CLI mode

```console
$ docker run --rm kitsuyui/rendering-proxy cli https://example.com/
<html><head>
...
</body></html>
```

### Options

#### evaluate

When `-e`, `--evaluate` is specified, JavaScript code is evaluated before getting DOM.

```console
$ yarn ts-node src/main.ts cli https://example.com/ -e 'document.title = "updated"' -e 'document.title += " twice"'
<!DOCTYPE html><html><head>
    <title>updated twice</title>
...
```

## LICENSE

The 3-Clause BSD License. See also LICENSE file.
