from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserUpdateView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LogoutView,
    user_stats,
    health_check
)

app_name = 'authentication'

urlpatterns = [
    # Autenticação
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Perfil do usuário
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserUpdateView.as_view(), name='profile_update'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Reset de senha
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Estatísticas e utilitários
    path('stats/', user_stats, name='user_stats'),
    path('health/', health_check, name='health_check'),
]

