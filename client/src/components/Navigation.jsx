import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navigation({ currentView, onViewChange }) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    onViewChange('upload'); // Reset to upload view after logout
  };

  if (!isAuthenticated) {
    return null; // Don't show navigation for unauthenticated users
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">MCQ Generator</h1>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onViewChange('upload')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'upload'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upload Document
                </button>
                <button
                  onClick={() => onViewChange('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Quiz History
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, {user?.name || user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 