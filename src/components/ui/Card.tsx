import React from 'react';

export interface CardVariants {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  status?: 'connected' | 'error' | 'checking' | 'disconnected' | 'neutral' | 'success' | 'warning';
  loading?: boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariants {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const getCardClasses = ({ 
  variant = 'default', 
  size = 'md', 
  interactive = false, 
  status,
  loading = false
}: CardVariants) => {
  const baseClasses = 'rounded-lg transition-all duration-200 relative overflow-hidden';
  
  // Size variations
  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-sm', 
    lg: 'p-8 text-base'
  };
  
  // Variant styles - คล้ายเดิม
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-md hover:shadow-lg border-0',
    outlined: 'bg-white border border-gray-300 shadow-none',
    filled: 'bg-gray-50 border border-gray-200 shadow-none'
  };
  
  // Interactive states - เรียบง่ายขึ้น
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
    : '';
    
  // Status colors - เรียบง่ายขึ้น
  const statusClasses = status ? (() => {
    switch (status) {
      case 'connected': 
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'error': 
        return 'border-l-4 border-red-500 bg-red-50';
      case 'checking':
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'disconnected': 
        return 'border-l-4 border-gray-400 bg-gray-50';
      default: 
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  })() : '';
  
  // Loading state
  const loadingClasses = loading ? 'animate-pulse opacity-75' : '';
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${interactiveClasses} ${statusClasses} ${loadingClasses}`.trim();
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant,
  size,
  interactive,
  status,
  loading,
  header,
  footer,
  onClick,
  ...props 
}) => {
  const cardClasses = getCardClasses({ variant, size, interactive, status, loading });
  
  return (
    <div 
      className={`${cardClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      } : undefined}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Header */}
      {header && (
        <div className="mb-4">
          {header}
        </div>
      )}
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
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
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '',
  align = 'left'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between'
  };
  
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 flex items-center ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// Stats Card Component
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  variant = 'default',
  loading = false,
  className = ''
}) => {
  const variantClasses = {
    default: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-amber-500', 
    error: 'border-l-red-500'
  };
  
  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  const trendIcons = {
    up: '📈',
    down: '📉', 
    neutral: '➡️'
  };
  
  return (
    <Card 
      variant="elevated" 
      className={`border-l-4 ${variantClasses[variant]} ${className}`}
      loading={loading}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {loading ? '---' : value}
          </p>
          
          {change && (
            <div className={`flex items-center text-sm ${trendClasses[change.trend]}`}>
              <span className="mr-1">{trendIcons[change.trend]}</span>
              <span className="font-semibold">{change.value}</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Metric Card Component
export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status = 'normal',
  icon,
  trend,
  className = ''
}) => {
  const statusColors = {
    normal: 'text-green-600 bg-green-50',
    warning: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50'
  };
  
  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };
  
  return (
    <Card variant="outlined" size="sm" className={`text-center ${className}`}>
      <div className="space-y-2">
        {icon && (
          <div className="text-xl">{icon}</div>
        )}
        
        <div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
            {trend && <span className="text-sm">{trendIcons[trend]}</span>}
          </div>
          
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
};
