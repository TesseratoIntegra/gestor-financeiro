"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Endpoint raiz da API com informações básicas.
    """
    return Response({
        'message': 'Bem-vindo à API do Gestor Financeiro Compartilhado!',
        'version': '1.0.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'financial': '/api/financial/',
            'reports': '/api/reports/',
            'admin': '/admin/',
            'docs': '/api/docs/',
        },
        'status': 'active'
    })


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Root
    path('api/', api_root, name='api_root'),
    
    # Authentication endpoints
    path('api/auth/', include('authentication.urls')),
    
    # Financial endpoints
    path('api/financial/', include('financial.urls')),
    
    # Reports endpoints (será implementado na próxima fase)
    path('api/reports/', include('reports.urls')),
]

# Configuração para servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

