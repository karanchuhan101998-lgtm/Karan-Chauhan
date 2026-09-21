import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Plus,
  Image as ImageIcon,
  Mic,
  MicOff,
  Square,
  Globe,
  X,
  FileText,
  Sparkles,
  Languages,
  Code2,
  PenTool,
} from 'lucide-react';
import { Attachment } from '../types';
import { GeminiLiveButton } from './GeminiLiveButton';

export interface PromptOptions {
  isImageGen?: boolean;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  style?: string;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeDot: string;
  promptTemplate: (currentText: string) => string;
  cursorOffset?: number;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'summarize',
    label: 'Summarize this',
    icon: FileText,
    accentColor: 'text-sky-400',
    badgeDot: 'bg-sky-400',
    promptTemplate: (currentText: string) =>
      currentText.trim()
        ? `Summarize the following clearly and concisely:\n\n"${currentText.trim()}"`
        : 'Summarize this: ',
  },
  {
    id: 'translate',
    label: 'Translate to Hindi',
    icon: Languages,
    accentColor: 'text-emerald-400',
    badgeDot: 'bg-emerald-400',
    promptTemplate: (currentText: string) =>
      currentText.trim()
        ? `Translate the following text into natural, fluent Hindi:\n\n"${currentText.trim()}"`
        : 'Translate to Hindi: ',
  },
  {
    id: 'explain_code',
    label: 'Explain code',
    icon: Code2,
    accentColor: 'text-amber-400',
    badgeDot: 'bg-amber-400',
    promptTemplate: (currentText: string) =>
      currentText.trim()
        ? `Explain this code step-by-step, including what each part does and key highlights:\n\n\`\`\`\n${currentText.trim()}\n\`\`\``
        : 'Explain this code step-by-step:\n```\n\n```',
    cursorOffset: -4,
  },
  {
    id: 'improve_writing',
    label: 'Improve writing',
    icon: PenTool,
    accentColor: 'text-purple-400',
    badgeDot: 'bg-purple-400',
    promptTemplate: (currentText: string) =>
      currentText.trim()
        ? `Improve the writing, clarity, grammar, and tone of the following text:\n\n"${currentText.trim()}"`
        : 'Improve writing: ',
  },
];

interface PromptComposerProps {
  onSendMessage: (
    text: string,
    attachments: Attachment[],
    options?: PromptOptions
  ) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  placeholder?: string;
  onOpenLive?: () => void;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  webSearch,
  onToggleWebSearch,
  placeholder = 'Ask Gemini anything in English, Hindi, or Hinglish...',
  onOpenLive,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string>('none');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  // Speech recognition initialization with microphone permission handling
  const toggleSpeechRecognition = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      // Request microphone permission if not yet granted
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop stream tracks immediately since SpeechRecognition opens its own audio feed
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr) {
          console.warn('Microphone permission prompt error or denied:', permErr);
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language?.includes('hi') ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
              textareaRef.current.scrollHeight,
              200
            )}px`;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isDoc =
        file.type.includes('pdf') ||
        file.type.includes('text') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.py');

      const reader = new FileReader();

      if (isImage) {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const newAttachment: Attachment = {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: 'image',
            mimeType: file.type || 'image/jpeg',
            size: file.size,
            data: result,
          };
          setAttachments((prev) => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      } else {
        // Read text documents directly
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const newAttachment: Attachment = {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: 'document',
            mimeType: file.type || 'text/plain',
            size: file.size,
            data: result,
            extractedText: result.slice(0, 5000), // First 5000 chars preview
          };
          setAttachments((prev) => [...prev, newAttachment]);
        };
        reader.readAsText(file);
      }
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;

    onSendMessage(text.trim(), attachments, {
      isImageGen: isImageMode,
      aspectRatio: selectedAspectRatio,
      style: selectedStyle,
    });
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleQuickAction = (action: QuickActionItem) => {
    const newText = action.promptTemplate(text);
    setText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPosition = action.cursorOffset
          ? Math.max(0, newText.length + action.cursorOffset)
          : newText.length;
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200
        )}px`;
      }
    }, 50);
  };

  const dynamicPlaceholder = isImageMode
    ? 'Describe any image to create (e.g. A futuristic sports car in neon rain, photorealistic)...'
    : placeholder;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
      {/* Quick Actions Row */}
      <div
        id="quick-actions-bar"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-none"
      >
        <span className="text-[11px] font-medium text-slate-400 shrink-0 hidden sm:inline-flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#38bdf8]" />
          Quick Actions:
        </span>

        {/* Microphone Voice-to-Text Button in Quick Actions Row */}
        <button
          id="quick-action-voice-input"
          type="button"
          onClick={toggleSpeechRecognition}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 group text-xs font-medium cursor-pointer border ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-[#1e1f20]/90 hover:bg-[#282a2c] text-slate-200 hover:text-white border-white/[0.08] hover:border-white/[0.2]'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Trigger voice-to-text input'}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-rose-400 font-semibold">Listening...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 opacity-80 group-hover:opacity-100" />
              <Mic className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover:scale-110" />
              <span>Voice to text</span>
            </>
          )}
        </button>

        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              id={`quick-action-${action.id}`}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20]/90 hover:bg-[#282a2c] text-slate-200 hover:text-white border border-white/[0.08] hover:border-white/[0.2] transition-all duration-150 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 group text-xs font-medium cursor-pointer"
              title={`Click to use '${action.label}'`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${action.badgeDot} opacity-80 group-hover:opacity-100`} />
              <Icon className={`w-3.5 h-3.5 ${action.accentColor} transition-transform group-hover:scale-110`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <div
        id="prompt-composer-container"
        className={`relative w-full rounded-3xl transition-all duration-200 glass-card p-3 shadow-[0_8px_32px_rgba(0,0,0,0.36)] ${
          dragOver
            ? 'border-[#22D3EE] bg-[#22D3EE]/10'
            : 'border-white/[0.1] hover:border-white/[0.18]'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
      >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.csv,.json,.md,.js,.ts,.py"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5 px-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-white/[0.08] border border-white/[0.12] text-xs text-slate-200"
            >
              {att.type === 'image' ? (
                <div className="w-5 h-5 rounded overflow-hidden bg-black/40 flex-shrink-0">
                  <img
                    src={att.data}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <FileText className="w-4 h-4 text-[#60A5FA] flex-shrink-0" />
              )}
              <span className="truncate max-w-[140px] text-[11px] font-medium">
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded-full hover:bg-white/[0.1] text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Generation Options Tray when Image Mode is enabled */}
      {isImageMode && (
        <div className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/15 via-[#EC4899]/15 to-[#3B82F6]/15 border border-[#8B5CF6]/30 animate-in fade-in slide-in-from-bottom-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Image Generator (No code needed)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsImageMode(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] text-xs"
              title="Close image mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {/* Aspect Ratio */}
            <span className="text-slate-400 font-medium">Aspect:</span>
            {(
              [
                { id: '1:1', label: '1:1 Square' },
                { id: '16:9', label: '16:9 Wide' },
                { id: '9:16', label: '9:16 Portrait' },
                { id: '4:3', label: '4:3 Photo' },
              ] as const
            ).map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => setSelectedAspectRatio(ar.id)}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  selectedAspectRatio === ar.id
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-semibold shadow-sm'
                    : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]'
                }`}
              >
                {ar.label}
              </button>
            ))}

            <div className="h-3 w-[1px] bg-white/[0.15] hidden sm:block" />

            {/* Style */}
            <span className="text-slate-400 font-medium hidden sm:inline">Style:</span>
            {[
              { id: 'none', label: 'Default' },
              { id: 'photorealistic', label: 'Photorealistic' },
              { id: 'anime', label: 'Anime' },
              { id: 'cyberpunk 3d', label: 'Cyberpunk' },
              { id: 'cinematic film', label: 'Cinematic' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStyle(st.id)}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  selectedStyle === st.id
                    ? 'bg-[#EC4899] text-white font-semibold shadow-sm'
                    : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative px-2">
        <textarea
          ref={textareaRef}
          id="prompt-composer-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dynamicPlaceholder}
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none focus:outline-none leading-relaxed max-h-48 overflow-y-auto"
        />
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-between pt-2 px-1 mt-1 border-t border-white/[0.06]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* File & Image Upload Trigger */}
          <button
            type="button"
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1.5 text-xs"
            title="Attach images, documents, or files"
          >
            <Plus className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline text-[11px] font-medium">Attach</span>
          </button>

          {/* Dedicated Image Generation Mode Toggle */}
          <button
            type="button"
            id="composer-btn-image-mode"
            onClick={() => setIsImageMode(!isImageMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              isImageMode
                ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#EC4899]/30 text-white border border-[#F472B6]/50 shadow-[0_0_12px_rgba(236,72,153,0.3)] font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
            title="Create images directly without code"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#F472B6]" />
            <span className="text-[11px] font-medium">Image</span>
          </button>

          {/* Web Search Toggle inside composer */}
          <button
            type="button"
            id="composer-btn-web-search"
            onClick={onToggleWebSearch}
            className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              webSearch
                ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
            title="Toggle Google Web Search grounding"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Web</span>
          </button>

          {/* Voice Input Microphone */}
          <button
            type="button"
            id="btn-voice-record"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input (Speech to text)'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isListening && (
              <span className="text-[10px] font-semibold tracking-wider text-rose-400">
                Listening...
              </span>
            )}
          </button>
        </div>

        {/* Right: 3D Gemini Live button + Send / Stop generation */}
        <div className="flex items-center gap-2">
          {onOpenLive && (
            <GeminiLiveButton
              onClick={onOpenLive}
              size="sm"
            />
          )}

          {isGenerating ? (
            <button
              type="button"
              id="btn-stop-generation"
              onClick={onStopGeneration}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold transition-all"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-send-message"
              onClick={handleSubmit}
              disabled={!text.trim() && attachments.length === 0}
              className={`p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                text.trim() || attachments.length > 0
                  ? 'bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] text-white shadow-[0_0_16px_rgba(59,130,246,0.4)] hover:brightness-110 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 cursor-not-allowed'
              }`}
              title="Send to Gemini (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
