import { BaseExtractor } from '../base-extractor.js';

/**
 * Extracts product name from a product element
 */
export class NameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName);
    return {
      name: nameElement ? nameElement.textContent.trim() : 'N/A',
      url: nameElement ? nameElement.href : 'N/A'
    };
  }
}

