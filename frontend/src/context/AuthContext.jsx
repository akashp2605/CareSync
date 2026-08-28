import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load session from localStorage on start
  useEffect(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (role, data) => {
    const sessionData = { role, ...data };
    setUser(sessionData);
    localStorage.setItem('hms_user', JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
    navigate('/login');
  };

  const isAuthenticated = () => !!user;
  
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, hasRole }}>
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
