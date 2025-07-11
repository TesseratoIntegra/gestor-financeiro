import api from './api';

class AuthService {
  // Login do usuário
  async login(credentials) {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh, user } = response.data;
      
      // Armazena tokens no localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, tokens: { access, refresh } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao fazer login' 
      };
    }
  }

  // Registro de novo usuário
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      const { user, tokens } = response.data;
      
      // Armazena tokens no localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, tokens };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar conta' 
      };
    }
  }

  // Logout do usuário
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remove dados do localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Verifica se o usuário está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Obtém dados do usuário atual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obtém perfil do usuário
  async getProfile() {
    try {
      const response = await api.get('/auth/profile/');
      return { success: true, user: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar perfil' 
      };
    }
  }

  // Atualiza perfil do usuário
  async updateProfile(userData) {
    try {
      const response = await api.patch('/auth/profile/update/', userData);
      const updatedUser = response.data.user;
      
      // Atualiza dados no localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar perfil' 
      };
    }
  }

  // Altera senha do usuário
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao alterar senha' 
      };
    }
  }

  // Solicita reset de senha
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/password-reset/', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.email?.[0] || 'Erro ao solicitar reset de senha' 
      };
    }
  }

  // Confirma reset de senha
  async confirmPasswordReset(uid, token, passwordData) {
    try {
      const response = await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao resetar senha' 
      };
    }
  }
}

export default new AuthService();

