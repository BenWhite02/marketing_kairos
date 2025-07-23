// src/components/business/integrations/IntegrationCard.tsx
import React from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

interface IntegrationCardProps {
  integration: {
    id: string;
    name: string;
    description: string;
    category: string;
    provider: string;
    logo: string;
    status: 'connected' | 'disconnected' | 'error' | 'setup';
    popularity?: number;
    lastSync?: string;
    syncHealth: 'healthy' | 'warning' | 'error';
    features: string[];
    setupTime: string;
    isPremium?: boolean;
    isNew?: boolean;
  };
  onConnect: (integrationId: string) => void;
  onConfigure: (integrationId: string) => void;
  onViewDetails: (integrationId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    case 'setup':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return <XCircleIcon className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'error':
      return 'Error';
    case 'setup':
      return 'Setup Required';
    default:
      return 'Not Connected';
  }
};

const getSyncHealthIndicator = (health: string) => {
  const colorMap = {
    healthy: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400'
  };
  
  return <div className={`w-2 h-2 ${colorMap[health]} rounded-full`}></div>;
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onConfigure,
  onViewDetails,
  size = 'md',
  showActions = true
}) => {
  const cardSizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg'
  };

  return (
    <Card className={`relative hover:shadow-lg transition-all duration-200 ${cardSizeClasses[size]}`}>
      {/* Status Badges */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {integration.isNew && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            New
          </span>
        )}
        {integration.isPremium && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            Premium
          </span>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl border border-gray-200">
              {integration.logo}
            </div>
          </div>
          
          {/* Integration Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {integration.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">{integration.provider}</p>
            
            {/* Status */}
            <div className="flex items-center">
              {getStatusIcon(integration.status)}
              <span className="ml-2 text-sm text-gray-600">
                {getStatusText(integration.status)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="py-4">
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {integration.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-4">
          {integration.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full whitespace-nowrap"
            >
              {feature}
            </span>
          ))}
          {integration.features.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
              +{integration.features.length - 3} more
            </span>
          )}
        </div>

        {/* Connection Details */}
        {integration.status === 'connected' && integration.lastSync && (
          <div className="flex items-center justify-between text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getSyncHealthIndicator(integration.syncHealth)}
              <span className="ml-2">Last sync: {integration.lastSync}</span>
            </div>
            {integration.popularity && (
              <div className="flex items-center">
                <span>Popularity: {integration.popularity}%</span>
              </div>
            )}
          </div>
        )}
      </CardBody>

      {showActions && (
        <CardFooter className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            {/* Setup Time */}
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span>{integration.setupTime} setup</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {integration.status === 'connected' ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onConfigure(integration.id)}
                    className="flex items-center"
                  >
                    <CogIcon className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(integration.id)}
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Button>
                </>
              ) : integration.status === 'setup' ? (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onConnect(integration.id)}
                >
                  Complete Setup
                </Button>
              ) : integration.status === 'error' ? (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onConfigure(integration.id)}
                >
                  Fix Connection
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onConnect(integration.id)}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// Export component and types
export type { IntegrationCardProps };
export default IntegrationCard;