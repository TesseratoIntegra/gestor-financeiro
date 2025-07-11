from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

app_name = 'reports'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_placeholder(request):
    """
    Placeholder para funcionalidades de relatórios.
    """
    return Response({
        'message': 'Funcionalidades de relatórios serão implementadas em breve!',
        'available_reports': [
            'PDF Report',
            'JSON Export',
            'Data Import',
        ]
    })


urlpatterns = [
    path('', reports_placeholder, name='reports_placeholder'),
]

