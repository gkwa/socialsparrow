import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  TraderJoesNameExtractor,
  TraderJoesPriceExtractor,
  TraderJoesUnitPriceExtractor,
  TraderJoesCategoryExtractor,
  TraderJoesImageExtractor,
} from "../../extractors/website/trader-joes-extractors.js"

/**
 * Factory for creating Trader Joe's-specific extractors
 */
export class TraderJoesExtractorFactory {
  /**
   * Create Trader Joe's-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new TraderJoesNameExtractor(config),
      new TraderJoesPriceExtractor(config),
      new TraderJoesUnitPriceExtractor(config),
      new TraderJoesCategoryExtractor(config),
      new TraderJoesImageExtractor(config),
    ])
    return extractor
  }
}
