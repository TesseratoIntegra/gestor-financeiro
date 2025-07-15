import React, { useState, useEffect, useCallback } from 'react';
import financialService from '../../services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';

const CashFlow = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    type: ''
  });

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    setFilters({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      type: ''
    });
  }, []);

  useEffect(() => {
    if (filters.start_date && filters.end_date) {
      loadCashFlow();
    }
  }, [filters, loadCashFlow]);

  const loadCashFlow = useCallback(async () => {
    setLoading(true);
    try {
      const [incomesResult, expensesResult] = await Promise.all([
        financialService.getIncomes({
          start_date: filters.start_date,
          end_date: filters.end_date
        }),
        financialService.getExpenses({
          start_date: filters.start_date,
          end_date: filters.end_date
        })
      ]);

      const allTransactions = [];
      
      if (incomesResult.success) {
        allTransactions.push(...incomesResult.data.map(income => ({
          ...income,
          type: 'INCOME',
          type_label: 'Receita',
          color: 'text-green-600',
          icon: TrendingUp
        })));
      }
      
      if (expensesResult.success) {
        allTransactions.push(...expensesResult.data.map(expense => ({
          ...expense,
          type: 'EXPENSE',
          type_label: 'Despesa',
          color: 'text-red-600',
          icon: TrendingDown
        })));
      }

      // Ordenar por data
      allTransactions.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      
      // Filtrar por tipo se selecionado
      const filteredTransactions = filters.type 
        ? allTransactions.filter(t => t.type === filters.type)
        : allTransactions;
      
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.start_date, filters.end_date, filters.type]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateRunningBalance = () => {
    let balance = 0;
    return transactions.map(transaction => {
      if (transaction.paid_date) {
        if (transaction.type === 'INCOME') {
          balance += parseFloat(transaction.amount);
        } else {
          balance -= parseFloat(transaction.amount);
        }
      }
      return { ...transaction, running_balance: balance };
    });
  };

  const getTotals = () => {
    const totalIncomes = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const paidIncomes = transactions
      .filter(t => t.type === 'INCOME' && t.paid_date)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const paidExpenses = transactions
      .filter(t => t.type === 'EXPENSE' && t.paid_date)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalIncomes,
      totalExpenses,
      paidIncomes,
      paidExpenses,
      netFlow: totalIncomes - totalExpenses,
      currentBalance: paidIncomes - paidExpenses
    };
  };

  const transactionsWithBalance = calculateRunningBalance();
  const totals = getTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Carregando fluxo de caixa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Acompanhe o movimento de entradas e saídas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">Data Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="INCOME">Receitas</SelectItem>
                  <SelectItem value="EXPENSE">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={loadCashFlow} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalIncomes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagas: {formatCurrency(totals.paidIncomes)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagas: {formatCurrency(totals.paidExpenses)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totals.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totals.netFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferença total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totals.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totals.currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valores pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Fluxo de Caixa Detalhado
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsWithBalance.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
              <p className="text-muted-foreground">
                Ajuste os filtros ou adicione receitas e despesas
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Saldo Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsWithBalance.map((transaction) => {
                  const Icon = transaction.icon;
                  return (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell>{formatDate(transaction.due_date)}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.category?.name || 'Sem categoria'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className={transaction.color}>{transaction.type_label}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.color}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={transaction.paid_date 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {transaction.paid_date ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.running_balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.running_balance)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;
