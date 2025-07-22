// File Path: src/hooks/realtime/useWebSocket.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket as useWebSocketContext } from '../../services/websocket/WebSocketProvider';
import { WebSocketEventType, WebSocketMessage } from '../../services/websocket/MessageTypes';

export interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onReconnect?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const context = useWebSocketContext();
  const { onConnect, onDisconnect, onError, onReconnect } = options;

  // Track connection state changes
  useEffect(() => {
    if (context.isConnected && onConnect) {
      onConnect();
    }
  }, [context.isConnected, onConnect]);

  useEffect(() => {
    if (!context.isConnected && !context.isConnecting && onDisconnect) {
      onDisconnect();
    }
  }, [context.isConnected, context.isConnecting, onDisconnect]);

  useEffect(() => {
    if (context.error && onError) {
      onError(context.error);
    }
  }, [context.error, onError]);

  return {
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    connectionState: context.connectionState,
    error: context.error,
    connect: context.connect,
    disconnect: context.disconnect,
    send: context.send,
    subscribe: context.subscribe,
  };
};

export const useWebSocketSubscription = <T = any>(
  eventType: WebSocketEventType,
  callback: (data: T) => void,
  dependencies: React.DependencyList = []
) => {
  const { subscribe } = useWebSocket();
  const callbackRef = useRef(callback);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = subscribe<T>(eventType, (data) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [eventType, subscribe, ...dependencies]);
};

export const useWebSocketSender = () => {
  const { send } = useWebSocket();

  const sendMessage = useCallback((
    type: WebSocketEventType,
    data: any,
    metadata?: Record<string, any>
  ) => {
    const message: WebSocketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      data,
      metadata,
    };

    send(message);
  }, [send]);

  return { sendMessage };
};