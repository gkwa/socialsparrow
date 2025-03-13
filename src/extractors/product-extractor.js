import { BaseExtractor } from './base-extractor.js';
import { NameExtractor } from './generic/name-extractor.js';
import { PriceExtractor } from './generic/price-extractor.js';
import { PricePerUnitExtractor } from './generic/price-per-unit-extractor.js';
import { RawTextExtractor } from './generic/raw-text-extractor.js';

/**
 * Composite extractor that combines multiple extractors
 * Follows Open/Closed Principle - can be extended with new extractors
 */
export class ProductExtractor {
  constructor(config) {
    this.config = config;
    this.extractors = [
      new NameExtractor(config),
      new PriceExtractor(config),
      new PricePerUnitExtractor(config),
      new RawTextExtractor(config) // Added the RawTextExtractor by default
    ];
  }
  
  /**
   * Add a custom extractor
   * @param {BaseExtractor} extractor - The extractor to add
   */
  addExtractor(extractor) {
    this.extractors.push(extractor);
  }
  
  /**
   * Set extractors (replacing existing ones)
   * @param {Array<BaseExtractor>} extractors - The extractors to set
   */
  setExtractors(extractors) {
    // Ensure the RawTextExtractor is always included
    const hasRawTextExtractor = extractors.some(e => e instanceof RawTextExtractor);

    if (!hasRawTextExtractor) {
      extractors.push(new RawTextExtractor(this.config));
    }

    this.extractors = extractors;
  }
  
  /**
   * Extract all product information from a product element
   * @param {HTMLElement} element - The product element
   * @return {Object} Product information
   */
  extractProductInfo(element) {
    try {
      // Apply all extractors and merge the results
      return this.extractors.reduce((result, extractor) => {
        return { ...result, ...extractor.extract(element) };
      }, {});
    } catch (error) {
      console.error('Error extracting product info:', error);
      return {
        name: 'Error',
        price: 'Error',
        pricePerUnit: 'Error',
        url: 'Error',
        rawTextContent: 'Error extracting content'
      };
    }
  }
}
