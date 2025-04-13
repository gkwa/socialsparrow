import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { RawHtmlExtractor } from "../../../src/extractors/generic/raw-html-extractor.js"
import { AmazonUrlCleaner } from "../../../src/core/url-cleaning/amazon-url-cleaner.js"

describe("RawHtmlExtractor URL Cleaning", () => {
  let extractor
  let mockElement

  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    // Create extractor with a mock config
    extractor = new RawHtmlExtractor({ websiteId: "test" })

    // Set up a spy on the cleanUrlsInHtml method
    vi.spyOn(extractor, "cleanUrlsInHtml")
    vi.spyOn(extractor.urlCleanerProvider, "cleanUrlsInHtml")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("cleanUrlsInHtml", () => {
    it("should clean Amazon URLs in HTML content", () => {
      const htmlWithAmazonUrls = `
        <div class="product">
          <a href="https://www.amazon.com/product-name/dp/B012345678/ref=sr_1_1?keywords=test&qid=1234567890">Product</a>
          <a href="https://www.amazon.com/gp/product/B012345678?pf_rd_r=ABCDEF&pf_rd_p=1234567890">Another Link</a>
          <a href="https://example.com/not-amazon">Not Amazon</a>
        </div>
      `

      // Mock the URL cleaner to return a modified HTML string
      vi.spyOn(extractor.urlCleanerProvider, "cleanUrlsInHtml").mockReturnValueOnce(
        htmlWithAmazonUrls
          .replace(/ref=sr_1_1\?keywords=test&qid=1234567890/, "")
          .replace(/\?pf_rd_r=ABCDEF&pf_rd_p=1234567890/, ""),
      )

      const cleanedHtml = extractor.cleanUrlsInHtml(htmlWithAmazonUrls)

      // Check that cleanUrlsInHtml was called
      expect(extractor.urlCleanerProvider.cleanUrlsInHtml).toHaveBeenCalledWith(htmlWithAmazonUrls)

      // Check that Amazon URLs were cleaned - using partial matching to be more robust
      expect(cleanedHtml).toContain("https://www.amazon.com/product-name/dp/B012345678")
      expect(cleanedHtml).toContain("https://www.amazon.com/gp/product/B012345678")

      // Check that non-Amazon URLs were not modified
      expect(cleanedHtml).toContain("https://example.com/not-amazon")

      // Check that tracking parameters were removed
      expect(cleanedHtml).not.toContain("ref=sr_1_1")
      expect(cleanedHtml).not.toContain("keywords=test")
      expect(cleanedHtml).not.toContain("qid=1234567890")
      expect(cleanedHtml).not.toContain("pf_rd_r=ABCDEF")
      expect(cleanedHtml).not.toContain("pf_rd_p=1234567890")
    })

    it("should handle HTML with no Amazon URLs", () => {
      const htmlWithoutAmazonUrls = `
        <div class="product">
          <a href="https://example.com/product">Product</a>
          <a href="https://other-site.com/item">Another Link</a>
        </div>
      `

      // Mock the URL cleaner to return the same HTML
      vi.spyOn(extractor.urlCleanerProvider, "cleanUrlsInHtml").mockReturnValueOnce(
        htmlWithoutAmazonUrls,
      )

      const cleanedHtml = extractor.cleanUrlsInHtml(htmlWithoutAmazonUrls)

      // Content should be unchanged
      expect(cleanedHtml).toBe(htmlWithoutAmazonUrls)
    })

    it("should handle complex Amazon URLs including redirect URLs", () => {
      const complexAmazonHtml = `
        <div class="product">
          <a href="https://www.amazon.com/sspa/click?ie=UTF8&spc=MTo0MTM4MDEzNDY5OTAwODI3OjE3NDQzMjQ5ODk6c3BfYnRmOjMwMDY3NzYyOTU2ODYwMjo6MDo6&url=%2FWeesdsio-Reusable-Containers-Vegetable-Anti-Oxidation%2Fdp%2FB0DSPM9RQZ%2Fref%3Dsr_1_61_sspa">Redirected Product</a>
        </div>
      `

      // Mock the cleaner to return a modified HTML with a cleaned URL
      const cleanedUrl =
        "https://www.amazon.com/Weesdsio-Reusable-Containers-Vegetable-Anti-Oxidation/dp/B0DSPM9RQZ"
      vi.spyOn(extractor.urlCleanerProvider, "cleanUrlsInHtml").mockReturnValueOnce(
        complexAmazonHtml.replace(
          /https:\/\/www\.amazon\.com\/sspa\/click\?.*">/,
          `${cleanedUrl}">`,
        ),
      )

      const cleanedHtml = extractor.cleanUrlsInHtml(complexAmazonHtml)

      // Verify the URL was cleaned
      expect(cleanedHtml).toContain(cleanedUrl)
      expect(cleanedHtml).not.toContain("sspa/click")
    })

    it("should handle errors during URL cleaning", () => {
      // Create a mock HTML string
      const htmlWithAmazonUrls = `
        <div class="product">
          <a href="https://www.amazon.com/product-name/dp/B012345678/ref=sr_1_1">Product</a>
        </div>
      `

      // Make the cleaner throw an error
      vi.spyOn(extractor.urlCleanerProvider, "cleanUrlsInHtml").mockImplementationOnce(() => {
        throw new Error("Mocked URL cleaning error")
      })

      // The method should catch the error and return the original HTML
      const result = extractor.cleanUrlsInHtml(htmlWithAmazonUrls)
      expect(result).toBe(htmlWithAmazonUrls)
    })
  })

  describe("extract with URL cleaning", () => {
    it("should clean Amazon URLs during extraction", () => {
      // Mock element with Amazon URLs
      mockElement = {
        outerHTML: `
          <div class="product">
            <a href="https://www.amazon.com/product-name/dp/B012345678/ref=sr_1_1?keywords=test&qid=1234567890">Product</a>
            <span class="price">$19.99</span>
          </div>
        `,
      }

      // Mock cleanUrlsInHtml to simulate cleaning
      vi.spyOn(extractor, "cleanUrlsInHtml").mockReturnValueOnce(
        mockElement.outerHTML.replace(/ref=sr_1_1\?keywords=test&qid=1234567890/, ""),
      )

      // Extract the content
      const result = extractor.extract(mockElement)

      // Verify that cleanUrlsInHtml was called
      expect(extractor.cleanUrlsInHtml).toHaveBeenCalled()

      // The full validation of the output is complex due to compression,
      // but we can verify that the raw HTML was processed
      expect(result).toHaveProperty("rawHtml")
      expect(typeof result.rawHtml).toBe("string")
    })

    it("should extract HTML with no Amazon URLs", () => {
      // Mock element with no Amazon URLs
      mockElement = {
        outerHTML: `
          <div class="product">
            <a href="https://example.com/product">Product</a>
            <span class="price">$19.99</span>
          </div>
        `,
      }

      // Mock cleanUrlsInHtml to return the same HTML
      vi.spyOn(extractor, "cleanUrlsInHtml").mockReturnValueOnce(mockElement.outerHTML)

      // Extract the content
      const result = extractor.extract(mockElement)

      // Verify that cleanUrlsInHtml was called
      expect(extractor.cleanUrlsInHtml).toHaveBeenCalled()

      // Extraction should still succeed
      expect(result).toHaveProperty("rawHtml")
      expect(typeof result.rawHtml).toBe("string")
    })
  })
})
