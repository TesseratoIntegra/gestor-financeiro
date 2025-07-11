import api from './api';

class FinancialService {
  // ===== CATEGORIAS =====
  
  // Listar todas as categorias
  async getCategories(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/financial/categories/', { params });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar categorias' 
      };
    }
  }

  // Criar nova categoria
  async createCategory(categoryData) {
    try {
      const response = await api.post('/financial/categories/', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar categoria' 
      };
    }
  }

  // Atualizar categoria
  async updateCategory(id, categoryData) {
    try {
      const response = await api.patch(`/financial/categories/${id}/`, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar categoria' 
      };
    }
  }

  // Deletar categoria
  async deleteCategory(id) {
    try {
      await api.delete(`/financial/categories/${id}/`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao deletar categoria' 
      };
    }
  }

  // ===== RECEITAS =====
  
  // Listar receitas
  async getIncomes(filters = {}) {
    try {
      const response = await api.get('/financial/incomes/', { params: filters });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar receitas' 
      };
    }
  }

  // Criar nova receita
  async createIncome(incomeData) {
    try {
      const response = await api.post('/financial/incomes/', incomeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar receita' 
      };
    }
  }

  // Atualizar receita
  async updateIncome(id, incomeData) {
    try {
      const response = await api.patch(`/financial/incomes/${id}/`, incomeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar receita' 
      };
    }
  }

  // Deletar receita
  async deleteIncome(id) {
    try {
      await api.delete(`/financial/incomes/${id}/`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao deletar receita' 
      };
    }
  }

  // Marcar receita como paga
  async markIncomePaid(id, paidDate = null) {
    try {
      const data = paidDate ? { paid_date: paidDate } : {};
      const response = await api.post(`/financial/incomes/${id}/mark_paid/`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao marcar receita como paga' 
      };
    }
  }

  // Marcar receita como pendente
  async markIncomePending(id) {
    try {
      const response = await api.post(`/financial/incomes/${id}/mark_pending/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao marcar receita como pendente' 
      };
    }
  }

  // ===== DESPESAS =====
  
  // Listar despesas
  async getExpenses(filters = {}) {
    try {
      const response = await api.get('/financial/expenses/', { params: filters });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar despesas' 
      };
    }
  }

  // Criar nova despesa
  async createExpense(expenseData) {
    try {
      const response = await api.post('/financial/expenses/', expenseData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar despesa' 
      };
    }
  }

  // Atualizar despesa
  async updateExpense(id, expenseData) {
    try {
      const response = await api.patch(`/financial/expenses/${id}/`, expenseData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar despesa' 
      };
    }
  }

  // Deletar despesa
  async deleteExpense(id) {
    try {
      await api.delete(`/financial/expenses/${id}/`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao deletar despesa' 
      };
    }
  }

  // Marcar despesa como paga
  async markExpensePaid(id, paidDate = null) {
    try {
      const data = paidDate ? { paid_date: paidDate } : {};
      const response = await api.post(`/financial/expenses/${id}/mark_paid/`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao marcar despesa como paga' 
      };
    }
  }

  // Marcar despesa como pendente
  async markExpensePending(id) {
    try {
      const response = await api.post(`/financial/expenses/${id}/mark_pending/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao marcar despesa como pendente' 
      };
    }
  }

  // Listar despesas em atraso
  async getOverdueExpenses() {
    try {
      const response = await api.get('/financial/expenses/overdue/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar despesas em atraso' 
      };
    }
  }

  // ===== FLUXO DE CAIXA =====
  
  // Listar fluxo de caixa
  async getCashFlow(filters = {}) {
    try {
      const response = await api.get('/financial/cashflow/', { params: filters });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar fluxo de caixa' 
      };
    }
  }

  // Criar entrada de fluxo de caixa
  async createCashFlow(cashFlowData) {
    try {
      const response = await api.post('/financial/cashflow/', cashFlowData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar entrada de caixa' 
      };
    }
  }

  // ===== MÉTRICAS E RELATÓRIOS =====
  
  // Obter métricas financeiras
  async getMetrics() {
    try {
      const response = await api.get('/financial/metrics/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar métricas' 
      };
    }
  }

  // Obter planejamento futuro
  async getFuturePlanning(months = 4) {
    try {
      const response = await api.get('/financial/planning/', { 
        params: { months } 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao carregar planejamento' 
      };
    }
  }

  // Lançamento rápido
  async quickEntry(entryData) {
    try {
      const response = await api.post('/financial/quick-entry/', entryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao criar lançamento' 
      };
    }
  }
}

export default new FinancialService();

