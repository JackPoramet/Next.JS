import React from 'react';
import { designTokens } from './design-tokens';

export interface CardVariants {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  status?: 'connected' | 'error' | 'checking' | 'disconnected' | 'neutral';
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariants {
  children: React.ReactNode;
  className?: string;
}

const getCardClasses = ({ variant = 'default', size = 'md', interactive = false, status }: CardVariants) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  // Size variations
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  };
  
  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-md',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };
  
  // Interactive states
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-xl hover:scale-105 transform' 
    : '';
    
  // Status colors
  const statusClasses = status ? (() => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'checking': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disconnected': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  })() : '';
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${interactiveClasses} ${statusClasses}`.trim();
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant,
  size,
  interactive,
  status,
  onClick,
  ...props 
}) => {
  const cardClasses = getCardClasses({ variant, size, interactive, status });
  
  return (
    <div 
      className={`${cardClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// Card Title Component
export interface CardTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  size = 'md', 
  icon,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };
  
  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size]} text-gray-900 ${className}`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <h3>{children}</h3>
    </div>
  );
};

// Card Content Component
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`flex-1 ${className}`}>
    {children}
  </div>
);

// Card Footer Component
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);
