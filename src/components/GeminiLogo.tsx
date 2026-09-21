import React from 'react';

interface GeminiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  modelBadge?: string;
  className?: string;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({
  size = 'md',
  showText = false,
  modelBadge,
  className = '',
}) => {
  const sizeMap = {
    xs: { px: 18, text: 'text-sm' },
    sm: { px: 24, text: 'text-base' },
    md: { px: 36, text: 'text-xl' },
    lg: { px: 52, text: 'text-2xl' },
    xl: { px: 72, text: 'text-3xl' },
    hero: { px: 88, text: 'text-4xl' },
  };

  const { px, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: px, height: px }}
      >
        {/* Ambient 3D Glow behind the Gemini Star */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(66,133,244,0.6) 0%, rgba(156,39,176,0.4) 50%, rgba(255,112,67,0.2) 80%, transparent 100%)',
            transform: 'scale(1.4)',
          }}
        />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 filter drop-shadow-[0_2px_12px_rgba(66,133,244,0.45)]"
        >
          <defs>
            {/* Primary Google Gemini 4-Pointed Sparkle Gradient */}
            <linearGradient id="geminiGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="28%" stopColor="#2979FF" />
              <stop offset="55%" stopColor="#9C27B0" />
              <stop offset="78%" stopColor="#E91E63" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>

            {/* Specular highlight for 3D depth */}
            <linearGradient id="geminiHighlight" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>

            {/* Soft inner radial flare */}
            <radialGradient id="geminiFlare" cx="50%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="35%" stopColor="#60A5FA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Authentic Gemini 4-Pointed Star Shape */}
          <path
            d="M50,0 C50,27.614 72.386,50 100,50 C72.386,50 50,72.386 50,100 C50,72.386 27.614,50 0,50 C27.614,50 50,27.614 50,0 Z"
            fill="url(#geminiGrad1)"
          />

          {/* 3D Specular Overlay */}
          <path
            d="M50,0 C50,27.614 72.386,50 100,50 C72.386,50 50,72.386 50,100 C50,72.386 27.614,50 0,50 C27.614,50 50,27.614 50,0 Z"
            fill="url(#geminiHighlight)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Central Luminous Core */}
          <circle cx="50" cy="50" r="18" fill="url(#geminiFlare)" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-semibold tracking-tight text-white ${text}`}>
            Gemini
          </span>
          {modelBadge && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/[0.08]">
              {modelBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
