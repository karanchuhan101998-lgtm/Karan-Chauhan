import React from 'react';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Aura Logo Mark: Intersecting concentric waves & flowing luminous core */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]"
        >
          <defs>
            {/* Aura Primary Gradient */}
            <linearGradient id="auraWave1" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            {/* Luminous Inner Core */}
            <linearGradient id="auraCore" x1="16" y1="48" x2="48" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            {/* Soft Ambient Radial Blur */}
            <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#070A12" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Glow Disk */}
          <circle cx="32" cy="32" r="28" fill="url(#auraGlow)" />

          {/* Outer Orbital Ring */}
          <ellipse
            cx="32"
            cy="32"
            rx="24"
            ry="14"
            transform="rotate(-25 32 32)"
            stroke="url(#auraWave1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="90 20"
            className="opacity-80"
          />

          {/* Inner Orbital Wave */}
          <ellipse
            cx="32"
            cy="32"
            rx="18"
            ry="10"
            transform="rotate(35 32 32)"
            stroke="url(#auraCore)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="60 25"
            className="opacity-90"
          />

          {/* Center Stylized Harmonic 'A' Core */}
          <path
            d="M32 16L41 38C41 38 37 36 32 36C27 36 23 38 23 38L32 16Z"
            fill="url(#auraCore)"
            className="opacity-90"
          />
          <circle cx="32" cy="27" r="3" fill="#F8FAFC" className="filter drop-shadow-[0_0_6px_#22D3EE]" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight text-white ${text}`}
              style={{ letterSpacing: '-0.03em' }}
            >
              Aura <span className="text-[#22D3EE] font-semibold">AI</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
