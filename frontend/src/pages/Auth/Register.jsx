import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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

    if (!formData.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.first_name) {
      newErrors.first_name = 'Nome é obrigatório';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Sobrenome é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Senhas não coincidem';
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
      const result = await register(formData);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // Trata erros específicos do backend
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch {
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>Criar nova conta</h2>
        <p>Preencha os dados abaixo para criar sua conta.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {errors.general && (
          <div className="auth-error">
            {errors.general}
          </div>
        )}

        <div className="form-section">
          <h3 className="form-section-title">Informações de Acesso</h3>
          
          <Input
            label="Nome de usuário"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="usuario123"
            required
            error={errors.username}
          />

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
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Informações Pessoais</h3>
          
          <div className="form-row">
            <Input
              label="Nome"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="João"
              required
              error={errors.first_name}
            />

            <Input
              label="Sobrenome"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Silva"
              required
              error={errors.last_name}
            />
          </div>

          <Input
            label="Telefone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            error={errors.phone}
          />
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Senha</h3>
          
          <div className="password-input-group">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
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

          <div className="password-input-group">
            <Input
              label="Confirmar senha"
              type={showPasswordConfirm ? 'text' : 'password'}
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
              required
              error={errors.password_confirm}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              aria-label={showPasswordConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="button-full"
          >
            Criar conta
          </Button>
        </div>
      </form>

      <div className="auth-form-footer">
        <p>
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

