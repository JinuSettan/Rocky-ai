/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { FileNode, ChatMessage } from '../types';
import { 
  Sparkles, Send, Trash2, Code2, AlertTriangle, Lightbulb, Mic, FileUp, Paperclip,
  BookOpen, GitCommit, ArrowRight, RefreshCw, Copy, Check, Info, HelpCircle, Bot, Zap, Maximize2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicChatCanvas } from './CosmicChatCanvas';

interface SidebarAIProps {
  onClose?: () => void;
}

export const SidebarAI: React.FC<SidebarAIProps> = ({ onClose }) => {
  const { 
    activeProject, 
    activeTabId, 
    updateFileContent, 
    addNotification, 
    addTerminalLine,
    currentUser,
    unlockAchievement
  } = useProject();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const devName = currentUser?.username || 'Creator';
    const projName = activeProject?.name || 'Workspace';
    const projTemplate = activeProject?.template || 'React';
    return [
      {
        id: 'ai-welcome',
        role: 'assistant',
        text: `Greetings, **${devName}**! I am **Rock AI**, your companion in this Quantum OS workspace.\n\nI see you are editing **${projName}** using the **${projTemplate}** template. I am ready to elevate your development! Ask me to **generate next-gen components**, **optimize algorithms**, **resolve diagnostics**, or **refactor code structures** simultaneously!`,
        timestamp: 'Just now'
      }
    ];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [attachedFilesCount, setAttachedFilesCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Helper to find open file
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

  const getActiveFile = (): FileNode | null => {
    if (!activeProject || !activeTabId) return null;
    return findNodeInTree(activeProject.files, activeTabId);
  };

  const handleSend = async (textToSend: string, sourceAction?: string) => {
    let finalPromptText = textToSend;
    if (sourceAction) {
      if (sourceAction === 'bug-fix') {
        finalPromptText = 'Analyze my active file and fix any logical bugs, compilation issues, or TypeScript type warnings.';
      } else if (sourceAction === 'refactor') {
        finalPromptText = 'Refactor my active file to make it cleaner, modular, highly optimized, and follow modern react patterns.';
      } else if (sourceAction === 'explain') {
        finalPromptText = 'Provide a high-level conceptual explanation of the current active code, structure, and functional roles.';
      } else if (sourceAction === 'commit') {
        finalPromptText = 'Suggest a clean semantic Git commit message for my recent work on this file.';
      }
    }

    if (!finalPromptText.trim()) return;

    // Add User Message to UI
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: finalPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setAttachedFilesCount(0);
    setIsLoading(true);

    const activeFile = getActiveFile();
    const activeFileName = activeFile ? activeFile.name : null;
    const activeFileContent = activeFile ? activeFile.content : null;

    // Gather thread history context for conversation continuity
    const historyContext = messages.slice(-8).map(msg => ({
      role: msg.role,
      text: msg.text
    }));

    try {
      // Call secure server-side endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPromptText,
          activeFileName,
          activeFileContent,
          history: historyContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI Response message
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'I analyzed the workspace context but could not formulate a response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      addNotification('Rock AI response synthesized', 'Neural companion finished operations.', 'success');
      unlockAchievement('ai-creator');

    } catch (err: any) {
      console.error('Error contacting server AI endpoint:', err);
      
      // Graceful error fallback message
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Rocky Engine Connection Warning:** Unable to establish direct socket to Rock AI node.\n\n_Note: Please verify development server port status. In the meantime, feel free to continue typing, explore local sandboxes, or trigger automatic fixes._`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      addNotification('AI Connection Warning', 'Check server console or configuration secrets.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCodeToEditor = (code: string) => {
    if (!activeTabId) {
      addNotification('No active file', 'Open a file in your editor tabs to apply code generation.', 'error');
      return;
    }
    updateFileContent(activeTabId, code);
    addNotification('AI Code Applied', 'Successfully synchronized generated code blocks to file editor.', 'success');
    addTerminalLine('git diff --staged', 'input');
    addTerminalLine('Applied Rock AI auto-generated code blocks successfully.', 'success');
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Parses Markdown into sections of raw text and code-frames
  const parseMessageText = (rawText: string) => {
    const parts = rawText.split(/```/g);
    return parts.map((part, index) => {
      const isCode = index % 2 !== 0;
      if (isCode) {
        const firstNewLine = part.indexOf('\n');
        let lang = 'tsx';
        let code = part;
        if (firstNewLine !== -1) {
          lang = part.substring(0, firstNewLine).trim() || 'tsx';
          code = part.substring(firstNewLine + 1);
        }
        return {
          type: 'code',
          lang,
          code
        };
      } else {
        return {
          type: 'text',
          text: part
        };
      }
    });
  };

  // Formats inline text segment (bolds & inline code blocks)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let parts: React.ReactNode[] = [line];
      
      // Parse bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let newParts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      const currentLine = parts[0] as string;
      while ((match = boldRegex.exec(currentLine)) !== null) {
        newParts.push(currentLine.substring(lastIndex, match.index));
        newParts.push(
          <strong key={`b-${match.index}`} className="text-cyan-400 font-extrabold font-sans bg-cyan-500/10 px-1.5 py-0.5 rounded-lg border border-cyan-500/10">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      newParts.push(currentLine.substring(lastIndex));
      parts = newParts;

      // Parse inline `code` highlights
      const inlineCodeRegex = /`(.*?)`/g;
      let finalParts: React.ReactNode[] = [];
      
      parts.forEach((part, partIdx) => {
        if (typeof part === 'string') {
          let codeMatch;
          let lastCodeIdx = 0;
          while ((codeMatch = inlineCodeRegex.exec(part)) !== null) {
            finalParts.push(part.substring(lastCodeIdx, codeMatch.index));
            finalParts.push(
              <code key={`c-${codeMatch.index}`} className="px-1.5 py-0.5 rounded bg-black/85 border border-white/10 text-pink-400 font-mono text-[10px] shadow-sm">
                {codeMatch[1]}
              </code>
            );
            lastCodeIdx = inlineCodeRegex.lastIndex;
          }
          finalParts.push(part.substring(lastCodeIdx));
        } else {
          finalParts.push(part);
        }
      });

      return (
        <div key={lineIdx} className="min-h-[1.3rem]">
          {finalParts.length > 0 ? finalParts : line}
        </div>
      );
    });
  };

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      addNotification('Speech Coprocessor Activated', 'Listening to developer speech commands...', 'info');
      setTimeout(() => {
        setPrompt('Create an extremely polished dashboard template with premium glassmorphism layout.');
        setIsVoiceActive(false);
      }, 3000);
    }
  };

  const handleFileUploadMock = () => {
    setAttachedFilesCount(prev => prev + 1);
    addNotification('Asset Synchronized', 'Appended visual file reference as AI multimodal request payload.', 'success');
  };

  return (
    <div ref={containerRef} className="w-full md:w-96 bg-[#050505]/95 border-l border-white/5 flex flex-col h-full text-left relative z-20 overflow-hidden shadow-2xl">
      
      {/* Absolute canvas background rendering the massive black hole */}
      <CosmicChatCanvas isLoading={isLoading} isVoiceActive={isVoiceActive} />

      {/* Sidebar header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/55 backdrop-blur-md select-none relative z-10">
        <div className="flex items-center gap-3">
          {/* Animated Glowing AI Core HUD Widget */}
          <div className="relative group">
            {/* Spinning external orbit ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute -inset-1 rounded-2xl border border-dashed border-cyan-400/40"
            />
            {/* Pulsing energy rings if loading */}
            {isLoading && (
              <>
                <div className="absolute -inset-3 rounded-2xl border border-pink-500/40 animate-ping opacity-60" />
                <div className="absolute -inset-5 rounded-3xl border border-cyan-500/20 animate-pulse opacity-40" />
              </>
            )}
            
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="p-2 bg-gradient-to-tr from-[#00D4FF] via-purple-600 to-[#FF3CAC] rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.35)] relative z-10 border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
          </div>

          <div>
            <span className="text-xs font-black tracking-widest uppercase text-zinc-100 flex items-center gap-1.5">
              <span>Rock AI Active</span>
            </span>
            <div className="text-[8px] text-cyan-400/80 uppercase tracking-widest font-black mt-0.5">Quantum Brain Unit</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer hover:border hover:border-white/5"
            title="Reset conversation thread"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer hover:border hover:border-white/5"
              title="Collapse chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Shelves */}
      <div className="p-3 border-b border-white/5 bg-black/35 backdrop-blur-sm grid grid-cols-2 gap-2 select-none relative z-10">
        <button
          onClick={() => handleSend('', 'bug-fix')}
          className="p-2.5 rounded-2xl bg-black/45 border border-white/5 hover:border-cyan-500/50 hover:bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 transition-all text-left cursor-pointer active:scale-95 shadow-md btn-glass-ripple"
        >
          <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Fix Diagnostics</span>
        </button>
        <button
          onClick={() => handleSend('', 'refactor')}
          className="p-2.5 rounded-2xl bg-black/45 border border-white/5 hover:border-pink-500/50 hover:bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 transition-all text-left cursor-pointer active:scale-95 shadow-md btn-glass-ripple"
        >
          <Code2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span>Refactor Code</span>
        </button>
        <button
          onClick={() => handleSend('', 'explain')}
          className="p-2.5 rounded-2xl bg-black/45 border border-white/5 hover:border-purple-500/50 hover:bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 transition-all text-left cursor-pointer active:scale-95 shadow-md btn-glass-ripple"
        >
          <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>Explain Logic</span>
        </button>
        <button
          onClick={() => handleSend('', 'commit')}
          className="p-2.5 rounded-2xl bg-black/45 border border-white/5 hover:border-emerald-500/50 hover:bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 transition-all text-left cursor-pointer active:scale-95 shadow-md btn-glass-ripple"
        >
          <GitCommit className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Commit Info</span>
        </button>
      </div>

      {/* Messages Scroll Frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 select-text scrollbar-thin relative z-10 bg-gradient-to-b from-transparent to-black/30">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            const parsedBlocks = parseMessageText(msg.text);

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col gap-1.5 ${isAI ? 'items-start' : 'items-end'}`}
              >
                {/* Meta Timing & Avatar */}
                <div className="flex items-center gap-2 text-[8px] text-zinc-500 font-extrabold uppercase tracking-[0.15em] px-1 select-none">
                  {isAI && (
                    <div className="w-4.5 h-4.5 rounded-full overflow-hidden border border-cyan-400/60 p-0.5 bg-black/80 flex items-center justify-center">
                      <img 
                        src="/src/assets/images/rock_ai_logo_1784212244029.jpg"
                        alt="AI"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  )}
                  <span className={isAI ? 'text-cyan-400 font-black' : 'text-pink-400 font-black'}>
                    {isAI ? 'ROCK AI CORE' : 'CREATOR NODE'}
                  </span>
                  <span>• {msg.timestamp}</span>
                </div>

                {/* Highly styled premium Glassmorphic message bubbles */}
                <div 
                  className={`p-4 rounded-[24px] text-xs leading-relaxed max-w-[95%] shadow-[0_12px_40px_rgba(0,0,0,0.7)] border transition-all duration-300 backdrop-blur-xl ${
                    isAI 
                      ? 'bg-black/40 border-pink-500/20 hover:border-pink-500/45 text-zinc-300 shadow-[0_0_20px_rgba(255,60,172,0.05)] rounded-tl-none' 
                      : 'bg-cyan-950/15 border-cyan-500/30 hover:border-cyan-500/60 text-zinc-100 shadow-[0_0_25px_rgba(0,212,255,0.08)] rounded-tr-none'
                  }`}
                >
                  <div className="space-y-3">
                    {parsedBlocks.map((block, bIdx) => {
                      if (block.type === 'code' && block.code) {
                        const blockKey = `${msg.id}-code-${bIdx}`;
                        return (
                          <div 
                            key={blockKey} 
                            className="mt-3 border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/90 text-left shadow-2xl relative"
                          >
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-400 to-pink-500" />
                            
                            <div className="px-3 py-2 bg-black border-b border-white/5 flex justify-between items-center select-none">
                              <span className="text-[8px] font-mono text-zinc-500 font-black uppercase flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                {block.lang}
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => copyToClipboard(block.code!, blockKey)}
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                  title="Copy code"
                                >
                                  {copiedKey === blockKey ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <pre className="p-3.5 font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-[220px] bg-black/60 leading-relaxed scrollbar-thin">
                              <code>{block.code}</code>
                            </pre>

                            {activeTabId && (
                              <button
                                onClick={() => applyCodeToEditor(block.code!)}
                                className="w-full bg-gradient-to-r from-[#00D4FF] via-[#FF3CAC] to-purple-600 hover:brightness-110 text-white font-black text-[9px] uppercase tracking-widest py-3 flex items-center justify-center gap-1.5 transition-all select-none border-t border-white/5 cursor-pointer shadow-md"
                              >
                                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                <span>Inject in active compiler</span>
                              </button>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div key={bIdx} className="space-y-1.5 whitespace-pre-line text-zinc-300 font-medium tracking-wide">
                            {renderFormattedText(block.text || '')}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs py-2.5 bg-black/65 backdrop-blur-md p-3.5 rounded-3xl border border-white/10 shadow-lg select-none">
            <div className="relative">
              <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-pink-500 animate-pulse p-0.5">
                <img 
                  src="/src/assets/images/rock_ai_logo_1784212244029.jpg"
                  alt="AI Thinking"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-60" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-black tracking-widest text-[8px] uppercase text-pink-400 animate-pulse">Neural pulse synthesis...</span>
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">Singularity compute executing</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="p-4 border-t border-white/5 bg-black/75 backdrop-blur-3xl flex flex-col gap-2.5 relative z-10">
        
        {/* Attaching notification indicator */}
        {attachedFilesCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-[8px] font-black uppercase tracking-widest text-pink-400 select-none">
            <Paperclip className="w-3 h-3" />
            <span>{attachedFilesCount} Multimodal Attachment Active</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* File payload attachment */}
          <button
            onClick={handleFileUploadMock}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 text-zinc-500 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Attach file to AI payload"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Prompt Input Box */}
          <input
            type="text"
            placeholder={isVoiceActive ? "Listening carefully..." : "Coordinate Rock AI core..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(prompt)}
            disabled={isLoading || isVoiceActive}
            className="flex-1 bg-zinc-950 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all disabled:opacity-50 font-medium shadow-inner"
          />

          {/* Voice Command Coprocessor */}
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
              isVoiceActive 
                ? 'bg-pink-500 text-white border-pink-400 animate-pulse shadow-[0_0_15px_rgba(255,60,172,0.4)]' 
                : 'bg-white/[0.02] border-white/10 text-zinc-500 hover:text-white hover:border-pink-500/30'
            }`}
            title="Speech command coprocessor"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Trigger */}
          <button
            onClick={() => handleSend(prompt)}
            disabled={isLoading || !prompt.trim()}
            className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 disabled:bg-zinc-950 disabled:from-zinc-950 disabled:to-zinc-950 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(255,0,191,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-white/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
