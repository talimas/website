# Talita Town

The Quartz 5 source for Talita's site at
[`talita.town`](https://talita.town). It currently contains the clean default
Quartz site. The GitHub Pages workflow is prepared; launch is waiting on the
repository owner's one-time Pages setup and the Cloudflare DNS cutover.

## Local development

Quartz requires Node 22 or newer and pins Node 22.16.0 in `.node-version`. On
Ewan's machine, use the installed Node 22 runtime through `mise`:

```bash
mise exec node@22.19.0 -- npm ci
mise exec node@22.19.0 -- npx quartz plugin install --from-config
mise exec node@22.19.0 -- npm run install-plugins
mise exec node@22.19.0 -- npx quartz build --serve
```

The local preview runs at <http://localhost:8080>. Edit Markdown in `content/`
and site configuration in `quartz.config.yaml`.

See the [Quartz 5 documentation](https://quartz.jzhao.xyz/) for framework and
authoring details.

## Deployment

Pushes to `main` deploy through GitHub Actions after Talita enables GitHub Pages
for the repository. See [Deploying Talita Town](docs/deployment.md) for her
exact owner-only step, the Cloudflare DNS records, and launch verification.
