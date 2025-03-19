#!/bin/bash
set -e

# Make sure script is executable (self-check)
chmod +x "$0"

# Create dist directory if it doesn't exist
mkdir -p dist

# Build the package
echo "Building package..."
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

# Get package name from package.json
PACKAGE_NAME=$(node -e "console.log(require('./package.json').name)")
echo "Package name: $PACKAGE_NAME"

# Check if package exists and prompt for version update if needed
PACKAGE_EXISTS=$(pnpm view "$PACKAGE_NAME" version 2>/dev/null || echo "")
if [ -n "$PACKAGE_EXISTS" ]; then
    echo "Package $PACKAGE_NAME already exists with version $PACKAGE_EXISTS"
    read -r -p "New version (current: $PACKAGE_EXISTS): " NEW_VERSION
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm package.json.bak
    echo "Version updated to: $NEW_VERSION"

    # Build again with new version
    echo "Building package with new version..."
    pnpm run build
fi

# Publish
echo "Publishing package to npm..."
pnpm publish --no-git-checks

echo "Package published successfully!"
echo "To use your package: pnpm add $PACKAGE_NAME"
