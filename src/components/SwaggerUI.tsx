'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues and React strict mode warnings
const SwaggerUI = dynamic(
  () => import('swagger-ui-react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    )
  }
);

interface SwaggerUIComponentProps {
  spec?: Record<string, unknown>;
  url?: string;
}

export default function SwaggerUIComponent({ spec, url }: SwaggerUIComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Memoize the Swagger UI configuration to prevent unnecessary re-renders
  const swaggerConfig = useMemo(() => ({
    spec,
    url,
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    defaultModelRendering: "example" as const,
    displayRequestDuration: true,
    docExpansion: "list" as const,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'] as ('trace' | 'delete' | 'get' | 'head' | 'options' | 'post' | 'put' | 'patch')[],
    validatorUrl: null, // Disable validator to avoid CORS issues
    persistAuthorization: true,
    layout: "BaseLayout" as const,
    plugins: [],
    presets: []
  }), [spec, url]);

  // Use useCallback to prevent function recreation on every render
  const handleStylesSetup = useCallback(() => {
    // Add CSS link for Swagger UI (only if not already added)
    let link = document.querySelector('link[href*="swagger-ui.css"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.28.0/swagger-ui.css';
      document.head.appendChild(link);
    }
    
    // Override some Swagger UI styles for better integration (only if not already added)
    let style = document.querySelector('#swagger-ui-custom-styles') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'swagger-ui-custom-styles';
      style.textContent = `
        .swagger-ui .topbar { display: none !important; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .scheme-container { 
          background: #fafafa; 
          padding: 10px; 
          border-radius: 4px; 
          margin: 10px 0;
        }
        .swagger-ui .btn.authorize { 
          background-color: #3b82f6 !important; 
          border-color: #3b82f6 !important;
          color: white !important;
        }
        .swagger-ui .btn.authorize:hover { 
          background-color: #2563eb !important; 
          border-color: #2563eb !important;
        }
        .swagger-ui .swagger-ui { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        /* Suppress React strict mode warnings for deprecated lifecycle methods in Swagger UI */
        .swagger-ui * {
          will-change: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Cleanup is handled by the component lifecycle, not needed here
    };
  }, []);

  useEffect(() => {
    handleStylesSetup();
  }, [handleStylesSetup]);

  if (!spec && !url) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="swagger-ui-container bg-white">
      <SwaggerUI {...swaggerConfig} />
    </div>
  );
}
