# Contributing

Thank you for taking the time to improve rendering-proxy.

## Development setup

This project uses [Bun](https://bun.sh/) for dependency management and scripts.

```sh
bun install
```

## Checks

Run formatting before opening a pull request:

```sh
bun run format
```

Run lint checks:

```sh
bun run lint
```

Run type checks:

```sh
bun run typecheck
```

Run the test suite:

```sh
bun run test
```

Build the package when changing package metadata, exports, or runtime entrypoints:

```sh
bun run build
```

## Releases

The npm package version is tracked in `package.json`. Before creating a release
tag, bump `package.json` in a pull request and tag the merged commit as
`vX.Y.Z`. The release workflow checks that the tag and package version match
before publishing.

## Pull requests

Before opening a pull request, please make sure that:

- the change is focused on one topic;
- relevant checks pass locally;
- README or package documentation updates are included when behavior changes.

When reporting a failing check, include the command you ran and the relevant
error output.
