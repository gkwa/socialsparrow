import { BaseExtractor } from "../base-extractor.js"

/**
 * Walmart Name Extractor
 */
export class WalmartNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get URL from the link element
      const linkElement = element.querySelector(this.config.selectors.productLink)
      if (linkElement) {
        url = linkElement.getAttribute("href")

        // Make URL absolute if it's relative
        if (url !== "N/A" && url.startsWith("/")) {
          url = `${window.location.origin}${url}`
        }
      }
    }

    return { name, url }
  }
}

/**
 * Walmart Price Extractor
 */
export class WalmartPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    let price = "N/A"

    if (priceElement) {
      const wholePrice = priceElement.querySelector(this.config.selectors.priceDollars)
      const centsPrice = priceElement.querySelector(this.config.selectors.priceCents)

      if (wholePrice && centsPrice) {
        const dollars = wholePrice.textContent.trim().replace(/^\$/, "")
        const cents = centsPrice.textContent.trim()
        price = `$${dollars}.${cents}`
      } else {
        // Fallback to trying to find the price in text content
        const priceText = priceElement.textContent.trim()
        const priceMatch = priceText.match(this.config.patterns.price)
        if (priceMatch) {
          price = `$${priceMatch[1]}`
        }
      }
    }

    return { price }
  }
}

/**
 * Walmart Original Price Extractor
 */
export class WalmartOriginalPriceExtractor extends BaseExtractor {
  extract(element) {
    const originalPriceElement = element.querySelector(this.config.selectors.productOriginalPrice)
    let originalPrice = null

    if (originalPriceElement) {
      originalPrice = originalPriceElement.textContent.trim()
    }

    return { originalPrice }
  }
}

/**
 * Walmart Shipping Info Extractor
 */
export class WalmartShippingExtractor extends BaseExtractor {
  extract(element) {
    const shippingElement = element.querySelector(this.config.selectors.productShipping)
    let shipping = "N/A"

    if (shippingElement) {
      shipping = shippingElement.textContent.trim()
    }

    return { shipping }
  }
}

/**
 * Walmart Image URL Extractor
 */
export class WalmartImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    let imageUrl = "N/A"

    if (imageElement) {
      imageUrl = imageElement.getAttribute("src") || "N/A"
    }

    return { imageUrl }
  }
}

/**
 * Walmart Sponsored Status Extractor
 */
export class WalmartSponsoredExtractor extends BaseExtractor {
  extract(element) {
    const sponsoredElement = element.querySelector(this.config.selectors.productSponsored)
    let isSponsored = false

    if (sponsoredElement && sponsoredElement.textContent.includes("Sponsored")) {
      isSponsored = true
    }

    return { isSponsored }
  }
}
