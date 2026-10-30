import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getCurrentUserApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('savesphere_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('savesphere_token');
      if (storedToken) {
        try {
          const res = await getCurrentUserApi();
          setUser(res.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email, password });
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('savesphere_token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const res = await registerApi({ fullName, email, password });
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('savesphere_token', jwtToken);
      setUser(userData);
      setToken(jwtToken);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('savesphere_token');
    setUser(null);
    setToken(null);
  };

  const updateUserSession = (userData, jwtToken) => {
    if (jwtToken) {
      localStorage.setItem('savesphere_token', jwtToken);
      setToken(jwtToken);
    }
    if (userData) {
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
