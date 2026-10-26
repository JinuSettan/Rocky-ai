/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Sparkles, LogIn, UserPlus, ArrowRight, Star, Cpu, Flame, Compass } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/googleDriveService';

interface LoginProps {
  onLoginSuccess: (username: string, email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || (!isLogin && !username.trim())) {
      setError('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        onLoginSuccess(
          credential.user.displayName || username.trim() || normalizedEmail.split('@')[0],
          credential.user.email || normalizedEmail
        );
      } else {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        if (username.trim()) {
          await updateProfile(credential.user, { displayName: username.trim() });
        }
        onLoginSuccess(username.trim(), credential.user.email || normalizedEmail);
      }
    } catch (err: any) {
      const code = typeof err?.code === 'string' ? err.code : '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Email or password is incorrect.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account already exists for this email. Please sign in.');
      } else if (code === 'auth/weak-password') {
        setError('Choose a stronger password with at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Email/password sign-in is not enabled in Firebase Authentication.');
      } else {
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen w-full bg-transparent flex items-center justify-center p-4 overflow-hidden selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* 1. Cinematic Ambient Background Wallpaper with parallax & blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 filter blur-sm opacity-30 transition-all duration-1000 z-0"
        style={{ 
          backgroundImage: 'url(/src/assets/images/rock_ai_wallpaper_1784212226814.jpg)',
        }}
      />

      {/* 2. Deep space cinematic radial mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 via-[#050505]/20 to-[#050505]/70 z-0" />

      {/* Cosmic Neon Lights Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Brand Banner with the spectacular new global brand logo */}
        <div className="text-center mb-6">
          <motion.div 
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/85 border border-cyan-500/30 text-cyan-400 text-xs mb-5 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,240,255,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin-slow" />
            <span className="font-semibold tracking-wide uppercase">Rock AI Quantum OS • v2.0</span>
          </motion.div>

          <div className="flex flex-col items-center gap-4 mb-2">
            {/* Centered spectacular app logo symbol */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-24 h-24 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 shadow-[0_0_40px_rgba(0,240,255,0.3)] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/80 rounded-2xl" />
              <img
                src="/src/assets/images/rock_ai_logo_1784212244029.jpg"
                alt="Rock AI Infinite Logo"
                className="w-full h-full object-cover rounded-2xl relative z-10 filter brightness-110"
                referrerPolicy="no-referrer"
              />
              {/* Spinning scanning neon light overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20" />
            </motion.div>

            <h1 className="text-5xl font-extrabold tracking-tighter text-white flex items-center justify-center gap-0.5">
              <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(0,240,255,0.4)]">ROCK AI</span>
            </h1>
          </div>

          <p className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1">
            CENTER OF THE INTELLIGENCE UNIVERSE
          </p>
        </div>

        {/* Premium Luxurious Glassmorphic Credentials Portal */}
        <div className="bg-black/75 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden">
          {/* Animated Glowing Gradient Edge Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 animate-pulse" />

          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {isLogin ? 'AUTHENTICATE SECURELY' : 'INITIALIZE OS CORE'}
            </h2>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-pink-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider"
            >
              {isLogin ? <UserPlus className="w-3.5 h-3.5 text-pink-500" /> : <LogIn className="w-3.5 h-3.5 text-cyan-500" />}
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">User Handle</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950/90 border border-white/10 focus:border-cyan-500 rounded-2xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-700 font-medium"
                    placeholder="e.g. quantum_coder"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Developer Identity</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/90 border border-white/10 focus:border-pink-500 rounded-2xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-zinc-700 font-medium"
                placeholder="developer@rockai.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Quantum Secret Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/90 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-700 font-medium font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs text-center font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Luxurious Glass Button with neon glow */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative mt-3 group overflow-hidden bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 text-white font-bold text-xs uppercase tracking-[0.15em] py-4 rounded-2xl shadow-[0_0_30px_rgba(255,0,191,0.25)] hover:shadow-[0_0_40px_rgba(0,240,255,0.45)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer btn-glass-ripple"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'ENGAGE OS INTERACTION' : 'INITIALIZE COMPUTE'}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.2em] px-4">OR BYPASS GATEWAY</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>


        </div>

        {/* Bottom Credits Footer */}
        <p className="text-center text-zinc-500 text-[10px] mt-8 uppercase tracking-[0.2em] font-bold">
          SECURED QUANTUM CHANNEL • POWERED BY ROCK ENGINE v2
        </p>
      </motion.div>
    </div>
  );
};
