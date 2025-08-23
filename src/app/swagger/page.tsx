'use client';

import { useEffect, useState } from 'react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending' | number;
  data?: Record<string, unknown> | string | null;
  error?: string;
  timestamp: string;
  endpoint?: string;
  method?: string;
  statusText?: string;
  responseTime?: string;
  success?: boolean;
}

interface _SwaggerSpec {
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  servers?: Array<{
    url?: string;
  }>;
}

// API Tester Component
function APITester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Database Test',
      endpoint: '/api/test-db',
      method: 'GET',
      description: 'Test PostgreSQL database connection',
      requiresAuth: false
    },
    {
      name: 'Health Check',
      endpoint: '/api/health-check',
      method: 'GET', 
      description: 'Check overall system health',
      requiresAuth: false
    },
    {
      name: 'SSE Status',
      endpoint: '/api/sse-status',
      method: 'GET',
      description: 'Check Server-Sent Events service status',
      requiresAuth: false
    },
    {
      name: 'MQTT Status',
      endpoint: '/api/mqtt-status',
      method: 'GET',
      description: 'Check MQTT service connection status',
      requiresAuth: false
    }
  ];

  const testAPI = async (endpoint: string, method: string = 'GET') => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const data = await response.json();
      
      const result: TestResult = {
        name: `${method} ${endpoint}`,
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        data,
        success: response.ok,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const result: TestResult = {
        name: `${method} ${endpoint}`,
        endpoint,
        method,
        status: 0,
        statusText: 'Network Error',
        responseTime: `${responseTime}ms`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setTestResults([]);
    for (const test of testEndpoints) {
      await testAPI(test.endpoint, test.method);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-900">🧪 API Endpoint Testing</h4>
        <button
          onClick={testAllEndpoints}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test All'}
        </button>
      </div>

      {/* Quick Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {testEndpoints.map((test, index) => (
          <button
            key={index}
            onClick={() => testAPI(test.endpoint, test.method)}
            disabled={isLoading}
            className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-left disabled:opacity-50"
            title={test.description}
          >
            <div className="font-bold text-gray-900">{test.name}</div>
            <div className="text-gray-700 font-medium">{test.method} {test.endpoint}</div>
          </button>
        ))}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-800">Recent Test Results:</h5>
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded text-xs border-l-4 ${
                result.success 
                  ? 'bg-green-50 border-green-400 text-green-900'
                  : 'bg-red-50 border-red-400 text-red-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">
                  {result.method} {result.endpoint}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  {result.responseTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Status: {result.status} {result.statusText}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-700 hover:text-gray-900 font-semibold">
                    View Response Data
                  </summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto font-medium">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && (
        <div className="text-center py-4 text-gray-600 text-xs font-medium">
          Click &quot;Test All&quot; or individual endpoint buttons to start testing
        </div>
      )}
    </div>
  );
}

export default function SwaggerPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<_SwaggerSpec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/swagger');
        
        if (!response.ok) {
          throw new Error(`Failed to load API spec: ${response.status} ${response.statusText}`);
        }
        
        const spec = await response.json();
        setSwaggerSpec(spec);
      } catch (err) {
        console.error('Error loading Swagger spec:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwaggerSpec();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Documentation Error</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                📚 API Documentation
              </h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-900 text-xs font-semibold rounded-full">
                OpenAPI 3.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 text-sm font-semibold"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI Alternative - Simple API List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {swaggerSpec && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {swaggerSpec.info?.title || 'API Documentation'}
              </h2>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                {swaggerSpec.info?.description || 'API documentation for IoT Energy Management System'}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-yellow-900">
                      Swagger UI Not Available
                    </h3>
                    <div className="mt-2 text-sm text-yellow-800 font-medium">
                      <p>
                        Interactive Swagger UI is temporarily unavailable. Below is the basic API information. 
                        For full interactive testing, please use tools like Postman or curl.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-3">Server Information</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-semibold text-gray-800"><strong>Base URL:</strong> {swaggerSpec.servers?.[0]?.url || 'http://localhost:3000'}</p>
                    <p className="font-semibold text-gray-800"><strong>Version:</strong> {swaggerSpec.info?.version || '1.0.0'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-3">Authentication</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-semibold text-gray-800"><strong>Type:</strong> Bearer Token (JWT)</p>
                    <p className="font-semibold text-gray-800"><strong>Header:</strong> Authorization: Bearer &lt;your_token&gt;</p>
                    <p className="font-semibold text-gray-800"><strong>Login Endpoint:</strong> POST /api/auth/login</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-3">🧪 API Testing Console</h3>
                  <APITester />
                </div>

                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-3">API Endpoints</h3>
                  <div className="space-y-2">
                    {[
                      { method: 'POST', path: '/api/auth/login', desc: 'User authentication' },
                      { method: 'GET', path: '/api/auth/me', desc: 'Get current user info' },
                      { method: 'GET', path: '/api/users', desc: 'Get all users (Admin only)' },
                      { method: 'POST', path: '/api/users', desc: 'Create new user (Admin only)' },
                      { method: 'GET', path: '/api/devices', desc: 'Get all devices' },
                      { method: 'POST', path: '/api/devices', desc: 'Create new device' },
                      { method: 'GET', path: '/api/profile', desc: 'Get user profile' },
                      { method: 'PUT', path: '/api/profile', desc: 'Update user profile' },
                      { method: 'GET', path: '/api/test-db', desc: 'Test database connection' },
                      { method: 'GET', path: '/api/sse-status', desc: 'SSE service status' },
                    ].map((endpoint, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-900' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-900' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="ml-3 font-mono text-sm text-gray-800 font-semibold">{endpoint.path}</span>
                        <span className="ml-auto text-sm text-gray-700 font-medium">{endpoint.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-3">Example Usage</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm font-medium">
{`# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@iot-energy.com","password":"Admin123!"}'

# Use the token for authenticated requests
curl -X GET http://localhost:3000/api/users \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-700 font-semibold">
            <p>
              IoT Electric Energy Management System API Documentation
              <span className="mx-2">•</span>
              Built with Next.js 15
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
