// File Path: src/services/websocket/WebSocketProvider.tsx

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { WebSocketClient } from './WebSocketClient';
import { WebSocketMessage, WebSocketEventType } from './MessageTypes';

interface WebSocketContextValue {
  client: WebSocketClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  subscribe: <T = any>(eventType: WebSocketEventType, callback: (data: T) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
  token,
  autoConnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    // Initialize WebSocket client
    const client = new WebSocketClient(
      {
        url,
        reconnectInterval,
        maxReconnectAttempts,
      },
      {
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionState('connected');
          setError(null);
          console.log('WebSocket connected');
        },
        onDisconnect: (reason) => {
          setIsConnected(false);
          setIsConnecting(false);
          setConnectionState('disconnected');
          console.log('WebSocket disconnected:', reason);
        },
        onReconnect: (attempt) => {
          setIsConnecting(true);
          setConnectionState('connecting');
          console.log(`WebSocket reconnecting... (attempt ${attempt})`);
        },
        onError: (error) => {
          setError(error.toString());
          setIsConnecting(false);
          console.error('WebSocket error:', error);
        },
        onMessage: (message) => {
          setLastMessage(message);
        },
      }
    );

    clientRef.current = client;

    // Auto-connect if enabled
    if (autoConnect) {
      setIsConnecting(true);
      setConnectionState('connecting');
      client.connect(token).catch((error) => {
        setError(error.message);
        setIsConnecting(false);
        setConnectionState('disconnected');
      });
    }

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [url, token, autoConnect, reconnectInterval, maxReconnectAttempts]);

  const connect = async (): Promise<void> => {
    if (!clientRef.current) return;
    
    setIsConnecting(true);
    setConnectionState('connecting');
    setError(null);
    
    try {
      await clientRef.current.connect(token);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
      setConnectionState('disconnected');
      throw error;
    }
  };

  const disconnect = (): void => {
    if (!clientRef.current) return;
    clientRef.current.disconnect();
  };

  const send = (message: WebSocketMessage): void => {
    if (!clientRef.current) return;
    clientRef.current.send(message);
  };

  const subscribe = <T = any>(
    eventType: WebSocketEventType, 
    callback: (data: T) => void
  ): (() => void) => {
    if (!clientRef.current) {
      return () => {};
    }
    return clientRef.current.subscribe(eventType, callback);
  };

  const value: WebSocketContextValue = {
    client: clientRef.current,
    isConnected,
    isConnecting,
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    send,
    subscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};