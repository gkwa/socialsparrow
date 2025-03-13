import { BaseExtractor } from "../base-extractor.js"

/**
 * Extracts all text content from a product element as a single normalized string
 * This provides a raw text representation that can be used for AI-based parsing
 * or as a fallback when structured extraction fails
 */
export class RawTextExtractor extends BaseExtractor {
  /**
   * Extract all text content from an element and its children
   * @param {HTMLElement} element - DOM element to extract text from
   * @return {Object} Object containing the raw text content
   */
  extract(element) {
    try {
      // Collect all text content
      const textParts = []
      this.collectTextFromElement(element, textParts)

      // Join all parts with spaces and normalize
      const joinedText = textParts.join(" ")
      const normalizedText = this.normalizeWhitespace(joinedText)

      return { rawTextContent: normalizedText }
    } catch (error) {
      console.error("Error extracting raw text content:", error)
      return { rawTextContent: "Error extracting text content" }
    }
  }

  /**
   * Collect text from an element and its children, treating each element as a separate entity
   * @param {HTMLElement} element - The element to extract text from
   * @param {Array<string>} textParts - Array to collect text parts
   */
  collectTextFromElement(element, textParts) {
    // Skip hidden elements
    if (
      element.style &&
      (element.style.display === "none" ||
        element.style.visibility === "hidden" ||
        element.hasAttribute("hidden"))
    ) {
      return
    }

    // Skip script, style, and other non-content tags
    const skipTags = ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "SVG", "TEMPLATE"]
    if (element.nodeType === Node.ELEMENT_NODE && skipTags.includes(element.tagName)) {
      return
    }

    // Handle text nodes
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent?.trim()
      if (text) {
        textParts.push(text)
      }
      return
    }

    // Special handling for specific elements
    if (element.tagName === "BR" || element.tagName === "HR") {
      textParts.push("")
      return
    }

    if (element.tagName === "IMG" && element.alt) {
      textParts.push(element.alt)
      return
    }

    // Handle list items specially
    if (element.tagName === "LI") {
      textParts.push("•")
    }

    // Get the immediate text of this element (excluding child elements)
    let hasChildElements = false

    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        hasChildElements = true
      }

      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim()
        if (text) {
          textParts.push(text)
        }
      }
    }

    // Process child elements separately to ensure spacing between them
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        // For elements with specific semantic meaning, add a marker
        if (
          child.tagName === "PRICE" ||
          child.classList.contains("price") ||
          child.classList.contains("product-price")
        ) {
          textParts.push("PRICE:")
        }

        if (
          child.tagName === "H1" ||
          child.tagName === "H2" ||
          child.tagName === "H3" ||
          child.tagName === "H4"
        ) {
          textParts.push("HEADING:")
        }

        this.collectTextFromElement(child, textParts)
      }
    }
  }

  /**
   * Normalize whitespace in text while preserving word boundaries
   * @param {string} text - The text to normalize
   * @return {string} Normalized text
   */
  normalizeWhitespace(text) {
    if (!text) return ""

    return (
      text
        // Replace all whitespace sequences with a single space
        .replace(/\s+/g, " ")
        // Ensure proper spacing around common separators and symbols
        .replace(/([,:;()[\]{}])(\S)/g, "$1 $2")
        .replace(/(\S)([,:;()[\]{}])/g, "$1 $2")
        // Ensure proper spacing around currency symbols
        .replace(/(\$)(\d)/g, "$1 $2")
        // Fix common concatenated patterns
        .replace(/(\d)([A-Za-z])/g, "$1 $2")
        .replace(/([A-Za-z])(\d)/g, "$1 $2")
        // Remove possible double spacing from the above operations
        .replace(/\s+/g, " ")
        .trim()
    )
  }
}
