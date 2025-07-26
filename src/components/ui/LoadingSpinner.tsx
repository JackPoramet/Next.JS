import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'indigo' | 'green' | 'red' | 'gray';
  showLogo?: boolean;
}

export default function LoadingSpinner({ 
  message = 'กำลังโหลด...', 
  size = 'medium',
  color = 'indigo',
  showLogo = false 
}: LoadingSpinnerProps) {
  
  // กำหนดขนาด spinner
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16', 
    large: 'h-24 w-24'
  };

  // กำหนดสี spinner
  const colorClasses = {
    blue: 'border-blue-600',
    indigo: 'border-indigo-600',
    green: 'border-green-600', 
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {/* Logo (optional) */}
        {showLogo && (
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">⚡</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">IoT Energy</h2>
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div 
            className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
          ></div>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-lg">{message}</p>
        
        {/* Progress dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
}

// Pre-configured variants
export const AuthLoadingSpinner = () => (
  <LoadingSpinner 
    message="กำลังตรวจสอบสถานะการเข้าสู่ระบบ..." 
    size="large"
    color="indigo"
    showLogo={true}
  />
);

export const PageLoadingSpinner = () => (
  <LoadingSpinner 
    message="กำลังโหลดหน้าเว็บ..." 
    size="medium"
    color="blue"
  />
);

export const DataLoadingSpinner = () => (
  <LoadingSpinner 
    message="กำลังโหลดข้อมูล..." 
    size="small"
    color="gray"
  />
);
