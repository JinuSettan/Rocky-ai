/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Login } from './components/Login';
import { RockAIContainer } from './components/RockAIContainer';
import { CosmicBackground } from './components/CosmicBackground';
import { Workspace } from './components/Workspace';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArrowLeft } from 'lucide-react';

function MainApp() {
  const { activeProject } = useProject();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [viewMode, setViewMode] = useState<'os' | 'workspace'>('os');

  if (!user) {
    return <Login onLoginSuccess={(username, email) => setUser({ username, email })} />;
  }

  if (viewMode === 'workspace' && activeProject) {
    return (
      <div className="h-screen w-full bg-black text-white relative flex flex-col">
        {/* Navigation Banner: Return to Rock AI OS (3 Pages) */}
        <div className="h-10 bg-zinc-950/95 border-b border-cyan-500/30 px-4 flex items-center justify-between z-50 text-xs select-none">
          <button
            onClick={() => setViewMode('os')}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Return to Rock AI OS (3 Pages)</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">Active Project:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs font-semibold">
              {activeProject.name}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              {activeProject.template}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Workspace />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent text-white relative">
      <RockAIContainer onOpenWorkspace={() => setViewMode('workspace')} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProjectProvider>
        <CosmicBackground />
        <MainApp />
      </ProjectProvider>
    </ErrorBoundary>
  );
}
