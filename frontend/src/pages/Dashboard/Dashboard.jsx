import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import financialService from '../../services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Calendar,
  CreditCard,
  Wallet,
  PieChart,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueExpenses, setOverdueExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsResult, incomesResult, expensesResult, overdueResult] = await Promise.all([
        financialService.getMetrics(),
        financialService.getIncomes({ limit: 5 }),
        financialService.getExpenses({ limit: 5 }),
        financialService.getOverdueExpenses()
      ]);

      if (metricsResult.success) {
        setMetrics(metricsResult.data);
      }

      const transactions = [];
      if (incomesResult.success) {
        transactions.push(...incomesResult.data.map(income => ({ ...income, type: 'income' })));
      }
      if (expensesResult.success) {
        transactions.push(...expensesResult.data.map(expense => ({ ...expense, type: 'expense' })));
      }
      
      // Ordenar por data mais recente
      transactions.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
      setRecentTransactions(transactions.slice(0, 5));

      if (overdueResult.success) {
        setOverdueExpenses(overdueResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCurrentBalance = () => {
    if (!metrics) return 0;
    return (metrics.total_incomes_paid || 0) - (metrics.total_expenses_paid || 0);
  };

  const getMonthlyIncomes = () => {
    if (!metrics) return 0;
    return metrics.monthly_incomes || 0;
  };

  const getMonthlyExpenses = () => {
    if (!metrics) return 0;
    return metrics.monthly_expenses || 0;
  };

  const getPendingCount = () => {
    if (!metrics) return 0;
    return (metrics.pending_incomes_count || 0) + (metrics.pending_expenses_count || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.first_name}! Aqui está um resumo das suas finanças.
        </p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(getCurrentBalance())}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas pagas - Despesas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getMonthlyIncomes())}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.monthly_incomes_count || 0} receita(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getMonthlyExpenses())}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.monthly_expenses_count || 0} despesa(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getPendingCount()}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens não pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de despesas em atraso */}
      {overdueExpenses.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Atenção: {overdueExpenses.length} despesa(s) em atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueExpenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center text-sm">
                  <span className="text-red-700">{expense.description}</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
              {overdueExpenses.length > 3 && (
                <p className="text-red-600 text-sm">... e mais {overdueExpenses.length - 3} despesa(s)</p>
              )}
              <div className="pt-2">
                <Link to="/expenses">
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Ver todas as despesas
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção principal com duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma transação encontrada
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to="/incomes">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Receita
                    </Button>
                  </Link>
                  <Link to="/expenses">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Despesa
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={`${transaction.type}-${transaction.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? 
                          <TrendingUp className="h-4 w-4" /> : 
                          <TrendingDown className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category?.name || 'Sem categoria'} • {formatDate(transaction.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          transaction.paid_date 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.paid_date ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Link to="/incomes" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver receitas
                      </Button>
                    </Link>
                    <Link to="/expenses" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver despesas
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/incomes">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </Link>
              
              <Link to="/expenses">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </Link>
              
              <Link to="/categories">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </Link>
              
              <Link to="/reports">
                <Button className="w-full justify-start" variant="outline">
                  <PieChart className="h-4 w-4 mr-2" />
                  Ver Relatórios
                </Button>
              </Link>
              
              <Link to="/planning">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planejamento
                </Button>
              </Link>
            </div>
            
            {/* Status das funcionalidades */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Status das Funcionalidades</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>✅ Autenticação</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>✅ Receitas & Despesas</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>✅ Categorias</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>🚧 Relatórios</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Em Desenvolvimento</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>🚧 Planejamento</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Em Desenvolvimento</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

