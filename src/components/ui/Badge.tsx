import React from 'react';

// Badge Component
export interface BadgeVariants {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  rounded?: boolean;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariants {
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

const getBadgeClasses = ({ variant = 'default', size = 'md', outline = false, rounded = false }: BadgeVariants) => {
  const baseClasses = 'inline-flex items-center font-bold transition-all duration-300';
  
  // Size variations
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2'
  };
  
  // Shape
  const shapeClasses = rounded ? 'rounded-full' : 'rounded-lg';
  
  // Variant styles
  const variantClasses = outline ? {
    default: 'text-gray-800 border border-gray-300 bg-transparent',
    primary: 'text-blue-700 border border-blue-300 bg-transparent',
    secondary: 'text-purple-700 border border-purple-300 bg-transparent',
    success: 'text-green-700 border border-green-300 bg-transparent',
    warning: 'text-yellow-700 border border-yellow-300 bg-transparent',
    error: 'text-red-700 border border-red-300 bg-transparent',
    info: 'text-blue-700 border border-blue-300 bg-transparent'
  } : {
    default: 'text-gray-800 bg-gray-100',
    primary: 'text-blue-700 bg-blue-100',
    secondary: 'text-purple-700 bg-purple-100',
    success: 'text-green-700 bg-green-100',
    warning: 'text-yellow-700 bg-yellow-100',
    error: 'text-red-700 bg-red-100',
    info: 'text-blue-700 bg-blue-100'
  };
  
  return `${baseClasses} ${sizeClasses[size]} ${shapeClasses} ${variantClasses[variant]}`.trim();
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  icon,
  className = '', 
  variant,
  size,
  outline,
  rounded,
  ...props 
}) => {
  const badgeClasses = getBadgeClasses({ variant, size, outline, rounded });
  
  return (
    <span className={`${badgeClasses} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// Status Indicator Component
export interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'error' | 'checking' | 'warning';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', gap: 'gap-2' },
    md: { dot: 'w-3 h-3', text: 'text-sm', gap: 'gap-3' },
    lg: { dot: 'w-4 h-4', text: 'text-base', gap: 'gap-3' }
  };
  
  const statusConfig = {
    connected: { 
      color: 'bg-green-500', 
      icon: '✅', 
      label: label || 'Connected',
      textColor: 'text-green-700'
    },
    disconnected: { 
      color: 'bg-gray-500', 
      icon: '⏸️', 
      label: label || 'Disconnected',
      textColor: 'text-gray-800'
    },
    error: { 
      color: 'bg-red-500', 
      icon: '❌', 
      label: label || 'Error',
      textColor: 'text-red-700'
    },
    checking: { 
      color: 'bg-yellow-500 animate-pulse', 
      icon: '🔄', 
      label: label || 'Checking',
      textColor: 'text-yellow-700'
    },
    warning: { 
      color: 'bg-orange-500', 
      icon: '⚠️', 
      label: label || 'Warning',
      textColor: 'text-orange-700'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-center ${sizeClasses[size].gap} ${className}`}>
      <div className={`${sizeClasses[size].dot} rounded-full shadow-lg ${config.color}`}></div>
      
      {showIcon && (
        <span className={sizeClasses[size].text}>{config.icon}</span>
      )}
      
      {showLabel && (
        <span className={`${sizeClasses[size].text} font-bold ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// Message Count Badge Component
export interface MessageCountProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const MessageCount: React.FC<MessageCountProps> = ({ 
  count, 
  maxCount = 999,
  size = 'md',
  variant = 'primary',
  className = '' 
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 min-w-[1.5rem] h-6',
    md: 'text-xs px-3 py-1 min-w-[2rem] h-7',
    lg: 'text-sm px-4 py-2 min-w-[2.5rem] h-8'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-purple-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white'
  };
  
  if (count === 0) return null;
  
  return (
    <span className={`
      inline-flex items-center justify-center font-bold rounded-full shadow-md
      ${sizeClasses[size]} ${variantClasses[variant]} ${className}
    `}>
      {displayCount}
    </span>
  );
};
