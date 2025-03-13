import { BaseExtractor } from "../base-extractor.js"

/**
 * Extracts product price from a product element
 */
export class PriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    const priceText = priceElement ? priceElement.textContent.trim() : "N/A"

    // Extract the numeric price using regex
    const priceMatch = priceText.match(this.config.patterns.price)
    const price = priceMatch ? `$${priceMatch[1]}` : "N/A"

    return { price }
  }
}
