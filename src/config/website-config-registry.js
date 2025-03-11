/**
 * Configuration registry for multiple websites
 * Stores configurations for different websites
 */
export class WebsiteConfigRegistry {
  constructor() {
    this.configs = {};
    this.defaultConfig = null;
  }
  
  /**
   * Register a configuration for a specific website
   * @param {string} websiteIdentifier - Website URL or identifier
   * @param {Object} config - Configuration object
   */
  registerConfig(websiteIdentifier, config) {
    this.configs[websiteIdentifier] = config;
    return this;
  }
  
  /**
   * Set the default configuration
   * @param {Object} config - Default configuration object
   */
  setDefaultConfig(config) {
    this.defaultConfig = config;
    return this;
  }
  
  /**
   * Get configuration for the current website
   * @param {string} [currentUrl] - Current URL (defaults to window.location.href)
   * @return {Object} Configuration for the current website or default config
   */
  getConfigForCurrentSite(currentUrl = window.location.href) {
    // Find the first matching website identifier
    const matchingIdentifier = Object.keys(this.configs).find(identifier => 
      currentUrl.includes(identifier)
    );
    
    // Return the matching config or the default
    return matchingIdentifier 
      ? this.configs[matchingIdentifier] 
      : this.defaultConfig;
  }
}

