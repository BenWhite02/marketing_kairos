// src/pages/moments/MomentBuilderPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { MomentBuilder, MomentConfig } from '../../components/business/moments/MomentBuilder';

const MomentBuilderPage: React.FC = () => {
  const { momentId } = useParams<{ momentId: string }>();
  const navigate = useNavigate();
  
  // State Management
  const [moment, setMoment] = useState<MomentConfig | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewChannel, setPreviewChannel] = useState('email');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock available data
  const availableChannels = ['email', 'sms', 'push', 'web', 'in_app'];
  const availableAtoms = [
    {
      id: 'firstName',
      name: 'firstName',
      displayName: 'First Name',
      category: 'Demographics',
      type: 'demographic',
      description: 'Customer\'s first name',
      dataType: 'string',
      accuracy: 95,
      usage: 1240,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'age_group',
      name: 'age_group',
      displayName: 'Age Group',
      category: 'Demographics',
      type: 'demographic',
      description: 'Customer age group classification',
      dataType: 'string',
      accuracy: 95,
      usage: 1240,
      lastUpdated: '2024-01-15',
      possibleValues: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    },
    {
      id: 'purchase_history',
      name: 'purchase_history',
      displayName: 'Purchase History',
      category: 'Purchase Behavior',
      type: 'transactional',
      description: 'Customer\'s purchase history',
      dataType: 'array',
      accuracy: 99,
      usage: 1890,
      lastUpdated: '2024-01-18'
    }
  ];

  const templates = [
    {
      id: 'welcome_email',
      name: 'Welcome Email',
      category: 'Onboarding',
      preview: 'Welcome to our platform! We\'re excited to have you join us...',
      content: {
        subject: 'Welcome to {{company}}!',
        title: 'Welcome, {{firstName}}!',
        body: `Hi {{firstName}},\n\nWelcome to our platform! We're excited to have you join our community.`,
        cta: 'Get Started'
      },
      tags: ['welcome', 'onboarding', 'email'],
      usageCount: 245
    }
  ];

  // Load moment data
  useEffect(() => {
    if (momentId && momentId !== 'new') {
      setIsLoading(true);
      // Mock API call to load existing moment
      setTimeout(() => {
        // This would be replaced with actual API call
        const mockMoment: MomentConfig = {
          id: momentId,
          name: 'Example Moment',
          description: 'An example moment for demonstration',
          type: 'triggered',
          status: 'draft',
          priority: 'medium',
          channels: [
            {
              type: 'email',
              enabled: true,
              content: {},
              settings: {}
            }
          ],
          audience: {
            name: 'New Users',
            description: 'Users who signed up in the last 7 days',
            atoms: ['firstName'],
            estimatedSize: 1250,
            rules: []
          },
          content: {
            title: 'Welcome to Our Platform',
            body: 'Hi {{firstName}}, welcome to our amazing platform!',
            cta: 'Get Started',
            assets: [],
            variables: []
          },
          scheduling: {
            type: 'immediate',
            timezone: 'UTC',
            triggers: []
          },
          personalization: {
            enabled: false,
            rules: [],
            variables: []
          },
          testing: {
            enabled: false,
            type: 'ab',
            variants: [],
            allocation: [100]
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user'
        };
        setMoment(mockMoment);
        setIsLoading(false);
      }, 1000);
    }
  }, [momentId]);

  // Event Handlers
  const handleSave = useCallback(async (momentData: MomentConfig) => {
    setIsSaving(true);
    try {
      // Mock API call to save moment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving moment:', momentData);
      
      setMoment(momentData);
      setHasUnsavedChanges(false);
      
      // Show success message (in real app, would use toast/notification)
      alert('Moment saved successfully!');
      
    } catch (error) {
      console.error('Error saving moment:', error);
      alert('Error saving moment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      navigate('/moments');
    }
  }, [hasUnsavedChanges, navigate]);

  const handlePreview = useCallback((momentData: MomentConfig, channel: string) => {
    console.log('Previewing moment:', momentData, 'on channel:', channel);
    setPreviewChannel(channel);
    setShowPreview(true);
  }, []);

  const handleTest = useCallback((momentData: MomentConfig) => {
    console.log('Testing moment:', momentData);
    // Mock test functionality
    alert('Test functionality will send a preview to your email address.');
  }, []);

  const handleDeploy = useCallback(async (momentData: MomentConfig) => {
    if (momentData.status === 'draft') {
      try {
        setIsSaving(true);
        
        // Mock deployment API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const deployedMoment = {
          ...momentData,
          status: 'active' as const,
          updatedAt: new Date().toISOString()
        };
        
        setMoment(deployedMoment);
        setHasUnsavedChanges(false);
        
        alert('Moment deployed successfully and is now active!');
        
        // Navigate back to moments list
        navigate('/moments');
        
      } catch (error) {
        console.error('Error deploying moment:', error);
        alert('Error deploying moment. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  }, [navigate]);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    navigate('/moments');
  }, [navigate]);

  const cancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header with Status */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Moments
            </Button>
            
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {momentId === 'new' ? 'Create New Moment' : 'Edit Moment'}
              </h1>
              {moment && (
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    {moment.name || 'Untitled Moment'}
                  </p>
                  
                  {/* Status Badge */}
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    moment.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : moment.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : moment.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {moment.status.charAt(0).toUpperCase() + moment.status.slice(1)}
                  </div>
                  
                  {hasUnsavedChanges && (
                    <div className="flex items-center text-amber-600 text-sm">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      Unsaved changes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {moment && moment.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDeploy(moment)}
                loading={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketLaunchIcon className="w-4 h-4 mr-2" />
                Deploy Live
              </Button>
            )}
            
            <div className="text-xs text-gray-500">
              {moment && (
                <div>
                  Last saved: {new Date(moment.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {momentId === 'new' || moment ? (
          <MomentBuilder
            moment={moment}
            onSave={handleSave}
            onCancel={handleCancel}
            onPreview={handlePreview}
            onTest={handleTest}
            availableChannels={availableChannels}
            availableAtoms={availableAtoms}
            templates={templates}
            readOnly={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Moment not found</h3>
              <p className="text-gray-600 mb-6">
                The moment you're looking for doesn't exist or has been deleted.
              </p>
              <Button variant="primary" onClick={() => navigate('/moments')}>
                Back to Moments
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={cancelExit}
        title="Unsaved Changes"
        size="sm"
      >
        <div className="p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">You have unsaved changes</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave? Your changes will be lost.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={cancelExit}>
                Stay and Continue Editing
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmExit}
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Without Saving
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Preview - ${previewChannel.charAt(0).toUpperCase() + previewChannel.slice(1)}`}
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  This is how your moment will appear to recipients
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Channel: {previewChannel}
              </div>
            </div>

            {/* Mock Preview Content */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              {previewChannel === 'email' && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <div className="text-sm text-gray-500">Subject:</div>
                    <div className="font-medium">{moment?.content.subject || moment?.content.title}</div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-3">{moment?.content.title}</h2>
                    <div className="prose prose-sm max-w-none">
                      <p>{moment?.content.body}</p>
                    </div>
                    {moment?.content.cta && (
                      <div className="mt-4">
                        <Button variant="primary">{moment.content.cta}</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {previewChannel === 'sms' && (
                <div className="max-w-sm mx-auto">
                  <div className="bg-blue-500 text-white p-3 rounded-lg rounded-br-sm">
                    <p className="text-sm">
                      {moment?.content.body} {moment?.content.cta && `\n\n${moment.content.cta}`}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Character count: {(moment?.content.body?.length || 0) + (moment?.content.cta?.length || 0)}
                  </div>
                </div>
              )}

              {previewChannel === 'push' && (
                <div className="max-w-sm mx-auto">
                  <div className="bg-gray-800 text-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium">Your App</span>
                    </div>
                    <h3 className="font-medium mb-1">{moment?.content.title}</h3>
                    <p className="text-sm text-gray-300">{moment?.content.body}</p>
                  </div>
                </div>
              )}

              {(previewChannel === 'web' || previewChannel === 'in_app') && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-500">
                    <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>{previewChannel === 'web' ? 'Web banner' : 'In-app message'} preview</p>
                    <p className="text-sm mt-1">Will be available in Phase 2</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Variables will be replaced with actual customer data
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Send Test
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MomentBuilderPage;