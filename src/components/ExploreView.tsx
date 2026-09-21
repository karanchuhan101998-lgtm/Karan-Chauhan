import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  Sparkles,
  BookOpen,
  BarChart3,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';
import { EXPLORE_PROMPTS } from '../data/sampleData';

interface ExploreViewProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Coding', 'STEM & Math', 'Vision', 'Writing & Research', 'Data Analysis', 'Productivity'];

  const iconMap: { [key: string]: any } = {
    Code2,
    Cpu,
    Sparkles,
    BookOpen,
    BarChart3,
    Layers,
  };

  const filtered = EXPLORE_PROMPTS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Explore Prompt Workflows
        </h1>
        <p className="text-slate-400 text-sm">
          Curated templates for software architecture, multilingual reasoning, vision analysis, and data calculations.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]/50"
          />
        </div>
      </div>

      {/* Prompt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const Icon = iconMap[item.icon] || Sparkles;
          return (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                  "{item.prompt}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#A78BFA] text-xs font-semibold transition-colors"
                >
                  <span>Use in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
