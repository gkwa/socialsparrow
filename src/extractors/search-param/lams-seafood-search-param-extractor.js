import { BaseSearchParamExtractor } from "./base-search-param-extractor.js"

/**
 * Lam's Seafood specific search parameter extractor
 */
export class LamsSeafoodSearchParamExtractor extends BaseSearchParamExtractor {
  /**
   * Extract search parameter from Lam's Seafood URL
   * @param {string} url - URL to extract from
   * @return {string|null} Extracted search term or null if not found
   */
  extractSearchTerm(url) {
    try {
      if (!url) return null

      const urlObj = new URL(url)

      // Lam's Seafood uses filter[text] which requires special handling
      const searchParamString = urlObj.search
      const regex = new RegExp(`filter\\[text\\]=([^&]+)`)
      const match = searchParamString.match(regex)

      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }

      return null
    } catch (error) {
      console.error("Error extracting Lam's Seafood search term:", error)
      return null
    }
  }
}
