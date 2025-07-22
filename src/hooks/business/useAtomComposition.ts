// src/hooks/business/useAtomComposition.ts

import { useState, useEffect, useCallback } from 'react';
import type { AtomComposition, AtomTemplate } from '../../components/business/atoms/AtomComposer';
import type { AtomNode, Connection } from '../../components/features/DragAndDrop';
import type { RuleNode } from '../../components/features/RuleBuilder';

interface UseAtomCompositionReturn {
  composition: AtomComposition | null;
  availableAtoms: AtomTemplate[] | null;
  isLoading: boolean;
  error: string | null;
  saveComposition: (composition: AtomComposition) => Promise<AtomComposition>;
  testComposition: (composition: AtomComposition) => Promise<any>;
  deployComposition: (composition: AtomComposition) => Promise<void>;
  duplicateComposition: (compositionId: string) => Promise<AtomComposition>;
  deleteComposition: (compositionId: string) => Promise<void>;
  refreshComposition: () => Promise<void>;
}

// Mock API delay function
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in a real app, this would be API calls)
const mockCompositions: Record<string, AtomComposition> = {
  'comp-1': {
    id: 'comp-1',
    name: 'High-Value Mobile Users',
    description: 'Target high-value customers who primarily use mobile devices',
    atoms: [
      {
        id: 'atom-1',
        type: 'demographic',
        name: 'Age 25-45',
        position: { x: 100, y: 100 },
        data: { minAge: 25, maxAge: 45 }
      },
      {
        id: 'atom-2',
        type: 'behavioral',
        name: 'Mobile First',
        position: { x: 300, y: 100 },
        data: { primaryDevice: 'mobile' }
      },
      {
        id: 'atom-3',
        type: 'transactional',
        name: 'High LTV',
        position: { x: 200, y: 250 },
        data: { minLifetimeValue: 1000 }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceId: 'atom-1',
        targetId: 'atom-3',
        type: 'AND'
      },
      {
        id: 'conn-2',
        sourceId: 'atom-2',
        targetId: 'atom-3',
        type: 'AND'
      }
    ],
    rules: [
      {
        id: 'rule-1',
        type: 'gate',
        operation: 'AND',
        children: [
          {
            id: 'rule-atom-1',
            type: 'atom',
            atomId: 'atom-1'
          },
          {
            id: 'rule-atom-2',
            type: 'atom',
            atomId: 'atom-2'
          }
        ]
      }
    ],
    status: 'draft',
    version: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    metrics: {
      accuracy: 87,
      coverage: 65,
      performance: 120,
      usage: 2340
    }
  }
};

export const useAtomComposition = (compositionId?: string): UseAtomCompositionReturn => {
  const [composition, setComposition] = useState<AtomComposition | null>(null);
  const [availableAtoms, setAvailableAtoms] = useState<AtomTemplate[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load composition data
  const loadComposition = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockDelay(500); // Simulate API delay
      
      const comp = mockCompositions[id];
      if (!comp) {
        throw new Error(`Composition with ID "${id}" not found`);
      }
      
      setComposition(comp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load composition');
      setComposition(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load available atoms
  const loadAvailableAtoms = useCallback(async () => {
    try {
      await mockDelay(300);
      
      // This would typically come from an API
      const atoms: AtomTemplate[] = [
        {
          id: 'demo-age-1',
          name: 'Age Range 18-34',
          type: 'demographic',
          category: 'Age Groups',
          data: { minAge: 18, maxAge: 34 },
          accuracy: 95,
          usage: 2340,
          description: 'Users between 18 and 34 years old',
          tags: ['millennials', 'young-adults'],
          isPopular: true
        },
        {
          id: 'demo-location-1',
          name: 'Urban Residents',
          type: 'demographic',
          category: 'Geography',
          data: { locationType: 'urban', population: '>50000' },
          accuracy: 88,
          usage: 1890,
          description: 'Users living in urban areas',
          tags: ['city', 'metropolitan']
        },
        {
          id: 'behav-frequency-1',
          name: 'High Purchase Frequency',
          type: 'behavioral',
          category: 'Purchase Behavior',
          data: { minPurchasesPerMonth: 5 },
          accuracy: 92,
          usage: 3210,
          description: 'Users who purchase frequently',
          tags: ['loyal', 'active'],
          isPopular: true
        },
        {
          id: 'trans-value-1',
          name: 'High LTV Customers',
          type: 'transactional',
          category: 'Customer Value',
          data: { minLifetimeValue: 1000, currency: 'USD' },
          accuracy: 96,
          usage: 1567,
          description: 'Customers with high lifetime value',
          tags: ['valuable', 'vip'],
          isFavorite: true
        },
        {
          id: 'context-time-1',
          name: 'Weekend Shoppers',
          type: 'contextual',
          category: 'Shopping Patterns',
          data: { preferredDays: ['saturday', 'sunday'], timeframe: 'weekend' },
          accuracy: 82,
          usage: 2340,
          description: 'Users who shop primarily on weekends',
          tags: ['weekend', 'leisure']
        }
      ];
      
      setAvailableAtoms(atoms);
    } catch (err) {
      console.error('Failed to load available atoms:', err);
    }
  }, []);

  // Save composition
  const saveComposition = useCallback(async (comp: AtomComposition): Promise<AtomComposition> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockDelay(800); // Simulate API delay
      
      // Validate composition
      if (!comp.name.trim()) {
        throw new Error('Composition name is required');
      }
      
      if (comp.atoms.length === 0) {
        throw new Error('At least one atom is required');
      }
      
      // Update or create composition
      const updatedComp: AtomComposition = {
        ...comp,
        updatedAt: new Date(),
        version: comp.version + (comp.id in mockCompositions ? 1 : 0)
      };
      
      // Save to mock storage
      mockCompositions[comp.id] = updatedComp;
      setComposition(updatedComp);
      
      return updatedComp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save composition';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test composition
  const testComposition = useCallback(async (comp: AtomComposition): Promise<any> => {
    await mockDelay(2000); // Simulate longer test time
    
    // Mock test results
    const testResults = {
      accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
      coverage: Math.floor(Math.random() * 30) + 60, // 60-90%
      performance: Math.floor(Math.random() * 100) + 50, // 50-150ms
      sample_size: Math.floor(Math.random() * 10000) + 5000,
      test_date: new Date().toISOString(),
      errors: [],
      warnings: comp.atoms.length > 10 ? ['Large number of atoms may impact performance'] : []
    };
    
    return testResults;
  }, []);

  // Deploy composition
  const deployComposition = useCallback(async (comp: AtomComposition): Promise<void> => {
    setIsLoading(true);
    
    try {
      await mockDelay(1500);
      
      // Update composition status
      const updatedComp = {
        ...comp,
        status: 'active' as const,
        updatedAt: new Date()
      };
      
      mockCompositions[comp.id] = updatedComp;
      setComposition(updatedComp);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy composition';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Duplicate composition
  const duplicateComposition = useCallback(async (compositionId: string): Promise<AtomComposition> => {
    setIsLoading(true);
    
    try {
      await mockDelay(600);
      
      const originalComp = mockCompositions[compositionId];
      if (!originalComp) {
        throw new Error('Original composition not found');
      }
      
      const duplicatedComp: AtomComposition = {
        ...originalComp,
        id: `comp-${Date.now()}`,
        name: `${originalComp.name} (Copy)`,
        status: 'draft',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Generate new IDs for atoms and connections
        atoms: originalComp.atoms.map(atom => ({
          ...atom,
          id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })),
        connections: originalComp.connections.map(conn => ({
          ...conn,
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      mockCompositions[duplicatedComp.id] = duplicatedComp;
      return duplicatedComp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate composition';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete composition
  const deleteComposition = useCallback(async (compositionId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await mockDelay(400);
      
      if (!(compositionId in mockCompositions)) {
        throw new Error('Composition not found');
      }
      
      delete mockCompositions[compositionId];
      
      if (composition?.id === compositionId) {
        setComposition(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete composition';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [composition]);

  // Refresh composition
  const refreshComposition = useCallback(async (): Promise<void> => {
    if (compositionId) {
      await loadComposition(compositionId);
    }
  }, [compositionId, loadComposition]);

  // Load data on mount
  useEffect(() => {
    loadAvailableAtoms();
    
    if (compositionId) {
      loadComposition(compositionId);
    } else {
      // Create new composition
      const newComposition: AtomComposition = {
        id: `comp-${Date.now()}`,
        name: 'New Composition',
        description: '',
        atoms: [],
        connections: [],
        rules: [],
        status: 'draft',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          accuracy: 0,
          coverage: 0,
          performance: 0,
          usage: 0
        }
      };
      setComposition(newComposition);
    }
  }, [compositionId, loadComposition, loadAvailableAtoms]);

  return {
    composition,
    availableAtoms,
    isLoading,
    error,
    saveComposition,
    testComposition,
    deployComposition,
    duplicateComposition,
    deleteComposition,
    refreshComposition
  };
};