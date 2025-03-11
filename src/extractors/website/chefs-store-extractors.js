import { BaseExtractor } from '../base-extractor.js';

/**
 * Chef's Store Name Extractor
 */
export class ChefsStoreNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName);
    let name = 'N/A';
    let url = 'N/A';
    
    if (nameElement) {
      name = nameElement.textContent.trim();
      // Extract product number if available
      const productNumber = element.querySelector(this.config.selectors.productNumber);
      if (productNumber) {
        name = name.replace(productNumber.textContent.trim(), '').trim();
      }
      
      // Get URL from the anchor tag
      url = element.getAttribute('href') || element.closest('a')?.getAttribute('href') || 'N/A';
      
      // Make URL absolute if it's relative
      if (url !== 'N/A' && url.startsWith('/')) {
        url = `${window.location.origin}${url}`;
      }
    }
    
    return { name, url };
  }
}

/**
 * Chef's Store Unit Price Extractor
 */
export class ChefsStoreUnitPriceExtractor extends BaseExtractor {
  extract(element) {
    // Unit price components (first price wrapper)
    const priceWrappers = element.querySelectorAll(this.config.selectors.productPriceWrapper);
    if (priceWrappers.length === 0) return { unitPrice: 'N/A', unitPriceType: 'N/A' };
    
    const unitPriceWrapper = priceWrappers[0];
    const dollarElement = unitPriceWrapper.querySelector(this.config.selectors.productPriceDollar);
    const priceElement = unitPriceWrapper.querySelector(this.config.selectors.productPrice);
    const centsElement = unitPriceWrapper.querySelector(this.config.selectors.productPriceCents);
    
    let unitPrice = 'N/A';
    let unitPriceType = 'N/A';
    
    if (dollarElement && priceElement) {
      // Construct the price from components
      const dollars = dollarElement.textContent.trim();
      const mainPrice = priceElement.textContent.trim();
      const cents = centsElement ? centsElement.textContent.trim() : '';
      
      unitPrice = `${dollars}${mainPrice}${cents}`;
      
      // Get price label (Unit, Case, etc.)
      const priceLabel = unitPriceWrapper.querySelector(this.config.selectors.productPriceLabel);
      if (priceLabel) {
        unitPriceType = priceLabel.textContent.trim();
      }
    }
    
    return { unitPrice, unitPriceType };
  }
}

/**
 * Chef's Store Case Price Extractor
 */
export class ChefsStoreCasePriceExtractor extends BaseExtractor {
  extract(element) {
    // Case price components (second price wrapper)
    const priceWrappers = element.querySelectorAll(this.config.selectors.productPriceWrapper);
    if (priceWrappers.length < 2) return { casePrice: 'N/A', casePriceType: 'N/A' };
    
    const casePriceWrapper = priceWrappers[1];
    const dollarElement = casePriceWrapper.querySelector(this.config.selectors.productPriceDollar);
    const priceElement = casePriceWrapper.querySelector(this.config.selectors.productPrice);
    const centsElement = casePriceWrapper.querySelector(this.config.selectors.productPriceCents);
    
    let casePrice = 'N/A';
    let casePriceType = 'N/A';
    
    if (dollarElement && priceElement) {
      // Construct the price from components
      const dollars = dollarElement.textContent.trim();
      const mainPrice = priceElement.textContent.trim();
      const cents = centsElement ? centsElement.textContent.trim() : '';
      
      casePrice = `${dollars}${mainPrice}${cents}`;
      
      // Get price label (Unit, Case, etc.)
      const priceLabel = casePriceWrapper.querySelector(this.config.selectors.productPriceLabel);
      if (priceLabel) {
        casePriceType = priceLabel.textContent.trim();
      }
    }
    
    return { casePrice, casePriceType };
  }
}

/**
 * Chef's Store Size Extractor
 */
export class ChefsStoreSizeExtractor extends BaseExtractor {
  extract(element) {
    const sizeElements = element.querySelectorAll(this.config.selectors.productSize);
    const unitSize = sizeElements.length > 0 ? sizeElements[0].textContent.trim() : 'N/A';
    const caseSize = sizeElements.length > 2 ? sizeElements[2].textContent.trim() : 'N/A';
    
    return { unitSize, caseSize };
  }
}

/**
 * Chef's Store Product Number Extractor
 */
export class ChefsStoreProductNumberExtractor extends BaseExtractor {
  extract(element) {
    const productNumber = element.querySelector(this.config.selectors.productNumber);
    return {
      productNumber: productNumber ? productNumber.textContent.trim() : 'N/A'
    };
  }
}

