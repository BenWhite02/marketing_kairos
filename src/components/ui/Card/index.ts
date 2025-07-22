// src/components/ui/Card/index.ts

// Export the base Card component and its variants
export { 
  Card, 
  cardVariants,
  CardTitle, 
  CardDescription, 
  CardContent
} from './Card';

// Export standalone component versions (these are what the business components need)
export { CardHeader } from './CardHeader';
export { CardBody } from './CardBody';  // This was missing! 
export { CardFooter } from './CardFooter';

// Export types
export type { CardProps } from './Card';
export type { CardHeaderProps } from './CardHeader';
export type { CardBodyProps } from './CardBody';
export type { CardFooterProps } from './CardFooter';

// Note: The business components are importing the standalone versions:
// - CardHeader from './CardHeader.tsx' (more features than Card.tsx version)
// - CardBody from './CardBody.tsx' (this was completely missing from exports!)
// - CardFooter from './CardFooter.tsx' (more features than Card.tsx version)