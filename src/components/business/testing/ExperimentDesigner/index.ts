// src/components/business/testing/ExperimentDesigner/index.ts

export { ExperimentBuilder } from './ExperimentBuilder';
export { VariantManager } from './VariantManager';
export { AudienceSelector } from './AudienceSelector';
export { GoalConfiguration } from './GoalConfiguration';
export { TrafficAllocation } from './TrafficAllocation';
export { StatisticalConfig } from './StatisticalConfig';

export type {
  ExperimentConfig,
  ExperimentVariant,
  AudienceConfig,
  GoalConfig,
  TrafficConfig,
  StatisticalConfig
} from './ExperimentBuilder';