from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Configuração do admin para o modelo User personalizado.
    """
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('Informações Pessoais'), {'fields': ('first_name', 'last_name', 'phone', 'birth_date')}),
        (_('Relacionamento'), {'fields': ('partner',)}),
        (_('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Datas Importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('partner')

