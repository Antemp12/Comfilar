'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  type: 'cliente' | 'funcionario' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (name: string, email: string, password: string, type: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar token e user do localStorage ao iniciar
  useEffect(() => {
    const validateSession = async () => {
      // Usar sessionStorage para detectar novo reload
      // sessionStorage é sempre limpo quando a aba é fechada
      const SESSION_KEY = '__authSessionId__';
      const currentSessionId = sessionStorage.getItem(SESSION_KEY);
      const newSessionId = `${Date.now()}-${Math.random()}`;
      
      // Se não há sessionId ou é diferente, é um novo load (restart/reload)
      if (!currentSessionId) {
        console.log('[Auth] New session detected - this is a restart');
        sessionStorage.setItem(SESSION_KEY, newSessionId);
        
        // Se há token guardado, significa que houve restart
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          console.log('[Auth] Clearing session from previous restart');
          // Limpar localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          
          // Limpar cookies específicos
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          document.cookie = 'auth.session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          document.cookie = 'auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          
          // Chamar logout endpoint
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (e) {
            console.error('[Auth] Logout request failed:', e);
          }
          
          setLoading(false);
          return;
        }
      }

      // Carregar session do localStorage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        let parsedUser: User | null = null;
        try {
          parsedUser = JSON.parse(storedUser) as User;
        } catch (error) {
          console.error('Erro ao ler utilizador guardado:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setLoading(false);
          return;
        }
        try {
          // Validar o token com o servidor
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.user || parsedUser);
          } else {
            // Token inválido, limpar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
        } catch (error) {
          console.error('Erro ao validar sessão:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // garante que o cookie auth_token é gravado
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no login');
      }

      const data = await response.json();

      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        return data.user; // Return user for redirect logic
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    type: string,
  ) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, type }),
        credentials: 'include', // grava cookie devolvido no registo auto-login
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no registro');
      }

      const data = await response.json();

      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        return data.user; // Return user for redirect logic
      }
    } catch (error) {
      console.error('Erro ao registar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar API de logout para invalidar o token no servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar estado local independentemente do resultado
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
