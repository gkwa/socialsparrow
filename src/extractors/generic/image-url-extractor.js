import { BaseExtractor } from "../base-extractor.js"

/**
 * Extract image URL from a product element
 */
export class ImageUrlExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    return {
      imageUrl: imageElement ? imageElement.getAttribute("src") : "N/A",
    }
  }
}
