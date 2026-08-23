#!/usr/bin/env bash
# Build and publish dist/ to the gh-pages branch (GitHub Pages)
set -euo pipefail
npm run build
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -qm "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -f "$(git -C .. remote get-url origin)" gh-pages:gh-pages
cd .. && rm -rf dist/.git
echo "Deployed."
