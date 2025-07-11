import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`layout-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header 
          user={user} 
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="layout-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
      
      {sidebarOpen && (
        <div 
          className="layout-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

