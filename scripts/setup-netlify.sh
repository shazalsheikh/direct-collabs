#!/usr/bin/env bash
# Imports .env.netlify into your Netlify site.   Run:  npm run setup:netlify
# Run npm run setup:supabase first (it creates .env.netlify), and import the repository
# into Netlify from GitHub once, in the Netlify website, so there is a site to link to.
# DRY_RUN=1 prints each step without touching anything online.
set -euo pipefail
cd "$(dirname "$0")/.."

NL_VERSION="27.16.2"
nl() {
  if [ "${DRY_RUN:-0}" = "1" ]; then echo "  [dry run] netlify $*"; else npx --yes "netlify-cli@$NL_VERSION" "$@"; fi
}

[ -f .env.netlify ] || { echo ".env.netlify not found. Run: npm run setup:supabase"; exit 1; }

echo "Step 1 of 3: log in to Netlify (a browser window opens)"
nl login
echo; echo "Step 2 of 3: link this folder to the Netlify site built from shazalsheikh/direct-collabs"
nl link --git-remote-url shazalsheikh/direct-collabs
echo; echo "Step 3 of 3: import the environment variables (existing ones are merged, not wiped)"
nl env:import .env.netlify

echo
echo "Done. Now in Netlify: Deploys > Trigger deploy > Clear cache and deploy site."
echo "Variables starting with NEXT_PUBLIC_ are built into the page, so they only apply after that redeploy."
