import { BaseExtractor } from "../base-extractor.js"
import { UrlService } from "../../core/url-service.js"

/**
 * Amazon Name Extractor
 */
export class AmazonNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // First try to get URL from the direct link containing the product name
      const productLink = nameElement.closest("a")
      if (productLink && productLink.getAttribute("href")) {
        url = productLink.getAttribute("href")
      } else {
        // If that fails, try to find any product link in the container
        const linkElements = element.querySelectorAll('a[href*="/dp/"]')
        if (linkElements.length > 0) {
          url = linkElements[0].getAttribute("href")
        } else {
          // Try broader selector for any product link
          const anyProductLinks = element.querySelectorAll('a.a-link-normal[href*="/"]')
          for (const link of anyProductLinks) {
            const href = link.getAttribute("href")
            if (
              href &&
              (href.includes("/dp/") || href.includes("/product/") || href.includes("/gp/"))
            ) {
              url = href
              break
            }
          }
        }
      }

      // Make URL absolute if it's relative
      if (url !== "N/A" && url.startsWith("/")) {
        url = `${window.location.origin}${url}`
      }

      // Clean the URL if it's not N/A
      if (url !== "N/A") {
        url = UrlService.cleanUrl(url)
      }
    }

    return { name, url }
  }
}

/**
 * Amazon Price Extractor
 */
export class AmazonPriceExtractor extends BaseExtractor {
  extract(element) {
    // Strategy 1: Look for the specific price element with a-offscreen class
    const priceOffscreen = element.querySelector(".a-price .a-offscreen")
    if (priceOffscreen) {
      const price = priceOffscreen.textContent.trim()
      if (price.match(/\$\d+\.\d+/)) {
        return { price }
      }
    }

    // Strategy 2: Look for price whole and fraction parts separately
    const wholePart = element.querySelector(".a-price-whole")
    const fractionPart = element.querySelector(".a-price-fraction")
    if (wholePart && fractionPart) {
      const whole = wholePart.textContent.trim().replace(/[^\d]/g, "")
      const fraction = fractionPart.textContent.trim().replace(/[^\d]/g, "")
      return { price: `$${whole}.${fraction}` }
    }

    // Strategy 3: Look for a-color-price class
    const colorPrice = element.querySelector(".a-color-price")
    if (colorPrice) {
      const priceText = colorPrice.textContent.trim()
      const priceMatch = priceText.match(/\$(\d+\.\d+)/)
      if (priceMatch) {
        return { price: `$${priceMatch[1]}` }
      }
    }

    // Strategy 4: Look for sponsored text
    const sponsoredElement = element.querySelector(".a-color-secondary:not(.a-size-base)")
    if (sponsoredElement && sponsoredElement.textContent.includes("Sponsored")) {
      return { price: "Sponsored" }
    }

    // Strategy 5: If we can't find a price, check if there's a price link that we can use
    const dealPrice = element.querySelector(".a-link-normal .a-color-base")
    if (dealPrice) {
      const priceText = dealPrice.textContent.trim()
      const priceMatch = priceText.match(/\$(\d+\.\d+)/)
      if (priceMatch) {
        return { price: `$${priceMatch[1]}` }
      }
    }

    // If we couldn't extract a valid price with any strategy, return N/A
    return { price: "N/A" }
  }
}

/**
 * Amazon Ratings Extractor
 */
export class AmazonRatingsExtractor extends BaseExtractor {
  extract(element) {
    const ratingsElement = element.querySelector(this.config.selectors.productRatings)
    let ratings = "N/A"
    let reviewCount = "N/A"

    if (ratingsElement) {
      // Get ratings text (e.g., "4.4 out of 5 stars")
      const ratingText =
        ratingsElement.getAttribute("aria-label") || ratingsElement.textContent.trim()
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s+out\s+of\s+(\d+)/i)
      if (ratingMatch) {
        ratings = ratingMatch[1]
      }

      // Try to find review count
      const reviewElement = element.querySelector(this.config.selectors.reviewCount)
      if (reviewElement) {
        reviewCount = reviewElement.textContent.trim().replace(/[(),]/g, "")
      }
    }

    return { ratings, reviewCount }
  }
}

/**
 * Amazon Size/Variant Extractor
 */
export class AmazonVariantExtractor extends BaseExtractor {
  extract(element) {
    const variantElements = element.querySelectorAll(this.config.selectors.productVariant)
    const variants = []

    variantElements.forEach((variantEl) => {
      variants.push(variantEl.textContent.trim())
    })

    return {
      variants: variants.length > 0 ? variants : ["N/A"],
      size: variants.length > 0 ? variants.join(", ") : "N/A",
    }
  }
}

/**
 * Amazon Image URL Extractor
 */
export class AmazonImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    let imageUrl = "N/A"

    if (imageElement) {
      // Try to get the src attribute first, fallback to data-src if available
      imageUrl = imageElement.getAttribute("src") || imageElement.getAttribute("data-src") || "N/A"

      // Some Amazon images use srcset for different resolutions
      if (imageUrl === "N/A" && imageElement.hasAttribute("srcset")) {
        const srcset = imageElement.getAttribute("srcset")
        const firstImageMatch = srcset.split(",")[0].trim().split(" ")[0]
        if (firstImageMatch) {
          imageUrl = firstImageMatch
        }
      }
    }

    return { imageUrl }
  }
}
