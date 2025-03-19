import { extractProducts, extractProductsToClipboard, initExtraction } from "../index.js"

// Expose functions to window for browser usage (e.g., Chrome DevTools)
window.extractProducts = extractProducts
window.extractProductsToClipboard = extractProductsToClipboard
window.initExtraction = initExtraction
