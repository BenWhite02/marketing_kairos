// src/hooks/business/useMoments.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/useToast';
import { sanitizeMoment, sanitizeMomentArray, logMomentError } from '@/utils/data/momentUtils';
import type { 
  Moment, 
  CreateMomentRequest, 
  MomentFilters, 
  MomentSortOptions,
  MomentApiResponse 
} from '@/types/api/moments';

// Mock API service - replace with actual API calls
const mockMomentsApi = {
  async getMoments(): Promise<MomentApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data with potential issues to test error handling
    const mockData = [
      {
        id: 'moment-1',
        name: 'Welcome Email Campaign',
        description: 'Automated welcome email for new users',
        type: 'triggered',
        status: 'active',
        channel: 'email',
        priority: 'high',
        audienceSize: 15420,
        segmentIds: ['new-users'],
        performance: {
          sent: 15420,
          delivered: 15102,
          opened: 7551,
          clicked: 1510,
          converted: 453,
          deliveryRate: 97.9,
          openRate: 50.0,
          clickRate: 20.0,
          conversionRate: 30.0,
        },
        content: {
          subject: 'Welcome to Kairos!',
          hasPersonalization: true,
          hasABTest: false,
          variants: 1,
        },
        tags: ['welcome', 'onboarding', 'email'],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z',
        createdBy: 'john.doe@company.com',
      },
      {
        id: 'moment-2',
        name: 'Cart Abandonment SMS',
        description: 'SMS reminder for abandoned carts',
        type: 'triggered',
        status: 'paused',
        channel: 'sms',
        priority: 'medium',
        audienceSize: 8750,
        performance: {
          sent: 8750,
          delivered: 8662,
          opened: 6929,
          clicked: 1732,
          converted: 346,
          deliveryRate: 99.0,
          openRate: 80.0,
          clickRate: 25.0,
          conversionRate: 20.0,
        },
        content: {
          hasPersonalization: true,
          hasABTest: true,
          variants: 2,
        },
        tags: ['cart-abandonment', 'sms', 'recovery'],
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-22T11:45:00Z',
        createdBy: 'jane.smith@company.com',
      },
      {
        // Intentionally malformed data to test error handling
        id: 'moment-3',
        name: 'Push Notification Campaign',
        // missing channel property
        status: 'draft',
        priority: 'low',
        audienceSize: 25000,
        performance: {
          // incomplete performance data
          sent: 0,
        },
        content: {
          hasPersonalization: false,
          hasABTest: false,
        },
        tags: ['push', 'mobile'],
        createdAt: '2024-01-25T16:00:00Z',
        updatedAt: '2024-01-25T16:00:00Z',
        createdBy: 'system',
      },
    ];

    return {
      success: true,
      data: mockData,
    };
  },

  async createMoment(data: CreateMomentRequest): Promise<MomentApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newMoment = {
      id: `moment-${Date.now()}`,
      ...data,
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
        ...data.content,
      },
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@company.com',
    };

    return {
      success: true,
      data: newMoment,
    };
  },

  async updateMoment(id: string, data: Partial<Moment>): Promise<MomentApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      data: { ...data, id, updatedAt: new Date().toISOString() } as Moment,
    };
  },

  async deleteMoment(id: string): Promise<MomentApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      message: `Moment ${id} deleted successfully`,
    };
  },

  async duplicateMoment(id: string): Promise<MomentApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const duplicatedMoment = {
      id: `moment-${Date.now()}`,
      name: `Copy of Moment ${id}`,
      description: 'Duplicated moment',
      type: 'draft' as const,
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
      tags: ['duplicate'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@company.com',
    };

    return {
      success: true,
      data: duplicatedMoment,
    };
  },
};

// Query keys for React Query
const QUERY_KEYS = {
  moments: ['moments'] as const,
  moment: (id: string) => ['moments', id] as const,
};

export interface UseMomentsOptions {
  filters?: MomentFilters;
  sortOptions?: MomentSortOptions;
  enableRealtime?: boolean;
}

export interface UseMomentsReturn {
  // Data
  moments: Moment[] | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  createMoment: (data: CreateMomentRequest) => Promise<Moment>;
  updateMoment: (id: string, data: Partial<Moment>) => Promise<Moment>;
  deleteMoment: (id: string) => Promise<void>;
  duplicateMoment: (id: string) => Promise<Moment>;
  refreshMoments: () => void;
  
  // Utilities
  getMomentById: (id: string) => Moment | undefined;
  getFilteredMoments: (filters: MomentFilters) => Moment[];
  getSortedMoments: (sortOptions: MomentSortOptions) => Moment[];
}

export const useMoments = (options: UseMomentsOptions = {}): UseMomentsReturn => {
  const { filters, sortOptions, enableRealtime = false } = options;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch moments with error handling
  const {
    data: rawMoments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.moments,
    queryFn: async () => {
      try {
        const response = await mockMomentsApi.getMoments();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch moments');
        }

        return response.data;
      } catch (error) {
        logMomentError(error as Error, undefined, 'useMoments fetch');
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3 && error.message.includes('network')) {
        return true;
      }
      return false;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sanitize moments data
  const moments = useMemo(() => {
    if (!rawMoments) return undefined;
    
    try {
      return sanitizeMomentArray(rawMoments);
    } catch (error) {
      logMomentError(error as Error, undefined, 'useMoments sanitization');
      toast.error('Error processing moments data');
      return [];
    }
  }, [rawMoments, toast]);

  // Create moment mutation
  const createMomentMutation = useMutation({
    mutationFn: async (data: CreateMomentRequest) => {
      const response = await mockMomentsApi.createMoment(data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create moment');
      }

      return sanitizeMoment(response.data);
    },
    onSuccess: (newMoment) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments });
      toast.success(`Moment "${newMoment.name}" created successfully`);
    },
    onError: (error: Error) => {
      logMomentError(error, undefined, 'createMoment');
      toast.error(`Failed to create moment: ${error.message}`);
    },
  });

  // Update moment mutation
  const updateMomentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Moment> }) => {
      const response = await mockMomentsApi.updateMoment(id, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update moment');
      }

      return sanitizeMoment(response.data);
    },
    onSuccess: (updatedMoment) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments });
      toast.success(`Moment "${updatedMoment.name}" updated successfully`);
    },
    onError: (error: Error) => {
      logMomentError(error, undefined, 'updateMoment');
      toast.error(`Failed to update moment: ${error.message}`);
    },
  });

  // Delete moment mutation
  const deleteMomentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await mockMomentsApi.deleteMoment(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete moment');
      }

      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments });
      toast.success('Moment deleted successfully');
    },
    onError: (error: Error) => {
      logMomentError(error, undefined, 'deleteMoment');
      toast.error(`Failed to delete moment: ${error.message}`);
    },
  });

  // Duplicate moment mutation
  const duplicateMomentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await mockMomentsApi.duplicateMoment(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to duplicate moment');
      }

      return sanitizeMoment(response.data);
    },
    onSuccess: (duplicatedMoment) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments });
      toast.success(`Moment duplicated as "${duplicatedMoment.name}"`);
    },
    onError: (error: Error) => {
      logMomentError(error, undefined, 'duplicateMoment');
      toast.error(`Failed to duplicate moment: ${error.message}`);
    },
  });

  // Utility functions
  const getMomentById = useCallback((id: string) => {
    return moments?.find(moment => moment.id === id);
  }, [moments]);

  const getFilteredMoments = useCallback((filterOptions: MomentFilters) => {
    if (!moments) return [];

    return moments.filter(moment => {
      // Status filter
      if (filterOptions.status?.length && !filterOptions.status.includes(moment.status)) {
        return false;
      }

      // Channel filter
      if (filterOptions.channel?.length && !filterOptions.channel.includes(moment.channel)) {
        return false;
      }

      // Priority filter
      if (filterOptions.priority?.length && !filterOptions.priority.includes(moment.priority)) {
        return false;
      }

      // Type filter
      if (filterOptions.type?.length && !filterOptions.type.includes(moment.type)) {
        return false;
      }

      // Tags filter
      if (filterOptions.tags?.length) {
        const hasMatchingTag = filterOptions.tags.some(tag => 
          moment.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Created by filter
      if (filterOptions.createdBy && moment.createdBy !== filterOptions.createdBy) {
        return false;
      }

      // Date range filter
      if (filterOptions.dateRange) {
        const momentDate = new Date(moment.createdAt);
        const fromDate = new Date(filterOptions.dateRange.from);
        const toDate = new Date(filterOptions.dateRange.to);
        
        if (momentDate < fromDate || momentDate > toDate) {
          return false;
        }
      }

      // Search filter
      if (filterOptions.search) {
        const searchTerm = filterOptions.search.toLowerCase();
        const searchableText = [
          moment.name,
          moment.description || '',
          moment.channel,
          moment.status,
          moment.priority,
          ...moment.tags,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [moments]);

  const getSortedMoments = useCallback((sortOpts: MomentSortOptions) => {
    if (!moments) return [];

    return [...moments].sort((a, b) => {
      const aValue = a[sortOpts.field];
      const bValue = b[sortOpts.field];

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (sortOpts.field === 'createdAt' || sortOpts.field === 'updatedAt') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        comparison = dateA - dateB;
      }

      return sortOpts.direction === 'desc' ? -comparison : comparison;
    });
  }, [moments]);

  // Apply filters and sorting if provided in options
  const processedMoments = useMemo(() => {
    let result = moments;

    if (result && filters) {
      result = getFilteredMoments(filters);
    }

    if (result && sortOptions) {
      result = getSortedMoments(sortOptions);
    }

    return result;
  }, [moments, filters, sortOptions, getFilteredMoments, getSortedMoments]);

  // Set up real-time updates if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [enableRealtime, queryClient]);

  return {
    moments: processedMoments,
    isLoading,
    error,
    createMoment: createMomentMutation.mutateAsync,
    updateMoment: (id: string, data: Partial<Moment>) => 
      updateMomentMutation.mutateAsync({ id, data }),
    deleteMoment: deleteMomentMutation.mutateAsync,
    duplicateMoment: duplicateMomentMutation.mutateAsync,
    refreshMoments: () => refetch(),
    getMomentById,
    getFilteredMoments,
    getSortedMoments,
  };
};