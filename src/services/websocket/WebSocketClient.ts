// File Path: src/services/websocket/WebSocketClient.ts

import { WebSocketMessage, WebSocketEventType } from './MessageTypes';

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onReconnect?: (attempt: number) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;
  private isConnected = false;
  private eventListeners = new Map<string, Set<(data: any) => void>>();

  constructor(config: WebSocketConfig, callbacks: WebSocketCallbacks = {}) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      ...config,
    };
    this.callbacks = callbacks;
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        const url = token 
          ? `${this.config.url}?token=${encodeURIComponent(token)}`
          : this.config.url;
        
        this.socket = new WebSocket(url);
        
        const connectionTimeout = setTimeout(() => {
          this.socket?.close();
          reject(new Error('Connection timeout'));
        }, this.config.connectionTimeout);

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send queued messages
          this.flushMessageQueue();
          
          // Start heartbeat
          this.startHeartbeat();
          
          this.callbacks.onConnect?.();
          resolve();
        };

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.isConnected = false;
          this.stopHeartbeat();
          
          const reason = event.reason || `Code: ${event.code}`;
          this.callbacks.onDisconnect?.(reason);
          
          // Attempt reconnection if not intentional
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          this.callbacks.onError?.(error);
          
          if (this.isConnecting) {
            reject(error);
          }
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  subscribe<T = any>(eventType: WebSocketEventType, callback: (data: T) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
        }
      }
    };
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' {
    if (this.isConnecting) return 'connecting';
    if (this.isConnected) return 'connected';
    return 'disconnected';
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat response
    if (message.type === WebSocketEventType.CONNECT) {
      return;
    }

    // Emit to general callback
    this.callbacks.onMessage?.(message);

    // Emit to specific listeners
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.reconnectAttempts <= this.config.maxReconnectAttempts) {
        this.callbacks.onReconnect?.(this.reconnectAttempts);
        this.connect();
      }
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          id: `heartbeat-${Date.now()}`,
          type: WebSocketEventType.CONNECT,
          timestamp: Date.now(),
          data: { type: 'ping' }
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}