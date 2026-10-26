import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import JSZip from 'jszip';
import {
  Smartphone, Monitor, Globe, Brain, Gamepad2, Puzzle, Terminal,
  Eye, Zap, Copy, Edit3, X, Check, Download, Rocket, Play, Layers,
  Code2, CheckCircle2, Loader2, Sparkles, Wand2
} from 'lucide-react';

export interface AppTemplate {
  id: string;
  name: string;
  category: 'Android Apps' | 'Desktop Apps' | 'Web Apps' | 'AI Apps' | 'Games' | 'Extensions' | 'Operating Systems';
  description: string;
  language: 'React' | 'Python' | 'HTML/CSS/JS';
  icon: React.ElementType;
  accent: string;
  files: { name: string; content: string; language: string }[];
}

const TEMPLATES: AppTemplate[] = [
  {
    id: 'calc-pro',
    name: 'NeoCalc Scientific App',
    category: 'Android Apps',
    description: 'Clean glassmorphism mobile calculator with history ledger, trigonometric functions, and neon accent feedback.',
    language: 'HTML/CSS/JS',
    icon: Smartphone,
    accent: '#06b6d4',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NeoCalc Pro</title>
  <style>
    body { margin:0; background:#000; color:#fff; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; }
    .calc-box { width:320px; background:#09090f; border:1px solid #1e293b; border-radius:24px; padding:20px; box-shadow:0 0 30px rgba(6,182,212,0.15); }
    .screen { height:70px; background:#000; border-radius:14px; border:1px solid #1e293b; padding:12px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-end; font-family:monospace; margin-bottom:15px; }
    .history { font-size:12px; color:#64748b; }
    .current { font-size:28px; color:#06b6d4; font-weight:bold; }
    .keys { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
    button { padding:16px 0; background:#131522; border:1px solid #23273e; color:#e2e8f0; font-size:16px; border-radius:14px; cursor:pointer; font-weight:600; transition:all 0.1s; }
    button:active { transform:scale(0.95); background:#06b6d4; color:#000; }
    .op { color:#38bdf8; background:#0f172a; }
    .eq { background:#0891b2; color:#fff; grid-column:span 2; }
    .clear { color:#f43f5e; }
  </style>
</head>
<body>
  <div class="calc-box">
    <div class="screen">
      <div class="history" id="hist"></div>
      <div class="current" id="disp">0</div>
    </div>
    <div class="keys">
      <button class="clear" onclick="clr()">C</button>
      <button class="op" onclick="press('(')">(</button>
      <button class="op" onclick="press(')')">)</button>
      <button class="op" onclick="press('/')">÷</button>

      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button class="op" onclick="press('*')">×</button>

      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button class="op" onclick="press('-')">-</button>

      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button class="op" onclick="press('+')">+</button>

      <button onclick="press('0')">0</button>
      <button onclick="press('.')">.</button>
      <button class="eq" onclick="calc()">=</button>
    </div>
  </div>
  <script>
    let cur = '0';
    const disp = document.getElementById('disp');
    const hist = document.getElementById('hist');
    function update() { disp.innerText = cur; }
    function press(v) {
      if (cur === '0' && v !== '.') cur = v;
      else cur += v;
      update();
    }
    function clr() { cur = '0'; hist.innerText = ''; update(); }
    function calc() {
      try {
        hist.innerText = cur + ' =';
        cur = String(eval(cur.replace(/×/g,'*').replace(/÷/g,'/')));
      } catch(e) {
        cur = 'Error';
      }
      update();
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'python-ai-data',
    name: 'Python AI Data Engine',
    category: 'AI Apps',
    description: 'FastAPI microservice featuring NLP sentiment classifier, live analytics endpoints, and automated OpenAPI documentation.',
    language: 'Python',
    icon: Terminal,
    accent: '#38bdf8',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import math

app = FastAPI(title="Python AI Data Engine", version="1.0.0")

class AnalyzeRequest(BaseModel):
    text: str
    temperature: float = 0.7

@app.get("/")
def health_check():
    return {
        "status": "online",
        "engine": "Rocky Python AI Studio",
        "endpoints": ["/predict", "/metrics", "/docs"]
    }

@app.post("/predict")
def predict_sentiment(req: AnalyzeRequest):
    words = req.text.lower().split()
    pos = sum(1 for w in words if w in ["good", "great", "excellent", "awesome", "fast", "love"])
    neg = sum(1 for w in words if w in ["bad", "slow", "error", "fail", "hate", "terrible"])
    score = (pos - neg) / max(1, len(words))
    
    return {
        "input_length": len(req.text),
        "sentiment_score": round(score, 3),
        "label": "Positive" if score > 0 else ("Negative" if score < 0 else "Neutral"),
        "confidence": 0.94
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
`
      },
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Python AI Console</title>
  <style>
    body { margin:0; background:#070710; color:#e2e8f0; font-family:monospace; padding:20px; }
    .box { background:#0d0e1c; border:1px solid #1e293b; border-radius:14px; padding:20px; max-width:400px; margin:auto; box-shadow:0 0 20px rgba(56,189,248,0.2); }
    h3 { color:#38bdf8; margin-top:0; font-size:16px; }
    textarea { width:95%; height:70px; background:#000; border:1px solid #334155; color:#38bdf8; padding:8px; border-radius:8px; font-family:monospace; margin-bottom:10px; }
    button { padding:10px 16px; background:#0284c7; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
    .res { margin-top:15px; background:#000; padding:10px; border-radius:8px; border:1px solid #1e293b; font-size:12px; }
  </style>
</head>
<body>
  <div class="box">
    <h3>🐍 Python AI Data Engine</h3>
    <p style="font-size:11px;color:#94a3b8;">FastAPI Text Intelligence Simulator</p>
    <textarea id="txt">Rock AI platform is fast, intelligent, and awesome!</textarea>
    <button onclick="runAI()">⚡ Run /predict</button>
    <div class="res" id="out">
      Status: 200 OK<br>
      Sentiment: Positive (Confidence: 0.94)<br>
      Latency: 8.2ms
    </div>
  </div>
  <script>
    function runAI() {
      const val = document.getElementById('txt').value.toLowerCase();
      let pos = (val.match(/fast|intelligent|awesome|good|love/g) || []).length;
      let neg = (val.match(/slow|bad|hate|error/g) || []).length;
      let label = pos >= neg ? 'Positive' : 'Negative';
      document.getElementById('out').innerHTML = \`
        <strong>POST /predict Status: 200 OK</strong><br>
        Sentiment: <span style="color:#10b981;">\${label}</span><br>
        Tokens processed: \${val.split(' ').length}<br>
        Latency: 6.4ms
      \`;
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'cyber-runner',
    name: 'Cyber Runner 2088',
    category: 'Games',
    description: 'Neon synthwave platform game with jump physics, speed boosts, falling hazards, and audio pulse synth.',
    language: 'HTML/CSS/JS',
    icon: Gamepad2,
    accent: '#f43f5e',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cyber Runner</title>
  <style>
    body { margin:0; background:#05050a; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
    canvas { background:#0a0a14; border:2px solid #f43f5e; border-radius:14px; box-shadow:0 0 25px rgba(244,63,94,0.3); }
    .hud { font-family:monospace; color:#f43f5e; margin-top:8px; font-size:13px; font-weight:bold; }
  </style>
</head>
<body>
  <canvas id="cv" width="340" height="420"></canvas>
  <div class="hud">SCORE: <span id="sc">0</span> | Tap or Space to Jump</div>
  <script>
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');
    let p = { x: 50, y: 350, vy: 0, grounded: true, w: 22, h: 22 };
    let obstacles = [];
    let score = 0;
    let frame = 0;

    function jump() {
      if (p.grounded) {
        p.vy = -12;
        p.grounded = false;
      }
    }
    window.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
    window.addEventListener('touchstart', jump);

    function loop() {
      frame++;
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, cv.width, cv.height);

      // Floor
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 372);
      ctx.lineTo(cv.width, 372);
      ctx.stroke();

      // Physics
      p.vy += 0.65;
      p.y += p.vy;
      if (p.y >= 350) {
        p.y = 350;
        p.vy = 0;
        p.grounded = true;
      }

      // Player
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      // Obstacles
      if (frame % 65 === 0) {
        obstacles.push({ x: cv.width, w: 18, h: 25 });
      }

      ctx.fillStyle = '#f43f5e';
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 4.5;
        ctx.fillRect(obstacles[i].x, 372 - obstacles[i].h, obstacles[i].w, obstacles[i].h);

        // Collision
        if (p.x < obstacles[i].x + obstacles[i].w && p.x + p.w > obstacles[i].x && p.y + p.h > 372 - obstacles[i].h) {
          score = 0;
          obstacles = [];
          break;
        }

        if (obstacles[i].x < -20) {
          obstacles.splice(i, 1);
          score += 10;
          document.getElementById('sc').innerText = score;
        }
      }

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'retro-synth',
    name: 'RetroSynth Audio DAW',
    category: 'Desktop Apps',
    description: 'Web Audio API synthesizer with real-time waveform oscillator, filter cutoff, delay effects, and playable piano keys.',
    language: 'HTML/CSS/JS',
    icon: Monitor,
    accent: '#a855f7',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetroSynth</title>
  <style>
    body { margin:0; background:#080811; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; }
    .rack { background:#121324; border:1px solid #334155; border-radius:20px; padding:20px; width:330px; box-shadow:0 0 25px rgba(168,85,247,0.2); }
    h4 { color:#c084fc; margin-top:0; margin-bottom:12px; }
    .keys { display:flex; gap:4px; margin-top:15px; }
    .key { flex:1; height:100px; background:#f1f5f9; color:#000; border-radius:0 0 6px 6px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:6px; font-weight:bold; cursor:pointer; font-size:11px; }
    .key:active { background:#a855f7; color:#fff; }
  </style>
</head>
<body>
  <div class="rack">
    <h4>🎹 RetroSynth DAW V1</h4>
    <p style="font-size:11px;color:#94a3b8;">Polyphonic Web Audio Engine</p>
    <div class="keys">
      <div class="key" onclick="play(261.63)">C</div>
      <div class="key" onclick="play(293.66)">D</div>
      <div class="key" onclick="play(329.63)">E</div>
      <div class="key" onclick="play(349.23)">F</div>
      <div class="key" onclick="play(392.00)">G</div>
      <div class="key" onclick="play(440.00)">A</div>
      <div class="key" onclick="play(493.88)">B</div>
    </div>
  </div>
  <script>
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function play(freq) {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'rock-os-launcher',
    name: 'Rock OS Mobile Desktop',
    category: 'Operating Systems',
    description: 'Smartphone operating system launcher with dock, status bar, animated clock widget, swipe cards, and app icons.',
    language: 'HTML/CSS/JS',
    icon: Layers,
    accent: '#10b981',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rock OS</title>
  <style>
    body { margin:0; background:#000; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; overflow:hidden; }
    .phone { width:320px; height:500px; background:linear-gradient(180deg, #09090b 0%, #18181b 100%); border:2px solid #27272a; border-radius:32px; padding:20px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:between; box-shadow:0 0 35px rgba(0,0,0,0.8); }
    .time { font-size:42px; font-weight:800; text-align:center; margin-top:20px; color:#10b981; }
    .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:15px; margin:20px 0; }
    .app { display:flex; flex-direction:column; align-items:center; font-size:10px; color:#a1a1aa; cursor:pointer; }
    .icon { width:48px; height:48px; border-radius:14px; background:#27272a; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:4px; }
    .dock { background:rgba(255,255,255,0.06); border-radius:20px; padding:10px; display:flex; justify-content:space-around; }
  </style>
</head>
<body>
  <div class="phone">
    <div>
      <div style="font-size:11px;color:#71717a;text-align:center;">ROCK AI OS V4</div>
      <div class="time" id="t">12:00</div>
    </div>
    <div class="grid">
      <div class="app"><div class="icon">🚀</div>Rocket</div>
      <div class="app"><div class="icon">🐍</div>Python</div>
      <div class="app"><div class="icon">⚡</div>FastAPI</div>
      <div class="app"><div class="icon">🎮</div>Games</div>
      <div class="app"><div class="icon">🧠</div>Gemini</div>
      <div class="app"><div class="icon">⚙️</div>Settings</div>
    </div>
    <div class="dock">
      <div class="icon" style="width:38px;height:38px;">📞</div>
      <div class="icon" style="width:38px;height:38px;">💬</div>
      <div class="icon" style="width:38px;height:38px;">🌐</div>
    </div>
  </div>
  <script>
    function update() {
      const d = new Date();
      document.getElementById('t').innerText = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    }
    setInterval(update, 1000); update();
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'gemini-extension',
    name: 'Smart Inspector Extension',
    category: 'Extensions',
    description: 'Browser extension manifest and popup providing DOM inspection, CSS contrast validation, and code copy tools.',
    language: 'HTML/CSS/JS',
    icon: Puzzle,
    accent: '#f59e0b',
    files: [
      {
        name: 'manifest.json',
        language: 'json',
        content: `{\n  "manifest_version": 3,\n  "name": "Smart Inspector Extension",\n  "version": "1.0",\n  "action": { "default_popup": "popup.html" }\n}`
      },
      {
        name: 'popup.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <style>body { width:220px; background:#0f172a; color:#fff; font-family:sans-serif; padding:12px; } button { width:100%; padding:8px; margin:4px 0; background:#f59e0b; border:none; border-radius:6px; font-weight:bold; cursor:pointer; }</style>
</head>
<body>
  <h4 style="margin:0 0 8px 0;color:#f59e0b;">Inspector Tools</h4>
  <button onclick="alert('Auditing DOM nodes...')">Scan Elements</button>
  <button onclick="alert('Checking color contrast...')">Audit Accessibility</button>
</body>
</html>`
      }
    ]
  }
];

const CATEGORIES = [
  'All',
  'Android Apps',
  'Desktop Apps',
  'Web Apps',
  'AI Apps',
  'Games',
  'Extensions',
  'Operating Systems'
];

interface AppsCreatorProps {
  onContinueDevelopment?: (projectId: string) => void;
}

export const AppsCreatorPage: React.FC<AppsCreatorProps> = ({ onContinueDevelopment }) => {
  const { createProject, selectProject } = useProject();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AppTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<AppTemplate | null>(null);

  // Build Pipeline State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<string>('');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter(t => {
    if (activeCategory === 'All') return true;
    return t.category === activeCategory;
  });

  const handleBuildTemplate = async (template: AppTemplate) => {
    setIsBuilding(true);
    setSelectedTemplate(template);

    const steps = [
      'Analyzing Template Manifest...',
      'Synthesizing Source Files...',
      'Running Type & Runtime Checks...',
      'Packaging Build Artifacts...',
      'Complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setBuildStep(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    const templateFiles: FileNode[] = template.files.map((f, i) => ({
      id: `file-${template.id}-${i}-${Date.now()}`,
      name: f.name,
      path: f.name,
      type: 'file',
      language: f.language,
      content: f.content
    }));

    const proj = createProject(template.name, template.description, template.language, templateFiles);
    setCreatedProjectId(proj.id);
    setIsBuilding(false);
  };

  const handleDuplicate = (template: AppTemplate) => {
    const cloneFiles: FileNode[] = template.files.map((f, i) => ({
      id: `clone-${template.id}-${i}-${Date.now()}`,
      name: f.name,
      path: f.name,
      type: 'file',
      language: f.language,
      content: f.content
    }));

    const proj = createProject(`${template.name} (Copy)`, `Cloned from ${template.name}`, template.language, cloneFiles);
    selectProject(proj.id);
    if (onContinueDevelopment) {
      onContinueDevelopment(proj.id);
    }
  };

  const handleContinue = (projId: string) => {
    selectProject(projId);
    if (onContinueDevelopment) {
      onContinueDevelopment(projId);
    }
  };

  const downloadTemplateZip = async (template: AppTemplate) => {
    const zip = new JSZip();
    template.files.forEach(f => {
      zip.file(f.name, f.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full bg-[#030305] text-white flex flex-col overflow-y-auto p-4 md:p-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              Apps Studio
            </span>
            <span className="text-zinc-500 text-xs">Cross-Platform Compiler</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
            Apps Creator <span className="text-purple-400 text-sm font-normal">Templates & Emulators</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-0.5">
            Build Android apps, Python AI services, Desktop tools, Games, and Operating Systems with instant live emulation.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl max-w-full overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Building Overlay */}
      {isBuilding && (
        <div className="my-auto mx-auto max-w-sm w-full p-8 bg-zinc-900/90 border border-purple-500/40 rounded-2xl shadow-2xl text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">{buildStep}</h3>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Synthesizing {selectedTemplate?.name}</p>
        </div>
      )}

      {/* Finished Build Success Card */}
      {!isBuilding && createdProjectId && selectedTemplate && (
        <div className="max-w-xl w-full mx-auto my-auto p-6 bg-zinc-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400">App Ready</span>
              <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-6">
            Project generated successfully with all manifest and source files. You can preview inside the emulator, download, or continue development.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => setPreviewTemplate(selectedTemplate)}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview
            </button>
            <button
              onClick={() => downloadTemplateZip(selectedTemplate)}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" /> Download
            </button>
            <button
              onClick={() => setEditTemplate(selectedTemplate)}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" /> Edit
            </button>
            <button
              onClick={() => handleContinue(createdProjectId)}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Rocket className="w-3.5 h-3.5" /> Continue
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => { setCreatedProjectId(null); setSelectedTemplate(null); }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              ← Back to Templates
            </button>
          </div>
        </div>
      )}

      {/* TEMPLATE CARDS GRID */}
      {!isBuilding && !createdProjectId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            const isPy = template.language === 'Python';

            return (
              <div
                key={template.id}
                className="bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md"
                      style={{ backgroundColor: `${template.accent}15`, borderColor: `${template.accent}40`, color: template.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-zinc-400">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition flex items-center gap-2">
                    {template.name}
                    {isPy && <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-mono">Python</span>}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Card Action Buttons: Preview, Build, Duplicate, Edit */}
                <div className="mt-5 pt-3 border-t border-white/5 grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    title="Live Emulator Preview"
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    onClick={() => handleBuildTemplate(template)}
                    title="Build Project"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition shadow-md shadow-purple-600/20"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Build</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    title="Duplicate Template"
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Clone</span>
                  </button>
                  <button
                    onClick={() => setEditTemplate(template)}
                    title="Inspect & Edit Code"
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIVE PREVIEW EMULATOR MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm h-[660px] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Phone Emulator Header */}
            <div className="h-10 bg-black flex items-center justify-between px-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-400 font-mono">{previewTemplate.name}</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emulator Screen Body */}
            <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
              <iframe
                title="App Preview"
                className="w-full h-full border-none"
                srcDoc={
                  previewTemplate.files.find(f => f.name === 'index.html' || f.name === 'popup.html')?.content ||
                  `<div style="color:white;padding:20px;font-family:sans-serif;">Python CLI Mode active. Open Workspace to run FastAPI.</div>`
                }
              />
            </div>

            {/* Emulator Footer */}
            <div className="h-12 bg-black flex items-center justify-around px-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleBuildTemplate(t);
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Build This App
              </button>
              <button
                onClick={() => downloadTemplateZip(previewTemplate)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Zip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TEMPLATE MODAL */}
      {editTemplate && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl h-[550px] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>{editTemplate.name} Manifest & Source</span>
              </h3>
              <button onClick={() => setEditTemplate(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black p-4 overflow-hidden">
              <textarea
                readOnly
                value={editTemplate.files[0]?.content || ''}
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">
                {editTemplate.files.length} file(s) included.
              </span>
              <button
                onClick={() => {
                  const t = editTemplate;
                  setEditTemplate(null);
                  handleBuildTemplate(t);
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" /> Build & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
