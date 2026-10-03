# Talita Town workspace

## Purpose

This repository is the Quartz 5 source for Talita's site at
`https://talita.town`. The GitHub `origin` is `talimas/website`; the official
Quartz repository is the read-only `upstream` used for framework upgrades.

## Boundaries

- Keep the site on Quartz 5 unless Ewan explicitly requests a migration.
- `content/` is the authored site content. Preserve it across upgrades.
- Keep secrets and Cloudflare credentials out of Git. GitHub Pages publishes
  `main` to `talita.town`; the domain is already attached and live. GitHub CLI
  is signed in on this Mac, and Git uses its credential helper. Do not change
  DNS for ordinary content updates.
- Treat `public/`, `node_modules/`, and `.quartz/` as generated state.
- Do not force-push or rewrite the friend-owned remote's history.

## Safe commands

Quartz pins Node 22.16.0 in `.node-version`. This Mac has Node 22.19.0 installed
in `~/.local/share/talita-town`, with `node`, `npm`, and `npx` available through
`~/.local/bin` on the shell PATH:

```bash
npm ci
npx quartz plugin install --from-config
npm run install-plugins
npm run build
npm run dev
```

The preview is served at `http://localhost:8080`. A production build succeeds
only when `public/index.html` is emitted.

## Important files

- `quartz.config.yaml`: site, theme, and plugin configuration
- `quartz.ts`: local layout/component entry point
- `content/`: Markdown and other authored content
- `.github/workflows/deploy-pages.yaml`: `main` to GitHub Pages deployment
- `docs/deployment.md`: owner handoff, DNS cutover, and launch verification
- `public/`: generated build output; ignored by Git

## Verification

Before committing site or configuration changes, regenerate the plugin index,
run the production build with Node 22, and confirm `public/index.html` exists.
For framework changes, also run
`npx tsc --noEmit`.
