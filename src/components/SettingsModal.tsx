import React from 'react';
import {
  Settings,
  X,
  Languages,
  Sliders,
  Shield,
  Download,
  Trash2,
  Info,
  Check,
  Volume2,
} from 'lucide-react';
import { UserPreferences, Conversation } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onExportAllData: () => void;
  onClearAllData: () => void;
  conversationsCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onExportAllData,
  onClearAllData,
  conversationsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white/[0.1] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settings & AI Transparency</h2>
              <p className="text-xs text-slate-400">
                Configure language, response behavior, data privacy, and model disclosures.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* 1. AI Transparency & Model Disclosure Notice */}
          <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <Shield className="w-4 h-4 text-[#8B5CF6]" />
              <span>Aura AI Transparency & Ethical Disclosure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aura AI is an advanced software-based multimodal assistant powered by Google's latest Gemini 3.8 Flash models. Aura AI does not have human feelings, consciousness, or a physical body. All reasoning, image processing, and code analysis are performed through server-side mathematical neural network inferences.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              Architecture: Transformer Neural Network • API: @google/genai • Privacy: No client keys exposed
            </div>
          </div>

          {/* 2. Language Preference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Languages className="w-4 h-4 text-[#22D3EE]" />
              <span>Language Preference</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto', label: 'Auto Detect', desc: 'Matches your query' },
                { id: 'en', label: 'English', desc: 'Standard English' },
                { id: 'hi', label: 'हिन्दी', desc: 'Pure Hindi' },
                { id: 'hinglish', label: 'Hinglish', desc: 'Natural Roman Hindi' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() =>
                    onUpdatePreferences({ language: lang.id as any })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    preferences.language === lang.id
                      ? 'bg-[#22D3EE]/15 border-[#22D3EE]/40 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{lang.label}</span>
                    {preferences.language === lang.id && (
                      <Check className="w-3.5 h-3.5 text-[#22D3EE]" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tone of Voice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#F472B6]" />
              <span>Response Tone & Depth</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'balanced', label: 'Balanced', desc: 'Thoughtful & clear' },
                { id: 'technical', label: 'Technical', desc: 'Deep logic & code' },
                { id: 'concise', label: 'Concise', desc: 'Short & direct' },
                { id: 'friendly', label: 'Friendly', desc: 'Warm & conversational' },
                { id: 'thoughtful', label: 'Thoughtful', desc: 'Detailed explanations' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() =>
                    onUpdatePreferences({ tone: tone.id as any })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    preferences.tone === tone.id
                      ? 'bg-[#F472B6]/15 border-[#F472B6]/40 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{tone.label}</span>
                    {preferences.tone === tone.id && (
                      <Check className="w-3.5 h-3.5 text-[#F472B6]" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{tone.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Speech Voice Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-[#60A5FA]" />
              <span>Speech Voice (TTS)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Kore', 'Zephyr', 'Puck', 'Charon'].map((v) => (
                <button
                  key={v}
                  onClick={() => onUpdatePreferences({ voice: v as any })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                    preferences.voice === v
                      ? 'bg-[#60A5FA]/20 border-[#60A5FA]/40 text-white font-semibold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Data Privacy & Export */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Data Management & Privacy
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onExportAllData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-[#22D3EE]" />
                <span>Export All Conversations (JSON)</span>
              </button>

              <button
                onClick={onClearAllData}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Workspace Data</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Active sessions: {conversationsCount} conversation(s) stored locally in browser state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
