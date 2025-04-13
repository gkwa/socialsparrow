import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { WalmartSvgCleaner } from "../../src/core/walmart-svg-cleaner.js"
import { JSDOM } from "jsdom"

describe("WalmartSvgCleaner", () => {
  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    // Mock DOMParser for Node.js environment
    if (typeof DOMParser === "undefined") {
      const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`)
      global.DOMParser = dom.window.DOMParser
      global.document = dom.window.document
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up globals
    if (global.DOMParser) {
      delete global.DOMParser
    }
    if (global.document) {
      delete global.document
    }
  })

  describe("cleanWalmartSvgPaths", () => {
    it("should remove Walmart star rating SVG paths while preserving the SVG elements", () => {
      const dirtyHtml = `
        <div class="flex items-center mt2">
          <div class="w_ExHd w_y6ym mr1">
            <svg class="w_D5ag w_6H0I w_1jp4" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <path d="m13.562 7.028.17.354.387.062 6.226.999c.011.002.029.008.047.034.018.026.03.063.023.106a.133.133 0 0 1-.034.073l-4.476 4.64-.274.284.079.387 1.321 6.467c.009.042 0 .08-.017.109-.018.028-.036.036-.049.04a.04.04 0 0 1-.014 0 .05.05 0 0 1-.017-.006l-5.926-3.032-.341-.175-.342.175-5.926 3.032a.046.046 0 0 1-.02.006c-.004 0-.01 0-.017-.003-.013-.004-.034-.017-.05-.05a.155.155 0 0 1-.01-.096l1.322-6.467.079-.387-.274-.284-4.477-4.64a.136.136 0 0 1-.035-.095c0-.042.014-.075.034-.096a.067.067 0 0 1 .037-.022l6.226-.999.388-.062.17-.354 2.83-5.892c.016-.033.037-.045.05-.05a.045.045 0 0 1 .018-.003c.004 0 .01.002.02.007a.1.1 0 0 1 .04.046l2.832 5.892Z"></path>
            </svg>
          </div>
        </div>`

      const cleanedHtml = WalmartSvgCleaner.cleanWalmartSvgPaths(dirtyHtml)

      // Should have removed the path element
      expect(cleanedHtml).not.toContain("<path")

      // Should have the SVG element
      expect(cleanedHtml).toContain("<svg")
      expect(cleanedHtml).toContain("</svg>")

      // Should have removed the complex path data
      expect(cleanedHtml).not.toContain("m13.562 7.028")
    })

    it("should handle HTML without SVGs", () => {
      const htmlWithoutSvg = `<div><p>This is a test</p></div>`
      expect(WalmartSvgCleaner.cleanWalmartSvgPaths(htmlWithoutSvg)).toBe(htmlWithoutSvg)
    })

    it("should handle null or empty input", () => {
      expect(WalmartSvgCleaner.cleanWalmartSvgPaths(null)).toBe(null)
      expect(WalmartSvgCleaner.cleanWalmartSvgPaths("")).toBe("")
      expect(WalmartSvgCleaner.cleanWalmartSvgPaths("   ")).toBe("   ")
    })
  })

  describe("fallbackCleanWithRegex", () => {
    it("should still work when DOMParser is unavailable", () => {
      // Save original DOMParser
      const originalDOMParser = global.DOMParser
      // Remove DOMParser to force fallback
      global.DOMParser = undefined

      const dirtyHtml = `
        <svg class="w_D5ag w_6H0I w_1jp4" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
          <path d="m13.562 7.028.17.354.387.062 6.226.999c.011.002.029.008.047.034.018.026.03.063.023.106a.133.133 0 0 1-.034.073l-4.476 4.64-.274.284.079.387 1.321 6.467c.009.042 0 .08-.017.109-.018.028-.036.036-.049.04a.04.04 0 0 1-.014 0 .05.05 0 0 1-.017-.006l-5.926-3.032-.341-.175-.342.175-5.926 3.032a.046.046 0 0 1-.02.006c-.004 0-.01 0-.017-.003-.013-.004-.034-.017-.05-.05a.155.155 0 0 1-.01-.096l1.322-6.467.079-.387-.274-.284-4.477-4.64a.136.136 0 0 1-.035-.095c0-.042.014-.075.034-.096a.067.067 0 0 1 .037-.022l6.226-.999.388-.062.17-.354 2.83-5.892c.016-.033.037-.045.05-.05a.045.045 0 0 1 .018-.003c.004 0 .01.002.02.007a.1.1 0 0 1 .04.046l2.832 5.892Z"></path>
        </svg>`

      const cleanedHtml = WalmartSvgCleaner.fallbackCleanWithRegex(dirtyHtml)

      // Should remove path elements
      expect(cleanedHtml).not.toContain("<path")
      expect(cleanedHtml).toContain("<svg")
      expect(cleanedHtml).toContain("</svg>")

      // Restore DOMParser
      global.DOMParser = originalDOMParser
    })
  })
})
