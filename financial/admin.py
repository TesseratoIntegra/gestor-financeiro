from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from .models import Category, Income, Expense, CashFlow, FinancialSummary


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Configuração do admin para categorias.
    """
    list_display = ('name', 'type', 'color_display', 'is_default', 'created_by', 'created_at')
    list_filter = ('type', 'is_default', 'created_at')
    search_fields = ('name', 'created_by__first_name', 'created_by__last_name')
    ordering = ('type', 'name')
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Cor'


class BaseFinancialEntryAdmin(admin.ModelAdmin):
    """
    Admin base para receitas e despesas.
    """
    list_display = ('description', 'amount_display', 'entry_type', 'status', 'responsible', 'due_day', 'created_by')
    list_filter = ('entry_type', 'status', 'responsible', 'created_at', 'category')
    search_fields = ('description', 'created_by__first_name', 'created_by__last_name')
    date_hierarchy = 'entry_date'
    ordering = ('-entry_date', '-created_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('description', 'amount', 'category', 'responsible')
        }),
        ('Datas e Vencimento', {
            'fields': ('entry_date', 'start_date', 'due_day')
        }),
        ('Tipo e Parcelamento', {
            'fields': ('entry_type', 'total_installments', 'current_installment')
        }),
        ('Status', {
            'fields': ('status', 'paid_date')
        }),
    )
    
    def amount_display(self, obj):
        return f"R$ {obj.amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    amount_display.short_description = 'Valor'
    amount_display.admin_order_field = 'amount'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'created_by')
    
    actions = ['mark_as_paid', 'mark_as_pending']
    
    def mark_as_paid(self, request, queryset):
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} lançamentos marcados como pagos.')
    mark_as_paid.short_description = 'Marcar como pago'
    
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='pending', paid_date=None)
        self.message_user(request, f'{updated} lançamentos marcados como pendentes.')
    mark_as_pending.short_description = 'Marcar como pendente'


@admin.register(Income)
class IncomeAdmin(BaseFinancialEntryAdmin):
    """
    Configuração do admin para receitas.
    """
    pass


@admin.register(Expense)
class ExpenseAdmin(BaseFinancialEntryAdmin):
    """
    Configuração do admin para despesas.
    """
    pass


@admin.register(CashFlow)
class CashFlowAdmin(admin.ModelAdmin):
    """
    Configuração do admin para fluxo de caixa.
    """
    list_display = ('description', 'amount_display', 'flow_type', 'responsible', 'date', 'created_by')
    list_filter = ('flow_type', 'responsible', 'date', 'created_at')
    search_fields = ('description', 'created_by__first_name', 'created_by__last_name')
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')
    
    def amount_display(self, obj):
        return f"R$ {obj.amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    amount_display.short_description = 'Valor'
    amount_display.admin_order_field = 'amount'


@admin.register(FinancialSummary)
class FinancialSummaryAdmin(admin.ModelAdmin):
    """
    Configuração do admin para resumos financeiros.
    """
    list_display = ('user', 'month_year', 'total_income_display', 'total_expenses_display', 'balance_display', 'calculated_at')
    list_filter = ('year', 'month', 'calculated_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    ordering = ('-year', '-month')
    readonly_fields = ('calculated_at',)
    
    def month_year(self, obj):
        return f"{obj.month:02d}/{obj.year}"
    month_year.short_description = 'Mês/Ano'
    month_year.admin_order_field = 'year'
    
    def total_income_display(self, obj):
        return f"R$ {obj.total_income:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    total_income_display.short_description = 'Receitas'
    total_income_display.admin_order_field = 'total_income'
    
    def total_expenses_display(self, obj):
        return f"R$ {obj.total_expenses:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    total_expenses_display.short_description = 'Despesas'
    total_expenses_display.admin_order_field = 'total_expenses'
    
    def balance_display(self, obj):
        color = 'green' if obj.balance >= 0 else 'red'
        return format_html(
            '<span style="color: {};">R$ {}</span>',
            color,
            f"{obj.balance:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        )
    balance_display.short_description = 'Saldo'
    balance_display.admin_order_field = 'balance'

