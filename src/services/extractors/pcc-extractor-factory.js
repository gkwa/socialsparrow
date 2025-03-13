import { ProductExtractor } from "../../extractors/product-extractor.js"
import {
  PCCMarketsNameExtractor,
  PCCMarketsPriceExtractor,
  PCCMarketsUnitPriceExtractor,
  PCCMarketsBadgeExtractor,
  PCCMarketsImageExtractor,
} from "../../extractors/website/pcc-extractors.js"

/**
 * Factory for creating PCC Markets-specific extractors
 */
export class PCCExtractorFactory {
  /**
   * Create PCC Markets-specific extractors
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static create(config) {
    const extractor = new ProductExtractor(config)
    extractor.setExtractors([
      new PCCMarketsNameExtractor(config),
      new PCCMarketsPriceExtractor(config),
      new PCCMarketsUnitPriceExtractor(config),
      new PCCMarketsBadgeExtractor(config),
      new PCCMarketsImageExtractor(config),
    ])
    return extractor
  }
}
