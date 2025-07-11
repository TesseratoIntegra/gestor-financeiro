from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    IncomeViewSet,
    ExpenseViewSet,
    CashFlowViewSet,
    FinancialMetricsView,
    FuturePlanningView,
    quick_entry
)

app_name = 'financial'

# Router para ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'cashflow', CashFlowViewSet, basename='cashflow')

urlpatterns = [
    # URLs dos ViewSets
    path('', include(router.urls)),
    
    # Endpoints especializados
    path('metrics/', FinancialMetricsView.as_view(), name='metrics'),
    path('planning/', FuturePlanningView.as_view(), name='planning'),
    path('quick-entry/', quick_entry, name='quick_entry'),
]

