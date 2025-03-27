import { DataTransformer } from "../core/data-transformer.js"
import { ClipboardService } from "../core/clipboard-service.js"
import { SearchParamExtractorFactory } from "./search-param-extractor-factory.js"
import { WebsiteDetector } from "./website-detector.js"
import { GenericSearchParamExtractor } from "../extractors/search-param/generic-search-param-extractor.js"

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
    this.websiteId = config.websiteId
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
   * Extract search term from current URL using appropriate extractor
   * @return {string|null} Extracted search term or null if not found
   */
  extractSearchTerm() {
    try {
      const currentUrl = window.location.href

      // First try the website-specific extractor
      const searchParamExtractor = SearchParamExtractorFactory.createForWebsite(this.websiteId)
      const searchTerm = searchParamExtractor.extractSearchTerm(currentUrl)

      if (searchTerm) {
        console.log(`Found search term using ${this.websiteId} extractor: ${searchTerm}`)
        return searchTerm
      }

      // Fall back to generic extractor if specific one doesn't work
      const genericExtractor = new GenericSearchParamExtractor()
      const genericSearchTerm = genericExtractor.extractSearchTerm(currentUrl)

      if (genericSearchTerm) {
        console.log(`Found search term using generic extractor: ${genericSearchTerm}`)
        return genericSearchTerm
      }

      // Additional logging to debug the URL parsing
      console.log(`Could not extract search term from URL: ${currentUrl}`)

      // Last resort: Check if we can extract the search term from the page title
      if (document.title) {
        const titleMatch = document.title.match(
          /search results for "?([^"]+)"?|"?([^"]+)"? search results/i,
        )
        if (titleMatch) {
          const titleSearchTerm = titleMatch[1] || titleMatch[2]
          console.log(`Extracted search term from page title: ${titleSearchTerm}`)
          return titleSearchTerm
        }
      }

      return null
    } catch (error) {
      console.error("Error extracting search term:", error)
      return null
    }
  }

  /**
   * Extract products and format the data
   * @param {string} format - Output format
   * @return {Object} Formatted data
   */
  getFormattedData(format = "json") {
    const products = this.extractAllProducts()

    // Extract search term with fallbacks
    const searchTerm = this.extractSearchTerm()

    // For debugging, log the search term if found
    if (searchTerm) {
      console.log(`Search term extracted: "${searchTerm}"`)
    } else {
      console.log("No search term could be extracted from the URL")
    }

    // Format with search term if available
    const formattedData = DataTransformer.formatAsJson(products, { searchTerm })

    // Extra debugging: check if the search term was added to products
    if (formattedData.products.length > 0 && searchTerm) {
      console.log(`Search term in first product as category: ${formattedData.products[0].category}`)
    }

    return formattedData
  }

  /**
   * Extract products and return them
   * @return {Object} Formatted data with products and search term
   */
  extractProducts() {
    return this.getFormattedData("json")
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
