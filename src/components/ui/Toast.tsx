import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  onClose: (id: string) => void;
  persistent?: boolean;
  icon?: React.ReactNode;
}

// Toast Component
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  actions,
  onClose,
  persistent = false,
  icon
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);

    // Auto dismiss
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: icon || '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      titleColor: 'text-green-900',
      iconBg: 'bg-green-100'
    },
    error: {
      icon: icon || '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      titleColor: 'text-red-900',
      iconBg: 'bg-red-100'
    },
    warning: {
      icon: icon || '⚠️',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      titleColor: 'text-amber-900',
      iconBg: 'bg-amber-100'
    },
    info: {
      icon: icon || 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-900',
      iconBg: 'bg-blue-100'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        max-w-sm w-full shadow-lg rounded-xl border pointer-events-auto overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${config.bgColor} ${config.borderColor}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg} mr-3`}>
            <span className="text-sm">{config.icon}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                {title}
              </p>
            )}
            <p className={`text-sm ${config.textColor}`}>
              {message}
            </p>
            
            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-colors
                      ${action.variant === 'primary' 
                        ? `${config.textColor} bg-white hover:bg-gray-50 border border-current` 
                        : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress Bar for auto-dismiss */}
      {!persistent && duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${config.bgColor.replace('50', '200')} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container
export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className = ''
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`
      fixed z-50 pointer-events-none
      ${positionClasses[position]}
      ${className}
    `}>
      <div className="space-y-3" id="toast-container" />
    </div>
  );
};

// Toast Hook
export interface ToastOptions extends Omit<ToastProps, 'id' | 'onClose'> {
  id?: string;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode; position?: ToastPosition }> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (options: ToastOptions): string => {
    const id = options.id || `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastProps = {
      ...options,
      id,
      position,
      onClose: removeToast
    };
    
    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <>
          <ToastContainer position={position} />
          <div className={`
            fixed z-50 pointer-events-none
            ${{
              'top-right': 'top-4 right-4',
              'top-left': 'top-4 left-4',
              'bottom-right': 'bottom-4 right-4',
              'bottom-left': 'bottom-4 left-4',
              'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
              'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
            }[position]}
          `}>
            <div className="space-y-3">
              {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { addToast, removeToast, clearAllToasts } = context;

  return {
    success: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'success', message }),
    error: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'error', message }),
    warning: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'warning', message }),
    info: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'info', message }),
    custom: (options: ToastOptions) => addToast(options),
    dismiss: removeToast,
    clear: clearAllToasts
  };
};