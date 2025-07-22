// src/utils/adapters/MomentAdapter.ts

import type { Moment as NewMoment } from '@/components/business/moments/MomentCard/MomentCard';

// Legacy Moment interface from existing MomentsPage
export interface LegacyMoment {
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
  createdBy: string;
  lastModified: string;
  tags: string[];
  personalization: boolean;
  abTest: boolean;
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
  content: {
    subject?: string;
    preview: string;
    template: string;
  };
}

/**
 * Adapter class to convert between legacy and new Moment interfaces
 */
export class MomentAdapter {
  /**
   * Converts legacy moment data to new moment interface
   */
  static legacyToNew(legacyMoment: LegacyMoment): NewMoment {
    // Map legacy trigger types to new type system
    const triggerToTypeMap: Record<string, NewMoment['type']> = {
      'immediate': 'immediate',
      'scheduled': 'scheduled',
      'event-based': 'triggered',
      'behavior-based': 'triggered',
    };

    // Map legacy status to new status (handle 'completed' -> 'archived')
    const statusMap: Record<string, NewMoment['status']> = {
      'active': 'active',
      'draft': 'draft',
      'scheduled': 'active', // Scheduled moments are considered active
      'paused': 'paused',
      'completed': 'archived', // Completed becomes archived
    };

    // Get primary channel from channel array (legacy has array, new has single)
    const primaryChannel = this.getPrimaryChannel(legacyMoment.channel, legacyMoment.type);

    // Build schedule object if scheduled
    const schedule: NewMoment['schedule'] = legacyMoment.scheduledFor ? {
      type: 'scheduled',
      startDate: legacyMoment.scheduledFor,
      timezone: 'UTC', // Default timezone
    } : undefined;

    const newMoment: NewMoment = {
      id: legacyMoment.id,
      name: legacyMoment.name,
      description: legacyMoment.description,
      type: triggerToTypeMap[legacyMoment.trigger] || 'immediate',
      status: statusMap[legacyMoment.status] || 'draft',
      channel: primaryChannel,
      priority: legacyMoment.priority,
      
      // Targeting
      audienceSize: this.estimateAudienceSize(legacyMoment.audience),
      segmentIds: [legacyMoment.audience.toLowerCase().replace(/\s+/g, '-')],
      
      // Performance (direct mapping)
      performance: {
        sent: legacyMoment.metrics.sent,
        delivered: legacyMoment.metrics.delivered,
        opened: legacyMoment.metrics.opened,
        clicked: legacyMoment.metrics.clicked,
        converted: legacyMoment.metrics.converted,
        deliveryRate: legacyMoment.metrics.deliveryRate,
        openRate: legacyMoment.metrics.openRate,
        clickRate: legacyMoment.metrics.clickRate,
        conversionRate: legacyMoment.metrics.conversionRate,
      },
      
      // Schedule
      schedule,
      
      // Content
      content: {
        subject: legacyMoment.content.subject,
        preview: legacyMoment.content.preview,
        hasPersonalization: legacyMoment.personalization,
        hasABTest: legacyMoment.abTest,
        variants: legacyMoment.abTest ? 2 : 1,
      },
      
      // Metadata
      tags: legacyMoment.tags,
      createdAt: this.convertDateFormat(legacyMoment.lastModified),
      updatedAt: this.convertDateFormat(legacyMoment.lastModified),
      createdBy: legacyMoment.createdBy,
    };

    return newMoment;
  }

  /**
   * Converts new moment data back to legacy interface
   */
  static newToLegacy(newMoment: NewMoment): LegacyMoment {
    // Map new type back to legacy trigger
    const typeToTriggerMap: Record<NewMoment['type'], LegacyMoment['trigger']> = {
      'immediate': 'immediate',
      'scheduled': 'scheduled',
      'triggered': 'event-based',
      'recurring': 'scheduled',
    };

    // Map new status back to legacy status
    const statusMap: Record<NewMoment['status'], LegacyMoment['status']> = {
      'active': 'active',
      'draft': 'draft',
      'paused': 'paused',
      'archived': 'completed',
    };

    const legacyMoment: LegacyMoment = {
      id: newMoment.id,
      name: newMoment.name,
      description: newMoment.description || '',
      type: newMoment.channel,
      status: statusMap[newMoment.status] || 'draft',
      trigger: typeToTriggerMap[newMoment.type] || 'immediate',
      audience: this.getAudienceName(newMoment.segmentIds),
      channel: [newMoment.channel], // Convert single channel to array
      priority: newMoment.priority,
      scheduledFor: newMoment.schedule?.startDate,
      createdBy: newMoment.createdBy,
      lastModified: this.formatDateForLegacy(newMoment.updatedAt),
      tags: newMoment.tags,
      personalization: newMoment.content.hasPersonalization,
      abTest: newMoment.content.hasABTest,
      
      // Performance (direct mapping)
      metrics: {
        sent: newMoment.performance.sent,
        delivered: newMoment.performance.delivered,
        opened: newMoment.performance.opened,
        clicked: newMoment.performance.clicked,
        converted: newMoment.performance.converted,
        deliveryRate: newMoment.performance.deliveryRate,
        openRate: newMoment.performance.openRate,
        clickRate: newMoment.performance.clickRate,
        conversionRate: newMoment.performance.conversionRate,
      },
      
      // Content
      content: {
        subject: newMoment.content.subject,
        preview: newMoment.content.preview || '',
        template: this.generateTemplateName(newMoment),
      },
    };

    return legacyMoment;
  }

  /**
   * Batch convert legacy moments array to new moments array
   */
  static legacyArrayToNew(legacyMoments: LegacyMoment[]): NewMoment[] {
    return legacyMoments.map(moment => this.legacyToNew(moment));
  }

  /**
   * Batch convert new moments array to legacy moments array
   */
  static newArrayToLegacy(newMoments: NewMoment[]): LegacyMoment[] {
    return newMoments.map(moment => this.newToLegacy(moment));
  }

  // Private helper methods
  
  private static getPrimaryChannel(
    channels: string[], 
    type: string
  ): NewMoment['channel'] {
    // If channels array exists and has items, use the first one
    if (channels && channels.length > 0) {
      const firstChannel = channels[0].toLowerCase();
      if (['email', 'sms', 'push', 'web', 'in-app'].includes(firstChannel)) {
        return firstChannel as NewMoment['channel'];
      }
    }

    // Fallback to type-based mapping
    const typeToChannelMap: Record<string, NewMoment['channel']> = {
      'email': 'email',
      'sms': 'sms',
      'push': 'push',
      'web': 'web',
      'in-app': 'in-app',
    };

    return typeToChannelMap[type] || 'email';
  }

  private static estimateAudienceSize(audience: string): number {
    // Simple audience size estimation based on audience name
    const audienceSizeMap: Record<string, number> = {
      'new users': 15420,
      'cart abandoners': 8934,
      'birthday customers': 2456,
      'engaged customers': 12456,
      'premium customers': 5678,
      'dormant users': 12456,
      'all users': 50000,
    };

    const normalizedAudience = audience.toLowerCase();
    return audienceSizeMap[normalizedAudience] || 10000; // Default size
  }

  private static getAudienceName(segmentIds?: string[]): string {
    if (!segmentIds || segmentIds.length === 0) {
      return 'All Users';
    }

    // Convert segment ID back to readable name
    const segmentToNameMap: Record<string, string> = {
      'new-users': 'New Users',
      'cart-abandoners': 'Cart Abandoners',
      'birthday-customers': 'Birthday Customers',
      'engaged-customers': 'Engaged Customers',
      'premium-customers': 'Premium Customers',
      'dormant-users': 'Dormant Users',
    };

    const firstSegment = segmentIds[0];
    return segmentToNameMap[firstSegment] || 
           firstSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private static convertDateFormat(dateString: string): string {
    try {
      // Legacy format might be YYYY-MM-DD, convert to ISO
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateString + 'T00:00:00Z').toISOString();
      }
      // If already ISO format, return as is
      return new Date(dateString).toISOString();
    } catch {
      // Fallback to current date if parsing fails
      return new Date().toISOString();
    }
  }

  private static formatDateForLegacy(isoString: string): string {
    try {
      // Convert ISO string to YYYY-MM-DD format
      return new Date(isoString).toISOString().split('T')[0];
    } catch {
      // Fallback to current date
      return new Date().toISOString().split('T')[0];
    }
  }

  private static generateTemplateName(moment: NewMoment): string {
    // Generate a template name based on moment properties
    const channelTemplateMap: Record<NewMoment['channel'], string> = {
      'email': 'email-template',
      'sms': 'sms-template',
      'push': 'push-template',
      'web': 'web-template',
      'in-app': 'in-app-template',
    };

    const baseTemplate = channelTemplateMap[moment.channel];
    const suffix = moment.content.hasABTest ? '-ab' : '-v1';
    
    return baseTemplate + suffix;
  }

  /**
   * Validates if a moment object conforms to legacy interface
   */
  static isLegacyMoment(obj: any): obj is LegacyMoment {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      Array.isArray(obj.channel) && // Key difference: legacy has array
      typeof obj.trigger === 'string' && // Key difference: legacy has trigger
      obj.metrics &&
      obj.content &&
      typeof obj.content.template === 'string' // Key difference: legacy has template
    );
  }

  /**
   * Validates if a moment object conforms to new interface
   */
  static isNewMoment(obj: any): obj is NewMoment {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.channel === 'string' && // Key difference: new has single channel
      typeof obj.type === 'string' && // Key difference: new has type
      obj.performance &&
      obj.content &&
      typeof obj.content.hasPersonalization === 'boolean' // Key difference: new has boolean flags
    );
  }

  /**
   * Auto-detects interface type and converts to new format
   */
  static toNew(moment: LegacyMoment | NewMoment): NewMoment {
    if (this.isNewMoment(moment)) {
      return moment;
    }
    if (this.isLegacyMoment(moment)) {
      return this.legacyToNew(moment);
    }
    
    // Fallback: try to convert anyway
    console.warn('Unknown moment format, attempting conversion:', moment);
    return this.legacyToNew(moment as LegacyMoment);
  }

  /**
   * Auto-detects interface type and converts to legacy format
   */
  static toLegacy(moment: LegacyMoment | NewMoment): LegacyMoment {
    if (this.isLegacyMoment(moment)) {
      return moment;
    }
    if (this.isNewMoment(moment)) {
      return this.newToLegacy(moment);
    }
    
    // Fallback: try to convert anyway
    console.warn('Unknown moment format, attempting conversion:', moment);
    return this.newToLegacy(moment as NewMoment);
  }
}