import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { AuthUser } from '../types';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  defaultEmail?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  defaultEmail = 'karanchuhan101998@gmail.com',
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Karan');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const derivedName = name.trim() || email.split('@')[0] || 'User';
      const user: AuthUser = {
        id: `user-${Date.now()}`,
        name: derivedName,
        email: email.trim(),
        provider: 'email',
        createdAt: Date.now(),
      };
      if (rememberMe) {
        localStorage.setItem('aura_ai_auth_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('aura_ai_auth_user', JSON.stringify(user));
      }
      setIsLoading(false);
      onLogin(user);
    }, 450);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const user: AuthUser = {
        id: 'google-user-karan',
        name: 'Karan Chauhan',
        email: defaultEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        createdAt: Date.now(),
      };
      if (rememberMe) {
        localStorage.setItem('aura_ai_auth_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('aura_ai_auth_user', JSON.stringify(user));
      }
      setIsLoading(false);
      onLogin(user);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A12] px-4 py-8 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#8B5CF6]/15 via-[#22D3EE]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Container */}
        <div className="bg-[#0C101C]/90 border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center mb-1">
              <GeminiLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Aura <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]">AI</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {isSignUp ? 'Create your account to get started' : 'Sign in to access your intelligent AI workspace'}
            </p>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-sm font-medium text-white transition-all duration-150 group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">or with email</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-white/[0.05] text-[#8B5CF6] focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <span className="text-[#22D3EE] hover:underline cursor-pointer">
                Privacy & terms
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#A855F7] text-white text-sm font-medium hover:opacity-95 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-400">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account yet?"} </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[#22D3EE] hover:text-[#38BDF8] font-medium ml-1 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Bottom Secure Badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Protected with 256-bit workspace encryption</span>
        </div>
      </motion.div>
    </div>
  );
};
