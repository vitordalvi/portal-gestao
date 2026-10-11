import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loginAs: (user: User) => void;
  logout: () => void;
  isAnalyst: boolean;
  isCoordinator: boolean;
  isDirector: boolean;
}

// Usuários mockados principais para teste rápido de persona
export const MOCK_USERS: User[] = [
  {
    id: 'bbbbbbbb-3333-3333-3333-333333333333',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@empresa.com',
    role: 2 // Analyst
  },
  {
    id: 'bbbbbbbb-2222-2222-2222-222222222222',
    name: 'Mariana Costa',
    email: 'mariana.costa@empresa.com',
    role: 1 // ProjectManager (Coordenadora)
  },
  {
    id: 'bbbbbbbb-1111-1111-1111-111111111111',
    name: 'Carlos Silva',
    email: 'carlos.silva@empresa.com',
    role: 0 // Director
  },
  {
    id: 'bbbbbbbb-4444-4444-4444-444444444444',
    name: 'Beatriz Ferreira',
    email: 'beatriz.ferreira@empresa.com',
    role: 2 // Analyst
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('portal_gestao_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const loginAs = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('portal_gestao_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portal_gestao_user');
  };

  const isAnalyst = currentUser?.role === 2;
  const isCoordinator = currentUser?.role === 1;
  const isDirector = currentUser?.role === 0;

  return (
    <AuthContext.Provider value={{ currentUser, loginAs, logout, isAnalyst, isCoordinator, isDirector }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
