// src/components/features/DragAndDrop/index.ts

export { DragDropCanvas } from './DragDropCanvas';
export { DraggableAtom } from './DraggableAtom';
export { DropZone } from './DropZone';

// Types
export interface AtomNode {
  id: string;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
  name: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'AND' | 'OR' | 'NOT';
}