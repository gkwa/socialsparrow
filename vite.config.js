import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Configure to generate a single JS file
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

