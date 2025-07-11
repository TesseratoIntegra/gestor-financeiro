from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'birth_date', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para perfil do usuário.
    """
    full_name = serializers.ReadOnlyField()
    partner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
                 'phone', 'birth_date', 'partner', 'partner_name', 'date_joined')
        read_only_fields = ('id', 'username', 'date_joined')
    
    def get_partner_name(self, obj):
        return obj.partner.full_name if obj.partner else None


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de dados do usuário.
    """
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'birth_date', 'partner')
    
    def validate_partner(self, value):
        if value and value == self.instance:
            raise serializers.ValidationError("Você não pode ser parceiro de si mesmo.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para alteração de senha.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("As novas senhas não coincidem.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer customizado para obtenção de tokens JWT.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adiciona informações do usuário ao response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitação de reset de senha.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário com este e-mail não encontrado.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmação de reset de senha.
    """
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

