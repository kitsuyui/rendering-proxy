# Fetcher

[![CircleCI Status](https://circleci.com/gh/kitsuyui/fetcher.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/kitsuyui/fetcher)


Fetching rendered DOM easily and simply. Like cURL.
Using [Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md).

# Usage

```console
$ docker-compose up -d browser
$ docker-compose run --rm fetcher https://example.com/
<html><head>
...
</body></html>
```

## Options

### evaluate

When `--evaluate` is specified, JavaScript code is evaluated before getting DOM.

```console
$ docker-compose run --rm fetcher https://example.com/ --evaluate 'document.write("yay")'
<html><head></head><body>yay</body></html>
```
