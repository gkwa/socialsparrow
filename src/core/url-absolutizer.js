/**
 * Utility for converting relative URLs to absolute URLs in DOM elements
 * Single responsibility: Ensure all URLs in a DOM element are absolute
 */
export class UrlAbsolutizer {
  /**
   * Convert a single URL from relative to absolute
   * @param {string} url - The URL to convert
   * @param {string} baseUrl - The base URL to use (defaults to current page origin)
   * @return {string} Absolute URL
   */
  static makeAbsolute(url, baseUrl = window.location.origin) {
    if (!url) return url

    // Handle protocol-relative URLs
    if (url.startsWith("//")) {
      return `https:${url}`
    }

    // Handle relative URLs
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return new URL(url, baseUrl).href
    }

    return url
  }

  /**
   * Convert all relative URLs in a DOM element to absolute URLs
   * @param {HTMLElement} element - DOM element to process
   * @param {string} baseUrl - The base URL to use (defaults to current page origin)
   * @return {HTMLElement} The same element with modified URLs (operation is in-place)
   */
  static absolutizeUrls(element, baseUrl = window.location.origin) {
    try {
      if (!element) return element

      // Process link URLs
      this._processLinkUrls(element, baseUrl)

      // Process image URLs
      this._processImageUrls(element, baseUrl)

      // Process srcset attributes
      this._processSrcsetAttributes(element, baseUrl)

      // Process CSS background URLs
      this._processBackgroundUrls(element, baseUrl)

      // Process data-* attributes that might contain URLs
      this._processDataAttributes(element, baseUrl)

      return element
    } catch (error) {
      console.error("Error absolutizing URLs:", error)
      return element
    }
  }

  /**
   * Create a clone of the element with all URLs absolutized
   * @param {HTMLElement} element - DOM element to process
   * @param {string} baseUrl - The base URL to use (defaults to current page origin)
   * @return {HTMLElement} A cloned element with absolute URLs
   */
  static cloneWithAbsoluteUrls(element, baseUrl = window.location.origin) {
    try {
      // Clone the element
      const clone = element.cloneNode(true)
      // Absolutize URLs in the clone
      return this.absolutizeUrls(clone, baseUrl)
    } catch (error) {
      console.error("Error cloning and absolutizing URLs:", error)
      return element
    }
  }

  // Private helper methods

  /**
   * Process all link URLs in an element
   * @private
   */
  static _processLinkUrls(element, baseUrl) {
    const links = element.querySelectorAll("a[href]")
    links.forEach((link) => {
      const href = link.getAttribute("href")
      if (href && href.trim() !== "") {
        link.setAttribute("href", this.makeAbsolute(href, baseUrl))
      }
    })
  }

  /**
   * Process all image URLs in an element
   * @private
   */
  static _processImageUrls(element, baseUrl) {
    const images = element.querySelectorAll("img")
    images.forEach((img) => {
      // Handle src attribute
      if (img.hasAttribute("src")) {
        const src = img.getAttribute("src")
        img.setAttribute("src", this.makeAbsolute(src, baseUrl))
      }

      // Handle data-src attribute
      if (img.hasAttribute("data-src")) {
        const dataSrc = img.getAttribute("data-src")
        img.setAttribute("data-src", this.makeAbsolute(dataSrc, baseUrl))
      }
    })
  }

  /**
   * Process all srcset attributes in an element
   * @private
   */
  static _processSrcsetAttributes(element, baseUrl) {
    // Process elements with srcset or data-srcset
    const elementsWithSrcset = element.querySelectorAll("[srcset], [data-srcset]")
    elementsWithSrcset.forEach((el) => {
      ;["srcset", "data-srcset"].forEach((attrName) => {
        if (el.hasAttribute(attrName)) {
          const srcset = el.getAttribute(attrName)
          const newSrcset = this._processSrcsetValue(srcset, baseUrl)
          el.setAttribute(attrName, newSrcset)
        }
      })
    })
  }

  /**
   * Process a srcset attribute value
   * @private
   */
  static _processSrcsetValue(srcset, baseUrl) {
    if (!srcset) return ""

    // Check if this looks like a complex srcset that might have commas in URL parameters
    // Look for patterns like "foo,bar" followed by descriptors or ".jpg," without a descriptor
    const hasCommasInUrls = /(,\w+)[^,\s]*\s+\d+[xw]|\.jpg,/.test(srcset)

    if (!hasCommasInUrls) {
      // Simple case - split by commas and process each URL-descriptor pair
      return srcset
        .split(",")
        .map((part) => {
          const parts = part.trim().split(/\s+/)
          let url = parts[0]
          const descriptor = parts.slice(1).join(" ")

          url = this.makeAbsolute(url, baseUrl)

          return url + (descriptor ? " " + descriptor : "")
        })
        .join(", ")
    }

    // Complex case - handle srcsets with commas in the URLs
    let result = []
    let currentUrl = ""
    let inUrl = true

    // Split by commas but be smart about it
    const parts = srcset.split(",")

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()

      // Check if this part contains a descriptor (like "1.5x" or "200w")
      const hasDescriptor = /\s+[\d\.]+x|\s+\d+w$/.test(part)

      if (hasDescriptor) {
        // This part has a descriptor, so it's a complete URL + descriptor
        const [url, ...descriptorParts] = part.split(/\s+/)
        const descriptor = descriptorParts.join(" ")

        // If we were building a URL, finish it and add this part
        if (currentUrl) {
          currentUrl += "," + url
          result.push(this.makeAbsolute(currentUrl, baseUrl) + (descriptor ? " " + descriptor : ""))
          currentUrl = ""
        } else {
          // Otherwise, just process this complete part
          result.push(this.makeAbsolute(url, baseUrl) + (descriptor ? " " + descriptor : ""))
        }

        inUrl = true
      } else {
        // This part does not have a descriptor, so it's either:
        // 1. A URL that contains commas and continues in the next part
        // 2. The beginning of a new URL
        if (inUrl) {
          // Continue building the current URL
          currentUrl = currentUrl ? currentUrl + "," + part : part
        } else {
          // Start a new URL
          currentUrl = part
          inUrl = true
        }
      }
    }

    // If we have a remaining URL being built, add it
    if (currentUrl) {
      result.push(this.makeAbsolute(currentUrl, baseUrl))
    }

    return result.join(", ")
  }

  /**
   * Process all background image URLs in CSS
   * @private
   */
  static _processBackgroundUrls(element, baseUrl) {
    // First process inline styles with url()
    const elementsWithStyle = element.querySelectorAll("*[style]")
    elementsWithStyle.forEach((el) => {
      const style = el.getAttribute("style")
      if (style && style.includes("url(")) {
        // Find all url() occurrences and replace relative paths
        const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
          const absoluteUrl = this.makeAbsolute(url, baseUrl)
          return `url('${absoluteUrl}')`
        })
        el.setAttribute("style", newStyle)
      }
    })
  }

  /**
   * Process all data-* attributes that might contain URLs
   * @private
   */
  static _processDataAttributes(element, baseUrl) {
    const allElements = element.querySelectorAll("*")
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (
          attr.name.startsWith("data-") &&
          attr.name !== "data-src" && // Skip those we've already handled
          attr.name !== "data-srcset" &&
          typeof attr.value === "string"
        ) {
          // Check if attribute value might be a URL
          const value = attr.value
          if (value.startsWith("//")) {
            // Protocol-relative URL
            el.setAttribute(attr.name, this.makeAbsolute(value, baseUrl))
          } else if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
            // Relative URL
            el.setAttribute(attr.name, this.makeAbsolute(value, baseUrl))
          } else if (
            value.includes("/") &&
            (value.includes(".jpg") ||
              value.includes(".png") ||
              value.includes(".gif") ||
              value.includes(".webp") ||
              value.includes(".svg") ||
              value.includes("image") ||
              value.includes("media"))
          ) {
            // Try to detect URLs that don't start with standard URL prefixes
            // This is a heuristic approach, might need adjustment
            try {
              const possibleUrl = new URL(value, baseUrl)
              el.setAttribute(attr.name, possibleUrl.href)
            } catch (e) {
              // Not a valid URL, ignore
            }
          }
        }
      })
    })
  }
}

/**
 * Base interface for URL cleaners
 * Follows Interface Segregation Principle
 */
export class BaseUrlCleaner {
  /**
   * Clean a URL
   * @param {string} url - The URL to clean
   * @return {string} Cleaned URL
   */
  clean(url) {
    throw new Error("Method must be implemented by subclass")
  }

  /**
   * Apply cleaning to all URLs in an element
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} Element with cleaned URLs
   */
  cleanUrlsInElement(element) {
    try {
      if (!element) return element

      // Find all anchor elements with href attributes
      const links = element.querySelectorAll("a[href]")
      links.forEach((link) => {
        const href = link.getAttribute("href")
        if (href && href.trim() !== "") {
          const cleanedUrl = this.clean(href)
          if (cleanedUrl) {
            link.setAttribute("href", cleanedUrl)
          }
        }
      })
      return element
    } catch (error) {
      console.error("Error cleaning URLs in element:", error)
      return element
    }
  }

  /**
   * Create a clone of the element with all URLs cleaned
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} A cloned element with cleaned URLs
   */
  cloneWithCleanUrls(element) {
    try {
      // Clone the element
      const clone = element.cloneNode(true)
      // Clean URLs in the clone
      return this.cleanUrlsInElement(clone)
    } catch (error) {
      console.error("Error cloning and cleaning URLs:", error)
      return element
    }
  }
}

/**
 * Utility class that combines URL absolutization and cleaning
 */
export class UrlProcessor {
  /**
   * Process an element to make all URLs absolute and cleaned
   * @param {HTMLElement} element - DOM element to process
   * @param {BaseUrlCleaner} cleaner - URL cleaner instance
   * @param {string} baseUrl - Base URL for absolutization
   * @return {HTMLElement} Element with processed URLs
   */
  static processUrls(element, cleaner, baseUrl = window.location.origin) {
    if (!element) return element

    // First absolutize URLs
    const elementWithAbsoluteUrls = UrlAbsolutizer.absolutizeUrls(element, baseUrl)

    // Then clean URLs if a cleaner is provided
    if (cleaner instanceof BaseUrlCleaner) {
      return cleaner.cleanUrlsInElement(elementWithAbsoluteUrls)
    }

    return elementWithAbsoluteUrls
  }

  /**
   * Create a clone of the element with all URLs absolutized and cleaned
   * @param {HTMLElement} element - DOM element to process
   * @param {BaseUrlCleaner} cleaner - URL cleaner instance
   * @param {string} baseUrl - Base URL for absolutization
   * @return {HTMLElement} A cloned element with processed URLs
   */
  static cloneWithProcessedUrls(element, cleaner, baseUrl = window.location.origin) {
    try {
      // Clone the element
      const clone = element.cloneNode(true)
      // Process URLs in the clone
      return this.processUrls(clone, cleaner, baseUrl)
    } catch (error) {
      console.error("Error cloning and processing URLs:", error)
      return element
    }
  }
}
