// src/components/business/moments/index.ts
// Main moments component exports

// Export MomentCard components
export * from './MomentCard';

// For backward compatibility - re-export the main components
export { 
  MomentCard,
  CompatibleMomentCard as LegacyMomentCard,
  MomentCardErrorBoundary,
  withMomentCardErrorBoundary 
} from './MomentCard';

// Export types
export type { 
  Moment,
  MomentCardProps,
  LegacyMoment 
} from './MomentCard';