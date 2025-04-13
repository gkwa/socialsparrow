/**
 * Walmart-specific SVG path cleaner
 * Handles removing SVG path elements from Walmart HTML
 */
export class WalmartSvgCleaner {
  /**
   * Clean Walmart-specific SVG paths
   * @param {string} html - HTML content to clean
   * @return {string} Cleaned HTML with SVG paths removed
   */
  static cleanWalmartSvgPaths(html) {
    try {
      if (!html || typeof html !== "string" || html.trim() === "") {
        return html
      }

      // Use DOMParser to create a proper DOM
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Find all SVG elements with Walmart's specific class pattern
      const svgElements = doc.querySelectorAll('svg[class*="w_"]')

      // Process each SVG element
      svgElements.forEach((svg) => {
        // Clean the class names
        if (svg.className && svg.className.baseVal) {
          if (svg.className.baseVal.match(/w_[A-Za-z0-9_]{4,6}/)) {
            svg.setAttribute("class", "walmart-svg-icon")
          }
        }

        // Remove all path elements - this is the key operation
        const pathElements = svg.querySelectorAll("path")
        pathElements.forEach((path) => {
          path.parentNode.removeChild(path)
        })
      })

      // Get the cleaned HTML
      return doc.body.innerHTML
    } catch (error) {
      console.error("Error cleaning Walmart SVG paths:", error)

      // If DOM parsing fails, fall back to regex-based approach as a safety net
      return WalmartSvgCleaner.fallbackCleanWithRegex(html)
    }
  }

  /**
   * Fallback method using regex for environments where DOMParser is not available
   * @param {string} html - HTML content to clean
   * @return {string} Cleaned HTML
   */
  static fallbackCleanWithRegex(html) {
    try {
      if (!html || typeof html !== "string" || html.trim() === "") {
        return html
      }

      // Remove the path elements from SVGs with Walmart class patterns
      const pathRegex =
        /(<svg[^>]*class="[^"]*w_[A-Za-z0-9_]{4,6}[^"]*"[^>]*>)\s*<path[^>]*>[^<]*<\/path>/g
      let cleanedHtml = html.replace(pathRegex, "$1")

      // Clean Walmart-specific SVG classes
      const classRegex = /class="([^"]*w_[A-Za-z0-9_]{4,6}[^"]*w_[A-Za-z0-9_]{4,6}[^"]*)"/g
      cleanedHtml = cleanedHtml.replace(classRegex, 'class="walmart-svg-icon"')

      return cleanedHtml
    } catch (error) {
      console.error("Error in regex fallback:", error)
      return html
    }
  }
}
