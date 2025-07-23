// src/components/business/moments/MomentBuilder/ChannelSelector.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

// Types
interface ChannelConfig {
  type: 'email' | 'sms' | 'push' | 'web' | 'in_app';
  enabled: boolean;
  content: any;
  settings: ChannelSettings;
}

interface ChannelSettings {
  deliveryTime?: 'immediate' | 'optimal' | 'scheduled';
  frequency?: 'single' | 'daily' | 'weekly';
  priority?: 'low' | 'normal' | 'high';
  trackingEnabled?: boolean;
  personalizationEnabled?: boolean;
  [key: string]: any;
}

interface ChannelSelectorProps {
  channels: ChannelConfig[];
  availableChannels: string[];
  onChange: (channels: ChannelConfig[]) => void;
  onPreview: (channel: string) => void;
  readOnly?: boolean;
}

interface ChannelInfo {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  features: string[];
  limitations: string[];
  bestPractices: string[];
  metrics: {
    deliveryRate: string;
    openRate: string;
    clickRate: string;
    conversionRate: string;
  };
  settings: ChannelSpecificSettings;
}

interface ChannelSpecificSettings {
  [key: string]: {
    type: 'text' | 'number' | 'select' | 'boolean';
    label: string;
    description: string;
    options?: string[];
    defaultValue: any;
    required?: boolean;
  };
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  availableChannels,
  onChange,
  onPreview,
  readOnly = false
}) => {
  // State Management
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showChannelDetails, setShowChannelDetails] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [activeChannelType, setActiveChannelType] = useState<string>('email');

  // Channel Information
  const channelInfo: Record<string, ChannelInfo> = {
    email: {
      type: 'email',
      name: 'Email',
      icon: EnvelopeIcon,
      description: 'Reach customers through their email inbox with rich, personalized content',
      features: [
        'Rich HTML content',
        'Attachments support',
        'Advanced personalization',
        'A/B testing',
        'Detailed analytics'
      ],
      limitations: [
        'Spam filters may block messages',
        'Lower open rates on mobile',
        'Requires valid email addresses'
      ],
      bestPractices: [
        'Keep subject lines under 50 characters',
        'Use compelling CTAs',
        'Optimize for mobile viewing',
        'Test different send times'
      ],
      metrics: {
        deliveryRate: '97.8%',
        openRate: '22.3%',
        clickRate: '3.1%',
        conversionRate: '1.2%'
      },
      settings: {
        fromName: {
          type: 'text',
          label: 'From Name',
          description: 'Sender name displayed to recipients',
          defaultValue: 'Your Company',
          required: true
        },
        fromEmail: {
          type: 'text',
          label: 'From Email',
          description: 'Sender email address',
          defaultValue: 'noreply@yourcompany.com',
          required: true
        },
        replyTo: {
          type: 'text',
          label: 'Reply To',
          description: 'Email address for replies',
          defaultValue: 'support@yourcompany.com'
        },
        trackOpens: {
          type: 'boolean',
          label: 'Track Opens',
          description: 'Track when emails are opened',
          defaultValue: true
        },
        trackClicks: {
          type: 'boolean',
          label: 'Track Clicks',
          description: 'Track clicks on links',
          defaultValue: true
        }
      }
    },
    sms: {
      type: 'sms',
      name: 'SMS',
      icon: DevicePhoneMobileIcon,
      description: 'Send direct text messages to customers\' mobile phones',
      features: [
        'High open rates (98%)',
        'Immediate delivery',
        'Global reach',
        'Unicode support',
        'Delivery confirmations'
      ],
      limitations: [
        '160 character limit per message',
        'Higher cost per message',
        'Limited formatting options',
        'Requires phone numbers'
      ],
      bestPractices: [
        'Keep messages concise and clear',
        'Include clear CTAs',
        'Respect time zones',
        'Provide opt-out instructions'
      ],
      metrics: {
        deliveryRate: '95.2%',
        openRate: '98.0%',
        clickRate: '8.5%',
        conversionRate: '4.2%'
      },
      settings: {
        senderId: {
          type: 'text',
          label: 'Sender ID',
          description: 'Sender identifier (11 characters max)',
          defaultValue: 'YourBrand'
        },
        messageType: {
          type: 'select',
          label: 'Message Type',
          description: 'Type of SMS message',
          options: ['Transactional', 'Promotional', 'OTP'],
          defaultValue: 'Promotional'
        },
        unicode: {
          type: 'boolean',
          label: 'Enable Unicode',
          description: 'Support for special characters and emojis',
          defaultValue: false
        },
        deliveryReceipt: {
          type: 'boolean',
          label: 'Delivery Receipt',
          description: 'Request delivery confirmations',
          defaultValue: true
        }
      }
    },
    push: {
      type: 'push',
      name: 'Push Notification',
      icon: BellIcon,
      description: 'Send notifications directly to users\' devices and browsers',
      features: [
        'Real-time delivery',
        'Rich media support',
        'Action buttons',
        'Device targeting',
        'Offline queuing'
      ],
      limitations: [
        'Requires app installation',
        'Limited message length',
        'Permission-based delivery',
        'Platform-specific formatting'
      ],
      bestPractices: [
        'Use compelling titles',
        'Add relevant images',
        'Time messages appropriately',
        'Personalize content'
      ],
      metrics: {
        deliveryRate: '89.5%',
        openRate: '12.8%',
        clickRate: '7.3%',
        conversionRate: '2.8%'
      },
      settings: {
        title: {
          type: 'text',
          label: 'Title',
          description: 'Notification title',
          defaultValue: '',
          required: true
        },
        icon: {
          type: 'text',
          label: 'Icon URL',
          description: 'URL to notification icon',
          defaultValue: ''
        },
        badge: {
          type: 'text',
          label: 'Badge URL',
          description: 'URL to badge icon',
          defaultValue: ''
        },
        sound: {
          type: 'select',
          label: 'Sound',
          description: 'Notification sound',
          options: ['Default', 'Silent', 'Custom'],
          defaultValue: 'Default'
        },
        priority: {
          type: 'select',
          label: 'Priority',
          description: 'Message priority level',
          options: ['Low', 'Normal', 'High'],
          defaultValue: 'Normal'
        }
      }
    },
    web: {
      type: 'web',
      name: 'Web Banner',
      icon: GlobeAltIcon,
      description: 'Display messages as banners or overlays on your website',
      features: [
        'Rich HTML content',
        'Custom styling',
        'Behavioral targeting',
        'A/B testing',
        'Real-time updates'
      ],
      limitations: [
        'Requires website integration',
        'Ad blockers may interfere',
        'Limited to website visitors'
      ],
      bestPractices: [
        'Use eye-catching designs',
        'Ensure mobile responsiveness',
        'Provide easy dismissal',
        'Test across browsers'
      ],
      metrics: {
        deliveryRate: '94.1%',
        openRate: '35.7%',
        clickRate: '5.9%',
        conversionRate: '3.4%'
      },
      settings: {
        position: {
          type: 'select',
          label: 'Position',
          description: 'Banner position on page',
          options: ['Top', 'Bottom', 'Center', 'Corner'],
          defaultValue: 'Top'
        },
        displayType: {
          type: 'select',
          label: 'Display Type',
          description: 'How the banner appears',
          options: ['Banner', 'Modal', 'Toast', 'Sidebar'],
          defaultValue: 'Banner'
        },
        dismissible: {
          type: 'boolean',
          label: 'Dismissible',
          description: 'Allow users to close the banner',
          defaultValue: true
        },
        autoHide: {
          type: 'number',
          label: 'Auto Hide (seconds)',
          description: 'Automatically hide after specified seconds (0 = never)',
          defaultValue: 0
        }
      }
    },
    in_app: {
      type: 'in_app',
      name: 'In-App Message',
      icon: ComputerDesktopIcon,
      description: 'Show messages within your mobile or web application',
      features: [
        'Contextual targeting',
        'Rich media support',
        'Interactive elements',
        'Event-based triggers',
        'Session tracking'
      ],
      limitations: [
        'Requires app integration',
        'Limited to active users',
        'Development resources needed'
      ],
      bestPractices: [
        'Show at relevant moments',
        'Use clear messaging',
        'Avoid interrupting workflows',
        'Provide value to users'
      ],
      metrics: {
        deliveryRate: '91.3%',
        openRate: '45.2%',
        clickRate: '12.1%',
        conversionRate: '6.8%'
      },
      settings: {
        trigger: {
          type: 'select',
          label: 'Trigger Event',
          description: 'When to show the message',
          options: ['App Open', 'Page View', 'Button Click', 'Time Spent'],
          defaultValue: 'Page View'
        },
        displayDuration: {
          type: 'number',
          label: 'Display Duration (ms)',
          description: 'How long to show the message',
          defaultValue: 5000
        },
        overlay: {
          type: 'boolean',
          label: 'Show Overlay',
          description: 'Dim background when showing message',
          defaultValue: true
        },
        animation: {
          type: 'select',
          label: 'Animation',
          description: 'Message animation style',
          options: ['Fade', 'Slide', 'Bounce', 'None'],
          defaultValue: 'Fade'
        }
      }
    }
  };

  // Event Handlers
  const toggleChannel = useCallback((channelType: string) => {
    const updatedChannels = channels.map(channel => {
      if (channel.type === channelType) {
        return { ...channel, enabled: !channel.enabled };
      }
      return channel;
    });

    // Add channel if it doesn't exist
    if (!channels.find(c => c.type === channelType)) {
      const defaultSettings = Object.entries(channelInfo[channelType]?.settings || {})
        .reduce((acc, [key, setting]) => {
          acc[key] = setting.defaultValue;
          return acc;
        }, {} as any);

      updatedChannels.push({
        type: channelType as any,
        enabled: true,
        content: {},
        settings: defaultSettings
      });
    }

    onChange(updatedChannels);
  }, [channels, onChange, channelInfo]);

  const updateChannelSettings = useCallback((channelType: string, settings: ChannelSettings) => {
    const updatedChannels = channels.map(channel => {
      if (channel.type === channelType) {
        return { ...channel, settings: { ...channel.settings, ...settings } };
      }
      return channel;
    });
    onChange(updatedChannels);
  }, [channels, onChange]);

  const isChannelEnabled = useCallback((channelType: string) => {
    const channel = channels.find(c => c.type === channelType);
    return channel?.enabled || false;
  }, [channels]);

  const getChannelSettings = useCallback((channelType: string) => {
    const channel = channels.find(c => c.type === channelType);
    return channel?.settings || {};
  }, [channels]);

  // Computed values
  const enabledChannelsCount = useMemo(() => {
    return channels.filter(c => c.enabled).length;
  }, [channels]);

  const totalReach = useMemo(() => {
    // Mock calculation based on enabled channels
    let reach = 0;
    channels.forEach(channel => {
      if (channel.enabled) {
        switch (channel.type) {
          case 'email': reach += 85000; break;
          case 'sms': reach += 62000; break;
          case 'push': reach += 48000; break;
          case 'web': reach += 125000; break;
          case 'in_app': reach += 35000; break;
        }
      }
    });
    return reach;
  }, [channels]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Channel Overview</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{enabledChannelsCount} channels selected</span>
              <span>~{totalReach.toLocaleString()} potential reach</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-900">Email</div>
              <div className="text-xs text-blue-600">85K reach</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <DevicePhoneMobileIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-900">SMS</div>
              <div className="text-xs text-green-600">62K reach</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <BellIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-purple-900">Push</div>
              <div className="text-xs text-purple-600">48K reach</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <GlobeAltIcon className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-orange-900">Web</div>
              <div className="text-xs text-orange-600">125K reach</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export { ChannelSelector };
export default ChannelSelector;