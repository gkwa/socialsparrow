/**
 * Data transformer class
 * Single responsibility: formatting data for output
 */
export class DataTransformer {
  /**
   * Format product data as JSON
   * @param {Array} products - Array of product objects
   * @return {Object} Formatted data object
   */
  static formatAsJson(products) {
    const timestamp = new Date().toISOString();

    // Add timestamp to each product
    const productsWithTimestamp = products.map(product => ({
      ...product,
      timestamp
    }));

    // Return the data object without timestamp at top level
    return {
      products: productsWithTimestamp,
      totalProducts: products.length
    };
  }
  
  /**
   * Serialize data to string
   * @param {Object} data - Data object
   * @param {string} format - Output format (json, csv, etc.)
   * @return {string} Serialized data
   */
  static serialize(data, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      // Add support for other formats as needed
      default:
        return JSON.stringify(data, null, 2);
    }
  }
}
