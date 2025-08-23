import React from 'react';

// Progress Bar Component
export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  showPercentage = false,
  label,
  className = '',
  animated = false,
  striped = false,
  indeterminate = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };
  
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    error: 'bg-red-600',
    info: 'bg-cyan-600'
  };
  
  const backgroundClasses = {
    default: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
    info: 'bg-cyan-100'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Value */}
      {(label || showValue || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          <div className="flex items-center space-x-2">
            {showValue && (
              <span className="text-sm font-medium text-gray-600">
                {value}/{max}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className={`
        w-full rounded-full overflow-hidden
        ${sizeClasses[size]} ${backgroundClasses[variant]}
      `}>
        <div
          className={`
            h-full transition-all duration-500 ease-out rounded-full relative
            ${variantClasses[variant]}
            ${animated ? 'transition-all duration-1000' : ''}
            ${striped ? 'bg-stripes' : ''}
            ${indeterminate ? 'animate-pulse' : ''}
          `}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            animation: indeterminate ? 'indeterminate 2s linear infinite' : undefined
          }}
        >
          {/* Animated stripes */}
          {striped && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .bg-stripes {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
          animation: stripes 1s linear infinite;
        }
        
        @keyframes stripes {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
      `}</style>
    </div>
  );
};

// Circular Progress Component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  indeterminate?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showValue = false,
  showPercentage = true,
  label,
  className = '',
  animated = true,
  indeterminate = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const variantClasses = {
    default: 'stroke-blue-600',
    success: 'stroke-green-600',
    warning: 'stroke-amber-500',
    error: 'stroke-red-600',
    info: 'stroke-cyan-600'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${animated ? 'transition-all duration-1000' : ''}`}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
          strokeLinecap="round"
          className={`${variantClasses[variant]} transition-all duration-1000 ease-out`}
          style={{
            animation: indeterminate ? 'circular-dash 2s linear infinite' : undefined
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(percentage)}%
          </span>
        )}
        {showValue && (
          <span className="text-sm text-gray-600">
            {value}/{max}
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 mt-1">
            {label}
          </span>
        )}
      </div>
      
      <style jsx>{`
        @keyframes circular-dash {
          0% {
            stroke-dasharray: 0 ${circumference};
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: ${circumference * 0.3} ${circumference};
            stroke-dashoffset: ${-circumference * 0.15};
          }
          100% {
            stroke-dasharray: 0 ${circumference};
            stroke-dashoffset: ${-circumference};
          }
        }
      `}</style>
    </div>
  );
};

// Step Progress Component
export interface StepProgressProps {
  steps: Array<{
    label: string;
    description?: string;
    status: 'completed' | 'current' | 'pending' | 'error';
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'horizontal',
  className = ''
}) => {
  const statusConfig = {
    completed: {
      icon: '✅',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      lineColor: 'bg-green-500'
    },
    current: {
      icon: '🔄',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      lineColor: 'bg-gray-300'
    },
    pending: {
      icon: '⏳',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-600',
      lineColor: 'bg-gray-300'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      lineColor: 'bg-gray-300'
    }
  };

  return (
    <div className={`${className}`}>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center'}`}>
        {steps.map((step, index) => {
          const config = statusConfig[step.status];
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className={`
              flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col'} items-center
              ${orientation === 'vertical' ? 'w-full' : 'flex-1'}
            `}>
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${config.bgColor} ${config.borderColor}
                ${orientation === 'vertical' ? 'flex-shrink-0 mr-4' : 'mb-2'}
              `}>
                <span className="text-sm">{config.icon}</span>
              </div>
              
              {/* Step Content */}
              <div className={`
                ${orientation === 'vertical' ? 'flex-1' : 'text-center'}
              `}>
                <p className={`text-sm font-medium ${config.textColor}`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
              
              {/* Connecting Line */}
              {!isLast && (
                <div className={`
                  ${config.lineColor}
                  ${orientation === 'vertical' 
                    ? 'w-0.5 h-8 ml-5 my-2' 
                    : 'h-0.5 flex-1 mx-4'
                  }
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};