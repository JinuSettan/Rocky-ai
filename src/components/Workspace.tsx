/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import { FileExplorer } from './FileExplorer';
import { BuildGameSidebar } from './BuildGameSidebar';
import { GameWorkspace } from './GameWorkspace';
import { SidebarAI } from './SidebarAI';
import { BottomPanel } from './BottomPanel';
import { GlobalSearchReplace } from './GlobalSearchReplace';
import { CodeFragmentsPanel } from './CodeFragmentsPanel';
import { GamesPage } from './GamesPage';
import { MobileNavigation } from './MobileNavigation';
import { ParticleExplosionCanvas } from './ParticleExplosionCanvas';
import { 
  X, Code2, AlertCircle, Sparkles, Terminal, Save, Eye, Search, 
  Settings, HelpCircle, Check, Play, BookOpen, Layers, Gamepad2, Folder, Zap, Cpu, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Workspace: React.FC = () => {
  const {
    activeProject,
    openTabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    updateFileContent,
    isAutoSaveEnabled,
    fontSize,
    addNotification,
    previewUrl,
    isPreviewRunning,
    runProject,
    unlockAchievement
  } = useProject();

  const [editorContent, setEditorContent] = useState('');
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  
  // Responsive Sidebars states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);

  // Auto-collapse sidebars below 1024px (tablet & mobile viewports)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftSidebarOpen(false);
        setIsAiSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsAiSidebarOpen(true);
      }
    };
    handleResize(); // Initial trigger on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search state inside active file
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  // Autocomplete popup simulator state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteCoords, setAutocompleteCoords] = useState({ top: 0, left: 0 });
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Game Workspace and Sidebar section states
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'game-build' | 'search' | 'fragments' | 'games' | 'apps' | 'settings'>('files');
  const [selectedGameEngineId, setSelectedGameEngineId] = useState<string | null>(null);
  const [isGameWorkspaceOpen, setIsGameWorkspaceOpen] = useState(false);
  const [isLivePreviewTabActive, setIsLivePreviewTabActive] = useState(false);
  const [connectedEngines, setConnectedEngines] = useState<Record<string, boolean>>({
    ue5: false,
    unity6: false,
    godot4: true, // Godot 4 is pre-connected for beautiful default demonstration
    o3de: false,
    stride: false,
    bevy: false
  });

  // Traverse file tree to find active node
  const findNodeInTree = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Synchronise active file state on tab switch
  useEffect(() => {
    if (activeProject && activeTabId) {
      const node = findNodeInTree(activeProject.files, activeTabId);
      if (node && node.type === 'file') {
        setActiveFile(node);
        setEditorContent(node.content || '');
        setIsSaved(true);
        // Automatically switch away from game workspace when viewing/opening a raw script
        setIsGameWorkspaceOpen(false);
        setIsLivePreviewTabActive(false);
      }
    } else {
      setActiveFile(null);
      setEditorContent('');
    }
  }, [activeTabId, activeProject]);

  // Handle typing inside editor
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    setIsSaved(false);

    if (activeTabId) {
      // Direct live sync or debounce based on auto-save
      updateFileContent(activeTabId, newContent);
      if (isAutoSaveEnabled) {
        setIsSaved(true);
      }
    }

    // Trigger autocomplete suggestions mock
    const words = newContent.split(/[\s()]+/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.length >= 2) {
      const suggestions = ['interface', 'component', 'function', 'import React', 'useState', 'useEffect', 'className', 'export const', 'RockAI', 'RockyEngine']
        .filter(s => s.startsWith(lastWord) && s !== lastWord);
      
      if (suggestions.length > 0) {
        setAutocompleteSuggestions(suggestions);
        setShowAutocomplete(true);
        // Estimate coords relative to cursor
        setAutocompleteCoords({ top: 120, left: 160 });
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Trigger manual compile save action
  const handleManualSave = () => {
    if (activeTabId && activeFile) {
      updateFileContent(activeTabId, editorContent);
      setIsSaved(true);
      addNotification('Manual Compile Success', `Successfully compiled & verified modifications inside "${activeFile.name}".`, 'success');
    }
  };

  // Inject suggestion to text
  const selectSuggestion = (word: string) => {
    const words = editorContent.split(/[\s()]+/);
    words[words.length - 1] = word;
    const completed = words.join(' ');
    setEditorContent(completed);
    if (activeTabId) {
      updateFileContent(activeTabId, completed);
    }
    setShowAutocomplete(false);
  };

  // Inject/Insert Code Fragment Shard at Cursor
  const handleInsertCode = (codeToInsert: string, shardTitle: string, rarity: string) => {
    if (!activeTabId || !activeFile) {
      addNotification('Insertion Aborted', 'Select an active file script in the workspace to drop data shards.', 'warning');
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      const newContent = editorContent + '\n' + codeToInsert;
      setEditorContent(newContent);
      updateFileContent(activeTabId, newContent);
      setIsSaved(false);
      
      // Spawn explosion in center
      window.dispatchEvent(new CustomEvent('trigger-particle-explosion', {
        detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, rarity }
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newContent = before + codeToInsert + after;
    setEditorContent(newContent);
    updateFileContent(activeTabId, newContent);
    setIsSaved(false);

    // Focus back and set selection cursor
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + codeToInsert.length;
    }, 50);

    // Calculate drop coordinates to spawn the particle explosion!
    const rect = textarea.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    window.dispatchEvent(new CustomEvent('trigger-particle-explosion', {
      detail: { x, y, rarity }
    }));

    addNotification('Shard Integrated', `"${shardTitle}" successfully woven into "${activeFile.name}"!`, 'success');
    unlockAchievement('shard-synthesizer');
  };

  // Calculate code lines count
  const lineCount = editorContent.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex min-h-0 bg-transparent relative select-none flex-col md:flex-row">
      <MobileNavigation activeTab={activeSidebarTab} setActiveTab={(tab) => setActiveSidebarTab(tab as any)} />
      
      {/* 0. Leftmost Activity Bar Switcher (Glassmorphic) */}
      <div className="w-14 bg-black border-r border-white/5 flex flex-col items-center py-5 justify-between flex-shrink-0 z-30">
        <div className="flex flex-col items-center gap-5 w-full">
          {/* File Explorer Tab Button */}
          <button
            onClick={() => setActiveSidebarTab('files')}
            className={`p-2.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
              activeSidebarTab === 'files'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
            title="Workspace Files"
          >
            <Folder className="w-6 h-6" />
            <span className="absolute left-16 bg-black border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
              Workspace Files
            </span>
          </button>

          {/* Game Builder Tab Button */}
          <button
            onClick={() => setActiveSidebarTab('game-build')}
            className={`p-2.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
              activeSidebarTab === 'game-build'
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_15px_rgba(255,0,191,0.2)]'
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
            title="Build Game (3D)"
          >
            <Gamepad2 className="w-6 h-6" />
            <span className="absolute left-16 bg-black border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
              Build Game (3D)
            </span>
          </button>

          {/* Global Search & Replace Button */}
          <button
            onClick={() => setActiveSidebarTab('search')}
            className={`p-2.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
              activeSidebarTab === 'search'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(157,0,255,0.2)]'
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
            title="Search & Replace"
          >
            <Search className="w-6 h-6" />
            <span className="absolute left-16 bg-black border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
              Global Search & Replace
            </span>
          </button>

          {/* Code Fragments Library Button */}
          <button
            onClick={() => setActiveSidebarTab('fragments')}
            className={`p-2.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
              activeSidebarTab === 'fragments'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
            title="Quantum Shards"
          >
            <Layers className="w-5 h-5" />
            <span className="absolute left-16 bg-black border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
              Quantum Shards
            </span>
          </button>
        </div>

        {/* Status Indicator bottom */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[7px] text-zinc-600 font-extrabold tracking-wider uppercase">Live</span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" title="System services synchronized" />
        </div>
      </div>

      {/* 1. Left sidebar panel (Responsive Desktop Drawer) */}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 288 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="hidden md:flex flex-col w-72 flex-shrink-0 border-r border-white/5 bg-[#050505]/75 backdrop-blur-2xl relative z-20 overflow-hidden h-full"
          >
            {activeSidebarTab === 'files' ? (
              <FileExplorer />
            ) : activeSidebarTab === 'search' ? (
              <GlobalSearchReplace />
            ) : activeSidebarTab === 'fragments' ? (
              <CodeFragmentsPanel onInsertCode={handleInsertCode} />
            ) : (
              <BuildGameSidebar
                connectedEngines={connectedEngines}
                onToggleConnect={(id) => {
                  const nextState = !connectedEngines[id];
                  setConnectedEngines(prev => ({ ...prev, [id]: nextState }));
                  addNotification(
                    nextState ? 'Engine Connected' : 'Engine Disconnected',
                    nextState 
                      ? `Successfully paired active IDE bridge with local proxy node for ${id.toUpperCase()}.`
                      : `Terminated IDE bridge session with local ${id.toUpperCase()} compile nodes.`,
                    nextState ? 'success' : 'warning'
                  );
                }}
                onSelectEngine={(id, actionType) => {
                  setSelectedGameEngineId(id);
                  setIsGameWorkspaceOpen(true);
                  setActiveTabId(null); // Clear raw editor tab context to prioritize Game Studio viewport
                  addNotification(
                    '3D Studio Initialised', 
                    `Entering procedural Prompt-to-Game workspace for ${id.toUpperCase()}.`, 
                    'success'
                  );
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Left Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeftSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer Sliding container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 h-full bg-[#050505]/95 border-r border-white/10 z-50 flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/40">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">NAVIGATION SHELF</span>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeSidebarTab === 'files' ? (
                  <FileExplorer />
                ) : activeSidebarTab === 'search' ? (
                  <GlobalSearchReplace />
                ) : activeSidebarTab === 'fragments' ? (
                  <CodeFragmentsPanel onInsertCode={handleInsertCode} />
                ) : (
                  <BuildGameSidebar
                    connectedEngines={connectedEngines}
                    onToggleConnect={(id) => {
                      const nextState = !connectedEngines[id];
                      setConnectedEngines(prev => ({ ...prev, [id]: nextState }));
                      addNotification(
                        nextState ? 'Engine Connected' : 'Engine Disconnected',
                        nextState 
                          ? `Successfully paired active IDE bridge with local proxy node for ${id.toUpperCase()}.`
                          : `Terminated IDE bridge session with local ${id.toUpperCase()} compile nodes.`,
                        nextState ? 'success' : 'warning'
                      );
                    }}
                    onSelectEngine={(id, actionType) => {
                      setSelectedGameEngineId(id);
                      setIsGameWorkspaceOpen(true);
                      setActiveTabId(null);
                      setIsLeftSidebarOpen(false); // Close on selection
                      addNotification(
                        '3D Studio Initialised', 
                        `Entering procedural Prompt-to-Game workspace for ${id.toUpperCase()}.`, 
                        'success'
                      );
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Center Work area (Editor + Tabs + Interactive Bottom panel) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        
        {/* Editor Multi Tabs Header (Premium rounded floating glass design) */}
        <div className="h-11 bg-black border-b border-white/5 flex items-center justify-between px-3">
          <div className="flex items-center gap-2 overflow-x-auto pr-4 scrollbar-none">
            {/* Dynamic Game Studio workspace Tab */}
            {selectedGameEngineId && (
              <div
                onClick={() => {
                  setIsGameWorkspaceOpen(true);
                  setActiveTabId(null);
                }}
                className={`h-8 px-4 rounded-xl flex items-center gap-2 text-xs font-black cursor-pointer transition-all duration-300 border ${
                  isGameWorkspaceOpen
                    ? 'bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-pink-500/40 text-pink-400 shadow-[0_0_12px_rgba(255,0,191,0.15)]'
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                <span className="truncate max-w-[120px] uppercase tracking-wider text-[10px]">
                  {selectedGameEngineId.toUpperCase()} Studio
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGameWorkspaceOpen(false);
                    if (openTabs.length > 0) {
                      setActiveTabId(openTabs[0].id);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {openTabs.map(tab => {
              const isActive = tab.id === activeTabId && !isGameWorkspaceOpen;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setIsGameWorkspaceOpen(false);
                  }}
                  className={`h-8 px-4 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-white/[0.01]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                  <span className="truncate max-w-[100px] tracking-wide">{tab.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {openTabs.length === 0 && !selectedGameEngineId && (
              <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest px-2">No scripts active</span>
            )}

            {/* Permanent visible Preview Tab */}
            <div
              onClick={() => {
                setIsLivePreviewTabActive(true);
                setIsGameWorkspaceOpen(false);
                setActiveTabId(null);
              }}
              className={`h-8 px-4 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-all duration-300 border ${
                isLivePreviewTabActive
                  ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(157,0,255,0.15)]'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-white/[0.01]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="truncate max-w-[100px] uppercase font-black text-[10px] tracking-wider">Live Preview</span>
              {isPreviewRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              )}
            </div>
          </div>

          {/* Action and Sidebar controls */}
          <div className="flex items-center gap-2 pr-2">
            {activeFile && !isGameWorkspaceOpen && (
              <>
                <button
                  onClick={() => setShowFind(!showFind)}
                  className={`p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors ${
                    showFind ? 'text-cyan-400 bg-white/5 border border-white/5' : ''
                  }`}
                  title="Search keyword in file"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={handleManualSave}
                  disabled={isSaved}
                  className={`p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors ${
                    !isSaved ? 'text-pink-500 animate-pulse' : ''
                  }`}
                  title="Trigger Manual Compile Save"
                >
                  <Save className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Left Explorer Sidebar Toggle */}
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isLeftSidebarOpen
                  ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_10px_rgba(0,212,255,0.15)]'
                  : 'text-zinc-500 hover:text-zinc-200 border-transparent'
              }`}
              title="Toggle File Explorer"
            >
              <Folder className="w-4 h-4" />
            </button>

            {/* Right AI Sidebar Toggle */}
            <button
              onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isAiSidebarOpen
                  ? 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-[0_0_10px_rgba(255,60,172,0.15)]'
                  : 'text-zinc-500 hover:text-zinc-200 border-transparent'
              }`}
              title="Toggle Rock AI Companion"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search inline overlay container */}
        {showFind && activeFile && !isGameWorkspaceOpen && (
          <div className="bg-black border-b border-white/5 px-4 py-2 flex items-center gap-3 text-left">
            <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 gap-2 flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Find text inside active workspace node..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 focus:outline-none w-full placeholder:text-zinc-700"
                autoFocus
              />
            </div>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider">
              {findText ? `${(editorContent.match(new RegExp(findText, 'gi')) || []).length} results` : '0 matches'}
            </span>
            <button
              onClick={() => { setShowFind(false); setFindText(''); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Central Text Editor or Game Workspace area */}
        <div className="flex-1 min-h-0 relative flex bg-black">
          {isGameWorkspaceOpen ? (
            <GameWorkspace
              engineId={selectedGameEngineId}
              isConnected={!!connectedEngines[selectedGameEngineId || '']}
              onConnectEngine={() => {
                if (selectedGameEngineId) {
                  setConnectedEngines(prev => ({ ...prev, [selectedGameEngineId]: true }));
                  addNotification('Engine Services Synced', `Bound local compiler plugin for ${selectedGameEngineId.toUpperCase()} successfully.`, 'success');
                }
              }}
            />
          ) : activeSidebarTab === 'games' ? (
            <GamesPage />
          ) : isLivePreviewTabActive ? (
            <div className="flex-1 flex flex-col bg-zinc-950 text-left select-text">
              {/* Dynamic glassmorphic navigation address bar */}
              <div className="h-11 bg-black border-b border-white/5 px-4 flex items-center justify-between select-none">
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 ml-3 flex items-center bg-[#050505]/85 border border-white/10 rounded-xl px-3 py-1 text-[10px] font-mono text-zinc-400 gap-2 shadow-inner">
                    <span className="text-zinc-600 select-none">https://</span>
                    <span className="text-zinc-300 font-bold truncate">localhost:3000</span>
                    <span className="text-emerald-500 font-black ml-auto flex items-center gap-1.5 text-[8px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>secure tunnel</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={previewUrl || 'http://localhost:3000'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl transition-all flex items-center gap-1.5"
                    title="Open Live Preview in a fresh browser tab"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Preview</span>
                  </a>
                </div>
              </div>
              <div className="flex-1 bg-black relative">
                {isPreviewRunning && previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Rock AI Cloud Sandbox Preview"
                    className="w-full h-full bg-black border-none"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-5 bg-[#050505] relative select-none overflow-hidden">
                    {/* Cinematic wallpaper embedded in compiler page */}
                    <div className="absolute inset-0 bg-cover bg-center filter blur-md opacity-20 scale-105 pointer-events-none" style={{ backgroundImage: 'url(/src/assets/images/rock_ai_wallpaper_1784212226814.jpg)' }} />
                    
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                      <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="relative z-10 space-y-1.5">
                      <h4 className="font-extrabold text-sm text-zinc-200 uppercase tracking-widest">Compiler Server Idle</h4>
                      <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-relaxed font-bold uppercase tracking-wider">
                        Press **Run OS Core** above to deploy live Hot module updates on port 3000.
                      </p>
                    </div>
                    <button
                      onClick={runProject}
                      className="px-6 py-3 bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg relative z-10 cursor-pointer"
                    >
                      Serve Live Sandbox
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeFile ? (
            <div className="flex-1 flex min-h-0 relative select-text">
              
              {/* Lines counter column */}
              <div className="w-12 border-r border-white/5 py-4 select-none font-mono text-[11px] text-zinc-700 text-right pr-3 bg-black">
                {lineNumbers.map(n => (
                  <div key={n} className="h-[18px] leading-[18px]">{n}</div>
                ))}
              </div>

              {/* Editor Workspace Input container */}
              <div className="flex-1 min-h-0 relative">
                <textarea
                  ref={textareaRef}
                  value={editorContent}
                  onChange={handleContentChange}
                  onDragOver={(e) => {
                    if (activeTabId && activeFile) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e) => {
                    if (!activeTabId || !activeFile) return;
                    e.preventDefault();
                    
                    const code = e.dataTransfer.getData('text/plain');
                    const title = e.dataTransfer.getData('shard-title') || 'Quantum Block';
                    const rarity = e.dataTransfer.getData('shard-rarity') || 'Rare';
                    
                    if (!code) return;

                    const textarea = textareaRef.current;
                    if (!textarea) return;

                    const dropX = e.clientX;
                    const dropY = e.clientY;

                    let insertIdx = textarea.value.length;
                    if (document.caretRangeFromPoint) {
                      const range = document.caretRangeFromPoint(dropX, dropY);
                      if (range) {
                        insertIdx = range.startOffset;
                      }
                    } else if ((document as any).caretPositionFromPoint) {
                      const position = (document as any).caretPositionFromPoint(dropX, dropY);
                      if (position) {
                        insertIdx = position.offset;
                      }
                    } else {
                      insertIdx = textarea.selectionStart;
                    }

                    const text = textarea.value;
                    const before = text.substring(0, insertIdx);
                    const after = text.substring(insertIdx, text.length);

                    const newContent = before + code + after;
                    setEditorContent(newContent);
                    updateFileContent(activeTabId, newContent);
                    setIsSaved(false);

                    setTimeout(() => {
                      textarea.focus();
                      textarea.selectionStart = insertIdx;
                      textarea.selectionEnd = insertIdx + code.length;
                    }, 50);

                    // Trigger particle explosion right at drop coordinate relative to container!
                    const containerRect = textarea.parentElement?.getBoundingClientRect();
                    if (containerRect) {
                      const px = dropX - containerRect.left;
                      const py = dropY - containerRect.top;
                      window.dispatchEvent(new CustomEvent('trigger-particle-explosion', {
                        detail: { x: px, y: py, rarity }
                      }));
                    } else {
                      window.dispatchEvent(new CustomEvent('trigger-particle-explosion', {
                        detail: { x: dropX, y: dropY, rarity }
                      }));
                    }

                    addNotification('Shard Welded', `"${title}" successfully welded via drag-and-drop!`, 'success');
                    unlockAchievement('shard-synthesizer');
                  }}
                  style={{ fontSize: `${fontSize}px` }}
                  className="w-full h-full bg-[#050505] text-zinc-100 p-4 font-mono leading-[18px] focus:outline-none resize-none caret-pink-500 whitespace-pre overflow-auto scrollbar-thin select-text"
                  spellCheck={false}
                  placeholder="// Type code here..."
                />

                {/* Particle Explosion Canvas Overlay */}
                <ParticleExplosionCanvas />

                {/* Inline AI Autocomplete Box overlay */}
                {showAutocomplete && (
                  <div
                    style={{ top: `${autocompleteCoords.top}px`, left: `${autocompleteCoords.left}px` }}
                    className="absolute bg-black border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] z-30 w-48 animate-fade-in text-left"
                  >
                    <div className="px-2 py-1 text-[8px] uppercase tracking-widest text-cyan-400 font-black border-b border-white/5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
                      <span>Neural Autocomplete</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {autocompleteSuggestions.slice(0, 4).map((word, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion(word)}
                          className="px-2 py-1 text-[10px] text-zinc-300 hover:text-cyan-400 hover:bg-white/[0.03] rounded-lg cursor-pointer transition-colors font-mono font-medium"
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating AI Accent badge inside file */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 border border-white/10 text-zinc-400 text-[9px] uppercase tracking-widest font-black backdrop-blur">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  <span>{isSaved ? 'Synchronised' : 'Unsaved modifications'}</span>
                </div>
              </div>

            </div>
          ) : (
            // Editor Empty/Greeting Landing page
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#050505] select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-105 pointer-events-none" style={{ backgroundImage: 'url(/src/assets/images/rock_ai_wallpaper_1784212226814.jpg)' }} />
              
              <div className="max-w-md space-y-6 relative z-10">
                <div className="inline-flex p-5 bg-gradient-to-tr from-cyan-500/10 via-pink-500/5 to-purple-600/10 rounded-[24px] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] animate-pulse">
                  <Layers className="w-9 h-9 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wider text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">QUANTUM ENVIRONMENT ACTIVE</h3>
                  <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-wider leading-relaxed">
                    Select a component file from the explorer on the left or prompt **Rock AI** to automatically generate a next-gen template.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-3.5 bg-black/80 border border-white/5 rounded-2xl">
                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Multi-Tab Terminal</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Interactive server logs, commands & compilations</div>
                  </div>
                  <div className="p-3.5 bg-black/80 border border-white/5 rounded-2xl">
                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">HMR Sandbox Core</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Reactive styling with full Tailwind utility engines</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom terminal console output frame */}
        <BottomPanel />

      </div>

      {/* 3. Redesigned Right AI Companion Sidebar (Responsive Desktop) */}
      <AnimatePresence>
        {isAiSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 384 }} // 384px is w-96
            exit={{ opacity: 0, x: 25, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="hidden md:flex flex-col h-full overflow-hidden"
          >
            <SidebarAI onClose={() => setIsAiSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Right AI Companion Overlay Drawer */}
      <AnimatePresence>
        {isAiSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Sliding Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm h-full flex"
            >
              <SidebarAI onClose={() => setIsAiSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
