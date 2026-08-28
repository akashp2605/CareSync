import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
