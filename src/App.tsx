import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatView } from './components/ChatView';
import { ProjectsModal } from './components/ProjectsModal';
import { MemoryModal } from './components/MemoryModal';
import { SettingsModal } from './components/SettingsModal';
import { GeminiLiveModal } from './components/GeminiLiveModal';
import { AuthScreen } from './components/AuthScreen';
import { PwaInstallModal } from './components/PwaInstallModal';
import { PromptOptions } from './components/PromptComposer';
import {
  Conversation,
  Message,
  Attachment,
  Project,
  MemoryItem,
  UserPreferences,
  AppCapabilities,
  ActiveTab,
  AuthUser,
} from './types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_PROJECTS,
  INITIAL_MEMORIES,
} from './data/sampleData';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'auto',
  tone: 'balanced',
  memoryEnabled: true,
  theme: 'dark',
  voice: 'Kore',
};

const CAPABILITIES: AppCapabilities = {
  text: true,
  vision: true,
  voice: true,
  web: true,
  code: true,
  data: true,
  imageGeneration: false, // Explicitly marked as not configured per instructions
};

export const App: React.FC = () => {
  // Load stored state or fallbacks
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => {
      try {
        const saved = localStorage.getItem('aura_ai_active_conv');
        return saved || 'conv-welcome';
      } catch {
        return 'conv-welcome';
      }
    }
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('chats');

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(
    undefined
  );

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_memories');
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [filesHub, setFilesHub] = useState<Attachment[]>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [isLiveOpen, setIsLiveOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Authentication Gate State ("bina login ke app open na ho")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('aura_ai_auth_user') || sessionStorage.getItem('aura_ai_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // PWA Install State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredInstallPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('aura_ai_auth_user');
    sessionStorage.removeItem('aura_ai_auth_user');
    setCurrentUser(null);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('aura_ai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('aura_ai_active_conv', activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem('aura_ai_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('aura_ai_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('aura_ai_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('aura_ai_files', JSON.stringify(filesHub));
  }, [filesHub]);

  // Current active conversation
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Start a new conversation
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
      projectId: activeProjectId,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setActiveTab('chats');
  };

  // Send message, stream text response or generate image directly with zero code
  const handleSendMessage = async (
    prompt: string,
    attachments: Attachment[] = [],
    options?: PromptOptions
  ) => {
    let convId = activeConversationId;
    let targetConv = conversations.find((c) => c.id === convId);

    // If no conversation exists or starting fresh
    if (!targetConv) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: prompt.slice(0, 36) || 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        projectId: activeProjectId,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(newConv.id);
      targetConv = newConv;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: prompt,
      attachments,
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg-${Date.now()}-assistant`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: selectedModel,
      isStreaming: true,
    };

    // Update conversation with user message and empty streaming assistant message
    const updatedMessages = [...(targetConv.messages || []), userMsg, assistantMsg];
    const isFirstTurn = targetConv.messages.length === 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: isFirstTurn ? prompt.slice(0, 38) || 'Conversation' : c.title,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setActiveTab('chats');
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if this is an image generation request
    const isImageRequest =
      Boolean(options?.isImageGen) ||
      /\b(generate|create|draw|make|render)\s+(an?\s+)?(image|photo|picture|painting|illustration|portrait|wallpaper|drawing)\b/i.test(prompt) ||
      /\b(image|photo|picture|tasveer|chitra)\s*(banao|bana do|generate|chahiye)\b/i.test(prompt) ||
      /\b(ek\s+image|ek\s+photo|ek\s+tasveer)\b/i.test(prompt);

    if (isImageRequest) {
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt,
            aspectRatio: options?.aspectRatio || '1:1',
            style: options?.style || 'none',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate image');
        }

        const generatedAttachment: Attachment = {
          id: `img-${Date.now()}`,
          name: `${prompt.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_') || 'image'}.png`,
          type: 'image',
          mimeType: 'image/png',
          size: 1024,
          data: data.imageUrl,
          isGenerated: true,
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  model: 'gemini-image',
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `✨ Here is your generated image: **"${data.prompt || prompt}"**`,
                          imageInfo: {
                            prompt: data.prompt || prompt,
                            imageUrl: data.imageUrl,
                            aspectRatio: data.aspectRatio || options?.aspectRatio || '1:1',
                            provider: data.provider,
                          },
                          attachments: [generatedAttachment],
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
        return;
      } catch (imgErr: any) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: 'Failed to generate image.',
                          error: imgErr.message || 'Image generation error',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
        return;
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }

    // Auto-reload retry loop for network drops/errors
    const MAX_RETRIES = 2;
    let attempt = 0;
    let success = false;

    // Build user configuration payload
    const userConfig = {
      language: preferences.language,
      tone: preferences.tone,
      projectName: activeProject?.name,
      projectInstructions: activeProject?.instructions,
      memories: preferences.memoryEnabled
        ? memories.map((m) => m.text)
        : [],
    };

    while (attempt <= MAX_RETRIES && !success) {
      if (controller.signal.aborted) break;

      if (attempt > 0) {
        // Show auto-reloading notice on the message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          retryStatus: {
                            isRetrying: true,
                            attempt,
                            maxAttempts: MAX_RETRIES,
                            message: `Network reconnecting... Auto-reloading response (Attempt ${attempt}/${MAX_RETRIES})`,
                          },
                        }
                      : m
                  ),
                }
              : c
          )
        );
        // Wait 1.5 seconds before retrying
        await new Promise((res) => setTimeout(res, 1500));
      }

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: targetConv.messages,
            prompt,
            attachments,
            webSearch,
            userConfig,
            model: selectedModel,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || `Server returned ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let citations: any[] = [];
        let streamError: string | null = null;
        let activeModelName = selectedModel || 'gemini-3.8-flash';

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === 'model') {
                    if (event.model) activeModelName = event.model;
                  } else if (event.type === 'chunk') {
                    accumulatedText += event.text;
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === convId
                          ? {
                              ...c,
                              messages: c.messages.map((m) =>
                                m.id === assistantMsgId
                                  ? {
                                      ...m,
                                      content: accumulatedText,
                                      model: activeModelName,
                                      retryStatus: undefined,
                                    }
                                  : m
                              ),
                            }
                          : c
                      )
                    );
                  } else if (event.type === 'done') {
                    if (event.fullText) accumulatedText = event.fullText;
                    if (event.citations) citations = event.citations;
                    if (event.model) activeModelName = event.model;
                  } else if (event.type === 'error') {
                    streamError = event.error;
                  }
                } catch (e) {
                  // Ignore parse errors on partial chunks
                }
              }
            }
          }
        }

        // If stream failed before receiving any response text, trigger auto-retry
        if (streamError && !accumulatedText.trim()) {
          throw new Error(streamError);
        }

        // Finalize assistant message on success
        success = true;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  model: activeModelName,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: accumulatedText,
                          error: streamError || undefined,
                          citations,
                          isStreaming: false,
                          model: activeModelName,
                          retryStatus: undefined,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // User deliberately pressed stop
          break;
        }

        attempt++;
        if (attempt > MAX_RETRIES) {
          const errorMsg =
            error.message || 'Network connection issue. Click to reload.';
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            error: errorMsg,
                            isStreaming: false,
                            retryStatus: undefined,
                          }
                        : m
                    ),
                  }
                : c
            )
          );
        }
      }
    }

    setIsGenerating(false);
    abortControllerRef.current = null;
  };

  // Dedicated retry handler for failed messages
  const handleRetryMessage = (assistantMsgId: string) => {
    if (!activeConversation) return;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex <= 0) {
      handleRegenerate();
      return;
    }
    const precedingUserMsg = activeConversation.messages[msgIndex - 1];
    if (precedingUserMsg && precedingUserMsg.role === 'user') {
      // Remove failed assistant message and resend
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.filter((m) => m.id !== assistantMsgId),
              }
            : c
        )
      );
      handleSendMessage(precedingUserMsg.content, precedingUserMsg.attachments || []);
    } else {
      handleRegenerate();
    }
  };

  // Stop streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      // Mark current assistant message as finished
      if (activeConversationId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.isStreaming ? { ...m, isStreaming: false } : m
                  ),
                }
              : c
          )
        );
      }
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === 'user');

    if (lastUserMessage) {
      // Remove last assistant message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.slice(0, -1),
              }
            : c
        )
      );
      handleSendMessage(lastUserMessage.content, lastUserMessage.attachments || []);
    }
  };

  // Natural language image editing handler (Zero code required!)
  const handleEditImage = async (
    originalImageUrl: string,
    originalPrompt: string,
    editInstruction: string,
    aspectRatio: string = '1:1'
  ) => {
    let convId = activeConversationId;
    let targetConv = conversations.find((c) => c.id === convId);

    if (!targetConv || !convId) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: `Edit: ${editInstruction.slice(0, 28)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(newConv.id);
      targetConv = newConv;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: `✏️ Edit image: ${editInstruction}`,
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg-${Date.now()}-assistant`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: `Transforming image with AI: **"${editInstruction}"**...`,
      timestamp: Date.now(),
      model: selectedModel,
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: [...(c.messages || []), userMsg, assistantMsg],
            }
          : c
      )
    );

    setIsGenerating(true);
    try {
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImageUrl,
          originalPrompt,
          editInstruction,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      const editedAttachment: Attachment = {
        id: `img-${Date.now()}`,
        name: `edited-${editInstruction.slice(0, 16).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        type: 'image',
        mimeType: 'image/png',
        size: 1024,
        data: data.imageUrl,
        isGenerated: true,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `✨ Here is your updated image: **"${editInstruction}"**`,
                        imageInfo: {
                          prompt: data.prompt,
                          imageUrl: data.imageUrl,
                          aspectRatio,
                          isEdited: true,
                          editInstruction,
                          provider: data.provider,
                        },
                        attachments: [editedAttachment],
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err: any) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: 'Failed to edit image.',
                        error: err.message || 'Image editing error',
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
        setActiveTab('home');
      }
    }
  };

  // Toggle conversation pinned
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Export single chat to Markdown
  const handleExportConversation = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    let md = `# ${conv.title}\n\nDate: ${new Date(
      conv.createdAt
    ).toLocaleString()}\nModel: ${conv.model}\n\n---\n\n`;

    conv.messages.forEach((m) => {
      md += `### ${m.role === 'user' ? 'User' : 'Aura AI'}\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export all data as JSON
  const handleExportAllData = () => {
    const data = {
      app: 'Aura AI',
      exportedAt: new Date().toISOString(),
      conversations,
      projects,
      memories,
      preferences,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura_ai_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all workspace data
  const handleClearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all conversations, projects, and memories? This cannot be undone.'
      )
    ) {
      localStorage.clear();
      setConversations([]);
      setActiveConversationId(null);
      setProjects([]);
      setActiveProjectId(undefined);
      setMemories([]);
      setFilesHub([]);
      setActiveTab('home');
      setIsSettingsModalOpen(false);
    }
  };

  // Files Hub file upload handler
  const handleUploadFileToHub = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImage) {
        reader.onload = (e) => {
          const newAtt: Attachment = {
            id: `hub-file-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: 'image',
            mimeType: file.type || 'image/jpeg',
            size: file.size,
            data: e.target?.result as string,
          };
          setFilesHub((prev) => [newAtt, ...prev]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          const res = e.target?.result as string;
          const newAtt: Attachment = {
            id: `hub-file-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: 'document',
            mimeType: file.type || 'text/plain',
            size: file.size,
            data: res,
            extractedText: res.slice(0, 5000),
          };
          setFilesHub((prev) => [newAtt, ...prev]);
        };
        reader.readAsText(file);
      }
    });
  };

  // Analyze file from Files Hub
  const handleAnalyzeHubFile = (file: Attachment) => {
    const prompt =
      file.type === 'image'
        ? `Please provide a thorough visual analysis of this uploaded image "${file.name}": break down key elements, structure, and design recommendations.`
        : `Please examine and summarize this document "${file.name}": outline main findings, structure, and actionable takeaways.`;

    handleSendMessage(prompt, [file]);
  };

  // Enforce Authentication Gate: "bina login ke app open na ho"
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={(user) => setCurrentUser(user)}
        defaultEmail="karanchuhan101998@gmail.com"
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#070A12] text-[#F8FAFC] overflow-hidden select-none font-sans">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveTab('chats');
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onExportConversation={handleExportConversation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onOpenLive={() => setIsLiveOpen(true)}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
      />

      {/* Main Content Area: Pure Single-Page ChatGPT / Gemini Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenMemory={() => setIsMemoryModalOpen(true)}
          onOpenProjects={() => setIsProjectsModalOpen(true)}
          onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
          activeProject={activeProject}
          webSearch={webSearch}
          onToggleWebSearch={() => setWebSearch((prev) => !prev)}
          capabilities={CAPABILITIES}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {/* Single-Page Chat Interface (Zero Code Image Generation & Editing) */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ChatView
            conversation={
              activeConversation || {
                id: 'default-conv',
                title: 'New Chat',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                model: selectedModel,
                messages: [],
              }
            }
            onSendMessage={handleSendMessage}
            onEditImage={handleEditImage}
            onRegenerate={handleRegenerate}
            onRetryMessage={handleRetryMessage}
            isGenerating={isGenerating}
            onStopGeneration={handleStopGeneration}
            webSearch={webSearch}
            onToggleWebSearch={() => setWebSearch((prev) => !prev)}
            project={activeProject}
            onOpenLive={() => setIsLiveOpen(true)}
            userName={currentUser.name.split(' ')[0]}
          />
        </main>
      </div>

      {/* Modals */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onCreateProject={(p) =>
          setProjects((prev) => [
            {
              ...p,
              id: `proj-${Date.now()}`,
              createdAt: Date.now(),
              files: [],
            },
            ...prev,
          ])
        }
        onDeleteProject={(id) => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          if (activeProjectId === id) setActiveProjectId(undefined);
        }}
      />

      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        memoryEnabled={preferences.memoryEnabled}
        onToggleMemoryEnabled={() =>
          setPreferences((prev) => ({
            ...prev,
            memoryEnabled: !prev.memoryEnabled,
          }))
        }
        onAddMemory={(text, category) =>
          setMemories((prev) => [
            ...prev,
            { id: `mem-${Date.now()}`, text, category, createdAt: Date.now() },
          ])
        }
        onDeleteMemory={(id) =>
          setMemories((prev) => prev.filter((m) => m.id !== id))
        }
        onClearAllMemories={() => setMemories([])}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(p) => setPreferences((prev) => ({ ...prev, ...p }))}
        onExportAllData={handleExportAllData}
        onClearAllData={handleClearAllData}
        conversationsCount={conversations.length}
      />

      {/* 3D Gemini Live Voice Modal */}
      <GeminiLiveModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
        onSendMessage={(text) => handleSendMessage(text, [])}
        userName={currentUser.name}
      />

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerInstall={handleTriggerInstall}
        canDirectInstall={!!deferredInstallPrompt}
      />
    </div>
  );
};

export default App;
