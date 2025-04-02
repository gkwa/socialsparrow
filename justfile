default:
    @just --list

# Install dependencies
install:
    pnpm install

# Start development server
dev:
    pnpm run dev

# Build project for production
build:
    pnpm run build

# Preview production build
preview:
    pnpm run preview

# Clean dist directory
clean:
    rm -rf dist

# Initialize a new Vite project with pnpm
init:
    pnpm create vite@latest . --template vanilla
    @echo "Project initialized. Run 'just install' to install dependencies."

# Bundle and copy ES module to clipboard for Chrome DevTools
bundle-for-devtools:
    pnpm run build
    cat dist/index.js | pbcopy || cat dist/index.js | xclip -selection clipboard
    @echo "Bundled ES module copied to clipboard. Paste it into Chrome DevTools console or snippets."

# Bundle and copy UMD module to clipboard for Chrome DevTools
bundle-umd-for-devtools:
    pnpm run build
    cat dist/index.umd.cjs | pbcopy || cat dist/index.umd.cjs | xclip -selection clipboard
    @echo "Bundled UMD module copied to clipboard. Paste it into Chrome DevTools console or snippets."

# List all dist files with sizes
list-dist:
    @echo "Distribution files:"
    @ls -lh dist/

# View built JS file size and content
view-bundle:
    @echo "ES Module bundle size:"
    @wc -c dist/index.js
    @echo "\nFirst 20 lines of ES Module bundle:"
    @head -n 20 dist/index.js

# View UMD bundle size and content
view-umd-bundle:
    @echo "UMD bundle size:"
    @wc -c dist/index.umd.cjs
    @echo "\nFirst 20 lines of UMD bundle:"
    @head -n 20 dist/index.umd.cjs

# Create a minified bundle for production
minify:
    pnpm run build
    @echo "Creating minified versions with terser..."
    npx terser dist/index.js -o dist/index.min.js -c -m
    npx terser dist/index.umd.cjs -o dist/index.umd.min.cjs -c -m
    @echo "Minified files created. Sizes:"
    @ls -lh dist/

# Create a zip of the distribution files
package:
    pnpm run build
    mkdir -p releases
    zip -j releases/socialsparrow-$(date +%Y%m%d).zip dist/*
    @echo "Package created at releases/socialsparrow-$(date +%Y%m%d).zip"
