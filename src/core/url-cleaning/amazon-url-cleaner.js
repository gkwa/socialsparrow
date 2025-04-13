import { UrlCleanerInterface } from "./url-cleaner-interface.js"

/**
 * Amazon-specific URL cleaner strategy
 */
export class AmazonUrlCleaner extends UrlCleanerInterface {
  /**
   * Check if this cleaner can handle the given URL
   * @param {string} url - The URL to check
   * @return {boolean} True if this is an Amazon URL
   */
  canHandle(url) {
    return url && typeof url === "string" && url.includes("amazon.")
  }

  /**
   * Clean an Amazon URL, removing tracking parameters and keeping only essential parts
   * @param {string} url - The Amazon URL to clean
   * @return {string} Cleaned Amazon URL
   */
  clean(url) {
    try {
      // Basic validation
      if (!url || typeof url !== "string" || url.trim() === "") {
        return url
      }

      // Handle the case of Amazon redirect or SSP click links
      if (url.includes("amazon.com/sspa/click") || url.includes("amazon.com/sp/click")) {
        const encodedRedirectMatch = url.match(/url=([^&]+)/)
        if (encodedRedirectMatch && encodedRedirectMatch[1]) {
          try {
            // Decode the redirect URL and then clean it
            const decodedUrl = decodeURIComponent(encodedRedirectMatch[1])

            // If the decoded URL is a relative path (starts with /), add the Amazon origin
            if (decodedUrl.startsWith("/")) {
              // Extract the origin from the original URL
              const originalUrlObj = new URL(url)
              const amazonUrl = `${originalUrlObj.origin}${decodedUrl}`
              // Recursively clean the complete Amazon URL
              return this.clean(amazonUrl)
            }

            // Otherwise, recursively clean the decoded URL
            return this.clean(decodedUrl)
          } catch (e) {
            // If decoding fails, continue with normal cleaning
          }
        }
      }

      let parsedUrl
      try {
        parsedUrl = new URL(url)
      } catch (e) {
        // If URL is invalid, return it as is
        return url
      }

      // Remove common tracking parameters
      this._removeTrackingParameters(parsedUrl)

      // Check for standard product URL with /dp/ pattern
      if (parsedUrl.hostname.includes("amazon.") && parsedUrl.pathname.includes("/dp/")) {
        // Find the product ID section
        const dpMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/i)
        if (dpMatch && dpMatch[1]) {
          const productId = dpMatch[1]
          // Keep the product title for readability, but remove everything after the product ID
          const titleSection = parsedUrl.pathname.split("/dp/")[0]
          return `${parsedUrl.origin}${titleSection}/dp/${productId}`
        }
      }
      // Check for alternate product URL format with /gp/product/ pattern
      if (parsedUrl.hostname.includes("amazon.") && parsedUrl.pathname.includes("/gp/product/")) {
        // Find the product ID section
        const gpMatch = parsedUrl.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i)
        if (gpMatch && gpMatch[1]) {
          const productId = gpMatch[1]
          return `${parsedUrl.origin}/gp/product/${productId}`
        }
      }
      // Special case for Amazon search URLs
      if (parsedUrl.hostname.includes("amazon.") && parsedUrl.pathname === "/s") {
        return `${parsedUrl.origin}/s`
      }

      // Clean ref codes in the pathname (critical fix)
      if (parsedUrl.pathname.includes("/ref=")) {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/ref=.*$/, "")
      }

      // If this is not a product URL or we couldn't find the product ID pattern,
      // return the URL with just tracking parameters removed
      return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search ? parsedUrl.search : ""}`
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error in AmazonUrlCleaner:", error)
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
      // Additional Amazon-specific parameters
      "dib",
      "dib_tag",
      "keywords",
      "qid",
      "sbo",
      "sr",
      // Additional tracking parameters
      "psc",
      "sp_csd",
      "ie",
      "spc",
      "pd_rd_i",
      "pd_rd_w",
      "pd_rd_wg",
      "pf_rd_p",
      "pf_rd_r",
      "pd_rd_r",
      "_encoding",
      "pf_rd_s",
      "pf_rd_t",
    ]

    // Remove tracking parameters
    trackingParams.forEach((param) => {
      parsedUrl.searchParams.delete(param)
    })
  }

  /**
   * Clean Amazon URLs in HTML content
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned Amazon URLs
   */
  cleanUrlsInHtml(html) {
    try {
      // Use regular expression to find Amazon URLs in the HTML
      const amazonUrlRegex = /(https?:\/\/(?:www\.)?amazon\.[a-z.]+\/[^\s"']+)/g

      return html.replace(amazonUrlRegex, (match) => {
        // Clean the URL using the clean method
        const cleanedUrl = this.clean(match)
        return cleanedUrl
      })
    } catch (error) {
      console.error("Error cleaning Amazon URLs in HTML:", error)
      return html // Return original HTML if cleaning fails
    }
  }
}
