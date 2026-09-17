import React from 'react';
import { Home, Sparkles, History, Bookmark, User, Shield } from 'lucide-react';

export type TabKey = 'home' | 'match' | 'history' | 'saved' | 'profile';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isAdminView,
  onToggleAdminView,
}) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'หน้าหลัก', icon: Home },
    { key: 'match' as TabKey, label: 'แมทช์สี', icon: Sparkles },
    { key: 'history' as TabKey, label: 'ประวัติ', icon: History },
    { key: 'saved' as TabKey, label: 'ที่บันทึก', icon: Bookmark },
    { key: 'profile' as TabKey, label: 'โปรไฟล์', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 transition-all shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = !isAdminView && currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (isAdminView) onToggleAdminView();
                onSelectTab(tab.key);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-rose-600 scale-105'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'bg-rose-50 text-rose-600' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'font-bold text-rose-600' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Mobile Admin toggle button */}
        <button
          onClick={onToggleAdminView}
          className={`sm:hidden flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            isAdminView
              ? 'text-purple-600 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
          title="Admin Dashboard"
        >
          <div className={`p-1 rounded-xl ${isAdminView ? 'bg-purple-100 text-purple-600' : ''}`}>
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Admin</span>
        </button>
      </div>
    </nav>
  );
};
