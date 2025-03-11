import { WebsiteConfigRegistry } from '../config/website-config-registry.js';
import { ProductConfig } from '../config/product-config.js';
import { ProductSelector } from '../core/product-selector.js';
import { ProductExtractor } from '../extractors/product-extractor.js';
import { ProductDataService } from './product-data-service.js';

// Import generic extractors
import { NameExtractor } from '../extractors/generic/name-extractor.js';
import { PriceExtractor } from '../extractors/generic/price-extractor.js';
import { PricePerUnitExtractor } from '../extractors/generic/price-per-unit-extractor.js';
import { ImageUrlExtractor } from '../extractors/generic/image-url-extractor.js';
import { OriginalPriceExtractor } from '../extractors/generic/original-price-extractor.js';
import { SizeExtractor } from '../extractors/generic/size-extractor.js';

// Import website-specific extractors
import { 
  ChefsStoreNameExtractor,
  ChefsStoreUnitPriceExtractor,
  ChefsStoreCasePriceExtractor,
  ChefsStoreSizeExtractor,
  ChefsStoreProductNumberExtractor
} from '../extractors/website/chefs-store-extractors.js';

// Import Amazon-specific extractors
import {
  AmazonNameExtractor,
  AmazonPriceExtractor,
  AmazonRatingsExtractor,
  AmazonVariantExtractor,
  AmazonImageExtractor
} from '../extractors/website/amazon-extractors.js';

/**
 * Factory for creating a ProductDataService with configuration
 * Simplifies creation of the service with proper dependency injection
 */
export class ProductDataServiceFactory {
  constructor() {
    this.configRegistry = new WebsiteConfigRegistry();
    this.setupDefaultConfigs();
  }
  
  /**
   * Set up default configurations for known websites
   */
  setupDefaultConfigs() {
    // Default configuration (generic)
    const defaultConfig = new ProductConfig({
      productContainer: '.product-card-container',
      productName: '.product-title__name',
      productPrice: '.product-price__saleprice',
      productUnit: '.product-title__qty',
      pricePattern: /\$\s*(\d+\.\d+)/,
      pricePerUnitPattern: /\(\$\s*(\d+\.\d+)\s*\/\s*([^)]+)\)/
    });
    
    // QFC configuration
    const qfcConfig = ProductConfig.forWebsite('qfc', {
      productContainer: '[data-testid^="product-card-"]',
      productName: '[data-testid="cart-page-item-description"]',
      productPrice: '.kds-Price-promotional',
      productUnit: '[data-testid="cart-page-item-sizing"]',
      selectors: {
        productImage: '.kds-Image-img',
        productOriginalPrice: '.kds-Price-original',
        productSize: '[data-testid="cart-page-item-sizing"]'
      }
    });
    
    // Chef's Store configuration
    const chefsStoreConfig = ProductConfig.forWebsite('chefsstore', {
      productContainer: '.product-tile-link',
      productName: '.product-tile-title',
      productNumber: '.product-tile-number',
      selectors: {
        productName: '.product-tile-title',
        productNumber: '.product-tile-number',
        productPriceWrapper: '.product-tile-price-wrapper',
        productPriceDollar: '.product-price-dollar',
        productPrice: '.product-price',
        productPriceCents: '.product-price-cents',
        productPriceLabel: '.product-price-label',
        productSize: '.product-size'
      }
    });
    
    // Amazon configuration
    const amazonConfig = ProductConfig.forWebsite('amazon', {
      productContainer: '[data-component-type="s-search-result"]',
      selectors: {
        productName: '.a-size-base-plus',
        productPrice: '.a-price .a-offscreen, .a-color-base',
        productRatings: '.a-icon-star-small, .a-icon-star',
        reviewCount: '.a-size-base.s-underline-text',
        productImage: '.s-image',
        productVariant: '.a-size-base.a-color-base.s-background-color-platinum.a-padding-mini'
      },
      patterns: {
        price: /\$\s*(\d+\.?\d*)/,
        reviews: /(\d+[\d,]*)/
      }
    });

    // Register all configurations
    this.configRegistry
      .setDefaultConfig(defaultConfig)
      .registerConfig('qfc', qfcConfig)
      .registerConfig('chefsstore', chefsStoreConfig)
      .registerConfig('amazon', amazonConfig);
  }
  
  /**
   * Create a ProductDataService for the current website
   * @param {Object} customConfig - Optional custom configuration to override defaults
   * @return {ProductDataService} Configured service
   */
  createForCurrentWebsite(customConfig = {}) {
    // Detect current website
    const currentUrl = window.location.href;
    let websiteId = 'default';
    
    if (currentUrl.includes('chefsstore') || document.querySelector('.product-tile-link')) {
      websiteId = 'chefsstore';
    } else if (currentUrl.includes('qfc') || document.querySelector('[data-testid^="product-card-"]')) {
      websiteId = 'qfc';
    } else if (currentUrl.includes('amazon') || document.querySelector('[data-component-type="s-search-result"]')) {
      websiteId = 'amazon';
    }
    
    console.log(`Detected website: ${websiteId}`);
    
    // Get config for the detected website
    const siteConfig = this.configRegistry.configs[websiteId] || this.configRegistry.defaultConfig;
    
    // Merge with any custom config provided
    const mergedConfig = new ProductConfig({
      ...siteConfig,
      ...customConfig,
      websiteId
    });
    
    // Create the service with the merged config
    const selector = new ProductSelector(mergedConfig);
    const extractor = new ProductExtractor(mergedConfig);
    
    // Create specialized extractors based on the website
    this.setupSpecializedExtractors(mergedConfig, extractor);
    
    return new ProductDataService(mergedConfig, selector, extractor);
  }
  
  /**
   * Set up specialized extractors based on website configuration
   * @param {ProductConfig} config - Configuration object
   * @param {ProductExtractor} extractor - Product extractor
   */
  setupSpecializedExtractors(config, extractor) {
    // Replace extractors based on the website
    switch (config.websiteId) {
      case 'qfc':
        extractor.setExtractors([
          new NameExtractor(config),
          new PriceExtractor(config),
          new OriginalPriceExtractor(config),
          new PricePerUnitExtractor(config),
          new SizeExtractor(config),
          new ImageUrlExtractor(config)
        ]);
        break;
        
      case 'chefsstore':
        extractor.setExtractors([
          new ChefsStoreNameExtractor(config),
          new ChefsStoreUnitPriceExtractor(config),
          new ChefsStoreCasePriceExtractor(config),
          new ChefsStoreSizeExtractor(config),
          new ChefsStoreProductNumberExtractor(config)
        ]);
        break;

      case 'amazon':
        extractor.setExtractors([
          new AmazonNameExtractor(config),
          new AmazonPriceExtractor(config),
          new AmazonRatingsExtractor(config),
          new AmazonVariantExtractor(config),
          new AmazonImageExtractor(config)
        ]);
        break;
    }
  }
  
  /**
   * Create a ProductDataService with default configuration
   * @param {Object} customConfig - Optional custom configuration
   * @return {ProductDataService} Configured service
   */
  static createDefault(customConfig = {}) {
    const factory = new ProductDataServiceFactory();
    return factory.createForCurrentWebsite(customConfig);
  }
}
