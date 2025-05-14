import axios from 'axios';
import { User, UserRole } from '../types';

// Set the API base URL - this should be configurable for different environments
const API_URL = 'http://localhost:5000/api';

/**
 * Service for handling authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @param role User's role
   * @returns Promise with the response data
   */
  async register(email: string, password: string, role: UserRole = 'user'): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      role,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  }

  /**
   * Log in an existing user
   * @param email User's email
   * @param password User's password
   * @returns Promise with the response data
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('token');
  }

  /**
   * Get the current user's profile information
   * @returns Promise with the user data
   */
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  }

  /**
   * Check if the user has a specific role
   * @param role Role to check for
   * @returns Promise that resolves to true if the user has the role
   */
  async hasRole(role: UserRole): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the current JWT token
   * @returns The token or null if not logged in
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if the user is logged in
   * @returns True if the user is logged in
   */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();