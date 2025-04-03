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
}
