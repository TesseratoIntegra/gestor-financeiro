import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    type: 'all' // 'all', 'income', 'expense'
  });
  
  const [reportData, setReportData] = useState({
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0
    },
    categoryData: [],
    monthlyData: [],
    transactions: []
  });
  
  const [categories] = useState([
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Moradia' },
    { id: 4, name: 'Salário' },
    { id: 5, name: 'Freelance' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      generateReport();
    }
  }, [filters]);

  const loadInitialData = useCallback(() => {
    // Definir datas padrão (último mês)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    setFilters({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, [filters]);

  const generateReport = () => {
    setLoading(true);
    
    // Simular dados de exemplo
    setTimeout(() => {
      const mockData = {
        summary: {
          totalIncome: 15000,
          totalExpenses: 8500,
          balance: 6500,
          transactionCount: 45
        },
        categoryData: [
          { name: 'Alimentação', value: 2500, color: '#8884d8' },
          { name: 'Transporte', value: 1200, color: '#82ca9d' },
          { name: 'Moradia', value: 3000, color: '#ffc658' },
          { name: 'Lazer', value: 800, color: '#ff7300' },
          { name: 'Outros', value: 1000, color: '#00ff00' }
        ],
        monthlyData: [
          { month: 'Jan', receitas: 5000, despesas: 3000, saldo: 2000 },
          { month: 'Fev', receitas: 5500, despesas: 3200, saldo: 2300 },
          { month: 'Mar', receitas: 4800, despesas: 2800, saldo: 2000 },
          { month: 'Abr', receitas: 5200, despesas: 3100, saldo: 2100 },
          { month: 'Mai', receitas: 5800, despesas: 3400, saldo: 2400 },
          { month: 'Jun', receitas: 6000, despesas: 3500, saldo: 2500 }
        ],
        transactions: [
          { id: 1, date: '2024-06-15', description: 'Supermercado', category: 'Alimentação', amount: -250, type: 'expense' },
          { id: 2, date: '2024-06-14', description: 'Salário', category: 'Salário', amount: 5000, type: 'income' },
          { id: 3, date: '2024-06-13', description: 'Uber', category: 'Transporte', amount: -25, type: 'expense' }
        ]
      };
      
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  };

  const exportToCSV = (data, filename) => {
    setExportLoading(true);
    
    setTimeout(() => {
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setExportLoading(false);
    }, 500);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const exportToPDF = () => {
    setExportLoading(true);
    
    // Simular exportação PDF
    setTimeout(() => {
      alert('Funcionalidade de export PDF em desenvolvimento!');
      setExportLoading(false);
    }, 1000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const SummaryCard = ({ title, value, icon: IconComponent, trend, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {formatCurrency(value)}
            </p>
          </div>
          <div className={`p-3 rounded-full ${color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <IconComponent className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% vs mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => exportToCSV(reportData.transactions, 'relatorio-transacoes')}
            disabled={exportLoading}
            variant="outline"
          >
            {exportLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar CSV
          </Button>
          <Button 
            onClick={exportToPDF}
            disabled={exportLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Gerando relatório...</span>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total de Receitas"
              value={reportData.summary.totalIncome}
              icon={TrendingUp}
              color="text-green-600"
              trend={12}
            />
            <SummaryCard
              title="Total de Despesas"
              value={reportData.summary.totalExpenses}
              icon={TrendingDown}
              color="text-red-600"
              trend={-8}
            />
            <SummaryCard
              title="Saldo"
              value={reportData.summary.balance}
              icon={DollarSign}
              color="text-blue-600"
              trend={5}
            />
            <SummaryCard
              title="Transações"
              value={reportData.summary.transactionCount}
              icon={FileText}
              color="text-gray-600"
            />
          </div>

          {/* Gráficos */}
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Evolução Mensal</TabsTrigger>
              <TabsTrigger value="categories">Por Categoria</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="receitas" fill="#82ca9d" name="Receitas" />
                      <Bar dataKey="despesas" fill="#ff7300" name="Despesas" />
                      <Bar dataKey="saldo" fill="#8884d8" name="Saldo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData.categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Detalhamento</h3>
                      {reportData.categoryData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{backgroundColor: COLORS[index % COLORS.length]}}
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-semibold">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Transações do Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.transactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Reports;
