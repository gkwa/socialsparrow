import { BaseExtractor } from "./base-extractor.js"
import { NameExtractor } from "./generic/name-extractor.js"
import { PriceExtractor } from "./generic/price-extractor.js"
import { PricePerUnitExtractor } from "./generic/price-per-unit-extractor.js"
import { RawTextExtractor } from "./generic/raw-text-extractor.js"
import { RawHtmlExtractor } from "./generic/raw-html-extractor.js"
import { UrlAbsolutizer, UrlProcessor } from "../core/url-absolutizer.js"
import { UrlService, UrlCleanerFactory } from "../core/url-service.js"

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
      // For HTML extraction, we need to ensure all URLs are absolute and cleaned
      let elementForHtmlExtraction = element

      // If URL absolutization is enabled
      if (this.absolutizeUrls) {
        // Get appropriate URL cleaner
        const urlCleaner = UrlCleanerFactory.createForUrl(window.location.href)

        // Use the UrlProcessor to combine absolutization and cleaning
        elementForHtmlExtraction = UrlProcessor.cloneWithProcessedUrls(element, urlCleaner)

        // Additionally, clean image URLs in the clone specifically for websites
        this.cleanImageUrlsInElement(elementForHtmlExtraction)
      }

      // Create result object
      let result = {}

      // Apply all extractors, but handle RawHtmlExtractor separately
      for (const extractor of this.extractors) {
        if (extractor instanceof RawHtmlExtractor) {
          // Use the absolutized and cleaned element for HTML extraction
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

  /**
   * Clean image URLs in an element, particularly for specific websites
   * @param {HTMLElement} element - The element to process
   * @return {HTMLElement} The element with cleaned image URLs
   */
  cleanImageUrlsInElement(element) {
    try {
      // Find all image elements
      const images = element.querySelectorAll("img[src], img[data-src]")
      images.forEach((img) => {
        // Clean src attribute if present
        if (img.hasAttribute("src")) {
          let src = img.getAttribute("src")
          // Apply the same cleaning logic as in UrlService.normalizeImageUrl
          if (src.includes("albertsons-media.com") || src.includes("safeway.com")) {
            const baseUrlMatch = src.match(/([^?]+)/)
            if (baseUrlMatch && baseUrlMatch[1]) {
              img.setAttribute("src", baseUrlMatch[1])
            }
          }
        }

        // Clean data-src attribute if present
        if (img.hasAttribute("data-src")) {
          let dataSrc = img.getAttribute("data-src")
          if (dataSrc.includes("albertsons-media.com") || dataSrc.includes("safeway.com")) {
            const baseUrlMatch = dataSrc.match(/([^?]+)/)
            if (baseUrlMatch && baseUrlMatch[1]) {
              img.setAttribute("data-src", baseUrlMatch[1])
            }
          }
        }
      })

      // Find all source elements with srcset or data-srcset
      const sources = element.querySelectorAll("source[srcset], source[data-srcset]")
      sources.forEach((source) => {
        // Handle srcset attribute
        if (source.hasAttribute("srcset")) {
          let srcset = source.getAttribute("srcset")
          // Clean each URL in the srcset
          const newSrcset = srcset
            .split(",")
            .map((src) => {
              const parts = src.trim().split(" ")
              let url = parts[0]
              const descriptor = parts.slice(1).join(" ")

              if (url.includes("albertsons-media.com") || url.includes("safeway.com")) {
                const baseUrlMatch = url.match(/([^?]+)/)
                if (baseUrlMatch && baseUrlMatch[1]) {
                  url = baseUrlMatch[1]
                }
              }

              return url + (descriptor ? " " + descriptor : "")
            })
            .join(", ")

          source.setAttribute("srcset", newSrcset)
        }

        // Handle data-srcset attribute
        if (source.hasAttribute("data-srcset")) {
          let dataSrcset = source.getAttribute("data-srcset")
          // Clean each URL in the data-srcset
          const newDataSrcset = dataSrcset
            .split(",")
            .map((src) => {
              const parts = src.trim().split(" ")
              let url = parts[0]
              const descriptor = parts.slice(1).join(" ")

              if (url.includes("albertsons-media.com") || url.includes("safeway.com")) {
                const baseUrlMatch = url.match(/([^?]+)/)
                if (baseUrlMatch && baseUrlMatch[1]) {
                  url = baseUrlMatch[1]
                }
              }

              return url + (descriptor ? " " + descriptor : "")
            })
            .join(", ")

          source.setAttribute("data-srcset", newDataSrcset)
        }
      })

      return element
    } catch (error) {
      console.error("Error cleaning image URLs in element:", error)
      return element
    }
  }
}
