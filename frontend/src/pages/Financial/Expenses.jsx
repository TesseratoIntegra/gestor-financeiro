import React, { useState, useEffect } from 'react';
import financialService from '../../services/financialService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Edit, Trash2, CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    category: '',
    is_recurring: false,
    recurring_period: 'MONTHLY',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [expensesResult, categoriesResult] = await Promise.all([
      financialService.getExpenses(),
      financialService.getCategories('EXPENSE')
    ]);
    
    if (expensesResult.success) {
      setExpenses(expensesResult.data);
    }
    if (categoriesResult.success) {
      setCategories(categoriesResult.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    const result = editingExpense 
      ? await financialService.updateExpense(editingExpense.id, data)
      : await financialService.createExpense(data);

    if (result.success) {
      loadData();
      handleCloseDialog();
    } else {
      alert(typeof result.error === 'string' ? result.error : 'Erro ao salvar despesa');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      due_date: expense.due_date,
      category: expense.category?.id || '',
      is_recurring: expense.is_recurring,
      recurring_period: expense.recurring_period || 'MONTHLY',
      priority: expense.priority || 'MEDIUM'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      const result = await financialService.deleteExpense(id);
      if (result.success) {
        loadData();
      } else {
        alert(result.error);
      }
    }
  };

  const handleMarkPaid = async (id) => {
    const result = await financialService.markExpensePaid(id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleMarkPending = async (id) => {
    const result = await financialService.markExpensePending(id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      category: '',
      is_recurring: false,
      recurring_period: 'MONTHLY',
      priority: 'MEDIUM'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (expense) => {
    if (expense.paid_date) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
    }
    
    const today = new Date();
    const dueDate = new Date(expense.due_date);
    
    if (dueDate < today) {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Atrasado</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta'
    };
    
    return <Badge className={colors[priority] || colors.MEDIUM}>{labels[priority] || 'Média'}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Carregando despesas...</div>
      </div>
    );
  }

  const overdueExpenses = expenses.filter(expense => {
    if (expense.paid_date) return false;
    return new Date(expense.due_date) < new Date();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e gastos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Conta de luz, Supermercado"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_recurring">Despesa recorrente</Label>
              </div>
              
              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurring_period">Período</Label>
                  <Select value={formData.recurring_period} onValueChange={(value) => setFormData({...formData, recurring_period: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="YEARLY">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingExpense ? 'Salvar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(expenses.filter(expense => expense.paid_date).reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(expenses.filter(expense => !expense.paid_date).reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(overdueExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}
            </div>
            <div className="text-sm text-muted-foreground">
              {overdueExpenses.length} despesa(s)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de despesas em atraso */}
      {overdueExpenses.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Atenção: Despesas em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-2">
              Você tem {overdueExpenses.length} despesa(s) em atraso totalizando {formatCurrency(overdueExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}.
            </p>
            <div className="space-y-1">
              {overdueExpenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="text-sm text-red-600">
                  • {expense.description} - {formatCurrency(expense.amount)} - Venceu em {formatDate(expense.due_date)}
                </div>
              ))}
              {overdueExpenses.length > 3 && (
                <div className="text-sm text-red-600">... e mais {overdueExpenses.length - 3} despesa(s)</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma despesa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira despesa para começar a controlar seus gastos
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira despesa
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category?.name || 'Sem categoria'}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>{formatDate(expense.due_date)}</TableCell>
                    <TableCell>{getPriorityBadge(expense.priority)}</TableCell>
                    <TableCell>{getStatusBadge(expense)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {expense.paid_date ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMarkPending(expense.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMarkPaid(expense.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;

