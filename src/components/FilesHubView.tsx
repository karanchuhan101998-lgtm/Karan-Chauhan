import React, { useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Attachment } from '../types';

interface FilesHubViewProps {
  files: Attachment[];
  onUploadFile: (files: FileList | null) => void;
  onDeleteFile: (id: string) => void;
  onAnalyzeFile: (file: Attachment) => void;
}

export const FilesHubView: React.FC<FilesHubViewProps> = ({
  files,
  onUploadFile,
  onDeleteFile,
  onAnalyzeFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Files & Vision Hub
          </h1>
          <p className="text-slate-400 text-sm">
            Upload images, PDFs, CSVs, and code files for instant multimodal analysis and project memory.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.json,.md,.js,.ts,.py"
          className="hidden"
          onChange={(e) => onUploadFile(e.target.files)}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-xs font-semibold shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-white/[0.1] hover:border-[#8B5CF6]/50 rounded-3xl p-12 text-center transition-colors glass-card"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 text-[#8B5CF6]">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Drag and drop or click to upload
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Supports PNG, JPEG, WebP, PDF, CSV, TXT, JSON, and source code files up to 50MB.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="glass-card p-4 rounded-2xl border border-white/[0.08] flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail / Icon */}
                <div className="h-32 rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden mb-3 flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText className="w-8 h-8 text-[#60A5FA]" />
                      <span className="text-[10px] font-mono uppercase bg-white/[0.08] px-2 py-0.5 rounded">
                        {file.mimeType.split('/')[1] || 'DOC'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h4 className="text-sm font-semibold text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="capitalize">{file.type}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onAnalyzeFile(file)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#22D3EE]/15 hover:bg-[#22D3EE]/25 text-[#22D3EE] text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
