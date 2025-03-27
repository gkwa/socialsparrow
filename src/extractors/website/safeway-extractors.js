import { BaseExtractor } from "../base-extractor.js"

/**
 * Safeway Name Extractor
 * Responsible for extracting product name and URL
 */
export class SafewayNameExtractor extends BaseExtractor {
  extract(element) {
    const nameElement = element.querySelector(".pc__tooltip__title__arrow-light")
    let name = "N/A"
    let url = "N/A"

    // If the tooltip title isn't available, try the anchor tag
    if (!nameElement) {
      const anchorElement = element.querySelector("a[data-qa='prd-itm-pttl']")
      if (anchorElement) {
        name = anchorElement.textContent.trim()
        url = anchorElement.getAttribute("href")
      }
    } else {
      // Get the next element which contains the full title
      const titleElement = nameElement.nextElementSibling
      if (titleElement && titleElement.classList.contains("title-xxs")) {
        name = titleElement.textContent.trim()
      }

      // Try to find URL from the anchor
      const anchorElement = element.querySelector("a[data-qa='prd-itm-pttl']")
      if (anchorElement) {
        url = anchorElement.getAttribute("href")
      }
    }

    // Make URL absolute if it's relative
    if (url !== "N/A" && url.startsWith("/")) {
      url = `${window.location.origin}${url}`
    }

    return { name, url }
  }
}

/**
 * Safeway Price Extractor
 * Responsible for extracting product price
 */
export class SafewayPriceExtractor extends BaseExtractor {
  extract(element) {
    const priceElement = element.querySelector("[data-qa='prd-itm-prc']")
    let price = "N/A"

    if (priceElement) {
      // Find the visible price text (not screen reader content)
      const visiblePrice = priceElement.querySelector("[aria-hidden='true']")
      if (visiblePrice) {
        price = visiblePrice.textContent.trim()
      } else {
        // Fallback to the whole price element
        price = priceElement.textContent.trim()
      }
    }

    return { price }
  }
}

/**
 * Safeway Price Per Unit Extractor
 * Responsible for extracting the price per unit
 */
export class SafewayPricePerUnitExtractor extends BaseExtractor {
  extract(element) {
    const unitPriceElement = element.querySelector("[data-qa='prd-itm-pprc-qty']")
    let pricePerUnit = "N/A"

    if (unitPriceElement) {
      const visibleUnit = unitPriceElement.querySelector("[aria-hidden='true']")
      if (visibleUnit) {
        pricePerUnit = visibleUnit.textContent.trim()
      } else {
        pricePerUnit = unitPriceElement.textContent.trim()
      }
    }

    return { pricePerUnit }
  }
}

/**
 * Safeway Image Extractor
 * Responsible for extracting product image URL
 */
export class SafewayImageExtractor extends BaseExtractor {
  extract(element) {
    const imageElement = element.querySelector("[data-qa='prd-itm-img']")
    let imageUrl = "N/A"

    if (imageElement) {
      // Try src attribute first
      imageUrl = imageElement.getAttribute("src") || "N/A"

      // If no src, try data-src
      if (imageUrl === "N/A") {
        imageUrl = imageElement.getAttribute("data-src") || "N/A"
      }
    }

    return { imageUrl }
  }
}

/**
 * Safeway Rating Extractor
 * Responsible for extracting product ratings
 */
export class SafewayRatingExtractor extends BaseExtractor {
  extract(element) {
    const ratingContainer = element.querySelector(".rating-stars")
    let rating = "N/A"
    let reviewCount = "N/A"

    if (ratingContainer) {
      // Find all filled stars to calculate rating
      const filledStars = ratingContainer.querySelectorAll(".svg-star-icon-100-filled")
      const halfStars = ratingContainer.querySelectorAll(".svg-star-icon-50-filled")

      if (filledStars.length > 0 || halfStars.length > 0) {
        const ratingValue = filledStars.length + halfStars.length * 0.5
        rating = ratingValue.toString()
      }

      // Get review count (text after the stars)
      const reviewElement = ratingContainer.querySelector(".body-text-xxs")
      if (reviewElement) {
        reviewCount = reviewElement.textContent.trim()
      }
    }

    return { rating, reviewCount }
  }
}

/**
 * Safeway SNAP Eligibility Extractor
 * Responsible for checking if product is SNAP eligible
 */
export class SafewaySnapEligibilityExtractor extends BaseExtractor {
  extract(element) {
    const snapElement = element.querySelector("[data-qa='prd-itm-snap']")
    let isSnapEligible = false

    if (snapElement && snapElement.textContent.includes("SNAP")) {
      isSnapEligible = true
    }

    return { isSnapEligible }
  }
}

/**
 * Safeway Product ID Extractor
 * Responsible for extracting product ID
 */
export class SafewayProductIdExtractor extends BaseExtractor {
  extract(element) {
    // Look for the data-bpn attribute which appears to contain the product ID
    const idElement = element.querySelector("[data-bpn]")
    let productId = "N/A"

    if (idElement) {
      productId = idElement.getAttribute("data-bpn")
    }

    return { productId }
  }
}
