import { BaseExtractor } from "../base-extractor.js"
import * as pako from "pako"
import { BaseUrlCleaner } from "../../core/url-service.js"

/**
 * Extracts raw HTML content from a product element and stores it as base64-encoded text
 * This provides a backup of the original HTML structure for resilience against HTML changes
 */
export class RawHtmlExtractor extends BaseExtractor {
  /**
   * Create a new RawHtmlExtractor
   * @param {Object} config - Configuration object
   * @param {BaseUrlCleaner} [urlCleaner=null] - URL cleaner strategy to use
   */
  constructor(config, urlCleaner = null) {
    super(config)
    this.urlCleaner = urlCleaner
  }

  /**
   * Extract raw HTML content from an element
   * @param {HTMLElement} element - DOM element to extract HTML from
   * @return {Object} Object containing the base64-encoded HTML
   */
  extract(element) {
    try {
      // Get the outer HTML of the element
      const rawHtml = element.outerHTML

      // Normalize newlines to spaces
      const normalizedHtml = rawHtml.replace(/\s+/g, " ").trim()

      // Clean URLs in the HTML if a cleaner is provided
      let processedHtml = normalizedHtml
      if (this.urlCleaner) {
        processedHtml = this.cleanUrlsInHtml(normalizedHtml)
      }

      // Debug: Check for Amazon ref parameters
      if (processedHtml.search(/\/ref=sr/) !== -1) {
        console.log("The string contains '/ref=sr'")
      } else {
        console.log("The string does not contain '/ref=sr'")
      }

      // Compress the HTML
      const compressedData = this.compressData(processedHtml)

      // Convert to base64
      const base64Html = this.toBase64(compressedData)

      return { rawHtml: base64Html }
    } catch (error) {
      console.error("Error extracting raw HTML:", error)
      return { rawHtml: "Error extracting HTML" }
    }
  }

  /**
   * Clean URLs in HTML content using the provided URL cleaner
   * @param {string} html - HTML content to clean
   * @return {string} HTML with cleaned URLs
   */
  cleanUrlsInHtml(html) {
    try {
      if (!this.urlCleaner) return html

      // Use regular expression to find URLs in the HTML
      const urlRegex = /(https?:\/\/[^\s"'<>]+)/g

      return html.replace(urlRegex, (match) => {
        // Clean the URL using the provided cleaner
        return this.urlCleaner.clean(match)
      })
    } catch (error) {
      console.error("Error cleaning URLs in HTML:", error)
      return html // Return original HTML if cleaning fails
    }
  }

  /**
   * Compress string data using pako
   * @param {string} data - String to compress
   * @return {Uint8Array} Compressed data
   */
  compressData(data) {
    try {
      // Convert string to Uint8Array using TextEncoder
      let uint8Array
      if (typeof TextEncoder !== "undefined") {
        uint8Array = new TextEncoder().encode(data)
      } else if (typeof Buffer !== "undefined") {
        // For Node.js environments, convert Buffer to Uint8Array
        const buffer = Buffer.from(data, "utf-8")
        uint8Array = new Uint8Array(buffer)
      } else {
        throw new Error("No method available to convert string to Uint8Array")
      }

      // Compress the data
      return pako.deflate(uint8Array, { level: 9 })
    } catch (error) {
      console.error("Compression error:", error)
      // Return uncompressed data as Uint8Array
      if (typeof TextEncoder !== "undefined") {
        return new TextEncoder().encode(data)
      } else if (typeof Buffer !== "undefined") {
        // Convert Buffer to Uint8Array for consistency
        const buffer = Buffer.from(data, "utf-8")
        return new Uint8Array(buffer)
      } else {
        // Last resort fallback - empty Uint8Array
        return new Uint8Array()
      }
    }
  }

  /**
   * Convert binary data to base64 in a browser-compatible way
   * @param {Uint8Array} data - Binary data to convert
   * @return {string} Base64 encoded string
   */
  toBase64(data) {
    try {
      // Browser method
      if (typeof btoa === "function") {
        // Convert binary data to string
        const binaryString = Array.from(data)
          .map((byte) => String.fromCharCode(byte))
          .join("")

        // Encode to base64
        return btoa(binaryString)
      }
      // Node.js method
      else if (typeof Buffer !== "undefined") {
        return Buffer.from(data).toString("base64")
      }
      // Fallback
      else {
        console.warn("No base64 encoding method available")
        return "Encoding failed"
      }
    } catch (error) {
      console.error("Base64 encoding error:", error)
      return "Encoding failed"
    }
  }

  /**
   * Static utility to decode base64-encoded HTML
   * @param {string} base64Html - Base64-encoded HTML string
   * @return {string} Decoded HTML
   */
  static decodeRawHtml(base64Html) {
    try {
      let binaryData

      // Browser method
      if (typeof atob === "function") {
        const binaryString = atob(base64Html)
        binaryData = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          binaryData[i] = binaryString.charCodeAt(i)
        }
      }
      // Node.js method
      else if (typeof Buffer !== "undefined") {
        const buffer = Buffer.from(base64Html, "base64")
        binaryData = new Uint8Array(buffer)
      }
      // Fallback
      else {
        console.warn("No base64 decoding method available")
        return "Decoding failed"
      }

      // Always assume the data is compressed
      try {
        const decompressedData = pako.inflate(binaryData)
        return new TextDecoder().decode(decompressedData)
      } catch (decompressError) {
        console.warn("Decompression failed, treating as uncompressed:", decompressError)
        // Try to decode as uncompressed data
        return new TextDecoder().decode(binaryData)
      }
    } catch (error) {
      console.error("Error decoding raw HTML:", error)
      return "Error decoding HTML"
    }
  }
}
