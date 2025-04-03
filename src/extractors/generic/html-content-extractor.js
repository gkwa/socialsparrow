import { BaseExtractor } from "../base-extractor.js"
import { DataTransformer } from "../../core/data-transformer.js"

/**
 * Extract raw HTML content from a product element
 */
export class HtmlContentExtractor extends BaseExtractor {
  extract(element) {
    try {
      // Create a clone of the element to avoid modifying the original
      const cloneElement = element.cloneNode(true)

      // Get the HTML content
      const htmlContent = cloneElement.outerHTML

      // Base64 encode the HTML content
      const encodedHtml = DataTransformer.encodeHtmlToBase64(htmlContent)

      return {
        htmlContent: encodedHtml || "N/A",
      }
    } catch (error) {
      console.error("Error extracting HTML content:", error)
      return {
        htmlContent: "N/A",
      }
    }
  }
}
