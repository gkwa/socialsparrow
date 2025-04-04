import { BaseExtractor } from "./base-extractor.js"
import { NameExtractor } from "./generic/name-extractor.js"
import { PriceExtractor } from "./generic/price-extractor.js"
import { PricePerUnitExtractor } from "./generic/price-per-unit-extractor.js"
import { RawTextExtractor } from "./generic/raw-text-extractor.js"
import { RawHtmlExtractor } from "./generic/raw-html-extractor.js"
import { UrlAbsolutizer } from "../core/url-absolutizer.js"

/**
 * Composite extractor that combines multiple extractors
 * Follows Open/Closed Principle - can be extended with new extractors
 */
export class ProductExtractor {
  constructor(config) {
    this.config = config
    this.extractors = [
      new NameExtractor(config),
      new PriceExtractor(config),
      new PricePerUnitExtractor(config),
      new RawTextExtractor(config), // Added the RawTextExtractor by default
      new RawHtmlExtractor(config), // Added the RawHtmlExtractor by default
    ]

    // Flag to control whether to absolutize URLs before HTML extraction
    this.absolutizeUrls = config.absolutizeUrls !== false
  }

  /**
   * Add a custom extractor
   * @param {BaseExtractor} extractor - The extractor to add
   */
  addExtractor(extractor) {
    this.extractors.push(extractor)
  }

  /**
   * Set extractors (replacing existing ones)
   * @param {Array<BaseExtractor>} extractors - The extractors to set
   */
  setExtractors(extractors) {
    // Ensure the RawTextExtractor is always included
    const hasRawTextExtractor = extractors.some((e) => e instanceof RawTextExtractor)
    const hasRawHtmlExtractor = extractors.some((e) => e instanceof RawHtmlExtractor)

    if (!hasRawTextExtractor) {
      extractors.push(new RawTextExtractor(this.config))
    }

    if (!hasRawHtmlExtractor) {
      extractors.push(new RawHtmlExtractor(this.config))
    }

    this.extractors = extractors
  }

  /**
   * Extract all product information from a product element
   * @param {HTMLElement} element - The product element
   * @return {Object} Product information
   */
  extractProductInfo(element) {
    try {
      // For HTML extraction, we need to ensure all URLs are absolute
      // We'll use a special element for the RawHtmlExtractor
      let elementForHtmlExtraction = element

      // If URL absolutization is enabled
      if (this.absolutizeUrls) {
        // Clone the element and absolutize URLs in the clone
        elementForHtmlExtraction = UrlAbsolutizer.cloneWithAbsoluteUrls(element)
      }

      // Apply all extractors with the appropriate element
      return this.extractors.reduce((result, extractor) => {
        // Use absolutized element only for RawHtmlExtractor
        const elementToUse = extractor instanceof RawHtmlExtractor
          ? elementForHtmlExtraction
          : element

        return { ...result, ...extractor.extract(elementToUse) }
      }, {})
    } catch (error) {
      console.error("Error extracting product info:", error)
      return {
        name: "Error",
        price: "Error",
        pricePerUnit: "Error",
        url: "Error",
        rawTextContent: "Error extracting content",
        rawHtml: "Error extracting HTML",
      }
    }
  }
}
