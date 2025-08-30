// Utility to suppress specific React warnings in development mode
export function suppressReactWarnings() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Store the original console methods
    const originalWarn = console.warn;
    const originalError = console.error;

    // List of warnings to suppress
    const suppressWarnings = [
      'UNSAFE_componentWillReceiveProps',
      'componentWillReceiveProps',
      'componentWillMount',
      'componentWillUpdate',
      'Using UNSAFE_componentWillReceiveProps in strict mode',
      'ModelCollapse',
      'OperationContainer'
    ];

    // Override console.warn
    console.warn = (...args: unknown[]) => {
      const message = args.join(' ');
      const shouldSuppress = suppressWarnings.some(warning => 
        message.includes(warning)
      );
      
      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    // Override console.error for warnings that come through error
    console.error = (...args: unknown[]) => {
      const message = args.join(' ');
      const shouldSuppress = suppressWarnings.some(warning => 
        message.includes(warning)
      );
      
      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Restore original methods on cleanup (optional)
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }
  
  return () => {}; // Return empty cleanup function for non-dev environments
}

// Simpler approach: Just suppress console warnings related to Swagger UI
export function initWarningSuppressionForSwagger() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalConsoleWarn = console.warn;
    
    console.warn = function(...args: unknown[]) {
      const message = String(args[0] || '');
      
      // Suppress specific Swagger UI related warnings
      if (message.includes('UNSAFE_componentWillReceiveProps') || 
          message.includes('ModelCollapse') ||
          message.includes('OperationContainer')) {
        return; // Don't log these warnings
      }
      
      // Log all other warnings normally
      return originalConsoleWarn.apply(console, args);
    };
  }
}
