/**
 * Service for URL operations
 * Single responsibility: handling URL cleaning and manipulation
 */
import { UrlCleanerFactory } from "./url-cleaning/url-cleaner-factory.js"

export class UrlService {
  /**
   * Clean a URL to remove tracking parameters
   * @param {string} url - The URL to clean
   * @return {string} Cleaned URL
   */
  static cleanUrl(url) {
    try {
      // Basic validation - if not a string or empty, return as is
      if (!url || typeof url !== "string" || url.trim() === "") {
        return url
      }
      // Handle URLs that are already cleaned or special cases
      if (url === "N/A" || url === "Error") {
        return url
      }
      // Even if URL validation fails, try to clean it using the appropriate cleaner
      const urlCleaner = UrlCleanerFactory.createForUrl(url)
      return urlCleaner.clean(url)
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error cleaning URL:", error)
      }
      return url // Return original URL if cleaning fails
    }
  }

  /**
   * Normalize image URLs by adding protocol if missing and cleaning parameters
   * @param {string} imageUrl - The image URL to normalize
   * @return {string} Normalized image URL
   */
  static normalizeImageUrl(imageUrl) {
    if (!imageUrl || imageUrl === "N/A" || imageUrl === "Error") {
      return imageUrl
    }

    try {
      // Add https: prefix if the URL starts with double slashes
      if (imageUrl.startsWith("//")) {
        imageUrl = "https:" + imageUrl
      }

      // For specific domains, clean up the URL
      if (imageUrl.includes("albertsons-media.com") || imageUrl.includes("safeway.com")) {
        // Extract the base image ID by removing parameters
        const baseUrlMatch = imageUrl.match(/([^?]+)/)
        if (baseUrlMatch && baseUrlMatch[1]) {
          imageUrl = baseUrlMatch[1]
        }
      }

      return imageUrl
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error normalizing image URL:", error)
      }
      return imageUrl
    }
  }
}

// Export the URL cleaner classes from the strategy pattern implementation
export { BaseUrlCleaner } from "./url-absolutizer.js"
export { GenericUrlCleaner } from "./url-cleaning/generic-url-cleaner.js"
export { AmazonUrlCleaner } from "./url-cleaning/amazon-url-cleaner.js"
export { SafewayAlbertsonsUrlCleaner } from "./url-cleaning/safeway-albertsons-url-cleaner.js"
export { WalmartUrlCleaner } from "./url-cleaning/walmart-url-cleaner.js"
export { UrlCleanerFactory } from "./url-cleaning/url-cleaner-factory.js"
