import { AmazonUrlCleaner } from "./amazon-url-cleaner.js"
import { GenericUrlCleaner } from "./generic-url-cleaner.js"
import { SafewayAlbertsonsUrlCleaner } from "./safeway-albertsons-url-cleaner.js"
import { WalmartUrlCleaner } from "./walmart-url-cleaner.js"

/**
 * Factory for creating URL cleaners based on the URL type
 * Follows the Factory Method Pattern
 */
export class UrlCleanerFactory {
  /**
   * Get all available URL cleaners
   * @return {Array} Array of URL cleaner instances
   */
  static getAllCleaners() {
    return [
      new AmazonUrlCleaner(),
      new SafewayAlbertsonsUrlCleaner(),
      new WalmartUrlCleaner(),
      new GenericUrlCleaner(), // Generic cleaner should always be last as a fallback
    ]
  }

  /**
   * Create a URL cleaner appropriate for the given URL
   * @param {string} url - The URL to be cleaned
   * @return {UrlCleanerInterface} An appropriate URL cleaner
   */
  static createForUrl(url) {
    try {
      // Basic validation
      if (!url || typeof url !== "string" || url.trim() === "") {
        return new GenericUrlCleaner()
      }

      // Get all cleaners and find the first one that can handle this URL
      const cleaners = this.getAllCleaners()
      for (const cleaner of cleaners) {
        if (cleaner.canHandle(url)) {
          return cleaner
        }
      }

      // Default to the generic cleaner if no specific cleaner is found
      return new GenericUrlCleaner()
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error creating URL cleaner:", error)
      }
      return new GenericUrlCleaner()
    }
  }
}
