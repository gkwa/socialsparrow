/**
 * Service for detecting the current website based on URL and DOM elements
 */
export class WebsiteDetector {
  /**
   * Detect the current website
   * @param {string} currentUrl - Current page URL (defaults to window.location.href)
   * @return {string} Website identifier
   */
  static detectWebsite(currentUrl = window.location.href) {
    if (currentUrl.includes("chefsstore") || document.querySelector(".product-tile-link")) {
      return "chefsstore"
    } else if (
      currentUrl.includes("qfc") ||
      document.querySelector('[data-testid^="product-card-"]')
    ) {
      return "qfc"
    } else if (
      currentUrl.includes("amazon") ||
      document.querySelector('[data-component-type="s-search-result"]')
    ) {
      return "amazon"
    } else if (
      currentUrl.includes("traderjoes") ||
      document.querySelector(".SearchResultCard_searchResultCard__3V-_h")
    ) {
      return "traderjoes"
    } else if (
      currentUrl.includes("wholefoodsmarket") ||
      document.querySelector(".w-pie--product-tile")
    ) {
      return "wholefoodsmarket"
    } else if (currentUrl.includes("pcc-markets") || document.querySelector(".e-13udsys")) {
      return "pcc-markets"
    } else if (
      currentUrl.includes("lamsseafood") ||
      document.querySelector(".le-col.sc-tSoMJ") ||
      document.querySelector(".sc-jaZhys")
    ) {
      return "lamss"
    } else if (
      currentUrl.includes("walmart.com") ||
      document.querySelector("[data-automation-id='product-title']")
    ) {
      return "walmart"
    } else if (
      currentUrl.includes("target.com") ||
      document.querySelector("[data-test='@web/site-top-of-funnel/ProductCardWrapper']")
    ) {
      return "target"
    } else if (currentUrl.includes("safeway.com") || document.querySelector(".pc-grid-prdItem")) {
      return "safeway"
    }
    return "default"
  }
}
