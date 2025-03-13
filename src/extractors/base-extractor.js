/**
 * Base extractor that defines the interface for all extractors
 * Follows Interface Segregation Principle
 */
export class BaseExtractor {
  constructor(config) {
    this.config = config
  }

  /**
   * Extract data from an element
   * @param {HTMLElement} element - DOM element
   * @return {any} Extracted data
   */
  extract(element) {
    throw new Error("Method must be implemented by subclass")
  }
}
