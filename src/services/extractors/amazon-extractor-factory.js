import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  AmazonNameExtractor,
  AmazonPriceExtractor,
  AmazonRatingsExtractor,
  AmazonVariantExtractor,
  AmazonImageExtractor,
} from "../../extractors/website/amazon-extractors.js"

/**
 * Factory for creating Amazon-specific extractors
 */
export class AmazonExtractorFactory {
  /**
   * Create Amazon-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new AmazonNameExtractor(config),
      new AmazonPriceExtractor(config),
      new AmazonRatingsExtractor(config),
      new AmazonVariantExtractor(config),
      new AmazonImageExtractor(config),
    ])
    return extractor
  }
}
