from rest_framework import serializers
from django.db.models import Q
from datetime import date, timedelta
from .models import Category, Income, Expense, CashFlow, FinancialSummary


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorias.
    """
    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'color', 'icon', 'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BaseFinancialEntrySerializer(serializers.ModelSerializer):
    """
    Serializer base para receitas e despesas.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    responsible_display = serializers.CharField(source='get_responsible_display', read_only=True)
    entry_type_display = serializers.CharField(source='get_entry_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    installment_info = serializers.SerializerMethodField()
    
    class Meta:
        fields = ('id', 'description', 'amount', 'category', 'category_name', 'category_color',
                 'entry_date', 'start_date', 'due_day', 'entry_type', 'entry_type_display',
                 'responsible', 'responsible_display', 'total_installments', 'current_installment',
                 'status', 'status_display', 'paid_date', 'is_overdue', 'installment_info',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_installment_info(self, obj):
        if obj.entry_type == 'installment' and obj.total_installments:
            return f"{obj.current_installment or 1}/{obj.total_installments}"
        return None
    
    def validate(self, attrs):
        # Validações para parcelamento
        if attrs.get('entry_type') == 'installment':
            if not attrs.get('total_installments'):
                raise serializers.ValidationError("Total de parcelas é obrigatório para lançamentos parcelados.")
            if attrs.get('total_installments', 0) < 2:
                raise serializers.ValidationError("Lançamentos parcelados devem ter pelo menos 2 parcelas.")
        
        # Validação de data de vencimento
        due_day = attrs.get('due_day')
        if due_day and (due_day < 1 or due_day > 31):
            raise serializers.ValidationError("Dia do vencimento deve estar entre 1 e 31.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        
        # Define parcela atual como 1 se não informada
        if validated_data.get('entry_type') == 'installment' and not validated_data.get('current_installment'):
            validated_data['current_installment'] = 1
        
        return super().create(validated_data)


class IncomeSerializer(BaseFinancialEntrySerializer):
    """
    Serializer para receitas.
    """
    class Meta(BaseFinancialEntrySerializer.Meta):
        model = Income
    
    def validate_category(self, value):
        if value.type != 'income':
            raise serializers.ValidationError("Categoria deve ser do tipo 'Receita'.")
        return value


class ExpenseSerializer(BaseFinancialEntrySerializer):
    """
    Serializer para despesas.
    """
    class Meta(BaseFinancialEntrySerializer.Meta):
        model = Expense
    
    def validate_category(self, value):
        if value.type != 'expense':
            raise serializers.ValidationError("Categoria deve ser do tipo 'Despesa'.")
        return value


class CashFlowSerializer(serializers.ModelSerializer):
    """
    Serializer para fluxo de caixa.
    """
    flow_type_display = serializers.CharField(source='get_flow_type_display', read_only=True)
    responsible_display = serializers.CharField(source='get_responsible_display', read_only=True)
    
    class Meta:
        model = CashFlow
        fields = ('id', 'description', 'amount', 'flow_type', 'flow_type_display',
                 'date', 'responsible', 'responsible_display', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FinancialSummarySerializer(serializers.ModelSerializer):
    """
    Serializer para resumos financeiros.
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    month_year = serializers.SerializerMethodField()
    
    class Meta:
        model = FinancialSummary
        fields = ('id', 'user', 'user_name', 'year', 'month', 'month_year',
                 'total_income', 'total_expenses', 'fixed_expenses', 'installment_expenses',
                 'balance', 'paid_amount', 'pending_amount', 'overdue_amount', 'calculated_at')
        read_only_fields = ('id', 'calculated_at')
    
    def get_month_year(self, obj):
        return f"{obj.month:02d}/{obj.year}"


class FinancialMetricsSerializer(serializers.Serializer):
    """
    Serializer para métricas financeiras calculadas.
    """
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_fixed_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_debt = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    overdue_count = serializers.IntegerField()


class FuturePlanningSerializer(serializers.Serializer):
    """
    Serializer para planejamento futuro (próximos meses).
    """
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    month_name = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    fixed_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    installment_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    estimated_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    accumulated_balance = serializers.DecimalField(max_digits=12, decimal_places=2)


class QuickEntrySerializer(serializers.Serializer):
    """
    Serializer para lançamentos rápidos.
    """
    type = serializers.ChoiceField(choices=['income', 'expense'])
    description = serializers.CharField(max_length=200)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    category_id = serializers.IntegerField()
    responsible = serializers.ChoiceField(choices=['person1', 'person2', 'both'])
    due_day = serializers.IntegerField(min_value=1, max_value=31)
    entry_type = serializers.ChoiceField(choices=['fixed', 'single', 'installment'], default='single')
    total_installments = serializers.IntegerField(required=False, min_value=2)
    
    def validate(self, attrs):
        # Validação de categoria
        try:
            category = Category.objects.get(id=attrs['category_id'])
            if category.type != attrs['type']:
                raise serializers.ValidationError("Categoria não compatível com o tipo de lançamento.")
        except Category.DoesNotExist:
            raise serializers.ValidationError("Categoria não encontrada.")
        
        # Validação de parcelamento
        if attrs.get('entry_type') == 'installment' and not attrs.get('total_installments'):
            raise serializers.ValidationError("Total de parcelas é obrigatório para lançamentos parcelados.")
        
        return attrs

