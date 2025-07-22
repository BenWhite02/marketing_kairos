// src/components/business/atoms/AtomComposer/index.ts

export { AtomComposer } from './AtomComposer';
export { CompositionCanvas } from './CompositionCanvas';
export { AtomPalette } from './AtomPalette';

// Types
export interface AtomComposition {
  id: string;
  name: string;
  description: string;
  atoms: import('../../features/DragAndDrop').AtomNode[];
  connections: import('../../features/DragAndDrop').Connection[];
  rules: import('../../features/RuleBuilder').RuleNode[];
  status: 'draft' | 'testing' | 'active' | 'inactive';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    accuracy: number;
    coverage: number;
    performance: number;
    usage: number;
  };
}

export interface AtomTemplate {
  id: string;
  name: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  category: string;
  data: Record<string, any>;
  accuracy: number;
  usage: number;
  description?: string;
  tags?: string[];
  isPopular?: boolean;
  isFavorite?: boolean;
}