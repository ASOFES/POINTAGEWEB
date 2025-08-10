import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://timesheetapp.azurewebsites.net/api';

export class ApiService {
  static async setAuthToken(token) {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  static async getAuthToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  static async removeAuthToken() {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  static async setUserData(userData) {
    try {
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  static async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  static async removeUserData() {
    try {
      await SecureStore.deleteItemAsync('userData');
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  static async makeRequest(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making ${finalOptions.method} request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
      
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(email, password) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token && data.user) {
      await this.setAuthToken(data.token);
      await this.setUserData(data.user);
    }

    return data;
  }

  static async logout() {
    await this.removeAuthToken();
    await this.removeUserData();
  }

  // Timesheet endpoints
  static async createTimesheet(timesheetData) {
    return await this.makeRequest('/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheetData),
    });
  }

  static async getUserTimesheets(userId) {
    return await this.makeRequest(`/timesheets/user/${userId}`);
  }

  // Utility method to check if user is authenticated
  static async isAuthenticated() {
    const token = await this.getAuthToken();
    const userData = await this.getUserData();
    return !!(token && userData);
  }
}
