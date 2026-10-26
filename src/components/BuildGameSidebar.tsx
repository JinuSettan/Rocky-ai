/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gamepad2, Cpu, Check, AlertTriangle, Play, Sparkles, 
  Download, Plus, Link, ArrowRight, FolderOpen, RefreshCw 
} from 'lucide-react';

interface Engine {
  id: string;
  name: string;
  version: string;
  description: string;
  iconText: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
}

const ENGINE_LIST: Engine[] = [
  {
    id: 'ue5',
    name: 'Unreal Engine 5',
    version: '5.4.2',
    description: 'Industry-standard photorealistic 3D engine with Nanite geometry, Lumen dynamic lighting, and Blueprint scripting.',
    iconText: 'U',
    gradient: 'from-slate-900 via-indigo-950 to-slate-950',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
    glowColor: 'shadow-indigo-500/10'
  },
  {
    id: 'unity6',
    name: 'Unity 6',
    version: '6.0.1f',
    description: 'Versatile cross-platform engine featuring high-speed ECS runtime (DOTS), Universal Render Pipeline (URP), and C# scripting.',
    iconText: 'Y',
    gradient: 'from-zinc-900 via-sky-950 to-zinc-950',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    glowColor: 'shadow-sky-500/10'
  },
  {
    id: 'godot4',
    name: 'Godot 4',
    version: '4.2.2',
    description: 'Lightweight, ultra-fast, open-source 2D & 3D engine featuring dedicated C# and GDScript runtimes.',
    iconText: 'G',
    gradient: 'from-neutral-900 via-cyan-950 to-neutral-950',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/10'
  },
  {
    id: 'o3de',
    name: 'O3DE (Open 3D Engine)',
    version: '23.10',
    description: 'Modular, open-source 3D engine backed by the Linux Foundation, with a physically-based Atom Renderer.',
    iconText: 'O',
    gradient: 'from-stone-900 via-amber-950 to-stone-950',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/10'
  },
  {
    id: 'stride',
    name: 'Stride Engine',
    version: '4.2.0',
    description: 'Modular C# 3D game engine featuring physically-based rendering, advanced scene editor, and direct .NET integration.',
    iconText: 'S',
    gradient: 'from-neutral-900 via-rose-950 to-neutral-950',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    glowColor: 'shadow-rose-500/10'
  },
  {
    id: 'bevy',
    name: 'Bevy Engine',
    version: '0.13.0',
    description: 'A refreshingly simple, data-driven Rust game engine built on an ultra-performant Entity Component System (ECS).',
    iconText: 'B',
    gradient: 'from-zinc-900 via-purple-950 to-zinc-950',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    glowColor: 'shadow-purple-500/10'
  }
];

interface BuildGameSidebarProps {
  onSelectEngine: (engineId: string, actionType?: string) => void;
  connectedEngines: Record<string, boolean>;
  onToggleConnect: (engineId: string) => void;
}

export const BuildGameSidebar: React.FC<BuildGameSidebarProps> = ({
  onSelectEngine,
  connectedEngines,
  onToggleConnect
}) => {
  const [filterConnected, setFilterConnected] = useState(false);

  const displayedEngines = filterConnected 
    ? ENGINE_LIST.filter(e => connectedEngines[e.id])
    : ENGINE_LIST;

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full text-left relative z-20">
      
      {/* File Explorer Header with Search and Create triggers */}
      <div className="p-3 border-b border-zinc-900 space-y-2 select-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-300">Build Game (3D)</span>
          </div>
          <span className="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1 rounded font-bold">
            v1.0 BETA
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Integrated game compiler engine launcher. Pair with modern engines and trigger AI procedural world generation.
        </p>

        {/* Filters */}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => setFilterConnected(false)}
            className={`flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
              !filterConnected 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200' 
                : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-400'
            }`}
          >
            All Engines
          </button>
          <button
            onClick={() => setFilterConnected(true)}
            className={`flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
              filterConnected 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200' 
                : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Connected ({Object.values(connectedEngines).filter(Boolean).length})
          </button>
        </div>
      </div>

      {/* Scrollable Engines Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 scrollbar-thin">
        {displayedEngines.length === 0 ? (
          <div className="text-center py-8 px-4 text-zinc-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
            <p className="text-[10px] font-bold uppercase tracking-wider">No Connected Engines</p>
            <p className="text-[9px] mt-1 leading-relaxed">Click 'Install / Connect' on any engine card in the 'All Engines' view.</p>
          </div>
        ) : (
          displayedEngines.map((engine) => {
            const isConnected = connectedEngines[engine.id];
            
            return (
              <div 
                key={engine.id}
                className={`group rounded-xl bg-gradient-to-br ${engine.gradient} border ${engine.borderColor} ${engine.glowColor} hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden flex flex-col p-3 gap-2.5 relative`}
              >
                {/* Engine Header / Logo */}
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-xl bg-black/60 border ${engine.borderColor} flex items-center justify-center text-sm font-black tracking-wide ${engine.textColor} shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    {engine.iconText}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-[11px] font-extrabold text-zinc-100 truncate tracking-wide">{engine.name}</h4>
                      <span className="text-[8px] text-zinc-500 font-mono flex-shrink-0">v{engine.version}</span>
                    </div>
                    {/* Status badge */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`w-1 h-1 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-orange-500/70'}`} />
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                        {isConnected ? 'Active Connection' : 'Ready to Connect'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[9px] text-zinc-400 leading-relaxed font-sans font-medium line-clamp-3">
                  {engine.description}
                </p>

                {/* Connection button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleConnect(engine.id)}
                    className={`flex-1 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isConnected 
                        ? 'bg-green-950/20 hover:bg-green-950/40 border-green-500/40 text-green-400' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-green-400" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-2.5 h-2.5" />
                        <span>Connect Local</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Game project Actions panel */}
                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-zinc-900/40">
                  <button
                    onClick={() => onSelectEngine(engine.id, 'open')}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 text-[8px] text-zinc-400 hover:text-white uppercase font-bold tracking-wider transition-colors border border-transparent hover:border-zinc-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    title="Open Existing Project Workspace"
                  >
                    <FolderOpen className="w-3 h-3 text-zinc-500" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => onSelectEngine(engine.id, 'ai-generate')}
                    className="p-1 rounded bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/20 hover:border-orange-500/40 text-[8px] text-orange-400 font-extrabold uppercase tracking-wider transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                    title="Procedural AI World & System Generation"
                  >
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    <span>AI Build</span>
                  </button>
                  <button
                    onClick={() => onSelectEngine(engine.id, 'import')}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 text-[8px] text-zinc-400 hover:text-white uppercase font-bold tracking-wider transition-colors border border-transparent hover:border-zinc-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    title="Import Existing Game Repository"
                  >
                    <Download className="w-3 h-3 text-zinc-500" />
                    <span>Import</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/60 select-none">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[9px] uppercase font-bold tracking-wider">Compiler Status</span>
        </div>
        <div className="text-[8px] text-zinc-600 mt-0.5 leading-relaxed font-semibold">
          Host Sandbox: <span className="text-zinc-500">active-3000</span><br />
          Bridge Engine: <span className="text-emerald-500">STANDBY</span>
        </div>
      </div>

    </div>
  );
};
