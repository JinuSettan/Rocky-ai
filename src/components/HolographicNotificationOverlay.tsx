/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertTriangle, Info, X, Award, 
  Cpu, Rocket, Zap, Smartphone, Gamepad2, Globe, Sparkles, Terminal, ShieldAlert
} from 'lucide-react';
import { Notification, Achievement, BuildReport } from '../types';

export const HolographicNotificationOverlay: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    unlockedAchievements, 
    achievements,
    activeBuildReport,
    setActiveBuildReport
  } = useProject();

  const [activeCards, setActiveCards] = useState<Notification[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<Achievement | null>(null);
  const processedAchievementsRef = useRef<string[]>(unlockedAchievements);

  // Sync recent notifications (auto-dismiss after 4 seconds)
  useEffect(() => {
    if (notifications.length === 0) return;
    
    // Get the latest notification
    const latest = notifications[0];
    
    // Check if we've already displayed it
    setActiveCards(prev => {
      if (prev.some(n => n.id === latest.id)) return prev;
      
      // Auto-remove after 4.5 seconds
      setTimeout(() => {
        setActiveCards(current => current.filter(c => c.id !== latest.id));
        markNotificationAsRead(latest.id);
      }, 4500);

      // Limit to 4 visible cards
      return [latest, ...prev].slice(0, 4);
    });
  }, [notifications]);

  // Sync achievements for full-screen celebration triggers
  useEffect(() => {
    const previous = processedAchievementsRef.current;
    const newlyUnlocked = unlockedAchievements.filter(id => !previous.includes(id));
    
    if (newlyUnlocked.length > 0) {
      const ach = achievements.find(a => a.id === newlyUnlocked[0]);
      if (ach) {
        setCurrentCelebration(ach);
      }
    }
    processedAchievementsRef.current = unlockedAchievements;
  }, [unlockedAchievements, achievements]);

  const handleDismissCard = (id: string) => {
    setActiveCards(prev => prev.filter(c => c.id !== id));
    markNotificationAsRead(id);
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-8 h-8" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8" />;
      case 'Gamepad2': return <Gamepad2 className="w-8 h-8" />;
      case 'Smartphone': return <Smartphone className="w-8 h-8" />;
      case 'Zap': return <Zap className="w-8 h-8" />;
      case 'Globe': return <Globe className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  return (
    <>
      {/* 1. Holographic Floating Side Notifications Stack */}
      <div id="holographic-notifications-container" className="fixed top-20 right-6 z-50 flex flex-col gap-3.5 w-80 pointer-events-none">
        <AnimatePresence>
          {activeCards.map((card) => {
            const isSuccess = card.type === 'success';
            const isError = card.type === 'error';
            const isWarning = card.type === 'warning';
            
            const glowColor = isSuccess 
              ? 'rgba(16,185,129,0.3)' 
              : isError 
              ? 'rgba(239,68,68,0.3)' 
              : isWarning 
              ? 'rgba(236,72,153,0.3)' 
              : 'rgba(6,182,212,0.3)';

            const borderColor = isSuccess 
              ? 'border-emerald-500/40' 
              : isError 
              ? 'border-red-500/40' 
              : isWarning 
              ? 'border-pink-500/40' 
              : 'border-cyan-500/40';

            const textColor = isSuccess 
              ? 'text-emerald-400' 
              : isError 
              ? 'text-red-400' 
              : isWarning 
              ? 'text-pink-400' 
              : 'text-cyan-400';

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 80, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.25 } }}
                style={{ boxShadow: `0 8px 32px 0 rgba(0,0,0,0.5), 0 0 15px ${glowColor}` }}
                className={`pointer-events-auto w-full rounded-2xl bg-[#030303]/85 backdrop-blur-2xl border ${borderColor} p-4 relative overflow-hidden select-none flex gap-3.5`}
              >
                {/* Scientific overlay grid scan lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-40" />
                
                {/* Top laser tracking bar */}
                <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse`} />

                {/* Left diagnostic icon mapping */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/5 ${textColor}`}>
                  {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                  {isError && <ShieldAlert className="w-5 h-5" />}
                  {isWarning && <AlertTriangle className="w-5 h-5" />}
                  {card.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`text-[8px] tracking-[0.18em] font-black uppercase text-zinc-500 flex items-center gap-1 mb-0.5`}>
                    <Cpu className="w-2.5 h-2.5" />
                    <span>HUD Telemetry Log</span>
                  </span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">
                    {card.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold mt-1">
                    {card.message}
                  </p>
                </div>

                <button
                  onClick={() => handleDismissCard(card.id)}
                  className="w-5 h-5 rounded-lg flex items-center justify-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer self-start"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. Full-Screen Achievement Unlock Celebration Popup */}
      <AnimatePresence>
        {currentCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden p-6">
            
            {/* Falling virtual confetti particle container */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-lg rounded-3xl bg-[#030303]/90 border border-yellow-500/30 p-8 text-center relative overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.15)] flex flex-col items-center"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-40" />

              {/* Glowing decorative radar rings */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600 p-0.5 shadow-[0_0_40px_rgba(234,179,8,0.35)] flex items-center justify-center relative mb-5 animate-bounce">
                <div className="absolute inset-0.5 rounded-2xl bg-black flex items-center justify-center text-yellow-400">
                  {getAchievementIcon(currentCelebration.icon)}
                </div>
              </div>

              <span className="text-[10px] font-black tracking-[0.3em] text-yellow-400 uppercase mb-1 flex items-center gap-1.5 justify-center">
                <Award className="w-3.5 h-3.5" />
                <span>OS Achievement Synchronized</span>
              </span>

              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                {currentCelebration.title}
              </h2>

              <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed font-semibold">
                "{currentCelebration.description}"
              </p>

              <div className="py-2.5 px-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-extrabold text-xs tracking-widest uppercase mb-8">
                + {currentCelebration.points} Quantum Points (QP)
              </div>

              <button
                onClick={() => setCurrentCelebration(null)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.25)] active:scale-95 cursor-pointer"
              >
                Initialize Protocol
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Floating Smart Build System Diagnostic HUD Report */}
      <AnimatePresence>
        {activeBuildReport && (
          <div className="fixed bottom-24 right-6 z-40 max-w-sm w-full select-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="rounded-3xl bg-[#030303]/90 backdrop-blur-2xl border border-cyan-500/30 p-5 relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.85)] flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-pink-500 to-transparent" />
              
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] uppercase font-black tracking-[0.18em] text-cyan-400">Smart Build report</span>
                </div>
                <button
                  onClick={() => setActiveBuildReport(null)}
                  className="w-5 h-5 rounded-lg flex items-center justify-center border border-white/5 hover:bg-white/[0.08] text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-3.5 flex justify-around bg-white/[0.02] border border-white/5 rounded-2xl py-3 text-center">
                <div>
                  <div className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Audited</div>
                  <div className="text-sm font-black text-white mt-0.5">{activeBuildReport.diagnostics.scannedFiles} files</div>
                </div>
                <div className="border-r border-white/5 h-6 self-center" />
                <div>
                  <div className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Self-Healed</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{activeBuildReport.diagnostics.issuesHealed} errors</div>
                </div>
                <div className="border-r border-white/5 h-6 self-center" />
                <div>
                  <div className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Time</div>
                  <div className="text-sm font-black text-pink-400 mt-0.5">{activeBuildReport.diagnostics.buildDurationMs}ms</div>
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-28 overflow-y-auto pr-1">
                {activeBuildReport.details.map((det, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold text-white uppercase tracking-wider leading-none">
                        {det.title}
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-relaxed font-semibold">
                        {det.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-2">Vite Optimisations</div>
                <div className="space-y-1">
                  {activeBuildReport.optimisations.map((opt, idx) => (
                    <div key={idx} className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                      <span>✓</span>
                      <span className="truncate">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
