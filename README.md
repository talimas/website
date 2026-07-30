# Talita Town

The Quartz 5 source for Talita's future site at
[`talita.town`](https://talita.town). It currently contains the clean default
Quartz site; hosting and DNS are intentionally not configured yet.

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
