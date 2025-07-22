// src/components/business/moments/MomentCard/index.ts

// Export the new safe MomentCard components
export { MomentCard } from './MomentCard';
export type { Moment, MomentCardProps } from './MomentCard';

// Export the error boundary components
export { 
  MomentCardErrorBoundary, 
  withMomentCardErrorBoundary 
} from './MomentCardErrorBoundary';

// Export the backward compatible wrapper
export { 
  CompatibleMomentCard,
  LegacyMomentCard 
} from './CompatibleMomentCard';

// Export adapter utilities
export { MomentAdapter } from '@/utils/adapters/MomentAdapter';
export type { LegacyMoment } from '@/utils/adapters/MomentAdapter';

// Re-export for backward compatibility
export { MomentCard as default } from './MomentCard';

// Legacy compatibility exports for existing imports
export { CompatibleMomentCard as MomentCard_Legacy } from './CompatibleMomentCard';
export { LegacyMomentCard as MomentCard_Safe } from './CompatibleMomentCard';

// Additional type exports for external usage
export type {
  // Component prop types
  MomentCardProps as MomentCardComponentProps,
  
  // Moment interface variations
  Moment as NewMoment,
  LegacyMoment as OldMoment,
  
  // Handler function types
  MomentCardProps['onSelect'] as MomentSelectHandler,
  MomentCardProps['onEdit'] as MomentEditHandler,
  MomentCardProps['onTest'] as MomentTestHandler,
  MomentCardProps['onDuplicate'] as MomentDuplicateHandler,
  MomentCardProps['onToggleStatus'] as MomentToggleStatusHandler,
} from './MomentCard';

// Utility type guards and helpers
export const MomentCardUtils = {
  // Export type checking utilities
  isValidMoment: (moment: any): moment is Moment => {
    return (
      moment &&
      typeof moment === 'object' &&
      typeof moment.id === 'string' &&
      typeof moment.name === 'string' &&
      moment.channel &&
      moment.performance &&
      typeof moment.performance === 'object'
    );
  },
  
  // Export adapter utilities
  convertLegacyToNew: MomentAdapter.legacyToNew,
  convertNewToLegacy: MomentAdapter.newToLegacy,
  isLegacyMoment: MomentAdapter.isLegacyMoment,
  isNewMoment: MomentAdapter.isNewMoment,
  autoDetectAndConvert: MomentAdapter.toNew,
} as const;

// Export component variants for different use cases
export const MomentCardVariants = {
  // Standard component
  Standard: MomentCard,
  
  // Error-safe component
  Safe: withMomentCardErrorBoundary(MomentCard),
  
  // Legacy-compatible component
  Legacy: CompatibleMomentCard,
  
  // Legacy + Error boundary
  LegacySafe: LegacyMomentCard,
} as const;

// Export default configurations
export const MomentCardDefaults = {
  variant: 'default' as const,
  isSelected: false,
  className: '',
  
  // Default moment structure for fallbacks
  defaultMoment: {
    name: 'Unknown Moment',
    description: 'No description available',
    type: 'immediate' as const,
    status: 'draft' as const,
    channel: 'email' as const,
    priority: 'medium' as const,
    audienceSize: 0,
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
    createdBy: 'Unknown',
  } as Partial<Moment>,
} as const;

// Import { Moment } type since we reference it
import type { Moment } from './MomentCard';