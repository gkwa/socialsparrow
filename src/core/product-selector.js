/**
 * Responsible for finding product elements in the DOM
 * Single responsibility: locating elements
 */
export class ProductSelector {
  constructor(config) {
    this.config = config;
  }
  
  /**
   * Find all product elements on the page
   * @return {Array<HTMLElement>} Array of product elements
   */
  findAllProducts() {
    try {
      const productElements = document.querySelectorAll(this.config.selectors.productContainer);
      return Array.from(productElements);
    } catch (error) {
      console.error('Error finding product elements:', error);
      return [];
    }
  }
}

