#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed. Please install git first." >&2
  exit 1
fi

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Usage: bash scripts/publish_github.sh <git-repo-url>" >&2
  echo "Example (HTTPS): bash scripts/publish_github.sh https://github.com/<user>/<repo>.git" >&2
  echo "Example (SSH):   bash scripts/publish_github.sh git@github.com:<user>/<repo>.git" >&2
  exit 1
fi

echo "Initializing git repo in $(pwd)"
git init
git add -A
git commit -m "Initial commit: Speak Nova internal dashboard"
git branch -M main
git remote add origin "$REPO_URL" || git remote set-url origin "$REPO_URL"
git push -u origin main

echo "Done. Repository pushed to $REPO_URL"

