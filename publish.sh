#!/usr/bin/env bash

set -e

mkdir -p dist
pnpm run build

# Login check
echo "Checking npm login..."
NPM_USERNAME=$(pnpm whoami 2>/dev/null || echo "")
if [ -z "$NPM_USERNAME" ]; then
    echo "Not logged in. Please log in to npm:"
    pnpm login
else
    echo "Logged in as: $NPM_USERNAME"
fi

# Get package name and version from package.json
PACKAGE_NAME=$(node -e "console.log(require('./package.json').name)")
PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
echo "Package: $PACKAGE_NAME@$PACKAGE_VERSION"

# Publish
echo "Publishing package to npm..."
pnpm publish --no-git-checks

echo "Package published successfully!"
echo "To use your package: pnpm add $PACKAGE_NAME"
