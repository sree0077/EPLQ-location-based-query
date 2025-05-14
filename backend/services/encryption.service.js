const CryptoJS = require('crypto-js');

// Use the same key as the frontend
const ENCRYPTION_KEY = 'your-private-key'; // In production, this should be securely managed

class EncryptionService {
  constructor() {
    this.privateKey = ENCRYPTION_KEY;
  }

  /**
   * Decrypt coordinates
   * @param {string} encryptedLat Encrypted latitude
   * @param {string} encryptedLng Encrypted longitude
   * @returns {Object} Decrypted coordinates { lat, lng }
   */
  decryptCoordinates(encryptedLat, encryptedLng) {
    try {
      // Use the same encryption key as the frontend
      const latStr = CryptoJS.AES.decrypt(encryptedLat, this.privateKey).toString(
        CryptoJS.enc.Utf8
      );
      const lngStr = CryptoJS.AES.decrypt(encryptedLng, this.privateKey).toString(
        CryptoJS.enc.Utf8
      );

      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates after decryption');
      }

      return { lat, lng };
    } catch (error) {
      console.error('Error decrypting coordinates:', error);
      throw new Error('Failed to decrypt coordinates');
    }
  }

  /**
   * Decrypt a radius value
   * @param {string} encryptedRadius Encrypted radius value
   * @returns {number} Decrypted radius in meters
   */
  decryptRadius(encryptedRadius) {
    try {
      // Use the same encryption key as the frontend
      const radiusStr = CryptoJS.AES.decrypt(encryptedRadius, this.privateKey).toString(
        CryptoJS.enc.Utf8
      );

      const radius = parseFloat(radiusStr);
      if (isNaN(radius) || radius <= 0) {
        throw new Error('Invalid radius after decryption');
      }

      return radius;
    } catch (error) {
      console.error('Error decrypting radius:', error);
      throw new Error('Failed to decrypt radius');
    }
  }
}

module.exports = new EncryptionService(); 