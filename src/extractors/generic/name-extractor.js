import { BaseExtractor } from '../base-extractor.js';

/**
 * Extracts product name from a product element
 */
export class NameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName);
    let name = nameElement ? nameElement.textContent.trim() : 'N/A';
    let url = 'N/A';
    
    // Get URL based on website configuration
    if (this.config.websiteId === 'qfc') {
      // QFC specific URL extraction
      const linkElements = element.querySelectorAll('a.kds-Link[href*="/p/"]');
      // Find the link that contains the product description (not just the image)
      const productLink = Array.from(linkElements).find(link => 
        link.textContent.trim().length > 0 || link.getAttribute('aria-label')?.includes(name)
      );
      
      url = productLink ? productLink.getAttribute('href') : 'N/A';
    } else {
      // Default URL extraction for other websites
      const linkElement = nameElement && nameElement.tagName === 'A' 
        ? nameElement 
        : nameElement?.closest('a');
      
      url = linkElement ? linkElement.getAttribute('href') : 'N/A';
    }
    
    // Make URL absolute if it's relative
    if (url !== 'N/A' && url.startsWith('/')) {
      url = `${window.location.origin}${url}`;
    }
    
    return { name, url };
  }
}

