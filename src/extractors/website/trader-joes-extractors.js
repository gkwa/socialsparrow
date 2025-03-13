import { BaseExtractor } from "../base-extractor.js"

/**
 * Trader Joe's Name Extractor
 */
export class TraderJoesNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(this.config.selectors.productName)
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get URL from the anchor tag
      const linkElement = nameElement.tagName === "A" ? nameElement : nameElement.closest("a")

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
 * Trader Joe's Price Extractor
 */
export class TraderJoesPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector(this.config.selectors.productPrice)
    let price = "N/A"

    if (priceElement) {
      price = priceElement.textContent.trim()
    }

    return { price }
  }
}

/**
 * Trader Joe's Unit Price Extractor
 */
export class TraderJoesUnitPriceExtractor extends BaseExtractor {
  extract(element) {
    const unitElement = element.querySelector(this.config.selectors.productUnit)
    let pricePerUnit = "N/A"

    if (unitElement) {
      pricePerUnit = unitElement.textContent.trim()
    }

    return { pricePerUnit }
  }
}

/**
 * Trader Joe's Category Extractor
 */
export class TraderJoesCategoryExtractor extends BaseExtractor {
  extract(element) {
    const categoryElement = element.querySelector(this.config.selectors.productCategory)
    let category = "N/A"
    let categoryUrl = "N/A"

    if (categoryElement) {
      category = categoryElement.textContent.trim()

      // Get category URL
      const linkElement =
        categoryElement.tagName === "A" ? categoryElement : categoryElement.closest("a")

      categoryUrl = linkElement ? linkElement.getAttribute("href") : "N/A"

      // Make URL absolute if it's relative
      if (categoryUrl !== "N/A" && categoryUrl.startsWith("/")) {
        categoryUrl = `${window.location.origin}${categoryUrl}`
      }
    }

    return { category, categoryUrl }
  }
}

/**
 * Trader Joe's Image Extractor
 */
export class TraderJoesImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector(this.config.selectors.productImage)
    let imageUrl = "N/A"

    if (imageElement) {
      // Try to get the src attribute, else try srcoriginal or other image attributes
      imageUrl =
        imageElement.getAttribute("src") || imageElement.getAttribute("srcoriginal") || "N/A"

      // Check for srcset if available
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
