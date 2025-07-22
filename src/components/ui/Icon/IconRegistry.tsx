// src/components/ui/Icon/IconRegistry.tsx
import React from 'react';
import {
  // Navigation & Actions
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  
  // Content & Documents
  DocumentIcon,
  DocumentDuplicateIcon, // This is the correct icon name
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  ArchiveBoxIcon,
  ClipboardIcon,
  ClipboardDocumentIcon,
  
  // User & Authentication
  UserIcon,
  UserGroupIcon,
  UserCircleIcon,
  UsersIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ShieldCheckIcon,
  
  // Communication & Media
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  MegaphoneIcon,
  BellIcon,
  
  // Interface & Controls
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  
  // Data & Analytics
  ChartBarIcon,
  ChartPieIcon,
  ChartLineIcon,
  PresentationChartBarIcon,
  TableCellsIcon,
  ListBulletIcon,
  
  // Status & Feedback
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  
  // Time & Calendar
  CalendarIcon,
  CalendarDaysIcon,
  ClockIcon,
  StopwatchIcon,
  
  // Business & Commerce
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BanknotesIcon,
  
  // Technology & Systems
  ServerIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  WifiIcon,
  SignalIcon,
  
  // Maps & Location
  MapPinIcon,
  GlobeAltIcon,
  
  // Social & Sharing
  ShareIcon,
  HeartIcon,
  StarIcon,
  HandThumbUpIcon,
  
  // Utility & Misc
  HomeIcon,
  FireIcon,
  LightBulbIcon,
  BookmarkIcon,
  TagIcon,
  LinkIcon,
  PaperClipIcon,
  PrinterIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

import {
  // Filled versions for active states
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  BellIcon as BellIconSolid
} from '@heroicons/react/24/solid';

// Icon registry with organized categories
export const ICON_REGISTRY = {
  // Navigation & Actions
  plus: PlusIcon,
  minus: MinusIcon,
  close: XMarkIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-down': ChevronDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  
  // Content & Documents
  document: DocumentIcon,
  duplicate: DocumentDuplicateIcon, // Mapped from the problematic DocumentDuplicateIcon
  'document-text': DocumentTextIcon,
  folder: FolderIcon,
  'folder-open': FolderOpenIcon,
  archive: ArchiveBoxIcon,
  clipboard: ClipboardIcon,
  'clipboard-document': ClipboardDocumentIcon,
  
  // User & Authentication
  user: UserIcon,
  'user-group': UserGroupIcon,
  'user-circle': UserCircleIcon,
  users: UsersIcon,
  'lock-closed': LockClosedIcon,
  'lock-open': LockOpenIcon,
  key: KeyIcon,
  'shield-check': ShieldCheckIcon,
  
  // Communication & Media
  envelope: EnvelopeIcon,
  'chat-bubble': ChatBubbleLeftIcon,
  phone: PhoneIcon,
  'video-camera': VideoCameraIcon,
  'speaker-wave': SpeakerWaveIcon,
  megaphone: MegaphoneIcon,
  bell: BellIcon,
  'bell-solid': BellIconSolid,
  
  // Interface & Controls
  settings: Cog6ToothIcon,
  adjustments: AdjustmentsHorizontalIcon,
  filter: FunnelIcon,
  search: MagnifyingGlassIcon,
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,
  pencil: PencilIcon,
  trash: TrashIcon,
  
  // Data & Analytics
  'chart-bar': ChartBarIcon,
  'chart-pie': ChartPieIcon,
  'chart-line': ChartLineIcon,
  'presentation-chart-bar': PresentationChartBarIcon,
  'table-cells': TableCellsIcon,
  'list-bullet': ListBulletIcon,
  
  // Status & Feedback
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'check-circle-solid': CheckCircleIconSolid,
  'x-circle': XCircleIcon,
  'x-circle-solid': XCircleIconSolid,
  'exclamation-triangle': ExclamationTriangleIcon,
  'exclamation-triangle-solid': ExclamationTriangleIconSolid,
  'information-circle': InformationCircleIcon,
  'information-circle-solid': InformationCircleIconSolid,
  'question-mark-circle': QuestionMarkCircleIcon,
  
  // Time & Calendar
  calendar: CalendarIcon,
  'calendar-days': CalendarDaysIcon,
  clock: ClockIcon,
  stopwatch: StopwatchIcon,
  
  // Business & Commerce
  'building-office': BuildingOfficeIcon,
  'currency-dollar': CurrencyDollarIcon,
  'shopping-cart': ShoppingCartIcon,
  'credit-card': CreditCardIcon,
  banknotes: BanknotesIcon,
  
  // Technology & Systems
  server: ServerIcon,
  'computer-desktop': ComputerDesktopIcon,
  'device-phone-mobile': DevicePhoneMobileIcon,
  cloud: CloudIcon,
  wifi: WifiIcon,
  signal: SignalIcon,
  
  // Maps & Location
  'map-pin': MapPinIcon,
  'globe-alt': GlobeAltIcon,
  
  // Social & Sharing
  share: ShareIcon,
  heart: HeartIcon,
  'heart-solid': HeartIconSolid,
  star: StarIcon,
  'star-solid': StarIconSolid,
  'hand-thumb-up': HandThumbUpIcon,
  
  // Utility & Misc
  home: HomeIcon,
  fire: FireIcon,
  'light-bulb': LightBulbIcon,
  bookmark: BookmarkIcon,
  'bookmark-solid': BookmarkIconSolid,
  tag: TagIcon,
  link: LinkIcon,
  'paper-clip': PaperClipIcon,
  printer: PrinterIcon,
  camera: CameraIcon
} as const;

// Type for available icon names
export type IconName = keyof typeof ICON_REGISTRY;

// Icon component props
export interface IconProps {
  /** Icon name from the registry */
  name: IconName;
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility label */
  'aria-label'?: string;
}

// Size mapping
const SIZE_CLASSES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
} as const;

// Icon component with error boundary
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const IconComponent = ICON_REGISTRY[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry. Available icons:`, Object.keys(ICON_REGISTRY));
    // Fallback to question mark for missing icons
    const FallbackIcon = ICON_REGISTRY['question-mark-circle'];
    return (
      <FallbackIcon
        className={`${SIZE_CLASSES[size]} ${className} text-gray-400`}
        aria-label={ariaLabel || `Missing icon: ${name}`}
        {...props}
      />
    );
  }
  
  return (
    <IconComponent
      className={`${SIZE_CLASSES[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    />
  );
};

// Utility function to check if icon exists
export const iconExists = (name: string): name is IconName => {
  return name in ICON_REGISTRY;
};

// Export commonly used icon mappings for easy migration
export const ICON_MAPPINGS = {
  // Legacy mappings for common naming patterns
  'DocumentDuplicateIcon': 'duplicate',
  'DocumentDuplicateIcon': 'duplicate',
  'PlusIcon': 'plus',
  'XMarkIcon': 'close',
  'MagnifyingGlassIcon': 'search',
  'FunnelIcon': 'filter',
  'CalendarIcon': 'calendar',
  'ClockIcon': 'clock',
  'UserGroupIcon': 'user-group',
  'ChartBarIcon': 'chart-bar'
} as const;

// Helper function to get icon name from legacy import
export const getLegacyIconName = (legacyName: string): IconName | null => {
  return ICON_MAPPINGS[legacyName as keyof typeof ICON_MAPPINGS] || null;
};
