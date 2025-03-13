import { WebsiteDetector } from "./website-detector.js"
import { WebsiteConfigFactory } from "./website-config-factory.js"
import { ProductSelector } from "../core/product-selector.js"
import { ProductDataService } from "./product-data-service.js"
import { ExtractorFactory } from "./extractor-factory.js"

/**
 * Factory for creating a ProductDataService with configuration
 * Simplifies creation of the service with proper dependency injection
 */
export class ProductDataServiceFactory {
  /**
   * Create a ProductDataService for the current website
   * @param {Object} customConfig - Optional custom configuration to override defaults
   * @return {ProductDataService} Configured service
   */
  createForCurrentWebsite(customConfig = {}) {
    // Get website config registry
    const configRegistry = WebsiteConfigFactory.createConfigRegistry()

    // Detect current website
    const websiteId = WebsiteDetector.detectWebsite()
    console.log(`Detected website: ${websiteId}`)

    // Get config for the detected website
    const siteConfig = WebsiteConfigFactory.getConfigForWebsite(websiteId, configRegistry)

    // Merge with any custom config provided
    const mergedConfig = { ...siteConfig, ...customConfig, websiteId }

    // Create the service components
    const selector = new ProductSelector(mergedConfig)
    const extractor = ExtractorFactory.createForWebsite(websiteId, mergedConfig)

    return new ProductDataService(mergedConfig, selector, extractor)
  }

  /**
   * Create a ProductDataService with default configuration
   * @param {Object} customConfig - Optional custom configuration
   * @return {ProductDataService} Configured service
   */
  static createDefault(customConfig = {}) {
    const factory = new ProductDataServiceFactory()
    return factory.createForCurrentWebsite(customConfig)
  }
}
