/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  color: string; // Used for multi-user collaboration indicators (e.g. active cursor borders)
  isOnline?: boolean;
}

export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface Version {
  id: string;
  timestamp: string;
  commitMessage: string;
  filesState: Record<string, string>; // Maps fileId to content at this commit version
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: 'React' | 'Next.js' | 'Express' | 'Python' | 'FastAPI' | 'Flutter' | 'HTML/CSS/JS' | 'C/C++' | 'Kotlin' | 'Rust' | string;
  createdAt: string;
  updatedAt: string;
  files: FileNode[];
  versionHistory: Version[];
  activeUsers: User[];
}

export interface Tab {
  id: string; // Equal to fileId
  name: string;
  path: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeBlock?: {
    code: string;
    language: string;
    filePath?: string;
  };
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt?: string;
  points: number;
  badgeColor: string;
}

export interface BuildReport {
  id: string;
  projectName: string;
  timestamp: string;
  status: 'stable' | 'optimised' | 'warning' | 'error';
  diagnostics: {
    scannedFiles: number;
    issuesFound: number;
    issuesHealed: number;
    buildDurationMs: number;
  };
  details: {
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'success';
  }[];
  optimisations: string[];
}

export interface QuantumShard {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  glowColor: string;
  icon: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  installed: boolean;
}


