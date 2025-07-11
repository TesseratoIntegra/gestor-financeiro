import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ user, onMenuClick, sidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const dropdownRef = useRef(null);

  // Fecha dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="header-title">
          <h1>Gestor Financeiro</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="user-menu" ref={dropdownRef}>
          <button 
            className="user-button"
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || user?.first_name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`dropdown-icon ${dropdownOpen ? 'rotated' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="dropdown-name">{user?.full_name || user?.first_name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={16} />
                  <span>Perfil</span>
                </Link>
                
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

