// File: src/components/ui/Modal/ConfirmModal.tsx
import React from 'react';
import { Modal, type ModalProps } from './Modal';
import { Button } from '../Button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// Confirmation types
export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

// Component prop types
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** Type of confirmation dialog */
  type?: ConfirmationType;
  /** Confirmation message */
  message: React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Function called when user confirms */
  onConfirm: () => void;
  /** Function called when user cancels */
  onCancel?: () => void;
  /** Whether confirm action is loading */
  isConfirming?: boolean;
  /** Additional details */
  details?: React.ReactNode;
  /** Custom icon */
  icon?: React.ReactNode;
}

// Type configurations
const typeConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    confirmVariant: 'destructive' as const,
    confirmText: 'Delete',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    confirmVariant: 'warning' as const,
    confirmText: 'Continue',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmVariant: 'primary' as const,
    confirmText: 'Confirm',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmVariant: 'success' as const,
    confirmText: 'Continue',
  },
};

// ConfirmModal component
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  type = 'info',
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  isConfirming = false,
  details,
  icon,
  ...modalProps
}) => {
  const config = typeConfig[type];
  const IconComponent = icon || config.icon;
  const finalConfirmText = confirmText || config.confirmText;

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            isLoading={isConfirming}
            loadingText="Processing..."
          >
            {finalConfirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <IconComponent className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 mb-2">
            {message}
          </div>
          
          {details && (
            <div className="text-sm text-gray-500">
              {details}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

ConfirmModal.displayName = 'ConfirmModal';