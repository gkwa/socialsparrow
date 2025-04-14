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
      const linkElement = element.querySelector(this.config.selectors.productLink || "a.sc-iugpza")
      if (linkElement) {
        url = linkElement.getAttribute("href") || "N/A"
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
    const unitPriceElements = element.querySelectorAll(this.config.selectors.productUnit)
    let pricePerUnit = "N/A"

    if (unitPriceElements && unitPriceElements.length > 0) {
      // Use the first unit element (for per each/lb/etc)
      for (const unitElement of unitPriceElements) {
        const unitText = unitElement.textContent.trim()
        if (unitText.includes("/")) {
          pricePerUnit = unitText.trim()
          break
        }
      }

      // If we didn't find a unit with "/", use the first unit text
      if (pricePerUnit === "N/A" && unitPriceElements.length > 0) {
        pricePerUnit = unitPriceElements[0].textContent.trim()
      }
    }

    return { pricePerUnit }
  }
}

/**
 * Lams Seafood Size Extractor
 */
export class LamsSeafoodSizeExtractor extends BaseExtractor {
  extract(element) {
    const unitElements = element.querySelectorAll(this.config.selectors.productUnit)
    let size = "N/A"

    if (unitElements && unitElements.length > 0) {
      // Look for size information (usually contains oz, lb, etc.)
      for (const unitElement of unitElements) {
        const text = unitElement.textContent.trim()
        if (text.includes("oz") || text.includes("lb") || text.includes("g")) {
          size = text.trim()
          break
        }
      }
    }

    return { size }
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
