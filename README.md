# Talita Town

## Edit on this Mac

The site lives in `~/repos/talita.town`.

1. Open `content/index.md` in a text editor to change the homepage.
2. Double-click `Preview.command`, then visit <http://localhost:8080>.
3. Save your edits. The preview updates automatically while the preview window is running.

Other pages are Markdown files in `content/`. Site settings and the theme are in
`quartz.config.yaml`. Generated files in `public/` are replaced on each build;
edit the source files instead.

Local edits do not change the public website until they are published.

## Terminal commands

```sh
cd ~/repos/talita.town
npm run dev
```

Press Control-C to stop the preview. To check a production build, run `npm run build`.

Node 22 is installed for this Mac in `~/.local/share/talita-town`, with commands
in `~/.local/bin`. On another computer, install Node 22, run `npm ci`, then
`npm run dev`.

## Publish

Double-click `Publish.command` to publish edits in `content/`,
`quartz.config.yaml`, and `quartz.ts`. It shows which files will be included,
asks for a short description and confirmation, checks the build, and sends
the changes to GitHub. Publishing normally takes a minute or two.

The shortcut only includes page content and those site settings. To publish
other project changes, use Git in Terminal and select the files explicitly.

Changes pushed to the `main` branch of `talimas/website` are automatically
published to <https://talita.town> by GitHub Actions. Publishing from the terminal
requires a GitHub login for Git; being signed in to Safari alone does not provide it.

GitHub CLI (`gh`) is installed on this Mac. Its one-time login is:

```sh
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git --hostname github.com
```

View deployment progress at <https://github.com/talimas/website/actions>.
