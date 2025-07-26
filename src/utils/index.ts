// Utility Functions Exports
export * from './date';
export * from './string';
export * from './validation';

// API Response utilities
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
) => {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
};

export const createErrorResponse = (error: string, statusCode: number = 400) => {
  return {
    success: false,
    error,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

export const createSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};
