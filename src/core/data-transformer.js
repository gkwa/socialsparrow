/**
 * Data transformer class
 * Single responsibility: formatting data for output
 */
export class DataTransformer {
  /**
   * Format product data as JSON
   * @param {Array} products - Array of product objects
   * @param {Object} options - Additional options
   * @return {Object} Formatted data object
   */
  static formatAsJson(products, options = {}) {
    const timestamp = new Date().toISOString()
    // Add timestamp and search term (if available) to each product
    const productsWithMetadata = products.map((product) => {
      // Create a new object with product data plus metadata
      const productWithMetadata = {
        ...product,
        timestamp,
      }

      // Add search term as category if available
      if (options.searchTerm) {
        productWithMetadata.category = options.searchTerm
      }

      // Extract and add domain from URL if URL exists
      if (product.url && product.url !== "N/A") {
        try {
          const urlObj = new URL(product.url)
          productWithMetadata.domain = urlObj.hostname
        } catch (error) {
          console.warn("Could not extract domain from URL:", product.url)
          productWithMetadata.domain = "unknown"
        }
      } else {
        productWithMetadata.domain = "unknown"
      }

      return productWithMetadata
    })

    // Return the data object
    const formattedData = {
      products: productsWithMetadata,
      totalProducts: products.length,
    }

    // Add search term to top level if available
    if (options.searchTerm) {
      formattedData.searchTerm = options.searchTerm
    }

    return formattedData
  }

  /**
   * Serialize data to string
   * @param {Object} data - Data object
   * @param {string} format - Output format (json, csv, etc.)
   * @return {string} Serialized data
   */
  static serialize(data, format = "json") {
    switch (format.toLowerCase()) {
      case "json":
        return JSON.stringify(data, null, 2)
      // Add support for other formats as needed
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  /**
   * Encode HTML content to Base64
   * @param {string} html - HTML content to encode
   * @return {string} Base64 encoded HTML content
   */
  static encodeHtmlToBase64(html) {
    if (!html || html === "N/A") return html

    try {
      // First compress HTML by removing excessive whitespace
      const compressedHtml = html
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/>\s+</g, "><") // Remove whitespace between tags
        .replace(/<!--.*?-->/g, "") // Remove HTML comments
        .trim() // Trim whitespace from start and end

      // Convert to Base64
      // We need to use btoa for browsers and Buffer for Node.js environments
      if (typeof btoa === "function") {
        // Browser environment
        return btoa(unescape(encodeURIComponent(compressedHtml)))
      } else {
        // Node.js environment
        return Buffer.from(compressedHtml).toString("base64")
      }
    } catch (error) {
      console.error("Error encoding HTML to Base64:", error)
      return "N/A"
    }
  }

  /**
   * Decode Base64 encoded HTML content
   * @param {string} base64Html - Base64 encoded HTML content
   * @return {string} Decoded HTML content
   */
  static decodeBase64ToHtml(base64Html) {
    if (!base64Html || base64Html === "N/A") return base64Html

    try {
      // Convert from Base64
      if (typeof atob === "function") {
        // Browser environment
        return decodeURIComponent(escape(atob(base64Html)))
      } else {
        // Node.js environment
        return Buffer.from(base64Html, "base64").toString()
      }
    } catch (error) {
      console.error("Error decoding Base64 to HTML:", error)
      return "N/A"
    }
  }
}
