// src/types/api/moments.ts

// Base moment types with strict validation
export type MomentType = 'immediate' | 'scheduled' | 'triggered' | 'recurring';
export type MomentStatus = 'active' | 'paused' | 'draft' | 'archived';
export type MomentChannel = 'email' | 'sms' | 'push' | 'web' | 'in-app';
export type MomentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

// Performance metrics interface
export interface MomentPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

// Schedule configuration interface
export interface MomentSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: string;
  endDate?: string;
  timezone?: string;
  frequency?: ScheduleFrequency;
}

// Content configuration interface
export interface MomentContent {
  subject?: string;
  preview?: string;
  hasPersonalization: boolean;
  hasABTest: boolean;
  variants?: number;
}

// Complete moment interface
export interface Moment {
  id: string;
  name: string;
  description?: string;
  type: MomentType;
  status: MomentStatus;
  channel: MomentChannel;
  priority: MomentPriority;
  
  // Targeting
  audienceSize: number;
  segmentIds?: string[];
  
  // Performance
  performance: MomentPerformance;
  
  // Scheduling
  schedule?: MomentSchedule;
  
  // Content
  content: MomentContent;
  
  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRun?: string;
  nextRun?: string;
}

// Partial moment for creation/updates
export interface CreateMomentRequest {
  name: string;
  description?: string;
  type: MomentType;
  channel: MomentChannel;
  priority?: MomentPriority;
  audienceSize?: number;
  segmentIds?: string[];
  schedule?: Partial<MomentSchedule>;
  content: Partial<MomentContent>;
  tags?: string[];
}

// API response wrapper
export interface MomentApiResponse {
  success: boolean;
  data?: Moment | Moment[];
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Moment list filtering options
export interface MomentFilters {
  status?: MomentStatus[];
  channel?: MomentChannel[];
  priority?: MomentPriority[];
  type?: MomentType[];
  tags?: string[];
  createdBy?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

// Moment sorting options
export interface MomentSortOptions {
  field: keyof Moment;
  direction: 'asc' | 'desc';
}

// Moment card variants
export type MomentCardVariant = 'default' | 'compact' | 'detailed';

// Component props interfaces
export interface MomentCardProps {
  moment: Moment;
  variant?: MomentCardVariant;
  isSelected?: boolean;
  onSelect?: (moment: Moment) => void;
  onEdit?: (moment: Moment) => void;
  onTest?: (moment: Moment) => void;
  onDuplicate?: (moment: Moment) => void;
  onToggleStatus?: (moment: Moment) => void;
  className?: string;
}

// Moment validation utilities
export const isValidMoment = (obj: any): obj is Moment => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    ['immediate', 'scheduled', 'triggered', 'recurring'].includes(obj.type) &&
    ['active', 'paused', 'draft', 'archived'].includes(obj.status) &&
    ['email', 'sms', 'push', 'web', 'in-app'].includes(obj.channel) &&
    ['low', 'medium', 'high', 'urgent'].includes(obj.priority) &&
    typeof obj.audienceSize === 'number' &&
    obj.performance &&
    typeof obj.performance === 'object' &&
    obj.content &&
    typeof obj.content === 'object' &&
    Array.isArray(obj.tags) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string' &&
    typeof obj.createdBy === 'string'
  );
};

// Default values for safe initialization
export const createDefaultMoment = (overrides: Partial<Moment> = {}): Moment => ({
  id: '',
  name: '',
  description: '',
  type: 'immediate',
  status: 'draft',
  channel: 'email',
  priority: 'medium',
  audienceSize: 0,
  segmentIds: [],
  performance: {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
  },
  content: {
    hasPersonalization: false,
    hasABTest: false,
    variants: 1,
  },
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: '',
  ...overrides,
});

// Type guards for runtime checking
export const isMomentChannel = (value: string): value is MomentChannel =>
  ['email', 'sms', 'push', 'web', 'in-app'].includes(value);

export const isMomentStatus = (value: string): value is MomentStatus =>
  ['active', 'paused', 'draft', 'archived'].includes(value);

export const isMomentPriority = (value: string): value is MomentPriority =>
  ['low', 'medium', 'high', 'urgent'].includes(value);

export const isMomentType = (value: string): value is MomentType =>
  ['immediate', 'scheduled', 'triggered', 'recurring'].includes(value);