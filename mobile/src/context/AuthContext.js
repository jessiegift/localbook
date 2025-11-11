import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Auth context for LocalBook mobile app.
 * Improvements vs the original:
 * - createContext(null) so useAuth can detect missing provider
 * - loading toggles around login/register actions
 * - safe JSON parsing for responses with empty bodies
 * - small helper authFetch that attaches token automatically
 * - clear, consistent AsyncStorage keys
 */

const STORAGE_USER_KEY = '@localbook_user';
const STORAGE_TOKEN_KEY = '@localbook_token';

// Use your actual backend IP reachable from device/emulator
export const API_BASE_URL = 'http://192.168.1.15:8080/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_USER_KEY),
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
        ]);
        if (mounted) {
          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedToken) setToken(storedToken);
        }
      } catch (e) {
        console.warn('Auth restore failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper to safely parse JSON (handles empty responses)
  const safeParseJson = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      // Not JSON
      return text;
    }
  };

  // Helper for authenticated fetches
  const authFetch = async (path, options = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const init = { ...options, headers };

    const res = await fetch(url, init);
    const data = await safeParseJson(res);
    if (!res.ok) {
      const message = data?.message || data || res.statusText || 'Request failed';
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  const persistAuth = async (userObj, tokenStr) => {
    try {
      if (userObj) await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
      if (tokenStr) await AsyncStorage.setItem(STORAGE_TOKEN_KEY, tokenStr);
    } catch (e) {
      console.warn('Failed to persist auth', e);
    }
  };

  const clearPersistedAuth = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_USER_KEY);
      await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    } catch (e) {
      console.warn('Failed to clear persisted auth', e);
    }
  };

  const login = async function(email, password) {
  setLoading(true);
  try {
    const loginUrl = API_BASE_URL + '/users/login';
    console.log('🔵 Login:', loginUrl);
    
    const requestBody = JSON.stringify({ email: email, password: password });
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    };
    
    const response = await fetch(loginUrl, requestOptions);
    const data = await safeParseJson(response);
    
    const isResponseOk = response.ok;
    if (isResponseOk === false) {
      let message = 'Login failed';
      const hasDataMessage = data !== null && data !== undefined && data.message !== null && data.message !== undefined;
      if (hasDataMessage === true) {
        message = data.message;
      } else if (data !== null && data !== undefined) {
        message = data;
      }
      
      console.log('❌ Login failed:', message);
      const result = { success: false, error: message };
      return result;
    }

    console.log('📦 Full login response:', JSON.stringify(data, null, 2));

    let receivedUser = data;
    const hasUserProperty = data.user !== null && data.user !== undefined;
    if (hasUserProperty === true) {
      receivedUser = data.user;
    }
    
    console.log('👤 User object:', JSON.stringify(receivedUser, null, 2));
    console.log('🏢 Business ID from user:', receivedUser.businessId);

    let receivedToken = null;
    const hasToken = data.token !== null && data.token !== undefined;
    const hasAccessToken = data.accessToken !== null && data.accessToken !== undefined;
    
    if (hasToken === true) {
      receivedToken = data.token;
    } else if (hasAccessToken === true) {
      receivedToken = data.accessToken;
    }

    setUser(receivedUser);
    
    const hasReceivedToken = receivedToken !== null && receivedToken !== undefined;
    if (hasReceivedToken === true) {
      setToken(receivedToken);
    }

    await persistAuth(receivedUser, receivedToken);

    console.log('✅ Login successful');
    const result = { success: true, user: receivedUser, token: receivedToken };
    return result;
  } catch (error) {
    const errorMessage = error.message;
    let finalErrorMessage = 'Network error';
    const hasErrorMessage = errorMessage !== null && errorMessage !== undefined;
    if (hasErrorMessage === true) {
      finalErrorMessage = errorMessage;
    }
    
    console.error('❌ Login error:', error);
    const result = { success: false, error: finalErrorMessage };
    return result;
  } finally {
    setLoading(false);
  }
};

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      console.log('🔵 Register:', `${API_BASE_URL}/users/register`);
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await safeParseJson(response);
      if (!response.ok) {
        const message = data?.message || data || 'Registration failed';
        console.log('❌ Registration failed:', message);
        return { success: false, error: message };
      }

      const receivedUser = data.user || data;
      const receivedToken = data.token || data.accessToken || null;

      setUser(receivedUser);
      if (receivedToken) setToken(receivedToken);

      await persistAuth(receivedUser, receivedToken);

      console.log('✅ Registration successful');
      return { success: true, user: receivedUser, token: receivedToken };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await clearPersistedAuth();
    console.log('✅ Logout successful');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        authFetch, // useful for callers to make authenticated requests
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};