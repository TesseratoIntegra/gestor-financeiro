import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Verifica se o token ainda é válido
            const profileResult = await authService.getProfile();
            if (profileResult.success) {
              setUser(profileResult.user);
            } else {
              // Token inválido, faz logout
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao criar conta' };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  // Função para alterar senha
  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao alterar senha' };
    }
  };

  // Função para solicitar reset de senha
  const requestPasswordReset = async (email) => {
    try {
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao solicitar reset de senha' };
    }
  };

  // Função para confirmar reset de senha
  const confirmPasswordReset = async (uid, token, passwordData) => {
    try {
      const result = await authService.confirmPasswordReset(uid, token, passwordData);
      return result;
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao resetar senha' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

