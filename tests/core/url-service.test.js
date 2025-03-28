import { describe, it, expect } from "vitest"
import { UrlService, AmazonUrlCleaner, GenericUrlCleaner } from "../../src/core/url-service.js"

describe("UrlService", () => {
  it("should clean Amazon product URLs", () => {
    const dirtyUrl =
      "https://www.amazon.com/SwissGear-Travel-Backpacks-Black-21-5/dp/B079R47PHD/ref=asc_df_B097WDNHXM/?tag=hyprod-20&linkCode=df0&hvadid=692875362841&hvpos=&hvnetw=g&hvrand=12501309312931971926&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9061293&hvtargid=pla-2281435178138&mcid=893407ed59c63375922d66964cedd471&hvocijid=12501309312931971926-B097WDNHXM-&hvexpln=73&th=1"
    const cleanUrl = UrlService.cleanUrl(dirtyUrl)
    expect(cleanUrl).toBe(
      "https://www.amazon.com/SwissGear-Travel-Backpacks-Black-21-5/dp/B079R47PHD",
    )
  })

  it("should clean Amazon GP product URLs", () => {
    const dirtyUrl =
      "https://www.amazon.com/gp/product/B079R47PHD/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1"
    const cleanUrl = UrlService.cleanUrl(dirtyUrl)
    expect(cleanUrl).toBe("https://www.amazon.com/gp/product/B079R47PHD")
  })

  it("should handle non-Amazon URLs", () => {
    const dirtyUrl = "https://example.com/?utm_source=test&utm_medium=email"
    const cleanUrl = UrlService.cleanUrl(dirtyUrl)
    expect(cleanUrl).toBe("https://example.com/")
  })

  it("should return original URL if cleaning fails", () => {
    const invalidUrl = "not-a-valid-url"
    const result = UrlService.cleanUrl(invalidUrl)
    expect(result).toBe(invalidUrl)
  })
})

describe("AmazonUrlCleaner", () => {
  const cleaner = new AmazonUrlCleaner()

  it("should clean Amazon product URLs", () => {
    const dirtyUrl =
      "https://www.amazon.com/SwissGear-Travel-Backpacks-Black-21-5/dp/B079R47PHD/ref=asc_df_B097WDNHXM/?tag=hyprod-20"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe(
      "https://www.amazon.com/SwissGear-Travel-Backpacks-Black-21-5/dp/B079R47PHD",
    )
  })

  it("should clean Amazon GP product URLs", () => {
    const dirtyUrl =
      "https://www.amazon.com/gp/product/B079R47PHD/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe("https://www.amazon.com/gp/product/B079R47PHD")
  })

  it("should handle Amazon URLs without product ID", () => {
    const dirtyUrl = "https://www.amazon.com/s?k=backpacks&ref=nb_sb_noss_1"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe("https://www.amazon.com/s")
  })

  it("should handle invalid URLs", () => {
    const invalidUrl = "not-a-valid-url"
    const result = cleaner.clean(invalidUrl)
    expect(result).toBe(invalidUrl)
  })
})

describe("GenericUrlCleaner", () => {
  const cleaner = new GenericUrlCleaner()

  it("should remove common tracking parameters", () => {
    const dirtyUrl =
      "https://example.com/page?utm_source=newsletter&utm_medium=email&valid_param=keep_me"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe("https://example.com/page?valid_param=keep_me")
  })

  it("should handle URLs without tracking parameters", () => {
    const cleanUrl = "https://example.com/page?valid_param=keep_me"
    const result = cleaner.clean(cleanUrl)
    expect(result).toBe(cleanUrl)
  })

  it("should handle URLs without any parameters", () => {
    const cleanUrl = "https://example.com/page"
    const result = cleaner.clean(cleanUrl)
    expect(result).toBe(cleanUrl)
  })

  it("should handle invalid URLs", () => {
    const invalidUrl = "not-a-valid-url"
    const result = cleaner.clean(invalidUrl)
    expect(result).toBe(invalidUrl)
  })
})
