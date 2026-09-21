import React from 'react';
import { motion } from 'motion/react';

interface GeminiLiveButtonProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GeminiLiveButton: React.FC<GeminiLiveButtonProps> = ({
  onClick,
  isActive = false,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const barHeights = {
    sm: ['h-3', 'h-5', 'h-3'],
    md: ['h-3.5', 'h-6', 'h-4'],
    lg: ['h-5', 'h-8', 'h-6'],
  };

  return (
    <button
      type="button"
      id="btn-gemini-live-3d"
      onClick={onClick}
      title="Start Gemini Live Audio Conversation"
      className={`relative group rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 focus:outline-none flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{
        background: isActive
          ? 'radial-gradient(circle at 30% 30%, #60A5FA, #2563EB 60%, #1E40AF 100%)'
          : 'radial-gradient(circle at 35% 25%, #3B82F6 0%, #1D4ED8 50%, #1E3A8A 100%)',
        boxShadow: isActive
          ? '0 0 25px rgba(59, 130, 246, 0.7), inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -3px 6px rgba(0, 0, 0, 0.4)'
          : '0 4px 14px rgba(29, 78, 216, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* 3D Specular Top Rim Reflection */}
      <div
        className="absolute top-1 left-2 right-2 h-1/3 rounded-full pointer-events-none opacity-60"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Ambient Pulsing Glow when active */}
      {isActive && (
        <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
      )}

      {/* 3D Audio Live Waveform Bars (|||) matching Google Gemini Live */}
      <div className="relative z-10 flex items-center justify-center gap-1">
        <motion.span
          animate={{
            scaleY: isActive ? [0.4, 1, 0.5, 0.9, 0.4] : [0.6, 1, 0.7, 0.9, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: isActive ? 0.7 : 1.6,
            ease: 'easeInOut',
          }}
          className={`w-[3px] bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)] ${barHeights[size][0]}`}
        />
        <motion.span
          animate={{
            scaleY: isActive ? [0.8, 0.3, 1, 0.5, 0.8] : [0.9, 0.6, 1, 0.7, 0.9],
          }}
          transition={{
            repeat: Infinity,
            duration: isActive ? 0.8 : 1.4,
            ease: 'easeInOut',
            delay: 0.15,
          }}
          className={`w-[3px] bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)] ${barHeights[size][1]}`}
        />
        <motion.span
          animate={{
            scaleY: isActive ? [0.5, 0.9, 0.3, 1, 0.5] : [0.7, 1, 0.5, 0.8, 0.7],
          }}
          transition={{
            repeat: Infinity,
            duration: isActive ? 0.75 : 1.5,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          className={`w-[3px] bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)] ${barHeights[size][2]}`}
        />
      </div>
    </button>
  );
};
