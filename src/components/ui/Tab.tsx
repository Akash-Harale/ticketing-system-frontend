import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tab = ({ tabs, activeTab, onTabChange, className = '' }: TabProps) => {
  return (
    <div className={`relative flex border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`group relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none ${
              isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.icon && (
              <span
                className={`transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>

            {/* Active underline indicator */}
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600 transition-all duration-300 ${
                isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
              }`}
              style={{ transformOrigin: 'left' }}
            />
          </button>
        );
      })}
    </div>
  );
};
