import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Tags, 
  Wallet, 
  Calendar,
  FileText,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/incomes',
      label: 'Receitas',
      icon: TrendingUp,
    },
    {
      path: '/expenses',
      label: 'Despesas',
      icon: TrendingDown,
    },
    {
      path: '/categories',
      label: 'Categorias',
      icon: Tags,
    },
    {
      path: '/cashflow',
      label: 'Fluxo de Caixa',
      icon: Wallet,
    },
    {
      path: '/planning',
      label: 'Planejamento',
      icon: Calendar,
    },
    {
      path: '/reports',
      label: 'Relatórios',
      icon: FileText,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Wallet className="logo-icon" />
            <span className="logo-text">Gestor Financeiro</span>
          </div>
          
          <button 
            className="sidebar-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-text">
            <p>Gestor Financeiro</p>
            <p className="version">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

