// src/components/business/campaigns/JourneyBuilder/index.ts

export { JourneyCanvas } from './JourneyCanvas';
export { JourneyStep } from './JourneyStep';
export { ConnectionManager } from './ConnectionManager';
export { StepPalette } from './StepPalette';

// Types and interfaces
export interface Position {
  x: number;
  y: number;
}

export interface JourneyStepData {
  id: string;
  type: 'trigger' | 'moment' | 'decision' | 'delay' | 'split' | 'merge' | 'end';
  position: Position;
  title: string;
  subtitle?: string;
  config: {
    momentId?: string;
    delayDuration?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
    condition?: string;
    splitType?: 'random' | 'rules' | 'percentage';
    splitRatio?: number;
    channels?: string[];
    triggers?: string[];
  };
  inputs: string[];
  outputs: string[];
}

export interface Connection {
  id: string;
  fromStepId: string;
  toStepId: string;
  fromOutput: string;
  toInput: string;
  label?: string;
  condition?: string;
}

export interface JourneyData {
  id: string;
  name: string;
  description?: string;
  steps: JourneyStepData[];
  connections: Connection[];
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'testing' | 'active' | 'paused' | 'archived';
  performance?: {
    totalEntries: number;
    completionRate: number;
    averageTime: number;
    conversions: number;
    revenue: number;
  };
}