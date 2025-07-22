// src/components/business/moments/MomentCard/CompatibleMomentCard.tsx

import React from 'react';
import { MomentCard } from './MomentCard';
import { withMomentCardErrorBoundary } from './MomentCardErrorBoundary';
import { MomentAdapter, type LegacyMoment } from '@/utils/adapters/MomentAdapter';
import type { Moment as NewMoment } from './MomentCard';

// Props for the legacy MomentCard usage (from existing MomentsPage)
interface LegacyMomentCardProps {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  status: 'active' | 'draft' | 'scheduled' | 'paused' | 'completed';
  trigger: 'immediate' | 'scheduled' | 'event-based' | 'behavior-based';
  audience: string;
  channel: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  tags: string[];
  personalization: boolean;
  abTest: boolean;
  lastModified: string;
  variant?: 'default' | 'horizontal';
  isSelected: boolean;
  onSelect: () => void;
  // Optional handlers from new interface
  onEdit?: () => void;
  onTest?: () => void;
  onDuplicate?: () => void;
  onToggleStatus?: () => void;
  className?: string;
}

/**
 * Backward compatible MomentCard wrapper that accepts legacy props
 * and converts them to the new MomentCard interface automatically
 */
export const CompatibleMomentCard: React.FC<LegacyMomentCardProps> = ({
  // Legacy props
  id,
  name,
  description,
  type,
  status,
  trigger,
  audience,
  channel,
  priority,
  scheduledFor,
  metrics,
  tags,
  personalization,
  abTest,
  lastModified,
  variant = 'default',
  isSelected,
  onSelect,
  onEdit,
  onTest,
  onDuplicate,
  onToggleStatus,
  className,
}) => {
  // Convert legacy props to LegacyMoment object
  const legacyMoment: LegacyMoment = React.useMemo(() => ({
    id,
    name,
    description,
    type,
    status,
    trigger,
    audience,
    channel,
    priority,
    scheduledFor,
    createdBy: 'Unknown', // Default value for missing prop
    lastModified,
    tags,
    personalization,
    abTest,
    metrics,
    content: {
      subject: undefined,
      preview: description, // Use description as preview fallback
      template: `${type}-template`, // Generate template name
    },
  }), [
    id, name, description, type, status, trigger, audience, channel,
    priority, scheduledFor, lastModified, tags, personalization, abTest, metrics
  ]);

  // Convert to new moment format
  const newMoment: NewMoment = React.useMemo(() => {
    try {
      return MomentAdapter.legacyToNew(legacyMoment);
    } catch (error) {
      console.error('Error converting legacy moment to new format:', error);
      // Return a safe default moment if conversion fails
      return {
        id: id || `error-${Date.now()}`,
        name: name || 'Error Loading Moment',
        description: description,
        type: 'immediate',
        status: 'draft',
        channel: 'email',
        priority: priority || 'medium',
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
      };
    }
  }, [legacyMoment, id, name, description, priority]);

  // Convert variant prop
  const mappedVariant: 'default' | 'compact' | 'detailed' = 
    variant === 'horizontal' ? 'detailed' : 'default';

  // Handler adapters that maintain legacy callback signatures
  const handleSelect = React.useCallback((moment: NewMoment) => {
    onSelect();
  }, [onSelect]);

  const handleEdit = React.useCallback((moment: NewMoment) => {
    onEdit?.();
  }, [onEdit]);

  const handleTest = React.useCallback((moment: NewMoment) => {
    onTest?.();
  }, [onTest]);

  const handleDuplicate = React.useCallback((moment: NewMoment) => {
    onDuplicate?.();
  }, [onDuplicate]);

  const handleToggleStatus = React.useCallback((moment: NewMoment) => {
    onToggleStatus?.();
  }, [onToggleStatus]);

  return (
    <MomentCard
      moment={newMoment}
      variant={mappedVariant}
      isSelected={isSelected}
      onSelect={handleSelect}
      onEdit={handleEdit}
      onTest={handleTest}
      onDuplicate={handleDuplicate}
      onToggleStatus={handleToggleStatus}
      className={className}
    />
  );
};

// Create a safe version with error boundary
const SafeCompatibleMomentCard = withMomentCardErrorBoundary(CompatibleMomentCard);

// Also create a direct replacement for the original MomentCard import
export const LegacyMomentCard = SafeCompatibleMomentCard;

// Export both versions for flexibility
export default SafeCompatibleMomentCard;