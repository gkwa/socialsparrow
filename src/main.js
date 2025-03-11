import { extractProducts, initExtraction } from './services/extraction-service.js';

// Set up extract button
document.getElementById('extract-btn')?.addEventListener('click', () => {
  extractProducts().catch(error => {
    console.error('Extraction failed:', error);
  });
});

// Make the function available globally for use in Chrome DevTools
window.extractProducts = extractProducts;

// Initialize with auto-run
(async () => {
  await initExtraction({ autoRun: true });
})();

