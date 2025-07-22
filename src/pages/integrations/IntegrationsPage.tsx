// src/pages/integrations/IntegrationsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import IntegrationsDashboard from '../../components/features/Integrations/IntegrationsDashboard';
import IntegrationMarketplace from '../../components/features/Integrations/IntegrationMarketplace';
import CRMConnector from '../../components/features/Integrations/CRM/CRMConnector';
import EmailProviderConnector from '../../components/features/Integrations/Email/EmailProviderConnector';
import DataWarehouseConnector from '../../components/features/Integrations/DataWarehouse/DataWarehouseConnector';
import { useIntegrationStore } from '../../stores/integrations/integrationStore';
import { 
  Integration, 
  IntegrationTemplate, 
  CRMProvider, 
  EmailProvider, 
  DataWarehouseProvider 
} from '../../types/integrations';

type ViewMode = 'dashboard' | 'marketplace' | 'connector' | 'config' | 'health';

interface IntegrationsPageProps {
  // Optional props for deep linking
  initialView?: ViewMode;
  integrationId?: string;
}

const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  initialView = 'dashboard',
  integrationId
}) => {
  const {
    integrations,
    selectedIntegration,
    selectedTemplate,
    createIntegration,
    updateIntegration,
    testConnection,
    setSelectedIntegration,
    setSelectedTemplate
  } = useIntegrationStore();

  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected integration from URL parameter
  useEffect(() => {
    if (integrationId && integrations.length > 0) {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        setSelectedIntegration(integration);
        setCurrentView('config');
      }
    }
  }, [integrationId, integrations, setSelectedIntegration]);

  const handleAddIntegration = () => {
    setCurrentView('marketplace');
    setIsCreating(true);
  };

  const handleSelectTemplate = async (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('connector');
  };

  const handleEditIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setSelectedIntegration(integration);
      setCurrentView('config');
      setIsCreating(false);
    }
  };

  const handleViewIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setSelectedIntegration(integration);
      setCurrentView('health');
    }
  };

  const handleSaveIntegration = async (config: any) => {
    try {
      setError(null);
      
      if (isCreating && selectedTemplate) {
        const newIntegration = await createIntegration(selectedTemplate, config);
        setSelectedIntegration(newIntegration);
        setIsCreating(false);
        setCurrentView('dashboard');
        
        // Show success notification
        console.log('Integration created successfully:', newIntegration.name);
      } else if (selectedIntegration) {
        await updateIntegration(selectedIntegration.id, config);
        setCurrentView('dashboard');
        
        // Show success notification
        console.log('Integration updated successfully:', selectedIntegration.name);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save integration');
    }
  };

  const handleTestConnection = async (config: any): Promise<boolean> => {
    try {
      if (selectedIntegration) {
        return await testConnection(selectedIntegration.id);
      } else {
        // For new integrations, simulate test
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Math.random() > 0.2; // 80% success rate
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleCancel = () => {
    setSelectedIntegration(null);
    setSelectedTemplate(null);
    setCurrentView('dashboard');
    setIsCreating(false);
    setError(null);
  };

  const getConnectorComponent = () => {
    if (!selectedTemplate && !selectedIntegration) return null;

    const template = selectedTemplate;
    const integration = selectedIntegration as any;

    // Determine provider type
    if (template?.category === 'customer-data' || integration?.type === 'crm') {
      const provider = template?.provider.toLowerCase() as CRMProvider || integration?.provider;
      return (
        <CRMConnector
          integration={integration}
          provider={provider}
          onSave={handleSaveIntegration}
          onTest={handleTestConnection}
          onCancel={handleCancel}
          isEditing={!isCreating}
        />
      );
    }

    if (template?.category === 'communication' || integration?.type === 'email-provider') {
      const provider = template?.provider.toLowerCase() as EmailProvider || integration?.provider;
      return (
        <EmailProviderConnector
          integration={integration}
          provider={provider}
          onSave={handleSaveIntegration}
          onTest={handleTestConnection}
          onCancel={handleCancel}
          isEditing={!isCreating}
        />
      );
    }

    if (template?.category === 'data-storage' || integration?.type === 'data-warehouse') {
      const provider = template?.provider.toLowerCase() as DataWarehouseProvider || integration?.provider;
      return (
        <DataWarehouseConnector
          integration={integration}
          provider={provider}
          onSave={handleSaveIntegration}
          onTest={handleTestConnection}
          onCancel={handleCancel}
          isEditing={!isCreating}
        />
      );
    }

    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connector Not Available
        </h3>
        <p className="text-gray-600">
          A connector for this integration type is not yet available.
        </p>
        <Button variant="outline" onClick={handleCancel} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  };

  const renderHealthView = () => {
    if (!selectedIntegration) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              icon={ArrowLeftIcon}
              onClick={() => setCurrentView('dashboard')}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedIntegration.name}
              </h1>
              <p className="text-gray-600">Integration health and performance</p>
            </div>
          </div>
          <Button
            variant="outline"
            icon={Cog6ToothIcon}
            onClick={() => {
              setCurrentView('config');
              setIsCreating(false);
            }}
          >
            Configure
          </Button>
        </div>

        {/* Health Content - This would be a detailed health dashboard */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Health Dashboard Coming Soon
          </h3>
          <p className="text-gray-600">
            Detailed integration health, performance metrics, and monitoring will be available here.
          </p>
        </div>
      </div>
    );
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'marketplace':
        return 'Integration Marketplace';
      case 'connector':
        return isCreating ? 'Add Integration' : 'Configure Integration';
      case 'config':
        return 'Configure Integration';
      case 'health':
        return 'Integration Health';
      default:
        return 'Integrations';
    }
  };

  const showBackButton = currentView !== 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-600 border-red-300 hover:border-red-400"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        {showBackButton && (
          <div className="mb-6">
            <Button
              variant="ghost"
              icon={ArrowLeftIcon}
              onClick={handleCancel}
            >
              Back to Integrations
            </Button>
          </div>
        )}

        {/* Page Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'dashboard' && (
            <IntegrationsDashboard
              onAddIntegration={handleAddIntegration}
              onEditIntegration={handleEditIntegration}
              onViewIntegration={handleViewIntegration}
            />
          )}

          {currentView === 'marketplace' && (
            <IntegrationMarketplace
              onSelectTemplate={handleSelectTemplate}
              onClose={handleCancel}
            />
          )}

          {currentView === 'connector' && getConnectorComponent()}

          {currentView === 'config' && getConnectorComponent()}

          {currentView === 'health' && renderHealthView()}
        </motion.div>
      </div>

      {/* Help Modal - Optional feature for future */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Integration Help"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Need help setting up your integrations? Here are some resources:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Check our comprehensive documentation</li>
            <li>Watch setup tutorials for each provider</li>
            <li>Contact our support team for assistance</li>
            <li>Join our community forum for tips and tricks</li>
          </ul>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.open('https://docs.kairos.com/integrations', '_blank');
                setShowModal(false);
              }}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IntegrationsPage;