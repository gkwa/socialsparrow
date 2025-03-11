import { BaseExtractor } from '../base-extractor.js';

/**
 * Amazon Name Extractor
 */
export class AmazonNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName);
    let name = 'N/A';
    let url = 'N/A';

    if (nameElement) {
      name = nameElement.textContent.trim();

      // Get URL from the anchor tag
      const linkElement = nameElement.tagName === 'A'
        ? nameElement
        : nameElement.closest('a');

      url = linkElement ? linkElement.getAttribute('href') : 'N/A';

      // Make URL absolute if it's relative
      if (url !== 'N/A' && url.startsWith('/')) {
        url = `${window.location.origin}${url}`;
      }
    }

    return { name, url };
  }
}

/**
 * Amazon Price Extractor
 */
export class AmazonPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice);
    let price = 'N/A';

    if (priceElement) {
      price = priceElement.textContent.trim();

      // Extract the numeric price using regex if needed
      const priceMatch = price.match(this.config.patterns.price);
      if (priceMatch) {
        price = `$${priceMatch[1]}`;
      }
    }

    return { price };
  }
}

/**
 * Amazon Ratings Extractor
 */
export class AmazonRatingsExtractor extends BaseExtractor {
  extract(element) {
    const ratingsElement = element.querySelector(this.config.selectors.productRatings);
    let ratings = 'N/A';
    let reviewCount = 'N/A';

    if (ratingsElement) {
      // Get ratings text (e.g., "4.4 out of 5 stars")
      const ratingText = ratingsElement.getAttribute('aria-label') || ratingsElement.textContent.trim();
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s+out\s+of\s+(\d+)/i);
      if (ratingMatch) {
        ratings = ratingMatch[1];
      }

      // Try to find review count
      const reviewElement = element.querySelector(this.config.selectors.reviewCount);
      if (reviewElement) {
        reviewCount = reviewElement.textContent.trim().replace(/[(),]/g, '');
      }
    }

    return { ratings, reviewCount };
  }
}

/**
 * Amazon Size/Variant Extractor
 */
export class AmazonVariantExtractor extends BaseExtractor {
  extract(element) {
    const variantElements = element.querySelectorAll(this.config.selectors.productVariant);
    const variants = [];

    variantElements.forEach(variantEl => {
      variants.push(variantEl.textContent.trim());
    });

    return {
      variants: variants.length > 0 ? variants : ['N/A'],
      size: variants.length > 0 ? variants.join(', ') : 'N/A'
    };
  }
}

/**
 * Amazon Image URL Extractor
 */
export class AmazonImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage);
    let imageUrl = 'N/A';

    if (imageElement) {
      // Try to get the src attribute first, fallback to data-src if available
      imageUrl = imageElement.getAttribute('src') ||
                 imageElement.getAttribute('data-src') || 'N/A';

      // Some Amazon images use srcset for different resolutions
      if (imageUrl === 'N/A' && imageElement.hasAttribute('srcset')) {
        const srcset = imageElement.getAttribute('srcset');
        const firstImageMatch = srcset.split(',')[0].trim().split(' ')[0];
        if (firstImageMatch) {
          imageUrl = firstImageMatch;
        }
      }
    }

    return { imageUrl };
  }
}
