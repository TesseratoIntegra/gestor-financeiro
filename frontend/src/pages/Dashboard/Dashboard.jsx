import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo, {user?.first_name}! Aqui está um resumo das suas finanças.</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Saldo Atual</h3>
            <p className="card-value positive">R$ 0,00</p>
            <span className="card-label">Em desenvolvimento</span>
          </div>

          <div className="dashboard-card">
            <h3>Receitas do Mês</h3>
            <p className="card-value positive">R$ 0,00</p>
            <span className="card-label">Em desenvolvimento</span>
          </div>

          <div className="dashboard-card">
            <h3>Despesas do Mês</h3>
            <p className="card-value negative">R$ 0,00</p>
            <span className="card-label">Em desenvolvimento</span>
          </div>

          <div className="dashboard-card">
            <h3>Pendências</h3>
            <p className="card-value neutral">0</p>
            <span className="card-label">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Funcionalidades Disponíveis</h2>
            <div className="feature-list">
              <div className="feature-item">
                <h4>✅ Sistema de Autenticação</h4>
                <p>Login, registro e recuperação de senha implementados</p>
              </div>
              <div className="feature-item">
                <h4>🚧 Gestão de Receitas e Despesas</h4>
                <p>Em desenvolvimento - CRUD completo</p>
              </div>
              <div className="feature-item">
                <h4>🚧 Categorias Dinâmicas</h4>
                <p>Em desenvolvimento - Criação e gestão de categorias</p>
              </div>
              <div className="feature-item">
                <h4>🚧 Planejamento Futuro</h4>
                <p>Em desenvolvimento - Projeções de 4 meses</p>
              </div>
              <div className="feature-item">
                <h4>🚧 Relatórios e Exportação</h4>
                <p>Em desenvolvimento - PDF e JSON</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

