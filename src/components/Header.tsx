/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Play, Square, Globe, Share2, Settings, ArrowLeft, Bell, CheckCircle2,
  AlertTriangle, Info, Shield, Users, Smartphone, Laptop, Check, Sparkles, Star,
  Award, Lock, Unlock, Zap, Trophy, X, Rocket, Gamepad2, Cpu, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleDriveModal } from './GoogleDriveModal';

export const Header: React.FC = () => {
  const {
    activeProject,
    closeProject,
    runProject,
    stopProject,
    deployProject,
    isPreviewRunning,
    previewUrl,
    isDeploying,
    deployedUrl,
    notifications,
    markNotificationAsRead,
    activeCollaborators,
    setIsSettingsOpen,
    
    // Achievements & Smart Build
    achievements,
    unlockedAchievements,
    isQuantumMode,
    toggleQuantumMode
  } = useProject();

  const [showDeployDropdown, setShowDeployDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAchievementsShelf, setShowAchievementsShelf] = useState(false);
  const [showDrive, setShowDrive] = useState(false);

  const handleShare = () => {
    if (!activeProject) return;
    setCopiedLink(true);
    const mockShareLink = `https://rockai.space/share/${activeProject.id}`;
    navigator.clipboard.writeText(mockShareLink);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeploymentSelection = (target: 'web' | 'apk' | 'pwa') => {
    deployProject(target);
    setShowDeployDropdown(false);
  };

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="h-16 bg-[#050505]/85 backdrop-blur-3xl border-b border-white/5 px-6 flex items-center justify-between select-none relative z-40">
      
      {/* Brand logo & workspace switch */}
      <div className="flex items-center gap-4">
        <button
          onClick={closeProject}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/40 transition-all flex items-center justify-center cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Logo element referencing our generated brand logo symbol */}
          <div className="w-9 h-9 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center">
            <img
              src="/src/assets/images/rock_ai_logo_1784212244029.jpg"
              alt="Rock Logo Mini"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white flex items-center">
                <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">ROCK</span>
                <span className="text-zinc-100">AI</span>
              </span>
              <span className="text-[8px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded-full font-black tracking-widest uppercase">
                IDE
              </span>
            </div>
            <span className="text-[7px] text-zinc-500 font-bold tracking-[0.15em] leading-none uppercase">
              Quantum OS
            </span>
          </div>
        </div>

        {activeProject && (
          <div className="hidden lg:flex items-center gap-2.5 border-l border-white/5 pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,0,191,0.6)] animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">{activeProject.name}</span>
            <span className="text-[9px] bg-white/[0.02] text-zinc-500 border border-white/10 px-2 py-0.5 rounded-lg uppercase font-black tracking-wider">
              {activeProject.template}
            </span>
          </div>
        )}
      </div>

      {/* Control Actions (Run, Stop, Deploy, Share) */}
      <div className="flex items-center gap-3">
        
        {/* Quantum Hyper-Mode Toggle */}
        <button
          onClick={toggleQuantumMode}
          className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 transition-all duration-300 text-xs font-bold uppercase tracking-wider relative overflow-hidden cursor-pointer ${
            isQuantumMode 
              ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]' 
              : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title="Toggle Quantum Thinking Mode for 5x build speed and cosmic star acceleration"
        >
          <Zap className={`w-3.5 h-3.5 ${isQuantumMode ? 'text-yellow-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="hidden md:inline">Quantum</span>
        </button>

        {/* Run / Stop Button */}
        {isPreviewRunning ? (
          <div className="flex items-center gap-2">
            <button
              onClick={stopProject}
              className="h-9 px-4 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.05)]"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
            <a
              href={previewUrl || 'http://localhost:3000'}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              title="Open Live Preview in a new browser tab"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Preview</span>
            </a>
          </div>
        ) : (
          <button
            onClick={runProject}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" />
            <span>Run OS Core</span>
          </button>
        )}

        {/* Deploy Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowDeployDropdown(!showDeployDropdown)}
            disabled={isDeploying}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(157,0,255,0.2)]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isDeploying ? 'Compiling...' : 'Deploy'}</span>
          </button>

          {/* Deployment Dropdown (Luxurious Glass) */}
          <AnimatePresence>
            {showDeployDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDeployDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#050505]/95 backdrop-blur-3xl border border-white/10 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-left overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600" />
                  
                  <div className="px-3 py-2 text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500 border-b border-white/5">
                    QUANTUM TARGET MODULE
                  </div>
                  <div className="space-y-1 mt-1.5">
                    <button
                      onClick={() => handleDeploymentSelection('web')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-zinc-300 hover:text-cyan-400 hover:bg-white/[0.03] transition-colors text-xs text-left cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold uppercase text-[10px] tracking-wider">Deploy Web Space</div>
                        <div className="text-[9px] text-zinc-500">Fast Cloud Run deployment</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDeploymentSelection('apk')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-zinc-300 hover:text-pink-400 hover:bg-white/[0.03] transition-colors text-xs text-left cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                      <div>
                        <div className="font-bold uppercase text-[10px] tracking-wider">Compile Android APK</div>
                        <div className="text-[9px] text-zinc-500">Simulate native app build</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDeploymentSelection('pwa')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-zinc-300 hover:text-purple-400 hover:bg-white/[0.03] transition-colors text-xs text-left cursor-pointer"
                    >
                      <Laptop className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold uppercase text-[10px] tracking-wider">Install Progressive App</div>
                        <div className="text-[9px] text-zinc-500">Offline offline worker files</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Google Drive Cloud Sync */}
        <button
          onClick={() => setShowDrive(true)}
          className="h-9 px-3.5 rounded-xl bg-white/[0.02] hover:bg-emerald-950/30 border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.1)]"
          title="Backup or Import from Google Drive"
        >
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Drive Sync</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="h-9 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-cyan-500/30 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

      </div>

      {/* Collaborators & Settings */}
      <div className="flex items-center gap-3">
        
        {/* Active Collaborators */}
        <div className="hidden sm:flex items-center -space-x-2 border-r border-white/5 pr-4">
          {activeCollaborators.map(collab => (
            <div
              key={collab.id}
              className="relative group"
            >
              <img
                src={collab.avatar}
                alt={collab.username}
                style={{ borderColor: collab.color }}
                className="w-7 h-7 rounded-full object-cover border-2 cursor-help"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
              
              {/* Tooltip */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#050505] border border-white/10 text-[9px] text-zinc-300 px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 uppercase font-black tracking-widest">
                {collab.username}
              </div>
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-[9px] text-zinc-500 font-extrabold">
            +{activeCollaborators.length}
          </div>
        </div>

        {/* Telemetry Logs Bell Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/40 transition-all flex items-center justify-center relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#050505]/95 backdrop-blur-3xl border border-white/10 p-3.5 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600" />
                  
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span className="text-[9px] uppercase font-black tracking-[0.15em] text-zinc-400">Telemetry logs</span>
                    <span className="text-[8px] bg-pink-500/15 border border-pink-500/30 text-pink-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{unreadNotifs.length} new</span>
                  </div>

                  <div className="space-y-2 mt-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          notif.read ? 'bg-transparent border-transparent' : 'bg-white/[0.02] border-white/5 hover:border-cyan-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                          {notif.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />}
                          
                          <div className="space-y-0.5 min-w-0">
                            <div className={`text-xs font-black uppercase tracking-wide truncate ${notif.read ? 'text-zinc-500' : 'text-zinc-200'}`}>
                              {notif.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-medium">{notif.message}</div>
                            <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">{notif.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Achievements Trophy Trigger */}
        <button
          onClick={() => setShowAchievementsShelf(true)}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-400 hover:text-white hover:border-yellow-500/40 transition-all flex items-center justify-center cursor-pointer relative"
          title="OS Achievements"
        >
          <Award className={`w-4 h-4 text-yellow-400 ${unlockedAchievements.length > 0 ? 'animate-pulse' : ''}`} />
          {unlockedAchievements.length > 0 && (
            <span className="absolute -top-1 -right-1 text-[8px] bg-yellow-500 text-black font-black px-1 py-0.25 rounded-full leading-none">
              {unlockedAchievements.length}
            </span>
          )}
        </button>

        {/* Global Settings Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/40 transition-all flex items-center justify-center cursor-pointer"
          title="IDE Settings"
        >
          <Settings className="w-4 h-4 animate-spin-slow" />
        </button>

      </div>

      {/* 18️⃣ Achievements Shelf Modal Overlay */}
      <AnimatePresence>
        {showAchievementsShelf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setShowAchievementsShelf(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl bg-[#040404]/90 border border-yellow-500/20 p-6 relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.1)] flex flex-col max-h-[85vh] z-10 pointer-events-auto"
            >
              {/* Scanline pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-45" />

              <div className="flex justify-between items-center pb-3 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">OS Quantum Achievements</h3>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Developer Badge Database</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAchievementsShelf(false)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score HUD */}
              <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center relative z-10 overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Cumulative Experience</div>
                  <div className="text-xl font-black text-white uppercase mt-0.5">
                    {achievements.filter(a => unlockedAchievements.includes(a.id)).reduce((sum, a) => sum + a.points, 0)} <span className="text-yellow-400 text-xs font-semibold">/ {achievements.reduce((sum, a) => sum + a.points, 0)} QP</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Completion rate</div>
                  <div className="text-sm font-black text-yellow-400 mt-0.5">
                    {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="mt-4 space-y-2.5 overflow-y-auto pr-1 relative z-10 flex-1 py-1 max-h-[40vh]">
                {achievements.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-4 ${
                        isUnlocked 
                          ? 'bg-white/[0.02] border-yellow-500/20 shadow-[0_2px_12px_rgba(234,179,8,0.03)]' 
                          : 'bg-white/[0.01] border-white/5 opacity-60'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                        isUnlocked 
                          ? `bg-gradient-to-tr ${ach.badgeColor} text-white shadow-[0_0_12px_rgba(234,179,8,0.2)]` 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}>
                        {isUnlocked ? (
                          ach.icon === 'Rocket' ? <Rocket className="w-5 h-5" /> :
                          ach.icon === 'Sparkles' ? <Sparkles className="w-5 h-5" /> :
                          ach.icon === 'Gamepad2' ? <Gamepad2 className="w-5 h-5 text-yellow-400" /> :
                          ach.icon === 'Smartphone' ? <Smartphone className="w-5 h-5" /> :
                          ach.icon === 'Zap' ? <Zap className="w-5 h-5" /> :
                          ach.icon === 'Globe' ? <Globe className="w-5 h-5" /> :
                          <Award className="w-5 h-5" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                            {ach.title}
                          </h4>
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isUnlocked ? 'text-yellow-400' : 'text-zinc-600'}`}>
                            {ach.points} QP
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1 font-semibold leading-relaxed ${isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-white/5 pt-4 text-center relative z-10">
                <span className="text-[8px] font-black tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-1.5 justify-center">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>Rocky Engine Sync Protocol Enabled</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Drive Cloud Storage Modal */}
      <GoogleDriveModal isOpen={showDrive} onClose={() => setShowDrive(false)} />

    </header>
  );
};
