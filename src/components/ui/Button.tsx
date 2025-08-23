import React, { forwardRef } from 'react';

export interface ButtonVariants {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  gradient?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  tooltip?: string;
  badge?: number;
  as?: 'button' | 'a' | 'div';
  href?: string;
  target?: string;
}

const getButtonClasses = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  loading = false,
  disabled = false,
  gradient: _gradient = false,
  rounded = 'lg',
  shadow = 'sm',
  pulse = false
}: ButtonVariants) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';
  
  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1 min-h-[24px]',
    sm: 'px-3 py-2 text-sm gap-2 min-h-[32px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[36px]',
    lg: 'px-6 py-3 text-base gap-2 min-h-[44px]',
    xl: 'px-8 py-4 text-lg gap-3 min-h-[52px]'
  };
  
  // Rounded styles - เรียบง่ายขึ้น
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-lg',
    full: 'rounded-full'
  };
  
  // Shadow styles - เบาลง
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg'
  };
  
  // Variant styles - คล้ายเดิมแต่เก็บ functionality
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-0',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border-0',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-0',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 border-0',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-0',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-0',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500 border-0 shadow-none p-0'
  };
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // States - เรียบง่ายขึ้น
  const stateClasses = (disabled || loading) 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:shadow-md active:transform active:scale-95';
    
  // Pulse animation
  const pulseClasses = pulse ? 'animate-pulse' : '';
    
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${roundedClasses[rounded]} ${shadowClasses[shadow]} ${widthClasses} ${stateClasses} ${pulseClasses}`.trim();
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
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
  rounded,
  shadow,
  pulse,
  tooltip,
  badge,
  as = 'button',
  href,
  target,
  onClick,
  ...props 
}, ref) => {
  const buttonClasses = getButtonClasses({ variant, size, fullWidth, loading, disabled, gradient, rounded, shadow, pulse });
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  );
  
  // Badge component
  const BadgeComponent = ({ count }: { count: number }) => (
    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem]">
      {count > 99 ? '99+' : count}
    </span>
  );
  
  // Ripple effect - เรียบง่ายขึ้น
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  };
  
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      {badge && badge > 0 && <BadgeComponent count={badge} />}
    </>
  );
  
  // Handle different element types
  if (as === 'a' && href) {
    return (
      <a 
        href={href}
        target={target}
        className={`${buttonClasses} ${className} no-underline`}
        title={tooltip}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {buttonContent}
      </a>
    );
  }
  
  return (
    <button 
      ref={ref}
      className={`${buttonClasses} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

// Icon Button Component with improved functionality
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  notification?: boolean;
  notificationCount?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ 
  icon, 
  size = 'md',
  className = '',
  notification = false,
  notificationCount = 0,
  rounded = 'full',
  variant = 'ghost',
  ...props 
}, ref) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base', 
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl'
  };
  
  return (
    <Button 
      ref={ref}
      size={size}
      variant={variant}
      rounded={rounded}
      className={`${sizeClasses[size]} p-0 relative ${className}`}
      badge={notification && notificationCount > 0 ? notificationCount : undefined}
      {...props}
    >
      <span className="flex items-center justify-center">{icon}</span>
      
      {/* Simple notification dot */}
      {notification && notificationCount === 0 && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2" />
      )}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Button Group Component
export interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  orientation = 'horizontal',
  spacing = 'normal',
  className = ''
}) => {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };
  
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    loose: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4'
  };
  
  return (
    <div className={`inline-flex ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<ButtonProps>(child)) {
          return React.cloneElement(child, {
            variant: (child.props as ButtonProps).variant || variant,
            size: (child.props as ButtonProps).size || size,
            key: index
          });
        }
        return child;
      })}
    </div>
  );
};

// Floating Action Button Component
export interface FloatingActionButtonProps extends Omit<IconButtonProps, 'variant' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'md' | 'lg' | 'xl';
  extended?: boolean;
  label?: string;
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(({ 
  icon,
  position = 'bottom-right',
  size = 'lg',
  extended = false,
  label,
  className = '',
  ...props 
}, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };
  
  const sizeClasses = {
    md: extended ? 'h-12 px-4' : 'w-12 h-12',
    lg: extended ? 'h-14 px-6' : 'w-14 h-14',
    xl: extended ? 'h-16 px-8' : 'w-16 h-16'
  };
  
  return (
    <Button
      ref={ref}
      variant="primary"
      rounded="full"
      shadow="xl"
      className={`${positionClasses[position]} ${sizeClasses[size]} z-50 hover:scale-110 active:scale-95 ${className}`}
      leftIcon={extended ? icon : undefined}
      {...props}
    >
      {extended ? label : icon}
    </Button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';
