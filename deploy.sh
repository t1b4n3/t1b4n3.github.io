#!/bin/bash

# ====== CONFIGURE THESE ======
REPO="https://github.com/t1b4n3/t1b4n3.github.io.git"   # ✅ updated
BRANCH="gh-pages"
BUILD_DIR="_site"
COMMIT_MSG="Deploying notes and blog updates: $(date +'%Y-%m-%d %H:%M:%S')"
# ==============================

# Exit immediately on error
set -e
git add .
git commit -m "update" 
git push origin main

bundle exec jekyll build
npx pagefind --site _site

cd "$BUILD_DIR"

if [ -d .git ]; then
  rm -rf .git
fi

git init
git checkout -b "$BRANCH"
git remote add origin "$REPO"

touch .nojekyll  # Disable GitHub Jekyll processing

git add .
git commit -m "$COMMIT_MSG"
git push -f origin "$BRANCH"

bundle exec jekyll clean
