import { BaseExtractor } from '../base-extractor.js';

/**
 * Extracts price per unit from a product element
 */
export class PricePerUnitExtractor extends BaseExtractor {
  extract(element) {
    const unitElement = element.querySelector(this.config.selectors.productUnit);
    const unitText = unitElement ? unitElement.textContent.trim() : 'N/A';
    
    // Extract the price per unit using regex
    const match = unitText.match(this.config.patterns.pricePerUnit);
    const pricePerUnit = match ? `$${match[1]} per ${match[2]}` : 'N/A';
    
    return { pricePerUnit };
  }
}

