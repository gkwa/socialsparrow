import { UrlCleanerInterface } from "./url-cleaner-interface.js"

/**
 * Generic URL cleaner that removes common tracking parameters
 */
export class GenericUrlCleaner extends UrlCleanerInterface {
  /**
   * Check if this cleaner can handle the given URL
   * @param {string} url - The URL to check
   * @return {boolean} Always returns true as this is a fallback cleaner
   */
  canHandle(url) {
    return true // Generic cleaner can handle any URL
  }

  /**
   * Clean a URL by removing common tracking parameters
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

      this._removeTrackingParameters(parsedUrl)

      // Return URL without tracking parameters
      return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error in GenericUrlCleaner:", error)
      }
      return url
    }
  }

  /**
   * Remove common tracking parameters from a URL
   * @private
   * @param {URL} parsedUrl - The parsed URL object
   */
  _removeTrackingParameters(parsedUrl) {
    // List of common tracking parameters to remove
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ocid",
      "ncid",
      "ref",
      "referrer",
      "mc_cid",
      "mc_eid",
      "tag",
      "yclid",
      "twclid",
      "igshid",
      "linkId",
      "cid",
      "mkt_tok",
    ]

    // Remove tracking parameters
    trackingParams.forEach((param) => {
      parsedUrl.searchParams.delete(param)
    })
  }

  /**
   * Clean generic URLs in HTML content
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    try {
      // Regular expression to find URLs in HTML content
      const urlRegex = /(https?:\/\/[^\s"'<>]+)/g

      return html.replace(urlRegex, (match) => {
        // Skip URLs that are handled by more specific cleaners
        if (match.includes("amazon.")) {
          return match // Will be handled by AmazonUrlCleaner
        }

        // Clean other URLs
        const cleanedUrl = this.clean(match)
        return cleanedUrl
      })
    } catch (error) {
      console.error("Error cleaning generic URLs in HTML:", error)
      return html // Return original HTML if cleaning fails
    }
  }
}
