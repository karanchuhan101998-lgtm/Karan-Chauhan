import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  X,
  Check,
  Trash2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id?: string) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'files'>) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
    });
    setName('');
    setDescription('');
    setInstructions('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white/[0.1] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Workspaces & Projects</h2>
              <p className="text-xs text-slate-400">
                Isolate context and apply custom system instructions for specialized tasks.
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Default (No Project) Option */}
          <div
            onClick={() => onSelectProject(undefined)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              !activeProjectId
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-sm font-semibold">General Workspace (Default)</div>
                <div className="text-xs text-slate-400">Standard multimodal assistant without custom constraints</div>
              </div>
            </div>
            {!activeProjectId && <Check className="w-4 h-4 text-[#A78BFA]" />}
          </div>

          {/* Project List */}
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                activeProjectId === proj.id
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <div className="space-y-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{proj.name}</span>
                  {activeProjectId === proj.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/30 text-purple-200">
                      Active
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>
                )}
                {proj.instructions && (
                  <p className="text-[11px] text-slate-500 font-mono line-clamp-1">
                    Rule: {proj.instructions}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(proj.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Create New Form */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 mt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Create New Project
              </h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS Architect, Hindi Content Studio..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short summary of this workspace purpose"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom System Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 'Always write production-grade TypeScript with comments and provide code tests.'"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-xs font-semibold"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-white/[0.1] hover:border-[#8B5CF6]/50 text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#8B5CF6]" />
              <span>Create New Project Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
