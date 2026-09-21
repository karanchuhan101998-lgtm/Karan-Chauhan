import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Compass,
  FolderGit2,
  FileText,
  Settings,
  BrainCircuit,
  Search,
  Pin,
  Trash2,
  Download,
  FileDown,
  X,
  Radio,
  Sparkles,
  Home,
  ChevronRight,
} from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { Conversation, Project, ActiveTab, AuthUser } from '../types';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onExportConversation: (id: string, e: React.MouseEvent) => void;
  onExportConversationPdf?: (id: string, e: React.MouseEvent) => void;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id?: string) => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser?: AuthUser;
  onSignOut?: () => void;
  onOpenInstall?: () => void;
  onOpenLive?: () => void;
  onOpenProjects?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  onExportConversation,
  onExportConversationPdf,
  activeTab,
  onSelectTab,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenSettings,
  onOpenMemory,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onSignOut,
  onOpenInstall,
  onOpenLive,
  onOpenProjects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const regularConversations = filteredConversations.filter((c) => !c.pinned);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0A0E1A] border-r border-white/[0.08] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
          <GeminiLogo size="sm" showText={true} />
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3">
          <button
            id="btn-sidebar-new-chat"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Quick Launchers */}
        <div className="px-3 py-1 space-y-1.5">
          {onOpenLive && (
            <button
              id="sidebar-btn-live-voice"
              onClick={() => {
                onOpenLive();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#3B82F6]/20 via-[#22D3EE]/15 to-transparent text-blue-300 border border-[#3B82F6]/30 hover:border-[#3B82F6]/60 hover:text-white transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#22D3EE] animate-pulse" />
                <span>Live Voice (Hands-free)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/30 text-blue-200 font-mono">
                LIVE
              </span>
            </button>
          )}

          <button
            id="sidebar-btn-workspaces"
            onClick={() => {
              onOpenProjects?.();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-[#F472B6]" />
              <span>Instructions & Workspace</span>
            </div>
            {projects.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-400">
                {projects.length}
              </span>
            )}
          </button>
        </div>

        {/* Conversations Search */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              id="input-search-conversations"
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]/50 focus:bg-white/[0.06]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Pinned Chats */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                <Pin className="w-3 h-3 text-[#A78BFA]" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinnedConversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isActive={activeConversationId === c.id}
                    onSelect={() => {
                      onSelectConversation(c.id);
                      onSelectTab?.('chats');
                      onCloseMobile();
                    }}
                    onDelete={(e) => onDeleteConversation(c.id, e)}
                    onTogglePin={(e) => onTogglePin(c.id, e)}
                    onExport={(e) => onExportConversation(c.id, e)}
                    onExportPdf={(e) => onExportConversationPdf?.(c.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
              <span>Recent Chats</span>
              <span className="text-[10px] text-slate-600 font-normal">
                {regularConversations.length}
              </span>
            </div>

            {regularConversations.length === 0 && pinnedConversations.length === 0 ? (
              <div className="text-center py-6 px-3">
                <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-500">No chats yet</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Start a conversation above
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {regularConversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isActive={activeConversationId === c.id}
                    onSelect={() => {
                      onSelectConversation(c.id);
                      onSelectTab?.('chats');
                      onCloseMobile();
                    }}
                    onDelete={(e) => onDeleteConversation(c.id, e)}
                    onTogglePin={(e) => onTogglePin(c.id, e)}
                    onExport={(e) => onExportConversation(c.id, e)}
                    onExportPdf={(e) => onExportConversationPdf?.(c.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Area: Memory & Settings */}
        <div className="p-3 border-t border-white/[0.08] bg-[#070A12]/60 space-y-1">
          <button
            id="sidebar-btn-memory"
            onClick={onOpenMemory}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-4 h-4 text-[#22D3EE]" />
              <span>Memory & Preferences</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            id="sidebar-btn-settings"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Transparency</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Install App Link in Sidebar */}
          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Install App (PWA)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {/* User Profile & Sign Out */}
          {currentUser && (
            <div className="pt-2 mt-2 border-t border-white/[0.08] flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Sign Out & Lock App"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  onExportPdf?: (e: React.MouseEvent) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onExport,
  onExportPdf,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-transparent text-white font-medium border border-[#8B5CF6]/30'
          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden pr-2">
        <MessageSquare
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? 'text-[#8B5CF6]' : 'text-slate-500'
          }`}
        />
        <span className="truncate">{conversation.title || 'Untitled Conversation'}</span>
      </div>

      {/* Action icons shown on hover or active */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
        <button
          onClick={onTogglePin}
          className={`p-1 rounded hover:bg-white/[0.1] ${
            conversation.pinned ? 'text-[#A78BFA] opacity-100' : 'text-slate-400'
          }`}
          title={conversation.pinned ? 'Unpin' : 'Pin to top'}
        >
          <Pin className="w-3 h-3" />
        </button>

        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/[0.1]"
            title="Export chat as PDF document"
          >
            <FileDown className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={onExport}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.1]"
          title="Export chat markdown"
        >
          <Download className="w-3 h-3" />
        </button>

        <button
          onClick={onDelete}
          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
          title="Delete chat"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
