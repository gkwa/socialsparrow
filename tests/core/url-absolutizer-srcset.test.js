import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { UrlAbsolutizer } from "../../src/core/url-absolutizer.js"
import { JSDOM } from "jsdom"

describe("UrlAbsolutizer srcset handling", () => {
  let document
  let element

  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    // Set up a mock DOM environment for testing
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="test-container">
            <!-- Simple srcset test case -->
            <img srcset="/basic1.jpg 1x, /basic2.jpg 2x" alt="Basic test">

            <!-- Complex srcset with commas in URLs -->
            <img srcset="/complex1.jpg?param=value,true 1x, /complex2.jpg?param=value,false 2x" alt="Complex test">

            <!-- Instacart-like srcset test case -->
            <img
              srcset="//www.instacart.com/image-server/197x197/filters:fill(FFFFFF, true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 1x,
                     //www.instacart.com/image-server/296x296/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 1.5x,
                     //www.instacart.com/image-server/394x394/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 2x"
              alt="Instacart style">

            <!-- Empty srcset test case -->
            <img srcset="" alt="Empty test">

            <!-- Single URL srcset -->
            <img srcset="/single.jpg" alt="Single URL test">

            <!-- Multiple commas and descriptors -->
            <source srcset="/multi1.jpg?query=fancy,param,true 400w, /multi2.jpg?other=param,complex 800w">
          </div>
        </body>
      </html>
    `)

    document = dom.window.document
    element = document.getElementById("test-container")

    // Mock global objects
    global.window = Object.create(window)
    global.window.location = {
      origin: "https://test.example.com",
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("_processSrcsetValue", () => {
    it("should handle empty srcset values", () => {
      const result = UrlAbsolutizer._processSrcsetValue("", "https://test.example.com")
      expect(result).toBe("")
    })

    it("should handle simple srcset values", () => {
      const srcset = "/image1.jpg 1x, /image2.jpg 2x"
      const result = UrlAbsolutizer._processSrcsetValue(srcset, "https://test.example.com")

      expect(result).toContain("https://test.example.com/image1.jpg 1x")
      expect(result).toContain("https://test.example.com/image2.jpg 2x")
    })

    it("should handle complex srcset with commas in URLs", () => {
      const srcset = "/complex.jpg?param=value,true 1x, /other.jpg?param=something,else 2x"
      const result = UrlAbsolutizer._processSrcsetValue(srcset, "https://test.example.com")

      expect(result).toContain("https://test.example.com/complex.jpg?param=value,true 1x")
      expect(result).toContain("https://test.example.com/other.jpg?param=something,else 2x")
    })

    it("should handle Instacart-style srcset with multiple commas", () => {
      const srcset =
        "//instacart.com/image-server/100x100/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_abc.jpg 1x"
      const result = UrlAbsolutizer._processSrcsetValue(srcset, "https://test.example.com")

      expect(result).toBe(
        "https://instacart.com/image-server/100x100/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_abc.jpg 1x",
      )
    })

    it("should handle srcset with no descriptors", () => {
      const srcset = "/image-only.jpg"
      const result = UrlAbsolutizer._processSrcsetValue(srcset, "https://test.example.com")

      expect(result).toBe("https://test.example.com/image-only.jpg")
    })
  })

  describe("absolutizeUrls with srcset", () => {
    it("should absolutize all URLs in srcset attributes", () => {
      const processed = UrlAbsolutizer.absolutizeUrls(element)

      // Check the basic srcset
      const basicImg = processed.querySelector("img[alt='Basic test']")
      const basicSrcset = basicImg.getAttribute("srcset")
      expect(basicSrcset).toContain("https://test.example.com/basic1.jpg 1x")
      expect(basicSrcset).toContain("https://test.example.com/basic2.jpg 2x")

      // Check the complex srcset
      const complexImg = processed.querySelector("img[alt='Complex test']")
      const complexSrcset = complexImg.getAttribute("srcset")
      expect(complexSrcset).toContain("https://test.example.com/complex1.jpg?param=value,true 1x")
      expect(complexSrcset).toContain("https://test.example.com/complex2.jpg?param=value,false 2x")

      // Check the Instacart-style srcset
      const instacartImg = processed.querySelector("img[alt='Instacart style']")
      const instacartSrcset = instacartImg.getAttribute("srcset")
      expect(instacartSrcset).toContain(
        "https://www.instacart.com/image-server/197x197/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 1x",
      )
      expect(instacartSrcset).toContain(
        "https://www.instacart.com/image-server/296x296/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 1.5x",
      )
      expect(instacartSrcset).toContain(
        "https://www.instacart.com/image-server/394x394/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_12345.jpg 2x",
      )

      // Check empty srcset
      const emptyImg = processed.querySelector("img[alt='Empty test']")
      expect(emptyImg.getAttribute("srcset")).toBe("")

      // Check single URL srcset
      const singleImg = processed.querySelector("img[alt='Single URL test']")
      expect(singleImg.getAttribute("srcset")).toBe("https://test.example.com/single.jpg")

      // Check multiple commas case
      const multiSource = processed.querySelector("source")
      const multiSrcset = multiSource.getAttribute("srcset")
      expect(multiSrcset).toContain(
        "https://test.example.com/multi1.jpg?query=fancy,param,true 400w",
      )
      expect(multiSrcset).toContain("https://test.example.com/multi2.jpg?other=param,complex 800w")
    })

    it("should handle real Instacart HTML snippet", () => {
      // Create a new element with the exact Instacart HTML
      const instacartElement = document.createElement("div")
      instacartElement.innerHTML = `
        <img srcset="https://www.instacart.com/image-server/197x197/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg,
                    https://www.instacart.com/image-server/296x296/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 1.5x,
                    https://www.instacart.com/image-server/394x394/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 2x,
                    https://www.instacart.com/image-server/591x591/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 3x,
                    https://www.instacart.com/image-server/788x788/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 4x"
             alt="Exact Instacart HTML">
      `

      // Process
      const processed = UrlAbsolutizer.absolutizeUrls(instacartElement)

      // Get the processed srcset
      const img = processed.querySelector("img")
      const srcset = img.getAttribute("srcset")

      // Check for each URL
      expect(srcset).toContain(
        "https://www.instacart.com/image-server/197x197/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg",
      )
      expect(srcset).toContain(
        "https://www.instacart.com/image-server/296x296/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 1.5x",
      )
      expect(srcset).toContain(
        "https://www.instacart.com/image-server/394x394/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 2x",
      )
      expect(srcset).toContain(
        "https://www.instacart.com/image-server/591x591/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 3x",
      )
      expect(srcset).toContain(
        "https://www.instacart.com/image-server/788x788/filters:fill(FFFFFF,true):format(jpg)/d2lnr5mha7bycj.cloudfront.net/product-image/file/large_788ce8b2-2465-4c4a-ab24-8a9448549874.jpg 4x",
      )
    })
  })

  describe("error handling", () => {
    it("should handle invalid srcset values gracefully", () => {
      // Create a mock with invalid srcset
      const invalidElement = document.createElement("div")
      invalidElement.innerHTML = `<img srcset="this is not a valid srcset" alt="Invalid">`

      // Process
      const processed = UrlAbsolutizer.absolutizeUrls(invalidElement)

      // Should not throw an error
      const img = processed.querySelector("img")
      expect(img.getAttribute("srcset")).toBe("this is not a valid srcset")
    })

    it("should handle srcset with undefined descriptors", () => {
      // Create a mock with undefined descriptor
      const element = document.createElement("div")
      element.innerHTML = `<img srcset="/image.jpg undefined" alt="Invalid descriptor">`

      // Process
      const processed = UrlAbsolutizer.absolutizeUrls(element)

      // Should handle the undefined descriptor
      const img = processed.querySelector("img")
      expect(img.getAttribute("srcset")).toBe("https://test.example.com/image.jpg undefined")
    })
  })
})
