import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'maintenance' | 'inactive' | 'error';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, showText = true, size = 'md', className = '' }: StatusBadgeProps) {
  const statusConfig = {
    online: {
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
      label: 'ออนไลน์',
      icon: '🟢'
    },
    offline: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      dot: 'bg-gray-400',
      label: 'ออฟไลน์',
      icon: '⚫'
    },
    maintenance: {
      bg: 'bg-yellow-100 dark:bg-yellow-950',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
      dot: 'bg-yellow-500',
      label: 'บำรุงรักษา',
      icon: '🟡'
    },
    inactive: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      dot: 'bg-gray-400',
      label: 'ไม่ใช้งาน',
      icon: '⚪'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-950',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
      label: 'ข้อผิดพลาด',
      icon: '🔴'
    }
  };

  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  if (!showText) {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full ${dotSizes[size]} ${config.dot} ${className}`}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      <div className={`rounded-full ${dotSizes[size]} ${config.dot}`} />
      {showText && (
        <span>{config.label}</span>
      )}
    </span>
  );
}
