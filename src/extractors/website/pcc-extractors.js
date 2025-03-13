import { BaseExtractor } from "../base-extractor.js"

/**
 * PCC Markets Name Extractor
 */
export class PCCMarketsNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(".e-147kl2c")
    let name = "N/A"
    let url = "N/A"

    if (nameElement) {
      name = nameElement.textContent.trim()

      // Get URL from the anchor tag
      const linkElement = element.querySelector("a.e-eevw7b")
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
 * PCC Markets Price Extractor
 */
export class PCCMarketsPriceExtractor extends BaseExtractor {
  extract(element) {
    // Find price components
    const dollarElement = element.querySelector(".e-p745l")
    const wholeNumberElement = element.querySelector(".e-1qkvt8e")
    const centsElement = dollarElement?.nextElementSibling?.nextElementSibling

    let price = "N/A"

    if (dollarElement && wholeNumberElement) {
      // Construct price from components (e.g., $9.99)
      const dollar = dollarElement.textContent.trim()
      const wholeNumber = wholeNumberElement.textContent.trim()
      const cents = centsElement ? centsElement.textContent.trim() : "00"

      price = `${dollar}${wholeNumber}.${cents.replace(/[^\d]/g, "")}`
    }

    return { price }
  }
}

/**
 * PCC Markets Unit Price Extractor
 */
export class PCCMarketsUnitPriceExtractor extends BaseExtractor {
  extract(element) {
    const unitElement = element.querySelector(".e-1ezwhur")
    let pricePerUnit = "N/A"

    if (unitElement) {
      // Get the price from previous extraction
      const priceExtractor = new PCCMarketsPriceExtractor(this.config)
      const { price } = priceExtractor.extract(element)

      // Get the unit text (e.g., "/lb")
      const unitText = unitElement.textContent.trim()

      if (price !== "N/A" && unitText) {
        pricePerUnit = `${price} ${unitText}`
      }
    }

    return { pricePerUnit }
  }
}

/**
 * PCC Markets Badge Extractor
 */
export class PCCMarketsBadgeExtractor extends BaseExtractor {
  extract(element) {
    const badgeElement = element.querySelector(".e-ul5tuv")
    let badge = null

    if (badgeElement) {
      badge = badgeElement.textContent.trim()
    }

    return { badge }
  }
}

/**
 * PCC Markets Image Extractor
 */
export class PCCMarketsImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector("img.e-19e3dsf")
    let imageUrl = "N/A"

    if (imageElement) {
      // Try to get srcset or src attribute
      if (imageElement.hasAttribute("srcset")) {
        const srcset = imageElement.getAttribute("srcset")
        // Extract first URL from srcset (highest quality)
        const firstImage = srcset.split(",")[0].trim().split(" ")[0]
        if (firstImage) {
          imageUrl = firstImage
        }
      } else {
        imageUrl = imageElement.getAttribute("src") || "N/A"
      }
    }

    return { imageUrl }
  }
}
