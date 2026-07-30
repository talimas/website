# Talita Town workspace

## Purpose

This repository is the Quartz 5 source for Talita's future site at
`https://talita.town`. The GitHub `origin` is `talimas/website`; the official
Quartz repository is the read-only `upstream` used for framework upgrades.

## Boundaries

- Keep the site on Quartz 5 unless Ewan explicitly requests a migration.
- `content/` is the authored site content. Preserve it across upgrades.
- Keep secrets and Cloudflare credentials out of Git. Hosting is not configured
  yet; do not publish or change DNS without an explicit request.
- Treat `public/`, `node_modules/`, and `.quartz/` as generated state.
- Do not force-push or rewrite the friend-owned remote's history.

## Safe commands

Quartz pins Node 22.16.0 in `.node-version`. On this machine, use the installed
Node 22 runtime through `mise`:

```bash
mise exec node@22.19.0 -- npm ci
mise exec node@22.19.0 -- npx quartz plugin install --from-config
mise exec node@22.19.0 -- npm run install-plugins
mise exec node@22.19.0 -- npx quartz build
mise exec node@22.19.0 -- npx quartz build --serve
```

The preview is served at `http://localhost:8080`. A production build succeeds
only when `public/index.html` is emitted.

## Important files

- `quartz.config.yaml`: site, theme, and plugin configuration
- `quartz.ts`: local layout/component entry point
- `content/`: Markdown and other authored content
- `public/`: generated build output; ignored by Git

## Verification

Before committing site or configuration changes, regenerate the plugin index,
run the production build with Node 22, and confirm `public/index.html` exists.
For framework changes, also run
`mise exec node@22.19.0 -- npx tsc --noEmit`.
