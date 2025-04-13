import { UrlCleanerFactory } from "./url-cleaner-factory.js"
import { AmazonUrlCleaner } from "./amazon-url-cleaner.js"
import { GenericUrlCleaner } from "./generic-url-cleaner.js"
import { SafewayAlbertsonsUrlCleaner } from "./safeway-albertsons-url-cleaner.js"
import { WalmartUrlCleaner } from "./walmart-url-cleaner.js"

/**
 * Provider for URL cleaning strategies
 * Acts as a facade for the various URL cleaning strategies
 */
export class UrlCleanerStrategyProvider {
  constructor() {
    // Initialize all cleaner strategies
    this.strategies = [
      new AmazonUrlCleaner(),
      new SafewayAlbertsonsUrlCleaner(),
      new WalmartUrlCleaner(),
      new GenericUrlCleaner(), // Generic cleaner should always be last as a fallback
    ]
  }

  /**
   * Export the factory for direct use
   */
  static get Factory() {
    return UrlCleanerFactory
  }

  /**
   * Clean URLs in HTML content using all available strategies
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    try {
      let cleanedHtml = html

      // Apply each strategy in order
      // Each strategy will only clean URLs it can handle
      for (const strategy of this.strategies) {
        cleanedHtml = strategy.cleanUrlsInHtml(cleanedHtml)
      }

      return cleanedHtml
    } catch (error) {
      console.error("Error in URL cleaner strategy provider:", error)
      return html // Return original HTML if cleaning fails
    }
  }

  /**
   * Clean a specific URL using the appropriate strategy
   * @param {string} url - The URL to clean
   * @return {string} Cleaned URL
   */
  cleanUrl(url) {
    try {
      // Find the first strategy that can handle this URL
      for (const strategy of this.strategies) {
        if (strategy.canHandle(url)) {
          return strategy.clean(url)
        }
      }

      // Fallback to the generic cleaner
      return new GenericUrlCleaner().clean(url)
    } catch (error) {
      console.error("Error cleaning URL:", error)
      return url // Return original URL if cleaning fails
    }
  }
}
