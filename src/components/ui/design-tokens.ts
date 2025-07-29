// Design Tokens for IoT Energy Management System
export const designTokens = {
  // Colors
  colors: {
    // Status Colors
    status: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7', 
        600: '#16a34a',
        700: '#15803d',
        border: '#bbf7d0'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        600: '#dc2626', 
        700: '#b91c1c',
        border: '#fecaca'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        600: '#d97706',
        700: '#b45309', 
        border: '#fed7aa'
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        600: '#2563eb',
        700: '#1d4ed8',
        border: '#93c5fd'
      },
      neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        600: '#4b5563',
        700: '#374151',
        border: '#d1d5db'
      }
    },
    
    // Primary System Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Secondary Colors  
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    
    // Accent Colors
    accent: {
      orange: { 600: '#ea580c', 700: '#c2410c' },
      green: { 600: '#16a34a', 700: '#15803d' },
      purple: { 600: '#9333ea', 700: '#7c3aed' },
      indigo: { 600: '#4f46e5', 700: '#4338ca' }
    },
    
    // Gray Scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625'
    }
  },
  
  // Spacing
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem', 
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },
  
  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  
  // Transitions
  transition: {
    default: 'all 0.3s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.5s ease-in-out'
  },
  
  // Z-Index
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1100,
    notification: 1200
  }
} as const;

// Helper function to get status colors
export const getStatusColorClasses = (status: 'connected' | 'error' | 'checking' | 'disconnected') => {
  switch (status) {
    case 'connected':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'checking':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Helper function to get status colors for custom styled divs
export const getStatusColor = (status: 'connected' | 'error' | 'checking' | 'disconnected') => {
  switch (status) {
    case 'connected':
      return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800';
    case 'error':
      return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800';
    case 'checking':
      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800';
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-800';
  }
};

// Helper function to get status icons
export const getStatusIcon = (status: 'connected' | 'error' | 'checking' | 'disconnected') => {
  switch (status) {
    case 'connected': return '✅';
    case 'error': return '❌';
    case 'checking': return '🔄';
    default: return '⏸️';
  }
};
