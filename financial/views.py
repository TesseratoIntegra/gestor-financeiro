from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum, Count
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
import calendar

from .models import Category, Income, Expense, CashFlow, FinancialSummary
from .serializers import (
    CategorySerializer,
    IncomeSerializer,
    ExpenseSerializer,
    CashFlowSerializer,
    FinancialSummarySerializer,
    FinancialMetricsSerializer,
    FuturePlanningSerializer,
    QuickEntrySerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de categorias.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'type', 'created_at']
    ordering = ['type', 'name']
    
    def get_queryset(self):
        user = self.request.user
        shared_users = user.get_shared_users()
        
        queryset = Category.objects.filter(
            Q(created_by__in=shared_users) | Q(is_default=True)
        ).distinct()
        
        # Filtro por tipo
        category_type = self.request.query_params.get('type')
        if category_type:
            queryset = queryset.filter(type=category_type)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def income_categories(self, request):
        """Retorna apenas categorias de receita."""
        categories = self.get_queryset().filter(type='income')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expense_categories(self, request):
        """Retorna apenas categorias de despesa."""
        categories = self.get_queryset().filter(type='expense')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class IncomeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de receitas.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'category__name']
    ordering_fields = ['entry_date', 'amount', 'due_day', 'created_at']
    ordering = ['-entry_date', '-created_at']
    
    def get_queryset(self):
        user = self.request.user
        shared_users = user.get_shared_users()
        
        queryset = Income.objects.filter(created_by__in=shared_users).select_related('category', 'created_by')
        
        # Filtros
        entry_type = self.request.query_params.get('entry_type')
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        responsible = self.request.query_params.get('responsible')
        if responsible:
            queryset = queryset.filter(responsible=responsible)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filtro por data
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(entry_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(entry_date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Marca uma receita como paga."""
        income = self.get_object()
        paid_date = request.data.get('paid_date', date.today())
        income.mark_as_paid(paid_date)
        
        return Response({
            'message': 'Receita marcada como paga!',
            'income': self.get_serializer(income).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_pending(self, request, pk=None):
        """Marca uma receita como pendente."""
        income = self.get_object()
        income.mark_as_pending()
        
        return Response({
            'message': 'Receita marcada como pendente!',
            'income': self.get_serializer(income).data
        })


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de despesas.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'category__name']
    ordering_fields = ['entry_date', 'amount', 'due_day', 'created_at']
    ordering = ['-entry_date', '-created_at']
    
    def get_queryset(self):
        user = self.request.user
        shared_users = user.get_shared_users()
        
        queryset = Expense.objects.filter(created_by__in=shared_users).select_related('category', 'created_by')
        
        # Filtros (mesma lógica do IncomeViewSet)
        entry_type = self.request.query_params.get('entry_type')
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        responsible = self.request.query_params.get('responsible')
        if responsible:
            queryset = queryset.filter(responsible=responsible)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filtro por data
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(entry_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(entry_date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Marca uma despesa como paga."""
        expense = self.get_object()
        paid_date = request.data.get('paid_date', date.today())
        expense.mark_as_paid(paid_date)
        
        return Response({
            'message': 'Despesa marcada como paga!',
            'expense': self.get_serializer(expense).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_pending(self, request, pk=None):
        """Marca uma despesa como pendente."""
        expense = self.get_object()
        expense.mark_as_pending()
        
        return Response({
            'message': 'Despesa marcada como pendente!',
            'expense': self.get_serializer(expense).data
        })
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Retorna despesas em atraso."""
        queryset = self.get_queryset().filter(
            status='pending',
            start_date__lt=date.today()
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CashFlowViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de fluxo de caixa.
    """
    serializer_class = CashFlowSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']
    
    def get_queryset(self):
        user = self.request.user
        shared_users = user.get_shared_users()
        
        queryset = CashFlow.objects.filter(created_by__in=shared_users)
        
        # Filtros
        flow_type = self.request.query_params.get('flow_type')
        if flow_type:
            queryset = queryset.filter(flow_type=flow_type)
        
        responsible = self.request.query_params.get('responsible')
        if responsible:
            queryset = queryset.filter(responsible=responsible)
        
        # Filtro por data
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset


class FinancialMetricsView(APIView):
    """
    View para métricas financeiras do mês atual.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        shared_users = user.get_shared_users()
        today = date.today()
        
        # Saldo atual em caixa
        cash_flow_total = CashFlow.objects.filter(
            created_by__in=shared_users
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Receitas pagas no mês atual
        income_paid = Income.objects.filter(
            created_by__in=shared_users,
            status='paid',
            paid_date__year=today.year,
            paid_date__month=today.month
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Despesas pagas no mês atual
        expenses_paid = Expense.objects.filter(
            created_by__in=shared_users,
            status='paid',
            paid_date__year=today.year,
            paid_date__month=today.month
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Saldo atual considerando movimentações
        current_balance = cash_flow_total + income_paid - expenses_paid
        
        # Despesas fixas do mês
        fixed_expenses = Expense.objects.filter(
            created_by__in=shared_users,
            entry_type='fixed'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Total de endividamento (parcelas pendentes)
        total_debt = Expense.objects.filter(
            created_by__in=shared_users,
            entry_type='installment',
            status='pending'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Receitas do mês
        monthly_income = Income.objects.filter(
            created_by__in=shared_users,
            entry_type__in=['fixed', 'single'],
            start_date__year=today.year,
            start_date__month=today.month
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Valores pendentes e atrasados
        pending_amount = Expense.objects.filter(
            created_by__in=shared_users,
            status='pending'
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        overdue_expenses = Expense.objects.filter(
            created_by__in=shared_users,
            status='pending',
            start_date__lt=today
        )
        
        overdue_amount = overdue_expenses.aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        overdue_count = overdue_expenses.count()
        
        metrics = {
            'current_balance': current_balance,
            'monthly_fixed_expenses': fixed_expenses,
            'total_debt': total_debt,
            'monthly_income': monthly_income,
            'paid_amount': expenses_paid,
            'pending_amount': pending_amount,
            'overdue_amount': overdue_amount,
            'overdue_count': overdue_count,
        }
        
        serializer = FinancialMetricsSerializer(metrics)
        return Response(serializer.data)


class FuturePlanningView(APIView):
    """
    View para planejamento futuro (próximos meses).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        shared_users = user.get_shared_users()
        
        # Número de meses para projetar (padrão: 4)
        months_ahead = int(request.query_params.get('months', 4))
        
        planning_data = []
        current_date = date.today().replace(day=1)  # Primeiro dia do mês atual
        
        # Saldo inicial (saldo atual)
        cash_flow_total = CashFlow.objects.filter(
            created_by__in=shared_users
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        accumulated_balance = cash_flow_total
        
        for i in range(months_ahead):
            month_date = current_date + relativedelta(months=i)
            year = month_date.year
            month = month_date.month
            month_name = calendar.month_name[month]
            
            # Receitas fixas
            fixed_income = Income.objects.filter(
                created_by__in=shared_users,
                entry_type='fixed'
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            # Receitas únicas do mês
            single_income = Income.objects.filter(
                created_by__in=shared_users,
                entry_type='single',
                start_date__year=year,
                start_date__month=month
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            # Receitas parceladas do mês
            installment_income = Income.objects.filter(
                created_by__in=shared_users,
                entry_type='installment',
                start_date__lte=month_date
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            total_income = fixed_income + single_income + installment_income
            
            # Despesas fixas
            fixed_expenses = Expense.objects.filter(
                created_by__in=shared_users,
                entry_type='fixed'
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            # Despesas parceladas do mês
            installment_expenses = Expense.objects.filter(
                created_by__in=shared_users,
                entry_type='installment',
                start_date__lte=month_date
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            # Despesas únicas do mês
            single_expenses = Expense.objects.filter(
                created_by__in=shared_users,
                entry_type='single',
                start_date__year=year,
                start_date__month=month
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            total_expenses = fixed_expenses + installment_expenses + single_expenses
            estimated_balance = total_income - total_expenses
            accumulated_balance += estimated_balance
            
            planning_data.append({
                'year': year,
                'month': month,
                'month_name': month_name,
                'total_income': total_income,
                'fixed_expenses': fixed_expenses,
                'installment_expenses': installment_expenses,
                'total_expenses': total_expenses,
                'estimated_balance': estimated_balance,
                'accumulated_balance': accumulated_balance,
            })
        
        serializer = FuturePlanningSerializer(planning_data, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def quick_entry(request):
    """
    Endpoint para lançamentos rápidos.
    """
    serializer = QuickEntrySerializer(data=request.data)
    
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Busca a categoria
        category = Category.objects.get(id=data['category_id'])
        
        # Dados comuns
        entry_data = {
            'description': data['description'],
            'amount': data['amount'],
            'category': category,
            'responsible': data['responsible'],
            'due_day': data['due_day'],
            'entry_type': data['entry_type'],
            'entry_date': date.today(),
            'start_date': date.today(),
        }
        
        # Adiciona dados de parcelamento se necessário
        if data['entry_type'] == 'installment':
            entry_data['total_installments'] = data['total_installments']
            entry_data['current_installment'] = 1
        
        # Cria o lançamento baseado no tipo
        if data['type'] == 'income':
            entry = Income.objects.create(created_by=request.user, **entry_data)
            serializer_class = IncomeSerializer
        else:
            entry = Expense.objects.create(created_by=request.user, **entry_data)
            serializer_class = ExpenseSerializer
        
        result_serializer = serializer_class(entry)
        
        return Response({
            'message': 'Lançamento criado com sucesso!',
            'entry': result_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

