import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { requestPasswordReset } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
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
      const result = await requestPasswordReset(email);

      if (result.success) {
        setSuccess(true);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-form-header">
          <h2>E-mail enviado!</h2>
          <p>Verifique sua caixa de entrada para instruções de reset de senha.</p>
        </div>

        <div className="auth-success">
          Um e-mail com instruções para resetar sua senha foi enviado para <strong>{email}</strong>.
        </div>

        <div className="auth-form-footer">
          <Link to="/login" className="auth-link">
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>Esqueceu sua senha?</h2>
        <p>Digite seu e-mail para receber instruções de reset.</p>
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
          value={email}
          onChange={handleChange}
          placeholder="seu@email.com"
          required
          error={errors.email}
        />

        <div className="auth-form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="button-full"
          >
            Enviar instruções
          </Button>
        </div>
      </form>

      <div className="auth-form-footer">
        <Link to="/login" className="auth-link">
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Voltar para login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

