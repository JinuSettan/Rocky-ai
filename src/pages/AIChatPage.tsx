import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Upload, Send, Sparkles, Square, AlertCircle, RefreshCw,
  Copy, Check, Rocket, Eye, Download, Edit3, Play, Terminal, Layers, FileCode, X
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import JSZip from 'jszip';
import { extractFilesFromAIResponse } from '../utils/codeParser';
import { generateResponse } from '../services/gemini';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  generatedProject?: {
    id: string;
    name: string;
    language: string;
    files: FileNode[];
  };
}

export interface AIChatPageProps {
  messages?: ChatMsg[];
  input?: string;
  setInput?: (val: string) => void;
  sendMessage?: (text?: string) => Promise<void>;
  isLoading?: boolean;
  isStreaming?: boolean;
  error?: string | null;
  stopStreaming?: () => void;
  clearChat?: () => void;
  onContinueDevelopment?: (projectId: string) => void;
}

export const AIChatPage: React.FC<AIChatPageProps> = (props) => {
  const { createProject, selectProject } = useProject();

  const [internalInput, setInternalInput] = useState('');
  const [internalMessages, setInternalMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '🚀 Welcome to **Rock AI**! Powered by **Google Gemini 3.8 Flash** and **Rocky Engine**.\n\nAsk me anything: create games, build Python backends, craft UI components, or say **"Create a calculator app"** or **"Create a Python space game"** to auto-generate and preview live projects!',
      timestamp: 'Now'
    }
  ]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalStreaming, setInternalStreaming] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const internalAbortRef = useRef<AbortController | null>(null);

  const input = props.input !== undefined ? props.input : internalInput;
  const setInput = props.setInput || setInternalInput;
  const messages = props.messages !== undefined ? props.messages : internalMessages;
  const isStreaming = props.isStreaming !== undefined ? props.isStreaming : internalStreaming;
  const isLoading = props.isLoading !== undefined ? props.isLoading : internalLoading;
  const error = props.error !== undefined ? props.error : internalError;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice mode state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  // Black hole visual mode
  const [isBlackHoleExpanded, setIsBlackHoleExpanded] = useState(false);
  // Upload status indicator
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active preview / edit modals
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const [editProject, setEditProject] = useState<any | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>('');

  const [loadElapsed, setLoadElapsed] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isLoading || isStreaming) {
      setLoadElapsed(0);
      const startTime = Date.now();
      timer = setInterval(() => {
        setLoadElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } else {
      setLoadElapsed(0);
    }
    return () => clearInterval(timer);
  }, [isLoading, isStreaming]);

  // Auto-open live preview when calculator app is generated
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.generatedProject && !previewProject) {
      const prevUserMsg = messages[messages.length - 2];
      const text = (prevUserMsg?.text || '').toLowerCase();
      if (text.includes('calculator')) {
        setPreviewProject(lastMsg.generatedProject);
      }
    }
  }, [messages, previewProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isLoading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStopStreaming = () => {
    if (props.stopStreaming) {
      props.stopStreaming();
    } else if (internalAbortRef.current) {
      internalAbortRef.current.abort();
      internalAbortRef.current = null;
      setInternalStreaming(false);
      setInternalLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setInternalError('Please upload a text/code file smaller than 1 MB.');
      return;
    }

    try {
      const text = await file.text();
      if (!text.trim()) {
        setInternalError('The selected file is empty or cannot be read as text.');
        return;
      }
      setUploadedFileName(file.name);
      setUploadedFileContent(text);
      setInput(`Please inspect this attached file (${file.name}), explain any issues, and suggest or provide a corrected version.`);
      setInternalError(null);
    } catch {
      setInternalError('Could not read this file. Please choose a text or source-code file.');
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    const speechWindow = window as any;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInternalError('Voice input is not supported in this browser. You can type your prompt instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ml-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (typeof transcript === 'string' && transcript.trim()) {
        setInput(transcript.trim());
        setInternalError(null);
      }
      setIsVoiceActive(false);
    };
    recognition.onerror = () => {
      setInternalError('Voice recognition failed. Please try again or type your prompt.');
      setIsVoiceActive(false);
    };
    recognition.onend = () => setIsVoiceActive(false);
    setIsVoiceActive(true);
    try {
      recognition.start();
    } catch {
      setIsVoiceActive(false);
      setInternalError('Could not start voice recognition. Please try again.');
    }
  };

  const downloadZip = async (proj: any) => {
    const zip = new JSZip();
    proj.files.forEach((f: FileNode) => {
      zip.file(f.name, f.content || '');
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.name.toLowerCase().replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = (projId: string) => {
    selectProject(projId);
    if (props.onContinueDevelopment) {
      props.onContinueDevelopment(projId);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const typedPrompt = (textOverride !== undefined ? textOverride : input).trim();
    if ((!typedPrompt && !uploadedFileContent) || isStreaming || isLoading) return;

    const prompt = uploadedFileContent
      ? `${typedPrompt || `Please inspect ${uploadedFileName || 'the attached file'}.`}\n\nAttached file: ${uploadedFileName || 'upload'}\n\n\`\`\`\n${uploadedFileContent}\n\`\`\``
      : typedPrompt;
    if (!prompt.trim()) return;

    if (props.sendMessage) {
      setInput('');
      setUploadedFileName(null);
      setUploadedFileContent('');
      await props.sendMessage(prompt);
      return;
    }

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: typedPrompt || `Please inspect attached file: ${uploadedFileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const assistantId = `assistant-${Date.now()}`;
    setInput('');
    setUploadedFileName(null);
    setUploadedFileContent('');
    setInternalError(null);
    setInternalLoading(true);
    setInternalStreaming(true);
    setInternalMessages(prev => [...prev, userMsg, {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);

    let responseText = '';
    try {
      const history = messages
        .filter(m => m.id !== 'welcome' && (m.role === 'user' || m.role === 'assistant'))
        .slice(-12)
        .map(m => ({ role: m.role, text: m.text }));
      responseText = await generateResponse({
        prompt,
        history,
        activeFileName: uploadedFileName || undefined,
        activeFileContent: uploadedFileContent || undefined,
        onChunk: chunk => {
          responseText += chunk;
          setInternalMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: responseText } : m));
        },
      });

      const parsed = extractFilesFromAIResponse(responseText, prompt);
      if (parsed && parsed.files.length > 0) {
        const project = createProject(
          parsed.name,
          `Generated by Rock AI from the request: ${typedPrompt || uploadedFileName || 'attached file'}`,
          parsed.template,
          parsed.files
        );
        setInternalMessages(prev => prev.map(m => m.id === assistantId ? {
          ...m,
          text: `${responseText}\n\nProject files were extracted from the AI response. They have not been compiled or runtime-tested yet.`,
          generatedProject: {
            id: project.id,
            name: project.name,
            language: parsed.language,
            files: project.files,
          },
        } : m));
      }
      if (!responseText.trim()) {
        throw new Error('The AI returned an empty response.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setInternalError(message);
      setInternalMessages(prev => prev.map(m => m.id === assistantId ? {
        ...m,
        text: `I couldn't complete that request. ${message}`,
      } : m));
    } finally {
      setInternalLoading(false);
      setInternalStreaming(false);
      internalAbortRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col p-3 md:p-6 bg-black text-white relative overflow-hidden select-none">
      {/* Cosmic Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-black to-black pointer-events-none" />

      {/* 1. Header with Animated Black Hole */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Animated Black Hole Core */}
          <div
            onClick={() => setIsBlackHoleExpanded(!isBlackHoleExpanded)}
            className="relative cursor-pointer group"
            title="Click to toggle Gravitational Horizon"
          >
            {/* Accretion Disk Glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 blur-sm opacity-75 group-hover:opacity-100 animate-spin transition duration-1000" />
            <div className="relative w-9 h-9 rounded-full bg-black border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              {/* Event Horizon Singularity */}
              <div className="w-4 h-4 rounded-full bg-black shadow-[inset_0_0_6px_#000]" />
              <div className="absolute inset-0 border border-cyan-300/40 rounded-full animate-ping opacity-25" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Rock AI</h2>
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Rocky Engine Cosmic Compiler</p>
          </div>
        </div>

        {/* Quick Clear Button */}
        {props.clearChat && (
          <button
            onClick={props.clearChat}
            className="text-xs text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expanded Black Hole Visualizer Modal */}
      {isBlackHoleExpanded && (
        <div className="p-3 bg-zinc-900/90 border border-cyan-500/30 rounded-2xl mb-3 flex items-center justify-between text-xs animate-fade-in relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse">
              <span className="text-cyan-400 text-xs font-mono font-bold">1.4c</span>
            </div>
            <div>
              <p className="font-bold text-white">Gravitational Accretion Engine</p>
              <p className="text-zinc-400 text-[11px]">Quantum code synthesis active with zero latency.</p>
            </div>
          </div>
          <button
            onClick={() => setIsBlackHoleExpanded(false)}
            className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Chat Messages Area */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-4 pr-1 relative z-10">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3.5 rounded-2xl max-w-[92%] sm:max-w-[85%] text-xs sm:text-sm leading-relaxed transition-all ${
              m.role === 'user'
                ? 'bg-blue-600/90 text-white ml-auto rounded-tr-xs shadow-md'
                : 'bg-zinc-900/95 border border-zinc-800 text-zinc-100 mr-auto rounded-tl-xs shadow-md'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.text}</div>

            {/* Generated Project Card with 5 Buttons */}
            {m.generatedProject && (
              <div className="mt-3 p-3 bg-black/80 rounded-xl border border-cyan-500/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">{m.generatedProject.name}</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                    {m.generatedProject.language}
                  </span>
                </div>

                {/* 5 Required Action Buttons: Preview, Play, Download, Edit, Continue Development */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setPreviewProject(m.generatedProject)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" /> Preview
                  </button>
                  <button
                    onClick={() => setPreviewProject(m.generatedProject)}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-current" /> Play
                  </button>
                  <button
                    onClick={() => downloadZip(m.generatedProject)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Download className="w-3 h-3 text-orange-400" /> Zip
                  </button>
                  <button
                    onClick={() => {
                      setEditProject(m.generatedProject);
                      setActiveFileContent(m.generatedProject.files[0]?.content || '');
                    }}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Edit3 className="w-3 h-3 text-purple-400" /> Edit
                  </button>
                  <button
                    onClick={() => handleContinue(m.generatedProject!.id)}
                    className="col-span-2 sm:col-span-1 p-1.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition shadow-md shadow-cyan-500/20"
                  >
                    <Rocket className="w-3 h-3 fill-current" /> Continue
                  </button>
                </div>
              </div>
            )}

            {m.role === 'assistant' && isStreaming && m === messages[messages.length - 1] && (
              <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
            )}

            {m.role === 'assistant' && m.text && !isStreaming && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => copyToClipboard(m.text, m.id)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 p-1"
                >
                  {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[10px]">{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3 bg-zinc-900/90 border border-cyan-500/40 rounded-2xl w-full max-w-sm flex flex-col gap-2 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs font-bold text-white tracking-wide">
                  {loadElapsed < 1
                    ? 'Analyzing...'
                    : loadElapsed < 2
                    ? 'Planning...'
                    : loadElapsed < 3
                    ? 'Generating...'
                    : loadElapsed < 4
                    ? 'Building...'
                    : loadElapsed < 5
                    ? 'Testing...'
                    : 'Completed.'}
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {loadElapsed}s
              </span>
            </div>

            {/* 6 Stage Progress Indicator */}
            <div className="grid grid-cols-6 gap-1 pt-1">
              {[
                { label: 'Analyzing', step: 1 },
                { label: 'Planning', step: 2 },
                { label: 'Generating', step: 3 },
                { label: 'Building', step: 4 },
                { label: 'Testing', step: 5 },
                { label: 'Completed', step: 6 },
              ].map((s) => {
                const currentStep =
                  loadElapsed < 1 ? 1 : loadElapsed < 2 ? 2 : loadElapsed < 3 ? 3 : loadElapsed < 4 ? 4 : loadElapsed < 5 ? 5 : 6;
                const isPassed = s.step <= currentStep;
                const isCurrent = s.step === currentStep;
                return (
                  <div key={s.label} className="flex flex-col gap-1 items-center">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'bg-cyan-400 animate-pulse'
                          : isPassed
                          ? 'bg-cyan-600'
                          : 'bg-zinc-800'
                      }`}
                    />
                    <span className="text-[8px] text-zinc-500 font-mono truncate max-w-full">
                      {s.label.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSend()}
              className="px-2 py-1 bg-red-800/60 hover:bg-red-700/60 text-white rounded text-[11px] font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 relative z-10 no-scrollbar">
        {[
          { label: '⚡ C++ Engine', prompt: 'Create a C++ high-performance engine with vector mathematics and Makefile' },
          { label: '🐍 Python Game', prompt: 'Create a Python space shooter game with alien swarms and laser upgrades' },
          { label: '📱 Flutter App', prompt: 'Create a Flutter cross-platform mobile app with modern Material 3 cards' },
          { label: '🤖 Kotlin Android', prompt: 'Create a Kotlin Android app with Jetpack Compose and Gradle script' },
          { label: '📱 Calculator App', prompt: 'Create a calculator app with responsive buttons and glass UI' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/40 text-[11px] text-zinc-300 hover:text-white whitespace-nowrap transition flex items-center gap-1 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3. Input Form */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-2xl flex gap-1.5 items-center shadow-xl focus-within:border-cyan-500/50 transition-colors relative z-10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <input
          className="flex-1 bg-transparent text-white px-3 py-1.5 focus:outline-none text-xs sm:text-sm placeholder:text-zinc-500"
          placeholder={uploadedFileName ? `Attached: ${uploadedFileName}...` : 'Ask Rock AI: create apps, Python games, or debug...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isStreaming}
        />

        {/* Voice Mode Button */}
        <button
          type="button"
          onClick={toggleVoiceMode}
          title={isVoiceActive ? 'Listening...' : 'Voice Mode'}
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            isVoiceActive ? 'bg-red-500/30 text-red-400 border border-red-500 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload File"
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition flex items-center justify-center"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Send / Stop Button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={handleStopStreaming}
            className="p-2 text-white bg-red-600 hover:bg-red-500 rounded-xl transition flex items-center justify-center"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2 text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition disabled:opacity-40 disabled:hover:bg-cyan-400 flex items-center justify-center shadow-md shadow-cyan-400/20"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* 4. MODALS FOR PREVIEW AND EDIT */}
      {previewProject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm h-[640px] flex flex-col overflow-hidden shadow-2xl">
            <div className="h-10 bg-black flex items-center justify-between px-4 border-b border-zinc-800">
              <span className="text-xs font-mono text-zinc-400">{previewProject.name} Emulator</span>
              <button onClick={() => setPreviewProject(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-black flex flex-col">
              <iframe
                title="Preview"
                className="w-full h-full border-none"
                srcDoc={
                  previewProject.files.find((f: FileNode) => f.name === 'index.html')?.content ||
                  `<div style="color:white;padding:20px;font-family:sans-serif;">Python CLI Mode active. Open Workspace Terminal to execute.</div>`
                }
              />
            </div>
            <div className="h-12 bg-black flex items-center justify-around px-4 border-t border-zinc-800">
              <button
                onClick={() => handleContinue(previewProject.id)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" /> Continue Development
              </button>
              <button
                onClick={() => downloadZip(previewProject)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Zip
              </button>
            </div>
          </div>
        </div>
      )}

      {editProject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl h-[550px] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{editProject.name} Source Editor</span>
              <button onClick={() => setEditProject(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-black p-4 overflow-hidden">
              <textarea
                value={activeFileContent}
                onChange={e => setActiveFileContent(e.target.value)}
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none"
              />
            </div>
            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setEditProject(null)}
                className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Close
              </button>
              <button
                onClick={() => { setEditProject(null); handleContinue(editProject.id); }}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" /> Continue Development
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
