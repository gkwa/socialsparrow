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
      const links = element.querySelectorAll('a[href]')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('../'))) {
          link.setAttribute('href', new URL(href, window.location.origin).href)
        }
      })

      // Process all images (img src)
      const images = element.querySelectorAll('img[src]')
      images.forEach(img => {
        const src = img.getAttribute('src')
        if (src) {
          // Handle protocol-relative URLs (starting with //)
          if (src.startsWith('//')) {
            img.setAttribute('src', 'https:' + src)
          }
          // Handle relative URLs
          else if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
            img.setAttribute('src', new URL(src, window.location.origin).href)
          }
        }
      })

      // Process all source elements (for picture elements)
      const sources = element.querySelectorAll('source[srcset]')
      sources.forEach(source => {
        const srcset = source.getAttribute('srcset')
        if (srcset) {
          // Process srcset format: "url1 1x, url2 2x"
          const newSrcset = srcset.split(',').map(src => {
            const parts = src.trim().split(' ')
            let url = parts[0]
            const descriptor = parts[1] || ''

            // Handle protocol-relative URLs
            if (url.startsWith('//')) {
              url = 'https:' + url
            }
            // Handle relative URLs
            else if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
              url = new URL(url, window.location.origin).href
            }

            return `${url} ${descriptor}`.trim()
          }).join(', ')

          source.setAttribute('srcset', newSrcset)
        }
      })

      // Process all data-src attributes (lazy-loaded images)
      const lazyImages = element.querySelectorAll('[data-src]')
      lazyImages.forEach(img => {
        const dataSrc = img.getAttribute('data-src')
        if (dataSrc) {
          // Handle protocol-relative URLs
          if (dataSrc.startsWith('//')) {
            img.setAttribute('data-src', 'https:' + dataSrc)
          }
          // Handle relative URLs
          else if (dataSrc.startsWith('/') || dataSrc.startsWith('./') || dataSrc.startsWith('../')) {
            img.setAttribute('data-src', new URL(dataSrc, window.location.origin).href)
          }
        }
      })

      // Process background images in style attributes
      const elementsWithStyle = element.querySelectorAll('[style*="background"]')
      elementsWithStyle.forEach(el => {
        const style = el.getAttribute('style')
        if (style && style.includes('url(')) {
          // Find all url() occurrences and replace relative paths
          const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
            if (url.startsWith('//')) {
              return `url('https:${url}')`
            } else if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
              return `url('${new URL(url, window.location.origin).href}')`
            }
            return match
          })
          el.setAttribute('style', newStyle)
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
