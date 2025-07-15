import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import './Auth.css';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { confirmPasswordReset } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_password) {
      newErrors.new_password = 'Nova senha é obrigatória';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Confirmação de senha é obrigatória';
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Senhas não coincidem';
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
      const result = await confirmPasswordReset(uid, token, formData);

      if (result.success) {
        navigate('/login', { 
          state: { message: 'Senha resetada com sucesso! Faça login com sua nova senha.' }
        });
      } else {
        setErrors({ general: result.error });
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
        <h2>Definir nova senha</h2>
        <p>Digite sua nova senha abaixo.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {errors.general && (
          <div className="auth-error">
            {errors.general}
          </div>
        )}

        <div className="password-input-group">
          <Input
            label="Nova senha"
            type={showPassword ? 'text' : 'password'}
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            required
            error={errors.new_password}
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
            label="Confirmar nova senha"
            type={showPasswordConfirm ? 'text' : 'password'}
            name="new_password_confirm"
            value={formData.new_password_confirm}
            onChange={handleChange}
            placeholder="Digite a senha novamente"
            required
            error={errors.new_password_confirm}
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

        <div className="auth-form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="button-full"
          >
            Redefinir senha
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

