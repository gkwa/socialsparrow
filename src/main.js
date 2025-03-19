import {
  extractProducts,
  extractProductsToClipboard,
  initExtraction,
} from "./services/extraction-service.js"

// Set up extract button
document.getElementById("extract-btn")?.addEventListener("click", () => {
  extractProductsToClipboard().catch((error) => {
    console.error("Extraction failed:", error)
  })
})

// Make the functions available globally for use in Chrome DevTools
window.extractProducts = extractProducts
window.extractProductsToClipboard = extractProductsToClipboard

// Initialize without auto-run
initExtraction({ autoRun: false })
