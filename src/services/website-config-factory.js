import { WebsiteConfigRegistry } from "../config/website-config-registry.js"
import { ProductConfig } from "../config/product-config.js"
/**
 * Factory for creating website configurations
 */
export class WebsiteConfigFactory {
  /**
   * Create a registry with all website configurations
   * @return {WebsiteConfigRegistry} Configured registry
   */
  static createConfigRegistry() {
    const registry = new WebsiteConfigRegistry()
    // Default configuration (generic)
    const defaultConfig = new ProductConfig({
      productContainer: ".product-card-container",
      productName: ".product-title__name",
      productPrice: ".product-price__saleprice",
      productUnit: ".product-title__qty",
      pricePattern: /\$\s*(\d+\.\d+)/,
      pricePerUnitPattern: /\(\$\s*(\d+\.\d+)\s*\/\s*([^)]+)\)/,
    })
    // QFC configuration
    const qfcConfig = ProductConfig.forWebsite("qfc", {
      productContainer: '[data-testid^="product-card-"]',
      productName: '[data-testid="cart-page-item-description"]',
      productPrice: ".kds-Price-promotional",
      productUnit: '[data-testid="cart-page-item-sizing"]',
      selectors: {
        productImage: ".kds-Image-img",
        productOriginalPrice: ".kds-Price-original",
        productSize: '[data-testid="cart-page-item-sizing"]',
      },
    })
    // Chef's Store configuration
    const chefsStoreConfig = ProductConfig.forWebsite("chefsstore", {
      productContainer: ".product-tile-link",
      productName: ".product-tile-title",
      productNumber: ".product-tile-number",
      selectors: {
        productName: ".product-tile-title",
        productNumber: ".product-tile-number",
        productPriceWrapper: ".product-tile-price-wrapper",
        productPriceDollar: ".product-price-dollar",
        productPrice: ".product-price",
        productPriceCents: ".product-price-cents",
        productPriceLabel: ".product-price-label",
        productSize: ".product-size",
      },
    })
    // Amazon configuration
    const amazonConfig = ProductConfig.forWebsite("amazon", {
      productContainer: '[data-component-type="s-search-result"]',
      selectors: {
        productName: ".a-size-base-plus",
        productPrice: ".a-price .a-offscreen, .a-color-price",
        productRatings: ".a-icon-star-small, .a-icon-star",
        reviewCount: ".a-size-base.s-underline-text",
        productImage: ".s-image",
        productVariant: ".a-size-base.a-color-base.s-background-color-platinum.a-padding-mini",
      },
      patterns: {
        price: /\$\s*(\d+\.?\d*)/,
        reviews: /(\d+[\d,]*)/,
      },
    })
    // Trader Joe's configuration
    const traderJoesConfig = ProductConfig.forWebsite("traderjoes", {
      productContainer: ".SearchResultCard_searchResultCard__3V-_h",
      selectors: {
        productName: ".SearchResultCard_searchResultCard__title__2PdBv a",
        productPrice: ".ProductPrice_productPrice__price__3-50j",
        productUnit: ".ProductPrice_productPrice__unit__2jvkA",
        productCategory: ".SearchResultCard_searchResultCard__categoryName__uD3vj a",
        productImage: ".SearchResultCard_searchResultCard__image__2Yf2S img",
      },
    })
    // Whole Foods configuration
    const wholeFoodsConfig = ProductConfig.forWebsite("wholefoodsmarket", {
      productContainer: ".w-pie--product-tile",
      selectors: {
        productName: '[data-testid="product-tile-name"]',
        productBrand: '[data-testid="product-tile-brand"]',
        productPrice: ".text-left.bds--heading-5",
        productLink: '[data-testid="product-tile-link"]',
        productImage: '[data-testid="product-tile-image"]',
      },
      patterns: {
        price: /\$(\d+\.\d+)/,
      },
    })
    // PCC Markets configuration
    const pccMarketsConfig = ProductConfig.forWebsite("pcc-markets", {
      productContainer: ".e-13udsys",
      selectors: {
        productName: ".e-147kl2c",
        productPrice: ".e-2feaft",
        productUnit: ".e-1ezwhur",
        productBadge: ".e-ul5tuv",
        productImage: ".e-19e3dsf",
        productLink: "a.e-eevw7b",
      },
      patterns: {
        price: /\$\s*(\d+\.?\d*)/,
      },
    })
    // Lams Seafood configuration
    const lamsSeafoodConfig = ProductConfig.forWebsite("lamss", {
      productContainer: ".le-col.sc-iIPnmv",
      selectors: {
        productName: ".sc-jGONNV",
        productPrice: ".sc-iugpza",
        productUnit: ".sc-gMFoeA",
        productImage: "img.sc-lopPiv",
        productLink: "a.sc-dEMAZk",
      },
      patterns: {
        price: /\$(\d+\.\d+)/,
        pricePerUnit: /\/\s*([^$]+)/,
      },
    })
    // Walmart configuration
    const walmartConfig = ProductConfig.forWebsite("walmart", {
      productContainer: ".sans-serif.mid-gray.relative.flex.flex-column.w-100",
      selectors: {
        productName: "[data-automation-id='product-title']",
        productPrice: "[data-automation-id='product-price']",
        productLink: "a[link-identifier]",
        productImage: "img[data-testid='productTileImage']",
        productOriginalPrice: ".f7.f6-l.black.mb2",
        productShipping: "[data-automation-id='fulfillment-badge']",
        productSponsored: ".f7.flex.items-center",
        priceDollars: ".f2",
        priceCents: ".f6.f5-l",
      },
      patterns: {
        price: /\$(\d+\.?\d*)/,
      },
    })
    // Target configuration
    const targetConfig = ProductConfig.forWebsite("target", {
      productContainer: "[data-test='@web/site-top-of-funnel/ProductCardWrapper']",
      selectors: {
        productName: "[data-test='product-title']",
        productPrice: "[data-test='current-price']",
        productUnit: "[data-test='unit-price']",
        productLink: "a[href*='/p/']",
        productImage: "img",
        productBrand: "[data-test='@web/ProductCard/ProductCardBrandAndRibbonMessage/brand']",
        productRatings: ".styles_ndsRatingStars__rtewp",
        reviewCount: ".styles_count__8KRt3",
        productShipping: "[data-test='LPFulfillmentSectionShippingFA_standardShippingMessage']",
        productSponsored: "[data-test='sponsoredText']",
      },
      patterns: {
        price: /\$(\d+\.\d+)/,
        pricePerUnit: /\(\$\s*(\d+\.\d+)\s*\/\s*([^)]+)\)/,
      },
    })
    // Safeway configuration
    const safewayConfig = ProductConfig.forWebsite("safeway", {
      productContainer: ".pc-grid-prdItem",
      selectors: {
        productName: "a[data-qa='prd-itm-pttl']",
        productPrice: "[data-qa='prd-itm-prc']",
        productUnit: "[data-qa='prd-itm-pprc-qty']",
        productImage: "[data-qa='prd-itm-img']",
        productTitle: ".pc__tooltip__title .title-xxs",
        productId: "[data-bpn]",
        productSnap: "[data-qa='prd-itm-snap']",
      },
      patterns: {
        price: /\$(\d+\.\d+)/,
        pricePerUnit: /\(\$\s*(\d+\.\d+)\s*\/\s*([^)]+)\)/,
      },
    })
    // Register all configurations
    return registry
      .setDefaultConfig(defaultConfig)
      .registerConfig("qfc", qfcConfig)
      .registerConfig("chefsstore", chefsStoreConfig)
      .registerConfig("amazon", amazonConfig)
      .registerConfig("traderjoes", traderJoesConfig)
      .registerConfig("wholefoodsmarket", wholeFoodsConfig)
      .registerConfig("pcc-markets", pccMarketsConfig)
      .registerConfig("lamss", lamsSeafoodConfig)
      .registerConfig("walmart", walmartConfig)
      .registerConfig("target", targetConfig)
      .registerConfig("safeway", safewayConfig)
  }
  /**
   * Get configuration for a specific website
   * @param {string} websiteId - Website identifier
   * @param {WebsiteConfigRegistry} registry - Configuration registry
   * @return {ProductConfig} Website configuration
   */
  static getConfigForWebsite(websiteId, registry) {
    return registry.configs[websiteId] || registry.defaultConfig
  }
}
