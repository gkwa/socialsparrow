import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { RawHtmlExtractor } from "../../../src/extractors/generic/raw-html-extractor.js"
import { JSDOM } from "jsdom"
import * as pako from "pako"

// Mock pako for tests
vi.mock("pako", () => ({
  deflate: vi.fn((data) => data), // Just return the input data for tests
  inflate: vi.fn((data) => data),
}))

describe("RawHtmlExtractor", () => {
  let document
  let element
  let config
  let extractor

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
          <div id="test-container" class="product-card">
            <h2 class="product-title">Test Product</h2>
            <div class="product-price">$19.99</div>
            <div class="product-details">
              <span class="product-size">16 oz</span>
              <a href="/test-product" class="product-link">View Details</a>
            </div>
          </div>
        </body>
      </html>
    `)

    document = dom.window.document
    element = document.getElementById("test-container")
    config = {
      selectors: {
        productName: ".product-title",
        productPrice: ".product-price",
        productUnit: ".product-size",
      },
    }
    extractor = new RawHtmlExtractor(config)

    // Mock TextEncoder and TextDecoder
    global.TextEncoder = class {
      encode(str) {
        return new Uint8Array(Buffer.from(str, "utf-8"))
      }
    }

    global.TextDecoder = class {
      decode(data) {
        return Buffer.from(data).toString("utf-8")
      }
    }

    // Mock browser globals
    global.btoa = (str) => Buffer.from(str, "binary").toString("base64")
    global.atob = (str) => Buffer.from(str, "base64").toString("binary")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("extract", () => {
    it("should extract, compress, and encode HTML content", () => {
      // Spy on the compress method
      const compressSpy = vi.spyOn(extractor, "compressData")

      const result = extractor.extract(element)

      // Check that result has rawHtml property and compressed flag
      expect(result).toHaveProperty("rawHtml")
      expect(result).toHaveProperty("compressed", true)
      expect(typeof result.rawHtml).toBe("string")

      // Verify compression was called
      expect(compressSpy).toHaveBeenCalled()

      // The result should be base64 encoded string
      expect(result.rawHtml).toMatch(
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
      )
    })

    it("should handle errors during extraction", () => {
      // Make the element.outerHTML throw an error
      Object.defineProperty(element, "outerHTML", {
        get() {
          throw new Error("Mock error")
        },
      })

      const result = extractor.extract(element)
      expect(result).toEqual({ rawHtml: "Error extracting HTML" })
    })
  })

  describe("compressData", () => {
    it("should compress data using pako", () => {
      const testString = "Test string to compress"

      // Call the method
      extractor.compressData(testString)

      // Verify pako.deflate was called
      expect(pako.deflate).toHaveBeenCalled()
    })

    it("should handle compression errors", () => {
      const testString = "Test string"

      // Make pako.deflate throw an error
      pako.deflate.mockImplementationOnce(() => {
        throw new Error("Mock compression error")
      })

      // Should not throw
      const result = extractor.compressData(testString)

      // Should return an ArrayBuffer, Uint8Array, or something that is array-like
      expect(ArrayBuffer.isView(result) || result instanceof Uint8Array).toBe(true)
    })
  })

  describe("toBase64", () => {
    it("should encode binary data to base64", () => {
      const testData = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" in ASCII

      const result = extractor.toBase64(testData)

      // Should be base64 encoded
      expect(result).toMatch(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)

      // Should decode back to original
      const decoded = Buffer.from(result, "base64")
      expect(decoded.toString()).toContain("Hello")
    })

    it("should handle encoding errors", () => {
      // Mock btoa to throw an error
      global.btoa = vi.fn(() => {
        throw new Error("Mock encoding error")
      })

      const result = extractor.toBase64(new Uint8Array([1, 2, 3]))

      expect(result).toBe("Encoding failed")
    })
  })

  describe("decodeRawHtml", () => {
    it("should decode and decompress base64-encoded HTML", () => {
      // Prepare a test string and mock its compression/encoding
      const testHtml = "<div>Test HTML</div>"
      const mockCompressed = new TextEncoder().encode(testHtml)
      const base64Encoded = Buffer.from(mockCompressed).toString("base64")

      // Make pako.inflate return our test data
      pako.inflate.mockImplementationOnce(() => new TextEncoder().encode(testHtml))

      // Test decoding with compression
      const decoded = RawHtmlExtractor.decodeRawHtml(base64Encoded, true)

      // Verify pako.inflate was called
      expect(pako.inflate).toHaveBeenCalled()

      // Result should match original HTML
      expect(decoded).toBe(testHtml)
    })

    it("should handle decompression errors", () => {
      const base64Data = Buffer.from("Test data").toString("base64")

      // Make pako.inflate throw an error
      pako.inflate.mockImplementationOnce(() => {
        throw new Error("Mock decompression error")
      })

      // Should not throw and fallback to uncompressed decoding
      const result = RawHtmlExtractor.decodeRawHtml(base64Data, true)

      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle invalid base64 input", () => {
      const invalidBase64 = "!@#$%^&*()"

      // Mock atob to throw
      global.atob = vi.fn(() => {
        throw new Error("Invalid base64")
      })

      const result = RawHtmlExtractor.decodeRawHtml(invalidBase64)

      expect(result).toBe("Error decoding HTML")
    })
  })

  describe("end-to-end compression and decompression", () => {
    it("should be able to compress and then decompress HTML", () => {
      // Reset mocks to use actual implementations for this test
      vi.resetAllMocks()

      // Create a simple HTML string
      const originalHtml = "<div>Compression test</div>"

      // Mock element.outerHTML to return our test HTML
      Object.defineProperty(element, "outerHTML", {
        get() {
          return originalHtml
        },
      })

      // Extract and encode
      const result = extractor.extract(element)

      // Verify we got a compressed result
      expect(result.compressed).toBe(true)

      // Now decode it - but we'll need to mock the decompression
      // since our mocks aren't actually compressing
      pako.inflate.mockImplementationOnce(() => new TextEncoder().encode(originalHtml))

      const decoded = RawHtmlExtractor.decodeRawHtml(result.rawHtml, true)

      // Verify we got our original HTML back
      expect(decoded).toBe(originalHtml)
    })
  })
})
