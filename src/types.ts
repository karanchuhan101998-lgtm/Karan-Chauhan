export interface Attachment {
  id: string;
  name: string;
  type: string; // 'image' | 'document' | 'audio' | 'code'
  mimeType: string;
  size: number;
  data: string; // Base64 or text preview / image URL
  extractedText?: string;
  isGenerated?: boolean;
}

export interface Citation {
  title: string;
  url: string;
}

export interface ImageGenerationData {
  prompt: string;
  imageUrl: string;
  aspectRatio?: string;
  isEdited?: boolean;
  editInstruction?: string;
  provider?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  attachments?: Attachment[];
  citations?: Citation[];
  isStreaming?: boolean;
  error?: string;
  imageInfo?: ImageGenerationData;
  retryStatus?: {
    isRetrying: boolean;
    attempt: number;
    maxAttempts: number;
    message: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  projectId?: string;
  messages: Message[];
  pinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  createdAt: number;
  files: Attachment[];
}

export interface MemoryItem {
  id: string;
  text: string;
  createdAt: number;
  category?: 'coding' | 'language' | 'preference' | 'personal';
}

export interface UserPreferences {
  language: 'auto' | 'en' | 'hi' | 'hinglish';
  tone: 'balanced' | 'concise' | 'thoughtful' | 'technical' | 'friendly';
  memoryEnabled: boolean;
  theme: 'dark' | 'light';
  voice: 'Kore' | 'Zephyr' | 'Puck' | 'Charon';
}

export interface AppCapabilities {
  text: boolean;
  vision: boolean;
  voice: boolean;
  web: boolean;
  code: boolean;
  data: boolean;
  imageGeneration: boolean;
}

export type ActiveTab = 'home' | 'chats' | 'create' | 'explore' | 'files' | 'projects';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
  createdAt: number;
}

