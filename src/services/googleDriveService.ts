/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, FileNode } from '../types';

// Reuse existing Firebase app instance if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token cache (never stored in localStorage/sessionStorage as required)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged in from a previous session, we need to prompt or re-acquire the token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google sign-in.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const isDriveAuthenticated = (): boolean => {
  return Boolean(auth.currentUser && cachedAccessToken);
};

// 1. List Files from Google Drive
export const listDriveFiles = async (
  query?: string,
  pageSize = 30
): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive. Please sign in first.');

  let q = "trashed = false";
  if (query) {
    q += ` and ${query}`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink)&q=${encodeURIComponent(
    q
  )}&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Drive API returned status ${res.status}`);
  }

  const data = await res.json();
  return data.files || [];
};

// 2. Fetch File Content from Google Drive
export const getDriveFileContent = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download file from Google Drive: HTTP ${res.status}`);
  }

  return await res.text();
};

// 3. Create or Find "Rock AI Projects" Folder in Google Drive
export const getOrCreateRockAIFolder = async (): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  // Check if folder already exists
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    "name = 'Rock AI Projects' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
  )}&fields=files(id,name)`;

  const searchRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Rock AI Projects',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Directory for Rock AI Studio Projects and Multi-Language Code Bases',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create Rock AI Projects folder on Google Drive.');
  }

  const folderData = await createRes.json();
  return folderData.id;
};

// 4. Save Project to Google Drive as a structured JSON bundle
export const saveProjectToGoogleDrive = async (
  project: Project
): Promise<{ fileId: string; fileName: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive. Please sign in first.');

  const folderId = await getOrCreateRockAIFolder();

  const fileName = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_rock_project.json`;
  const fileContent = JSON.stringify(
    {
      rockAiVersion: '3.8.0',
      syncedAt: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        template: project.template,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        files: project.files,
      },
    },
    null,
    2
  );

  // Use multipart upload to include metadata and file content in one call
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Rock AI project backup for ${project.name} (${project.template})`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Drive upload failed: HTTP ${res.status}`);
  }

  const uploaded = await res.json();
  return {
    fileId: uploaded.id,
    fileName: uploaded.name,
    webViewLink: uploaded.webViewLink,
  };
};

// 5. Delete File from Google Drive (Mandatory user confirmation should precede calling this)
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete Google Drive file: HTTP ${res.status}`);
  }

  return true;
};
