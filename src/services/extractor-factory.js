import { ProductExtractor } from "../extractors/product-extractor.js"
// Import generic extractors
import { NameExtractor } from "../extractors/generic/name-extractor.js"
import { PriceExtractor } from "../extractors/generic/price-extractor.js"
import { PricePerUnitExtractor } from "../extractors/generic/price-per-unit-extractor.js"
// Import website-specific extractor factories
import { QFCExtractorFactory } from "./extractors/qfc-extractor-factory.js"
import { ChefsStoreExtractorFactory } from "./extractors/chefs-store-extractor-factory.js"
import { AmazonExtractorFactory } from "./extractors/amazon-extractor-factory.js"
import { TraderJoesExtractorFactory } from "./extractors/trader-joes-extractor-factory.js"
import { WholeFoodsExtractorFactory } from "./extractors/whole-foods-extractor-factory.js"
import { PCCExtractorFactory } from "./extractors/pcc-extractor-factory.js"
import { LamsSeafoodExtractorFactory } from "./extractors/lams-seafood-extractor-factory.js"

/**
 * Abstract factory for creating website-specific extractors
 */
export class ExtractorFactory {
  /**
   * Create extractors for a specific website
   * @param {string} websiteId - Website identifier
   * @param {ProductConfig} config - Configuration object
   * @return {ProductExtractor} Configured extractor
   */
  static createForWebsite(websiteId, config) {
    const extractor = new ProductExtractor(config)
    // Get the factory for the specific website
    switch (websiteId) {
      case "qfc":
        return QFCExtractorFactory.create(config)
      case "chefsstore":
        return ChefsStoreExtractorFactory.create(config)
      case "amazon":
        return AmazonExtractorFactory.create(config)
      case "traderjoes":
        return TraderJoesExtractorFactory.create(config)
      case "wholefoodsmarket":
        return WholeFoodsExtractorFactory.create(config)
      case "pcc-markets":
        return PCCExtractorFactory.create(config)
      case "lamss":
        return LamsSeafoodExtractorFactory.create(config)
      default:
        // Use generic extractors for unknown websites
        extractor.setExtractors([
          new NameExtractor(config),
          new PriceExtractor(config),
          new PricePerUnitExtractor(config),
        ])
        return extractor
    }
  }
}
