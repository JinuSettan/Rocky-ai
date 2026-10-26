/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import { 
  Folder, FolderOpen, File, Trash2, Edit2, Search, 
  Github, ChevronDown, ChevronRight, FilePlus, FolderPlus,
  FileCode, FileJson, FileText, Layers, Terminal as TermIcon,
  FileImage, Lock, Braces, Hash, Wrench, Code2, Settings, Sparkles
} from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const { 
    activeProject, 
    addFileOrFolder, 
    deleteFileOrFolder, 
    renameFileOrFolder, 
    openTab 
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isImportingGit, setIsImportingGit] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true
  });

  // Creation state
  const [creatorState, setCreatorState] = useState<{
    parentId: string | null;
    type: 'file' | 'folder' | null;
  }>({ parentId: null, type: null });
  const [creatorName, setCreatorName] = useState('');

  // Renaming state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleGitImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    
    // Simulate GitHub import inside tree
    addFileOrFolder(null, 'github-config.json', 'file');
    addFileOrFolder(null, 'imported-git-router.ts', 'file');
    setGithubUrl('');
    setIsImportingGit(false);
  };

  // Helper to check if node or any child matches search
  const matchSearch = (node: FileNode, query: string): boolean => {
    if (!query) return true;
    if (node.name.toLowerCase().includes(query.toLowerCase())) return true;
    if (node.children) {
      return node.children.some(child => matchSearch(child, query));
    }
    return false;
  };

  // Helper to render customized beautiful file-type icons
  const getFileIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();

    // Specific file names (highest priority)
    if (lowercaseName === 'package.json') {
      return <span title="Package Manifest"><Wrench className="w-4 h-4 text-pink-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName === 'tsconfig.json') {
      return <span title="TypeScript Config"><Settings className="w-4 h-4 text-cyan-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.startsWith('vite.config.')) {
      return <span title="Vite Configuration"><Settings className="w-4 h-4 text-purple-400 flex-shrink-0 animate-spin-slow" style={{ animationDuration: '10s' }} /></span>;
    }
    if (lowercaseName === '.gitignore') {
      return <span title="Git Ignore"><Lock className="w-4 h-4 text-red-500/80 flex-shrink-0" /></span>;
    }
    if (lowercaseName.startsWith('.env')) {
      return <span title="Environment Secret"><Lock className="w-4 h-4 text-emerald-400/80 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.lock') || lowercaseName === 'package-lock.json') {
      return <span title="Lockfile"><Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" /></span>;
    }

    // Extensions
    if (lowercaseName.endsWith('.tsx')) {
      return <span title="TypeScript React (TSX)"><FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.jsx')) {
      return <span title="JavaScript React (JSX)"><FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.ts')) {
      return <span title="TypeScript File"><Code2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.js')) {
      return <span title="JavaScript File"><Braces className="w-4 h-4 text-purple-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.py')) {
      return <span title="Python Script"><TermIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.css') || lowercaseName.endsWith('.scss')) {
      return <span title="Stylesheet"><Hash className="w-4 h-4 text-pink-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.html')) {
      return <span title="HTML Document"><FileCode className="w-4 h-4 text-pink-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.json')) {
      return <span title="JSON Data"><FileJson className="w-4 h-4 text-purple-400 flex-shrink-0" /></span>;
    }
    if (lowercaseName.endsWith('.md')) {
      return <span title="Markdown Documentation"><FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" /></span>;
    }
    if (
      lowercaseName.endsWith('.png') || 
      lowercaseName.endsWith('.jpg') || 
      lowercaseName.endsWith('.jpeg') || 
      lowercaseName.endsWith('.svg') || 
      lowercaseName.endsWith('.gif') || 
      lowercaseName.endsWith('.ico') || 
      lowercaseName.endsWith('.webp')
    ) {
      return <span title="Image Asset"><FileImage className="w-4 h-4 text-emerald-400 flex-shrink-0" /></span>;
    }

    // Default fallback
    return <File className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
  };

  // Recursive renderer for FileTree
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes
      .filter(node => matchSearch(node, searchQuery))
      .map(node => {
        const isFolder = node.type === 'folder';
        const isExpanded = searchQuery ? true : !!expandedFolders[node.id];
        const paddingLeft = `${depth * 12 + 8}px`;
        const isEditing = editingNodeId === node.id;

        return (
          <div key={node.id} className="select-none">
            {/* Tree Node Line */}
            <div
              style={{ paddingLeft }}
              className={`group flex items-center justify-between py-2 px-2.5 hover:bg-white/[0.02] rounded-xl cursor-pointer transition-all duration-300 ${
                !isFolder ? 'hover:text-cyan-400' : 'text-zinc-300'
              }`}
              onClick={() => {
                if (isFolder) {
                  toggleFolder(node.id);
                } else if (!isEditing) {
                  openTab(node.id);
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isFolder ? (
                  isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  )
                ) : (
                  <div className="w-3.5" />
                )}

                {isFolder ? (
                  isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  )
                ) : (
                  getFileIcon(node.name)
                )}

                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (editingName.trim() && editingName !== node.name) {
                        renameFileOrFolder(node.id, editingName.trim());
                      }
                      setEditingNodeId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 mr-2"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingNodeId(null);
                        }
                      }}
                      onBlur={() => {
                        if (editingName.trim() && editingName !== node.name) {
                          renameFileOrFolder(node.id, editingName.trim());
                        }
                        setEditingNodeId(null);
                      }}
                      className="bg-zinc-950 text-xs text-white border-b border-pink-500 rounded px-1.5 py-0.5 focus:outline-none w-full font-bold font-mono"
                    />
                  </form>
                ) : (
                  <span className="text-xs truncate font-semibold text-zinc-350 tracking-wide">{node.name}</span>
                )}
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="hidden group-hover:flex items-center gap-0.5">
                  {isFolder && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedFolders(prev => ({ ...prev, [node.id]: true }));
                          setCreatorState({ parentId: node.id, type: 'file' });
                          setCreatorName('');
                        }}
                        className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        title="Add File"
                      >
                        <FilePlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedFolders(prev => ({ ...prev, [node.id]: true }));
                          setCreatorState({ parentId: node.id, type: 'folder' });
                          setCreatorName('');
                        }}
                        className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        title="Add Folder"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNodeId(node.id);
                      setEditingName(node.name);
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-cyan-400 transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFileOrFolder(node.id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Sub-node files & Inline Creation Inside this Folder */}
            {isFolder && isExpanded && (
              <div className="mt-0.5 space-y-0.5">
                {creatorState.parentId === node.id && creatorState.type && (
                  <div
                    style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                    className="flex items-center gap-2 py-1 px-2.5 bg-white/[0.01] rounded-xl"
                  >
                    <div className="w-3.5" />
                    {creatorState.type === 'folder' ? (
                      <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!creatorName.trim()) return;
                        addFileOrFolder(node.id, creatorName.trim(), creatorState.type!);
                        setCreatorName('');
                        setCreatorState({ parentId: null, type: null });
                      }}
                      className="flex-1"
                    >
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder={creatorState.type === 'file' ? 'filename.ts' : 'foldername'}
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setCreatorState({ parentId: null, type: null });
                            setCreatorName('');
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            if (!creatorName.trim()) {
                              setCreatorState({ parentId: null, type: null });
                            }
                          }, 200);
                        }}
                        className="bg-transparent text-xs text-white border-b border-cyan-500 focus:outline-none w-full font-bold font-mono"
                      />
                    </form>
                  </div>
                )}
                {node.children && renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="flex-1 flex flex-col h-full text-left bg-transparent relative z-20">
      
      {/* File Explorer Header with Search and Create triggers */}
      <div className="p-4 border-b border-white/5 space-y-3 bg-black/10 select-none">
        <div className="flex justify-between items-center">
          <span className="text-[9px] uppercase font-black tracking-[0.15em] text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Sandbox Files</span>
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setCreatorState({ parentId: null, type: 'file' });
                setCreatorName('');
              }}
              className="p-1.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="New File at Root"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              onClick={() => {
                setCreatorState({ parentId: null, type: 'folder' });
                setCreatorName('');
              }}
              className="p-1.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-pink-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="New Folder at Root"
            >
              <FolderPlus className="w-3.5 h-3.5 text-pink-500" />
            </button>
            <button
              onClick={() => setIsImportingGit(!isImportingGit)}
              className="p-1.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Import GitHub repo"
            >
              <Github className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Global Search inside directory tree */}
        <div className="flex items-center bg-black border border-white/10 rounded-xl px-3 py-2 gap-2">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search active files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[11px] text-zinc-300 focus:outline-none w-full placeholder:text-zinc-700 font-medium"
          />
        </div>
      </div>

      {/* GitHub Repository Import Popup UI */}
      {isImportingGit && (
        <div className="p-4 border-b border-white/5 bg-black/40">
          <form onSubmit={handleGitImportSubmit} className="space-y-3">
            <div className="text-[9px] uppercase font-black tracking-widest text-purple-400 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span>Import GitHub Node</span>
            </div>
            <input
              type="text"
              required
              autoFocus
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-xl text-white font-black text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Clone Repo
              </button>
              <button
                type="button"
                onClick={() => setIsImportingGit(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-2 rounded-xl text-zinc-400 text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scrollable Directory Trees list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Inline Creation at Root Level */}
        {creatorState.parentId === null && creatorState.type && (
          <div
            style={{ paddingLeft: '8px' }}
            className="flex items-center gap-2 py-1.5 px-2.5 bg-white/[0.01] rounded-xl mb-1"
          >
            <div className="w-3.5" />
            {creatorState.type === 'folder' ? (
              <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
            ) : (
              <File className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!creatorName.trim()) return;
                addFileOrFolder(null, creatorName.trim(), creatorState.type!);
                setCreatorName('');
                setCreatorState({ parentId: null, type: null });
              }}
              className="flex-1"
            >
              <input
                type="text"
                required
                autoFocus
                placeholder={creatorState.type === 'file' ? 'filename.ts' : 'foldername'}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setCreatorState({ parentId: null, type: null });
                    setCreatorName('');
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    if (!creatorName.trim()) {
                      setCreatorState({ parentId: null, type: null });
                    }
                  }, 200);
                }}
                className="bg-transparent text-xs text-white border-b border-cyan-500 focus:outline-none w-full font-bold font-mono"
              />
            </form>
          </div>
        )}
        
        {activeProject && renderTree(activeProject.files)}
      </div>

    </div>
  );
};
