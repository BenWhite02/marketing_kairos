// src/utils/data/momentUtils.ts

import type { 
  Moment, 
  MomentChannel, 
  MomentStatus, 
  MomentPriority, 
  MomentType,
  MomentPerformance,
  MomentContent
} from '@/types/api/moments';

/**
 * Utility functions for safe moment data handling and validation
 */

// Default performance metrics
export const DEFAULT_PERFORMANCE: MomentPerformance = {
  sent: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  converted: 0,
  deliveryRate: 0,
  openRate: 0,
  clickRate: 0,
  conversionRate: 0,
};

// Default content configuration
export const DEFAULT_CONTENT: MomentContent = {
  hasPersonalization: false,
  hasABTest: false,
  variants: 1,
};

// Default moment template
export const DEFAULT_MOMENT: Omit<Moment, 'id'> = {
  name: 'Untitled Moment',
  description: '',
  type: 'immediate',
  status: 'draft',
  channel: 'email',
  priority: 'medium',
  audienceSize: 0,
  segmentIds: [],
  performance: DEFAULT_PERFORMANCE,
  content: DEFAULT_CONTENT,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
};

/**
 * Type guards for runtime validation
 */
export const isMomentChannel = (value: unknown): value is MomentChannel => {
  return typeof value === 'string' && 
    ['email', 'sms', 'push', 'web', 'in-app'].includes(value);
};

export const isMomentStatus = (value: unknown): value is MomentStatus => {
  return typeof value === 'string' && 
    ['active', 'paused', 'draft', 'archived'].includes(value);
};

export const isMomentPriority = (value: unknown): value is MomentPriority => {
  return typeof value === 'string' && 
    ['low', 'medium', 'high', 'urgent'].includes(value);
};

export const isMomentType = (value: unknown): value is MomentType => {
  return typeof value === 'string' && 
    ['immediate', 'scheduled', 'triggered', 'recurring'].includes(value);
};

/**
 * Validates if an object has the minimum required properties to be a Moment
 */
export const isValidMomentStructure = (obj: unknown): obj is Partial<Moment> => {
  if (!obj || typeof obj !== 'object') return false;
  
  const moment = obj as Record<string, unknown>;
  
  return (
    typeof moment.id === 'string' ||
    typeof moment.name === 'string'
  );
};

/**
 * Safely creates a valid Moment object from potentially invalid data
 */
export const sanitizeMoment = (data: unknown): Moment => {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid moment data received, using defaults:', data);
    return {
      ...DEFAULT_MOMENT,
      id: `error-${Date.now()}`,
    };
  }

  const raw = data as Record<string, unknown>;
  
  // Start with defaults and override with valid values
  const moment: Moment = {
    id: typeof raw.id === 'string' ? raw.id : `generated-${Date.now()}`,
    name: typeof raw.name === 'string' ? raw.name : DEFAULT_MOMENT.name,
    description: typeof raw.description === 'string' ? raw.description : DEFAULT_MOMENT.description,
    
    // Validate enums with fallbacks
    type: isMomentType(raw.type) ? raw.type : DEFAULT_MOMENT.type,
    status: isMomentStatus(raw.status) ? raw.status : DEFAULT_MOMENT.status,
    channel: isMomentChannel(raw.channel) ? raw.channel : DEFAULT_MOMENT.channel,
    priority: isMomentPriority(raw.priority) ? raw.priority : DEFAULT_MOMENT.priority,
    
    // Numeric values with validation
    audienceSize: typeof raw.audienceSize === 'number' && raw.audienceSize >= 0 
      ? raw.audienceSize 
      : DEFAULT_MOMENT.audienceSize,
    
    // Arrays with validation
    segmentIds: Array.isArray(raw.segmentIds) 
      ? raw.segmentIds.filter(id => typeof id === 'string')
      : DEFAULT_MOMENT.segmentIds,
    
    tags: Array.isArray(raw.tags) 
      ? raw.tags.filter(tag => typeof tag === 'string')
      : DEFAULT_MOMENT.tags,
    
    // Performance metrics with validation
    performance: sanitizePerformance(raw.performance),
    
    // Content with validation
    content: sanitizeContent(raw.content),
    
    // Dates with validation
    createdAt: isValidDateString(raw.createdAt) ? raw.createdAt : DEFAULT_MOMENT.createdAt,
    updatedAt: isValidDateString(raw.updatedAt) ? raw.updatedAt : DEFAULT_MOMENT.updatedAt,
    createdBy: typeof raw.createdBy === 'string' ? raw.createdBy : DEFAULT_MOMENT.createdBy,
    
    // Optional fields
    lastRun: isValidDateString(raw.lastRun) ? raw.lastRun : undefined,
    nextRun: isValidDateString(raw.nextRun) ? raw.nextRun : undefined,
    
    // Schedule with validation
    schedule: raw.schedule && typeof raw.schedule === 'object' 
      ? sanitizeSchedule(raw.schedule as Record<string, unknown>)
      : undefined,
  };

  return moment;
};

/**
 * Sanitizes performance metrics
 */
export const sanitizePerformance = (data: unknown): MomentPerformance => {
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_PERFORMANCE };
  }

  const raw = data as Record<string, unknown>;
  
  return {
    sent: sanitizeNumber(raw.sent, 0),
    delivered: sanitizeNumber(raw.delivered, 0),
    opened: sanitizeNumber(raw.opened, 0),
    clicked: sanitizeNumber(raw.clicked, 0),
    converted: sanitizeNumber(raw.converted, 0),
    deliveryRate: sanitizePercentage(raw.deliveryRate, 0),
    openRate: sanitizePercentage(raw.openRate, 0),
    clickRate: sanitizePercentage(raw.clickRate, 0),
    conversionRate: sanitizePercentage(raw.conversionRate, 0),
  };
};

/**
 * Sanitizes content configuration
 */
export const sanitizeContent = (data: unknown): MomentContent => {
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_CONTENT };
  }

  const raw = data as Record<string, unknown>;
  
  return {
    subject: typeof raw.subject === 'string' ? raw.subject : undefined,
    preview: typeof raw.preview === 'string' ? raw.preview : undefined,
    hasPersonalization: typeof raw.hasPersonalization === 'boolean' 
      ? raw.hasPersonalization 
      : DEFAULT_CONTENT.hasPersonalization,
    hasABTest: typeof raw.hasABTest === 'boolean' 
      ? raw.hasABTest 
      : DEFAULT_CONTENT.hasABTest,
    variants: sanitizeNumber(raw.variants, DEFAULT_CONTENT.variants!, 1, 10),
  };
};

/**
 * Sanitizes schedule configuration
 */
export const sanitizeSchedule = (data: Record<string, unknown>) => {
  const validTypes = ['immediate', 'scheduled', 'recurring'];
  const validFrequencies = ['daily', 'weekly', 'monthly'];
  
  return {
    type: validTypes.includes(data.type as string) 
      ? data.type as 'immediate' | 'scheduled' | 'recurring'
      : 'immediate',
    startDate: isValidDateString(data.startDate) ? data.startDate : undefined,
    endDate: isValidDateString(data.endDate) ? data.endDate : undefined,
    timezone: typeof data.timezone === 'string' ? data.timezone : undefined,
    frequency: validFrequencies.includes(data.frequency as string)
      ? data.frequency as 'daily' | 'weekly' | 'monthly'
      : undefined,
  };
};

/**
 * Utility functions for data validation
 */
export const sanitizeNumber = (
  value: unknown, 
  defaultValue: number = 0, 
  min?: number, 
  max?: number
): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  
  let result = value;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  
  return result;
};

export const sanitizePercentage = (value: unknown, defaultValue: number = 0): number => {
  return sanitizeNumber(value, defaultValue, 0, 100);
};

export const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Format utilities for display
 */
export const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0.0%';
  return `${num.toFixed(decimals)}%`;
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Validation helpers for forms
 */
export const validateMomentName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Moment name is required';
  }
  if (name.length > 100) {
    return 'Moment name must be less than 100 characters';
  }
  return null;
};

export const validateAudienceSize = (size: number): string | null => {
  if (size < 0) {
    return 'Audience size cannot be negative';
  }
  if (size > 10000000) {
    return 'Audience size cannot exceed 10 million';
  }
  return null;
};

/**
 * Batch processing utilities for multiple moments
 */
export const sanitizeMomentArray = (data: unknown): Moment[] => {
  if (!Array.isArray(data)) {
    console.warn('Expected array of moments, received:', typeof data);
    return [];
  }

  return data
    .map((item, index) => {
      try {
        return sanitizeMoment(item);
      } catch (error) {
        console.warn(`Failed to sanitize moment at index ${index}:`, error);
        return null;
      }
    })
    .filter((moment): moment is Moment => moment !== null);
};

/**
 * Moment comparison utilities
 */
export const compareMoments = (a: Moment, b: Moment, field: keyof Moment): number => {
  const aValue = a[field];
  const bValue = b[field];

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return aValue.localeCompare(bValue);
  }
  
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return aValue - bValue;
  }

  // Handle date strings
  if (field === 'createdAt' || field === 'updatedAt') {
    const dateA = new Date(aValue as string).getTime();
    const dateB = new Date(bValue as string).getTime();
    return dateA - dateB;
  }

  return 0;
};

/**
 * Search and filter utilities
 */
export const searchMoments = (moments: Moment[], query: string): Moment[] => {
  if (!query || query.trim().length === 0) return moments;

  const searchTerm = query.toLowerCase().trim();
  
  return moments.filter(moment => {
    const searchableText = [
      moment.name,
      moment.description || '',
      moment.channel,
      moment.status,
      moment.priority,
      moment.type,
      ...moment.tags,
      moment.createdBy,
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  });
};

/**
 * Performance calculation utilities
 */
export const calculatePerformanceMetrics = (performance: Partial<MomentPerformance>): MomentPerformance => {
  const sent = performance.sent || 0;
  const delivered = performance.delivered || 0;
  const opened = performance.opened || 0;
  const clicked = performance.clicked || 0;
  const converted = performance.converted || 0;

  return {
    sent,
    delivered,
    opened,
    clicked,
    converted,
    deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    conversionRate: clicked > 0 ? (converted / clicked) * 100 : 0,
  };
};

/**
 * Moment status utilities
 */
export const canTransitionStatus = (from: MomentStatus, to: MomentStatus): boolean => {
  const validTransitions: Record<MomentStatus, MomentStatus[]> = {
    draft: ['active', 'archived'],
    active: ['paused', 'archived'],
    paused: ['active', 'archived'],
    archived: [], // Cannot transition from archived
  };

  return validTransitions[from]?.includes(to) || false;
};

export const getStatusColor = (status: MomentStatus): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'paused':
      return 'text-yellow-600 bg-yellow-100';
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'archived':
      return 'text-gray-500 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getPriorityColor = (priority: MomentPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-blue-600 bg-blue-100';
    case 'low':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getChannelColor = (channel: MomentChannel): string => {
  switch (channel) {
    case 'email':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'sms':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'push':
      return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'web':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'in-app':
      return 'text-cyan-600 bg-cyan-100 border-cyan-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

/**
 * Debugging and logging utilities
 */
export const logMomentError = (error: Error, moment?: Partial<Moment>, context?: string): void => {
  console.group(`🔴 Moment Error ${context ? `(${context})` : ''}`);
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  if (moment) {
    console.log('Moment data:', moment);
  }
  console.groupEnd();

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: { moment, context } });
  }
};

export const validateMomentData = (moment: unknown): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!moment || typeof moment !== 'object') {
    errors.push('Moment data must be an object');
    return { isValid: false, errors };
  }

  const m = moment as Record<string, unknown>;

  // Required fields
  if (!m.id || typeof m.id !== 'string') {
    errors.push('Moment ID is required and must be a string');
  }

  if (!m.name || typeof m.name !== 'string') {
    errors.push('Moment name is required and must be a string');
  }

  if (!isMomentChannel(m.channel)) {
    errors.push('Invalid moment channel');
  }

  if (!isMomentStatus(m.status)) {
    errors.push('Invalid moment status');
  }

  if (!isMomentPriority(m.priority)) {
    errors.push('Invalid moment priority');
  }

  if (!isMomentType(m.type)) {
    errors.push('Invalid moment type');
  }

  // Performance validation
  if (m.performance && typeof m.performance === 'object') {
    const perf = m.performance as Record<string, unknown>;
    const numericFields = ['sent', 'delivered', 'opened', 'clicked', 'converted'];
    const percentageFields = ['deliveryRate', 'openRate', 'clickRate', 'conversionRate'];

    numericFields.forEach(field => {
      if (perf[field] !== undefined && (typeof perf[field] !== 'number' || perf[field] < 0)) {
        errors.push(`Performance ${field} must be a non-negative number`);
      }
    });

    percentageFields.forEach(field => {
      if (perf[field] !== undefined && (typeof perf[field] !== 'number' || perf[field] < 0 || perf[field] > 100)) {
        errors.push(`Performance ${field} must be a percentage between 0 and 100`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};