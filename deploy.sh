#!/bin/bash

# ====== CONFIGURE THESE ======
REPO="https://github.com/t1b4n3/t1b4n3.github.io.git"   # ✅ updated
BRANCH="gh-pages"
BUILD_DIR="_site"
COMMIT_MSG="Deploying notes and blog updates: $(date +'%Y-%m-%d %H:%M:%S')"
# ==============================

# Exit immediately on error
set -e

echo "📝 Committing content to main branch..."
git add .
git commit -m "update" || echo "🟡 Nothing to commit on main"
git push origin main

echo "📦 Building site with Jekyll..."
bundle exec jekyll build

echo "🚀 Deploying to $BRANCH branch..."

cd "$BUILD_DIR"

if [ -d .git ]; then
  echo "🧹 Cleaning up existing git repo in $BUILD_DIR..."
  rm -rf .git
fi

git init
git checkout -b "$BRANCH"
git remote add origin "$REPO"

touch .nojekyll  # Disable GitHub Jekyll processing

git add .
git commit -m "$COMMIT_MSG"
git push -f origin "$BRANCH"

cd ..

# Clean the Jekyll build cache
echo "🧼 Cleaning build cache..."
bundle exec jekyll clean

echo "✅ Deployed successfully to GitHub Pages on '$BRANCH' branch!"
