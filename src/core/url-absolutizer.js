/**
 * Utility for converting relative URLs to absolute URLs in DOM elements
 * Single responsibility: Ensure all URLs in a DOM element are absolute
 */
export class UrlAbsolutizer {
  /**
   * Convert all relative URLs in a DOM element to absolute URLs
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} The same element with modified URLs (operation is in-place)
   */
  static absolutizeUrls(element) {
    try {
      // Process all links (a href)
      const links = element.querySelectorAll("a[href]")
      links.forEach((link) => {
        const href = link.getAttribute("href")
        if (href && (href.startsWith("/") || href.startsWith("./") || href.startsWith("../"))) {
          link.setAttribute("href", new URL(href, window.location.origin).href)
        }
      })

      // Process all images (img src, data-src)
      const images = element.querySelectorAll("img")
      images.forEach((img) => {
        // Handle src attribute
        if (img.hasAttribute("src")) {
          const src = img.getAttribute("src")
          if (src.startsWith("//")) {
            img.setAttribute("src", "https:" + src)
          } else if (src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) {
            img.setAttribute("src", new URL(src, window.location.origin).href)
          }
        }

        // Handle data-src attribute
        if (img.hasAttribute("data-src")) {
          const dataSrc = img.getAttribute("data-src")
          if (dataSrc.startsWith("//")) {
            img.setAttribute("data-src", "https:" + dataSrc)
          } else if (
            dataSrc.startsWith("/") ||
            dataSrc.startsWith("./") ||
            dataSrc.startsWith("../")
          ) {
            img.setAttribute("data-src", new URL(dataSrc, window.location.origin).href)
          }
        }
      })

      // Process all elements with data-srcset attribute
      const elementsWithDataSrcset = element.querySelectorAll("[data-srcset]")
      elementsWithDataSrcset.forEach((el) => {
        const dataSrcset = el.getAttribute("data-srcset")
        if (dataSrcset) {
          // Process each URL in the srcset
          const newSrcset = dataSrcset
            .split(",")
            .map((part) => {
              const parts = part.trim().split(" ")
              let url = parts[0]
              const descriptor = parts.slice(1).join(" ") // Keep any descriptors (like 1x, 2x, etc.)

              // Fix protocol-relative URLs
              if (url.startsWith("//")) {
                url = "https:" + url
              }
              // Fix relative URLs
              else if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
                url = new URL(url, window.location.origin).href
              }

              return url + (descriptor ? " " + descriptor : "")
            })
            .join(", ")

          el.setAttribute("data-srcset", newSrcset)
        }
      })

      // Process all source elements (they often have srcset and data-srcset)
      const sources = element.querySelectorAll("source")
      sources.forEach((source) => {
        // Handle srcset attribute
        if (source.hasAttribute("srcset")) {
          const srcset = source.getAttribute("srcset")
          const newSrcset = srcset
            .split(",")
            .map((part) => {
              const parts = part.trim().split(" ")
              let url = parts[0]
              const descriptor = parts.slice(1).join(" ")

              if (url.startsWith("//")) {
                url = "https:" + url
              } else if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
                url = new URL(url, window.location.origin).href
              }

              return url + (descriptor ? " " + descriptor : "")
            })
            .join(", ")

          source.setAttribute("srcset", newSrcset)
        }

        // Handle data-srcset attribute (already covered by the selector above, but keeping for clarity)
        if (source.hasAttribute("data-srcset")) {
          const dataSrcset = source.getAttribute("data-srcset")
          const newDataSrcset = dataSrcset
            .split(",")
            .map((part) => {
              const parts = part.trim().split(" ")
              let url = parts[0]
              const descriptor = parts.slice(1).join(" ")

              if (url.startsWith("//")) {
                url = "https:" + url
              } else if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
                url = new URL(url, window.location.origin).href
              }

              return url + (descriptor ? " " + descriptor : "")
            })
            .join(", ")

          source.setAttribute("data-srcset", newDataSrcset)
        }
      })

      // Process all elements with any other data-* attribute that might contain URLs
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
              el.setAttribute(attr.name, "https:" + value)
            } else if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
              // Relative URL
              el.setAttribute(attr.name, new URL(value, window.location.origin).href)
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
                const possibleUrl = new URL(value, window.location.origin)
                el.setAttribute(attr.name, possibleUrl.href)
              } catch (e) {
                // Not a valid URL, ignore
              }
            }
          }
        })
      })

      // Process background images in style attributes
      const elementsWithStyle = element.querySelectorAll('[style*="url("]')
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute("style")
        if (style) {
          // Find all url() occurrences and replace relative paths
          const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
            if (url.startsWith("//")) {
              return `url('https:${url}')`
            } else if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
              return `url('${new URL(url, window.location.origin).href}')`
            }
            return match
          })
          el.setAttribute("style", newStyle)
        }
      })

      return element
    } catch (error) {
      console.error("Error absolutizing URLs:", error)
      // Return the original element if operation fails
      return element
    }
  }

  /**
   * Create a clone of the element with all URLs absolutized
   * @param {HTMLElement} element - DOM element to process
   * @return {HTMLElement} A cloned element with absolute URLs
   */
  static cloneWithAbsoluteUrls(element) {
    try {
      // Clone the element
      const clone = element.cloneNode(true)
      // Absolutize URLs in the clone
      return this.absolutizeUrls(clone)
    } catch (error) {
      console.error("Error cloning and absolutizing URLs:", error)
      // Return a simple clone if operation fails
      return element.cloneNode(true)
    }
  }
}
