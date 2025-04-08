import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.js"],
    env: {
      NODE_ENV: "test",
    },
    silent: true, // Suppress console logs during tests
    onConsole: "ignore", // Ignore console outputs
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
