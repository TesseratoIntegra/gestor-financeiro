import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const buttonClass = `
    button 
    button-${variant} 
    button-${size} 
    ${disabled || loading ? 'button-disabled' : ''} 
    ${loading ? 'button-loading' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="button-spinner"></span>
      )}
      <span className={loading ? 'button-text-loading' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;

