// src/pages/integrations/IntegrationsPage.tsx
// Minimal working version to fix the error
import React from 'react';
import { useNavigate } from 'react-router-dom';

const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="mt-2 text-lg text-gray-600">
                Connect Kairos with your favorite tools and services to create a unified marketing ecosystem.
              </p>
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>12 of 30 integrations connected</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>⚡</span>
                  <span className="ml-2">200+ available integrations</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-6">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="mr-2">+</span>
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Salesforce Card */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🔗
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Salesforce</h3>
                  <p className="text-sm text-gray-500">CRM Integration</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Sync contacts, leads, and opportunities with Salesforce CRM
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Bidirectional Sync
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Real-time Updates
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span>⏱️ Last sync: 2 min ago</span>
              </div>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>

          {/* HubSpot Card */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  🧡
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">HubSpot</h3>
                  <p className="text-sm text-gray-500">Marketing Hub</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Integrate with HubSpot CRM, Marketing Hub, and Sales Hub
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Contact Sync
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Deal Pipeline
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span>⏱️ Last sync: 1 hour ago</span>
              </div>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>

          {/* SendGrid Card */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">SendGrid</h3>
                  <p className="text-sm text-gray-500">Email Provider</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Reliable email delivery with detailed analytics
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Transactional Email
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Analytics
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span>⏱️ Last sync: 30 min ago</span>
              </div>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>

          {/* Available Integration */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 border-2 border-dashed border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  ❄️
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Snowflake</h3>
                  <p className="text-sm text-gray-500">Data Warehouse</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Not Connected</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                Available
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Cloud data warehouse for analytics and insights
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Data Warehouse
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                Real-time Sync
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span>⏱️ 15 min setup</span>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>

        </div>

        {/* Categories Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-medium text-gray-900">CRM & Sales</h3>
              <p className="text-sm text-gray-500">3 integrations</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">📧</div>
              <h3 className="font-medium text-gray-900">Email Marketing</h3>
              <p className="text-sm text-gray-500">3 integrations</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">2 integrations</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">🛍️</div>
              <h3 className="font-medium text-gray-900">E-commerce</h3>
              <p className="text-sm text-gray-500">2 integrations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;