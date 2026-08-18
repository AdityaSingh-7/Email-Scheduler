import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Mail, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-gray-900">ReachInbox</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3 h-3 mr-1" />
                Scheduler
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">Cold Email Outreach Platform</p>
          </div>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <img
                src={user.avatar || 'https://lh3.googleusercontent.com/a/default-user'}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-indigo-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', 'https://lh3.googleusercontent.com/a/default-user');
                }}
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
