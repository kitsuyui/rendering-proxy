# rendering-proxy

[![CircleCI Status](https://circleci.com/gh/kitsuyui/rendering-proxy.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/kitsuyui/rendering-proxy)
[![Docker Pulls](https://img.shields.io/docker/pulls/kitsuyui/rendering-proxy.svg)](https://hub.docker.com/r/kitsuyui/rendering-proxy/)


Fetching rendered DOM easily and simply. Like cURL.
Using [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md).

![rendering-proxy](https://user-images.githubusercontent.com/2596972/43354885-7dad9750-928e-11e8-9220-821348efca5e.png)

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

When `--evaluate` is specified, JavaScript code is evaluated before getting DOM.

```console
$ docker run --rm kitsuyui/rendering-proxy cli https://example.com/ --evaluate 'document.write("yay")'
<html><head></head><body>yay</body></html>
```
## LICENSE

The 3-Clause BSD License. See also LISENCE file.
