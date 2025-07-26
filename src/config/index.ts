// Central Configuration Exports
export { dbConfig, DATABASE_URL } from './database';
export { default as appConfig } from './app';

// Type definitions for configurations
export interface DatabaseConfig {
  connectionString: string | undefined;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;
  port: number;
  host: string;
  jwtSecret: string | undefined;
  jwtExpiresIn: string;
  nextAuthSecret: string | undefined;
  nextAuthUrl: string | undefined;
  baseUrl: string;
  apiUrl: string;
}
