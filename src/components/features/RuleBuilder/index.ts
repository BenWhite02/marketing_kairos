// src/components/features/RuleBuilder/index.ts

export { RuleBuilder } from './RuleBuilder';
export { LogicGate } from './LogicGate';
export { ConnectionLine } from './ConnectionLine';

// Types
export interface RuleNode {
  id: string;
  type: 'atom' | 'gate' | 'group';
  operation?: 'AND' | 'OR' | 'NOT';
  atomId?: string;
  children?: RuleNode[];
  position?: { x: number; y: number };
  metadata?: {
    name?: string;
    description?: string;
    weight?: number;
  };
}

export interface Point {
  x: number;
  y: number;
}