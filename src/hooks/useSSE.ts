'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { exponentialBackoff, jitter } from '../utils/debounce';
import type { SSEMessage } from '../types/sse';

interface UseSSEOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

interface UseSSEReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: SSEMessage | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  connectionStats: {
    totalConnections: number;
    connectionId?: number;
  };
}

export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const {
    url = '/api/sse',
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    onOpen,
    onMessage,
    onError,
    onClose
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStats, setConnectionStats] = useState({
    totalConnections: 0,
    connectionId: undefined as number | undefined
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const isConnectingRef = useRef(false);
  const lastConnectAttemptRef = useRef(0);
  const minReconnectDelayRef = useRef(2000); // ป้องกัน rapid reconnection
  const hasInitializedRef = useRef(false); // ป้องกัน React StrictMode double mount
  
  // ใช้ useRef เพื่อเก็บ callbacks ป้องกัน re-creation
  const callbacksRef = useRef({
    onOpen,
    onMessage,
    onError,
    onClose
  });

  // อัปเดต callbacks ใน ref เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    callbacksRef.current = {
      onOpen,
      onMessage,
      onError,
      onClose
    };
  }, [onOpen, onMessage, onError, onClose]);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // ป้องกันการสร้าง connection ซ้ำ
    if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      console.log('⚠️ SSE already connected, skipping connection attempt');
      return;
    }
    
    // ป้องกัน rapid reconnection
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectAttemptRef.current;
    if (timeSinceLastAttempt < minReconnectDelayRef.current && isConnectingRef.current) {
      console.log(`⏳ Too soon to reconnect (${timeSinceLastAttempt}ms < ${minReconnectDelayRef.current}ms), skipping...`);
      return;
    }
    
    // ป้องกันการ connect พร้อมกัน
    if (isConnectingRef.current) {
      console.log('⚠️ Already attempting to connect, skipping...');
      return;
    }
    
    lastConnectAttemptRef.current = now;
    isConnectingRef.current = true;
    
    // ปิด connection เดิมก่อน (ถ้ามี)
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    console.log('🔗 Connecting to SSE at:', url);
    setConnectionStatus('connecting');
    setError(null);

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        
        console.log('✅ SSE connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
        
        // Clear any pending reconnect timeouts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        callbacksRef.current.onOpen?.();
      };

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // อัปเดตสถิติ connection
          if (message.type === 'connection' || message.type === 'heartbeat') {
            setConnectionStats({
              totalConnections: message.totalConnections || 0,
              connectionId: message.connectionId
            });
          }
          
          callbacksRef.current.onMessage?.(message);
        } catch (parseError) {
          console.error('❌ Error parsing SSE message:', parseError);
          console.error('Raw data:', event.data);
        }
      };

      eventSource.onerror = (event) => {
        if (!isMountedRef.current) return;
        
        console.error('❌ SSE connection error:', event);
        setIsConnected(false);
        isConnectingRef.current = false;
        
        // ตรวจสอบสถานะ EventSource ก่อน
        const readyState = eventSource.readyState;
        console.log('📊 EventSource readyState:', readyState);
        
        // ปิด connection ที่เสียหาย
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
        
        // ป้องกันการ reconnect ซ้ำซ้อน
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        setConnectionStatus('error');
        setError('Connection error occurred');
        
        callbacksRef.current.onError?.(event);
        
        // ป้องกัน rapid reconnection - เพิ่ม minimum delay
        const timeSinceLastAttempt = Date.now() - lastConnectAttemptRef.current;
        if (timeSinceLastAttempt < minReconnectDelayRef.current) {
          console.log(`⏳ Delaying reconnect due to rapid reconnection prevention`);
          setTimeout(() => {
            if (isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
              reconnectAttemptsRef.current++;
              const baseDelay = exponentialBackoff(reconnectAttemptsRef.current - 1, reconnectInterval);
              const backoffDelay = jitter(baseDelay, 0.1);
              
              console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${Math.round(backoffDelay)}ms...`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && !eventSourceRef.current) {
                  connect();
                }
              }, backoffDelay);
            }
          }, minReconnectDelayRef.current);
          return;
        }
        
        // Auto-reconnect logic with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          // ใช้ exponential backoff พร้อม jitter เพื่อป้องกัน thundering herd
          const baseDelay = exponentialBackoff(reconnectAttemptsRef.current - 1, reconnectInterval);
          const backoffDelay = jitter(baseDelay, 0.1);
          
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${Math.round(backoffDelay)}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !eventSourceRef.current) {
              connect();
            }
          }, backoffDelay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          setConnectionStatus('disconnected');
        }
      };

    } catch (connectionError) {
      console.error('❌ Failed to create SSE connection:', connectionError);
      setConnectionStatus('error');
      setError(connectionError instanceof Error ? connectionError.message : 'Unknown connection error');
    }
  }, [url]); // ลบ dependencies ที่ไม่จำเป็น

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting SSE connection');
    
    // ป้องกัน reconnection
    isConnectingRef.current = false;
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close EventSource
    if (eventSourceRef.current) {
      // ตรวจสอบสถานะก่อนปิด
      if (eventSourceRef.current.readyState !== EventSource.CLOSED) {
        eventSourceRef.current.close();
      }
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setError(null);
    callbacksRef.current.onClose?.();
  }, []); // ลบ onClose dependency

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    
    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    lastConnectAttemptRef.current = 0;
    
    // Force disconnect first
    disconnect();
    
    // Wait a bit before reconnecting to avoid immediate conflicts
    setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, 1500);
  }, []); // ลบ dependencies เพื่อป้องกัน infinite loop

  // Auto-connect on mount - เพิ่ม delay เพื่อป้องกัน rapid mounting
  useEffect(() => {
    console.log('🎬 useSSE effect triggered, hasInitialized:', hasInitializedRef.current);
    
    // ป้องกัน React StrictMode double effect
    if (hasInitializedRef.current) {
      console.log('⚠️ SSE already initialized, skipping...');
      return;
    }
    
    hasInitializedRef.current = true;
    isMountedRef.current = true;
    
    console.log('🎯 Initializing SSE connection...');
    
    // เพิ่ม delay มากขึ้นใน development mode เพื่อป้องกัน hot reload rapid mounting
    const isDev = process.env.NODE_ENV === 'development';
    const mountDelay = setTimeout(() => {
      if (isMountedRef.current && !eventSourceRef.current) {
        console.log('🚀 Starting delayed SSE connection...');
        connect();
      } else {
        console.log('⚠️ Skipping connection - mounted:', isMountedRef.current, 'existing connection:', !!eventSourceRef.current);
      }
    }, isDev ? 2000 : 1000); // เพิ่ม delay สำหรับ dev
    
    return () => {
      console.log('🧹 Cleaning up SSE connection...');
      clearTimeout(mountDelay);
      isMountedRef.current = false;
      isConnectingRef.current = false;
      hasInitializedRef.current = false;
      disconnect();
    };
  }, []); // ลบ dependencies เพื่อป้องกัน infinite loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    connect,
    disconnect,
    reconnect,
    connectionStats
  };
}
