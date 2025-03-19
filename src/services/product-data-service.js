import { DataTransformer } from "../core/data-transformer.js"
import { ClipboardService } from "../core/clipboard-service.js"

/**
 * Main service orchestrating the extraction process
 * Follows Dependency Inversion Principle - dependencies are injected
 */
export class ProductDataService {
  /**
   * Create a new ProductDataService
   * @param {ProductConfig} config - Configuration object
   * @param {ProductSelector} selector - Selector for finding products
   * @param {ProductExtractor} extractor - Extractor for product data
   */
  constructor(config, selector, extractor) {
    this.config = config
    this.selector = selector
    this.extractor = extractor
  }

  /**
   * Extract all products from the page
   * @return {Array} Array of product data
   */
  extractAllProducts() {
    try {
      const productElements = this.selector.findAllProducts()
      console.log(`Found ${productElements.length} product elements`)

      // Extract information from each product element
      const products = productElements.map((element) => this.extractor.extractProductInfo(element))

      return products.filter((product) => product.name !== "N/A" && product.name !== "Error")
    } catch (error) {
      console.error("Error extracting all products:", error)
      return []
    }
  }

  /**
   * Extract products and format the data
   * @param {string} format - Output format
   * @return {Object} Formatted data
   */
  getFormattedData(format = "json") {
    const products = this.extractAllProducts()
    const formattedData = DataTransformer.formatAsJson(products)
    return formattedData
  }

  /**
   * Extract products and return them
   * @return {Array} Array of product objects
   */
  extractProducts() {
    return this.extractAllProducts()
  }

  /**
   * Extract products and copy to clipboard
   * @param {string} format - Output format
   * @return {Promise<Object>} Extracted data
   */
  async extractProductsToClipboard(format = "json") {
    try {
      console.log("Starting product extraction...")

      // Get formatted data
      const data = this.getFormattedData(format)

      if (data.products.length === 0) {
        console.warn("No products found. Check the page structure or selectors.")
        return data
      }

      // Serialize the data
      const serialized = DataTransformer.serialize(data, format)

      // Copy to clipboard
      await ClipboardService.copyToClipboard(serialized)

      // Display success message
      console.log("✅ Success! Product data copied to clipboard.")
      console.log("Sample of extracted data:", data.products.slice(0, 2))

      return data
    } catch (error) {
      console.error("❌ Error extracting products:", error)
      throw error
    }
  }
}
