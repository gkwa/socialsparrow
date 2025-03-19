import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  WalmartNameExtractor,
  WalmartPriceExtractor,
  WalmartOriginalPriceExtractor,
  WalmartShippingExtractor,
  WalmartImageExtractor,
  WalmartSponsoredExtractor,
} from "../../extractors/website/walmart-extractors.js"

/**
 * Factory for creating Walmart-specific extractors
 */
export class WalmartExtractorFactory {
  /**
   * Create Walmart-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new WalmartNameExtractor(config),
      new WalmartPriceExtractor(config),
      new WalmartOriginalPriceExtractor(config),
      new WalmartShippingExtractor(config),
      new WalmartImageExtractor(config),
      new WalmartSponsoredExtractor(config),
    ])
    return extractor
  }
}
