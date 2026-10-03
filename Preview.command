#!/bin/zsh
set -eu
export PATH="$HOME/.local/bin:$PATH"
cd "${0:A:h}"
printf '\nTalita Town preview: http://localhost:8080\nSave edits to see them here. Press Control-C to stop.\n\n'
npm run dev
