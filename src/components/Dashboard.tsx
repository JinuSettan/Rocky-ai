/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../context/ProjectContext';
import { Project } from '../types';
import { 
  Folder, Code, PlusCircle, Search, Trash2, Edit2, ArrowRight, 
  Calendar, Layers, Cpu, Cloud, FileCode, CheckCircle, Upload, Play,
  Sparkles, Terminal, Shield, RefreshCw, Zap, Star, Activity, Globe
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    createProject, 
    renameProject, 
    deleteProject, 
    selectProject,
    notifications,
    importProjectFromZip
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Project['template']>('React');
  
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Filtering projects
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const created = createProject(newProjName, newProjDesc, selectedTemplate);
    setNewProjName('');
    setNewProjDesc('');
    setIsCreating(false);
    selectProject(created.id);
  };

  const startRename = (p: Project) => {
    setEditingProjId(p.id);
    setEditingName(p.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      renameProject(id, editingName);
    }
    setEditingProjId(null);
  };

  // ZIP Import
  const handleZipImport = () => {
    const mockFiles = [
      {
        id: 'zip-1',
        name: 'main.py',
        path: 'main.py',
        type: 'file' as const,
        language: 'python',
        content: `print("Hello from imported ZIP Archive!")`
      }
    ];
    importProjectFromZip('imported-zip-archive', 'Python', mockFiles);
  };

  const templates: { name: Project['template']; icon: string; bg: string; color: string; desc: string }[] = [
    { name: 'React', icon: '⚛️', bg: 'from-cyan-600/20 to-black', color: 'text-cyan-400', desc: 'Single Page app with Tailwind & Vite' },
    { name: 'Next.js', icon: '▲', bg: 'from-purple-600/20 to-black', color: 'text-purple-300', desc: 'Production-ready server rendered build' },
    { name: 'Express', icon: '🚂', bg: 'from-pink-600/20 to-black', color: 'text-pink-400', desc: 'Secure backend node application framework' },
    { name: 'Python', icon: '🐍', bg: 'from-blue-600/20 to-black', color: 'text-blue-400', desc: 'Pure script analytics with pip setup' },
    { name: 'FastAPI', icon: '⚡', bg: 'from-indigo-600/20 to-black', color: 'text-indigo-400', desc: 'Asynchronous Python server engine docs' },
    { name: 'Flutter', icon: '📱', bg: 'from-violet-600/20 to-black', color: 'text-violet-400', desc: 'Multi-platform mobile app simulation' },
    { name: 'HTML/CSS/JS', icon: '🌐', bg: 'from-teal-600/20 to-black', color: 'text-teal-400', desc: 'Traditional fast static webpage mockup' }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white p-6 md:p-10 relative overflow-hidden select-none selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* 1. Cinematic Ambient Background Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-105 transition-all duration-1000 z-0"
        style={{ 
          backgroundImage: 'url(/src/assets/images/rock_ai_wallpaper_1784212226814.jpg)',
        }}
      />

      {/* 2. Deep space mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 via-[#050505]/20 to-[#050505]/80 z-0" />

      {/* Futuristic floating glowing spots */}
      <div className="absolute top-1/4 left-10 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '10s' }} />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Top Greeting Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-zinc-500 text-xs font-bold tracking-widest uppercase">
              <span>Workbench</span>
              <span className="text-pink-500">/</span>
              <span className="text-zinc-300">Quantum Dashboard</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_12px_rgba(0,240,255,0.2)]">{currentUser.username}</span>
            </h1>
            
            <p className="text-xs text-zinc-400 tracking-widest uppercase mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Rock AI Cloud Core • Powered by Cocktail Z AI</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleZipImport}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-pink-500/40 hover:bg-black text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-pink-500" />
              <span>Import ZIP</span>
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 text-white text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,191,0.25)] hover:shadow-[0_0_35px_rgba(0,240,255,0.45)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5 text-white" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Create Modal overlay */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-black/90 border border-white/10 p-6 md:p-8 rounded-[32px] w-full max-w-2xl relative shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
              >
                {/* Neon Glowing Stripe */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600" />
                
                <h2 className="text-2xl font-black mb-5 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">DEPLOY QUANTUM SANDBOX</h2>
                
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold mb-1.5 uppercase tracking-wider">Project Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. quantum-reactor-ui"
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold mb-1.5 uppercase tracking-wider">Select Engine Template</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as Project['template'])}
                        className="w-full bg-zinc-950 border border-white/10 focus:border-pink-500 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none"
                      >
                        <option value="React">React Workspace</option>
                        <option value="Next.js">Next.js Framework</option>
                        <option value="Express">Express Backend Node</option>
                        <option value="Python">Python Scripts Node</option>
                        <option value="FastAPI">FastAPI Microservice</option>
                        <option value="Flutter">Flutter Mobile Emul</option>
                        <option value="HTML/CSS/JS">Static HTML/CSS/JS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold mb-1.5 uppercase tracking-wider">Sandbox Description</label>
                    <textarea
                      placeholder="Specify core responsibilities of this space sandbox..."
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-950 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20 resize-none"
                    />
                  </div>

                  {/* Templates Selection Grid */}
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Quick-start blueprint presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {templates.map(tmpl => (
                        <div
                          key={tmpl.name}
                          onClick={() => setSelectedTemplate(tmpl.name)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                            selectedTemplate === tmpl.name
                              ? 'bg-white/5 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                              : 'bg-black/50 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                          }`}
                        >
                          <span className="text-2xl block mb-1.5">{tmpl.icon}</span>
                          <div className="font-extrabold text-[10px] uppercase tracking-wider text-zinc-200 truncate">{tmpl.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Deploy Sandbox
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bento Grid Analytics (Luxurious Glowing Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex items-center gap-5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Active Spaces</div>
              <div className="text-3xl font-black tracking-tight mt-0.5">{projects.length}</div>
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex items-center gap-5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-transparent pointer-events-none" />
            <div className="p-4 bg-pink-500/10 rounded-2xl text-pink-400 shadow-[0_0_15px_rgba(255,0,191,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Cloud Deployments</div>
              <div className="text-3xl font-black tracking-tight mt-0.5">3 Live</div>
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex items-center gap-5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 shadow-[0_0_15px_rgba(157,0,255,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Quantum Engine Health</div>
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mt-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>99.9% ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main project list (Left columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filters (Glassmorphic) */}
            <div className="flex items-center bg-black/60 border border-white/10 focus-within:border-cyan-500/40 rounded-2xl px-4 py-3.5 gap-3 transition-colors">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search quantum spaces by name, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-zinc-200 focus:outline-none w-full placeholder:text-zinc-600"
              />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredProjects.map(p => {
                const matchedTmpl = templates.find(t => t.name === p.template);
                return (
                  <motion.div
                    key={p.id}
                    layoutId={`p-card-${p.id}`}
                    whileHover={{ y: -4 }}
                    className="group bg-black/75 backdrop-blur-3xl border border-white/5 hover:border-cyan-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500"
                  >
                    {/* Glowing highlight in hover */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all duration-500" />
                    
                    <div className="absolute top-4 right-4 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(p); }}
                        className="p-2 rounded-xl bg-black/90 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Rename Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="p-2 rounded-xl bg-black/90 border border-white/10 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete Space"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-cyan-500/40 transition-colors">
                          {matchedTmpl?.icon || '📦'}
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-black border border-white/10 text-[9px] uppercase font-bold tracking-widest text-zinc-400">
                          {p.template}
                        </span>
                      </div>

                      {editingProjId === p.id ? (
                        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-zinc-950 border border-white/15 px-3 py-1.5 text-sm rounded-lg focus:outline-none text-white w-full"
                          />
                          <button
                            onClick={() => saveRename(p.id)}
                            className="px-3 py-1.5 bg-cyan-500 text-xs font-black rounded-lg uppercase tracking-wider text-black"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-extrabold text-lg text-zinc-100 group-hover:text-cyan-400 transition-colors">
                          {p.name}
                        </h3>
                      )}

                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        <span>UPDATED {new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => selectProject(p.id)}
                        className="px-4 py-2 rounded-xl bg-black border border-white/10 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-pink-500 group-hover:text-white group-hover:border-transparent text-zinc-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        <span>Open IDE</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="col-span-full py-16 text-center bg-black/40 rounded-[32px] border border-dashed border-white/10">
                  <FileCode className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">No active workspace spaces found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar details (Profile & Notifications) */}
          <div className="space-y-6">
            
            {/* Specular Profile Summary */}
            <div className="bg-black/75 backdrop-blur-3xl border border-white/5 rounded-[32px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-2xl" />
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 mb-5">ACTIVE USER NODE</h4>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full animate-ping" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full" />
                </div>
                <div>
                  <div className="font-extrabold text-zinc-100 text-lg leading-tight tracking-tight flex items-center gap-1.5">
                    <span>{currentUser.username}</span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">{currentUser.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-5 text-center">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">DEV LEVEL</div>
                  <div className="text-xs font-black text-pink-500 mt-1 uppercase tracking-widest">QUANTUM PRO</div>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">REGION CLUSTER</div>
                  <div className="text-xs font-black text-cyan-400 mt-1 uppercase tracking-widest">COSMIC-EAST</div>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-black/75 backdrop-blur-3xl border border-white/5 rounded-[32px] p-6 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500">Live Telemetry logs</h4>
                <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-wider">
                  {notifications.filter(n => !n.read).length} Unread
                </span>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 relative transition-all ${
                      notif.read 
                        ? 'bg-transparent border-transparent text-zinc-500' 
                        : 'bg-white/[0.02] border-white/5 text-zinc-300 hover:border-cyan-500/25'
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                    )}
                    <div className="font-extrabold text-zinc-200 pr-5 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                      <span>{notif.title}</span>
                    </div>
                    <div className="text-[11px] leading-relaxed text-zinc-400 font-medium pl-5">{notif.message}</div>
                    <div className="text-[9px] text-zinc-600 font-bold pl-5 tracking-wider uppercase">{notif.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};
