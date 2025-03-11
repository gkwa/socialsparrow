/**
 * Service for clipboard operations
 * Single responsibility: handling clipboard operations
 */
export class ClipboardService {
  /**
   * Copy data to clipboard
   * @param {string} data - The data to copy
   * @return {Promise<boolean>} Success status
   */
  static async copyToClipboard(data) {
    // Try to use the modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(data);
        console.log('Data copied to clipboard using Clipboard API');
        return true;
      } catch (error) {
        console.warn('Clipboard API failed:', error);
        return this.fallbackCopyToClipboard(data);
      }
    } else {
      // Clipboard API not available, use fallback
      return this.fallbackCopyToClipboard(data);
    }
  }
  
  /**
   * Fallback method for copying to clipboard
   * @param {string} data - The data to copy
   * @return {Promise<boolean>} Success status
   */
  static fallbackCopyToClipboard(data) {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = data;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('Data copied to clipboard using execCommand');
          resolve(true);
        } else {
          console.error('execCommand copy failed');
          reject(new Error('Unable to copy to clipboard'));
        }
      } catch (err) {
        console.error('execCommand error:', err);
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }
}

