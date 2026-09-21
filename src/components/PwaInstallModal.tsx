import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Smartphone, Monitor, CheckCircle, Share } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
  canDirectInstall: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  canDirectInstall,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#0D121F] border border-white/[0.12] rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center mb-2">
              <GeminiLogo size="lg" showText={false} />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Install Aura AI App
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Install Aura AI on your device for full-screen standalone mode, fast offline loading, and instant hands-free Gemini Live access.
            </p>
          </div>

          {/* Direct Install CTA (Chromium / Android / Desktop) */}
          {canDirectInstall ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  onTriggerInstall();
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#A855F7] text-white text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Application Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-300 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
              <div className="font-semibold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#22D3EE]" />
                <span>How to install on your device:</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/[0.06] text-center leading-5 text-[11px] font-bold text-slate-400 shrink-0">1</span>
                <span><strong>Android / Chrome</strong>: Tap the three dots (⋮) menu in your browser and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/[0.06] text-center leading-5 text-[11px] font-bold text-slate-400 shrink-0">2</span>
                <span><strong>iPhone / iPad (Safari)</strong>: Tap the <strong>Share</strong> button (<Share className="w-3.5 h-3.5 inline" />) and choose <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/[0.06] text-center leading-5 text-[11px] font-bold text-slate-400 shrink-0">3</span>
                <span><strong>Desktop (Chrome/Edge)</strong>: Click the install icon (⊕) in the browser address bar.</span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full screen experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hands-free voice mode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline quick cache</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero installation size</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
