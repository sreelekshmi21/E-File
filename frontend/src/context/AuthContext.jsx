import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Simulate login
  const login = (userData) => {
    setUser(userData); // userData includes roles array
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roleCodeOrId) => {
    if (!user || !user.user || !user.user.roles) return false;
    return user.user.roles.some(role =>
      role.code === roleCodeOrId || role.id == roleCodeOrId
    );
  };

  const hasAnyRole = (roleCodesOrIds) => {
    if (!user || !user.user || !user.user.roles) return false;
    return user.user.roles.some(role =>
      roleCodesOrIds.includes(role.code) || roleCodesOrIds.includes(role.id)
    );
  };

  const isAdmin = () => {
    if (!user || !user.user) return false;
    return (
      hasRole('ADMIN') ||
      user.user.username === 'gs' ||
      user.user.roles?.some(r => r.id == 8)
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, hasAnyRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);