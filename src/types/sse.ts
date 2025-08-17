// Types สำหรับ Server-Sent Events (SSE)

export interface SSEMessage {
  type: 'connection' | 'data' | 'heartbeat' | 'stats' | 'error';
  topic?: string;
  data?: any;
  timestamp: string;
  connectionId?: number;
  totalConnections?: number;
  message?: string;
  broadcast_time?: string;
  server_info?: {
    mqtt_broker: string;
    supported_topics: string[];
  };
  [key: string]: any;
}

export interface SSEConnectionStats {
  totalConnections: number;
  connectionCounter: number;
  serverStatus: 'running' | 'stopped';
  activeConnections: number;
}

export interface SSEConfig {
  heartbeatInterval?: number;
  maxConnections?: number;
  timeout?: number;
}

export interface SSEClient {
  id: number;
  controller: ReadableStreamDefaultController;
  connectedAt: string;
  lastHeartbeat?: string;
}
