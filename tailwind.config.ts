import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: false, // ปิด dark mode สมบูรณ์
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        
        // Energy System Colors
        energy: {
          active: '#16a34a',
          warning: '#d97706',
          critical: '#dc2626',
          inactive: '#6b7280',
          neutral: '#f3f4f6'
        },
        
        // Status Colors
        status: {
          online: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d'
          },
          offline: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c'
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309'
          }
        },
        
        // Surface Colors
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          elevated: '#ffffff',
          'elevated-dark': '#1f2937'
        },
        
        // Dashboard specific
        dashboard: {
          sidebar: '#1f2937',
          'sidebar-hover': '#374151',
          card: '#ffffff',
          'card-dark': '#1f2937'
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace']
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'sidebar': '20rem',
        'content': 'calc(100vw - 20rem)'
      },
      
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-yellow': 'pulse-yellow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite'
      },
      
      keyframes: {
        'pulse-green': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.1)'
          }
        },
        'pulse-yellow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
          },
          '50%': { 
            opacity: '0.7',
            boxShadow: '0 0 0 6px rgba(245, 158, 11, 0.1)'
          }
        },
        'pulse-red': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 0 6px rgba(239, 68, 68, 0.1)'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 32px -8px rgba(0, 0, 0, 0.15)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)'
      },
      
      backdropBlur: {
        xs: '2px'
      },
      
      screens: {
        'xs': '475px',
        '3xl': '1920px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for component classes
    function({ addComponents, theme }: { addComponents: any; theme: any }) {
      addComponents({
        // Button Components
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          borderRadius: theme('borderRadius.lg'),
          '&:disabled': {
            opacity: theme('opacity.50'),
            cursor: 'not-allowed'
          },
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringOffsetWidth: '2px'
          }
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.brand.600'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.brand.700')
          },
          '&:focus': {
            ringColor: theme('colors.brand.500')
          }
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.100'),
          color: theme('colors.gray.900'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.200')
          },
          '&:focus': {
            ringColor: theme('colors.gray.500')
          }
        },
        
        // Status Badge Components
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          paddingLeft: theme('spacing.2'),
          paddingRight: theme('spacing.2'),
          paddingTop: theme('spacing.1'),
          paddingBottom: theme('spacing.1'),
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium')
        },
        
        '.badge-online': {
          backgroundColor: theme('colors.status.online.100'),
          color: theme('colors.status.online.800')
        },
        
        '.badge-offline': {
          backgroundColor: theme('colors.status.offline.100'),
          color: theme('colors.status.offline.800')
        },
        
        // Card Components
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.soft'),
          border: `1px solid ${theme('colors.gray.200')}`
        },
        
        '.card-hover': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme('boxShadow.medium'),
            transform: 'translateY(-1px)'
          }
        },
        
        // Status Indicators
        '.status-indicator': {
          width: theme('spacing.3'),
          height: theme('spacing.3'),
          borderRadius: theme('borderRadius.full')
        },
        
        '.status-online': {
          backgroundColor: theme('colors.status.online.500'),
          animation: 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        },
        
        '.status-offline': {
          backgroundColor: theme('colors.status.offline.500')
        },
        
        '.status-warning': {
          backgroundColor: theme('colors.status.warning.500'),
          animation: 'pulse-yellow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }
      })
    }
  ],
}

export default config
