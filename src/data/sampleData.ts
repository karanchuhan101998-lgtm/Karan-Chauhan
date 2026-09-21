import { Conversation, Project, MemoryItem } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Full-Stack Architecture',
    description: 'Guidelines for scalable React, Node.js, and API engineering.',
    instructions: 'Focus on modularity, clean TypeScript types, error handling, and performance optimization.',
    createdAt: Date.now() - 86400000 * 3,
    files: [],
  },
  {
    id: 'proj-2',
    name: 'Hindi & Hinglish Assistant',
    description: 'Multilingual conversational reasoning and translation.',
    instructions: 'Communicate naturally in polite Hinglish or pure Hindi as needed. Retain English technical terminology.',
    createdAt: Date.now() - 86400000 * 2,
    files: [],
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    text: 'Prefers TypeScript with strict type definitions and clean modular file structures.',
    category: 'coding',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'mem-2',
    text: 'Enjoys friendly, conversational Hinglish for explanations alongside clear technical code.',
    category: 'language',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-welcome',
    title: 'Aura AI Architecture & Multimodal Capabilities',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Aura AI, can you give me an overview of your capabilities in Hinglish?',
        timestamp: Date.now() - 3600000 * 4,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `नमस्ते! मैं **Aura AI** हूँ — आपका इंटेलिजेंट, क्रिएटिव और मल्टीमॉडल AI वर्कस्पेस।

यहाँ मेरी मुख्य क्षमताओं का एक संक्षिप्त और स्पष्ट ओवरव्यू है:

### 1. 🌐 मल्टीमॉडल इनपुट्स (Multimodal Understanding)
- **Vision & Image Analysis**: आप किसी भी UI स्क्रीनशॉट, डायग्राम, फ्लोचार्ट या फोटो को अपलोड करके उसका विस्तृत विश्लेषण करवा सकते हैं।
- **Documents & PDFs**: बड़े फाइल्स, रिपोर्ट्स या कोड स्निपेट्स का सार (Summary) निकालना और उनमें से मुख्य बातें ढूँढना।
- **Audio & Voice**: वॉयस इनपुट और ऑडियो स्पीच सपोर्ट।

### 2. ⚡ कोडिंग और सिस्टम डिज़ाइन (Full-Stack Engineering)
- **Languages**: TypeScript, JavaScript, Python, C++, SQL, HTML/Tailwind आदि।
- **Architecture**: क्लीन मॉड्यूलर आर्किटेक्चर, REST APIs, सुरक्षा और एरर हैंडलिंग।
- **Interactive Sandbox**: गणितीय और डेटा गणनाओं को सुरक्षित वातावरण में चलाना।

### 3. 🔍 लाइव वेब रिसर्च (Grounding Citations)
- Google Search इंटीग्रेशन की मदद से ताज़ा जानकारी और क्लिक करने योग्य संदर्भ स्रोत (Citations)।

### 4. 🗣️ स्वाभाविक बहुभाषी संवाद (Natural Hinglish & Multilingual)
- हिंदी, हिंग्लिश ("*bhai yeh bug kaise fix karein*") और अंग्रेजी में स्वाभाविक रूप से विचार-विमर्श।

*आप जो भी प्रोजेक्ट या कोड बनाना चाहते हैं, बस पूछिए — मैं शुरू करने के लिए तैयार हूँ!*`,
        timestamp: Date.now() - 3600000 * 4 + 2000,
        model: 'gemini-3.8-flash',
      },
    ],
  },
];

export const EXPLORE_PROMPTS = [
  {
    id: 'exp-1',
    category: 'Coding',
    title: 'Full-Stack Architecture Plan',
    prompt: 'Create a clean, production-ready architecture plan for a real-time collaborative workspace using TypeScript and WebSockets.',
    icon: 'Code2',
    color: '#8B5CF6',
  },
  {
    id: 'exp-2',
    category: 'STEM & Math',
    title: 'Algorithm Complexity & Proof',
    prompt: 'Explain Dijkstra algorithm vs A* search with step-by-step mathematical logic and Python implementation.',
    icon: 'Cpu',
    color: '#22D3EE',
  },
  {
    id: 'exp-3',
    category: 'Vision',
    title: 'UI/UX Design Critique',
    prompt: 'Upload a web or mobile screenshot to evaluate typography hierarchy, color contrast ratios, and layout rhythm.',
    icon: 'Sparkles',
    color: '#F472B6',
  },
  {
    id: 'exp-4',
    category: 'Writing & Research',
    title: 'Bilingual Technical Article',
    prompt: 'Write an intuitive Hinglish guide explaining how Transformer models use Multi-Head Attention mechanisms.',
    icon: 'BookOpen',
    color: '#60A5FA',
  },
  {
    id: 'exp-5',
    category: 'Data Analysis',
    title: 'CSV Statistical Summary',
    prompt: 'Analyze tabular sales or metrics data: calculate mean, variance, anomalies, and generate formatted summary tables.',
    icon: 'BarChart3',
    color: '#34D399',
  },
  {
    id: 'exp-6',
    category: 'Productivity',
    title: 'Project Roadmap & Sprint Tasks',
    prompt: 'Break down an MVP product launch into 4 sequential 2-week sprints with milestones and risk mitigation.',
    icon: 'Layers',
    color: '#F59E0B',
  },
];
