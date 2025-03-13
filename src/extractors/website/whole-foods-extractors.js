import { BaseExtractor } from "../base-extractor.js"

/**
 * Whole Foods Name Extractor
 */
export class WholeFoodsNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    const brandElement = element.querySelector(this.config.selectors.productBrand)
    let name = "N/A"
    let brand = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get brand if available
      if (brandElement) {
        brand = brandElement.textContent.trim()
      }

      // Get URL from the anchor tag
      const linkElement = element.querySelector(this.config.selectors.productLink)
      url = linkElement ? linkElement.getAttribute("href") : "N/A"

      // Make URL absolute if it's relative
      if (url !== "N/A" && url.startsWith("/")) {
        url = `${window.location.origin}${url}`
      }
    }

    return { name, brand, url }
  }
}

/**
 * Whole Foods Price Extractor
 */
export class WholeFoodsPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    let price = "N/A"

    if (priceElement) {
      price = priceElement.textContent.trim()

      // Extract the numeric price using regex if needed
      const priceMatch = price.match(this.config.patterns.price)
      if (priceMatch) {
        price = `$${priceMatch[1]}`
      }
    }

    return { price }
  }
}

/**
 * Whole Foods Image URL Extractor
 */
export class WholeFoodsImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    let imageUrl = "N/A"

    if (imageElement) {
      // Try to get the src attribute, fallback to data-src if available
      imageUrl = imageElement.getAttribute("src") || imageElement.getAttribute("data-src") || "N/A"
    }

    return { imageUrl }
  }
}

/**
 * Whole Foods Size/Weight Extractor
 */
export class WholeFoodsSizeExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    let size = "N/A"

    if (nameElement) {
      const nameText = nameElement.textContent.trim()
      // Extract size information from the product name (e.g., "6 oz" from "Pitted Kalamata Olives, 6 oz")
      const sizeMatch = nameText.match(/,?\s+(\d+(?:\.\d+)?\s*(?:oz|lb|g|ml|fl oz|kg|ct|pack))\b/i)
      if (sizeMatch) {
        size = sizeMatch[1].trim()
      }
    }

    return { size }
  }
}
