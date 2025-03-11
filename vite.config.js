import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Configure to generate a single JS file
    rollupOptions: {
      output: {
        format: 'iife',
        manualChunks: undefined,
        // Ensure the code is wrapped in a self-invoking function
        intro: '(function() {',
        outro: '})();'
      }
    },
    // Target older browsers for compatibility
    target: 'es2015',
    // Prevent minification from creating duplicate variable names
    minify: 'terser',
    terserOptions: {
      mangle: {
        keep_classnames: true
      }
    }
  }
})
