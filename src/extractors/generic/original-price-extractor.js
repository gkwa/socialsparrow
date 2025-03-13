import { BaseExtractor } from "../base-extractor.js"

/**
 * Extract original price from a product element
 */
export class OriginalPriceExtractor extends BaseExtractor {
  extract(element) {
    const originalPriceElement = element.querySelector(this.config.selectors.productOriginalPrice)
    const originalPrice = originalPriceElement ? originalPriceElement.textContent.trim() : "N/A"

    // Get the current price to compare
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    const currentPrice = priceElement ? priceElement.textContent.trim() : "N/A"

    // Only return original price if it's different from the current price
    return {
      originalPrice: originalPrice !== currentPrice ? originalPrice : null,
    }
  }
}
