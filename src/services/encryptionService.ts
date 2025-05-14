import CryptoJS from 'crypto-js';
import { Coordinates, EncryptionKeys } from '../types';

// Use the same key as the backend
const ENCRYPTION_KEY = 'your-private-key'; // In production, this should be securely managed

/**
 * This is a simplified implementation of the encryption service.
 * In a real-world scenario, you would use more complex encryption
 * algorithms specific to predicate-only encryption for 2D spatial data.
 */
class EncryptionService {
  private static instance: EncryptionService;
  private keys: EncryptionKeys;

  private constructor() {
    // Initialize with fixed keys
    this.keys = {
      publicKey: ENCRYPTION_KEY,
      privateKey: ENCRYPTION_KEY
    };
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Get the current keys
   */
  public getKeys(): EncryptionKeys {
    return this.keys;
  }

  /**
   * Encrypt coordinates
   * @param coordinates Location coordinates to encrypt
   * @param publicKey Optional public key override
   * @returns Encrypted coordinates
   */
  public encryptCoordinates(
    coordinates: Coordinates,
    publicKey?: string
  ): { encryptedLat: string; encryptedLng: string } {
    const key = publicKey || this.keys?.publicKey;
    if (!key) {
      throw new Error('No encryption key available');
    }

    // In a real implementation, you would use predicate-only encryption
    // This is just a simplified representation using AES
    const encryptedLat = CryptoJS.AES.encrypt(
      coordinates.lat.toString(),
      key
    ).toString();
    const encryptedLng = CryptoJS.AES.encrypt(
      coordinates.lng.toString(),
      key
    ).toString();

    return { encryptedLat, encryptedLng };
  }

  /**
   * Decrypt coordinates
   * @param encryptedLat Encrypted latitude
   * @param encryptedLng Encrypted longitude
   * @param privateKey Optional private key override
   * @returns Decrypted coordinates
   */
  public decryptCoordinates(
    encryptedLat: string,
    encryptedLng: string,
    privateKey?: string
  ): Coordinates {
    const key = privateKey || this.keys?.privateKey;
    if (!key) {
      throw new Error('No decryption key available');
    }

    // In a real implementation, this would use the corresponding decryption
    // algorithm for your predicate-only encryption scheme
    const latStr = CryptoJS.AES.decrypt(encryptedLat, key).toString(
      CryptoJS.enc.Utf8
    );
    const lngStr = CryptoJS.AES.decrypt(encryptedLng, key).toString(
      CryptoJS.enc.Utf8
    );

    return {
      lat: parseFloat(latStr),
      lng: parseFloat(lngStr),
    };
  }

  /**
   * Encrypt a search query (e.g., a location with a radius)
   * @param query Search query parameters
   * @param publicKey Optional public key override
   * @returns Encrypted query
   */
  public encryptQuery(
    query: { center: Coordinates; radius?: number },
    publicKey?: string
  ): { encryptedLat: string; encryptedLng: string; encryptedRadius?: string } {
    const encryptedCoords = this.encryptCoordinates(query.center, publicKey);
    
    let encryptedRadius: string | undefined;
    if (query.radius !== undefined) {
      const key = publicKey || this.keys?.publicKey;
      if (!key) {
        throw new Error('No encryption key available');
      }
      encryptedRadius = CryptoJS.AES.encrypt(
        query.radius.toString(),
        key
      ).toString();
    }

    return {
      ...encryptedCoords,
      encryptedRadius,
    };
  }

  /**
   * Test if an encrypted POI matches a predicate (e.g., is within a certain radius)
   * In a real implementation, this would be done on the server with predicate-only encryption
   * @param encryptedPOI Encrypted POI
   * @param encryptedQuery Encrypted query
   * @returns Whether the POI matches the predicate
   */
  public testPredicate(
    encryptedPOI: { encryptedLat: string; encryptedLng: string },
    encryptedQuery: { encryptedLat: string; encryptedLng: string; encryptedRadius?: string }
  ): boolean {
    // In a real implementation, this would be a complex homomorphic operation
    // or a predicate-only encryption test that doesn't reveal the actual values
    
    // For simplicity, we're decrypting and testing directly, but this defeats the purpose
    // of predicate encryption in a real system
    const poiCoords = this.decryptCoordinates(
      encryptedPOI.encryptedLat,
      encryptedPOI.encryptedLng
    );
    
    const queryCoords = this.decryptCoordinates(
      encryptedQuery.encryptedLat,
      encryptedQuery.encryptedLng
    );
    
    // Calculate distance between points
    const distance = this.calculateDistance(poiCoords, queryCoords);
    
    // If radius is specified, check if POI is within that radius
    if (encryptedQuery.encryptedRadius) {
      const key = this.keys?.privateKey;
      if (!key) {
        throw new Error('No decryption key available');
      }
      
      const radiusStr = CryptoJS.AES.decrypt(
        encryptedQuery.encryptedRadius,
        key
      ).toString(CryptoJS.enc.Utf8);
      
      const radius = parseFloat(radiusStr);
      return distance <= radius;
    }
    
    // Default to a simple proximity check
    return distance < 10; // Within 10km by default
  }

  /**
   * Calculate the distance between two coordinates using the Haversine formula
   * @param coord1 First coordinates
   * @param coord2 Second coordinates
   * @returns Distance in kilometers
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Decrypt a radius value
   * @param encryptedRadius Encrypted radius value
   * @param privateKey Optional private key override
   * @returns Decrypted radius in meters
   */
  public decryptRadius(encryptedRadius: string, privateKey?: string): number {
    const key = privateKey || this.keys?.privateKey;
    if (!key) {
      throw new Error('No decryption key available');
    }

    const radiusStr = CryptoJS.AES.decrypt(encryptedRadius, key).toString(
      CryptoJS.enc.Utf8
    );

    return parseFloat(radiusStr);
  }
}

export default EncryptionService.getInstance();