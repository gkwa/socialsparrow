import { ProductDataServiceFactory } from "./product-data-service-factory.js"

/**
 * Initialize the extraction process based on the current website
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRun - Whether to run extraction automatically
 * @param {string} options.targetWebsite - Optional target website restriction
 * @return {Promise<void>}
 */
export async function initExtraction(options = {}) {
  const { autoRun = true, targetWebsite = null } = options

  // Check if we're on a supported website
  const currentUrl = window.location.href
  let shouldRun = true

  // If target website is specified, check if current URL matches
  if (targetWebsite && !currentUrl.includes(targetWebsite)) {
    console.error(`This script is intended for use on ${targetWebsite}. Current URL: ${currentUrl}`)
    shouldRun = false
  }

  console.log("Product extraction script loaded successfully!")

  if (shouldRun && autoRun) {
    console.log("Automatically running extraction...")
    await extractProductsToClipboard()
  } else {
    console.log(
      "To extract product information, call extractProducts() or extractProductsToClipboard()",
    )
  }
}

/**
 * Extract products and return the data without copying to clipboard
 * @param {Object} customConfig - Optional custom configuration
 * @return {Array} Array of product objects
 */
export function extractProducts(customConfig = {}) {
  const service = ProductDataServiceFactory.createDefault(customConfig)
  return service.extractProducts()
}

/**
 * Extract products and copy to clipboard
 * @param {Object} customConfig - Optional custom configuration
 * @return {Promise<Object>} Extracted product data
 */
export async function extractProductsToClipboard(customConfig = {}) {
  const service = ProductDataServiceFactory.createDefault(customConfig)
  return service.extractProductsToClipboard()
}
