import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  AmazonUrlCleaner,
  GenericUrlCleaner,
  SafewayAlbertsonsUrlCleaner,
  WalmartUrlCleaner,
  UrlService,
} from "../../src/core/url-service.js"

describe("UrlService", () => {
  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it("should clean complex Amazon redirect URLs", () => {
    const dirtyUrl =
      "https://www.amazon.com/sspa/click?ie=UTF8&spc=MTo0MTM4MDEzNDY5OTAwODI3OjE3NDQzMjQ5ODk6c3BfYnRmOjMwMDY3NzYyOTU2ODYwMjo6MDo6&url=%2FWeesdsio-Reusable-Containers-Vegetable-Anti-Oxidation%2Fdp%2FB0DSPM9RQZ%2Fref%3Dsr_1_61_sspa%3Fdib%3DeyJ2IjoiMSJ9.uxRL4syCNkIKcgPwimwobZUkHQad3VC49-H5_m9KcR-Jv7JOqPJsE1vOpGR-eFTchh0cEm-vhFawlxJOGaDySmh10Ly4zOFsLXW1YZcjleBkoV6qCI1E6iAEPWgJduA7XHQG61Vf8gbAte0vmoQyMkln3xcmVACD5-I7FPkxumSLLl9KteeZ9BX3vwldn7tnGY_lsPmb78h7CdENB0q4ab7BDNfomTWAadnLdtBfSxW81Jq-HFyVNyar-Q59Lv7iXi9Hfe7NxX4MPaSPNuqq9R3AWMvMMUydrpVkfbZRgLw.csP2GVjx5o7gG-LC68KYKrWPtPv4G92NlNskP237yNU%26dib_tag%3Dse%26keywords%3Dfresh%2Bavocados%26qid%3D1744324989%26sr%3D8-61-spons%26sp_csd%3Dd2lkZ2V0TmFtZT1zcF9idGY%26psc%3D1"
    const cleanUrl = UrlService.cleanUrl(dirtyUrl)
    expect(cleanUrl).toBe(
      "https://www.amazon.com/Weesdsio-Reusable-Containers-Vegetable-Anti-Oxidation/dp/B0DSPM9RQZ",
    )
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

describe("GenericUrlCleaner", () => {
  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

describe("WalmartUrlCleaner", () => {
  beforeEach(() => {
    // Silence console output during tests
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const cleaner = new WalmartUrlCleaner()

  it("should clean Walmart tracking URLs", () => {
    const dirtyUrl =
      "https://www.walmart.com/sp/track?bt=1&eventST=click&plmt=sp-search-middle~desktop~&pos=22&tax=976759_976794_4649724_6195973&rdf=1&rd=https%3A%2F%2Fwww.walmart.com%2Fip%2FBertolli-Extra-Virgin-Olive-Oil-Smooth-Taste-16-9-fl-oz%2F883586968%3FclassType%3DVARIANT%26adsRedirect%3Dtrue"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe(
      "https://www.walmart.com/ip/Bertolli-Extra-Virgin-Olive-Oil-Smooth-Taste-16-9-fl-oz/883586968",
    )
  })

  it("should clean direct Walmart product URLs", () => {
    const dirtyUrl =
      "https://www.walmart.com/ip/Bertolli-Extra-Virgin-Olive-Oil-Smooth-Taste-16-9-fl-oz/883586968?some=tracking&params=here"
    const cleanUrl = cleaner.clean(dirtyUrl)
    expect(cleanUrl).toBe(
      "https://www.walmart.com/ip/Bertolli-Extra-Virgin-Olive-Oil-Smooth-Taste-16-9-fl-oz/883586968",
    )
  })

  it("should handle invalid URLs", () => {
    const invalidUrl = "not-a-valid-url"
    const result = cleaner.clean(invalidUrl)
    expect(result).toBe(invalidUrl)
  })
})
