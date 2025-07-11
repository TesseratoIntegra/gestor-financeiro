import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>404 - Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
};

export default NotFound;
