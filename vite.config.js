import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "SocialSparrow",
      fileName: "index",
    },
    rollupOptions: {
      output: {
        format: "es",
      },
    },
    target: "es2015",
    minify: "esbuild",
    esbuildOptions: {
      keepNames: true, // Preserve class names for better debugging
    },
  },
})
