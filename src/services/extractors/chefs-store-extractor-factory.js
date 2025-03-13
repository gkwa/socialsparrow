import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  ChefsStoreNameExtractor,
  ChefsStoreUnitPriceExtractor,
  ChefsStoreCasePriceExtractor,
  ChefsStoreSizeExtractor,
  ChefsStoreProductNumberExtractor,
} from "../../extractors/website/chefs-store-extractors.js"

/**
 * Factory for creating Chef's Store-specific extractors
 */
export class ChefsStoreExtractorFactory {
  /**
   * Create Chef's Store-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new ChefsStoreNameExtractor(config),
      new ChefsStoreUnitPriceExtractor(config),
      new ChefsStoreCasePriceExtractor(config),
      new ChefsStoreSizeExtractor(config),
      new ChefsStoreProductNumberExtractor(config),
    ])
    return extractor
  }
}
