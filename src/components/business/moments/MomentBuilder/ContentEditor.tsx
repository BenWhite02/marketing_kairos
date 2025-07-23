// src/components/business/moments/MomentBuilder/ContentEditor.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input, TextArea } from '../../../ui/Input';

interface ContentEditorProps {
  content: any;
  onChange: (content: any) => void;
  channelType: string;
  readOnly?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  channelType,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const handleContentChange = (field: string, value: any) => {
    onChange({
      ...content,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Content Editor</h3>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'editor' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {activeTab === 'editor' ? (
          <div className="space-y-4">
            <Input
              label="Subject Line"
              value={content.subject || ''}
              onChange={(e) => handleContentChange('subject', e.target.value)}
              disabled={readOnly}
              placeholder="Enter compelling subject line..."
            />
            <TextArea
              label="Message Content"
              value={content.body || ''}
              onChange={(e) => handleContentChange('body', e.target.value)}
              disabled={readOnly}
              rows={8}
              placeholder="Craft your message content..."
            />
            {channelType === 'email' && (
              <Input
                label="Call-to-Action URL"
                value={content.ctaUrl || ''}
                onChange={(e) => handleContentChange('ctaUrl', e.target.value)}
                disabled={readOnly}
                placeholder="https://example.com/landing-page"
              />
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">{content.subject || 'Subject Line'}</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {content.body || 'Message content will appear here...'}
            </div>
            {content.ctaUrl && (
              <div className="mt-4">
                <Button size="sm">Call to Action</Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};