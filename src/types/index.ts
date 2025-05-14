export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface POI {
  id: string;
  encryptedLat: string;
  encryptedLng: string;
  name: string; // This could be encrypted too
  description?: string; // Optional encrypted description
  category?: string; // Optional category
  timestamp: string; // When the POI was added
}

export interface SearchQuery {
  encryptedLat: string;
  encryptedLng: string;
  encryptedRadius?: string; // For range queries
  encryptedBounds?: {
    encryptedNE: { lat: string; lng: string };
    encryptedSW: { lat: string; lng: string };
  }; // For bounding box queries
}

export interface SearchResult {
  id: string;
  encryptedLat: string;
  encryptedLng: string;
  name: string;
  distance?: number; // Only available after client-side decryption
  description?: string;
  category?: string;
  // Optional decrypted coordinates for display
  lat?: number;
  lng?: number;
}

export type Coordinates = {
  lat: number;
  lng: number;
};

// Encryption key types
export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export type UserRole = 'admin' | 'user';