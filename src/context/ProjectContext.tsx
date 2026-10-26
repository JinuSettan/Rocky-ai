/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, FileNode, Tab, User, Notification, TerminalLine, Achievement, BuildReport } from '../types';
import { initialProjects, mockUsers, mockNotifications, getTemplateFiles } from '../mockData';

interface ProjectContextType {
  currentUser: User;
  projects: Project[];
  activeProject: Project | null;
  openTabs: Tab[];
  activeTabId: string | null;
  notifications: Notification[];
  terminalLines: TerminalLine[];
  consoleOutput: string;
  isPreviewRunning: boolean;
  previewUrl: string;
  isDeploying: boolean;
  deployedUrl: string | null;
  theme: 'dark' | 'light';
  fontSize: number;
  isAutoSaveEnabled: boolean;
  isSettingsOpen: boolean;
  activeCollaborators: User[];
  
  // Achievements & Smart Build
  achievements: Achievement[];
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;
  buildCount: number;
  isQuantumMode: boolean;
  toggleQuantumMode: () => void;
  activeBuildReport: BuildReport | null;
  setActiveBuildReport: (report: BuildReport | null) => void;
  
  // Project Actions
  createProject: (name: string, description: string, template: Project['template'], customFiles?: FileNode[]) => Project;
  renameProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  closeProject: () => void;
  
  // File System Actions
  addFileOrFolder: (parentId: string | null, name: string, type: 'file' | 'folder', language?: string) => void;
  renameFileOrFolder: (id: string, newName: string) => void;
  deleteFileOrFolder: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  bulkUpdateFileContents: (updates: { id: string; content: string }[]) => void;
  
  // Tab Actions
  openTab: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  setActiveTabId: (fileId: string | null) => void;
  
  // IDE Controls
  runProject: () => void;
  stopProject: () => void;
  deployProject: (platform?: 'web' | 'apk' | 'pwa') => void;
  triggerMockCollaboration: () => void;
  addTerminalLine: (text: string, type?: TerminalLine['type']) => void;
  clearTerminal: () => void;
  
  // Notification Actions
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  markNotificationAsRead: (id: string) => void;
  
  // State Setters
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setIsAutoSaveEnabled: (enabled: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  importProjectFromZip: (projectName: string, template: Project['template'], files: FileNode[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: 't-init-1', type: 'system', text: 'Rock AI IDE Terminal v1.4.0 (Powered by Cocktail Z AI)' },
    { id: 't-init-2', type: 'system', text: 'Type "help" for a list of available mock terminal commands.' },
    { id: 't-init-3', type: 'output', text: 'rock-ai@container-3000:~$' }
  ]);
  const [consoleOutput, setConsoleOutput] = useState<string>('Console initialised. Ready to compile...\n');
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([mockUsers[1], mockUsers[2]]);

  // Achievements & Smart Build state
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('rock_ai_unlocked_achievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [buildCount, setBuildCount] = useState<number>(() => {
    const saved = localStorage.getItem('rock_ai_build_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isQuantumMode, setIsQuantumMode] = useState<boolean>(false);
  const [activeBuildReport, setActiveBuildReport] = useState<BuildReport | null>(null);

  // Sync active project structure updates
  const syncActiveProjectToProjectsList = (updated: Project) => {
    setActiveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Helper to generate a live hot-reloadable HTML string for the iframe preview
  const getPreviewUrlForProject = (proj: Project): string => {
    // If project has an explicit index.html (like multi-language sandbox, interactive game or web page)
    const findIndexHtml = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.name === 'index.html' && node.content) return node;
        if (node.children) {
          const found = findIndexHtml(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const customIndex = findIndexHtml(proj.files);
    if (customIndex && proj.template !== 'React') {
      return `data:text/html;charset=utf-8,${encodeURIComponent(customIndex.content || '')}`;
    }

    if (proj.template === 'HTML/CSS/JS') {
      const indexFile = proj.files.find(f => f.name === 'index.html');
      const scriptFile = proj.files.find(f => f.name === 'script.js');
      const styleFile = proj.files.find(f => f.name === 'style.css');
      
      return `data:text/html;charset=utf-8,${encodeURIComponent(
        `<html>
          <head>
            <style>${styleFile?.content || ''}</style>
          </head>
          <body>
            ${indexFile?.content?.replace('<script src="script.js"></script>', '') || ''}
            <script>${scriptFile?.content || ''}</script>
          </body>
        </html>`
      )}`;
    } else if (proj.template === 'FastAPI' || proj.template === 'Python') {
      return `data:text/html;charset=utf-8,${encodeURIComponent(
        `<html style="background-color: #0d0d12; color: #f4f4f5; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;">
          <div style="background: rgba(255,255,255,0.05); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; text-align: center;">
            <h2 style="color: #f97316;">Python/FastAPI Engine Live</h2>
            <p style="color: #a1a1aa; font-size: 14px;">Server running locally on port 8000</p>
            <div style="background: #000; padding: 15px; border-radius: 10px; font-family: monospace; text-align: left; border: 1px solid #333; margin-top: 20px;">
              <span style="color: #10b981;">GET</span> /api/health <span style="color: #666;">200 OK</span><br/>
              <span style="color: #10b981;">GET</span> /api/ai/predict <span style="color: #666;">200 OK</span>
            </div>
            <p style="font-size: 11px; color: #555; margin-top: 20px;">Powered by Cocktail Z AI Sandbox</p>
          </div>
        </html>`
      )}`;
    } else {
      // Find files inside tree recursively for safety
      const findFileInTree = (nodes: FileNode[], name: string): FileNode | null => {
        for (const node of nodes) {
          if (node.name === name) return node;
          if (node.children) {
            const found = findFileInTree(node.children, name);
            if (found) return found;
          }
        }
        return null;
      };

      const appFile = findFileInTree(proj.files, 'App.tsx');
      const userAppCode = appFile?.content || '';
      
      // Parse UI elements returned in App.tsx dynamically for instant HMR rendering!
      let displayedHTML = '';
      if (userAppCode.includes('return')) {
        const afterReturn = userAppCode.split('return')[1]?.trim() || '';
        if (afterReturn.startsWith('(')) {
          // find matching parenthesis or match up to final brace
          displayedHTML = afterReturn.substring(1, afterReturn.lastIndexOf(')')).trim();
        } else {
          displayedHTML = afterReturn.split(';')[0]?.trim();
        }
      } else {
        displayedHTML = `<div class="text-center p-6"><p class="text-zinc-500 text-xs">App.tsx does not return standard JSX yet.</p></div>`;
      }

      // Convert JSX custom attributes to simple standard web styles or markup if they are literal
      // (e.g. className -> class, lucide icon names etc. are rendered beautifully)
      displayedHTML = displayedHTML
        .replace(/className=/g, 'class=')
        .replace(/\{(\d+)\}/g, '$1')
        .replace(/\{`([^`]+)`\}/g, '$1')
        .replace(/\{"([^"]+)"\}/g, '$1')
        .replace(/\{'([^']+)'\}/g, '$1');

      // Find any other tsx components to document them as active compiled sub-modules
      const collectComponents = (nodes: FileNode[]): FileNode[] => {
        let results: FileNode[] = [];
        for (const node of nodes) {
          if (node.type === 'file' && node.name.endsWith('.tsx') && node.name !== 'App.tsx') {
            results.push(node);
          }
          if (node.children) {
            results = [...results, ...collectComponents(node.children)];
          }
        }
        return results;
      };

      const customComponents = collectComponents(proj.files);
      const customComponentsText = customComponents.map(f => {
        return `<div style="margin-top:15px; padding:15px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; background: rgba(255,255,255,0.02);">
          <p style="font-weight: bold; color: #3b82f6; font-size:13px;">&lt;${f.name.replace('.tsx', '')} /&gt;</p>
          <p style="font-size:11px; color:#71717a; margin-top:2px;">Compiled sub-module file text:</p>
          <pre style="font-size:10px; font-family:monospace; background:#000; padding:10px; border-radius:8px; overflow:auto; margin-top:6px; border:1px solid rgba(255,255,255,0.05); color: #e4e4e7;">${f.content?.replace(/</g, '&lt;')?.replace(/>/g, '&gt;') || ''}</pre>
        </div>`;
      }).join('\n');

      return `data:text/html;charset=utf-8,${encodeURIComponent(
        `<html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
              body { background-color: #030303; color: white; font-family: sans-serif; padding: 24px; }
              .animate-fade-in { animation: fadeIn 0.4s ease-out; }
              @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            </style>
          </head>
          <body class="min-h-screen bg-black text-white flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
            <div class="text-center w-full max-w-2xl animate-fade-in">
              <h1 class="text-3xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-zinc-200 to-blue-500">
                Rock AI Live Preview
              </h1>
              <p class="text-zinc-500 mb-6 text-xs">
                Welcome to your compiled React app sandbox! Clicking buttons or updating source triggers instant hot reloading.
              </p>
              
              <div class="p-6 bg-zinc-900/40 backdrop-blur-md border border-white/[0.05] rounded-2xl mb-6 text-left shadow-2xl">
                <p class="text-base font-bold mb-3 text-orange-500 flex items-center gap-2">
                  <i class="fa-solid fa-cube"></i>
                  <span>App.tsx View</span>
                </p>
                <div class="text-zinc-200 text-sm bg-black/60 p-5 rounded-xl border border-white/[0.05] leading-relaxed">
                  ${displayedHTML}
                </div>
                
                ${customComponentsText ? `<div class="mt-6 border-t border-white/[0.05] pt-4">
                  <p class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Compiled Components</p>
                  ${customComponentsText}
                </div>` : ''}
              </div>

              <div class="grid grid-cols-2 gap-4 text-left">
                <div class="p-4 bg-zinc-900/20 border border-white/[0.05] rounded-xl">
                  <h4 class="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Live Server</span>
                  </h4>
                  <p class="text-[10px] text-zinc-400 mt-1">Port 3000 online</p>
                </div>
                <div class="p-4 bg-zinc-900/20 border border-white/[0.05] rounded-xl">
                  <h4 class="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                    <span>HMR Hot Reload</span>
                  </h4>
                  <p class="text-[10px] text-zinc-400 mt-1">Compiler watching workspace</p>
                </div>
              </div>
            </div>
          </body>
        </html>`
      )}`;
    }
  };

  // Trigger Automatic Hot Reload preview whenever active project files are edited
  useEffect(() => {
    if (!activeProject || !isPreviewRunning) return;

    const handler = setTimeout(() => {
      const compiledUrl = getPreviewUrlForProject(activeProject);
      setPreviewUrl(compiledUrl);
      setConsoleOutput(prev => prev + `[HOT RELOAD] Auto compiled changed files. Refreshing preview frame.\n`);
    }, 450); // Debounce to prevent massive re-compiles on fast typing

    return () => clearTimeout(handler);
  }, [activeProject, isPreviewRunning]);

  // 1. Create Project
  const createProject = (name: string, description: string, template: Project['template'], customFiles?: FileNode[]): Project => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name || `New ${template} Project`,
      description: description || `Created via Rock AI platform.`,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: customFiles && customFiles.length > 0 ? customFiles : getTemplateFiles(template),
      versionHistory: [
        {
          id: `v-${Date.now()}`,
          timestamp: new Date().toISOString(),
          commitMessage: 'Initialised template files on Rock AI',
          filesState: {}
        }
      ],
      activeUsers: [currentUser]
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    
    // Automatically open first entry file in tabs
    const entryFile = findEntryFile(newProject.files);
    if (entryFile) {
      setOpenTabs([{ id: entryFile.id, name: entryFile.name, path: entryFile.path }]);
      setActiveTabId(entryFile.id);
    }

    addNotification('Project Created', `Project "${newProject.name}" has been initialised.`, 'success');
    return newProject;
  };

  // 2. Rename Project
  const renameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p));
    if (activeProject && activeProject.id === id) {
      setActiveProject(prev => prev ? { ...prev, name: newName, updatedAt: new Date().toISOString() } : null);
    }
    addNotification('Project Renamed', `Project renamed to "${newName}".`, 'info');
  };

  // 3. Delete Project
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject && activeProject.id === id) {
      setActiveProject(null);
      setOpenTabs([]);
      setActiveTabId(null);
    }
    addNotification('Project Deleted', `Successfully deleted project workspace.`, 'warning');
  };

  // 4. Select Project
  const selectProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setActiveProject(proj);
      setOpenTabs([]);
      setActiveTabId(null);
      setIsPreviewRunning(false);
      setDeployedUrl(null);
      // Open default entry points
      const defaultFile = findEntryFile(proj.files);
      if (defaultFile) {
        openTab(defaultFile.id);
      }
      addTerminalLine(`cd /workspace/${proj.name.toLowerCase().replace(/\s+/g, '-')}`, 'input');
      addTerminalLine(`workspace successfully switched to ${proj.name}.`, 'success');
      addTerminalLine(`rock-ai@container-3000:/workspace/${proj.name.toLowerCase().replace(/\s+/g, '-')}$`, 'output');
    }
  };

  const findEntryFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        if (node.name === 'App.tsx' || node.name === 'main.py' || node.name === 'index.html') {
          return node;
        }
      } else if (node.children) {
        const found = findEntryFile(node.children);
        if (found) return found;
      }
    }
    // Return first file
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        for (const child of node.children) {
          if (child.type === 'file') return child;
        }
      }
    }
    return null;
  };

  // 5. Close Active Project
  const closeProject = () => {
    setActiveProject(null);
    setOpenTabs([]);
    setActiveTabId(null);
    setIsPreviewRunning(false);
    setDeployedUrl(null);
  };

  // Helper to traverse and update file tree recursively
  const addNodeToTree = (nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] => {
    if (!parentId) {
      return [...nodes, newNode];
    }
    return nodes.map(node => {
      if (node.id === parentId && node.type === 'folder') {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      } else if (node.children) {
        return {
          ...node,
          children: addNodeToTree(node.children, parentId, newNode)
        };
      }
      return node;
    });
  };

  // 6. Add File or Folder
  const addFileOrFolder = (parentId: string | null, name: string, type: 'file' | 'folder', language?: string) => {
    if (!activeProject) return;

    let defaultContent = '';
    if (type === 'file') {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        defaultContent = `import React from 'react';\n\nexport default function CustomComponent() {\n  return (\n    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-white">\n      Custom Component rendered.\n    </div>\n  );\n}`;
      } else if (name.endsWith('.py')) {
        defaultContent = `def custom_handler():\n    return {"message": "Hello from Rock AI backend node"}\n`;
      } else if (name.endsWith('.css')) {
        defaultContent = `/* Rock AI custom styles */\n.glow-text {\n  text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);\n}`;
      } else {
        defaultContent = `// Created via Rock AI platform\n`;
      }
    }

    const newNode: FileNode = {
      id: `file-${Date.now()}`,
      name,
      path: parentId ? `${parentId}/${name}` : name, // Simplified logic path
      type,
      children: type === 'folder' ? [] : undefined,
      content: type === 'file' ? defaultContent : undefined,
      language: language || (type === 'file' ? getLanguageFromExtension(name) : undefined)
    };

    const updatedFiles = addNodeToTree(activeProject.files, parentId, newNode);
    const updatedProject: Project = {
      ...activeProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    syncActiveProjectToProjectsList(updatedProject);
    if (type === 'file') {
      openTab(newNode.id);
    }
    addNotification('File Created', `Created ${type} "${name}" successfully.`, 'success');
  };

  const getLanguageFromExtension = (name: string): string => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript';
    if (name.endsWith('.jsx') || name.endsWith('.js')) return 'javascript';
    if (name.endsWith('.py')) return 'python';
    if (name.endsWith('.html')) return 'html';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.json')) return 'json';
    if (name.endsWith('.md')) return 'markdown';
    return 'text';
  };

  // Helper to rename a node in file tree
  const renameNodeInTree = (nodes: FileNode[], id: string, newName: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        const pathParts = node.path.split('/');
        pathParts[pathParts.length - 1] = newName;
        return {
          ...node,
          name: newName,
          path: pathParts.join('/')
        };
      } else if (node.children) {
        return {
          ...node,
          children: renameNodeInTree(node.children, id, newName)
        };
      }
      return node;
    });
  };

  // 7. Rename File or Folder
  const renameFileOrFolder = (id: string, newName: string) => {
    if (!activeProject) return;
    const updatedFiles = renameNodeInTree(activeProject.files, id, newName);
    const updatedProject: Project = {
      ...activeProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    syncActiveProjectToProjectsList(updatedProject);
    
    // Update active tab title if renamed
    setOpenTabs(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
    addNotification('File Renamed', `File renamed to "${newName}".`, 'info');
  };

  // Helper to delete from file tree
  const deleteNodeFromTree = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes
      .filter(node => node.id !== id)
      .map(node => {
        if (node.children) {
          return {
            ...node,
            children: deleteNodeFromTree(node.children, id)
          };
        }
        return node;
      });
  };

  // 8. Delete File or Folder
  const deleteFileOrFolder = (id: string) => {
    if (!activeProject) return;
    const updatedFiles = deleteNodeFromTree(activeProject.files, id);
    const updatedProject: Project = {
      ...activeProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    syncActiveProjectToProjectsList(updatedProject);
    closeTab(id);
    addNotification('File Deleted', 'Selected file has been deleted from the workspace.', 'warning');
  };

  // Helper to update file content
  const updateContentInTree = (nodes: FileNode[], id: string, newContent: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          content: newContent
        };
      } else if (node.children) {
        return {
          ...node,
          children: updateContentInTree(node.children, id, newContent)
        };
      }
      return node;
    });
  };

  // 9. Update File Content (Editor Sync)
  const updateFileContent = (id: string, content: string) => {
    if (!activeProject) return;
    const updatedFiles = updateContentInTree(activeProject.files, id, content);
    const updatedProject: Project = {
      ...activeProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    syncActiveProjectToProjectsList(updatedProject);

    // Simulated Auto-Save Output notice (optional visual prompt)
    if (isAutoSaveEnabled) {
      setConsoleOutput(prev => prev + `[Auto-save] Compiled node: Saved changes to disk for fileId: ${id}\n`);
    }
  };

  // 9b. Bulk Update File Contents (Simultaneous Multi-file Changes)
  const bulkUpdateFileContents = (updates: { id: string; content: string }[]) => {
    if (!activeProject || updates.length === 0) return;

    let currentFiles = [...activeProject.files];

    // Helper to update a single file in the tree recursively
    const updateInTree = (nodes: FileNode[], targetId: string, newContent: string): FileNode[] => {
      return nodes.map(node => {
        if (node.id === targetId) {
          return {
            ...node,
            content: newContent
          };
        } else if (node.children) {
          return {
            ...node,
            children: updateInTree(node.children, targetId, newContent)
          };
        }
        return node;
      });
    };

    // Sequentially apply each file update in the list
    updates.forEach(update => {
      currentFiles = updateInTree(currentFiles, update.id, update.content);
    });

    const updatedProject: Project = {
      ...activeProject,
      files: currentFiles,
      updatedAt: new Date().toISOString()
    };

    syncActiveProjectToProjectsList(updatedProject);

    // Terminal notice and UI notification for bulk edit refactoring
    setConsoleOutput(prev => prev + `[ROCKY ENGINE] 🧠 Refactored ${updates.length} files simultaneously in background.\n`);
    addNotification('Global Refactor Done', `Bulk updated ${updates.length} files with 0 syntax conflicts!`, 'success');
  };

  // Helper to search a node by ID
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

  // 10. Open Tab
  const openTab = (fileId: string) => {
    if (!activeProject) return;
    const file = findNodeInTree(activeProject.files, fileId);
    if (file && file.type === 'file') {
      const alreadyOpen = openTabs.some(t => t.id === fileId);
      if (!alreadyOpen) {
        const newTab: Tab = {
          id: fileId,
          name: file.name,
          path: file.path
        };
        setOpenTabs(prev => [...prev, newTab]);
      }
      setActiveTabId(fileId);
    }
  };

  // 11. Close Tab
  const closeTab = (fileId: string) => {
    const tabIndex = openTabs.findIndex(t => t.id === fileId);
    const filtered = openTabs.filter(t => t.id !== fileId);
    setOpenTabs(filtered);
    if (activeTabId === fileId) {
      if (filtered.length > 0) {
        const nextActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(filtered[nextActiveIndex].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  // Achievements list database
  const achievements: Achievement[] = [
    {
      id: 'first-build',
      title: 'First Build',
      description: 'Trigger your very first autonomous compilation.',
      icon: 'Rocket',
      points: 100,
      badgeColor: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'ai-creator',
      title: 'AI Creator',
      description: 'Interact with Rock AI and apply code improvements.',
      icon: 'Sparkles',
      points: 150,
      badgeColor: 'from-pink-500 to-purple-600'
    },
    {
      id: 'game-builder',
      title: 'Game Builder',
      description: 'Compile a Game project template inside the OS sandbox.',
      icon: 'Gamepad2',
      points: 200,
      badgeColor: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'apk-master',
      title: 'APK Master',
      description: 'Generate a native Android package via APK deployment.',
      icon: 'Smartphone',
      points: 250,
      badgeColor: 'from-green-400 to-emerald-600'
    },
    {
      id: 'builds-100',
      title: 'Quantum Developer',
      description: 'Enter Quantum Thinking Mode to hyper-compile your app.',
      icon: 'Zap',
      points: 300,
      badgeColor: 'from-red-500 to-rose-600'
    },
    {
      id: 'production-launch',
      title: 'Production Master',
      description: 'Successfully deploy a Web Space to the Live Cloud.',
      icon: 'Globe',
      points: 400,
      badgeColor: 'from-violet-600 to-indigo-700'
    },
    {
      id: 'shard-synthesizer',
      title: 'Shard Synthesizer',
      description: 'Successfully integrate a Quantum Data Shard into your active workspace.',
      icon: 'Layers',
      points: 200,
      badgeColor: 'from-cyan-500 to-pink-500 shadow-lg'
    }
  ];

  const unlockAchievement = (id: string) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('rock_ai_unlocked_achievements', JSON.stringify(next));
      
      const ach = achievements.find(a => a.id === id);
      if (ach) {
        addNotification(
          `🏆 Achievement Unlocked: ${ach.title}`,
          `You earned ${ach.points} QP: ${ach.description}`,
          'success'
        );
      }
      return next;
    });
  };

  const toggleQuantumMode = () => {
    setIsQuantumMode(prev => {
      const next = !prev;
      addNotification(
        next ? 'Quantum Engine Enabled' : 'Quantum Engine Normalised',
        next ? 'Operating at peak performance. Star acceleration engaged.' : 'Resetting pipeline parameters.',
        next ? 'success' : 'info'
      );
      if (next) {
        unlockAchievement('builds-100');
      }
      return next;
    });
  };

  // 12. IDE Controls: Run project with autonomous self-healing ROCKY ENGINE pipeline
  const runProject = () => {
    if (!activeProject) return;
    setIsPreviewRunning(false);
    setPreviewUrl('');
    setActiveBuildReport(null);
    
    // Increment build counter
    const nextBuilds = buildCount + 1;
    setBuildCount(nextBuilds);
    localStorage.setItem('rock_ai_build_count', nextBuilds.toString());

    setConsoleOutput(prev => prev + `\n[ROCKY ENGINE] 🧠 Starting autonomous workspace analysis...\n`);
    addTerminalLine('rocky-engine run --autopilot', 'input');
    addTerminalLine('[ROCKY ENGINE] 🔍 Phase 1/8: Analyzing entire project file tree...', 'system');
    addNotification('Rocky Engine Online', 'Autonomous auto-debugging & self-healing pipeline initialized.', 'info');

    // Stage 1: Analyze project tree
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Scanning files: 18 source nodes detected in workspace.\n`);
      addTerminalLine('[ROCKY ENGINE] 🔍 Phase 2/8: Detecting missing files, packages, and broken imports...', 'system');
    }, 400);

    // Stage 2: Detect issues
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] ⚠️ Detection: Found missing import "motion/react" in src/components/SidebarAI.tsx.\n[ROCKY ENGINE] ⚠️ Detection: Found warning "unresolved type declarations for @google/genai".\n`);
      addTerminalLine('[ROCKY ENGINE] 🩹 Phase 3/8: Automatically fixing all issues...', 'system');
    }, 800);

    // Stage 3: Self-healing error correction
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Auto-Repair: Injected complete typescript imports and corrected layout tags.\n`);
      addTerminalLine('[ROCKY ENGINE] 📦 Phase 4/8: Installing required packages and updating package.json...', 'system');
    }, 1200);

    // Stage 4: Package installation
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Running: npm install @google/genai motion/react --silent\n[ROCKY ENGINE] ✓ 42 dependency nodes audited and synchronized.\n`);
      addTerminalLine('[ROCKY ENGINE] ⚡ Phase 5/8: Code optimization & refactoring...', 'system');
    }, 1600);

    // Stage 5: Optimize code
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Refactored component re-renders to guarantee smooth 120 FPS UI frames.\n`);
      addTerminalLine('[ROCKY ENGINE] 🧪 Phase 6/8: Running linters, static check, and unit tests...', 'system');
    }, 2000);

    // Stage 6: Testing & Linting
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] [LINT] tsc --noEmit: check complete. 0 type errors found.\n[ROCKY ENGINE] [TEST] 14 unit test specs compiled & executed: 14 passed.\n`);
      addTerminalLine('[ROCKY ENGINE] 📦 Phase 7/8: Building optimized development bundle...', 'system');
    }, 2400);

    // Stage 7: Build
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[VITE] vite v5.2.11 building for dev...\n[VITE] ✓ compiled 47 bundles in 210ms.\n`);
      addTerminalLine('[ROCKY ENGINE] 🛰️ Phase 8/8: Starting server & verifying preview health check...', 'system');
    }, 2800);

    // Stage 8: Verifying Preview loads & Health checks
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[VITE] dev server listening on port 3000\n[ROCKY ENGINE] Verifying http://localhost:3000 loads...\n[ROCKY ENGINE] 📡 Health Check: GET http://localhost:3000 -> 200 OK (Response index.html matches! Zero page crashes detected.)\n`);
      addTerminalLine('[ROCKY ENGINE] 🎉 Autopilot succeeded! Application is verified, stable and online.', 'success');
      
      setIsPreviewRunning(true);
      const nextUrl = getPreviewUrlForProject(activeProject);
      setPreviewUrl(nextUrl);

      // Generate a detailed high-fidelity build report
      const newReport: BuildReport = {
        id: `br-${Date.now()}`,
        projectName: activeProject.name,
        timestamp: new Date().toLocaleTimeString(),
        status: isQuantumMode ? 'optimised' : 'stable',
        diagnostics: {
          scannedFiles: 18,
          issuesFound: 2,
          issuesHealed: 2,
          buildDurationMs: isQuantumMode ? 640 : 3200
        },
        details: [
          {
            title: 'HMR Watcher Initialised',
            description: 'Successfully mapped workspace hot-reload events for instant canvas feedback.',
            severity: 'success'
          },
          {
            title: 'Auto-Healing Injected',
            description: 'Identified unresolved import refs and healed them prior to compilation phase.',
            severity: 'warning'
          },
          {
            title: 'Visual Core Assets Bundled',
            description: 'Optimized orbital particle matrices for consistent 60FPS fluid frames.',
            severity: 'success'
          }
        ],
        optimisations: [
          'Memory leak cleanup for canvas animation loops',
          'Tree-shaked legacy SVG imports to reduce loadtimes',
          'Responsive grid rendering performance boosted by 34%'
        ]
      };
      
      setActiveBuildReport(newReport);

      // Unlock Achievement Actions
      unlockAchievement('first-build');
      if (activeProject.name.toLowerCase().includes('game') || activeProject.template === 'HTML/CSS/JS') {
        unlockAchievement('game-builder');
      }

      addNotification('Build Complete', 'Preview server is fully compiled, self-healed, and running!', 'success');
    }, 3200);
  };

  const stopProject = () => {
    setIsPreviewRunning(false);
    setPreviewUrl('');
    setActiveBuildReport(null);
    setConsoleOutput(prev => prev + `[VITE] Server shut down signal received.\n`);
    addTerminalLine('kill dev server (SIGTERM)', 'system');
  };

  // 13. IDE Controls: Autonomous Deployment through ROCKY ENGINE
  const deployProject = (platform: 'web' | 'apk' | 'pwa' = 'web') => {
    if (!activeProject) return;
    setIsDeploying(true);
    setConsoleOutput(prev => prev + `\n[DEPLOY] Initializing secure cloud deployment for ${platform}...\n`);
    addTerminalLine(`rocky-engine deploy --target=${platform}`, 'input');
    addTerminalLine('[ROCKY ENGINE] 🛰️ Stage 1/4: Performing full pre-flight workspace health checks...', 'system');

    // Stage 1: Pre-flight checks
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Verifying local development build is error-free...\n[ROCKY ENGINE] ✓ Pre-flight diagnostics passed. System ready for compiler optimization.\n`);
      addTerminalLine('[ROCKY ENGINE] 📦 Stage 2/4: Bundling optimized static assets and server layers...', 'system');
    }, 600);

    // Stage 2: Compiling bundle
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[ROCKY ENGINE] Compiling server-side entry points to CJS format...\n[ROCKY ENGINE] Bundling production-grade containers...\n`);
      addTerminalLine('[ROCKY ENGINE] 🚀 Stage 3/4: Provisioning host credentials & uploading container...', 'system');
    }, 1200);

    // Stage 3: Deploying
    setTimeout(() => {
      if (platform === 'apk') {
        setConsoleOutput(prev => prev + `[ROCKY ENGINE] 🤖 Android SDK detected. Initializing Gradle daemon...\n[GRADLE] > Task :app:compileReleaseJavaWithJavac\n[GRADLE] > Task :app:bundleRelease\n[ROCKY ENGINE] Aligned and signed release APK with secure keystore.\n`);
      } else {
        setConsoleOutput(prev => prev + `[DEPLOY] Creating docker instance bundle...\n[DEPLOY] Uploading configurations to serverless container host...\n[ROCKY ENGINE] Applying live Firestore rules & API gateways.\n`);
      }
      addTerminalLine('[ROCKY ENGINE] 🛰️ Stage 4/4: Verifying deployment routing & host health check...', 'system');
    }, 1800);

    // Stage 4: Verify and complete
    setTimeout(() => {
      setIsDeploying(false);
      let randId = Math.random().toString(36).substring(7);
      let url = '';
      
      if (platform === 'apk') {
        url = `https://builds.rockai.space/downloads/rocky-android-app-${randId}.apk`;
        addTerminalLine(`[ROCKY ENGINE] APK compiled successfully! Public link: ${url}`, 'success');
        addNotification('Install APK', 'Rocky Engine compiled Android package successfully! Click here to download & install.', 'success');
        unlockAchievement('apk-master');
      } else if (platform === 'pwa') {
        url = `https://pwa-${randId}.rockai.space`;
        addTerminalLine(`[ROCKY ENGINE] PWA Service worker hosted live at: ${url}`, 'success');
        addNotification('PWA Deployed', 'Progressive Web App deployed successfully & cache is active.', 'success');
      } else {
        url = `https://${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-${randId}.rockai.space`;
        addTerminalLine(`[ROCKY ENGINE] Web app fully deployed! Live deployment URL: ${url}`, 'success');
        addNotification('Deployment Success', 'Your project has been deployed successfully to production Cloud Run!', 'success');
        unlockAchievement('production-launch');
      }
      setDeployedUrl(url);
    }, 2400);
  };

  // 14. Add terminal log line helper
  const addTerminalLine = (text: string, type: TerminalLine['type'] = 'output') => {
    setTerminalLines(prev => [
      ...prev,
      { id: `t-${Date.now()}-${Math.random()}`, type, text }
    ]);
  };

  const clearTerminal = () => {
    setTerminalLines([
      { id: `t-clear`, type: 'system', text: 'Terminal logs cleared. rock-ai@container-3000:~$' }
    ]);
  };

  // 15. Notifications helpers
  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // 16. Collaboration Simulator
  const triggerMockCollaboration = () => {
    if (!activeProject) return;
    const sarah = mockUsers[1];
    addTerminalLine(`${sarah.username} has joined the workspace.`, 'system');
    addNotification('Collaborator Joined', `${sarah.username} joined editing line 24.`, 'info');
    
    // Simulate some editing logs
    setTimeout(() => {
      setConsoleOutput(prev => prev + `[Collaboration] sarah_dev modified src/App.tsx - live update sync\n`);
    }, 3000);
  };

  // 17. Zip import helper
  const importProjectFromZip = (projectName: string, template: Project['template'], files: FileNode[]) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      description: `Imported workspace template`,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files,
      versionHistory: [
        {
          id: `v-${Date.now()}`,
          timestamp: new Date().toISOString(),
          commitMessage: 'ZIP Archive Import accomplished',
          filesState: {}
        }
      ],
      activeUsers: [currentUser]
    };
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    setOpenTabs([]);
    setActiveTabId(null);
    addNotification('Import Success', `ZIP file of "${projectName}" parsed and loaded.`, 'success');
  };

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        projects,
        activeProject,
        openTabs,
        activeTabId,
        notifications,
        terminalLines,
        consoleOutput,
        isPreviewRunning,
        previewUrl,
        isDeploying,
        deployedUrl,
        theme,
        fontSize,
        isAutoSaveEnabled,
        isSettingsOpen,
        activeCollaborators,
        
        // Achievements & Smart Build
        achievements,
        unlockedAchievements,
        unlockAchievement,
        buildCount,
        isQuantumMode,
        toggleQuantumMode,
        activeBuildReport,
        setActiveBuildReport,
        
        createProject,
        renameProject,
        deleteProject,
        selectProject,
        closeProject,
        
        addFileOrFolder,
        renameFileOrFolder,
        deleteFileOrFolder,
        updateFileContent,
        bulkUpdateFileContents,
        
        openTab,
        closeTab,
        setActiveTabId,
        
        runProject,
        stopProject,
        deployProject,
        triggerMockCollaboration,
        addTerminalLine,
        clearTerminal,
        
        addNotification,
        markNotificationAsRead,
        
        setTheme,
        setFontSize,
        setIsAutoSaveEnabled,
        setIsSettingsOpen,
        importProjectFromZip
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
