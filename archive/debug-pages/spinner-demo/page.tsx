'use client';

import React, { useState } from 'react';
import LoadingSpinner, { AuthLoadingSpinner, PageLoadingSpinner, DataLoadingSpinner } from '@/components/LoadingSpinner';

export default function LoadingSpinnerDemo() {
  const [message, setMessage] = useState('กำลังตรวจสอบสถานะ...');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [color, setColor] = useState<'blue' | 'indigo' | 'green' | 'red' | 'gray'>('indigo');
  const [showLogo, setShowLogo] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'custom' | 'auth' | 'page' | 'data'>('custom');

  const renderDemo = () => {
    switch (activeDemo) {
      case 'auth':
        return <AuthLoadingSpinner />;
      case 'page':
        return <PageLoadingSpinner />;
      case 'data':
        return <DataLoadingSpinner />;
      default:
        return (
          <LoadingSpinner 
            message={message}
            size={size}
            color={color}
            showLogo={showLogo}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Control Panel */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Loading Spinner Customization</h1>
            <div className="flex space-x-2">
              <a 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Back to Login
              </a>
              <a 
                href="/dashboard" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Dashboard
              </a>
            </div>
          </div>
          
          {/* Preset Options */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800">Preset Styles:</label>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveDemo('custom')}
                className={`px-4 py-2 rounded font-medium ${activeDemo === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Custom
              </button>
              <button 
                onClick={() => setActiveDemo('auth')}
                className={`px-4 py-2 rounded font-medium ${activeDemo === 'auth' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Auth Loading
              </button>
              <button 
                onClick={() => setActiveDemo('page')}
                className={`px-4 py-2 rounded font-medium ${activeDemo === 'page' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Page Loading
              </button>
              <button 
                onClick={() => setActiveDemo('data')}
                className={`px-4 py-2 rounded font-medium ${activeDemo === 'data' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Data Loading
              </button>
            </div>
          </div>

          {/* Custom Controls */}
          {activeDemo === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Message */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800">Message:</label>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800">Size:</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800">Color:</label>
                <select 
                  value={color} 
                  onChange={(e) => setColor(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="blue">Blue</option>
                  <option value="indigo">Indigo</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="gray">Gray</option>
                </select>
              </div>

              {/* Show Logo */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-800">Show Logo:</label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-800 font-medium">Display Logo</span>
                </label>
              </div>
            </div>
          )}

          {/* Code Display */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-bold mb-2 text-gray-900">Current Code:</h3>
            <pre className="text-sm overflow-auto bg-gray-800 text-green-400 p-3 rounded font-mono">
              {activeDemo === 'custom' ? 
                `<LoadingSpinner 
  message="${message}"
  size="${size}"
  color="${color}"
  showLogo={${showLogo}}
/>` :
                `<${activeDemo === 'auth' ? 'AuthLoadingSpinner' : 
                    activeDemo === 'page' ? 'PageLoadingSpinner' : 'DataLoadingSpinner'} />`
              }
            </pre>
          </div>
        </div>
      </div>

      {/* Demo Area */}
      <div className="pt-64">
        {renderDemo()}
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm border">
        <h4 className="font-bold text-gray-900 mb-2">💡 คำแนะนำ:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• เลือก Preset หรือ Custom</li>
          <li>• ปรับแต่งตามต้องการ</li>
          <li>• Copy code ไปใช้ในโปรเจค</li>
          <li>• ทดสอบกับพื้นหลังต่างๆ</li>
        </ul>
      </div>
    </div>
  );
}
