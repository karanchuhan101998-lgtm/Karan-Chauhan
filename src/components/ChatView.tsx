import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  FileText,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertCircle,
  Share2,
  Download,
  Maximize2,
  Wand2,
  Paintbrush,
  X,
  Image as ImageIcon,
  FileDown,
} from 'lucide-react';
import { Message, Attachment, Conversation, Project } from '../types';
import { GeminiLogo } from './GeminiLogo';
import { PromptComposer, PromptOptions } from './PromptComposer';

interface ChatViewProps {
  conversation: Conversation;
  onSendMessage: (
    text: string,
    attachments: Attachment[],
    options?: PromptOptions
  ) => void;
  onEditImage?: (
    originalImageUrl: string,
    originalPrompt: string,
    editInstruction: string,
    aspectRatio?: string
  ) => void;
  onRegenerate: () => void;
  onRetryMessage?: (messageId: string) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  project?: Project;
  onOpenLive?: () => void;
  userName?: string;
  onExportPdf?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onSendMessage,
  onEditImage,
  onRegenerate,
  onRetryMessage,
  isGenerating,
  onStopGeneration,
  webSearch,
  onToggleWebSearch,
  project,
  onOpenLive,
  userName,
  onExportPdf,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const [sandboxResults, setSandboxResults] = useState<{ [key: string]: string }>({});
  const [isSandboxRunning, setIsSandboxRunning] = useState<string | null>(null);
  const [editingImageMsgId, setEditingImageMsgId] = useState<string | null>(null);
  const [customEditPrompt, setCustomEditPrompt] = useState<string>('');
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDownloadImage = (url: string, filename: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'aura-image.png';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isGenerating]);

  // Audio speech synthesis / fallback
  const handlePlayTTS = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);

    // Try server-side TTS endpoint
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300) }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          // Play PCM audio
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audioRef.current = audio;
          audio.onended = () => setPlayingAudioId(null);
          audio.onerror = () => fallbackBrowserSpeech(msgId, text);
          await audio.play();
          return;
        }
      }
      fallbackBrowserSpeech(msgId, text);
    } catch {
      fallbackBrowserSpeech(msgId, text);
    }
  };

  const fallbackBrowserSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Safe Code/Math Sandbox execution
  const handleRunSandbox = async (blockKey: string, code: string) => {
    setIsSandboxRunning(blockKey);
    try {
      const res = await fetch('/api/sandbox/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSandboxResults((prev) => ({
          ...prev,
          [blockKey]: `Result: ${data.result}`,
        }));
      } else {
        setSandboxResults((prev) => ({
          ...prev,
          [blockKey]: `Error: ${data.error || 'Evaluation failed'}`,
        }));
      }
    } catch (err: any) {
      setSandboxResults((prev) => ({
        ...prev,
        [blockKey]: `Error: ${err.message}`,
      }));
    } finally {
      setIsSandboxRunning(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(id);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#131314] relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#8B5CF6]/5 via-[#22D3EE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Messages Scrollable View */}
      <div
        id="chat-messages-container"
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full flex flex-col"
      >
        {conversation.messages.length > 0 && (
          <div
            id="chat-header-actions"
            className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-1 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-xs font-semibold text-slate-300 truncate">
                {conversation.title || 'Conversation'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 shrink-0">
                {conversation.messages.length} {conversation.messages.length === 1 ? 'message' : 'messages'}
              </span>
            </div>

            {onExportPdf && (
              <button
                id="btn-chat-export-pdf"
                type="button"
                onClick={onExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.1] hover:border-[#8B5CF6]/50 transition-all text-xs font-medium shadow-sm group active:scale-95 shrink-0"
                title="Export this conversation as a formatted PDF document"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Export PDF</span>
              </button>
            )}
          </div>
        )}

        {conversation.messages.length === 0 ? (
          /* Empty Chat Welcome Screen / Home Screen (ChatGPT & Gemini Style) */
          <div
            id="home-welcome-screen"
            className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-2xl mx-auto my-auto animate-in fade-in duration-300"
          >
            {/* Luminous Glowing AI Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#3B82F6] rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-white/[0.18] flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.35)]">
                <GeminiLogo size="lg" showText={false} />
              </div>
            </div>

            {/* Personalized Greeting */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2.5 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Hello{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg mb-1 leading-relaxed">
              How can I help you today?
            </p>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md leading-relaxed">
              Chat, create &amp; edit images with zero code, or talk hands-free.
            </p>
          </div>
        ) : (
          conversation.messages.map((message, idx) =>
            message.role === 'user' ? (
              /* User Prompt Message (Gemini Web Style) */
              <div
                key={message.id || idx}
                className="flex flex-col items-end my-2 w-full animate-in fade-in duration-200"
              >
                <div className="max-w-[85%] md:max-w-2xl rounded-[24px] bg-[#282a2c] hover:bg-[#2e3133] transition-colors px-5 py-3.5 text-[#f0f4f9] shadow-sm border border-white/[0.04]">
                  {/* Attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {message.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="rounded-xl overflow-hidden border border-white/[0.1] bg-black/40 p-1"
                        >
                          {att.type === 'image' ? (
                            <div className="relative group max-w-[280px] max-h-[200px] overflow-hidden rounded-lg">
                              <img
                                src={att.data}
                                alt={att.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() =>
                                  setPreviewModalImage({ url: att.data, title: att.name })
                                }
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300">
                              <FileText className="w-4 h-4 text-[#60A5FA]" />
                              <span className="font-medium truncate max-w-[180px]">
                                {att.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap select-text font-normal text-slate-100">
                    {message.content}
                  </div>
                </div>
              </div>
            ) : (
              /* Gemini Assistant Message (Gemini Web Style) */
              <div
                key={message.id || idx}
                className="flex flex-col items-start my-3.5 w-full animate-in fade-in duration-200"
              >
                <div className="w-full max-w-3xl">
                  {/* Gemini Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <GeminiLogo size="xs" showText={false} />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Gemini
                    </span>
                    {message.model && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                        {message.model}
                      </span>
                    )}
                  </div>

                  {/* Network Interrupted & Auto-Reloading Progress Pill */}
                  {message.retryStatus?.isRetrying && (
                    <div className="my-2 px-3.5 py-2 rounded-2xl bg-[#1e1f20] border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2.5 animate-pulse shadow-sm">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                      <span className="font-medium">{message.retryStatus.message}</span>
                    </div>
                  )}

                  {/* Thinking / Shimmering State when streaming first starts */}
                  {message.isStreaming &&
                    !message.content.trim() &&
                    !message.imageInfo &&
                    !message.retryStatus && (
                      <div className="flex items-center gap-2 py-2 text-sm gemini-shimmer-text font-medium animate-pulse">
                        <Sparkles className="w-4 h-4 text-[#38bdf8] animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}

                  {/* Attachments if any */}
                  {message.attachments && message.attachments.length > 0 && !message.imageInfo && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="rounded-xl overflow-hidden border border-white/[0.1] bg-black/40 p-1"
                        >
                          {att.type === 'image' ? (
                            <div className="relative group max-w-[280px] max-h-[200px] overflow-hidden rounded-lg">
                              <img
                                src={att.data}
                                alt={att.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() =>
                                  setPreviewModalImage({ url: att.data, title: att.name })
                                }
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModalImage({ url: att.data, title: att.name })
                                  }
                                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
                                  title="Full size"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadImage(att.data, att.name)}
                                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                {onEditImage && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingImageMsgId(message.id);
                                      setCustomEditPrompt('');
                                    }}
                                    className="px-2 py-1 rounded-lg bg-[#8B5CF6] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#7C3AED]"
                                  >
                                    <Wand2 className="w-3 h-3" /> Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300">
                              <FileText className="w-4 h-4 text-[#60A5FA]" />
                              <span className="font-medium truncate max-w-[180px]">
                                {att.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dedicated AI Generated / Edited Image Card */}
                  {message.imageInfo && (
                    <div className="my-3 rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0A0E1A]/90 p-3 shadow-xl">
                      <div className="relative group rounded-xl overflow-hidden bg-black/60 aspect-video max-h-[380px] flex items-center justify-center">
                        <img
                          src={message.imageInfo.imageUrl}
                          alt={message.imageInfo.prompt}
                          className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                          onClick={() =>
                            setPreviewModalImage({
                              url: message.imageInfo!.imageUrl,
                              title: message.imageInfo!.prompt,
                            })
                          }
                        />

                        {/* Quick Image Action Overlay */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewModalImage({
                                url: message.imageInfo!.imageUrl,
                                title: message.imageInfo!.prompt,
                              })
                            }
                            className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all border border-white/10"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadImage(
                                message.imageInfo!.imageUrl,
                                `ai-art-${Date.now()}.png`
                              )
                            }
                            className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all border border-white/10"
                            title="Download Image"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {message.imageInfo.isEdited && (
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-purple-500/30 text-[10px] text-purple-300 font-medium flex items-center gap-1">
                            <Paintbrush className="w-3 h-3 text-purple-400" />
                            Edited: {message.imageInfo.editInstruction}
                          </div>
                        )}
                      </div>

                      {/* Image Controls Bar: 1-Click Zero-Code Editing */}
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Ratio: {message.imageInfo.aspectRatio || '1:1'}
                          </span>
                          {message.imageInfo.provider && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                              {message.imageInfo.provider}
                            </span>
                          )}
                        </div>

                        {onEditImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingImageMsgId(
                                editingImageMsgId === message.id ? null : message.id
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-md"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            {editingImageMsgId === message.id ? 'Close Edit Tray' : 'Edit with AI (Zero Code)'}
                          </button>
                        )}
                      </div>

                      {/* Interactive Natural Language Image Edit Tray */}
                      {editingImageMsgId === message.id && onEditImage && (
                        <div className="mt-3 p-3 rounded-xl bg-black/50 border border-purple-500/30 animate-in fade-in duration-200">
                          <p className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            What changes would you like to make to this image?
                          </p>

                          {/* Quick 1-Click Modifiers */}
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {[
                              'Add neon glowing cyberpunk rain',
                              'Make it a golden hour sunset',
                              'Turn into Studio Ghibli anime art',
                              'Add cozy winter snow',
                              'Give sunglasses and cool leather jacket',
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  onEditImage(
                                    message.imageInfo!.imageUrl,
                                    message.imageInfo!.prompt,
                                    preset,
                                    message.imageInfo!.aspectRatio || '1:1'
                                  );
                                  setEditingImageMsgId(null);
                                }}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-purple-500/20 hover:text-purple-200 text-slate-300 border border-white/[0.06] transition-colors"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>

                          {/* Custom Prompt Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customEditPrompt}
                              onChange={(e) => setCustomEditPrompt(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customEditPrompt.trim()) {
                                  onEditImage(
                                    message.imageInfo!.imageUrl,
                                    message.imageInfo!.prompt,
                                    customEditPrompt.trim(),
                                    message.imageInfo!.aspectRatio || '1:1'
                                  );
                                  setCustomEditPrompt('');
                                  setEditingImageMsgId(null);
                                }
                              }}
                              placeholder="e.g. change sky to starry galaxy, add cute cat..."
                              className="flex-1 bg-black/60 border border-white/[0.12] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                              type="button"
                              disabled={!customEditPrompt.trim()}
                              onClick={() => {
                                if (customEditPrompt.trim()) {
                                  onEditImage(
                                    message.imageInfo!.imageUrl,
                                    message.imageInfo!.prompt,
                                    customEditPrompt.trim(),
                                    message.imageInfo!.aspectRatio || '1:1'
                                  );
                                  setCustomEditPrompt('');
                                  setEditingImageMsgId(null);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                            >
                              Apply Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Markdown Content (Fluid on Canvas, Gemini Styling) */}
                  {Boolean(message.content && message.content.trim()) && (
                    <div className="prose prose-invert prose-base max-w-none text-[#e3e3e3] leading-relaxed break-words font-normal">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-3.5 last:mb-0 leading-relaxed text-[15px] sm:text-base text-slate-200" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1 className="text-xl sm:text-2xl font-bold text-white mt-5 mb-2.5 tracking-tight" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-lg sm:text-xl font-semibold text-white mt-4 mb-2" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-base font-semibold text-[#38bdf8] mt-3 mb-1.5" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-5 my-2.5 space-y-1 text-slate-200" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-5 my-2.5 space-y-1 text-slate-200" {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3 rounded-xl border border-white/[0.08]">
                              <table className="w-full text-left text-xs border-collapse" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="bg-white/[0.06] p-2.5 font-semibold text-white border-b border-white/[0.08]" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="p-2.5 border-b border-white/[0.04] text-slate-300" {...props} />
                          ),
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const lang = match ? match[1] : '';
                            const codeContent = String(children).replace(/\n$/, '');
                            const blockId = `code-${message.id}-${Math.random()}`;

                            if (inline) {
                              return (
                                <code
                                  className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[#38bdf8] font-mono text-xs"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <div className="my-3 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#1e1f20]">
                                {/* Code Block Header */}
                                <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/[0.06] text-xs font-mono text-slate-400">
                                  <span className="text-[11px] font-semibold text-purple-300 uppercase">
                                    {lang || 'code'}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {(lang === 'javascript' || lang === 'js' || lang === 'math' || lang === 'calc') && (
                                      <button
                                        type="button"
                                        onClick={() => handleRunSandbox(blockId, codeContent)}
                                        disabled={isSandboxRunning === blockId}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] hover:bg-[#38bdf8]/25 transition-colors text-[10px] font-semibold"
                                        title="Evaluate expression in secure sandbox"
                                      >
                                        <Play className="w-3 h-3" />
                                        <span>{isSandboxRunning === blockId ? 'Running...' : 'Run'}</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(codeContent, blockId)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors text-[10px]"
                                    >
                                      {copiedCodeIndex === blockId ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Code Content */}
                                <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed text-slate-200 font-mono">
                                  <code>{children}</code>
                                </pre>

                                {/* Sandbox Result Output */}
                                {sandboxResults[blockId] && (
                                  <div className="p-2.5 bg-black/40 border-t border-white/[0.08] text-xs font-mono text-[#38bdf8]">
                                    {sandboxResults[blockId]}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>

                      {/* Blinking Cursor while streaming */}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#38bdf8] animate-pulse rounded-sm align-middle" />
                      )}
                    </div>
                  )}

                  {/* Network Problem Notice with Auto-Reload / Try Again */}
                  {message.error && (
                    <div className="mt-3 p-4 rounded-2xl bg-[#1e1f20] border border-rose-500/30 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-rose-300">Network / Connection Notice</div>
                          <p className="text-rose-200/90 mt-0.5 leading-relaxed">
                            {message.error.includes('fetch') ||
                            message.error.includes('network') ||
                            message.error.includes('Server returned') ||
                            message.error.includes('Network')
                              ? 'Network issue detected. Click Auto Reload to reconnect with Gemini.'
                              : message.error}
                          </p>
                        </div>
                      </div>
                      {onRetryMessage && (
                        <button
                          type="button"
                          onClick={() => onRetryMessage(message.id)}
                          disabled={isGenerating}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all shrink-0 shadow-sm active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Auto Reload / Try Again</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Citations Grounding Sources */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.08]">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Sources & Citations:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.citations.map((citation, cIdx) => (
                          <a
                            key={cIdx}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">
                              {citation.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Action Bar (Exact Gemini Style) */}
                  {message.role === 'assistant' && !message.isStreaming && (
                    <div className="flex items-center justify-between mt-3 pt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        {/* Copy Response */}
                        {Boolean(message.content && message.content.trim()) && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(message.content, `msg-${message.id}`)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors"
                            title="Copy response"
                          >
                            {copiedCodeIndex === `msg-${message.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Read Aloud TTS */}
                        {Boolean(message.content && message.content.trim()) && (
                          <button
                            type="button"
                            onClick={() => handlePlayTTS(message.id, message.content)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              playingAudioId === message.id
                                ? 'bg-[#8B5CF6]/20 text-[#A78BFA]'
                                : 'hover:bg-white/[0.08] hover:text-white'
                            }`}
                            title={playingAudioId === message.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {playingAudioId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Share Response */}
                        {Boolean(message.content && message.content.trim()) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: 'Gemini Response',
                                  text: message.content,
                                }).catch(() => {});
                              } else {
                                copyToClipboard(message.content, `msg-${message.id}`);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors"
                            title="Share response"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Regenerate Response */}
                        {idx === conversation.messages.length - 1 && (
                          <button
                            type="button"
                            onClick={onRegenerate}
                            disabled={isGenerating}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Helpful Feedback */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-emerald-400 transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-rose-400 transition-colors"
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Pinned Bottom Input */}
      <div id="chat-composer-section" className="p-4 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent sticky bottom-0 z-20">
        <PromptComposer
          onSendMessage={onSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={onStopGeneration}
          webSearch={webSearch}
          onToggleWebSearch={onToggleWebSearch}
          placeholder="Ask Gemini..."
          onOpenLive={onOpenLive}
        />
        <div className="text-center mt-2">
          <p className="text-[11px] text-slate-500">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
      {/* Fullscreen Lightbox Image Modal */}
      {previewModalImage && (
        <div
          id="image-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadImage(
                    previewModalImage.url,
                    `${previewModalImage.title.slice(0, 20) || 'image'}.png`
                  )
                }
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewModalImage.url}
              alt={previewModalImage.title}
              className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/10 shadow-2xl"
            />
            {previewModalImage.title && (
              <p className="mt-3 text-xs text-slate-300 text-center max-w-xl font-medium bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                {previewModalImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
