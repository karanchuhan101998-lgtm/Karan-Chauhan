import React, { useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Trash2,
  X,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  memoryEnabled: boolean;
  onToggleMemoryEnabled: () => void;
  onAddMemory: (text: string, category: MemoryItem['category']) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  memoryEnabled,
  onToggleMemoryEnabled,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
}) => {
  const [newText, setNewText] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('coding');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddMemory(newText.trim(), category);
    setNewText('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="glass-panel w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-white/[0.1] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Memory & Personalization</h2>
              <p className="text-xs text-slate-400">
                You maintain complete control over what Aura AI remembers.
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

        {/* Master Toggle Banner */}
        <div className="py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-white">Active Memory Context</div>
            <div className="text-xs text-slate-400">
              When active, saved preferences are injected into assistant instructions.
            </div>
          </div>
          <button
            onClick={onToggleMemoryEnabled}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
              memoryEnabled ? 'bg-[#22D3EE]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                memoryEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saved Preferences ({memories.length})</span>
            {memories.length > 0 && (
              <button
                onClick={onClearAllMemories}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Clear All
              </button>
            )}
          </div>

          {memories.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No memories saved yet. Add your preferred language, coding styles, or formatting rules below.
            </div>
          ) : (
            <div className="space-y-2">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-slate-200"
                >
                  <div className="space-y-1 pr-3">
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#22D3EE]">
                      {m.category || 'General'}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Memory */}
          <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Add New User Preference
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-black/50 border border-white/[0.1] rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="coding">Coding & Tech</option>
                <option value="language">Language & Tone</option>
                <option value="preference">Formatting</option>
                <option value="personal">General</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 'Prefer solutions in TypeScript with clean comments'"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#22D3EE]/20 hover:bg-[#22D3EE]/30 text-[#22D3EE] font-semibold text-xs transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
