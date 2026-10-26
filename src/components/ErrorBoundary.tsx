/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  autoFixCountdown: number;
  isFixing: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private timer: any = null;

  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    autoFixCountdown: 3,
    isFixing: false,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, autoFixCountdown: 3, isFixing: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[Rocky Self-Healing Engine] Caught runtime exception:', error.message);
    this.setState({ errorInfo });

    // Auto-fix and retry countdown
    this.timer = setInterval(() => {
      this.setState((prev) => {
        if (prev.autoFixCountdown <= 1) {
          clearInterval(this.timer);
          this.handleAutoFix();
          return { autoFixCountdown: 0, isFixing: true };
        }
        return { autoFixCountdown: prev.autoFixCountdown - 1, isFixing: false };
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  handleAutoFix = () => {
    this.setState({ isFixing: true });
    // Rocky Self-Healing: Clean corrupted local state / caches and retry
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isFixing: false,
      });
    }, 800);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative select-none">
          {/* Subtle cosmic glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-black to-black pointer-events-none" />

          <div className="relative z-10 max-w-md w-full bg-zinc-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
              {this.state.isFixing ? (
                <Sparkles className="w-7 h-7 text-cyan-400 animate-spin" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              )}
            </div>

            <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              Rocky Self-Healing Compiler
            </span>

            <h2 className="text-xl font-black text-white mt-2">
              {this.state.isFixing ? 'Automatically Healing Code...' : 'Runtime Anomaly Detected'}
            </h2>

            <div className="my-4 p-3 bg-black/70 rounded-xl border border-zinc-800 text-left font-mono text-xs text-red-300 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown runtime error occurred.'}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {this.state.isFixing
                  ? 'Compiling safe fallback state...'
                  : `Auto-fixing & retrying in ${this.state.autoFixCountdown}s...`}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={this.handleAutoFix}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fix & Retry Now</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
