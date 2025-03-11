/**
 * Configuration for product selectors
 * Centralizes all DOM selectors for easy modification
 */
export class ProductConfig {
  constructor(config = {}) {
    this.selectors = {
      productContainer: config.productContainer || '.product-card-container',
      productName: config.productName || '.product-title__name',
      productPrice: config.productPrice || '.product-price__saleprice',
      productUnit: config.productUnit || '.product-title__qty',
      ...config.selectors
    };
    
    this.patterns = {
      price: config.pricePattern || /\$\s*(\d+\.\d+)/,
      pricePerUnit: config.pricePerUnitPattern || /\(\$\s*(\d+\.\d+)\s*\/\s*([^)]+)\)/,
      ...config.patterns
    };
    
    // Additional metadata
    this.websiteId = config.websiteId || 'default';
    this.extractionStrategy = config.extractionStrategy || 'standard';
  }
  
  /**
   * Create a configuration for a specific website
   * @param {string} websiteId - Website identifier
   * @param {Object} config - Configuration object
   * @return {ProductConfig} New product configuration
   */
  static forWebsite(websiteId, config = {}) {
    return new ProductConfig({
      ...config,
      websiteId
    });
  }
}

