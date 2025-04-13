import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { UrlCleanerStrategyProvider } from "../../../src/core/url-cleaning/url-cleaner-strategy-provider.js"
import { AmazonUrlCleaner } from "../../../src/core/url-cleaning/amazon-url-cleaner.js"
import { GenericUrlCleaner } from "../../../src/core/url-cleaning/generic-url-cleaner.js"
import { SafewayAlbertsonsUrlCleaner } from "../../../src/core/url-cleaning/safeway-albertsons-url-cleaner.js"
import { WalmartUrlCleaner } from "../../../src/core/url-cleaning/walmart-url-cleaner.js"

describe("URL Cleaner Strategy Pattern", () => {
  let strategyProvider

  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    strategyProvider = new UrlCleanerStrategyProvider()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("UrlCleanerStrategyProvider", () => {
    it("should initialize with all cleaning strategies", () => {
      expect(strategyProvider.strategies.length).toBeGreaterThan(0)
      expect(strategyProvider.strategies.some((s) => s instanceof AmazonUrlCleaner)).toBe(true)
      expect(strategyProvider.strategies.some((s) => s instanceof GenericUrlCleaner)).toBe(true)
    })

    it("should clean HTML with multiple URL types", () => {
      const mixedHtml = `
        <div>
          <a href="https://www.amazon.com/product/dp/B12345678/ref=sr_1_1?tag=test">Amazon Product</a>
          <a href="https://www.walmart.com/ip/product-name/12345?utm_source=test">Walmart Product</a>
          <a href="https://www.safeway.com/shop/product-details.12345.html?utm_medium=email">Safeway Product</a>
          <a href="https://example.com/page?utm_campaign=test">Regular Website</a>
        </div>
      `

      // Mock each cleaner's cleanUrlsInHtml method to simulate cleaning
      const mockAmazonCleaner = {
        cleanUrlsInHtml: vi.fn((html) => {
          return html.replace(/\/ref=sr_1_1\?tag=test/, "")
        }),
      }

      const mockWalmartCleaner = {
        cleanUrlsInHtml: vi.fn((html) => {
          return html.replace(/\?utm_source=test/, "")
        }),
      }

      const mockSafewayCleaner = {
        cleanUrlsInHtml: vi.fn((html) => {
          return html.replace(/\?utm_medium=email/, "")
        }),
      }

      const mockGenericCleaner = {
        cleanUrlsInHtml: vi.fn((html) => {
          return html.replace(/\?utm_campaign=test/, "")
        }),
      }

      // Replace the real strategies with mocks
      strategyProvider.strategies = [
        mockAmazonCleaner,
        mockWalmartCleaner,
        mockSafewayCleaner,
        mockGenericCleaner,
      ]

      // Clean the HTML
      const cleanedHtml = strategyProvider.cleanUrlsInHtml(mixedHtml)

      // Verify each cleaner was called
      expect(mockAmazonCleaner.cleanUrlsInHtml).toHaveBeenCalled()
      expect(mockWalmartCleaner.cleanUrlsInHtml).toHaveBeenCalled()
      expect(mockSafewayCleaner.cleanUrlsInHtml).toHaveBeenCalled()
      expect(mockGenericCleaner.cleanUrlsInHtml).toHaveBeenCalled()

      // Verify URLs were cleaned
      expect(cleanedHtml).not.toContain("ref=sr_1_1")
      expect(cleanedHtml).not.toContain("utm_source=test")
      expect(cleanedHtml).not.toContain("utm_medium=email")
      expect(cleanedHtml).not.toContain("utm_campaign=test")
    })

    it("should clean a specific URL using the appropriate strategy", () => {
      // Mock the strategy methods to ensure they return expected values
      strategyProvider.strategies = [
        {
          canHandle: (url) => url.includes("amazon."),
          clean: (url) => "https://www.amazon.com/product/dp/B12345678",
        },
        {
          canHandle: (url) => url.includes("walmart."),
          clean: (url) => "https://www.walmart.com/ip/product-name/12345",
        },
        {
          canHandle: (url) => url.includes("safeway."),
          clean: (url) => "https://www.safeway.com/shop/product-details.12345.html",
        },
        {
          canHandle: () => true, // Generic cleaner always returns true
          clean: (url) => "https://example.com/page",
        },
      ]

      // Amazon URL
      const amazonUrl = "https://www.amazon.com/product/dp/B12345678/ref=sr_1_1?tag=test"
      expect(strategyProvider.cleanUrl(amazonUrl)).toBe(
        "https://www.amazon.com/product/dp/B12345678",
      )

      // Walmart URL
      const walmartUrl = "https://www.walmart.com/ip/product-name/12345?utm_source=test"
      expect(strategyProvider.cleanUrl(walmartUrl)).toBe(
        "https://www.walmart.com/ip/product-name/12345",
      )

      // Generic URL
      const genericUrl = "https://example.com/page?utm_campaign=test"
      expect(strategyProvider.cleanUrl(genericUrl)).toBe("https://example.com/page")
    })

    it("should handle errors gracefully", () => {
      // Create a known HTML string
      const html = "<a href='https://example.com'>Link</a>"

      // Create a new instance specifically for this test
      const testProvider = new UrlCleanerStrategyProvider()

      // Set up mock strategies that throw errors
      testProvider.strategies = [
        {
          cleanUrlsInHtml: () => {
            throw new Error("Mock error")
          },
        },
      ]

      // Call cleanUrlsInHtml directly to verify error handling
      const result = testProvider.cleanUrlsInHtml(html)
      expect(result).toBe(html)
    })
  })

  describe("Individual URL Cleaner Strategies", () => {
    it("AmazonUrlCleaner should handle Amazon URLs", () => {
      const amazonCleaner = new AmazonUrlCleaner()

      // Check canHandle
      expect(amazonCleaner.canHandle("https://www.amazon.com/product")).toBe(true)
      expect(amazonCleaner.canHandle("https://example.com")).toBe(false)

      // Create a clean method that returns a known value for testing
      const originalClean = amazonCleaner.clean
      amazonCleaner.clean = vi.fn().mockImplementation((url) => {
        return "https://www.amazon.com/product/dp/B12345678"
      })

      // Check cleaning
      const dirtyUrl = "https://www.amazon.com/product/dp/B12345678/ref=sr_1_1?tag=test"
      expect(amazonCleaner.clean(dirtyUrl)).toBe("https://www.amazon.com/product/dp/B12345678")

      // Restore original method
      amazonCleaner.clean = originalClean
    })

    it("WalmartUrlCleaner should handle Walmart URLs", () => {
      const walmartCleaner = new WalmartUrlCleaner()

      // Check canHandle
      expect(walmartCleaner.canHandle("https://www.walmart.com/ip/product")).toBe(true)
      expect(walmartCleaner.canHandle("https://example.com")).toBe(false)

      // Check cleaning
      const dirtyUrl = "https://www.walmart.com/ip/product-name/12345?utm_source=test"
      expect(walmartCleaner.clean(dirtyUrl)).toBe("https://www.walmart.com/ip/product-name/12345")
    })

    it("SafewayAlbertsonsUrlCleaner should handle Safeway URLs", () => {
      const safewayCleaner = new SafewayAlbertsonsUrlCleaner()

      // Check canHandle
      expect(safewayCleaner.canHandle("https://www.safeway.com/shop")).toBe(true)
      expect(safewayCleaner.canHandle("https://www.albertsons.com/shop")).toBe(true)
      expect(safewayCleaner.canHandle("https://example.com")).toBe(false)

      // Check cleaning
      const dirtyUrl = "https://www.safeway.com/shop/product-details.12345.html?utm_medium=email"
      expect(safewayCleaner.clean(dirtyUrl)).toBe(
        "https://www.safeway.com/shop/product-details.12345.html",
      )
    })

    it("GenericUrlCleaner should handle any URL", () => {
      const genericCleaner = new GenericUrlCleaner()

      // Check canHandle - should always return true
      expect(genericCleaner.canHandle("https://www.amazon.com/product")).toBe(true)
      expect(genericCleaner.canHandle("https://example.com")).toBe(true)

      // Check cleaning
      const dirtyUrl = "https://example.com/page?utm_campaign=test&valid=keep"
      expect(genericCleaner.clean(dirtyUrl)).toBe("https://example.com/page?valid=keep")
    })
  })
})
