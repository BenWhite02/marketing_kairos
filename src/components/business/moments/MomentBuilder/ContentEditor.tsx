// src/components/business/moments/MomentBuilder/ContentEditor.tsx

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
  EyeIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  SparklesIcon,
  VariableIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

// Types
interface ContentConfig {
  subject?: string;
  title: string;
  body: string;
  cta: string;
  assets: string[];
  variables: string[];
  styling?: {
    theme: 'light' | 'dark' | 'brand';
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
  content: Partial<ContentConfig>;
  tags: string[];
  usageCount: number;
}

interface ContentEditorProps {
  content: ContentConfig;
  onChange: (content: ContentConfig) => void;
  templates?: ContentTemplate[];
  readOnly?: boolean;
}

interface PersonalizationVariable {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  description: string;
  example: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  templates = [],
  readOnly = false
}) => {
  // State Management
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'html'>('editor');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [editorHeight, setEditorHeight] = useState(300);

  // Available personalization variables
  const availableVariables: PersonalizationVariable[] = [
    {
      id: 'firstName',
      name: '{{firstName}}',
      displayName: 'First Name',
      type: 'text',
      description: 'Customer\'s first name',
      example: 'John'
    },
    {
      id: 'lastName',
      name: '{{lastName}}',
      displayName: 'Last Name',
      type: 'text',
      description: 'Customer\'s last name',
      example: 'Smith'
    },
    {
      id: 'company',
      name: '{{company}}',
      displayName: 'Company',
      type: 'text',
      description: 'Customer\'s company name',
      example: 'Acme Corp'
    },
    {
      id: 'lastPurchase',
      name: '{{lastPurchaseDate}}',
      displayName: 'Last Purchase Date',
      type: 'date',
      description: 'Date of customer\'s last purchase',
      example: 'March 15, 2024'
    },
    {
      id: 'totalSpent',
      name: '{{totalSpent}}',
      displayName: 'Total Spent',
      type: 'number',
      description: 'Total amount customer has spent',
      example: '$1,234.56'
    },
    {
      id: 'favoriteCategory',
      name: '{{favoriteCategory}}',
      displayName: 'Favorite Category',
      type: 'text',
      description: 'Customer\'s most purchased category',
      example: 'Electronics'
    }
  ];

  // Mock templates
  const mockTemplates: ContentTemplate[] = [
    {
      id: 'welcome_email',
      name: 'Welcome Email',
      category: 'Onboarding',
      preview: 'Welcome to our platform! We\'re excited to have you join us...',
      content: {
        subject: 'Welcome to {{company}}!',
        title: 'Welcome, {{firstName}}!',
        body: `Hi {{firstName}},\n\nWelcome to our platform! We're excited to have you join our community.\n\nHere's what you can do next:\n• Complete your profile\n• Explore our features\n• Connect with other users\n\nIf you have any questions, don't hesitate to reach out.\n\nBest regards,\nThe Team`,
        cta: 'Get Started'
      },
      tags: ['welcome', 'onboarding', 'email'],
      usageCount: 245
    },
    {
      id: 'abandoned_cart',
      name: 'Abandoned Cart Recovery',
      category: 'E-commerce',
      preview: 'Don\'t forget about your items! Complete your purchase today...',
      content: {
        subject: 'Don\'t forget your items, {{firstName}}!',
        title: 'Complete Your Purchase',
        body: `Hi {{firstName}},\n\nYou left some great items in your cart! Don't miss out on:\n\n• [Product Name] - $XX.XX\n• [Product Name] - $XX.XX\n\nComplete your purchase now and get free shipping on orders over $50.\n\nYour cart will be saved for 7 days.`,
        cta: 'Complete Purchase'
      },
      tags: ['cart', 'recovery', 'e-commerce'],
      usageCount: 189
    },
    {
      id: 'birthday_special',
      name: 'Birthday Special Offer',
      category: 'Promotional',
      preview: 'Happy Birthday! Celebrate with an exclusive offer just for you...',
      content: {
        subject: 'Happy Birthday, {{firstName}}! 🎉',
        title: 'It\'s Your Special Day!',
        body: `Happy Birthday, {{firstName}}! 🎂\n\nTo celebrate your special day, we're giving you an exclusive 25% off your next purchase.\n\nUse code: BIRTHDAY25\n\nThis offer is valid for the next 7 days, so don't wait!\n\nHave a wonderful birthday!`,
        cta: 'Shop Now'
      },
      tags: ['birthday', 'promotion', 'discount'],
      usageCount: 156
    }
  ];

  // Event Handlers
  const updateContent = useCallback((updates: Partial<ContentConfig>) => {
    onChange({
      ...content,
      ...updates
    });
  }, [content, onChange]);

  const handleTemplateSelect = useCallback((template: ContentTemplate) => {
    const newContent = {
      ...content,
      ...template.content
    };
    onChange(newContent);
    setShowTemplates(false);
  }, [content, onChange]);

  const insertVariable = useCallback((variable: PersonalizationVariable) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = content.body;
    
    const newValue = currentValue.substring(0, start) + 
                    variable.name + 
                    currentValue.substring(end);
    
    updateContent({ body: newValue });
    
    // Update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.name.length, start + variable.name.length);
    }, 0);
    
    setShowVariables(false);
  }, [content.body, updateContent]);

  const handleTextFormat = useCallback((format: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.body.substring(start, end);
    
    if (selectedText) {
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        case 'code':
          formattedText = `\`${selectedText}\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newValue = content.body.substring(0, start) + 
                      formattedText + 
                      content.body.substring(end);
      
      updateContent({ body: newValue });
    }
  }, [content.body, updateContent]);

  // Auto-resize textarea
  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    updateContent({ body: textarea.value });
    
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 300), 600) + 'px';
  }, [updateContent]);

  // Word count
  const wordCount = useMemo(() => {
    return content.body.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [content.body]);

  const characterCount = useMemo(() => {
    return content.body.length;
  }, [content.body]);

  // Preview rendering
  const renderPreview = useCallback(() => {
    let previewContent = content.body;
    
    // Replace variables with example values
    availableVariables.forEach(variable => {
      const regex = new RegExp(variable.name.replace(/[{}]/g, '\\$&'), 'g');
      previewContent = previewContent.replace(regex, variable.example);
    });
    
    // Simple markdown rendering
    previewContent = previewContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    
    return previewContent;
  }, [content.body]);

  return (
    <div className="space-y-6">
      {/* Content Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Content Templates</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              disabled={readOnly}
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            {mockTemplates.slice(0, 3).map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                onClick={() => !readOnly && handleTemplateSelect(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <span className="text-xs text-gray-500">{template.usageCount}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{template.preview}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Content</h3>
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('editor')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'editor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveView('preview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="space-y-4">
          {/* Subject Line (for email) */}
          <Input
            label="Subject Line"
            value={content.subject || ''}
            onChange={(e) => updateContent({ subject: e.target.value })}
            placeholder="Enter email subject line"
            disabled={readOnly}
          />

          {/* Title */}
          <Input
            label="Title"
            value={content.title}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Enter content title"
            required
            disabled={readOnly}
          />

          {/* Content Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content Body
              </label>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{wordCount} words</span>
                <span>{characterCount} characters</span>
              </div>
            </div>

            {activeView === 'editor' && (
              <div>
                {/* Formatting Toolbar */}
                {!readOnly && (
                  <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 px-3 py-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTextFormat('bold')}
                        className="p-1.5"
                      >
                        <BoldIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTextFormat('italic')}
                        className="p-1.5"
                      >
                        <ItalicIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTextFormat('underline')}
                        className="p-1.5"
                      >
                        <UnderlineIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTextFormat('code')}
                        className="p-1.5"
                      >
                        <CodeBracketIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="w-px h-4 bg-gray-300" />

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVariables(true)}
                        className="p-1.5"
                      >
                        <VariableIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAssets(true)}
                        className="p-1.5"
                      >
                        <PhotoIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <TextArea
                  ref={editorRef}
                  value={content.body}
                  onChange={handleBodyChange}
                  placeholder="Enter your content here... Use {{variableName}} for personalization"
                  className={`min-h-[300px] ${!readOnly ? 'rounded-t-none border-t-0' : ''}`}
                  style={{ height: `${editorHeight}px` }}
                  disabled={readOnly}
                />
              </div>
            )}

            {activeView === 'preview' && (
              <div
                className="border border-gray-300 rounded-lg p-6 min-h-[300px] bg-white prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            )}
          </div>

          {/* Call to Action */}
          <Input
            label="Call to Action"
            value={content.cta}
            onChange={(e) => updateContent({ cta: e.target.value })}
            placeholder="Enter call to action text"
            disabled={readOnly}
          />
        </CardBody>
      </Card>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Content Templates"
        size="lg"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {mockTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <span className="text-sm text-gray-500">{template.category}</span>
                  </div>
                  <span className="text-sm text-gray-500">{template.usageCount} uses</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Variables Modal */}
      <Modal
        isOpen={showVariables}
        onClose={() => setShowVariables(false)}
        title="Personalization Variables"
        size="md"
      >
        <div className="p-6">
          <div className="space-y-3">
            {availableVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                onClick={() => insertVariable(variable)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {variable.name}
                    </code>
                    <span className="text-sm font-medium">{variable.displayName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Example: {variable.example}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Insert
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Assets Modal */}
      <Modal
        isOpen={showAssets}
        onClose={() => setShowAssets(false)}
        title="Media Assets"
        size="lg"
      >
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Asset management will be available in Phase 2</p>
            <p className="text-sm mt-2">Upload and manage images, videos, and other media</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContentEditor;