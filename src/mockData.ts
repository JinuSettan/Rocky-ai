/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, FileNode, User, Notification } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'jinuraj',
    email: 'jinuraj26107@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    color: '#f97316', // Orange
    isOnline: true,
  },
  {
    id: 'user-2',
    username: 'sarah_dev',
    email: 'sarah.k@cocktailz.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    color: '#3b82f6', // Blue
    isOnline: true,
  },
  {
    id: 'user-3',
    username: 'alex_deployer',
    email: 'alex.m@cocktailz.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    color: '#10b981', // Green
    isOnline: true,
  },
  {
    id: 'user-4',
    username: 'elena_ai',
    email: 'elena.rock@cocktailz.ai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    color: '#8b5cf6', // Purple
    isOnline: false,
  }
];

export const mockNotifications: Notification[] = [];

// File tree structures for different templates

// 1. React Template Files
const reactTemplateFiles: FileNode[] = [
  {
    id: 'r-1',
    name: 'src',
    path: 'src',
    type: 'folder',
    children: [
      {
        id: 'r-1-1',
        name: 'components',
        path: 'src/components',
        type: 'folder',
        children: [
          {
            id: 'r-1-1-1',
            name: 'Button.tsx',
            path: 'src/components/Button.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';\n\ninterface ButtonProps {\n  label: string;\n  onClick: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {\n  return (\n    <button\n      onClick={onClick}\n      className={\`px-4 py-2 rounded-lg font-medium transition-all duration-200 \${\n        variant === 'primary'\n          ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-lg hover:shadow-orange-500/20'\n          : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'\n      }\`}\n    >\n      {label}\n    </button>\n  );\n};`
          },
          {
            id: 'r-1-1-2',
            name: 'Card.tsx',
            path: 'src/components/Card.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';\n\ninterface CardProps {\n  title: string;\n  description: string;\n}\n\nexport const Card: React.FC<CardProps> = ({ title, description }) => {\n  return (\n    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-6 rounded-2xl shadow-xl hover:border-orange-500/30 transition-all">\n      <h3 className="text-xl font-bold text-zinc-100 mb-2">{title}</h3>\n      <p className="text-zinc-400 text-sm">{description}</p>\n    </div>\n  );\n};`
          }
        ]
      },
      {
        id: 'r-1-2',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React, { useState } from 'react';\nimport { Button } from './components/Button';\nimport { Card } from './components/Card';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">\n      <div className="text-center max-w-xl animate-fade-in">\n        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-zinc-200 to-blue-500">\n          Rock AI Web App\n        </h1>\n        <p className="text-zinc-400 mb-8">\n          Welcome to your live-previewing React single-page application built on Rock AI, powered by Cocktail Z AI.\n        </p>\n\n        <div className="flex justify-center gap-4 mb-12">\n          <Button label={\`Clicked: \${count} times\`} onClick={() => setCount(count + 1)} />\n          <Button label="Reset Counter" variant="secondary" onClick={() => setCount(0)} />\n        </div>\n\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">\n          <Card title="Glassmorphism UI" description="Designed with premium backdrops, custom opacity variables, and micro-animations." />\n          <Card title="Full-Stack Dev" description="Seamlessly integrate Express backends, Python analytics, or static outputs." />\n        </div>\n      </div>\n    </div>\n  );\n}`
      },
      {
        id: 'r-1-3',
        name: 'index.css',
        path: 'src/index.css',
        type: 'file',
        language: 'css',
        content: `@import "tailwindcss";\n\n@layer base {\n  body {\n    background-color: #000000;\n    font-family: 'Inter', sans-serif;\n  }\n}`
      }
    ]
  },
  {
    id: 'r-2',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    content: `{\n  "name": "rock-react-app",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "lucide-react": "^0.450.0"\n  }\n}`
  },
  {
    id: 'r-3',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# Rock AI React App\n\nThis project is initiated via the Rock AI code generator.\n\n### Running instructions\n\n1. Press the **Run** button (orange glow) on the top bar.\n2. See the live compiler preview on the bottom right panel.\n3. Make real-time adjustments and watch changes automatically reflect!`
  }
];

// 2. Python / FastAPI Template Files
const pythonTemplateFiles: FileNode[] = [
  {
    id: 'p-1',
    name: 'main.py',
    path: 'main.py',
    type: 'file',
    language: 'python',
    content: `from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nimport uvicorn\n\napp = FastAPI(title="Rock AI Cloud Server", description="FastAPI Server Running client-side analytics mock")\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n\n@app.get("/")\ndef read_root():\n    return {\n        "status": "online",\n        "engine": "Rock AI Core V1",\n        "creator": "Cocktail Z AI",\n        "languages_supported": ["Python", "Node.js", "React", "Next.js", "Flutter"]\n    }\n\n@app.get("/api/ai/predict")\ndef predict(prompt: str = "hello"):\n    # Simulate NLP prediction pipeline\n    return {\n        "prediction": f"Response for prompt: '{prompt}' generated using CockTail Z predictive models.",\n        "confidence": 0.985,\n        "latency_ms": 12.4\n    }\n\nif __name__ == "__main__":\n    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`
  },
  {
    id: 'p-2',
    name: 'requirements.txt',
    path: 'requirements.txt',
    type: 'file',
    language: 'text',
    content: `fastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.4\nrequests==2.31.0`
  },
  {
    id: 'p-3',
    name: 'Dockerfile',
    path: 'Dockerfile',
    type: 'file',
    language: 'dockerfile',
    content: `FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["python", "main.py"]`
  }
];

// 3. HTML/CSS/JS Template Files
const htmlTemplateFiles: FileNode[] = [
  {
    id: 'h-1',
    name: 'index.html',
    path: 'index.html',
    type: 'file',
    language: 'html',
    content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Rock AI Static Showcase</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="glass-container">\n        <header>\n            <h1>Rock AI</h1>\n            <p class="subtitle">Powered by Cocktail Z AI</p>\n        </header>\n        <main>\n            <div class="glow-box">\n                <p id="time-display">Local Time: Loading...</p>\n                <button id="interactive-btn" class="orange-btn">Initiate Neural Sync</button>\n            </div>\n        </main>\n    </div>\n    <script src="script.js"></script>\n</body>\n</html>`
  },
  {
    id: 'h-2',
    name: 'style.css',
    path: 'style.css',
    type: 'file',
    language: 'css',
    content: `body {\n    margin: 0;\n    padding: 0;\n    background-color: #030303;\n    color: #ffffff;\n    font-family: system-ui, -apple-system, sans-serif;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n    overflow: hidden;\n}\n\n.glass-container {\n    background: rgba(255, 255, 255, 0.03);\n    backdrop-filter: blur(12px);\n    border: 1px solid rgba(255, 255, 255, 0.08);\n    padding: 3rem;\n    border-radius: 24px;\n    text-align: center;\n    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);\n    border-top: 1px solid rgba(249, 115, 22, 0.3);\n    border-bottom: 1px solid rgba(59, 130, 246, 0.3);\n}\n\nh1 {\n    font-size: 2.5rem;\n    margin: 0;\n    background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n}\n\n.subtitle {\n    color: #888;\n    font-size: 0.9rem;\n    margin-top: 0.5rem;\n    letter-spacing: 2px;\n}\n\n.glow-box {\n    margin-top: 2rem;\n    padding: 1.5rem;\n    background: rgba(0, 0, 0, 0.2);\n    border-radius: 16px;\n    border: 1px solid rgba(255, 255, 255, 0.04);\n}\n\n.orange-btn {\n    background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);\n    border: none;\n    color: white;\n    padding: 0.8rem 1.6rem;\n    border-radius: 12px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.orange-btn:hover {\n    transform: scale(1.03);\n    box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);\n}`
  },
  {
    id: 'h-3',
    name: 'script.js',
    path: 'script.js',
    type: 'file',
    language: 'javascript',
    content: `document.addEventListener('DOMContentLoaded', () => {\n    const btn = document.getElementById('interactive-btn');\n    const timeDisplay = document.getElementById('time-display');\n\n    // Start live clock update\n    setInterval(() => {\n        const now = new Date();\n        timeDisplay.innerText = \`Neural Lock: \${now.toLocaleTimeString()}\`;\n    }, 1000);\n\n    btn.addEventListener('click', () => {\n        btn.innerText = 'Neural Locked';\n        btn.style.background = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';\n        timeDisplay.style.color = '#3b82f6';\n        alert('Rock AI Neural sync accomplished! Experience seamless live previews.');\n    });\n});`
  }
];

// Helper to construct empty template structures
export const getTemplateFiles = (template: Project['template']): FileNode[] => {
  switch (template) {
    case 'React':
      return JSON.parse(JSON.stringify(reactTemplateFiles));
    case 'Python':
    case 'FastAPI':
      return JSON.parse(JSON.stringify(pythonTemplateFiles));
    case 'HTML/CSS/JS':
      return JSON.parse(JSON.stringify(htmlTemplateFiles));
    default:
      // Fallback basic React/HTML
      return JSON.parse(JSON.stringify(reactTemplateFiles));
  }
};

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Rock AI Interactive Demo',
    description: 'A dynamic sandbox to explore full-stack glassmorphism UI layouts.',
    template: 'React',
    createdAt: '2026-07-10T14:32:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
    files: getTemplateFiles('React'),
    versionHistory: [
      {
        id: 'v-1',
        timestamp: '2026-07-10T14:32:00Z',
        commitMessage: 'Initial project setup with custom Button and Card components',
        filesState: {}
      }
    ],
    activeUsers: [mockUsers[0], mockUsers[1]]
  },
  {
    id: 'proj-2',
    name: 'FastAPI Microservice',
    description: 'Predictive NLP text completion proxy server powered by Cocktail Z models.',
    template: 'FastAPI',
    createdAt: '2026-07-12T09:15:00Z',
    updatedAt: '2026-07-14T18:45:00Z',
    files: getTemplateFiles('FastAPI'),
    versionHistory: [
      {
        id: 'v-2',
        timestamp: '2026-07-12T09:15:00Z',
        commitMessage: 'Setup app endpoints and docker configuration',
        filesState: {}
      }
    ],
    activeUsers: [mockUsers[0], mockUsers[2]]
  },
  {
    id: 'proj-3',
    name: 'Static Showcase landing',
    description: 'Slick landing presentation card emphasizing neural orange and neon blue accents.',
    template: 'HTML/CSS/JS',
    createdAt: '2026-07-14T11:00:00Z',
    updatedAt: '2026-07-15T01:20:00Z',
    files: getTemplateFiles('HTML/CSS/JS'),
    versionHistory: [
      {
        id: 'v-3',
        timestamp: '2026-07-14T11:00:00Z',
        commitMessage: 'Design visual glass container and background styles',
        filesState: {}
      }
    ],
    activeUsers: [mockUsers[0]]
  }
];

export const mockKeyboardShortcuts = [
  { key: 'Ctrl + S', description: 'Trigger Auto-save compiler check', category: 'Editor' },
  { key: 'Ctrl + Enter', description: 'Run build and load Live Preview', category: 'Editor' },
  { key: 'Ctrl + /', description: 'Toggle comment line', category: 'Editor' },
  { key: 'Ctrl + F', description: 'Search keywords inside open file', category: 'Editor' },
  { key: 'Ctrl + Space', description: 'Trigger Rock AI inline autocomplete suggestions', category: 'AI' },
  { key: 'Alt + C', description: 'Generate AI code inline based on cursor line context', category: 'AI' },
  { key: 'Alt + B', description: 'Trigger active file bug diagnostic & auto-fix', category: 'AI' },
  { key: 'Ctrl + Shift + F', description: 'Open globally integrated file searcher', category: 'Navigation' },
  { key: 'Ctrl + B', description: 'Toggle left-docked File Explorer sidebar', category: 'Navigation' }
];
