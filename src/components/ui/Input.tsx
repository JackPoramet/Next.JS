import React from 'react';

export interface InputVariants {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'warning';
  fullWidth?: boolean;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, InputVariants {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  className?: string;
  wrapperClassName?: string;
  onClear?: () => void;
}

const getInputClasses = ({ 
  variant = 'default', 
  inputSize = 'md', 
  state = 'default', 
  fullWidth = false
}: InputVariants) => {
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';
  
  // Size variations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };
  
  // Variant styles - คล้ายเดิม
  const variantClasses = {
    default: 'border border-gray-300 bg-white hover:border-gray-400 shadow-sm',
    filled: 'border-0 bg-gray-100 hover:bg-gray-200 focus:bg-white',
    outlined: 'border-2 border-gray-400 bg-white hover:border-gray-500'
  };
  
  // State colors - เรียบง่ายขึ้น
  const stateClasses = {
    default: 'text-gray-800 focus:border-blue-500 focus:ring-blue-200',
    error: 'text-red-800 border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50',
    success: 'text-green-800 border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50',
    warning: 'text-yellow-800 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 bg-yellow-50'
  };
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return `${baseClasses} ${sizeClasses[inputSize]} ${variantClasses[variant]} ${stateClasses[state]} ${widthClasses}`.trim();
};

export const Input: React.FC<InputProps> = ({ 
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  loading = false,
  clearable = false,
  className = '',
  wrapperClassName = '',
  variant,
  inputSize,
  state,
  fullWidth,
  onClear,
  value,
  onChange,
  ...props 
}) => {
  const finalState = errorText ? 'error' : state;
  const inputClasses = getInputClasses({ variant, inputSize, state: finalState, fullWidth });
  
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <input 
          className={`${inputClasses} ${
            leftIcon ? 'pl-10' : ''
          } ${
            (rightIcon || loading || clearable) ? 'pr-10' : ''
          } ${className}`}
          value={value}
          onChange={onChange}
          {...props}
        />
        
        {/* Right side icons/controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          )}
          
          {clearable && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {rightIcon && !loading && (
            <div className="text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
      
      {/* Helper/Error Text */}
      {(helperText || errorText) && (
        <p className={`text-xs mt-2 ${errorText ? 'text-red-600' : 'text-gray-600'}`}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
};

// Textarea Component
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, InputVariants {
  label?: string;
  helperText?: string;
  errorText?: string;
  className?: string;
  wrapperClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label,
  helperText,
  errorText,
  className = '',
  wrapperClassName = '',
  variant,
  inputSize,
  state,
  fullWidth,
  ...props 
}) => {
  const textareaClasses = getInputClasses({ variant, inputSize, state: errorText ? 'error' : state, fullWidth });
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-bold text-gray-800 mb-3">
          {label}
        </label>
      )}
      
      <textarea 
        className={`${textareaClasses} ${className} resize-none`}
        {...props}
      />
      
      {(helperText || errorText) && (
        <p className={`text-xs mt-2 font-semibold ${errorText ? 'text-red-600' : 'text-gray-600'}`}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
};

// Select Component
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>, InputVariants {
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  children?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label,
  helperText,
  errorText,
  placeholder,
  options,
  children,
  className = '',
  wrapperClassName = '',
  variant,
  inputSize,
  state,
  fullWidth,
  ...props 
}) => {
  const selectClasses = getInputClasses({ variant, inputSize, state: errorText ? 'error' : state, fullWidth });
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-bold text-gray-800 mb-3">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select 
          className={`${selectClasses} ${className} appearance-none cursor-pointer pr-10`}
          {...props}
        >
          {placeholder && (
            <option value="" className="font-semibold text-gray-700">
              {placeholder}
            </option>
          )}
          
          {options ? (
            options.map((option, index) => (
              <option 
                key={index} 
                value={option.value} 
                disabled={option.disabled}
                className="font-medium text-gray-700"
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(helperText || errorText) && (
        <p className={`text-xs mt-2 font-semibold ${errorText ? 'text-red-600' : 'text-gray-600'}`}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
};
