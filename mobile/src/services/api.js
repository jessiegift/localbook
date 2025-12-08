import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get API URL from app.config.js with fallback to production URL
let BASE_URL;
if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra. apiUrl) {
  BASE_URL = Constants.expoConfig. extra.apiUrl;
} else {
  BASE_URL = 'http://23.22.22.249:8080/api';
}

export { BASE_URL };

// Log configuration for debugging
let environment;
if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.environment) {
  environment = Constants.expoConfig.extra. environment;
} else {
  environment = 'unknown';
}

console.log('Environment:', environment);
console.log('API Base URL:', BASE_URL);

// Create axios instance with configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add JWT token to all requests
api.interceptors. request.use(
  async function(config) {
    const method = config.method ?  config.method.toUpperCase() : 'UNKNOWN';
    console.log('API Request:', method, config.url);
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  function(error) {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  function(response) {
    console.log('API Response:', response.status, response. config.url);
    return response;
  },
  async function(error) {
    if (error.response) {
      console.error('API Error:', error. response.status, error.response. data);
    } else if (error.request) {
      console.error('Network Error:', error. message);
    } else {
      console.error('Error:', error.message);
    }

    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      await AsyncStorage. removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('Session expired, user logged out');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  login: async function(credentials) {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },
  
  register: async function(userData) {
    const response = await api.post('/users/register/client', userData);
    return response;
  },
  
  registerBusinessOwner: async function(userData) {
    const response = await api.post('/users/register/business-owner', userData);
    return response;
  },
  
  logout: async function() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
  
  getCurrentUser: async function() {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        return JSON.parse(userString);
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  
  isAuthenticated: async function() {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      return true;
    } else {
      return false;
    }
  }
};

// Business API functions
export const businessAPI = {
  getAll: function() {
    return api.get('/businesses');
  },
  
  getApproved: function() {
    return api.get('/businesses/approved');
  },
  
  getById: function(id) {
    return api.get('/businesses/' + id);
  },
  
  register: function(businessData, ownerId) {
    return api.post('/businesses/register? ownerId=' + ownerId, businessData);
  },
  
  approve: function(id) {
    return api.put('/businesses/' + id + '/approve');
  },
  
  update: function(id, businessData) {
    return api.put('/businesses/' + id, businessData);
  },
  
  delete: function(id) {
    return api.delete('/businesses/' + id);
  }
};

export default api;