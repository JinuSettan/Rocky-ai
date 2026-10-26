/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  HardDrive,
  CloudUpload,
  CloudDownload,
  Trash2,
  ExternalLink,
  RefreshCw,
  Folder,
  FileCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  listDriveFiles,
  saveProjectToGoogleDrive,
  getDriveFileContent,
  deleteDriveFile,
  DriveFileItem,
  auth,
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import { FileNode } from '../types';

export interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, importProjectFromZip, createProject, addNotification } = useProject();

  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Destructive Action Confirmation State (MANDATORY per skill guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync active project state
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, userToken) => {
        setUser(authedUser);
        setToken(userToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = useCallback(async () => {
    if (!token) return;
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to list Drive files:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Could not fetch files from Google Drive.' });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && token) {
      loadFiles();
    }
  }, [isOpen, token, loadFiles]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMessage({ type: 'success', text: `Signed in as ${result.user.displayName || result.user.email}!` });
        addNotification('Google Drive Connected', `Linked to ${result.user.email} with sync permissions.`, 'success');
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Sign in failed. Please try again.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setDriveFiles([]);
      setStatusMessage({ type: 'info', text: 'Disconnected from Google Drive.' });
      addNotification('Google Drive Disconnected', 'Session cleared from memory.', 'info');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to sign out.' });
    }
  };

  const handleSyncCurrentProject = async () => {
    if (!activeProject) {
      setStatusMessage({ type: 'error', text: 'No active project selected to sync!' });
      return;
    }
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please sign in to Google Drive first.' });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const uploadRes = await saveProjectToGoogleDrive(activeProject);
      setStatusMessage({
        type: 'success',
        text: `✓ Saved "${uploadRes.fileName}" into Google Drive (Rock AI Projects folder).`,
      });
      addNotification(
        'Project Synced to Drive',
        `Successfully backed up "${activeProject.name}" to Google Drive.`,
        'success'
      );
      loadFiles();
    } catch (err: any) {
      console.error('Project sync error:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to sync project to Google Drive.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFile = async (file: DriveFileItem) => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const content = await getDriveFileContent(file.id);

      // Check if it's a Rock AI project JSON bundle
      if (file.name.endsWith('.json') || file.name.includes('_rock_project')) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.project && parsed.project.name && Array.isArray(parsed.project.files)) {
            createProject(
              parsed.project.name,
              parsed.project.description || 'Imported from Google Drive',
              parsed.project.template || 'React',
              parsed.project.files
            );
            setStatusMessage({ type: 'success', text: `Imported project "${parsed.project.name}" from Google Drive!` });
            addNotification('Project Imported', `Loaded "${parsed.project.name}" into workspace.`, 'success');
            onClose();
            return;
          }
        } catch (e) {
          // Fall through to single file import
        }
      }

      // Single file import
      const fileExt = file.name.split('.').pop() || 'txt';
      const singleFile: FileNode = {
        id: `drive-${Date.now()}`,
        name: file.name,
        path: file.name,
        type: 'file',
        language: fileExt === 'py' ? 'python' : fileExt === 'cpp' ? 'cpp' : fileExt === 'c' ? 'c' : fileExt === 'kt' ? 'kotlin' : 'typescript',
        content,
      };

      createProject(
        file.name.replace(/\.[^/.]+$/, ''),
        `Imported file from Google Drive: ${file.name}`,
        'HTML/CSS/JS',
        [singleFile]
      );

      setStatusMessage({ type: 'success', text: `Imported "${file.name}" as a new workspace project!` });
      addNotification('Drive File Imported', `Loaded "${file.name}" into workspace.`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to import file from Google Drive.' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Explicit user confirmation for destructive delete
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({ type: 'success', text: `Deleted "${fileToDelete.name}" from Google Drive.` });
      addNotification('File Deleted', `Removed "${fileToDelete.name}" from Google Drive.`, 'warning');
      setFileToDelete(null);
      loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to delete file.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Drive Cloud Storage</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-zinc-400">Sync projects, browse files, and import code securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notice Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 text-red-300 border-red-500/30'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-white text-xs ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 1. Account Section */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            {user && token ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-lg">
                      {user.email ? user.email[0].toUpperCase() : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {user.displayName || 'Google Account'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Connected
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-zinc-300">
                  Connect your Google Drive account with user permission to automatically backup code, import projects, and sync workspaces.
                </p>

                {/* Official "Sign in with Google" button according to skill guidelines */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full bg-white text-zinc-800 font-medium text-sm hover:bg-zinc-100 hover:shadow-lg transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Sync Active Project Banner */}
          {user && token && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-purple-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Active Project Sync
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  {activeProject
                    ? `Save "${activeProject.name}" (${activeProject.template}) to your "Rock AI Projects" folder on Google Drive.`
                    : 'Select a project to enable Google Drive instant sync.'}
                </p>
              </div>

              <button
                onClick={handleSyncCurrentProject}
                disabled={!activeProject || isSyncing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-lg shadow-cyan-500/20 whitespace-nowrap"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSyncing ? 'Syncing...' : 'Sync to Drive'}</span>
              </button>
            </div>
          )}

          {/* 3. Google Drive File Explorer */}
          {user && token && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Drive Files ({driveFiles.length})
                  </h4>
                </div>

                {/* Search */}
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drive files..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {isLoadingFiles ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Loading files from Google Drive...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-10 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-6">
                  <HardDrive className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">No files found matching your search.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Click "Sync to Drive" above to upload your first project backup.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80 rounded-2xl bg-zinc-900/50 border border-zinc-800 max-h-64 overflow-y-auto">
                  {filteredFiles.map((file) => {
                    const isRockProject =
                      file.name.includes('_rock_project') || file.name.endsWith('.json');
                    const isCode =
                      file.name.endsWith('.py') ||
                      file.name.endsWith('.cpp') ||
                      file.name.endsWith('.c') ||
                      file.name.endsWith('.kt') ||
                      file.name.endsWith('.dart') ||
                      file.name.endsWith('.tsx') ||
                      file.name.endsWith('.html');

                    return (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-zinc-800/40 transition gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {isRockProject ? (
                            <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
                          ) : isCode ? (
                            <FileCode className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-zinc-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                              <span>
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString()
                                  : 'Recently'}
                              </span>
                              {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleImportFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Import into Rock AI Workspace"
                          >
                            <CloudDownload className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Import</span>
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 transition cursor-pointer"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-zinc-900/90 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Tokens cached safely in memory • Direct Google Drive v3 REST</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION MODAL FOR DESTRUCTIVE ACTION (per Workspace Skill) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-zinc-950 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete file from Google Drive?</h4>
                <p className="text-xs text-zinc-400">This destructive action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-300 font-semibold truncate">{fileToDelete.name}</div>
              <div className="text-zinc-500 text-[11px]">ID: {fileToDelete.id}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
