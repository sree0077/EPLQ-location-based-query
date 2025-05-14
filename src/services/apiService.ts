import axios from 'axios';
import { POI, SearchQuery, SearchResult } from '../types';
import authService from './authService';

// Set the API base URL - this should be configurable for different environments
const API_URL = 'http://localhost:5000/api';

/**
 * Create an axios instance with authentication headers
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Service for handling API calls related to POIs and search
 */
class ApiService {
  /**
   * Get all POIs (admin only)
   * @returns Promise with an array of POIs
   */
  async getAllPOIs(): Promise<POI[]> {
    const response = await apiClient.get('/pois');
    return response.data;
  }

  /**
   * Add a new POI (admin only)
   * @param poi POI data
   * @returns Promise with the added POI
   */
  async addPOI(poi: Omit<POI, 'id' | 'timestamp'>): Promise<POI> {
    const response = await apiClient.post('/pois', poi);
    return response.data;
  }

  /**
   * Update an existing POI (admin only)
   * @param id POI ID
   * @param poi Updated POI data
   * @returns Promise with the updated POI
   */
  async updatePOI(id: string, poi: Partial<Omit<POI, 'id' | 'timestamp'>>): Promise<POI> {
    const response = await apiClient.put(`/pois/${id}`, poi);
    return response.data;
  }

  /**
   * Delete a POI (admin only)
   * @param id POI ID
   * @returns Promise indicating success
   */
  async deletePOI(id: string): Promise<void> {
    await apiClient.delete(`/pois/${id}`);
  }

  /**
   * Upload multiple POIs in bulk (admin only)
   * @param pois Array of POI data
   * @returns Promise with the added POIs
   */
  async bulkAddPOIs(pois: Array<Omit<POI, 'id' | 'timestamp'>>): Promise<POI[]> {
    const response = await apiClient.post('/pois/bulk', { pois });
    return response.data;
  }

  /**
   * Search for POIs based on encrypted query
   * @param query Encrypted search parameters
   * @returns Promise with search results
   */
  async searchPOIs(query: SearchQuery): Promise<SearchResult[]> {
    const response = await apiClient.post('/search', query);
    return response.data;
  }

  /**
   * Get search history for the current user
   * @returns Promise with search history
   */
  async getSearchHistory(): Promise<{ query: SearchQuery; timestamp: string }[]> {
    const response = await apiClient.get('/search/history');
    return response.data;
  }
}

export default new ApiService();