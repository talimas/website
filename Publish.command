#!/bin/zsh
set -eu
export PATH="$HOME/.local/bin:$PATH"
cd "${0:A:h}"

fail() {
  printf '\n%s\n' "$1"
  read -r 'reply?Press Return to close. '
  exit 1
}

[[ "$(git branch --show-current)" == main ]] || fail 'Switch to the main branch before publishing.'
git diff --cached --quiet || fail 'There are already staged changes. Finish that commit in Terminal first.'
gh auth status --hostname github.com || fail 'Sign in first with: gh auth login'

if [[ -z "$(git status --porcelain -- content quartz.config.yaml quartz.ts)" ]]; then
  fail 'No new page or site-setting changes to publish.'
fi

printf '\nThese page and site-setting changes will be published:\n'
git status --short -- content quartz.config.yaml quartz.ts
printf '\nOther project files are not included by this shortcut.\n'
read -r 'message?Briefly describe your changes: '
[[ -n "$message" ]] || fail 'No description entered; nothing published.'
read -r 'reply?Build and publish these changes to talita.town? [y/N] '
[[ "$reply" == [yY] ]] || exit 0

npm run build || fail 'The build failed. Nothing was published.'
[[ -f public/index.html ]] || fail 'The homepage was not generated. Nothing was published.'
git add -- content quartz.config.yaml quartz.ts
git commit -m "$message" || fail 'Could not save the commit. Nothing was published.'
git push origin main || fail 'The commit is saved locally, but the push failed. Ask for help syncing with GitHub.'
printf '\nSent to GitHub. The live site updates after deployment finishes.\n'
printf 'Check progress: https://github.com/talimas/website/actions\n'
read -r 'reply?Press Return to close. '
