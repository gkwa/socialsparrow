import { BaseExtractor } from '../base-extractor.js';

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
      // Get all text nodes recursively
      const textContent = this.getAllText(element);

      // Normalize whitespace while preserving word boundaries
      const normalizedText = this.normalizeWhitespace(textContent);

      return { rawTextContent: normalizedText };
    } catch (error) {
      console.error('Error extracting raw text content:', error);
      return { rawTextContent: 'Error extracting text content' };
    }
  }

  /**
   * Recursively get all text from an element and its children
   * @param {HTMLElement} element - The element to extract text from
   * @return {string} Concatenated text content
   */
  getAllText(element) {
    // Skip hidden elements
    if (element.style && (
        element.style.display === 'none' ||
        element.style.visibility === 'hidden' ||
        element.hasAttribute('hidden')
    )) {
      return '';
    }

    // Skip script, style, and other non-content tags
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'TEMPLATE'];
    if (skipTags.includes(element.tagName)) {
      return '';
    }

    let text = '';

    // Get text from this node
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent || '';
    }

    // Special handling for specific elements
    if (element.tagName === 'BR') {
      return ' '; // Replace <br> with space
    }

    if (element.tagName === 'IMG' && element.alt) {
      return ` ${element.alt} `; // Include image alt text
    }

    // Recursively get text from child nodes
    for (const child of element.childNodes) {
      text += this.getAllText(child);
    }

    // Add space after block level elements to ensure proper word separation
    const blockElements = ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'SECTION', 'ARTICLE'];
    if (blockElements.includes(element.tagName)) {
      text += ' ';
    }

    return text;
  }

  /**
   * Normalize whitespace in text while preserving word boundaries
   * @param {string} text - The text to normalize
   * @return {string} Normalized text
   */
  normalizeWhitespace(text) {
    if (!text) return '';

    // Replace all whitespace sequences (including newlines, tabs) with a single space
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }
}
