import { ProductExtractor } from '../../extractors/product-extractor.js';
import {
  WholeFoodsNameExtractor,
  WholeFoodsPriceExtractor,
  WholeFoodsImageExtractor,
  WholeFoodsSizeExtractor
} from '../../extractors/website/whole-foods-extractors.js';

/**
 * Factory for creating Whole Foods-specific extractors
 */
export class WholeFoodsExtractorFactory {
  /**
   * Create Whole Foods-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config);
    extractor.setExtractors([
      new WholeFoodsNameExtractor(config),
      new WholeFoodsPriceExtractor(config),
      new WholeFoodsImageExtractor(config),
      new WholeFoodsSizeExtractor(config)
    ]);
    return extractor;
  }
}
