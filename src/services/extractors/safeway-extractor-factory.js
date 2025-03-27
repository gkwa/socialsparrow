import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  SafewayNameExtractor,
  SafewayPriceExtractor,
  SafewayPricePerUnitExtractor,
  SafewayImageExtractor,
  SafewayRatingExtractor,
  SafewaySnapEligibilityExtractor,
  SafewayProductIdExtractor,
} from "../../extractors/website/safeway-extractors.js"

/**
 * Factory for creating Safeway-specific extractors
 */
export class SafewayExtractorFactory {
  /**
   * Create Safeway-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new SafewayNameExtractor(config),
      new SafewayPriceExtractor(config),
      new SafewayPricePerUnitExtractor(config),
      new SafewayImageExtractor(config),
      new SafewayRatingExtractor(config),
      new SafewaySnapEligibilityExtractor(config),
      new SafewayProductIdExtractor(config),
    ])
    return extractor
  }
}
