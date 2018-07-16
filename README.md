# Fetcher

[![CircleCI Status](https://circleci.com/gh/kitsuyui/fetcher.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/kitsuyui/fetcher)

Fetching rendered DOM easily and simply. Like cURL.
Using [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md).

![rendering-fetcher](https://user-images.githubusercontent.com/2596972/42773640-d7a7aaf4-8968-11e8-8c75-5ff4aeb23310.png)

# Usage

## Server mode

```console
$ docker run -d -p 8080:8080 kitsuyui/fetcher
$ curl localhost:8080/https://example.com/
<html><head>
...
</body></html>
```

## CLI mode

```console
$ docker run --rm kitsuyui/fetcher cli https://example.com/
<html><head>
...
</body></html>
```

### Options

#### evaluate

When `--evaluate` is specified, JavaScript code is evaluated before getting DOM.

```console
$ docker run --rm kitsuyui/fetcher cli https://example.com/ --evaluate 'document.write("yay")'
<html><head></head><body>yay</body></html>
```
