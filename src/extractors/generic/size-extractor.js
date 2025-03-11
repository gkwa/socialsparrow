import { BaseExtractor } from '../base-extractor.js';

/**
 * Extract size information from a product element
 */
export class SizeExtractor extends BaseExtractor {
  extract(element) {
    const sizingElements = element.querySelectorAll(this.config.selectors.productSize);
    return {
      size: sizingElements.length > 1 ? sizingElements[1].textContent.trim() : 'N/A'
    };
  }
}

