import { ProductExtractor } from '../../extractors/product-extractor.js';
import { NameExtractor } from '../../extractors/generic/name-extractor.js';
import { PriceExtractor } from '../../extractors/generic/price-extractor.js';
import { OriginalPriceExtractor } from '../../extractors/generic/original-price-extractor.js';
import { PricePerUnitExtractor } from '../../extractors/generic/price-per-unit-extractor.js';
import { SizeExtractor } from '../../extractors/generic/size-extractor.js';
import { ImageUrlExtractor } from '../../extractors/generic/image-url-extractor.js';

/**
 * Factory for creating QFC-specific extractors
 */
export class QFCExtractorFactory {
  /**
   * Create QFC-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config);
    extractor.setExtractors([
      new NameExtractor(config),
      new PriceExtractor(config),
      new OriginalPriceExtractor(config),
      new PricePerUnitExtractor(config),
      new SizeExtractor(config),
      new ImageUrlExtractor(config)
    ]);
    return extractor;
  }
}
