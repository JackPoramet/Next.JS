import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with commas for better readability
 */
export function formatNumber(num: number | string): string {
  const numStr = typeof num === 'string' ? num : num.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return count === 1 
        ? `1 ${interval.label} ago` 
        : `${count} ${interval.label}s ago`;
    }
  }
  
  return 'just now';
}

/**
 * Get status color classes based on theme
 */
export function getStatusColors(status: string, variant: 'badge' | 'text' | 'bg' = 'badge') {
  const statusMap: Record<string, Record<string, string>> = {
    online: {
      badge: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/20'
    },
    offline: {
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-800/20'
    },
    warning: {
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20'
    },
    error: {
      badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/20'
    },
    success: {
      badge: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/20'
    },
    info: {
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    }
  };
  
  return statusMap[status]?.[variant] || statusMap.offline[variant];
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
