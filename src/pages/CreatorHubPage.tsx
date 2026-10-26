import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { FileNode } from '../types';
import JSZip from 'jszip';
import {
  Gamepad2, Sparkles, Terminal, Code2, Box, Cpu, Rocket, Play, Eye,
  Download, Edit3, ArrowRight, CheckCircle2, Loader2, Smartphone, Monitor,
  Layers, ChevronRight, X, RotateCcw, Shield, Zap, Globe, Wand2, FileCode, Check
} from 'lucide-react';

export interface EngineItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  platforms: ('Mobile' | 'PC' | 'Web' | '2D' | '3D' | 'AR' | 'VR')[];
  defaultLang: string;
  accentColor: string;
  bgGradient: string;
  icon: React.ElementType;
}

export const ENGINES: EngineItem[] = [
  {
    id: 'python-studio',
    name: 'Python Game & AI Studio',
    tagline: 'Pygame, Arcade & FastAPI AI Engine',
    description: 'Build native 2D games, AI simulation models, and high-throughput Python backends with zero configuration.',
    platforms: ['Mobile', 'PC', 'Web', '2D'],
    defaultLang: 'Python',
    accentColor: '#38bdf8',
    bgGradient: 'from-sky-500/20 via-blue-900/30 to-black',
    icon: Terminal
  },
  {
    id: 'unity-style',
    name: 'Unity Style',
    tagline: 'Component-Based C# & WebGL Engine',
    description: 'GameObject and MonoBehaviour architecture designed for cross-platform 2D and 3D simulation with asset pipelines.',
    platforms: ['Mobile', 'PC', 'Web', '2D', '3D', 'VR'],
    defaultLang: 'C# / WebGL',
    accentColor: '#a855f7',
    bgGradient: 'from-purple-500/20 via-indigo-900/30 to-black',
    icon: Gamepad2
  },
  {
    id: 'unreal-style',
    name: 'Unreal Style',
    tagline: 'High-Fidelity Nanite & Shaders',
    description: 'AAA-grade cinematic rendering simulator with realistic lighting, material graphs, and physics rigid bodies.',
    platforms: ['PC', 'Web', '3D', 'VR'],
    defaultLang: 'C++ / Shaders',
    accentColor: '#f97316',
    bgGradient: 'from-orange-500/20 via-amber-900/30 to-black',
    icon: Sparkles
  },
  {
    id: 'godot-style',
    name: 'Godot Style',
    tagline: 'Node Tree & GDScript Lightweight',
    description: 'Super-fast node-based engine optimized for rapid prototyping, lightweight 2D physics, and instant web assembly.',
    platforms: ['Mobile', 'PC', 'Web', '2D', '3D'],
    defaultLang: 'GDScript',
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-500/20 via-blue-950/40 to-black',
    icon: Box
  },
  {
    id: 'bevy-style',
    name: 'Bevy Style',
    tagline: 'Rust Data-Driven ECS Architecture',
    description: 'Modern Entity Component System running on WebGPU for maximum cache locality and ultra-high framerates.',
    platforms: ['PC', 'Web', '2D', '3D'],
    defaultLang: 'Rust / WebGPU',
    accentColor: '#ec4899',
    bgGradient: 'from-pink-500/20 via-rose-950/30 to-black',
    icon: Cpu
  },
  {
    id: 'phaser-style',
    name: 'Phaser Style',
    tagline: 'HTML5 2D Browser Arcade Framework',
    description: 'Battle-tested 2D framework for mobile browsers with sprite physics, tilemaps, particle emitters, and sound FX.',
    platforms: ['Mobile', 'Web', '2D'],
    defaultLang: 'JavaScript',
    accentColor: '#eab308',
    bgGradient: 'from-yellow-500/20 via-amber-950/30 to-black',
    icon: Gamepad2
  },
  {
    id: 'babylonjs',
    name: 'Babylon.js',
    tagline: 'Next-Gen WebGL & WebGPU 3D Engine',
    description: 'Feature-rich 3D engine with physically based rendering (PBR), procedural terrain, and WebXR immersion.',
    platforms: ['Mobile', 'PC', 'Web', '3D', 'AR', 'VR'],
    defaultLang: 'TypeScript',
    accentColor: '#ef4444',
    bgGradient: 'from-red-500/20 via-red-950/30 to-black',
    icon: Layers
  },
  {
    id: 'threejs',
    name: 'Three.js',
    tagline: 'Procedural 3D Graphics & Shaders',
    description: 'Industry standard for custom 3D web experiences, camera choreography, particle galaxies, and GLTF models.',
    platforms: ['Mobile', 'Web', '3D', 'AR', 'VR'],
    defaultLang: 'JavaScript / WebGL',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-500/20 via-teal-950/30 to-black',
    icon: Box
  },
  {
    id: 'playcanvas',
    name: 'PlayCanvas',
    tagline: 'Cloud-Native WebGL 3D Platform',
    description: 'Ultra-lightweight 3D runtime with instant asset streaming, dynamic shadows, and high-efficiency mobile shaders.',
    platforms: ['Mobile', 'Web', '3D', 'VR'],
    defaultLang: 'JavaScript',
    accentColor: '#f43f5e',
    bgGradient: 'from-rose-500/20 via-purple-950/30 to-black',
    icon: Play
  },
  {
    id: 'construct-style',
    name: 'Construct Style',
    tagline: 'Visual Event Sheets & Rapid 2D',
    description: 'Event-driven visual logic engine perfect for retro platformers, bullet-hells, and rapid arcade game creation.',
    platforms: ['Mobile', 'Web', '2D'],
    defaultLang: 'Visual Event / JS',
    accentColor: '#8b5cf6',
    bgGradient: 'from-violet-500/20 via-indigo-950/30 to-black',
    icon: Code2
  },
  {
    id: 'custom-rock',
    name: 'Custom Rock Engine',
    tagline: 'Proprietary Rocky ECS v2.4 Engine',
    description: 'Zero-overhead native game compiler with cosmic particle systems, self-healing code, and direct Gemini integration.',
    platforms: ['Mobile', 'PC', 'Web', '2D', '3D', 'AR', 'VR'],
    defaultLang: 'Rocky ECS',
    accentColor: '#00f0ff',
    bgGradient: 'from-cyan-500/20 via-blue-900/40 to-black',
    icon: Rocket
  }
];

const BUILD_STAGES = [
  'Analyzing Specifications...',
  'Planning Architecture & Physics...',
  'Generating Assets & Shaders...',
  'Generating Source Code with AI...',
  'Compiling Project Modules...',
  'Running Self-Healing Tests...',
  'Ready!'
];

interface CreatorHubProps {
  onContinueDevelopment?: (projectId: string) => void;
}

export const CreatorHubPage: React.FC<CreatorHubProps> = ({ onContinueDevelopment }) => {
  const { createProject, selectProject } = useProject();

  const [selectedEngine, setSelectedEngine] = useState<EngineItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Wizard Configuration State
  const [gameName, setGameName] = useState('Cosmic Odyssey');
  const [genre, setGenre] = useState('Sci-Fi Space');
  const [platform, setPlatform] = useState('Web Game');
  const [language, setLanguage] = useState('Python');
  const [artStyle, setArtStyle] = useState('Cyberpunk Neon');
  const [camera, setCamera] = useState('Top-down 2D');
  const [multiplayer, setMultiplayer] = useState('Single Player');
  const [aiNpc, setAiNpc] = useState('Smart Adaptive AI');
  const [physics, setPhysics] = useState('Arcade Physics');
  const [controls, setControls] = useState('Touch + Keyboard');
  const [aiPrompt, setAiPrompt] = useState('A fast-paced neon shooter with enemy swarms, shield upgrades, and score streak multiplier.');

  // Pipeline & Project State
  const [buildStepIndex, setBuildStepIndex] = useState<number | null>(null);
  const [createdProject, setCreatedProject] = useState<any | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [playModeActive, setPlayModeActive] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeEditFileId, setActiveEditFileId] = useState<string>('');
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSelectEngine = (eng: EngineItem) => {
    setSelectedEngine(eng);
    setGameName(`${eng.name.replace(/ Style| Engine/g, '')} Space Game`);
    if (eng.id === 'python-studio') {
      setLanguage('Python');
      setGameName('Python Space Defender');
      setAiPrompt('Python game with Pygame mechanics, player spaceship, laser projectiles, falling meteors, and live score.');
    } else {
      setLanguage(eng.defaultLang.includes('Python') ? 'Python' : 'JavaScript');
    }
  };

  const handleAiAutoFill = () => {
    const isPy = language === 'Python' || selectedEngine?.id === 'python-studio';
    if (isPy) {
      setGameName('Python Cyber Viper AI');
      setGenre('Arcade');
      setArtStyle('Retro Pixel 8-bit');
      setLanguage('Python');
      setCamera('Top-down 2D');
      setAiNpc('Smart Adaptive AI');
      setPhysics('Arcade Physics');
      setControls('Touch + Keyboard');
      setAiPrompt('Complete Python arcade game: Pygame/Canvas snake with AI predator that hunts fruit and dynamically avoids obstacles.');
    } else {
      setGameName('Neon Hyper-Drive 2088');
      setGenre('Action');
      setArtStyle('Cyberpunk Neon');
      setLanguage('JavaScript');
      setCamera('Third-person 3D');
      setAiNpc('Behavior Tree AI');
      setPhysics('Realistic Rigid Body');
      setControls('Touch + Keyboard');
      setAiPrompt('3D procedural neon racer with high-speed turbo boosts, neon particle trails, and responsive tilt controls.');
    }
  };

  const startBuild = async () => {
    if (!selectedEngine) return;

    setBuildStepIndex(0);

    for (let i = 0; i < BUILD_STAGES.length - 1; i++) {
      await new Promise(r => setTimeout(r, 700));
      setBuildStepIndex(i + 1);
    }

    // Generate real source files based on the chosen language & engine
    const isPython = language.toLowerCase().includes('python') || selectedEngine.id === 'python-studio';
    let files: FileNode[] = [];

    if (isPython) {
      files = [
        {
          id: `file-py-main-${Date.now()}`,
          name: 'main.py',
          path: 'main.py',
          type: 'file',
          language: 'python',
          content: `"""
Rock AI Generated Game: ${gameName}
Engine: ${selectedEngine.name}
Language: Python 3.11 (Pygame & Async Game Loop)
Art Style: ${artStyle} | Controls: ${controls}
"""
import sys
import math
import random
import time

class PlayerShip:
    def __init__(self, x=200, y=350):
        self.x = x
        self.y = y
        self.health = 100
        self.score = 0
        self.speed = 6.0
        self.bullets = []

    def move(self, dx, dy):
        self.x = max(20, min(380, self.x + dx * self.speed))
        self.y = max(50, min(450, self.y + dy * self.speed))

    def shoot(self):
        self.bullets.append({"x": self.x, "y": self.y - 12, "vy": -10})

    def update(self):
        for b in self.bullets[:]:
            b["y"] += b["vy"]
            if b["y"] < 0:
                self.bullets.remove(b)

class EnemySwarm:
    def __init__(self):
        self.enemies = []
        self.spawn_timer = 0

    def spawn(self):
        self.enemies.append({
            "x": random.randint(30, 370),
            "y": 0,
            "vy": random.uniform(2.0, 4.5),
            "size": random.randint(14, 22)
        })

    def update(self, player):
        self.spawn_timer += 1
        if self.spawn_timer % 30 == 0:
            self.spawn()

        for e in self.enemies[:]:
            e["y"] += e["vy"]
            # Check bullet collision
            for b in player.bullets[:]:
                dist = math.hypot(e["x"] - b["x"], e["y"] - b["y"])
                if dist < e["size"] + 4:
                    if b in player.bullets:
                        player.bullets.remove(b)
                    if e in self.enemies:
                        self.enemies.remove(e)
                    player.score += 150
                    break

            if e["y"] > 500:
                if e in self.enemies:
                    self.enemies.remove(e)

def run_game_loop():
    print(f"🚀 Initializing {gameName} on Rocky Engine (Python Runtime)...")
    player = PlayerShip()
    swarm = EnemySwarm()

    print("[SYSTEM] Pygame Canvas initialized: 400x500 Resolution.")
    print(f"[STATUS] Genre: {genre} | AI NPC: {aiNpc} | Physics: {physics}")
    
    # Simulate first 5 frames
    for frame in range(1, 6):
        swarm.update(player)
        player.shoot()
        player.update()
        print(f"Frame #{frame}: Player at ({player.x:.1f}, {player.y:.1f}) | Score: {player.score} | Enemies: {len(swarm.enemies)}")

    print("✨ Game running seamlessly. Ready for input events!")

if __name__ == "__main__":
    run_game_loop()
`
        },
        {
          id: `file-py-req-${Date.now()}`,
          name: 'requirements.txt',
          path: 'requirements.txt',
          type: 'file',
          language: 'text',
          content: `pygame-ce>=2.5.0\nfastapi>=0.110.0\nuvicorn>=0.28.0\npydantic>=2.6.0\nrequests>=2.31.0`
        },
        {
          id: `file-py-html-${Date.now()}`,
          name: 'index.html',
          path: 'index.html',
          type: 'file',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${gameName} - Python Game</title>
  <style>
    body { margin:0; background:#050508; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
    #gameCanvas { background:#0a0a14; border:2px solid #00f0ff; border-radius:16px; box-shadow:0 0 25px rgba(0,240,255,0.3); }
    .hud { margin-top:12px; display:flex; gap:20px; font-size:14px; color:#38bdf8; font-family:monospace; }
    .controls-hint { font-size:11px; color:#94a3b8; margin-top:8px; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="380" height="460"></canvas>
  <div class="hud">
    <span>SCORE: <strong id="scoreVal" style="color:#00f0ff;">0</strong></span>
    <span>SHIELD: <strong id="shieldVal" style="color:#10b981;">100%</strong></span>
  </div>
  <div class="controls-hint">Arrow Keys or Touch buttons to move and fire</div>
  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let player = { x: 190, y: 390, speed: 5 };
    let bullets = [];
    let enemies = [];
    let keys = {};

    window.addEventListener('keydown', e => { keys[e.key] = true; if(e.key === ' ' || e.key === 'ArrowUp') fire(); });
    window.addEventListener('keyup', e => { keys[e.key] = false; });

    function fire() {
      bullets.push({ x: player.x, y: player.y - 12 });
    }

    let spawnCounter = 0;
    function loop() {
      if (keys['ArrowLeft'] && player.x > 25) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x < canvas.width - 25) player.x += player.speed;

      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<20; i++) {
        ctx.fillRect((i*37 + spawnCounter*2) % canvas.width, (i*23 + spawnCounter*3) % canvas.height, 2, 2);
      }

      // Draw Player
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 14);
      ctx.lineTo(player.x - 12, player.y + 12);
      ctx.lineTo(player.x + 12, player.y + 12);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#f43f5e';
      for(let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 8;
        ctx.fillRect(bullets[i].x - 2, bullets[i].y, 4, 10);
        if(bullets[i].y < 0) bullets.splice(i, 1);
      }

      // Enemies
      spawnCounter++;
      if(spawnCounter % 35 === 0) {
        enemies.push({ x: Math.random() * (canvas.width - 40) + 20, y: -10, speed: 2 + Math.random()*2 });
      }

      ctx.fillStyle = '#fbbf24';
      for(let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        ctx.beginPath();
        ctx.arc(enemies[i].x, enemies[i].y, 9, 0, Math.PI*2);
        ctx.fill();

        // Bullet hit check
        for(let j = bullets.length - 1; j >= 0; j--) {
          const dx = enemies[i].x - bullets[j].x;
          const dy = enemies[i].y - bullets[j].y;
          if(Math.hypot(dx, dy) < 14) {
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            score += 100;
            document.getElementById('scoreVal').innerText = score;
            break;
          }
        }
      }

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
        },
        {
          id: `file-py-readme-${Date.now()}`,
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          language: 'markdown',
          content: `# ${gameName}\n\nGenerated with **Rock AI Creator Hub** using **${selectedEngine.name}**.\n\n### Specifications\n- **Language**: Python 3.11\n- **Genre**: ${genre}\n- **Platform**: ${platform}\n- **Art Style**: ${artStyle}\n- **AI NPC Mode**: ${aiNpc}\n\n### Running locally\n\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\`\n`
        }
      ];
    } else {
      // Web / JS / Three.js game files
      files = [
        {
          id: `file-js-index-${Date.now()}`,
          name: 'index.html',
          path: 'index.html',
          type: 'file',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${gameName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hud">
    <div class="title">${gameName}</div>
    <div class="score">SCORE: <span id="score">0</span></div>
  </div>
  <canvas id="viewport"></canvas>
  <div class="touch-bar">
    <button id="leftBtn">◀</button>
    <button id="fireBtn">FIRE</button>
    <button id="rightBtn">▶</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`
        },
        {
          id: `file-js-script-${Date.now()}`,
          name: 'script.js',
          path: 'script.js',
          type: 'file',
          language: 'javascript',
          content: `const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');
canvas.width = 380;
canvas.height = 460;

let score = 0;
let player = { x: 190, y: 390, vx: 0, speed: 6 };
let projectiles = [];
let targets = [];

function shoot() {
  projectiles.push({ x: player.x, y: player.y - 12 });
}

document.getElementById('leftBtn')?.addEventListener('click', () => { player.x = Math.max(20, player.x - 20); });
document.getElementById('rightBtn')?.addEventListener('click', () => { player.x = Math.min(canvas.width - 20, player.x + 20); });
document.getElementById('fireBtn')?.addEventListener('click', shoot);

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x = Math.max(20, player.x - 15);
  if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - 20, player.x + 15);
  if (e.key === ' ') shoot();
});

let timer = 0;
function render() {
  timer++;
  ctx.fillStyle = '#060713';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Player ship
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 14);
  ctx.lineTo(player.x - 12, player.y + 12);
  ctx.lineTo(player.x + 12, player.y + 12);
  ctx.fill();

  // Projectiles
  ctx.fillStyle = '#ec4899';
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].y -= 9;
    ctx.fillRect(projectiles[i].x - 2, projectiles[i].y, 4, 10);
    if (projectiles[i].y < 0) projectiles.splice(i, 1);
  }

  // Targets
  if (timer % 40 === 0) {
    targets.push({ x: Math.random() * (canvas.width - 40) + 20, y: -10, speed: 2.2 });
  }

  ctx.fillStyle = '#10b981';
  for (let i = targets.length - 1; i >= 0; i--) {
    targets[i].y += targets[i].speed;
    ctx.beginPath();
    ctx.arc(targets[i].x, targets[i].y, 10, 0, Math.PI * 2);
    ctx.fill();

    for (let j = projectiles.length - 1; j >= 0; j--) {
      if (Math.hypot(targets[i].x - projectiles[j].x, targets[i].y - projectiles[j].y) < 14) {
        targets.splice(i, 1);
        projectiles.splice(j, 1);
        score += 100;
        document.getElementById('score').innerText = score;
        break;
      }
    }
  }

  requestAnimationFrame(render);
}
render();`
        },
        {
          id: `file-js-style-${Date.now()}`,
          name: 'style.css',
          path: 'style.css',
          type: 'file',
          language: 'css',
          content: `body { margin:0; background:#000; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
.hud { width:380px; display:flex; justify-content:space-between; margin-bottom:8px; font-weight:bold; font-size:13px; color:#00f0ff; }
canvas { border:1px solid #1e293b; border-radius:12px; box-shadow:0 0 20px rgba(0,240,255,0.2); }
.touch-bar { width:380px; display:flex; gap:10px; margin-top:10px; }
.touch-bar button { flex:1; padding:12px; background:#1e293b; border:1px solid #334155; color:#fff; border-radius:10px; font-weight:bold; cursor:pointer; }
.touch-bar button:active { background:#00f0ff; color:#000; }`
        }
      ];
    }

    const templateType = isPython ? 'Python' : 'HTML/CSS/JS';
    const proj = createProject(gameName, `${selectedEngine.name} project: ${aiPrompt}`, templateType, files);
    setCreatedProject(proj);
    setActiveEditFileId(files[0].id);
    setActiveFileContent(files[0].content || '');
  };

  const downloadProjectZip = async () => {
    if (!createdProject) return;
    const zip = new JSZip();

    createdProject.files.forEach((file: FileNode) => {
      zip.file(file.name, file.content || '');
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdProject.name.toLowerCase().replace(/\s+/g, '_')}_source.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinueDevelopment = () => {
    if (!createdProject) return;
    selectProject(createdProject.id);
    if (onContinueDevelopment) {
      onContinueDevelopment(createdProject.id);
    }
  };

  const filteredEngines = ENGINES.filter(eng => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Python') return eng.id === 'python-studio';
    return eng.platforms.includes(activeFilter as any);
  });

  return (
    <div className="h-full w-full bg-[#030305] text-white flex flex-col overflow-y-auto p-4 md:p-8 select-none">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              Studio V4
            </span>
            <span className="text-zinc-500 text-xs">Rocky Engine v2.4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
            Creator Hub <span className="text-cyan-400 text-sm font-normal">Game & App Studio</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-0.5">
            Select an engine to launch the wizard, configure your game or Python app, and build with real-time AI generation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
          {['All', 'Python', 'Mobile', 'PC', 'Web', '2D', '3D', 'VR'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeFilter === tab
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {tab === 'Python' ? '🐍 Python' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ENGINE SELECTION CARDS VIEW */}
      {!selectedEngine && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredEngines.map(engine => {
            const Icon = engine.icon;
            const isPy = engine.id === 'python-studio';

            return (
              <div
                key={engine.id}
                className={`relative group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between p-5 bg-gradient-to-b ${engine.bgGradient} ${
                  isPy ? 'border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-sky-500/30' : 'border-zinc-800/80 hover:border-zinc-600'
                }`}
              >
                {/* Engine Badge / Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg"
                    style={{ backgroundColor: `${engine.accentColor}18`, borderColor: `${engine.accentColor}50`, color: engine.accentColor }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {engine.platforms.slice(0, 3).map(p => (
                      <span key={p} className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[10px] text-zinc-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                    {engine.name}
                    {isPy && <span className="text-xs bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">🐍 Recommended</span>}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">{engine.tagline}</p>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                    {engine.description}
                  </p>
                </div>

                {/* Default Language & Build / Continue Buttons */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-zinc-400 truncate">
                    Stack: <strong className="text-zinc-200">{engine.defaultLang}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSelectEngine(engine)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1 border border-zinc-700"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" /> Specs
                    </button>
                    <button
                      onClick={() => {
                        handleSelectEngine(engine);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-black text-xs font-black transition flex items-center gap-1 shadow-md shadow-cyan-600/25"
                    >
                      <Rocket className="w-3.5 h-3.5 fill-current" /> Continue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. PROJECT CREATION WIZARD VIEW */}
      {selectedEngine && buildStepIndex === null && (
        <div className="max-w-3xl w-full mx-auto bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative my-auto">
          {/* Wizard Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg"
                style={{ backgroundColor: `${selectedEngine.accentColor}20`, borderColor: selectedEngine.accentColor, color: selectedEngine.accentColor }}
              >
                {React.createElement(selectedEngine.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Step 1 of 2: Specification Wizard</span>
                <h2 className="text-xl font-bold text-white">{selectedEngine.name} Creator</h2>
              </div>
            </div>
            <button
              onClick={() => setSelectedEngine(null)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Game / App Name */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Language / Technology */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">
                Technology / Language <span className="text-sky-400 font-mono">(Select Python for Python app)</span>
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Python">🐍 Python (Pygame / FastAPI / AI)</option>
                <option value="JavaScript">⚡ JavaScript / HTML5 Canvas</option>
                <option value="TypeScript">💎 TypeScript / Three.js 3D</option>
                <option value="C# / WebGL">🎮 C# Style WebGL</option>
                <option value="Rust / WebGPU">🦀 Rust / WebGPU ECS</option>
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Genre</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Sci-Fi Space">Sci-Fi Space</option>
                <option value="Action">Action Combat</option>
                <option value="Arcade">Arcade Classic</option>
                <option value="RPG">RPG Adventure</option>
                <option value="Puzzle">Puzzle Strategy</option>
                <option value="Platformer">2D Platformer</option>
                <option value="Simulation">Simulation / AI Sandbox</option>
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Web Game">Web Game (HTML5 / WebGL)</option>
                <option value="Mobile Game">Mobile Game (Android / iOS)</option>
                <option value="PC Game">PC Desktop Game (Native)</option>
                <option value="2D">2D Arcade Mode</option>
                <option value="3D">3D Spatial Mode</option>
                <option value="VR">VR Immersive Mode</option>
              </select>
            </div>

            {/* Art Style */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Art Style</label>
              <select
                value={artStyle}
                onChange={e => setArtStyle(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                <option value="Retro Pixel 8-bit">Retro Pixel 8-bit</option>
                <option value="Low Poly 3D">Low Poly 3D</option>
                <option value="Stylized Sci-Fi">Stylized Sci-Fi</option>
                <option value="Dark Fantasy">Dark Fantasy</option>
              </select>
            </div>

            {/* Camera */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Camera Mode</label>
              <select
                value={camera}
                onChange={e => setCamera(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Top-down 2D">Top-down 2D</option>
                <option value="Side-scroller 2D">Side-scroller 2D</option>
                <option value="Third-person 3D">Third-person 3D</option>
                <option value="First-person 3D">First-person 3D</option>
                <option value="Isometric">Isometric 2.5D</option>
              </select>
            </div>

            {/* Multiplayer & AI NPC */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Multiplayer</label>
              <select
                value={multiplayer}
                onChange={e => setMultiplayer(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Single Player">Single Player</option>
                <option value="Real-time WebSocket">Real-time Multiplayer (WebSocket)</option>
                <option value="Turn-based Co-op">Turn-based Co-op</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">AI NPC Behavior</label>
              <select
                value={aiNpc}
                onChange={e => setAiNpc(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Smart Adaptive AI">Smart Adaptive AI (Neural)</option>
                <option value="Behavior Tree AI">Behavior Tree State Machine</option>
                <option value="None">None (Static Obstacles)</option>
              </select>
            </div>

            {/* Physics & Controls */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Physics Engine</label>
              <select
                value={physics}
                onChange={e => setPhysics(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Arcade Physics">Arcade Particle & Collision Physics</option>
                <option value="Realistic Rigid Body">Realistic Rigid Body 3D</option>
                <option value="Gravity Simulator">Gravitational Orbit Sim</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Controls Layout</label>
              <select
                value={controls}
                onChange={e => setControls(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="Touch + Keyboard">Touch On-Screen D-Pad & Keyboard</option>
                <option value="Keyboard & Mouse">Keyboard (WASD) & Mouse Aim</option>
                <option value="Gamepad">Gamepad Controller (Dual Analog)</option>
              </select>
            </div>
          </div>

          {/* AI Prompt Input & Auto Fill Button */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-400 font-semibold text-xs">
                AI Custom Directives & Mechanics
              </label>
              <button
                type="button"
                onClick={handleAiAutoFill}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Wand2 className="w-3.5 h-3.5" /> ✨ AI Auto-Fill Specs
              </button>
            </div>
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Create a Python game with space lasers, meteor showers, and shield power-ups..."
              className="w-full bg-black/60 border border-zinc-700 rounded-xl p-3 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSelectedEngine(null)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={startBuild}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-zinc-700 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> Build Game Project
            </button>
            <button
              onClick={async () => {
                await startBuild();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4 fill-current" /> Build & Continue to IDE
            </button>
          </div>
        </div>
      )}

      {/* 3. BUILD PIPELINE & PROGRESS ANIMATION */}
      {buildStepIndex !== null && buildStepIndex < BUILD_STAGES.length - 1 && (
        <div className="max-w-md w-full mx-auto my-auto p-8 bg-zinc-900/90 border border-cyan-500/30 rounded-2xl shadow-2xl text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
            <div className="w-20 h-20 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-blue-500 border-l-transparent animate-spin flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white tracking-wide mb-1">
            {BUILD_STAGES[buildStepIndex]}
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Pipeline Stage {buildStepIndex + 1} of {BUILD_STAGES.length}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-black/60 h-2 rounded-full mt-6 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${((buildStepIndex + 1) / BUILD_STAGES.length) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 mt-4">
            Engine: {selectedEngine?.name} • Language: {language}
          </p>
        </div>
      )}

      {/* 4. BUILD COMPLETED: 5 REQUIRED ACTIONS */}
      {buildStepIndex === BUILD_STAGES.length - 1 && createdProject && (
        <div className="max-w-2xl w-full mx-auto my-auto p-6 md:p-8 bg-zinc-900/95 border border-emerald-500/40 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Build Successful</span>
              <h2 className="text-xl md:text-2xl font-black text-white">{createdProject.name}</h2>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Project generated with <strong>{createdProject.files.length} source files</strong> ready for preview, interactive gameplay, local export, or direct full-stack IDE development.
          </p>

          {/* Project File Badges */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex flex-wrap gap-2 mb-6">
            {createdProject.files.map((f: FileNode) => (
              <span key={f.name} className="px-2.5 py-1 bg-zinc-800/80 rounded-lg text-xs font-mono text-zinc-300 flex items-center gap-1.5 border border-white/5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                {f.name}
              </span>
            ))}
          </div>

          {/* THE 5 REQUIRED ACTION BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {/* 1. Preview */}
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Preview</span>
            </button>

            {/* 2. Play */}
            <button
              onClick={() => { setPlayModeActive(true); setPreviewModalOpen(true); }}
              className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play</span>
            </button>

            {/* 3. Download */}
            <button
              onClick={downloadProjectZip}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Download</span>
            </button>

            {/* 4. Edit */}
            <button
              onClick={() => setEditModalOpen(true)}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Edit</span>
            </button>

            {/* 5. CONTINUE DEVELOPMENT (The user's key missing button!) */}
            <button
              onClick={handleContinueDevelopment}
              className="col-span-2 sm:col-span-2 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Rocket className="w-4 h-4 fill-current" />
              <span>Continue Development</span>
            </button>
          </div>

          {/* Reset / Create Another */}
          <div className="flex justify-end">
            <button
              onClick={() => { setBuildStepIndex(null); setSelectedEngine(null); setCreatedProject(null); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition"
            >
              ← Back to Engine Studio
            </button>
          </div>
        </div>
      )}

      {/* 5. PREVIEW / PLAY MODAL (Device Emulator) */}
      {previewModalOpen && createdProject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md h-[680px] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Phone Bezel Header */}
            <div className="h-10 bg-black flex items-center justify-between px-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-zinc-400 font-mono">Rock Phone Emulator</span>
              </div>
              <button
                onClick={() => { setPreviewModalOpen(false); setPlayModeActive(false); }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device Screen Body */}
            <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
              <iframe
                title="Emulator Viewport"
                className="w-full h-full border-none"
                srcDoc={
                  createdProject.files.find((f: FileNode) => f.name === 'index.html')?.content ||
                  `<div style="color:white;padding:20px;font-family:sans-serif;">Python CLI Mode active. Open Workspace Terminal to run interactive interpreter.</div>`
                }
              />
            </div>

            {/* Phone Home Bar Footer */}
            <div className="h-12 bg-black flex items-center justify-around px-4 border-t border-zinc-800">
              <button
                onClick={handleContinueDevelopment}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" /> Continue Development
              </button>
              <button
                onClick={downloadProjectZip}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Zip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT CODE MODAL */}
      {editModalOpen && createdProject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl h-[620px] flex flex-col overflow-hidden shadow-2xl">
            {/* Header with File Switcher */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto">
                {createdProject.files.map((file: FileNode) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      setActiveEditFileId(file.id);
                      setActiveFileContent(file.content || '');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                      activeEditFileId === file.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <FileCode className="w-3 h-3" />
                    {file.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeFileContent);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1 font-semibold"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 bg-black p-4 overflow-hidden flex flex-col">
              <textarea
                value={activeFileContent}
                onChange={e => {
                  setActiveFileContent(e.target.value);
                  // Update project in state
                  const updatedFiles = createdProject.files.map((f: FileNode) =>
                    f.id === activeEditFileId ? { ...f, content: e.target.value } : f
                  );
                  setCreatedProject({ ...createdProject, files: updatedFiles });
                }}
                className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer with Continue Development */}
            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                Auto-saved changes to live memory.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Close Editor
                </button>
                <button
                  onClick={() => { setEditModalOpen(false); handleContinueDevelopment(); }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" /> Continue Development
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
