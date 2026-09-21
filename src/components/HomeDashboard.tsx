import React from 'react';
import {
  Code2,
  Image as ImageIcon,
  FileText,
  Compass,
  Cpu,
  Globe,
  Radio,
  Sparkles,
  ArrowRight,
  FolderGit2,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';
import { GeminiLogo } from './GeminiLogo';
import { PromptComposer } from './PromptComposer';
import { Attachment, Project, Conversation, AppCapabilities } from '../types';

interface HomeDashboardProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  onSelectPrompt: (prompt: string) => void;
  onSelectConversation: (id: string) => void;
  recentConversations: Conversation[];
  projects: Project[];
  capabilities: AppCapabilities;
  onOpenLive?: () => void;
  userName?: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  webSearch,
  onToggleWebSearch,
  onSelectPrompt,
  onSelectConversation,
  recentConversations,
  projects,
  capabilities,
  onOpenLive,
  userName = 'Karan',
}) => {
  const quickChips = [
    {
      label: 'Help me code & design an app',
      icon: Code2,
      prompt: 'Help me design a clean, modular web application architecture with TypeScript and React.',
    },
    {
      label: 'Explain a complex topic in Hinglish',
      icon: Languages,
      prompt: 'Explain how neural networks and transformers work in simple, intuitive Hinglish.',
    },
    {
      label: 'Summarize or analyze documents',
      icon: FileText,
      prompt: 'Provide a structured summary of the key findings, insights, and action items.',
    },
    {
      label: 'Search current web developments',
      icon: Globe,
      prompt: 'What are the latest breakthrough updates in artificial intelligence and web engineering?',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 md:py-16 bg-[#070A12] relative flex flex-col items-center justify-center min-h-full">
      {/* Subtle ambient glow behind center */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-gradient-to-b from-[#8B5CF6]/12 via-[#22D3EE]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 flex flex-col items-center space-y-8 my-auto">
        {/* Minimalist Gemini Hero Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-3">
            <GeminiLogo size="hero" showText={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Hello, <span className="text-white font-medium">{userName}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-normal">
            How can I help you today?
          </p>
        </div>

        {/* Primary Prompt Input Composer */}
        <div className="w-full shadow-2xl">
          <PromptComposer
            onSendMessage={onSendMessage}
            isGenerating={isGenerating}
            onStopGeneration={onStopGeneration}
            webSearch={webSearch}
            onToggleWebSearch={onToggleWebSearch}
            placeholder="Ask Gemini..."
            onOpenLive={onOpenLive}
          />
        </div>

        {/* Clean, Subtle Prompt Suggestion Chips */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-2">
          {quickChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(chip.prompt)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.16] text-xs text-slate-300 hover:text-white transition-all duration-150 group"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#22D3EE] transition-colors" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimal Recent Chats (if any) */}
        {recentConversations.length > 0 && (
          <div className="w-full pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Recent:</span>
            {recentConversations.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-slate-400 hover:text-slate-200 transition-colors truncate max-w-[200px]"
                title={c.title}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
