import { BaseExtractor } from "../base-extractor.js"

/**
 * Lams Seafood Name Extractor
 */
export class LamsSeafoodNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get URL from the anchor tag
      const linkElement = element.querySelector(this.config.selectors.productLink || "a.sc-dEMAZk")
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
 * Lams Seafood Price Extractor
 */
export class LamsSeafoodPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    let price = "N/A"

    if (priceElement) {
      // The price text might contain the unit price, so we need to clean it
      const priceText = priceElement.textContent.trim()
      // Extract just the price part using the pattern
      const priceMatch = priceText.match(this.config.patterns.price)
      if (priceMatch) {
        price = `$${priceMatch[1]}`
      } else {
        price = priceText
      }
    }

    return { price }
  }
}

/**
 * Lams Seafood Unit Price Extractor
 */
export class LamsSeafoodUnitPriceExtractor extends BaseExtractor {
  extract(element) {
    const unitPriceElement = element.querySelector(this.config.selectors.productUnit)
    let pricePerUnit = "N/A"

    if (unitPriceElement) {
      pricePerUnit = unitPriceElement.textContent.trim()
    }

    return { pricePerUnit }
  }
}

/**
 * Lams Seafood Image Extractor
 */
export class LamsSeafoodImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    let imageUrl = "N/A"

    if (imageElement) {
      imageUrl = imageElement.getAttribute("src") || "N/A"
    }

    return { imageUrl }
  }
}
