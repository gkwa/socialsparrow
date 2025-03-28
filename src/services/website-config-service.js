import { lamsSeafoodConfig } from "../config/websites/lams-seafood-config.js"

/**
 * Service for handling website configuration
 */
export class WebsiteConfigService {
  /**
   * Get configuration for a specific website
   * @param {string} url - URL of the website
   * @return {Object|null} Website configuration or null if not supported
   */
  static getConfig(url) {
    if (!url) return null
    
    try {
      const hostname = new URL(url).hostname
      
      if (hostname.includes("lamsseafood.com")) {
        return lamsSeafoodConfig
      }
      
      return null
    } catch (error) {
      console.error("Error determining website config:", error)
      return null
    }
  }
}

