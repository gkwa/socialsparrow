import { BaseExtractor } from "../base-extractor.js"

/**
 * Extracts raw HTML content from a product element and stores it as base64-encoded text
 * This provides a backup of the original HTML structure for resilience against HTML changes
 */
export class RawHtmlExtractor extends BaseExtractor {
  /**
   * Extract raw HTML content from an element
   * @param {HTMLElement} element - DOM element to extract HTML from
   * @return {Object} Object containing the base64-encoded HTML
   */
  extract(element) {
    try {
      // Get the outer HTML of the element
      const rawHtml = element.outerHTML
      
      // Convert to base64
      const base64Html = btoa(unescape(encodeURIComponent(rawHtml)))
      
      return { rawHtml: base64Html }
    } catch (error) {
      console.error("Error extracting raw HTML:", error)
      return { rawHtml: "Error extracting HTML" }
    }
  }

  /**
   * Static utility to decode base64-encoded HTML
   * @param {string} base64Html - Base64-encoded HTML string
   * @return {string} Decoded HTML
   */
  static decodeRawHtml(base64Html) {
    try {
      return decodeURIComponent(escape(atob(base64Html)))
    } catch (error) {
      console.error("Error decoding raw HTML:", error)
      return "Error decoding HTML"
    }
  }
}
