import React, { useState, useEffect, useCallback } from 'react';
import financialService from '../../services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Calculator
} from 'lucide-react';

const Planning = () => {
  const [planning, setPlanning] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(4);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    priority: 'MEDIUM'
  });
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    loadPlanningData();
  }, [months, loadPlanningData]);

  const loadPlanningData = useCallback(async () => {
    setLoading(true);
    try {
      const planningResult = await financialService.getFuturePlanning(months);
      if (planningResult.success) {
        setPlanning(planningResult.data);
      }
      
      // Simular metas (já que não temos endpoint específico)
      const mockGoals = [
        {
          id: 1,
          name: 'Emergência',
          target_amount: 10000,
          current_amount: 3500,
          target_date: '2025-12-31',
          priority: 'HIGH',
          status: 'IN_PROGRESS'
        },
        {
          id: 2,
          name: 'Viagem',
          target_amount: 5000,
          current_amount: 1200,
          target_date: '2025-06-30',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS'
        }
      ];
      setGoals(mockGoals);
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
    } finally {
      setLoading(false);
    }
  }, [months]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateGoalProgress = (goal) => {
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  };

  const getGoalStatus = (goal) => {
    const progress = calculateGoalProgress(goal);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    if (progress >= 100) {
      return { label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    
    if (targetDate < today) {
      return { label: 'Atrasada', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    
    return { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: Target };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta'
    };
    return labels[priority] || 'Média';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Carregando planejamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planejamento Financeiro</h1>
          <p className="text-muted-foreground">Projete suas finanças futuras e defina metas</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="months">Período:</Label>
          <Select value={months.toString()} onValueChange={(value) => setMonths(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="4">4 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projeção Financeira */}
      {planning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Projeção para os Próximos {months} Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Receitas Projetadas</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(planning.projected_incomes)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Despesas Projetadas</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(planning.projected_expenses)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Saldo Projetado</div>
                <div className={`text-2xl font-bold ${
                  (planning.projected_incomes - planning.projected_expenses) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(planning.projected_incomes - planning.projected_expenses)}
                </div>
              </div>
            </div>
            
            {planning.monthly_breakdown && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Receitas</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planning.monthly_breakdown.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(month.incomes)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(month.expenses)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        (month.incomes - month.expenses) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.incomes - month.expenses)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metas Financeiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Metas Financeiras
            </span>
            <Button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              variant={showGoalForm ? "outline" : "default"}
            >
              {showGoalForm ? 'Cancelar' : 'Nova Meta'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showGoalForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal_name">Nome da Meta</Label>
                    <Input
                      id="goal_name"
                      placeholder="Ex: Fundo de emergência, Viagem"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target_amount">Valor Alvo</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target_date">Data Alvo</Label>
                    <Input
                      id="target_date"
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({...newGoal, priority: value})}>
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
                  
                  <div className="md:col-span-2">
                    <Button type="button" className="w-full">
                      Criar Meta
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateGoalProgress(goal);
              const status = getGoalStatus(goal);
              const StatusIcon = status.icon;
              
              return (
                <Card key={goal.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Meta: {formatCurrency(goal.target_amount)} até {formatDate(goal.target_date)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {getPriorityLabel(goal.priority)}
                        </Badge>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso: {formatCurrency(goal.current_amount)}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Restante: {formatCurrency(goal.target_amount - goal.current_amount)}</span>
                        <span>
                          {Math.ceil((goal.target_amount - goal.current_amount) / 
                          (new Date(goal.target_date).getMonth() - new Date().getMonth() + 1))} 
                          / mês para atingir a meta
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {goals.length === 0 && (
              <div className="text-center py-12">
                <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
                <p className="text-muted-foreground mb-4">
                  Defina suas metas financeiras para acompanhar seu progresso
                </p>
                <Button onClick={() => setShowGoalForm(true)}>
                  Criar primeira meta
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-1 bg-blue-100 rounded">
                <PiggyBank className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Fundo de Emergência</h4>
                <p className="text-sm text-blue-700">
                  Recomendamos manter o equivalente a 3-6 meses de despesas em uma conta de emergência.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="p-1 bg-green-100 rounded">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Investimentos</h4>
                <p className="text-sm text-green-700">
                  Com seu saldo positivo, considere diversificar em investimentos de baixo risco.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="p-1 bg-yellow-100 rounded">
                <Calculator className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900">Revisão de Gastos</h4>
                <p className="text-sm text-yellow-700">
                  Analise suas categorias de despesas e identifique onde pode economizar.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Planning;
