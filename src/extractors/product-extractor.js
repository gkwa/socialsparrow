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
      new RawTextExtractor(config),
      new RawHtmlExtractor(config),
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
    // Ensure the RawTextExtractor and RawHtmlExtractor are always included
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
      // First, make a clone of the element with absolutized URLs for HTML extraction
      const elementForHtmlExtraction = this.absolutizeUrls
        ? UrlAbsolutizer.cloneWithAbsoluteUrls(element)
        : element

      // Create result object
      let result = {}

      // Apply all extractors, but handle RawHtmlExtractor separately
      for (const extractor of this.extractors) {
        if (extractor instanceof RawHtmlExtractor) {
          // Use the absolutized element for HTML extraction
          Object.assign(result, extractor.extract(elementForHtmlExtraction))
        } else {
          // Use the original element for all other extractors
          Object.assign(result, extractor.extract(element))
        }
      }

      return result
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
