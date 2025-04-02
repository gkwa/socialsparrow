import { BaseExtractor } from "../base-extractor.js"

/**
 * Target Name Extractor
 */
export class TargetNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector('[data-test="product-title"]')
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get URL from the anchor tag
      const linkElement = nameElement.closest("a")
      url = linkElement ? linkElement.getAttribute("href") : "N/A"

      // Make URL absolute if it's relative
      if (url !== "N/A" && url.startsWith("/")) {
        url = `${window.location.origin}${url}`
      }
    }

    return { name, url }
  }
}

/**
 * Target Price Extractor
 */
export class TargetPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector('[data-test="current-price"]')
    let price = "N/A"

    if (priceElement) {
      price = priceElement.textContent.trim()
    }

    return { price }
  }
}

/**
 * Target Price Per Unit Extractor
 */
export class TargetPricePerUnitExtractor extends BaseExtractor {
  extract(element) {
    const unitPriceElement = element.querySelector('[data-test="unit-price"]')
    let pricePerUnit = "N/A"

    if (unitPriceElement) {
      pricePerUnit = unitPriceElement.textContent.trim()
    }

    return { pricePerUnit }
  }
}

/**
 * Target Brand Extractor
 */
export class TargetBrandExtractor extends BaseExtractor {
  extract(element) {
    const brandElement = element.querySelector(
      '[data-test="@web/ProductCard/ProductCardBrandAndRibbonMessage/brand"]',
    )
    let brand = "N/A"
    let brandUrl = "N/A"

    if (brandElement) {
      brand = brandElement.textContent.trim()
      brandUrl = brandElement.getAttribute("href")

      // Make URL absolute if it's relative
      if (brandUrl !== "N/A" && brandUrl.startsWith("/")) {
        brandUrl = `${window.location.origin}${brandUrl}`
      }
    }

    return { brand, brandUrl }
  }
}

/**
 * Target Ratings Extractor
 */
export class TargetRatingsExtractor extends BaseExtractor {
  extract(element) {
    const ratingsContainer = element.querySelector(".styles_ndsRatingStars__rtewp")
    let rating = "N/A"
    let reviewCount = "N/A"

    if (ratingsContainer) {
      // Get rating from the screen reader text
      const srElement = ratingsContainer.querySelector(".styles_ndsScreenReaderOnly__mcNC_")
      if (srElement) {
        const ratingMatch = srElement.textContent.match(/(\d+\.?\d*)\s+out\s+of\s+5\s+stars/i)
        if (ratingMatch) {
          rating = ratingMatch[1]
        }
      } else {
        // Alternative approach: get rating from the mask width which represents fill percentage
        const ratingMask = ratingsContainer.querySelector(".styles_ratingMask__lwDAH")
        if (ratingMask) {
          const widthStyle = ratingMask.getAttribute("style")
          const widthMatch = widthStyle?.match(/width:\s*(\d+)%/)
          if (widthMatch) {
            // Convert percentage to 5-star scale
            const percentage = parseInt(widthMatch[1])
            rating = ((percentage / 100) * 5).toFixed(1)
          }
        }
      }

      // Get review count
      const reviewElement = ratingsContainer.querySelector(".styles_count__8KRt3")
      if (reviewElement) {
        const reviewMatch = reviewElement.textContent.match(/(\d+)/)
        if (reviewMatch) {
          reviewCount = reviewMatch[1]
        }
      }
    }

    return { rating, reviewCount }
  }
}

/**
 * Target Image URL Extractor
 */
export class TargetImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector("img")
    let imageUrl = "N/A"

    if (imageElement) {
      imageUrl = imageElement.getAttribute("src") || "N/A"
    }

    return { imageUrl }
  }
}

/**
 * Target Shipping Info Extractor
 */
export class TargetShippingExtractor extends BaseExtractor {
  extract(element) {
    const shippingElement = element.querySelector(
      '[data-test="LPFulfillmentSectionShippingFA_standardShippingMessage"]',
    )
    let shipping = "N/A"

    if (shippingElement) {
      shipping = shippingElement.textContent.trim()
    }

    return { shipping }
  }
}

/**
 * Target Sponsored Status Extractor
 */
export class TargetSponsoredExtractor extends BaseExtractor {
  extract(element) {
    const sponsoredElement = element.querySelector('[data-test="sponsoredText"]')
    let isSponsored = false

    if (sponsoredElement && sponsoredElement.textContent.includes("Sponsored")) {
      isSponsored = true
    }

    return { isSponsored }
  }
}

/**
 * Target SNAP/EBT Eligibility Extractor
 */
export class TargetSnapEligibilityExtractor extends BaseExtractor {
  extract(element) {
    const snapElement = element.querySelector('[id^="product-card-snap-"]')
    let snapEligible = false

    if (snapElement && snapElement.textContent.includes("SNAP EBT eligible")) {
      snapEligible = true
    }

    return { snapEligible }
  }
}
