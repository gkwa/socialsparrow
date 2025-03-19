import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  TargetNameExtractor,
  TargetPriceExtractor,
  TargetPricePerUnitExtractor,
  TargetBrandExtractor,
  TargetRatingsExtractor,
  TargetImageExtractor,
  TargetShippingExtractor,
  TargetSponsoredExtractor,
  TargetSnapEligibilityExtractor,
} from "../../extractors/website/target-extractors.js"

/**
 * Factory for creating Target-specific extractors
 */
export class TargetExtractorFactory {
  /**
   * Create Target-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new TargetNameExtractor(config),
      new TargetPriceExtractor(config),
      new TargetPricePerUnitExtractor(config),
      new TargetBrandExtractor(config),
      new TargetRatingsExtractor(config),
      new TargetImageExtractor(config),
      new TargetShippingExtractor(config),
      new TargetSponsoredExtractor(config),
      new TargetSnapEligibilityExtractor(config),
    ])
    return extractor
  }
}
