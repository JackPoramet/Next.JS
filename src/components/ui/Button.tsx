import React from 'react';

export interface ButtonVariants {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  gradient?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
  className?: string;
}

const getButtonClasses = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  loading = false,
  disabled = false,
  gradient = false 
}: ButtonVariants) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg';
  
  // Size variations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-sm gap-3',
    lg: 'px-8 py-4 text-base gap-3',
    xl: 'px-10 py-5 text-lg gap-4'
  };
  
  // Variant styles
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: gradient
      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500'
      : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    success: gradient
      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500'
      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500'
      : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    error: gradient
      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500'
  };
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // States
  const stateClasses = (disabled || loading) 
    ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' 
    : '';
    
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${stateClasses}`.trim();
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  leftIcon,
  rightIcon,
  className = '', 
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  gradient,
  ...props 
}) => {
  const buttonClasses = getButtonClasses({ variant, size, fullWidth, loading, disabled, gradient });
  
  return (
    <button 
      className={`${buttonClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      
      {!loading && leftIcon && <span>{leftIcon}</span>}
      
      <span>{children}</span>
      
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: string;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base', 
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl'
  };
  
  return (
    <Button 
      size={size}
      className={`${sizeClasses[size]} p-0 ${className}`}
      {...props}
    >
      <span>{icon}</span>
    </Button>
  );
};
