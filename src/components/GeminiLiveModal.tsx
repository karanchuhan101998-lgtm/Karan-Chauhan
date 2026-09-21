import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, Radio, Pause, Play, Square } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';

interface GeminiLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, attachments: any[]) => void;
  userName?: string;
}

export const GeminiLiveModal: React.FC<GeminiLiveModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  userName = 'Karan',
}) => {
  const [liveState, setLiveState] = useState<'listening' | 'thinking' | 'speaking' | 'paused'>('listening');
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handsFree, setHandsFree] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  const stateRef = useRef(liveState);
  stateRef.current = liveState;

  const handsFreeRef = useRef(handsFree);
  handsFreeRef.current = handsFree;

  // Stop any active audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  // Safe restart listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isOpen) return;
    try {
      recognitionRef.current.start();
      setLiveState('listening');
      setErrorMessage(null);
    } catch (e: any) {
      // If already started, that's fine
      if (e.name !== 'InvalidStateError') {
        console.warn('Speech recognition start note:', e);
      }
    }
  }, [isOpen]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    isComponentMounted.current = true;

    if (!isOpen) {
      stopAudio();
      stopListening();
      setLiveState('paused');
      setTranscript('');
      setAssistantReply('');
      setErrorMessage(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech Recognition is not supported on this browser. Chrome or Edge is recommended.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setLiveState('listening');
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentText += event.results[i][0].transcript;
      }

      if (currentText.trim()) {
        setTranscript(currentText);

        // Reset silence timer on speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // When user pauses speaking for 1.4s, automatically process the question!
        silenceTimerRef.current = setTimeout(() => {
          if (currentText.trim() && stateRef.current === 'listening') {
            stopListening();
            processLiveTurn(currentText.trim());
          }
        }, 1400);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Normal silence timeout - ignore
        return;
      }
      console.warn('Recognition status:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser.');
      }
    };

    recognition.onend = () => {
      // If hands-free is active and we are supposed to be listening, immediately auto-restart!
      if (
        isOpen &&
        handsFreeRef.current &&
        stateRef.current !== 'thinking' &&
        stateRef.current !== 'speaking' &&
        stateRef.current !== 'paused'
      ) {
        setTimeout(() => {
          if (isOpen && stateRef.current !== 'thinking' && stateRef.current !== 'speaking') {
            startListening();
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;
    startListening();

    return () => {
      isComponentMounted.current = false;
      stopAudio();
      stopListening();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isOpen, startListening, stopListening, stopAudio]);

  // Send turn to backend and speak answer
  const processLiveTurn = async (userText: string) => {
    if (!userText.trim()) return;
    setLiveState('thinking');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          messages: [],
          model: 'gemini-3.1-flash-lite',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

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
                if (event.type === 'chunk') {
                  fullText += event.text;
                  setAssistantReply(fullText);
                } else if (event.type === 'done' && event.fullText) {
                  fullText = event.fullText;
                  setAssistantReply(fullText);
                }
              } catch {}
            }
          }
        }
      }

      // Also forward user text to conversation history
      onSendMessage(userText, []);

      // Speak response out loud
      if (fullText.trim()) {
        speakResponse(fullText.trim());
      } else {
        resumeListeningAfterSpeech();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process voice turn.');
      resumeListeningAfterSpeech();
    }
  };

  // Helper to resume listening automatically after AI speaking
  const resumeListeningAfterSpeech = () => {
    if (!isOpen) return;
    setTranscript('');
    if (handsFreeRef.current) {
      setLiveState('listening');
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      setLiveState('paused');
    }
  };

  // Speak AI response with TTS or browser SpeechSynthesis fallback
  const speakResponse = async (text: string) => {
    setLiveState('speaking');
    stopAudio();

    // Clean markdown asterisks or code formatting for cleaner speech
    const cleanSpeechText = text
      .replace(/[*_#`~\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeechText, voice: 'Kore' }),
      });

      if (ttsRes.ok) {
        const data = await ttsRes.json();
        if (data.audio) {
          const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            resumeListeningAfterSpeech();
          };

          audio.onerror = () => {
            fallbackBrowserSpeech(cleanSpeechText);
          };

          await audio.play();
          return;
        }
      }
      fallbackBrowserSpeech(cleanSpeechText);
    } catch (e) {
      fallbackBrowserSpeech(cleanSpeechText);
    }
  };

  // Browser SpeechSynthesis fallback
  const fallbackBrowserSpeech = (cleanText: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          resumeListeningAfterSpeech();
        };

        utterance.onerror = () => {
          resumeListeningAfterSpeech();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch {}
    }
    resumeListeningAfterSpeech();
  };

  // User manual interruption / stop reply
  const handleInterrupt = () => {
    stopAudio();
    resumeListeningAfterSpeech();
  };

  // Toggle mic / pause hands-free
  const toggleMicPause = () => {
    if (liveState === 'listening' || liveState === 'speaking') {
      stopAudio();
      stopListening();
      setLiveState('paused');
    } else {
      setTranscript('');
      setErrorMessage(null);
      setLiveState('listening');
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-black/95 backdrop-blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 55%, rgba(29, 78, 216, 0.28) 0%, rgba(15, 23, 42, 0.85) 50%, #000000 100%)',
        }}
      >
        {/* Top Header */}
        <div className="w-full max-w-4xl flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <GeminiLogo size="sm" showText={true} modelBadge="Live" />
          </div>

          {/* Hands-free Auto-Listen Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hands-free Mode Active (No tapping needed)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white transition-colors"
            title="Close Gemini Live"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center 3D Organic Visualizer */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* Ambient Background Aura */}
            <motion.div
              animate={{
                scale:
                  liveState === 'listening'
                    ? [1, 1.25, 1]
                    : liveState === 'speaking'
                    ? [1, 1.35, 1.05]
                    : [1, 1.08, 1],
                opacity: liveState === 'paused' ? 0.25 : 0.7,
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4] blur-3xl"
            />

            {/* Liquid Waveform Orb */}
            <motion.div
              animate={{
                rotate: 360,
                borderRadius:
                  liveState === 'speaking'
                    ? ['40% 60% 70% 30% / 40% 50% 60% 50%', '60% 40% 30% 70% / 50% 60% 40% 60%', '40% 60% 70% 30% / 40% 50% 60% 50%']
                    : liveState === 'listening'
                    ? ['48% 52% 54% 46% / 52% 48% 52% 48%', '52% 48% 46% 54% / 48% 52% 48% 52%', '48% 52% 54% 46% / 52% 48% 52% 48%']
                    : ['50%', '50%', '50%'],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 12, ease: 'linear' },
                borderRadius: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
              }}
              className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gradient-to-tr from-[#1D4ED8] via-[#4338CA] to-[#0284C7] p-1 shadow-[0_0_50px_rgba(59,130,246,0.6)] flex items-center justify-center cursor-pointer"
              onClick={liveState === 'speaking' ? handleInterrupt : toggleMicPause}
              title={liveState === 'speaking' ? 'Tap to interrupt' : 'Tap to toggle mic'}
            >
              <div className="w-full h-full rounded-full bg-black/55 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 relative overflow-hidden">
                <GeminiLogo size="lg" />

                {/* Live sound frequency bars */}
                <div className="flex items-center gap-1.5 mt-4">
                  {[4, 8, 12, 6, 10].map((h, idx) => (
                    <motion.span
                      key={idx}
                      animate={{
                        height:
                          liveState === 'speaking' || liveState === 'listening'
                            ? [6, h * 2.6, 4]
                            : [4, 6, 4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + idx * 0.1,
                        ease: 'easeInOut',
                      }}
                      className={`w-1 rounded-full ${
                        liveState === 'speaking'
                          ? 'bg-[#22D3EE]'
                          : liveState === 'listening'
                          ? 'bg-[#60A5FA]'
                          : 'bg-slate-600'
                      }`}
                      style={{ height: h * 1.5 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Current State Indicator */}
          <div className="mt-8 text-center max-w-md px-4">
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
              {liveState === 'listening' && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Listening to you...</span>
                </>
              )}
              {liveState === 'thinking' && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  <span>Gemini is thinking...</span>
                </>
              )}
              {liveState === 'speaking' && (
                <>
                  <Volume2 className="w-5 h-5 text-cyan-400 animate-bounce" />
                  <span>Gemini is speaking...</span>
                </>
              )}
              {liveState === 'paused' && (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Microphone Paused. Tap to resume.</span>
                </>
              )}
            </h2>

            {transcript && (
              <p className="mt-3 text-sm text-slate-200 italic max-h-24 overflow-y-auto bg-white/[0.06] p-3.5 rounded-2xl border border-white/[0.1]">
                "{transcript}"
              </p>
            )}

            {assistantReply && liveState === 'speaking' && (
              <p className="mt-2 text-xs text-blue-300/90 line-clamp-3 bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/20">
                {assistantReply}
              </p>
            )}

            {errorMessage && (
              <div className="mt-3 flex items-center justify-center gap-2 text-rose-300 text-xs bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hands-free Controls */}
        <div className="w-full max-w-md flex items-center justify-center gap-4 z-20 pb-4">
          {/* Toggle Mic / Pause */}
          <button
            type="button"
            onClick={toggleMicPause}
            className={`p-4 rounded-full transition-all duration-200 transform active:scale-95 flex items-center justify-center ${
              liveState === 'listening'
                ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
            }`}
            title={liveState === 'listening' ? 'Pause Mic' : 'Resume Mic'}
          >
            {liveState === 'listening' ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          {/* Stop Reply / Interrupt Button */}
          {liveState === 'speaking' && (
            <button
              type="button"
              onClick={handleInterrupt}
              className="px-5 py-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Reply & Listen</span>
            </button>
          )}

          {/* End Live Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-sm font-semibold text-white transition-colors"
          >
            End Live
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
