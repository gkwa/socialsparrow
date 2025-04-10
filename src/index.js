// Export the main functions
import {
  extractProducts,
  extractProductsToClipboard,
  initExtraction,
  decodeRawHtml,
} from "./services/extraction-service.js"
import { UuidGenerator } from "./core/uuid-generator.js"

export { extractProducts, extractProductsToClipboard, initExtraction, decodeRawHtml, UuidGenerator }
