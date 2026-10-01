import React from 'react';
import { Home, Book, BarChart2, Settings } from 'lucide-react';
import { Tab } from '../../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showStats: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'journal', icon: Book, label: 'Journal' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center p-2 transition-colors duration-300 ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-xs mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 absolute bottom-1`}>
              {/* Only show label if active or minimal design choice */}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;