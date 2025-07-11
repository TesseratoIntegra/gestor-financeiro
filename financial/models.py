from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

User = get_user_model()


class Category(models.Model):
    """
    Modelo para categorias dinâmicas de receitas e despesas.
    """
    CATEGORY_TYPES = [
        ('income', 'Receita'),
        ('expense', 'Despesa'),
    ]
    
    name = models.CharField(max_length=100, verbose_name='Nome')
    type = models.CharField(max_length=10, choices=CATEGORY_TYPES, verbose_name='Tipo')
    color = models.CharField(max_length=7, default='#007bff', verbose_name='Cor')
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name='Ícone')
    is_default = models.BooleanField(default=False, verbose_name='Categoria Padrão')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    
    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        unique_together = ['name', 'type', 'created_by']
        ordering = ['type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class BaseFinancialEntry(models.Model):
    """
    Modelo base abstrato para receitas e despesas.
    """
    ENTRY_TYPES = [
        ('fixed', 'Fixa'),
        ('single', 'Única'),
        ('installment', 'Parcelada'),
    ]
    
    RESPONSIBLE_CHOICES = [
        ('person1', 'Pessoa 1'),
        ('person2', 'Pessoa 2'),
        ('both', 'Ambos'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('paid', 'Pago'),
        ('overdue', 'Atrasado'),
    ]
    
    # Campos básicos
    description = models.CharField(max_length=200, verbose_name='Descrição')
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Valor'
    )
    
    # Datas
    entry_date = models.DateField(verbose_name='Data do Lançamento')
    start_date = models.DateField(verbose_name='Data de Início')
    due_day = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Dia do Vencimento'
    )
    
    # Tipo e responsável
    entry_type = models.CharField(max_length=15, choices=ENTRY_TYPES, verbose_name='Tipo')
    responsible = models.CharField(max_length=10, choices=RESPONSIBLE_CHOICES, verbose_name='Responsável')
    
    # Campos para parcelamento
    total_installments = models.IntegerField(
        blank=True, 
        null=True, 
        validators=[MinValueValidator(1)],
        verbose_name='Total de Parcelas'
    )
    current_installment = models.IntegerField(
        blank=True, 
        null=True, 
        validators=[MinValueValidator(1)],
        verbose_name='Parcela Atual'
    )
    
    # Status e controle
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', verbose_name='Status')
    paid_date = models.DateField(blank=True, null=True, verbose_name='Data do Pagamento')
    
    # Metadados
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        abstract = True
        ordering = ['-entry_date', '-created_at']
    
    def __str__(self):
        return f"{self.description} - R$ {self.amount}"
    
    @property
    def is_overdue(self):
        """Verifica se o lançamento está atrasado."""
        if self.status == 'paid':
            return False
        
        due_date = self.get_due_date()
        return due_date < date.today()
    
    def get_due_date(self, reference_date=None):
        """
        Calcula a data de vencimento baseada no dia do vencimento.
        """
        if reference_date is None:
            reference_date = self.start_date
        
        # Ajusta para o dia do vencimento no mês de referência
        try:
            due_date = reference_date.replace(day=self.due_day)
        except ValueError:
            # Caso o dia não exista no mês (ex: 31 em fevereiro)
            # Usa o último dia do mês
            next_month = reference_date.replace(day=28) + timedelta(days=4)
            due_date = next_month - timedelta(days=next_month.day)
        
        return due_date
    
    def get_installment_dates(self):
        """
        Retorna lista de datas para todas as parcelas (apenas para parceladas).
        """
        if self.entry_type != 'installment' or not self.total_installments:
            return []
        
        dates = []
        current_date = self.start_date
        
        for i in range(self.total_installments):
            due_date = self.get_due_date(current_date)
            dates.append(due_date)
            current_date = current_date + relativedelta(months=1)
        
        return dates
    
    def mark_as_paid(self, paid_date=None):
        """Marca o lançamento como pago."""
        self.status = 'paid'
        self.paid_date = paid_date or date.today()
        self.save()
    
    def mark_as_pending(self):
        """Marca o lançamento como pendente."""
        self.status = 'pending'
        self.paid_date = None
        self.save()


class Income(BaseFinancialEntry):
    """
    Modelo para receitas.
    """
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT, 
        limit_choices_to={'type': 'income'},
        verbose_name='Categoria'
    )
    
    class Meta:
        verbose_name = 'Receita'
        verbose_name_plural = 'Receitas'
        ordering = ['-entry_date', '-created_at']


class Expense(BaseFinancialEntry):
    """
    Modelo para despesas.
    """
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT, 
        limit_choices_to={'type': 'expense'},
        verbose_name='Categoria'
    )
    
    class Meta:
        verbose_name = 'Despesa'
        verbose_name_plural = 'Despesas'
        ordering = ['-entry_date', '-created_at']


class CashFlow(models.Model):
    """
    Modelo para controle de caixa inicial e movimentações.
    """
    FLOW_TYPES = [
        ('initial', 'Saldo Inicial'),
        ('adjustment', 'Ajuste'),
        ('transfer', 'Transferência'),
    ]
    
    description = models.CharField(max_length=200, verbose_name='Descrição')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor')
    flow_type = models.CharField(max_length=15, choices=FLOW_TYPES, verbose_name='Tipo')
    date = models.DateField(verbose_name='Data')
    responsible = models.CharField(
        max_length=10, 
        choices=BaseFinancialEntry.RESPONSIBLE_CHOICES, 
        verbose_name='Responsável'
    )
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        verbose_name = 'Fluxo de Caixa'
        verbose_name_plural = 'Fluxos de Caixa'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.description} - R$ {self.amount} ({self.get_flow_type_display()})"


class FinancialSummary(models.Model):
    """
    Modelo para armazenar resumos financeiros mensais calculados.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Usuário')
    year = models.IntegerField(verbose_name='Ano')
    month = models.IntegerField(verbose_name='Mês')
    
    # Valores calculados
    total_income = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Total de Receitas')
    total_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Total de Despesas')
    fixed_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Despesas Fixas')
    installment_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Despesas Parceladas')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Saldo')
    
    # Controle de pagamentos
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Valor Pago')
    pending_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Valor Pendente')
    overdue_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Valor Atrasado')
    
    calculated_at = models.DateTimeField(auto_now=True, verbose_name='Calculado em')
    
    class Meta:
        verbose_name = 'Resumo Financeiro'
        verbose_name_plural = 'Resumos Financeiros'
        unique_together = ['user', 'year', 'month']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"Resumo {self.month:02d}/{self.year} - {self.user.full_name}"

