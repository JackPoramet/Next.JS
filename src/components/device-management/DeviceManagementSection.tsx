'use client';

import React from 'react';

const DeviceManagementSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage all your IoT devices from a single dashboard. Add, remove, or configure devices 
        with ease.
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Device Inventory</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search devices..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Device
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">DEV001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Smart Meter A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Meter</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Building A</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                    Online
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2023-05-01 14:30</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Remove
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">DEV002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Smart Meter B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Meter</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Building B</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                    Offline
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2023-05-01 10:15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Remove
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">DEV003</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Smart Meter C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Meter</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Building C</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                    Warning
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2023-05-01 12:45</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing 3 of 24 devices
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-blue-50 dark:bg-blue-900/40 text-sm text-blue-600 dark:text-blue-400 font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Device Status Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">18</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Online</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Offline</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Warning</div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Alerts</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                Device DEV002 went offline at 10:15
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                Device DEV003 battery low at 12:45
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                Device DEV008 signal strength low at 09:30
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Device Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure global settings for all devices or set up device groups for easier management.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Device Groups</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Organize devices into logical groups</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Manage Groups
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Update Firmware</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Update device firmware remotely</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Manage Updates
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Communication Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Configure data transmission intervals and protocols</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementSection;
