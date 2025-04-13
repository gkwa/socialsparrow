import { UrlCleanerInterface } from "./url-cleaner-interface.js"
import { GenericUrlCleaner } from "./generic-url-cleaner.js"

/**
 * Walmart-specific URL cleaner strategy
 */
export class WalmartUrlCleaner extends UrlCleanerInterface {
  constructor() {
    super()
    this.genericCleaner = new GenericUrlCleaner()
  }

  /**
   * Check if this cleaner can handle the given URL
   * @param {string} url - The URL to check
   * @return {boolean} True if this is a Walmart URL
   */
  canHandle(url) {
    return url && typeof url === "string" && url.includes("walmart.com")
  }

  /**
   * Clean a Walmart URL
   * @param {string} url - The Walmart URL to clean
   * @return {string} Cleaned Walmart URL
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

      let cleanParsedUrl
      try {
        cleanParsedUrl = new URL(partiallyCleanedUrl)
      } catch (e) {
        // If URL parsing fails after generic cleaning, return the original URL
        return url
      }

      // Check for Walmart tracking/redirect URLs
      const redirectUrl = cleanParsedUrl.searchParams.get("rd")
      if (redirectUrl) {
        try {
          // Parse the redirect URL
          const redirectParsed = new URL(decodeURIComponent(redirectUrl))

          // If the redirected URL contains a product path
          if (redirectParsed.pathname.includes("/ip/")) {
            const productMatch = redirectParsed.pathname.match(/\/ip\/([^/]+\/\d+)/)
            if (productMatch && productMatch[1]) {
              return `${redirectParsed.origin}/ip/${productMatch[1]}`
            }
          }
        } catch (redirectError) {
          // If redirect URL parsing fails, continue with existing URL
        }
      }

      // Check for direct product URLs
      if (cleanParsedUrl.pathname.includes("/ip/")) {
        const productMatch = cleanParsedUrl.pathname.match(/\/ip\/([^/]+\/\d+)/)
        if (productMatch && productMatch[1]) {
          return `${cleanParsedUrl.origin}/ip/${productMatch[1]}`
        }
      }

      // Fallback to generic cleaned URL
      return partiallyCleanedUrl
    } catch (error) {
      // Catch-all to return original URL if any unexpected error occurs
      return url
    }
  }

  /**
   * Clean Walmart URLs in HTML content
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    try {
      // Regular expression to find Walmart URLs in the HTML
      const walmartUrlRegex = /(https?:\/\/(?:www\.)?walmart\.com\/[^\s"']+)/g

      return html.replace(walmartUrlRegex, (match) => {
        // Clean the URL
        const cleanedUrl = this.clean(match)
        return cleanedUrl
      })
    } catch (error) {
      console.error("Error cleaning Walmart URLs in HTML:", error)
      return html // Return original HTML if cleaning fails
    }
  }
}
