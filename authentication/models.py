from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo de usuário personalizado para o sistema de gestão financeira.
    Estende o modelo padrão do Django para incluir campos específicos.
    """
    email = models.EmailField(unique=True, verbose_name='E-mail')
    first_name = models.CharField(max_length=150, verbose_name='Nome')
    last_name = models.CharField(max_length=150, verbose_name='Sobrenome')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    birth_date = models.DateField(blank=True, null=True, verbose_name='Data de Nascimento')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    
    # Campo para identificar o parceiro/cônjuge no sistema compartilhado
    partner = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        verbose_name='Parceiro(a)'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_shared_users(self):
        """
        Retorna lista de usuários que compartilham dados financeiros.
        Inclui o próprio usuário e seu parceiro, se houver.
        """
        users = [self]
        if self.partner:
            users.append(self.partner)
        return users

