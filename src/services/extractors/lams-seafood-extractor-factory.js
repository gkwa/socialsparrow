import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  LamsSeafoodNameExtractor,
  LamsSeafoodPriceExtractor,
  LamsSeafoodUnitPriceExtractor,
  LamsSeafoodImageExtractor,
} from "../../extractors/website/lams-seafood-extractors.js"

/**
 * Factory for creating Lams Seafood-specific extractors
 */
export class LamsSeafoodExtractorFactory {
  /**
   * Create Lams Seafood-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new LamsSeafoodNameExtractor(config),
      new LamsSeafoodPriceExtractor(config),
      new LamsSeafoodUnitPriceExtractor(config),
      new LamsSeafoodImageExtractor(config),
    ])
    return extractor
  }
}
