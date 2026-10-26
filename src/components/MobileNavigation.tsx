import React from 'react';
import { Folder, Gamepad2, Search, AppWindow, Settings } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'files', icon: Folder, label: 'Files' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'apps', icon: AppWindow, label: 'Apps' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around p-3 z-50 md:hidden">
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-blue-500' : 'text-zinc-500'}`}
        >
          <tab.icon className="w-6 h-6" />
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
