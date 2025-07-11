import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        {...props}
      />
      
      {error && (
        <span className="input-error">{error}</span>
      )}
    </div>
  );
};

export default Input;

