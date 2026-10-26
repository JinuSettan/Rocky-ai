/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { mockKeyboardShortcuts } from '../mockData';
import { 
  X, Laptop, Sliders, Keyboard, Database, Save, RotateCcw, 
  Search, ShieldCheck, Moon, Sun, Layers, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    isAutoSaveEnabled,
    setIsAutoSaveEnabled
  } = useProject();

  const [shortcutSearch, setShortcutSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'keybindings' | 'docker'>('editor');

  const filteredShortcuts = mockKeyboardShortcuts.filter(s => 
    s.description.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.key.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(shortcutSearch.toLowerCase())
  );

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-black border border-white/10 rounded-[32px] w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative"
      >
        
        {/* Glowing Decorative Border Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 shadow-[0_1px_15px_rgba(0,240,255,0.5)]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black">
          <div>
            <h2 className="text-lg font-black text-zinc-150 flex items-center gap-2 uppercase tracking-widest">
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              <span>Rock OS Parameters</span>
            </h2>
            <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mt-0.5">Configure live sandbox nodes, keyboard maps, and virtual layers</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-all duration-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex-1 flex min-h-0 bg-black">
          
          {/* Tab lists */}
          <div className="w-52 border-r border-white/5 p-4 space-y-2 bg-black">
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all duration-300 border ${
                activeTab === 'editor'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Sandbox Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('keybindings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all duration-300 border ${
                activeTab === 'keybindings'
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_15px_rgba(255,0,191,0.15)]'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Key Bindings</span>
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all duration-300 border ${
                activeTab === 'docker'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(157,0,255,0.15)]'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Virtual Core</span>
            </button>
          </div>

          {/* Settings contents panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-black text-left">
            
            {/* Editor setups */}
            {activeTab === 'editor' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-zinc-400 mb-4 uppercase">Visual Presets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gradient-to-tr from-pink-500/10 to-transparent border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(255,0,191,0.1)]'
                          : 'bg-white/[0.01] border-white/5 hover:border-white/10 text-zinc-500'
                      }`}
                    >
                      <Moon className="w-6 h-6 text-pink-500" />
                      <div className="text-xs font-bold uppercase tracking-wide text-zinc-200">Cosmic Obsidian (Dark)</div>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer ${
                        theme === 'light'
                          ? 'bg-gradient-to-tr from-cyan-500/10 to-transparent border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                          : 'bg-white/[0.01] border-white/5 hover:border-white/10 text-zinc-500'
                      }`}
                    >
                      <Sun className="w-6 h-6 text-cyan-400" />
                      <div className="text-xs font-bold uppercase tracking-wide text-zinc-200">Nebula Glow (Light)</div>
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-zinc-400 mb-4 uppercase">Node Compiler Configurations</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">File Auto-Save</div>
                        <div className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase mt-1">Automatically compile and persist code updates to workspace.</div>
                      </div>
                      <button
                        onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                          isAutoSaveEnabled ? 'bg-cyan-500 flex justify-end shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-zinc-800 flex justify-start'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md block" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">Editor Typography Scale</div>
                        <div className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase mt-1">Scale font-sizes inside the code editor containers.</div>
                      </div>
                      <div className="flex items-center gap-2.5 bg-black border border-white/10 rounded-xl p-1">
                        <button
                          onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                          className="w-7 h-7 flex items-center justify-center text-xs font-black bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono text-zinc-200 px-1">{fontSize}px</span>
                        <button
                          onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                          className="w-7 h-7 flex items-center justify-center text-xs font-black bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Hotkeys */}
            {activeTab === 'keybindings' && (
              <div className="space-y-4">
                <div className="flex items-center bg-black border border-white/10 rounded-2xl px-3.5 py-2.5 gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search hotkey shortcuts..."
                    value={shortcutSearch}
                    onChange={(e) => setShortcutSearch(e.target.value)}
                    className="bg-transparent text-xs text-zinc-300 focus:outline-none w-full placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredShortcuts.map((s, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold tracking-wide text-zinc-200">{s.description}</div>
                        <span className="text-[8px] bg-white/5 text-zinc-500 border border-white/5 px-2 py-0.5 rounded-lg uppercase font-black tracking-widest">
                          {s.category}
                        </span>
                      </div>
                      <kbd className="px-3 py-1 rounded-xl bg-black border border-white/10 text-[10px] font-mono text-cyan-400 shadow-md font-bold tracking-wider">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Docker setups */}
            {activeTab === 'docker' && (
              <div className="space-y-5">
                <div className="p-4 bg-white/[0.01] rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
                    <Laptop className="w-4.5 h-4.5" />
                    <span>Active Containers status</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold leading-relaxed">
                    Rock OS isolates compiling environments using specialized sandbox hypervisor technology.
                  </p>

                  <div className="bg-black border border-white/10 p-3 rounded-xl font-mono text-[10px] text-zinc-400 space-y-1">
                    <div>$ docker ps -a</div>
                    <div className="text-zinc-600">CONTAINER ID   IMAGE                 COMMAND                  STATUS</div>
                    <div className="text-cyan-400">c3a72810f94   rock-cloud-v1.4:node  "npm run start-dev"      Up 12 minutes</div>
                    <div className="text-zinc-500">b901f41d3a5   rock-cloud-v1.4:py    "python3 server.py"      Exited (0) 2 days ago</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Hardware Allocation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-white/[0.01] rounded-2xl border border-white/5">
                      <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Memory limits</div>
                      <select className="bg-black border border-white/10 text-zinc-300 text-xs rounded-xl p-2 mt-2 w-full focus:outline-none">
                        <option>512 MB (Default Sandbox)</option>
                        <option>1 GB (Pro Dedicated)</option>
                        <option>2 GB (Scale Elastic)</option>
                      </select>
                    </div>
                    <div className="p-3.5 bg-white/[0.01] rounded-2xl border border-white/5">
                      <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Compiler image</div>
                      <select className="bg-black border border-white/10 text-zinc-300 text-xs rounded-xl p-2 mt-2 w-full focus:outline-none">
                        <option>node:20-alpine (Pre-cached)</option>
                        <option>python:3.11-slim (Pre-cached)</option>
                        <option>flutter:3.19-web (Cached SDK)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 flex justify-end gap-2 bg-black">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 text-white font-black text-[9px] uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            Apply Configs
          </button>
        </div>

      </motion.div>
    </div>
  );
};
