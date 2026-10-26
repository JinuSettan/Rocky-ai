/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Layers, AppWindow, User, Settings, X, HardDrive } from 'lucide-react';
import { AIChatPage, ChatMsg } from '../pages/AIChatPage';
import { CreatorHubPage } from '../pages/CreatorHubPage';
import { AppsCreatorPage } from '../pages/AppsCreatorPage';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import { GoogleDriveModal } from './GoogleDriveModal';
import { extractFilesFromAIResponse } from '../utils/codeParser';
import { generateResponse } from '../services/gemini';

const PAGES = [
  { id: 'chat', component: AIChatPage, icon: MessageSquare, label: 'Chat' },
  { id: 'create', component: CreatorHubPage, icon: Layers, label: 'Create' },
  { id: 'apps', component: AppsCreatorPage, icon: AppWindow, label: 'Apps' },
];

export interface RockAIContainerProps {
  onOpenWorkspace?: (projectId?: string) => void;
}

export const RockAIContainer: React.FC<RockAIContainerProps> = ({ onOpenWorkspace }) => {
  const { createProject, selectProject } = useProject();
  const [activePage, setActivePage] = useState(0); // 0: Chat, 1: Create, 2: Apps
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDrive, setShowDrive] = useState(false);

  // Chat State for Gemini API streaming integration
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-rock-ai',
      role: 'assistant',
      text: '🚀 Welcome to **Rock AI**! Powered by **Google Gemini 3.8 Flash** and **Rocky Engine**.\n\nAsk me anything: create games, build UI components, optimize algorithms, or debug your codebase in real-time!',
      timestamp: 'Just now',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    stopStreaming();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: 'Chat cleared. How can Rock AI assist you now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  };

  const sendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : input).trim();
    if (!textToSend || isStreaming) return;

    setError(null);
    setInput('');

    // Use universal multi-language code parser to detect if user is requesting an app/project in any language
    let generatedProjMeta: any = null;
    const parsedInit = extractFilesFromAIResponse('', textToSend);
    if (parsedInit && parsedInit.files.length > 0) {
      const proj = createProject(
        parsedInit.name,
        `Generated via Rock AI assistant: ${textToSend}`,
        parsedInit.template,
        parsedInit.files
      );
      generatedProjMeta = {
        id: proj.id,
        name: proj.name,
        language: parsedInit.language,
        files: proj.files,
      };
    }

    const userMessage: ChatMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMsg = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      generatedProject: generatedProjMeta || undefined,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m) => ({ role: m.role as 'user' | 'assistant', text: m.text }));

      let accumulated = '';
      const fullResponseText = await generateResponse({
        prompt: textToSend,
        history: historyPayload,
        onChunk: (chunkText) => {
          accumulated += chunkText;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    text: accumulated,
                    generatedProject: generatedProjMeta || m.generatedProject,
                  }
                : m
            )
          );
        },
      });

      // Parse accumulated content for multi-file source blocks
      const streamParsed = extractFilesFromAIResponse(fullResponseText || accumulated, textToSend);
      if (streamParsed && streamParsed.files.length > 0) {
        const streamProj = createProject(
          streamParsed.name,
          `Generated via Rock AI assistant: ${textToSend}`,
          streamParsed.template,
          streamParsed.files
        );
        generatedProjMeta = {
          id: streamProj.id,
          name: streamProj.name,
          language: streamParsed.language,
          files: streamProj.files,
        };
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                text: fullResponseText || accumulated || m.text || '✨ Project generated successfully with full source files!',
                generatedProject: generatedProjMeta || m.generatedProject,
              }
            : m
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Gemini stream aborted by user.');
      } else {
        console.error('Error in Gemini API stream:', err);
        const errorMessage = err?.message || 'Failed to stream response from Gemini API.';
        setError(errorMessage);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  text: m.text
                    ? `${m.text}\n\n*(Stream encountered an issue: ${errorMessage})*`
                    : `⚠️ **Unable to complete request:** ${errorMessage}\n\nPlease check network connectivity or try again.`,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    const next = activePage + newDirection;
    if (next >= 0 && next < PAGES.length) {
      setActivePage(next);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-black overflow-hidden relative">
      {/* Swipeable Container */}
      <motion.div
        className="flex-1 w-full flex items-stretch relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = swipePower(offset.x, velocity.x);

          if (swipe < -swipeConfidenceThreshold) {
            paginate(1);
          } else if (swipe > swipeConfidenceThreshold) {
            paginate(-1);
          }
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full h-full"
          >
            {activePage === 0 ? (
              <AIChatPage
                messages={messages}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                isLoading={isLoading}
                isStreaming={isStreaming}
                error={error}
                stopStreaming={stopStreaming}
                clearChat={clearChat}
                onContinueDevelopment={onOpenWorkspace}
              />
            ) : activePage === 1 ? (
              <CreatorHubPage onContinueDevelopment={onOpenWorkspace} />
            ) : (
              <AppsCreatorPage onContinueDevelopment={onOpenWorkspace} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-black border-t border-zinc-800 flex justify-around items-center z-50">
        {PAGES.map((page, index) => (
          <button
            key={page.id}
            onClick={() => setActivePage(index)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activePage === index ? 'text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <page.icon className="w-5 h-5" />
            <span className="text-[10px]">{page.label}</span>
          </button>
        ))}
        {/* Google Drive Workspace Sync */}
        <button
          onClick={() => setShowDrive(true)}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Google Drive Sync"
        >
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px]">Drive</span>
        </button>

        {/* Profile/Settings icons */}
        <button
          onClick={() => setShowProfile(true)}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>

      {/* Google Drive Workspace Cloud Modal */}
      <GoogleDriveModal isOpen={showDrive} onClose={() => setShowDrive(false)} />

      {/* Simple Profile Drawer/Modal */}
      {showProfile && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Developer Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Connected to Rock AI Studio Cloud & Rocky Engine.</p>
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40 text-xs space-y-1 mb-4">
              <div className="text-zinc-300"><span className="text-zinc-500">Engine:</span> Rocky Engine v2.4</div>
              <div className="text-zinc-300"><span className="text-zinc-500">AI Model:</span> Google Gemini 3.8 Flash</div>
              <div className="text-zinc-300"><span className="text-zinc-500">Stream Protocol:</span> Server-Sent Events (SSE)</div>
              <div className="text-zinc-300"><span className="text-zinc-500">Workspace Storage:</span> Google Drive Cloud (OAuth 2.0)</div>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Simple Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-zinc-300 mb-6">
              <div className="flex items-center justify-between p-2.5 bg-zinc-800/40 rounded-xl">
                <span>Real-time Streaming</span>
                <span className="text-xs text-emerald-400 font-semibold">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-zinc-800/40 rounded-xl">
                <span>Model Alias</span>
                <span className="text-xs text-cyan-400 font-mono">gemini-3.8-flash</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-zinc-800/40 rounded-xl">
                <span>Multi-Language Autopilot</span>
                <span className="text-xs text-cyan-400 font-semibold">C, C++, Python, Flutter, Kotlin</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-zinc-800/40 rounded-xl">
                <span>Cloud Storage</span>
                <span className="text-xs text-emerald-400 font-semibold">Google Drive</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
