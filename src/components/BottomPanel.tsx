/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { TerminalLine } from '../types';
import { 
  Terminal as TermIcon, FileText, Play, Square, RefreshCw, Trash2, 
  Settings, ExternalLink, ChevronRight, ShieldAlert, Plus, X, Loader2,
  Check, AlertCircle, Cpu, Shield, Globe, HardDrive, Filter
} from 'lucide-react';

interface TerminalLineTextProps {
  text: string;
  type: string;
  animate: boolean;
}

const TerminalLineText: React.FC<TerminalLineTextProps> = ({ text, type, animate }) => {
  const [displayedText, setDisplayedText] = useState(animate && type !== 'input' ? '' : text);
  const [isTyping, setIsTyping] = useState(animate && type !== 'input');

  useEffect(() => {
    if (!animate || type === 'input') {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let currentIdx = 0;
    const totalDuration = Math.min(350, text.length * 8);
    const intervalTime = 10;
    const steps = totalDuration / intervalTime;
    const charsPerStep = Math.max(1, Math.ceil(text.length / steps));

    setDisplayedText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (currentIdx < text.length) {
        const nextIdx = Math.min(text.length, currentIdx + charsPerStep);
        setDisplayedText(text.substring(0, nextIdx));
        currentIdx = nextIdx;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [text, type, animate]);

  const textClass = 
    type === 'error' ? 'text-rose-400 font-semibold text-shadow-red' :
    type === 'success' ? 'text-emerald-400 font-semibold text-shadow-green' :
    type === 'system' ? 'text-cyan-400 font-bold' :
    type === 'input' ? 'text-zinc-100 font-extrabold' :
    'text-zinc-400';

  return (
    <span className={`${textClass} relative tracking-wide`}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-orange-500 ml-0.5 animate-terminal-blink align-middle animate-pulse" />
      )}
    </span>
  );
};

interface TerminalTab {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lines: TerminalLine[];
  cliInput: string;
  currentDir: string;
  activeCommand?: string;
}

export const BottomPanel: React.FC = () => {
  const {
    activeProject,
    terminalLines,
    addTerminalLine,
    clearTerminal,
    consoleOutput,
    isPreviewRunning,
    runProject,
    stopProject,
    previewUrl
  } = useProject();

  // High-level main tabs
  const [activeMainTab, setActiveMainTab] = useState<'terminal' | 'build' | 'server' | 'preview'>('terminal');

  // Multi-tab concurrent terminal database
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    {
      id: 'term-bash',
      name: 'Interactive Bash',
      status: 'idle',
      lines: [
        { id: 'b-init-1', type: 'system', text: '[BASH] Multi-process virtual sandbox initialized on container port 3000.' },
        { id: 'b-init-2', type: 'success', text: '✓ rock-ai-engine v3.5 online. Parallel execution mode ACTIVE.' },
        { id: 'b-init-3', type: 'output', text: 'Type "help" to list mock tasks or trigger parallel runs.' },
        { id: 'b-init-4', type: 'output', text: 'rock-ai@container-3000:/workspace$' }
      ],
      cliInput: '',
      currentDir: '/workspace'
    },
    {
      id: 'term-install',
      name: 'npm install',
      status: 'success',
      lines: [
        { id: 'b-inst-1', type: 'input', text: 'npm install @google/genai lucide-react' },
        { id: 'b-inst-2', type: 'output', text: 'npm info it worked if it ends with ok' },
        { id: 'b-inst-3', type: 'output', text: 'npm http fetch GET 200 https://registry.npmjs.org/@google/genai' },
        { id: 'b-inst-4', type: 'output', text: 'npm http fetch GET 200 https://registry.npmjs.org/lucide-react' },
        { id: 'b-inst-5', type: 'output', text: 'added 42 packages and verified dependency nodes' },
        { id: 'b-inst-6', type: 'success', text: '✓ Dependencies compiled successfully! zero critical vulns.' },
        { id: 'b-inst-7', type: 'output', text: 'rock-ai@container-3000:/workspace$' }
      ],
      cliInput: '',
      currentDir: '/workspace'
    },
    {
      id: 'term-drizzle',
      name: 'Drizzle Sync',
      status: 'success',
      lines: [
        { id: 'b-driz-1', type: 'input', text: 'npx drizzle-kit push' },
        { id: 'b-driz-2', type: 'system', text: '[DRIZZLE] Connecting to Cloud SQL container db...' },
        { id: 'b-driz-3', type: 'output', text: 'Reading schema file: src/db/schema.ts' },
        { id: 'b-driz-4', type: 'success', text: '✓ DB schema structural check: in sync with zero pending migrations.' },
        { id: 'b-driz-5', type: 'output', text: 'rock-ai@container-3000:/workspace$' }
      ],
      cliInput: '',
      currentDir: '/workspace'
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('term-bash');

  // Hardcoded build & logging database
  const [buildLines, setBuildLines] = useState<TerminalLine[]>([
    { id: 'b-1', type: 'system', text: '[BUILD] Vite compiler engine initialized.' },
    { id: 'b-2', type: 'output', text: 'yarn run v1.22.19' },
    { id: 'b-3', type: 'output', text: '$ tsc && vite build' },
    { id: 'b-4', type: 'success', text: '✓ 124 TypeScript source files verified with zero type errors.' },
    { id: 'b-5', type: 'output', text: 'vite v5.2.11 building for production...' },
    { id: 'b-6', type: 'output', text: 'transforming (47) src/components/BottomPanel.tsx...' },
    { id: 'b-7', type: 'output', text: '✓ 241 modules transformed.' },
    { id: 'b-8', type: 'output', text: 'rendering chunks...' },
    { id: 'b-9', type: 'success', text: '✓ built in 1.48s' },
    { id: 'b-10', type: 'output', text: 'dist/index.html                     0.45 kB │ gzip:  0.28 kB' },
    { id: 'b-11', type: 'output', text: 'dist/assets/index-D7h28H1a.css      5.12 kB │ gzip:  1.34 kB' },
    { id: 'b-12', type: 'output', text: 'dist/assets/index-B9fH8aH2.js     142.10 kB │ gzip: 45.12 kB' },
    { id: 'b-13', type: 'success', text: 'Build completed successfully. Application is ready to run.' }
  ]);

  const [serverLogs, setServerLogs] = useState<TerminalLine[]>([
    { id: 's-1', type: 'system', text: '[SYSTEM] Connecting to Cloud Platform services...' },
    { id: 's-2', type: 'success', text: '[SYSTEM] Connected to firestore.googleapis.com (ID: rock-ai-dev-db)' },
    { id: 's-3', type: 'output', text: '[SYSTEM] Applied Firestore Security Rules: default locked' },
    { id: 's-4', type: 'output', text: '[SYSTEM] Syncing local workspace files...' },
    { id: 's-5', type: 'success', text: '[SYSTEM] 18 files synchronized with remote Cloud Run instance.' },
    { id: 's-6', type: 'output', text: '[SYSTEM] Real-time collaboration websocket online.' },
    { id: 's-7', type: 'system', text: '[SYSTEM] Active collaborators: Sarah Dev (UI Specialist), Michael QA (Testing).' }
  ]);

  // Server logs severities filter
  const [logsFilter, setLogsFilter] = useState<'all' | 'system' | 'success' | 'error' | 'output'>('all');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLPreElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const animatedLineIds = useRef<Set<string>>(new Set());

  const prevIsPreviewRunning = useRef(isPreviewRunning);
  const prevActiveProject = useRef<string | null>(activeProject?.id || null);

  // Active terminal tab
  const activeTerminal = terminalTabs.find(t => t.id === activeTabId) || terminalTabs[0];

  useEffect(() => {
    // Sync runtime logs when server runs/stops
    if (isPreviewRunning && !prevIsPreviewRunning.current) {
      const nowStr = new Date().toLocaleTimeString();
      
      setBuildLines(prev => [
        ...prev,
        { id: `b-run-${Date.now()}-1`, type: 'input', text: 'yarn run dev' },
        { id: `b-run-${Date.now()}-2`, type: 'output', text: `[${nowStr}] tsc --noEmit` },
        { id: `b-run-${Date.now()}-3`, type: 'success', text: `[${nowStr}] ✓ TypeScript compile check passed.` },
        { id: `b-run-${Date.now()}-4`, type: 'output', text: `[${nowStr}] vite` },
        { id: `b-run-${Date.now()}-5`, type: 'success', text: `[${nowStr}] ✓ Bundling ready for dev server.` }
      ]);

      setServerLogs(prev => [
        ...prev,
        { id: `s-run-${Date.now()}-1`, type: 'system', text: `[SYSTEM] [${nowStr}] Starting dev process node...` },
        { id: `s-run-${Date.now()}-2`, type: 'success', text: `[VITE] Dev server listening on port 3000 (http://localhost:3000)` },
        { id: `s-run-${Date.now()}-3`, type: 'output', text: `[${nowStr}] [VITE] compiled 47 bundles in 412ms` },
        { id: `s-run-${Date.now()}-4`, type: 'output', text: `[${nowStr}] [RUNTIME] GET /index.html 200 OK - 8.12ms` },
        { id: `s-run-${Date.now()}-5`, type: 'output', text: `[${nowStr}] [RUNTIME] GET /src/main.tsx 200 OK - 2.45ms` },
        { id: `s-run-${Date.now()}-6`, type: 'output', text: `[${nowStr}] [RUNTIME] GET /src/App.tsx 200 OK - 4.10ms` }
      ]);

      // Push active notification
      addTerminalLine('[VITE] Running dev server at http://localhost:3000', 'success');
    } else if (!isPreviewRunning && prevIsPreviewRunning.current) {
      const nowStr = new Date().toLocaleTimeString();
      setServerLogs(prev => [
        ...prev,
        { id: `s-stop-${Date.now()}`, type: 'error', text: `[${nowStr}] [RUNTIME] Dev server stopped. SIGTERM received.` }
      ]);
    }
    prevIsPreviewRunning.current = isPreviewRunning;
  }, [isPreviewRunning]);

  useEffect(() => {
    if (activeProject && activeProject.id !== prevActiveProject.current) {
      const nowStr = new Date().toLocaleTimeString();
      setServerLogs(prev => [
        ...prev,
        { id: `s-proj-${Date.now()}-1`, type: 'system', text: `[SYSTEM] [${nowStr}] Switched active workspace to: ${activeProject.name}` },
        { id: `s-proj-${Date.now()}-2`, type: 'output', text: `[SYSTEM] Loaded database configuration: ${activeProject.template} sandbox` }
      ]);
      prevActiveProject.current = activeProject.id;
    } else if (!activeProject) {
      prevActiveProject.current = null;
    }
  }, [activeProject]);

  // Keep terminal shell scrolled down
  useEffect(() => {
    if (terminalEndRef.current) {
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [activeTerminal.lines.length, activeTabId, activeMainTab]);

  // Keep server logs scrolled down
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serverLogs.length, logsFilter, activeMainTab]);

  // Create a brand new custom concurrent terminal shell tab
  const handleAddNewTerminalTab = () => {
    const newId = `term-${Date.now()}`;
    const nextIndex = terminalTabs.length + 1;
    const newTab: TerminalTab = {
      id: newId,
      name: `bash (${nextIndex})`,
      status: 'idle',
      lines: [
        { id: `b-new-${Date.now()}-1`, type: 'system', text: `[SHELL] Session ${nextIndex} spawned successfully.` },
        { id: `b-new-${Date.now()}-2`, type: 'output', text: 'Standard POSIX compliant cloud container prompt ready.' },
        { id: `b-new-${Date.now()}-3`, type: 'output', text: 'rock-ai@container-3000:/workspace$' }
      ],
      cliInput: '',
      currentDir: '/workspace'
    };
    setTerminalTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Close and terminate a custom terminal shell tab
  const handleCloseTerminalTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (terminalTabs.length <= 1) return; // Prevent terminating last shell tab
    const activeIndex = terminalTabs.findIndex(t => t.id === activeTabId);
    const updatedTabs = terminalTabs.filter(t => t.id !== id);
    setTerminalTabs(updatedTabs);
    if (activeTabId === id) {
      const nextActiveIndex = Math.max(0, activeIndex - 1);
      setActiveTabId(updatedTabs[nextActiveIndex].id);
    }
  };

  // Asynchronous parallel execution engine
  const handleCommandExecution = (targetId: string, cmdStr: string) => {
    if (!cmdStr.trim()) return;
    const cmd = cmdStr.trim();
    const cmdLower = cmd.toLowerCase();

    // 1. Add user command line to active terminal log
    setTerminalTabs(prev => prev.map(tab => {
      if (tab.id !== targetId) return tab;
      const updatedLines = [...tab.lines];
      updatedLines.push({ id: `user-cmd-${Date.now()}`, type: 'input', text: cmd });
      return {
        ...tab,
        lines: updatedLines,
        cliInput: '',
        status: 'running',
        activeCommand: cmd
      };
    }));

    // 2. Simulate task running asynchronously
    setTimeout(() => {
      let outputLines: TerminalLine[] = [];
      let nextStatus: 'success' | 'error' | 'idle' = 'success';

      if (cmdLower === 'help') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'system', text: 'Available commands on Rock AI Interactive Shell:' },
          { id: `r-${Date.now()}-2`, type: 'output', text: '  help              - List all executable sandbox triggers' },
          { id: `r-${Date.now()}-3`, type: 'output', text: '  clear             - Clear output buffer' },
          { id: `r-${Date.now()}-4`, type: 'output', text: '  npm run dev       - Launch application developer preview' },
          { id: `r-${Date.now()}-5`, type: 'output', text: '  npm install <pkg> - Install standard npm packages dynamically' },
          { id: `r-${Date.now()}-6`, type: 'output', text: '  npm run build     - Bundle optimized production code packages' },
          { id: `r-${Date.now()}-7`, type: 'output', text: '  npm run lint      - Scan TypeScript typing nodes & static layout' },
          { id: `r-${Date.now()}-8`, type: 'output', text: '  git status        - Inspect workspace modified file states' },
          { id: `r-${Date.now()}-9`, type: 'output', text: '  git commit        - Complete file changes with AI description' },
          { id: `r-${Date.now()}-10`, type: 'output', text: '  docker stats       - Query container processor load & RAM metrics' }
        ];
      } else if (cmdLower === 'clear') {
        setTerminalTabs(prev => prev.map(tab => {
          if (tab.id !== targetId) return tab;
          return {
            ...tab,
            status: 'idle',
            activeCommand: undefined,
            lines: [{ id: `clr-${Date.now()}`, type: 'output', text: 'rock-ai@container-3000:/workspace$' }]
          };
        }));
        return;
      } else if (cmdLower === 'npm run dev' || cmdLower === 'npm dev') {
        runProject();
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'system', text: '[VITE] Starting development environment...' },
          { id: `r-${Date.now()}-2`, type: 'success', text: '✓ Dev Server is active at http://localhost:3000' }
        ];
      } else if (cmdLower.startsWith('npm install')) {
        const pkg = cmd.substring(11).trim() || 'lodash';
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'output', text: `yarn add v1.22.19 - fetching package info: ${pkg}` },
          { id: `r-${Date.now()}-2`, type: 'output', text: 'resolving peer packages & linking modules...' },
          { id: `r-${Date.now()}-3`, type: 'system', text: `[PROGRESS] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 85% node package downloaded` },
          { id: `r-${Date.now()}-4`, type: 'success', text: `✓ successfully integrated package "${pkg}" into package.json.` }
        ];
      } else if (cmdLower === 'npm run build' || cmdLower === 'npm build') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'system', text: '[BUILD] Bundling assets with production flags...' },
          { id: `r-${Date.now()}-2`, type: 'output', text: 'tsc --noEmit: zero syntactic errors' },
          { id: `r-${Date.now()}-3`, type: 'output', text: 'dist/assets/index-B9fH8aH2.js     142.10 kB' },
          { id: `r-${Date.now()}-4`, type: 'success', text: '✓ Bundling optimization built successfully in 1.12s.' }
        ];
      } else if (cmdLower === 'npm run lint' || cmdLower === 'npm lint') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'system', text: '[LINT] Checking type safety & styling formatting rules...' },
          { id: `r-${Date.now()}-2`, type: 'success', text: '✓ Linter audit: zero pending errors or warnings.' }
        ];
      } else if (cmdLower === 'git status') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'output', text: 'On branch main (origin/main)' },
          { id: `r-${Date.now()}-2`, type: 'system', text: 'Uncommitted file changes in workspace:' },
          { id: `r-${Date.now()}-3`, type: 'output', text: '  modified:   src/components/BottomPanel.tsx' },
          { id: `r-${Date.now()}-4`, type: 'output', text: 'use "git commit" to save changes' }
        ];
      } else if (cmdLower === 'git commit') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'success', text: '[main a8c2e1f] git commit: integrated dynamic multi-tab bash console' },
          { id: `r-${Date.now()}-2`, type: 'output', text: ' 1 file updated, 248 insertions, 14 deletions' }
        ];
      } else if (cmdLower === 'docker stats') {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'system', text: 'CONTAINER ID   NAME             CPU %     MEM USAGE / LIMIT     NET I/O' },
          { id: `r-${Date.now()}-2`, type: 'success', text: 'rock-ai-3000   node-sandbox     0.18%     82.4MiB / 512MiB      128kB / 18kB' }
        ];
      } else {
        outputLines = [
          { id: `r-${Date.now()}-1`, type: 'error', text: `bash: command not found: ${cmd}` },
          { id: `r-${Date.now()}-2`, type: 'system', text: 'Type "help" to see available mock operations.' }
        ];
        nextStatus = 'error';
      }

      setTerminalTabs(prev => prev.map(tab => {
        if (tab.id !== targetId) return tab;
        const finalLines = [...tab.lines, ...outputLines];
        const pathSuffix = activeProject ? `/workspace/${activeProject.name.toLowerCase().replace(/\s+/g, '-')}` : '~';
        finalLines.push({ id: `prompt-${Date.now()}`, type: 'output', text: `rock-ai@container-3000:${pathSuffix}$` });
        return {
          ...tab,
          status: nextStatus,
          lines: finalLines,
          activeCommand: undefined
        };
      }));
    }, 1100);
  };

  const handleClearCurrentActiveTab = () => {
    if (activeMainTab === 'terminal') {
      setTerminalTabs(prev => prev.map(tab => {
        if (tab.id !== activeTabId) return tab;
        return {
          ...tab,
          status: 'idle',
          activeCommand: undefined,
          lines: [{ id: `prompt-${Date.now()}`, type: 'output', text: `rock-ai@container-3000:/workspace$` }]
        };
      }));
    } else if (activeMainTab === 'build') {
      setBuildLines([]);
    } else if (activeMainTab === 'server') {
      setServerLogs([]);
    }
  };

  // Filtered server logs
  const filteredServerLogs = serverLogs.filter(log => {
    if (logsFilter === 'all') return true;
    return log.type === logsFilter;
  });

  return (
    <div className="h-68 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 flex flex-col min-h-0 relative z-20 select-text">
      
      {/* Primary Navigation Address Tabs */}
      <div className="h-10 border-b border-zinc-900/60 bg-zinc-950/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMainTab('terminal')}
            className={`h-10 px-4 text-xs font-semibold flex items-center gap-2 transition-all relative border-b-2 ${
              activeMainTab === 'terminal'
                ? 'text-orange-400 border-orange-500 bg-zinc-900/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            <TermIcon className="w-3.5 h-3.5" />
            <span>Bash Shells</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[9px] text-zinc-400 border border-zinc-800 font-bold">
              {terminalTabs.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveMainTab('build')}
            className={`h-10 px-4 text-xs font-semibold flex items-center gap-2 transition-all relative border-b-2 ${
              activeMainTab === 'build'
                ? 'text-orange-400 border-orange-500 bg-zinc-900/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Build Outputs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            onClick={() => setActiveMainTab('server')}
            className={`h-10 px-4 text-xs font-semibold flex items-center gap-2 transition-all relative border-b-2 ${
              activeMainTab === 'server'
                ? 'text-orange-400 border-orange-500 bg-zinc-900/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Server Logs</span>
            {isPreviewRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('preview')}
            className={`h-10 px-4 text-xs font-semibold flex items-center gap-2 transition-all relative border-b-2 ${
              activeMainTab === 'preview'
                ? 'text-orange-400 border-orange-500 bg-zinc-900/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Console Action Panel shortcuts */}
        <div className="flex items-center gap-2">
          {activeMainTab !== 'preview' && (
            <button
              onClick={handleClearCurrentActiveTab}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-zinc-900/50 hover:border-zinc-800 transition-all cursor-pointer"
              title="Flush Active Log Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {activeMainTab === 'preview' && (
            <div className="flex items-center gap-1.5">
              {isPreviewRunning ? (
                <button
                  onClick={stopProject}
                  className="h-7 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/40 text-rose-400 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Shut Down Dev Server"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Server</span>
                </button>
              ) : (
                <button
                  onClick={runProject}
                  className="h-7 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Launch Dev Server"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Serve Preview</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Tab Body Area */}
      <div className="flex-1 min-h-0 bg-black relative">
        
        {/* CRT vintage scanline effects */}
        <div className="crt-overlay" />
        <div className="crt-scanline animate-scanline" />

        {/* TAB 1: BASH CONCURRENT TERMINALS */}
        {activeMainTab === 'terminal' && (
          <div className="h-full flex flex-col font-mono text-[11px] leading-relaxed text-zinc-300 text-left relative overflow-hidden">
            
            {/* Secondary Horizontal Sub-Tab Bar for Shell Sessions */}
            <div className="flex items-center justify-between border-b border-zinc-900/60 bg-zinc-950/60 px-3 py-1 flex-shrink-0 z-10 select-none">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[85%] py-0.5">
                {terminalTabs.map(tab => {
                  const isActive = tab.id === activeTabId;
                  const isRunning = tab.status === 'running';
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`h-7 px-2.5 rounded-lg flex items-center gap-2 text-[10px] font-semibold cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-zinc-900 text-orange-400 border-orange-500/30 font-bold shadow-[0_0_8px_rgba(249,115,22,0.05)]'
                          : 'text-zinc-500 hover:text-zinc-300 bg-transparent border-transparent'
                      }`}
                    >
                      {isRunning ? (
                        <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                      ) : tab.status === 'success' ? (
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      ) : tab.status === 'error' ? (
                        <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      ) : (
                        <TermIcon className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      )}
                      
                      <span className="truncate max-w-[80px]">{tab.name}</span>
                      
                      {terminalTabs.length > 1 && (
                        <button
                          onClick={(e) => handleCloseTerminalTab(tab.id, e)}
                          className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                <button
                  onClick={handleAddNewTerminalTab}
                  className="h-6 w-6 rounded-lg border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-1"
                  title="Spawn Concurrent Shell Tab"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-600 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span>tty-bash-sandbox</span>
              </div>
            </div>

            {/* Active Terminal Shell Lines */}
            <div className="flex-1 space-y-1 overflow-y-auto p-4 pr-2 z-10 relative animate-crt-flicker">
              {activeTerminal.lines.map((line, idx) => {
                const alreadyAnimated = animatedLineIds.current.has(line.id);
                if (!alreadyAnimated) {
                  animatedLineIds.current.add(line.id);
                }
                const shouldAnimate = !alreadyAnimated;

                return (
                  <div key={line.id || idx} className="flex items-start gap-1">
                    {line.type === 'input' && (
                      <ChevronRight className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                    )}
                    <TerminalLineText text={line.text} type={line.type} animate={shouldAnimate} />
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Prompt Form & Preset shortcuts */}
            <div className="z-10 relative flex-shrink-0 flex flex-col border-t border-zinc-900 pt-2 p-3 bg-zinc-950/30">
              
              {/* Interactive prompt form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!activeTerminal.cliInput.trim()) return;
                  handleCommandExecution(activeTabId, activeTerminal.cliInput);
                }} 
                className="flex items-center gap-1.5"
              >
                <span className="text-orange-500 font-extrabold flex-shrink-0">
                  rock-ai@container-3000:{activeTerminal.currentDir}$
                </span>
                <input
                  type="text"
                  value={activeTerminal.cliInput}
                  onChange={(e) => {
                    const txt = e.target.value;
                    setTerminalTabs(prev => prev.map(tab => {
                      if (tab.id !== activeTabId) return tab;
                      return { ...tab, cliInput: txt };
                    }));
                  }}
                  disabled={activeTerminal.status === 'running'}
                  placeholder={activeTerminal.status === 'running' ? 'Process executing in parallel background...' : 'Type "help" or run any script commands...'}
                  className="bg-transparent focus:outline-none text-zinc-200 w-full caret-orange-500 text-[11px] tracking-wider font-mono disabled:opacity-55"
                  autoFocus
                />
              </form>

              {/* Quick runnable preset buttons */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] text-zinc-500">
                <span className="uppercase font-bold tracking-wider mr-1 text-zinc-600">Quick Runs:</span>
                {[
                  { label: 'npm dev', cmd: 'npm run dev' },
                  { label: 'npm install', cmd: 'npm install' },
                  { label: 'lint code', cmd: 'npm run lint' },
                  { label: 'vite build', cmd: 'npm run build' },
                  { label: 'git status', cmd: 'git status' },
                  { label: 'sys stats', cmd: 'docker stats' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (activeTerminal.status !== 'running') {
                        handleCommandExecution(activeTabId, preset.cmd);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 hover:text-orange-400 transition-all font-mono tracking-wide uppercase cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COMPILED BUILD OUTPUTS */}
        {activeMainTab === 'build' && (
          <div className="h-full flex flex-col font-mono text-[11px] text-zinc-400 text-left relative overflow-hidden select-text p-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3 z-10 relative select-none">
              <span className="uppercase font-bold tracking-widest text-zinc-500 text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Compiler Bundler Telemetry</span>
              </span>
              <span className="text-[9px] uppercase text-zinc-600 font-bold">Vite Core Server Node</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 relative z-10">
              {buildLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className={`text-[10px] font-bold ${
                    line.type === 'error' ? 'text-rose-400' :
                    line.type === 'success' ? 'text-emerald-400' :
                    line.type === 'system' ? 'text-cyan-400' :
                    'text-zinc-500'
                  }`}>
                    {line.type.toUpperCase()}:
                  </span>
                  <span className="text-zinc-300 font-semibold">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SERVER RUNTIME TELEMETRY LOGS */}
        {activeMainTab === 'server' && (
          <div className="h-full flex flex-col font-mono text-[11px] text-zinc-400 text-left relative overflow-hidden select-text p-4">
            
            {/* Severity Filter Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3 z-10 relative select-none">
              <div className="flex items-center gap-4">
                <span className="uppercase font-bold tracking-widest text-zinc-500 text-[10px] flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPreviewRunning ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`} />
                  <span>Interactive Server Stream</span>
                </span>
                
                {/* Level Select Filters */}
                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 border border-zinc-900 rounded-lg">
                  <Filter className="w-3 h-3 text-zinc-500" />
                  {(['all', 'system', 'success', 'error', 'output'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLogsFilter(lvl)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                        logsFilter === lvl
                          ? 'bg-zinc-800 text-orange-400'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-[9px] uppercase text-zinc-600 font-bold">Secure SSL Log Socket</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 relative z-10">
              {filteredServerLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className={`text-[10px] uppercase tracking-wide font-bold flex-shrink-0 ${
                    log.type === 'error' ? 'text-rose-400' :
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'system' ? 'text-cyan-400' :
                    'text-zinc-600'
                  }`}>
                    [{log.type}]
                  </span>
                  <span className="text-zinc-300 font-semibold">{log.text}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* TAB 4: LIVE WEB PREVIEW IFRAME */}
        {activeMainTab === 'preview' && (
          <div className="h-full bg-zinc-900 flex flex-col relative select-text">
            {isPreviewRunning && previewUrl ? (
              <iframe
                src={previewUrl}
                title="Rock AI Cloud Sandbox Preview"
                className="w-full flex-1 bg-black border-none"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-black">
                <ShieldAlert className="w-10 h-10 text-orange-500 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-200">Local virtual node stopped</h4>
                  <p className="text-[11px] text-zinc-500 max-w-sm mt-1">
                    Press **Serve Preview** above or run `npm run dev` inside active Shell tab to start.
                  </p>
                </div>
                <button
                  onClick={runProject}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-95 cursor-pointer font-sans"
                >
                  Serve Live Sandbox
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
