import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Settings,
  BrainCircuit,
  FolderGit2,
  Menu,
  Plus,
  Radio,
  Sparkles,
  CheckCircle2,
  Info,
  ChevronDown,
  SquarePen,
  Check,
  Download,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { Project, AppCapabilities, AuthUser } from '../types';

interface TopBarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onOpenProjects: () => void;
  onToggleSidebar: () => void;
  activeProject?: Project;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  capabilities: AppCapabilities;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
  currentUser?: AuthUser;
  onSignOut?: () => void;
  onOpenInstall?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNewChat,
  onOpenSettings,
  onOpenMemory,
  onOpenProjects,
  onToggleSidebar,
  activeProject,
  webSearch,
  onToggleWebSearch,
  capabilities,
  selectedModel = 'gemini-3.1-flash-lite',
  onSelectModel,
  currentUser,
  onSignOut,
  onOpenInstall,
}) => {
  const [showCapsModal, setShowCapsModal] = React.useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const availableModels = [
    {
      id: 'gemini-3.1-flash-lite',
      label: 'Gemini Flash Lite',
      tag: 'Default',
      desc: 'Instant responses with ultra-low latency and high reliability',
    },
    {
      id: 'gemini-3.8-flash',
      label: 'Gemini 3.8 Flash',
      tag: 'Standard',
      desc: 'Multimodal flash reasoning model for deep tasks',
    },
    {
      id: 'gemini-flash-latest',
      label: 'Gemini Flash',
      tag: 'Latest',
      desc: 'Multimodal reasoning for daily prompts & coding',
    },
    {
      id: 'gemini-3.1-pro-preview',
      label: 'Gemini Pro',
      tag: 'Deep Reasoning',
      desc: 'Complex mathematical proofs and deep analysis',
    },
  ];

  const currentModelObj =
    availableModels.find((m) => m.id === selectedModel) || availableModels[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setShowModelDropdown(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="app-topbar"
      className="h-16 border-b border-white/[0.08] bg-[#070A12]/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0"
    >
      {/* Left: Mobile menu toggle + Gemini Star + Model selector dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Gemini Sparkle Logo */}
        <div className="flex items-center">
          <GeminiLogo size="xs" />
        </div>

        {/* Model Selector Dropdown matching screenshot: Gemini Flash ⌵ */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            type="button"
            id="btn-model-selector-dropdown"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-white transition-all"
          >
            <span className="font-semibold text-sm tracking-tight">
              {currentModelObj.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
          </button>

          {showModelDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#0F131D] border border-white/[0.12] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.06]">
                Select Gemini Model
              </div>
              <div className="py-1 space-y-1">
                {availableModels.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      onSelectModel?.(mod.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start justify-between gap-2 ${
                      selectedModel === mod.id
                        ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {mod.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-blue-300 font-mono">
                          {mod.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {mod.desc}
                      </p>
                    </div>
                    {selectedModel === mod.id && (
                      <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Project Pill */}
        {activeProject && (
          <button
            id="btn-active-project-tag"
            onClick={onOpenProjects}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-medium text-purple-300 hover:bg-[#8B5CF6]/25 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="truncate max-w-[120px]">{activeProject.name}</span>
          </button>
        )}
      </div>

      {/* Right Action Icons & Badges */}
      <div className="flex items-center gap-2">
        {/* Capabilities quick inspect badge */}
        <div className="relative">
          <button
            id="btn-capabilities-badge"
            onClick={() => setShowCapsModal(!showCapsModal)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
            title="System Capabilities Status"
          >
            <Radio className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Capabilities</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.1] text-[10px] text-[#22D3EE] font-mono">
              6/7 Active
            </span>
          </button>

          {/* Capabilities Dropdown */}
          {showCapsModal && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Multimodal Engine Status
                </span>
                <button
                  onClick={() => setShowCapsModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Text & Reasoning</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Multimodal Vision</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Web Research Grounding</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Code & Sandbox</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Data Analysis Engine</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Voice Input & TTS</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 pt-2 border-t border-white/[0.08]">
                  <span className="text-slate-400">Image Generation</span>
                  <span className="text-amber-400/90 text-[11px] font-mono">
                    Not configured yet
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Web Search Grounding Toggle */}
        <button
          id="btn-web-search-toggle"
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            webSearch
              ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
              : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-slate-200'
          }`}
          title={webSearch ? 'Web search grounding is active' : 'Enable live Google web search'}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Web Search</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              webSearch ? 'bg-[#22D3EE]' : 'bg-slate-500'
            }`}
          />
        </button>

        {/* Workspaces / Projects button */}
        <button
          id="btn-open-projects"
          onClick={onOpenProjects}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
          title="Workspaces & Projects"
          aria-label="Workspaces"
        >
          <FolderGit2 className="w-4 h-4" />
        </button>

        {/* Memory Manager Button */}
        <button
          id="btn-open-memory"
          onClick={onOpenMemory}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
          title="Memory & Personalization"
          aria-label="Memory"
        >
          <BrainCircuit className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
          title="Settings & Transparency"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Install App CTA (PWA) */}
        {onOpenInstall && (
          <button
            type="button"
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/30 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all"
            title="Install Aura AI App on this device"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Install App</span>
          </button>
        )}

        {/* User Account / Sign Out dropdown */}
        {currentUser && (
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all"
              title={`Logged in as ${currentUser.name}`}
            >
              <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#0F131D] border border-white/[0.12] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-3 border-b border-white/[0.08] mb-2">
                  <div className="text-sm font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                </div>

                <div className="space-y-1">
                  {onOpenInstall && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenInstall();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Install App (PWA)</span>
                    </button>
                  )}

                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out & Lock App</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pencil / New Chat icon button */}
        <button
          type="button"
          id="btn-topbar-pen-new-chat"
          onClick={onNewChat}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="New chat"
          aria-label="New chat"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        {/* New Chat Primary CTA */}
        <button
          id="btn-topbar-new-chat"
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
