/**
 * Service for URL operations
 * Single responsibility: handling URL cleaning and manipulation
 */
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

/**
 * Base interface for URL cleaners
 * Follows Interface Segregation Principle
 */
export class BaseUrlCleaner {
  /**
   * Clean a URL
   * @param {string} url - The URL to clean
   * @return {string} Cleaned URL
   */
  clean(url) {
    throw new Error("Method must be implemented by subclass")
  }

  /**
   * Apply cleaning to all URLs in an element
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} Element with cleaned URLs
   */
  cleanUrlsInElement(element) {
    try {
      if (!element) return element

      // Find all anchor elements with href attributes
      const links = element.querySelectorAll("a[href]")
      links.forEach((link) => {
        const href = link.getAttribute("href")
        if (href && href.trim() !== "") {
          const cleanedUrl = this.clean(href)
          if (cleanedUrl) {
            link.setAttribute("href", cleanedUrl)
          }
        }
      })
      return element
    } catch (error) {
      console.error("Error cleaning URLs in element:", error)
      return element
    }
  }

  /**
   * Create a clone of the element with all URLs cleaned
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} A cloned element with cleaned URLs
   */
  cloneWithCleanUrls(element) {
    try {
      // Clone the element
      const clone = element.cloneNode(true)
      // Clean URLs in the clone
      return this.cleanUrlsInElement(clone)
    } catch (error) {
      console.error("Error cloning and cleaning URLs:", error)
      // Return a simple clone if operation fails
      return element.cloneNode(true)
    }
  }
}

/**
 * Generic URL cleaner that removes common tracking parameters
 */
export class GenericUrlCleaner extends BaseUrlCleaner {
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
      ]
      // Remove tracking parameters
      trackingParams.forEach((param) => {
        parsedUrl.searchParams.delete(param)
      })
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
}

/**
 * Amazon-specific URL cleaner
 */
export class AmazonUrlCleaner extends BaseUrlCleaner {
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

      let parsedUrl
      try {
        parsedUrl = new URL(url)
      } catch (e) {
        // If URL is invalid, return it as is
        return url
      }

      // First apply generic cleaning to remove common tracking parameters
      const genericCleaner = new GenericUrlCleaner()
      let partiallyCleanedUrl
      try {
        partiallyCleanedUrl = genericCleaner.clean(url)
      } catch (e) {
        // If generic cleaning fails, continue with the original URL
        partiallyCleanedUrl = url
      }

      let reParsedUrl
      try {
        reParsedUrl = new URL(partiallyCleanedUrl)
      } catch (e) {
        // If URL parsing fails after generic cleaning, return the original URL
        return url
      }

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
      // If this is not a product URL or we couldn't find the product ID pattern,
      // return the URL with just tracking parameters removed
      return `${reParsedUrl.origin}${reParsedUrl.pathname}${reParsedUrl.search ? reParsedUrl.search : ""}`
    } catch (error) {
      // Only log in non-test environments, using a browser-safe check
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "test") {
        console.error("Error in AmazonUrlCleaner:", error)
      }
      return url
    }
  }
}

/**
 * Safeway/Albertsons URL cleaner
 */
export class SafewayAlbertsonsUrlCleaner extends BaseUrlCleaner {
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
      const genericCleaner = new GenericUrlCleaner()
      let partiallyCleanedUrl
      try {
        partiallyCleanedUrl = genericCleaner.clean(url)
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
}

/**
 * Walmart-specific URL cleaner
 */
export class WalmartUrlCleaner extends BaseUrlCleaner {
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
      const genericCleaner = new GenericUrlCleaner()
      let partiallyCleanedUrl
      try {
        partiallyCleanedUrl = genericCleaner.clean(url)
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
}

/**
 * Factory for creating URL cleaners based on the URL
 */
export class UrlCleanerFactory {
  /**
   * Create a URL cleaner appropriate for the given URL
   * @param {string} url - The URL to be cleaned
   * @return {BaseUrlCleaner} An appropriate URL cleaner
   */
  static createForUrl(url) {
    try {
      // Basic validation
      if (!url || typeof url !== "string" || url.trim() === "") {
        return new GenericUrlCleaner()
      }

      // Check the domain to determine which cleaner to use
      if (url.includes("amazon.")) {
        return new AmazonUrlCleaner()
      } else if (url.includes("safeway.com") || url.includes("albertsons.com")) {
        return new SafewayAlbertsonsUrlCleaner()
      } else if (url.includes("walmart.com")) {
        return new WalmartUrlCleaner()
      }
      // Default to the generic cleaner
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
