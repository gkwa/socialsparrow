/**
 * Service for generating UUIDs
 * Single responsibility: generating unique identifiers
 */
export class UuidGenerator {
  /**
   * Generate a UUID v4
   * @return {string} A new UUID v4 string
   */
  static generate() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * Check if a string is a valid UUID
   * @param {string} uuid - The UUID to validate
   * @return {boolean} True if the UUID is valid
   */
  static isValid(uuid) {
    if (!uuid) return false

    // UUID regex pattern
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return pattern.test(uuid)
  }
}
