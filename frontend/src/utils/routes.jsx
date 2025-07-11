import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layout components
import Layout from '../components/Layout/Layout';
import AuthLayout from '../components/Layout/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import Profile from '../pages/Profile/Profile';

// Financial pages
import Incomes from '../pages/Financial/Incomes';
import Expenses from '../pages/Financial/Expenses';
import Categories from '../pages/Financial/Categories';
import CashFlow from '../pages/Financial/CashFlow';
import Planning from '../pages/Financial/Planning';

// Reports pages
import Reports from '../pages/Reports/Reports';

// Error pages
import NotFound from '../pages/Error/NotFound';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rotas públicas (redireciona se já autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Configuração das rotas
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Register />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password/:uid/:token',
    element: (
      <PublicRoute>
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/incomes',
    element: (
      <ProtectedRoute>
        <Layout>
          <Incomes />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/expenses',
    element: (
      <ProtectedRoute>
        <Layout>
          <Expenses />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/categories',
    element: (
      <ProtectedRoute>
        <Layout>
          <Categories />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/cashflow',
    element: (
      <ProtectedRoute>
        <Layout>
          <CashFlow />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/planning',
    element: (
      <ProtectedRoute>
        <Layout>
          <Planning />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Layout>
          <Reports />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;

