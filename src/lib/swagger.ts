// OpenAPI 3.0 Specification for IoT Electric Energy Management System
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'IoT Electric Energy Management System API',
    version: '1.0.0',
    description: 'REST API สำหรับระบบจัดการพลังงานไฟฟ้า IoT แบบ Full-Stack',
    contact: {
      name: 'API Support',
      email: 'support@iot-energy.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /api/auth/login',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token stored in HttpOnly cookie',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'role'],
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
            example: 1,
          },
          name: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com',
          },
          role: {
            type: 'string',
            enum: ['admin', 'manager', 'user'],
            description: 'User role',
            example: 'user',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
          last_login: {
            type: 'string',
            format: 'date-time',
            description: 'Last login timestamp',
            nullable: true,
          },
        },
      },
      Device: {
        type: 'object',
        required: ['device_name', 'device_id', 'location', 'faculty', 'meter_type'],
        properties: {
          id: {
            type: 'integer',
            description: 'Device ID',
            example: 1,
          },
          device_name: {
            type: 'string',
            description: 'Device name',
            example: 'Smart Meter 001',
          },
          device_id: {
            type: 'string',
            description: 'Unique device identifier',
            example: 'SM001',
          },
          location: {
            type: 'string',
            description: 'Device installation location',
            example: 'Building A - Floor 1',
          },
          faculty: {
            type: 'string',
            enum: ['engineering', 'institution', 'liberal_arts', 'business_administration', 'architecture', 'industrial_education'],
            description: 'Faculty/Department',
            example: 'engineering',
          },
          meter_type: {
            type: 'string',
            enum: ['smart_meter', 'energy_monitor', 'power_analyzer'],
            description: 'Type of meter',
            example: 'smart_meter',
          },
          installation_date: {
            type: 'string',
            format: 'date',
            description: 'Installation date',
            example: '2024-01-15',
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'maintenance'],
            description: 'Device status',
            example: 'active',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Device creation timestamp',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'admin@iot-energy.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'Admin123!',
            minLength: 8,
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              token: {
                type: 'string',
                description: 'JWT access token',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          error: {
            type: 'string',
            description: 'Detailed error information',
            example: 'Invalid credentials',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User authentication',
        description: 'Authenticate user credentials and return JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              },
              examples: {
                admin: {
                  summary: 'Admin Login',
                  value: {
                    email: 'admin@iot-energy.com',
                    password: 'Admin123!'
                  }
                },
                manager: {
                  summary: 'Manager Login',
                  value: {
                    email: 'manager@iot-energy.com',
                    password: 'Manager123!'
                  }
                },
                user: {
                  summary: 'User Login',
                  value: {
                    email: 'user@iot-energy.com',
                    password: 'User123!'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - Missing credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Users retrieved successfully' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '403': {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/test-db': {
      get: {
        summary: 'Test database connection',
        description: 'Test PostgreSQL database connection and return connection details',
        tags: ['System Health'],
        responses: {
          '200': {
            description: 'Database connection test results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Database connection successful' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Database connection failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerSpec;
