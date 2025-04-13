import { UrlCleanerInterface } from "./url-cleaner-interface.js"
import { GenericUrlCleaner } from "./generic-url-cleaner.js"

/**
 * Safeway/Albertsons URL cleaner strategy
 */
export class SafewayAlbertsonsUrlCleaner extends UrlCleanerInterface {
  constructor() {
    super()
    this.genericCleaner = new GenericUrlCleaner()
  }

  /**
   * Check if this cleaner can handle the given URL
   * @param {string} url - The URL to check
   * @return {boolean} True if this is a Safeway or Albertsons URL
   */
  canHandle(url) {
    return (
      url &&
      typeof url === "string" &&
      (url.includes("safeway.com") || url.includes("albertsons.com"))
    )
  }

  /**
   * Clean a Safeway or Albertsons URL
   * @param {string} url - The URL to clean
   * @return {string} Cleaned URL
   */
  clean(url) {
    try {
      // Basic validation
      if (!url || typeof url !== "string" || url.trim() === "") {
        return url
      }

      let parsedUrl
      try {
        parsedUrl = new URL(url)
      } catch (e) {
        // If URL is invalid, return it as is
        return url
      }

      // First apply generic cleaning to remove common tracking parameters
      let partiallyCleanedUrl
      try {
        partiallyCleanedUrl = this.genericCleaner.clean(url)
      } catch (e) {
        // If generic cleaning fails, continue with the original URL
        partiallyCleanedUrl = url
      }

      // Check for product detail URLs
      if (parsedUrl.pathname.includes("/shop/product-details")) {
        // Extract the product ID from the pathname
        const productIdMatch = parsedUrl.pathname.match(/product-details\.(\d+)\.html/)
        if (productIdMatch && productIdMatch[1]) {
          const productId = productIdMatch[1]
          // Construct a clean product URL
          return `${parsedUrl.origin}/shop/product-details.${productId}.html`
        }
      }
      // If this is not a product URL or we couldn't find the product ID pattern,
      // return the URL with just tracking parameters removed
      return partiallyCleanedUrl
    } catch (error) {
      console.error("Error in SafewayAlbertsonsUrlCleaner:", error)
      return url
    }
  }

  /**
   * Clean Safeway/Albertsons URLs in HTML content
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    try {
      // Regular expression to find Safeway or Albertsons URLs in the HTML
      const safewayUrlRegex = /(https?:\/\/(?:www\.)?(?:safeway|albertsons)\.com\/[^\s"']+)/g

      return html.replace(safewayUrlRegex, (match) => {
        // Clean the URL
        const cleanedUrl = this.clean(match)
        return cleanedUrl
      })
    } catch (error) {
      console.error("Error cleaning Safeway/Albertsons URLs in HTML:", error)
      return html // Return original HTML if cleaning fails
    }
  }
}
