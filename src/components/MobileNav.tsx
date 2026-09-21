import React from 'react';
import { Home, MessageSquare, Compass, FolderGit2, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0E1A]/95 backdrop-blur-xl border-t border-white/[0.08] px-4 flex items-center justify-around z-40"
    >
      <button
        id="mobile-nav-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-1 transition-colors ${
          activeTab === 'home' ? 'text-[#8B5CF6]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        id="mobile-nav-chats"
        onClick={() => onSelectTab('chats')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-1 transition-colors ${
          activeTab === 'chats' ? 'text-[#8B5CF6]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium">Chats</span>
      </button>

      <button
        id="mobile-nav-projects"
        onClick={() => onSelectTab('projects')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-1 transition-colors ${
          activeTab === 'projects' ? 'text-[#F472B6]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FolderGit2 className="w-5 h-5" />
        <span className="text-[10px] font-medium">Projects</span>
      </button>

      <button
        id="mobile-nav-explore"
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-1 transition-colors ${
          activeTab === 'explore' ? 'text-[#22D3EE]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Explore</span>
      </button>

      <button
        id="mobile-nav-settings"
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
    </nav>
  );
};
