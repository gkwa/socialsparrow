/**
 * Responsible for finding product elements in the DOM
 * Single responsibility: locating elements
 */
export class ProductSelector {
  constructor(config) {
    this.config = config
  }

  /**
   * Find all product elements on the page
   * @return {Array<HTMLElement>} Array of product elements
   */
  findAllProducts() {
    try {
      const productElements = document.querySelectorAll(this.config.selectors.productContainer)
      return Array.from(productElements)
    } catch (error) {
      console.error("Error finding product elements:", error)
      return []
    }
  }

  /**
   * Find a specific product element by ID or other identifier
   * @param {string} productId - ID or other identifier of the product
   * @return {HTMLElement|null} Product element or null if not found
   */
  findProductById(productId) {
    try {
      if (!productId) return null

      const productElements = this.findAllProducts()

      // First try to find by data-asin (Amazon product ID)
      const productElement = productElements.find(
        (el) =>
          el.getAttribute("data-asin") === productId ||
          el.getAttribute("data-uuid") === productId ||
          el.id === productId,
      )

      return productElement || null
    } catch (error) {
      console.error("Error finding product by ID:", error)
      return null
    }
  }
}
