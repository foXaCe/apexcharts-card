# Contributing

Thanks for your interest in **apexcharts-card**!

## Bug reports

Please use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml).

## Feature requests

Please use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).

## Development setup

This is a [Lit](https://lit.dev/) + TypeScript Lovelace card bundled with [Rollup](https://rollupjs.org/).

```bash
npm ci            # install dependencies
npm run watch     # build + rebuild on change (serves the card for local HA dev)
npm run build     # full production build (type-check + lint + bundle)
npm run lint      # eslint
npm run format    # prettier --write
```

A ready-to-use development environment is provided in [`.devcontainer/`](.devcontainer/):
it starts Home Assistant and serves the card automatically.

### Pre-commit hooks

This repo uses [prek](https://github.com/j178/prek) (a drop-in Rust runner for
[pre-commit](https://pre-commit.com/)) to run Prettier and ESLint before each commit:

```bash
pipx install prek   # or: brew install j178/prek/prek
prek install
```

If you prefer the Python runner, `pipx install pre-commit && pre-commit install`
works the same way (both read `.pre-commit-config.yaml`).

## Pull requests

1. Create a dedicated branch: `git checkout -b feat/my-feature`
2. Make your changes and run `npm run build` — type-check, lint and bundle must pass.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit
   messages (`feat:`, `fix:`, `docs:`, `chore:` …). This drives the automated changelog
   and version bump.
4. Open a pull request against `main`.

## Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please).
Merging conventional commits into `main` maintains a release pull request; merging that
pull request publishes the release (tag + `apexcharts-card.js` asset).

## Dependency management

This repo uses **Renovate** (not Dependabot). Dependency update pull requests are opened
by `@renovate[bot]` — see the Dependency Dashboard issue for the full queue.
