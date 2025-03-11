import { BaseExtractor } from '../base-extractor.js';

/**
 * Extracts product name from a product element
 */
export class NameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName);
    let url = 'N/A';

    // Get URL from link based on website configuration
    if (this.config.websiteId === 'qfc') {
      // QFC specific URL extraction
      const linkElement = element.querySelector(this.config.selectors.productLink);
      url = linkElement ? linkElement.getAttribute('href') : 'N/A';

      // Make URL absolute if it's relative
      if (url !== 'N/A' && url.startsWith('/')) {
        url = `${window.location.origin}${url}`;
      }
    }

    return {
      name: nameElement ? nameElement.textContent.trim() : 'N/A',
      url: url
    };
  }
}

