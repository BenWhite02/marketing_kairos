// File Path: src/utils/realtime/connectionUtils.ts

export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getConnectionQuality = (
  responseTime: number
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (responseTime < 100) return 'excellent';
  if (responseTime < 300) return 'good';
  if (responseTime < 800) return 'fair';
  return 'poor';
};

export const formatConnectionState = (
  state: 'connecting' | 'connected' | 'disconnected'
): { label: string; color: string } => {
  switch (state) {
    case 'connected':
      return { label: 'Connected', color: 'text-green-600' };
    case 'connecting':
      return { label: 'Connecting...', color: 'text-yellow-600' };
    case 'disconnected':
      return { label: 'Disconnected', color: 'text-red-600' };
    default:
      return { label: 'Unknown', color: 'text-gray-600' };
  }
};

export const shouldReconnect = (
  disconnectReason: string,
  attemptCount: number,
  maxAttempts: number
): boolean => {
  // Don't reconnect if it was intentional
  if (disconnectReason.includes('Client disconnect')) {
    return false;
  }

  // Don't reconnect if max attempts reached
  if (attemptCount >= maxAttempts) {
    return false;
  }

  // Don't reconnect on authentication errors
  if (disconnectReason.includes('Unauthorized') || disconnectReason.includes('403')) {
    return false;
  }

  return true;
};

export const calculateBackoffDelay = (
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
};