import { GenericSearchParamExtractor } from "../extractors/search-param/generic-search-param-extractor.js"
import { QFCSearchParamExtractor } from "../extractors/search-param/qfc-search-param-extractor.js"
import { AmazonSearchParamExtractor } from "../extractors/search-param/amazon-search-param-extractor.js"
import { TargetSearchParamExtractor } from "../extractors/search-param/target-search-param-extractor.js"
import { WalmartSearchParamExtractor } from "../extractors/search-param/walmart-search-param-extractor.js"
import { TraderJoesSearchParamExtractor } from "../extractors/search-param/trader-joes-search-param-extractor.js"
import { WholeFoodsSearchParamExtractor } from "../extractors/search-param/whole-foods-search-param-extractor.js"
import { HMartSearchParamExtractor } from "../extractors/search-param/hmart-search-param-extractor.js"
import { LamsSeafoodSearchParamExtractor } from "../extractors/search-param/lams-seafood-search-param-extractor.js"
import { PCCMarketsSearchParamExtractor } from "../extractors/search-param/pcc-markets-search-param-extractor.js"
import { UwajimayaSearchParamExtractor } from "../extractors/search-param/uwajimaya-search-param-extractor.js"
import { FredMeyerSearchParamExtractor } from "../extractors/search-param/fred-meyer-search-param-extractor.js"
import { SafewaySearchParamExtractor } from "../extractors/search-param/safeway-search-param-extractor.js"

/**
 * Factory for creating website-specific search parameter extractors
 */
export class SearchParamExtractorFactory {
  /**
   * Create a search parameter extractor for a specific website
   * @param {string} websiteId - Website identifier
   * @return {BaseSearchParamExtractor} Website-specific search parameter extractor
   */
  static createForWebsite(websiteId) {
    switch (websiteId) {
      case "qfc":
        return new QFCSearchParamExtractor()
      case "amazon":
        return new AmazonSearchParamExtractor()
      case "target":
        return new TargetSearchParamExtractor()
      case "walmart":
        return new WalmartSearchParamExtractor()
      case "traderjoes":
        return new TraderJoesSearchParamExtractor()
      case "wholefoodsmarket":
        return new WholeFoodsSearchParamExtractor()
      case "hmart":
        return new HMartSearchParamExtractor()
      case "lamss":
        return new LamsSeafoodSearchParamExtractor()
      case "pcc-markets":
        return new PCCMarketsSearchParamExtractor()
      case "uwajimaya":
        return new UwajimayaSearchParamExtractor()
      case "fredmeyer":
        return new FredMeyerSearchParamExtractor()
      case "safeway":
        return new SafewaySearchParamExtractor()
      default:
        return new GenericSearchParamExtractor()
    }
  }
}
