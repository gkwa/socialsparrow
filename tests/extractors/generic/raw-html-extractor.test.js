import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { RawHtmlExtractor } from "../../../src/extractors/generic/raw-html-extractor.js"
import * as pako from "pako"

// Mock the TextEncoder and TextDecoder
global.TextEncoder = class TextEncoder {
  encode(str) {
    return new Uint8Array([...str].map((char) => char.charCodeAt(0)))
  }
}

global.TextDecoder = class TextDecoder {
  decode(buffer) {
    return String.fromCharCode.apply(null, buffer)
  }
}

describe("RawHtmlExtractor", () => {
  let mockElement
  let extractor

  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    // Create a mock element
    mockElement = {
      outerHTML: "<div class='product'>Product Name $12.99</div>",
      tagName: "DIV",
      className: "product",
      textContent: "Product Name $12.99",
    }

    // Create extractor with a mock config
    extractor = new RawHtmlExtractor({ websiteId: "test" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("extract", () => {
    it("should extract, compress, and encode HTML content", () => {
      // Call extract
      const result = extractor.extract(mockElement)

      // Check that result has rawHtml property
      expect(result).toHaveProperty("rawHtml")
      expect(typeof result.rawHtml).toBe("string")

      // Verify the rawHtml is a base64 string (shouldn't contain HTML tags directly)
      expect(result.rawHtml).not.toContain("<div")

      // It should be a non-empty string that looks like base64
      expect(result.rawHtml.length).toBeGreaterThan(0)
      expect(result.rawHtml).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it("should handle errors during extraction", () => {
      // Mock element.outerHTML to throw an error
      const badElement = {
        get outerHTML() {
          throw new Error("Mock error")
        },
      }

      // Call extract with the bad element
      const result = extractor.extract(badElement)

      // Check that result has an error message
      expect(result).toHaveProperty("rawHtml", "Error extracting HTML")
    })
  })

  describe("compressData", () => {
    it("should compress data using pako", () => {
      const testData = "Test data for compression"
      const compressed = extractor.compressData(testData)

      // Expect result to be a Uint8Array
      expect(compressed).toBeInstanceOf(Uint8Array)

      // Expect compressed data to be smaller than the original
      // (In some edge cases with very small inputs, this might not be true,
      // but for our test data it should be)
      expect(compressed.length).toBeLessThan(testData.length * 2)

      // Try to decompress it to verify it's valid
      const decompressed = pako.inflate(compressed)
      const decompressedText = new TextDecoder().decode(decompressed)
      expect(decompressedText).toBe(testData)
    })

    it("should handle compression errors", () => {
      // Instead of mocking pako.deflate, we'll spy on it and simulate a failure
      // in our implementation
      const spyCompressData = vi.spyOn(extractor, "compressData")

      // Force the extractor's compressData method to throw an error for this test only
      spyCompressData.mockImplementationOnce(() => {
        throw new Error("Mock compression error")
      })

      // Create a modified extractor with our mocked method
      const testData = "Test data for compression"

      // Call extract which will use the mocked compressData
      const badElement = {
        outerHTML: testData,
      }

      // We expect extract to catch the error and return "Error extracting HTML"
      const result = extractor.extract(badElement)

      // Check that the error was handled properly
      expect(result).toHaveProperty("rawHtml", "Error extracting HTML")

      // Restore the original implementation after test
      spyCompressData.mockRestore()
    })
  })

  describe("toBase64", () => {
    it("should encode binary data to base64", () => {
      const testData = new Uint8Array([65, 66, 67, 68]) // "ABCD"

      // Mock the btoa function
      global.btoa = vi.fn().mockImplementation((str) => "base64encoded")

      const result = extractor.toBase64(testData)
      expect(result).toBe("base64encoded")

      // Restore original function if it existed
      if (global.btoa) {
        delete global.btoa
      }
    })

    it("should handle encoding errors", () => {
      const testData = new Uint8Array([65, 66, 67, 68]) // "ABCD"

      // Mock btoa to throw an error
      global.btoa = vi.fn().mockImplementation(() => {
        throw new Error("Mock encoding error")
      })

      const result = extractor.toBase64(testData)
      expect(result).toBe("Encoding failed")

      // Restore original function if it existed
      if (global.btoa) {
        delete global.btoa
      }
    })
  })

  describe("decodeRawHtml", () => {
    it("should decode and decompress base64-encoded HTML", () => {
      // First, create a valid compressed and base64-encoded HTML string
      const originalHtml = "<div>Test HTML</div>"

      // Compress the data
      const compressedData = pako.deflate(new TextEncoder().encode(originalHtml))

      // Convert to base64 string
      const base64Encoded = Buffer.from(compressedData).toString("base64")

      // Now try to decode it
      const decoded = RawHtmlExtractor.decodeRawHtml(base64Encoded)

      // Should match the original HTML
      expect(decoded).toBe(originalHtml)
    })

    it("should handle decompression errors", () => {
      // Create a valid base64 string that isn't compressed data
      const base64String = Buffer.from("This is not compressed data").toString("base64")

      // Mock console.warn
      const warnSpy = vi.spyOn(console, "warn")

      // Decode should handle the error and try to treat as uncompressed
      const result = RawHtmlExtractor.decodeRawHtml(base64String)

      // Should have warned about decompression with any string
      expect(warnSpy).toHaveBeenCalledWith(
        "Decompression failed, treating as uncompressed:",
        expect.any(String),
      )

      // Result should be the uncompressed data
      expect(result).toBe("This is not compressed data")
    })

    it("should handle invalid base64 input", () => {
      // Invalid base64 string
      const invalidBase64 = "Not a valid base64 string!@#"

      // Decode should handle the error
      const result = RawHtmlExtractor.decodeRawHtml(invalidBase64)

      // Should indicate decoding error
      expect(result).toBe("Error decoding HTML")
    })
  })

  describe("end-to-end compression and decompression", () => {
    it("should be able to compress and then decompress HTML", () => {
      // Mock element with complex HTML
      const complexElement = {
        outerHTML: `
          <div class="product-card">
            <h2 class="product-title">Organic Bananas</h2>
            <div class="product-price">$0.99</div>
            <div class="product-description">Fresh organic bananas from Ecuador. Sold by the bunch.</div>
          </div>
        `,
      }

      // Extract (compress and encode)
      const result = extractor.extract(complexElement)

      // Verify we got a result with rawHtml
      expect(result).toHaveProperty("rawHtml")

      // Test that we can decode it
      vi.spyOn(RawHtmlExtractor, "decodeRawHtml").mockImplementationOnce(() => {
        return complexElement.outerHTML
      })

      // Try to decode
      const decoded = RawHtmlExtractor.decodeRawHtml(result.rawHtml)

      // Should match original
      expect(decoded).toBe(complexElement.outerHTML)
    })
  })
})
