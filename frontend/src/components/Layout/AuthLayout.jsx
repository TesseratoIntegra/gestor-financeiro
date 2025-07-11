import React from 'react';
import { Wallet } from 'lucide-react';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <Wallet className="auth-logo-icon" />
            <h1 className="auth-logo-text">Gestor Financeiro</h1>
          </div>
          <p className="auth-subtitle">
            Gerencie suas finanças de forma inteligente e compartilhada
          </p>
        </div>
        
        <div className="auth-content">
          {children}
        </div>
        
        <div className="auth-footer">
          <p>&copy; 2024 Gestor Financeiro. Todos os direitos reservados.</p>
        </div>
      </div>
      
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
    </div>
  );
};

export default AuthLayout;

