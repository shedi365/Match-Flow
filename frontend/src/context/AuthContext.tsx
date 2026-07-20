import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  loginUser: (token: string) => void;
  logoutUser: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  gamertag: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [gamertag, setGamertag] = useState<string | null>(null);

  const processToken = (jwtToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(jwtToken);
      setIsAdmin(decoded.role === 'ADMIN');
      setGamertag(decoded.sub);
    } catch (e) {
      console.error('Token inválido', e);
      setIsAdmin(false);
      setGamertag(null);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('matchflow_token');
    if (storedToken) {
      setToken(storedToken);
      processToken(storedToken);
    }
  }, []);

  const loginUser = (newToken: string) => {
    localStorage.setItem('matchflow_token', newToken);
    setToken(newToken);
    processToken(newToken);
  };

  const logoutUser = () => {
    localStorage.removeItem('matchflow_token');
    setToken(null);
    setIsAdmin(false);
    setGamertag(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      loginUser, 
      logoutUser, 
      isAuthenticated: !!token,
      isAdmin,
      gamertag
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
