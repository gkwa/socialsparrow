/**
 * Interface for URL cleaning strategies
 * Follows the Strategy Pattern
 */
export class UrlCleanerInterface {
  /**
   * Clean a URL according to the specific strategy
   * @param {string} url - The URL to clean
   * @return {string} The cleaned URL
   */
  clean(url) {
    throw new Error("Method must be implemented by concrete strategy")
  }

  /**
   * Check if this cleaner can handle the given URL
   * @param {string} url - The URL to check
   * @return {boolean} True if this cleaner can handle the URL
   */
  canHandle(url) {
    throw new Error("Method must be implemented by concrete strategy")
  }

  /**
   * Clean URLs in HTML content
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    throw new Error("Method must be implemented by concrete strategy")
  }
}
