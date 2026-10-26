/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { QuantumShard } from '../types';
import { 
  Plus, Sparkles, Search, Layers, Copy, Trash, Check, Zap, Code, 
  Flame, Star, PlusCircle, Bookmark, Eye, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_SHARDS: QuantumShard[] = [
  {
    id: 'cosmic-glow-card',
    title: 'Cosmic Glow Card',
    description: 'A premium frosted glassmorphic React container styled with rotating top laser borders.',
    category: 'UI/UX',
    rarity: 'Legendary',
    glowColor: 'from-amber-400 via-pink-500 to-purple-600',
    icon: 'Flame',
    code: `<div className="p-6 bg-black/80 border border-cyan-500/30 rounded-3xl backdrop-blur shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden group">
  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">Quantum Active</h4>
  <p className="text-zinc-400 mt-2 text-xs">Futuristic card matrix synchronized.</p>
</div>`
  },
  {
    id: 'quantum-state-engine',
    title: 'Quantum State Engine',
    description: 'Hook for managing complex component state with automatic logging and action acceleration.',
    category: 'Hooks',
    rarity: 'Epic',
    glowColor: 'from-pink-500 to-purple-600',
    icon: 'Zap',
    code: `const useQuantumState = <T,>(initial: T) => {
  const [state, setState] = React.useState<T>(initial);
  const accelerate = React.useCallback((updater: T | ((prev: T) => T)) => {
    setState(updater);
    console.log('%c[QUANTUM ACCEL]', 'color: #ec4899; font-weight: bold;', updater);
  }, []);
  return [state, accelerate] as const;
};`
  },
  {
    id: 'nebula-particle-canvas',
    title: 'Nebula Particle Canvas',
    description: 'An interactive self-contained HTML5 Canvas component that spawns floating vector orbits.',
    category: 'Canvas',
    rarity: 'Epic',
    glowColor: 'from-cyan-400 to-indigo-600',
    icon: 'Sparkles',
    code: `import React, { useEffect, useRef } from 'react';
export const NebulaParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frameId: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; c: string }> = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width || 150,
        y: Math.random() * canvas.height || 150,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: Math.random() * 2 + 1,
        c: Math.random() > 0.5 ? '#06b6d4' : '#ec4899'
      });
    }
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full opacity-40" />;
};`
  },
  {
    id: 'laser-scan-overlay',
    title: 'Laser Scanner Sweep',
    description: 'A holographic scanning sweep animation overlay utilizing vertical laser interpolation.',
    category: 'CSS FX',
    rarity: 'Rare',
    glowColor: 'from-emerald-400 to-cyan-500',
    icon: 'Eye',
    code: `<div className="relative overflow-hidden group min-h-[100px] border border-white/5 rounded-2xl bg-zinc-950/80">
  <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-[scan_3s_infinite_ease-in-out]" />
  <div className="p-4 text-[10px] text-zinc-500 font-mono">SCANNER ACTIVE</div>
  <style>{\`
    @keyframes scan {
      0% { transform: translateY(0); opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { transform: translateY(100px); opacity: 0; }
    }
  \`}</style>
</div>`
  },
  {
    id: 'chronos-clock-matrix',
    title: 'Chronos Digital Clock',
    description: 'Dynamic local time clock featuring glowing ping signals and digital layout.',
    category: 'Utilities',
    rarity: 'Common',
    glowColor: 'from-zinc-400 to-slate-500',
    icon: 'Bookmark',
    code: `import React, { useState, useEffect } from 'react';
export const ChronosClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="font-mono text-xs text-zinc-400 tracking-widest flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5">
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
      <span>{time.toLocaleTimeString()} UTC</span>
    </div>
  );
};`
  }
];

interface CodeFragmentsPanelProps {
  onInsertCode: (code: string, shardTitle: string, rarity: string) => void;
}

export const CodeFragmentsPanel: React.FC<CodeFragmentsPanelProps> = ({ onInsertCode }) => {
  const { addNotification, unlockAchievement } = useProject();
  
  const [shards, setShards] = useState<QuantumShard[]>(() => {
    const saved = localStorage.getItem('rock_ai_custom_shards');
    const custom = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_SHARDS, ...custom];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeRarity, setActiveRarity] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Shard Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('UI/UX');
  const [newRarity, setNewRarity] = useState<'Common' | 'Rare' | 'Epic' | 'Legendary'>('Rare');
  const [newCode, setNewCode] = useState('');

  const categories = ['All', ...Array.from(new Set(shards.map(s => s.category)))];
  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

  const filteredShards = shards.filter(shard => {
    const matchesSearch = shard.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shard.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || shard.category === activeCategory;
    const matchesRarity = activeRarity === 'All' || shard.rarity === activeRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const handleCopyCode = (e: React.MouseEvent, shard: QuantumShard) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shard.code);
    setCopiedId(shard.id);
    addNotification('Shard Cloned', `"${shard.title}" cloned to holographic copy-paste clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteCustomShard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = shards.filter(s => s.id !== id);
    setShards(updated);
    
    // Filter only custom shards to save
    const customOnly = updated.filter(s => !DEFAULT_SHARDS.some(d => d.id === s.id));
    localStorage.setItem('rock_ai_custom_shards', JSON.stringify(customOnly));
    addNotification('Shard Dissolved', 'Custom data fragment has been dissolved from local storage.', 'info');
  };

  const handleCreateShardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) {
      addNotification('Compilation Failed', 'Shards require a title and valid syntax block.', 'error');
      return;
    }

    const glowColors = {
      Common: 'from-zinc-400 to-slate-500',
      Rare: 'from-emerald-400 to-cyan-500',
      Epic: 'from-pink-500 to-purple-600',
      Legendary: 'from-amber-400 via-pink-500 to-purple-600'
    };

    const newShard: QuantumShard = {
      id: `shard-${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Custom crafted developer code shard block.',
      category: newCategory,
      rarity: newRarity,
      glowColor: glowColors[newRarity],
      icon: newRarity === 'Legendary' ? 'Flame' : newRarity === 'Epic' ? 'Zap' : 'Code',
      code: newCode
    };

    const updatedShards = [...shards, newShard];
    setShards(updatedShards);

    const customOnly = updatedShards.filter(s => !DEFAULT_SHARDS.some(d => d.id === s.id));
    localStorage.setItem('rock_ai_custom_shards', JSON.stringify(customOnly));

    addNotification('Shard Synthesized', `"${newTitle}" synthesized successfully inside the database!`, 'success');
    
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewCode('');
    setShowCreateModal(false);
  };

  const getRarityStyles = (rarity: QuantumShard['rarity']) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_8px_rgba(234,179,8,0.2)]';
      case 'Epic': return 'text-pink-400 border-pink-500/30 bg-pink-500/5';
      case 'Rare': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5';
      default: return 'text-zinc-400 border-zinc-800 bg-zinc-950';
    }
  };

  // Drag and drop start setup
  const handleDragStart = (e: React.DragEvent, shard: QuantumShard) => {
    e.dataTransfer.setData('text/plain', shard.code);
    e.dataTransfer.setData('shard-title', shard.title);
    e.dataTransfer.setData('shard-rarity', shard.rarity);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual ghost dragging style if supported
    const dragImg = document.createElement('div');
    dragImg.className = 'px-3 py-1 bg-black border border-cyan-500 text-cyan-400 text-[10px] font-black uppercase rounded-lg shadow-xl';
    dragImg.innerText = `[DRAGGING] ${shard.title}`;
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  return (
    <div id="code-fragments-panel" className="flex flex-col h-full bg-black border-l border-white/5 relative z-10 select-none text-left">
      {/* Laser line effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      {/* Header Container */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Quantum Shards</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Code Fragments Library</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
          title="Synthesize New Custom Shard"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Synthesize</span>
        </button>
      </div>

      {/* Database Stats Bar */}
      <div className="px-4 py-2.5 bg-white/[0.01] border-b border-white/5 text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest flex justify-between shrink-0">
        <span>Curated fragments: {shards.length}</span>
        <span className="text-cyan-400">Drag & Drop Active</span>
      </div>

      {/* Filters & Search Container */}
      <div className="p-3 border-b border-white/5 space-y-2.5 shrink-0 bg-black/60">
        <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 gap-2">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search code shards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 focus:outline-none w-full placeholder:text-zinc-600"
          />
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none select-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rarity Horizontal Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none select-none border-t border-white/5 pt-2">
          {rarities.map(rar => (
            <button
              key={rar}
              onClick={() => setActiveRarity(rar)}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border ${
                activeRarity === rar
                  ? rar === 'Legendary' ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' :
                    rar === 'Epic' ? 'bg-pink-500/10 border-pink-500/40 text-pink-400' :
                    rar === 'Rare' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' :
                    'bg-zinc-500/10 border-zinc-500/30 text-zinc-300'
                  : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-350'
              }`}
            >
              {rar}
            </button>
          ))}
        </div>
      </div>

      {/* Shards List Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {filteredShards.length === 0 ? (
          <div className="py-12 text-center text-zinc-600">
            <HelpCircle className="w-8 h-8 mx-auto text-zinc-700 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest mt-2">No matching fragments</p>
          </div>
        ) : (
          filteredShards.map(shard => {
            const isLegendary = shard.rarity === 'Legendary';
            const isEpic = shard.rarity === 'Epic';
            
            return (
              <motion.div
                key={shard.id}
                layout
                draggable
                onDragStart={(e) => handleDragStart(e as any, shard)}
                className={`p-3.5 rounded-2xl border bg-zinc-950/40 hover:bg-zinc-950/90 relative overflow-hidden group cursor-grab active:cursor-grabbing transition-all duration-300 flex flex-col justify-between ${
                  isLegendary 
                    ? 'border-yellow-500/25 shadow-[0_0_15px_rgba(234,179,8,0.06)]' 
                    : isEpic 
                    ? 'border-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.04)]'
                    : 'border-white/5'
                }`}
                style={{
                  boxShadow: isLegendary 
                    ? '0 0 20px -5px rgba(234,179,8,0.15), inset 0 0 10px rgba(234,179,8,0.05)'
                    : isEpic
                    ? '0 0 15px -5px rgba(236,72,153,0.1), inset 0 0 10px rgba(236,72,153,0.03)'
                    : 'none'
                }}
              >
                {/* Holographic matrix line background for Epic/Legendary */}
                {(isLegendary || isEpic) && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-30" />
                )}

                {/* Left side vertical laser accent on hover */}
                <div className={`absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b ${shard.glowColor} opacity-0 group-hover:opacity-100 transition-all duration-300`} />

                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${getRarityStyles(shard.rarity)}`}>
                      {shard.rarity}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
                      {shard.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                    {shard.title}
                  </h4>
                  
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1 leading-relaxed">
                    {shard.description}
                  </p>
                </div>

                {/* Bottom preview / drag interface */}
                <div className="mt-4 border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="text-[8px] text-zinc-600 font-black uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 animate-pulse text-zinc-500" />
                    <span>Drag block to drop</span>
                  </span>

                  <div className="flex gap-1.5 relative z-10">
                    <button
                      onClick={(e) => handleCopyCode(e, shard)}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
                      title="Clone to Clipboard"
                    >
                      {copiedId === shard.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertCode(shard.code, shard.title, shard.rarity);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1 border ${
                        isLegendary 
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 hover:text-white'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                      }`}
                      title="Insert code fragment at cursor"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Insert</span>
                    </button>

                    {/* Delete Custom Shards */}
                    {!DEFAULT_SHARDS.some(d => d.id === shard.id) && (
                      <button
                        onClick={(e) => handleDeleteCustomShard(e, shard.id)}
                        className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                        title="Dissolve Custom Shard"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Synthesis / Creation Modal Panel Overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
            {/* Click backdrop */}
            <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[#030303]/95 border border-cyan-500/30 p-6 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[85vh] z-10"
            >
              {/* Scanline pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-40" />

              <div className="flex justify-between items-center pb-3.5 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Shard Synthesizer</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Construct New Code Fragment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleCreateShardSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 relative z-10 py-1">
                
                {/* Title */}
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">Shard Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Glowing Navigation Bar"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-zinc-750"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">Description Summary</label>
                  <input
                    type="text"
                    placeholder="Briefly summarize what this code segment resolves"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-zinc-750"
                  />
                </div>

                {/* Two Column Selector */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">Category Namespace</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="UI/UX">UI/UX Layout</option>
                      <option value="Hooks">React Hooks</option>
                      <option value="Canvas">HTML5 Canvas</option>
                      <option value="CSS FX">CSS Animations</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Backend">Backend Pipeline</option>
                    </select>
                  </div>

                  {/* Rarity */}
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">Syntactic Rarity</label>
                    <select
                      value={newRarity}
                      onChange={(e) => setNewRarity(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Common">Common (Gray)</option>
                      <option value="Rare">Rare (Cyan)</option>
                      <option value="Epic">Epic (Pink)</option>
                      <option value="Legendary">Legendary (Glowing Gold)</option>
                    </select>
                  </div>
                </div>

                {/* Code Block Textarea */}
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">Syntax Code Segment *</label>
                  <textarea
                    required
                    rows={6}
                    placeholder={`e.g. export const customSegment = () => {\n  console.log('Construct active');\n};`}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyan-400 placeholder:text-zinc-700 leading-normal"
                    spellCheck={false}
                  />
                </div>

                {/* Help tip */}
                <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-[9px] text-cyan-400 leading-relaxed font-semibold">
                  🚀 <strong>Quantum OS Synthesizer:</strong> Saving fragments registers them on-chain inside the local memory cache database, allowing you to instantly deploy them into any scripts.
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-xs font-black uppercase tracking-wider text-zinc-400 transition-colors cursor-pointer"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-black text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  >
                    Compile Shard
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
