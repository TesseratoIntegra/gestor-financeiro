import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>Entrar na sua conta</h2>
        <p>Bem-vindo de volta! Faça login para continuar.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {errors.general && (
          <div className="auth-error">
            {errors.general}
          </div>
        )}

        <Input
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          required
          error={errors.email}
        />

        <div className="password-input-group">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
            error={errors.password}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="auth-form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="button-full"
          >
            Entrar
          </Button>
        </div>

        <div className="auth-form-links">
          <Link to="/forgot-password" className="auth-link">
            Esqueceu sua senha?
          </Link>
        </div>
      </form>

      <div className="auth-form-footer">
        <p>
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

