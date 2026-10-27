/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Setup Middleware
app.use(express.json({ limit: '2mb' }));

// Dynamic Google GenAI helper using process.env.GEMINI_API_KEY
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (error) {
    return null;
  }
}

const SYSTEM_INSTRUCTION = `You are ROCK AI, an intelligent, friendly, motivational developer teammate in the Rock AI studio.
Your partner-in-crime is ROCKY ENGINE, your silent, lightning-fast compiler and self-healing engine.

Capabilities & Guidelines:
- You know and write clean, robust, error-free code in ALL programming languages of the world: C, C++, Python, Flutter (Dart), Kotlin (Android), HTML/CSS/JS, React, Rust, Go, Java, Swift, etc.
- When generating a project or application, ALWAYS structure files using standard file markers:
  // FILE: path/to/filename.ext
  or
  # FILE: path/to/filename.ext
  followed by complete, production-ready code with zero syntax errors.
- Talk naturally, enthusiastically, and like a supportive developer friend (use developer emojis: 🚀, 💻, 🔥, 🎉, 🛠️, 🧠, ✨).
- If the user communicates in Malayalam or Manglish, reply in warm, encouraging, fluent Malayalam/Manglish with complete code solutions and step-by-step guidance.
- When creating games or apps, provide full game loops, responsive controls, and clear instructions.
- Ensure every generated file is ready to compile and run in the live preview or full IDE workspace.`;



const isAuthOrQuotaError = (e: any): boolean => {
  const str = `${e?.message || ''} ${e?.status || ''} ${JSON.stringify(e || {})}`.toLowerCase();
  return (
    e?.status === 401 ||
    e?.status === 403 ||
    str.includes('401') ||
    str.includes('403') ||
    str.includes('unauthenticated') ||
    str.includes('unauthorized') ||
    str.includes('api key not valid') ||
    str.includes('access_token_type_unsupported') ||
    str.includes('resource_exhausted') ||
    str.includes('quota')
  );
};

function buildFormattedContents(prompt: string, history?: any[], activeFileName?: string, activeFileContent?: string) {
  let fileContext = '';
  if (activeFileName && activeFileContent) {
    fileContext = `[Active File in Editor: ${activeFileName}]\n\`\`\`\n${activeFileContent}\n\`\`\`\n\n`;
  }
  const fullPrompt = `${fileContext}User message/request:\n${prompt}`;

  const formattedContents: any[] = [];
  if (history && Array.isArray(history)) {
    for (const turn of history) {
      formattedContents.push({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text || '' }]
      });
    }
  }
  formattedContents.push({
    role: 'user',
    parts: [{ text: fullPrompt }]
  });

  return formattedContents;
}

function getMockResponse(prompt: string, activeFileName?: string, activeFileContent?: string): string {
  const lowercasePrompt = (prompt || '').toLowerCase();
  const filePath = activeFileName || 'src/App.tsx';

  // Malayalam / Manglish detection
  const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(prompt);
  const isManglish =
    lowercasePrompt.includes('machu') ||
    lowercasePrompt.includes('upakaram') ||
    lowercasePrompt.includes('nthuva') ||
    lowercasePrompt.includes('engane') ||
    lowercasePrompt.includes('niraikkum') ||
    lowercasePrompt.includes('illalo') ||
    lowercasePrompt.includes('enthina') ||
    lowercasePrompt.includes('cheyyuka') ||
    lowercasePrompt.includes('thaniye') ||
    lowercasePrompt.includes('parayoo') ||
    lowercasePrompt.includes('bhasha') ||
    lowercasePrompt.includes('thett');

  if (hasMalayalamScript || isManglish) {
    if (
      lowercasePrompt.includes('c++') ||
      lowercasePrompt.includes('cpp') ||
      lowercasePrompt.includes('c+++') ||
      lowercasePrompt.includes(' c ') ||
      lowercasePrompt.includes('flutter') ||
      lowercasePrompt.includes('kotlin') ||
      lowercasePrompt.includes('bhasha') ||
      lowercasePrompt.includes('ഭാഷ') ||
      lowercasePrompt.includes('thaniye')
    ) {
      return `Machu, **Rock AI-ക്ക് ലോകത്തിലെ എല്ലാ ഭാഷകളും (C, C++, Python, Flutter, Kotlin, HTML, Rust) തെറ്റില്ലാതെ കോഡ് ചെയ്യാനും ഫയലുകൾ തനിയെ നിർമ്മിക്കാനും കഴിയും!** 🚀🔥

ഇതാ ഒരു സമ്പൂർണ്ണ Multi-Language System Core ഉദാഹരണം:

// FILE: main.cpp
\`\`\`cpp
#include <iostream>
#include <vector>
#include <string>

class RockAICore {
public:
    void execute() {
        std::cout << "🚀 [Rock AI C++ Core] Booting Autonomous Compiler Engine..." << std::endl;
        std::vector<std::string> supported = {
            "C / C++ (High Performance)",
            "Python (AI & Game Dev)",
            "Flutter / Dart (Cross-Platform Mobile)",
            "Kotlin (Modern Android)",
            "HTML5 / CSS / React (Web)"
        };
        for (const auto& lang : supported) {
            std::cout << "  ✓ Ready: " << lang << std::endl;
        }
        std::cout << "✨ Status: 0 errors detected. 100% verified!" << std::endl;
    }
};

int main() {
    RockAICore core;
    core.execute();
    return 0;
}
\`\`\`

// FILE: main.py
\`\`\`python
# Rock AI Autonomous Python Bridge
import sys

def init_rock_engine():
    print("🐍 [Python Engine] Neural Bridge Connected!")
    return {"status": "Active", "languages": ["C", "C++", "Python", "Flutter", "Kotlin"]}

if __name__ == "__main__":
    result = init_rock_engine()
    print(f"✓ Diagnostic: {result}")
\`\`\`

// FILE: Makefile
\`\`\`makefile
CXX = g++
CXXFLAGS = -Wall -O3 -std=c++20

all:
\t$(CXX) $(CXXFLAGS) main.cpp -o app

run: all
\t./app
\`\`\`

✨ **എല്ലാ ഫയലുകളും നിങ്ങളുടെ active project-ൽ സ്വയം create ചെയ്തിട്ടുണ്ട്!**
താഴെയുള്ള **Preview**, **Play**, **Zip**, **Edit**, അല്ലെങ്കിൽ **Continue Development** ക്ലിക്ക് ചെയ്ത് ഇപ്പോൾ തന്നെ ഈ കോഡ് Workspace-ൽ പ്രവർത്തിപ്പിച്ചു നോക്കൂ! 💻🎉`;
    }

    if (lowercasePrompt.includes('continue') || lowercasePrompt.includes('python') || lowercasePrompt.includes('niraikkum') || lowercasePrompt.includes('നിറയ്ക്കും')) {
      return `Machu, **Python select ചെയ്യാനും AI Auto-Fill ചെയ്യാനും വളരെ എളുപ്പമാണ്!** 🚀🐍\n\n1. താഴെയുള്ള navigation bar-ൽ **'Create'** tab (Creator Hub) ക്ലിക്ക് ചെയ്യുക.\n2. അതിൽ ആദ്യത്തെ കാർഡ് **'Python Game & AI Studio 🐍'** തെരഞ്ഞെടുക്കുക (അല്ലെങ്കിൽ Technology: Python ആക്കുക).\n3. മുകളിൽ വലതുഭാഗത്തുള്ള **'✨ AI Auto-Fill Specs'** ബട്ടൺ അമർത്തുക — AI സ്വയം Pygame mechanics, player ship, swarm physics എന്നിവ fill ചെയ്തു തരും!\n4. താഴെയുള്ള **'Build Game Project'** അമർത്തുക (7-ഘട്ട pipeline പൂർത്തിയാകും).\n5. Build കഴിഞ്ഞയുടൻ കാർഡിൽ **'Continue Development 🚀'** ബട്ടൺ തെളിയും. അത് ക്ലിക്ക് ചെയ്താൽ direct ആയി VS Code പോലെയുള്ള full-stack IDE-ൽ Python code റൺ ചെയ്യാനും എഡിറ്റ് ചെയ്യാനും സാധിക്കും!\n\nഇപ്പോൾ തന്നെ Creator Hub തുറന്ന് ഒരു Python Space Game build ചെയ്തു നോക്കൂ! 🔥`;
    }

    return `Machu, ഇത് **Rock AI Cloud Coding & Game Studio** ആണ്! 🚀🔥\n\n**ഈ വെബ്സൈറ്റ് കൊണ്ടുള്ള പ്രധാന ഉപകാരങ്ങൾ:**\n1. 🧠 **AI Developer Studio**: നിങ്ങൾ ചോദിക്കുന്ന എന്തും (C++, C, Python, Flutter, Kotlin, React) നിമിഷനേരം കൊണ്ട് തെറ്റില്ലാതെ കോഡ് ചെയ്തു തരും.\n2. 📁 **Google Drive Cloud Sync**: ഒരൊറ്റ ക്ലിക്കിൽ നിങ്ങളുടെ കോഡും പ്രൊജക്റ്റുകളും Google Drive-ലേക്ക് സേവ് ചെയ്യാം, അവിടെ നിന്ന് പ്രൊജക്റ്റുകൾ തിരികെ ലോഡ് ചെയ്യാം.\n3. 🎮 **Creator Hub**: Python Pygame, Unity style, Godot style, Three.js തുടങ്ങി 11 modern game engines ഉപയോഗിച്ച് ഒറ്റ ക്ലിക്കിൽ games build ചെയ്യാം.\n4. 📱 **Interactive Device Emulators**: നിങ്ങൾ ഉണ്ടാക്കിയ apps / games മൊബൈൽ ഫോൺ അല്ലെങ്കിൽ ഡെസ്ക്ടോപ്പ് എമുലേറ്ററിൽ തത്സമയം play ചെയ്യാം.\n5. 💻 **Full-Stack Workspace**: 'Continue Development' ക്ലിക്ക് ചെയ്താൽ VS Code പോലെയുള്ള സമ്പൂർണ്ണ IDE-ൽ code run ചെയ്യാനും, file edit ചെയ്യാനും, source code ZIP ആയി download ചെയ്യാനും സാധിക്കും!\n\nഇപ്പോൾ എന്ത് app അല്ലെങ്കിൽ game ആണ് build ചെയ്യേണ്ടത്? പറയൂ, നമുക്ക് തുടങ്ങാം! ✨`;
  }

  // C / C++ project requests
  if (lowercasePrompt.includes('c++') || lowercasePrompt.includes('cpp') || lowercasePrompt.includes('c program') || lowercasePrompt.includes(' c ')) {
    return `🚀 **C/C++ High-Performance Project Generated!**\n\nHere are the production-ready C++20 source files compiled with zero syntax errors:\n\n// FILE: main.cpp\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <string>\n\nclass QuantumEngine {\npublic:\n    void execute() {\n        std::cout << "🚀 [C++ Engine] Booting Rock AI Autonomous Core..." << std::endl;\n        std::vector<std::string> modules = {"Compiler", "Optimizer", "Memory-Safe Sandbox"};\n        for (const auto& mod : modules) {\n            std::cout << "  ✓ Initialized: " << mod << std::endl;\n        }\n        std::cout << "✨ C++ execution complete with 0 errors!" << std::endl;\n    }\n};\n\nint main() {\n    QuantumEngine engine;\n    engine.execute();\n    return 0;\n}\n\`\`\`\n\n// FILE: Makefile\n\`\`\`makefile\nCXX = g++\nCXXFLAGS = -Wall -O3 -std=c++20\n\nall:\n\t$(CXX) $(CXXFLAGS) main.cpp -o app\n\nrun: all\n\t./app\n\`\`\`\n\n✨ All files have been structured and compiled. You can launch the live preview, download the ZIP bundle, or continue development in the Workspace!`;
  }

  // Flutter / Mobile requests
  if (lowercasePrompt.includes('flutter') || lowercasePrompt.includes('dart')) {
    return `📱 **Flutter Mobile Application Generated!**\n\nHere are the cross-platform Flutter files ready for iOS & Android simulation:\n\n// FILE: lib/main.dart\n\`\`\`dart\nimport 'package:flutter/material.dart';\n\nvoid main() => runApp(const RockApp());\n\nclass RockApp extends StatelessWidget {\n  const RockApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Rock AI Flutter',\n      theme: ThemeData.dark(),\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Flutter Quantum Space')),\n        body: const Center(child: Text('🚀 Flutter Mobile App Compiled! Live on Rock AI.')),\n      ),\n    );\n  }\n}\n\`\`\`\n\n// FILE: pubspec.yaml\n\`\`\`yaml\nname: rock_flutter_app\ndescription: Cross-platform Flutter app generated by Rock AI.\nversion: 1.0.0+1\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n\`\`\`\n\n✨ All files are loaded and ready in your emulator!`;
  }

  // Kotlin requests
  if (lowercasePrompt.includes('kotlin') || lowercasePrompt.includes('android')) {
    return `🤖 **Kotlin Android Native Core Generated!**\n\nHere is your Jetpack Compose architecture with clean Gradle bindings:\n\n// FILE: app/src/main/java/com/rockai/MainActivity.kt\n\`\`\`kotlin\npackage com.rockai\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.setContent\nimport androidx.compose.material3.Text\n\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent {\n            Text("🚀 Rock AI Kotlin Native Android Initialized with 0 errors!")\n        }\n    }\n}\n\`\`\`\n\n// FILE: app/build.gradle.kts\n\`\`\`kotlin\nplugins {\n    alias(libs.plugins.android.application)\n    alias(libs.plugins.kotlin.android)\n}\n\`\`\`\n\n✨ Ready for interactive device emulation!`;
  }

  // Calculator App request
  if (lowercasePrompt.includes('calculator') || (lowercasePrompt.includes('calc') && lowercasePrompt.includes('app'))) {
    return `🚀 **NeoCalc Glass Pro — Modern Calculator App Generated!**\n\nHere is your production-grade, interactive React calculator component with full keyboard support, arithmetic history, and a glassmorphic aesthetic:\n\n\`\`\`tsx\nimport React, { useState, useEffect, useCallback } from 'react';\nimport { Delete, History, RotateCcw } from 'lucide-react';\n\nexport const Calculator: React.FC = () => {\n  const [display, setDisplay] = useState('0');\n  const [equation, setEquation] = useState('');\n  const [history, setHistory] = useState<string[]>([]);\n  const [showHistory, setShowHistory] = useState(false);\n\n  const handleDigit = useCallback((digit: string) => {\n    setDisplay(prev => (prev === '0' || prev === 'Error' ? digit : prev + digit));\n  }, []);\n\n  const handleOperator = useCallback((op: string) => {\n    setEquation(display + ' ' + op + ' ');\n    setDisplay('0');\n  }, [display]);\n\n  const handleClear = useCallback(() => {\n    setDisplay('0');\n    setEquation('');\n  }, []);\n\n  const handleEqual = useCallback(() => {\n    try {\n      const fullExpr = equation + display;\n      // Safe arithmetic evaluation\n      const sanitized = fullExpr.replace(/[^0-9+\\-*/.]/g, '');\n      const result = Function('"use strict"; return (' + sanitized + ')')();\n      const formatted = String(Number(result.toFixed(6)));\n      setHistory(prev => [fullExpr + ' = ' + formatted, ...prev.slice(0, 9)]);\n      setDisplay(formatted);\n      setEquation('');\n    } catch (e) {\n      setDisplay('Error');\n    }\n  }, [equation, display]);\n\n  return (\n    <div className="w-80 p-5 rounded-3xl bg-zinc-900/90 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-white select-none backdrop-blur-xl">\n      {/* Display Screen */}\n      <div className="p-4 mb-4 rounded-2xl bg-black/70 border border-zinc-800 text-right">\n        <div className="h-5 text-xs font-mono text-zinc-500 overflow-hidden">{equation || '\\u00A0'}</div>\n        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-wider truncate">{display}</div>\n      </div>\n\n      {/* Keypad Grid */}\n      <div className="grid grid-cols-4 gap-2.5">\n        <button onClick={handleClear} className="p-3.5 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/50 font-bold text-sm transition">C</button>\n        <button onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')} className="p-3.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold text-sm transition">DEL</button>\n        <button onClick={() => handleOperator('%')} className="p-3.5 rounded-xl bg-zinc-800 text-cyan-400 hover:bg-zinc-700 font-bold text-sm transition">%</button>\n        <button onClick={() => handleOperator('/')} className="p-3.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 font-bold text-base transition">÷</button>\n\n        {['7', '8', '9'].map(n => (\n          <button key={n} onClick={() => handleDigit(n)} className="p-3.5 rounded-xl bg-zinc-800/80 text-white hover:bg-zinc-700 font-bold text-base transition">{n}</button>\n        ))}\n        <button onClick={() => handleOperator('*')} className="p-3.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 font-bold text-base transition">×</button>\n\n        {['4', '5', '6'].map(n => (\n          <button key={n} onClick={() => handleDigit(n)} className="p-3.5 rounded-xl bg-zinc-800/80 text-white hover:bg-zinc-700 font-bold text-base transition">{n}</button>\n        ))}\n        <button onClick={() => handleOperator('-')} className="p-3.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 font-bold text-base transition">−</button>\n\n        {['1', '2', '3'].map(n => (\n          <button key={n} onClick={() => handleDigit(n)} className="p-3.5 rounded-xl bg-zinc-800/80 text-white hover:bg-zinc-700 font-bold text-base transition">{n}</button>\n        ))}\n        <button onClick={() => handleOperator('+')} className="p-3.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 font-bold text-base transition">+</button>\n\n        <button onClick={() => handleDigit('0')} className="col-span-2 p-3.5 rounded-xl bg-zinc-800/80 text-white hover:bg-zinc-700 font-bold text-base transition">0</button>\n        <button onClick={() => handleDigit('.')} className="p-3.5 rounded-xl bg-zinc-800/80 text-white hover:bg-zinc-700 font-bold text-base transition">.</button>\n        <button onClick={handleEqual} className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:brightness-110 font-black text-lg transition shadow-lg shadow-cyan-500/25">=</button>\n      </div>\n    </div>\n  );\n};\n\`\`\`\n\n✨ All files have been compiled into your active project. You can inspect the source code, launch the live phone/desktop preview, or continue development in the full Workspace!`;
  }

  // Python Game / Space Game requests
  if (lowercasePrompt.includes('python') || lowercasePrompt.includes('space game') || lowercasePrompt.includes('pygame')) {
    return `🐍 **Python Space Game with Pygame Mechanics Initialized!**\n\nHere is your full-featured, responsive Python 2D game engine loop with player spaceship control, laser shooting, procedural alien swarms, and live score tracking:\n\n\`\`\`python\nimport sys\nimport math\nimport random\nimport time\n\nclass SpaceFighterGame:\n    def __init__(self, width=400, height=500):\n        self.width = width\n        self.height = height\n        self.player_x = width // 2\n        self.player_y = height - 60\n        self.player_speed = 7.0\n        self.health = 100\n        self.score = 0\n        self.bullets = []\n        self.enemies = []\n        self.game_over = False\n\n    def fire_laser(self):\n        self.bullets.append({"x": self.player_x, "y": self.player_y - 15, "vy": -12})\n\n    def spawn_enemy(self):\n        self.enemies.append({\n            "x": random.randint(30, self.width - 30),\n            "y": -20,\n            "vy": random.uniform(2.5, 5.0),\n            "radius": 14\n        })\n\n    def update(self):\n        if self.game_over:\n            return\n\n        # Update bullets\n        for b in self.bullets[:]:\n            b["y"] += b["vy"]\n            if b["y"] < 0:\n                self.bullets.remove(b)\n\n        # Random enemy spawns\n        if random.random() < 0.08:\n            self.spawn_enemy()\n\n        # Update enemies & handle laser hits\n        for e in self.enemies[:]:\n            e["y"] += e["vy"]\n            # Check hit against bullets\n            for b in self.bullets[:]:\n                dist = math.hypot(e["x"] - b["x"], e["y"] - b["y"])\n                if dist < e["radius"] + 4:\n                    if b in self.bullets: self.bullets.remove(b)\n                    if e in self.enemies: self.enemies.remove(e)\n                    self.score += 150\n                    break\n\n            # Check collision with player\n            if math.hypot(e["x"] - self.player_x, e["y"] - self.player_y) < 22:\n                self.health -= 25\n                if e in self.enemies: self.enemies.remove(e)\n                if self.health <= 0:\n                    self.game_over = True\n\n    def get_state(self):\n        return {\n            "score": self.score,\n            "health": self.health,\n            "bullets": len(self.bullets),\n            "enemies": len(self.enemies),\n            "game_over": self.game_over\n        }\n\ngame = SpaceFighterGame()\nprint(f"🚀 Space Fighter Initialized! Player at ({game.player_x}, {game.player_y})")\n\`\`\`\n\n🎮 You can test this game directly in the live emulator, edit \`main.py\` in the code editor, or click **Continue Development** to launch the full workspace!`;
  }

  // Explanation queries
  if (lowercasePrompt.includes('explain') || lowercasePrompt.includes('what is') || lowercasePrompt.includes('how does')) {
    return `Hey there, friend! 💻 Let's break down **${filePath}**! 🚀\n\n1. **Unified Context Flow**: Components access shared state and active project files gracefully.\n2. **Micro-interaction Bindings**: Touch, mouse, and keyboard interactions update state smoothly without unnecessary re-renders.\n3. **Modern Styling**: Tailwind utility classes provide clean, glassmorphic responsive layouts with cosmic accents.\n4. **Self-Healing Architecture**: Syntax and runtime issues are caught by the Rocky compiler and resolved seamlessly.\n\nWould you like me to suggest some interactive enhancements or generate test suites? 🧈`;
  }

  // UI & Components
  if (lowercasePrompt.includes('button') || lowercasePrompt.includes('glass') || lowercasePrompt.includes('ui') || lowercasePrompt.includes('component')) {
    return `Here is a modern interactive glass card component with Tailwind and motion:\n\n\`\`\`tsx\nimport React from 'react';\nimport { Sparkles, ArrowRight } from 'lucide-react';\n\nexport const InteractiveCard: React.FC = () => {\n  return (\n    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-700/50 shadow-xl hover:border-cyan-500/50 transition-all duration-300 group">\n      <div className="flex items-center gap-2 mb-2">\n        <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />\n        <h3 className="text-white font-bold text-lg">Interactive Card</h3>\n      </div>\n      <p className="text-zinc-400 text-sm mb-4">Powered by Rock AI & Rocky Engine.</p>\n      <button className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">\n        <span>Explore Component</span>\n        <ArrowRight className="w-3.5 h-3.5" />\n      </button>\n    </div>\n  );\n};\n\`\`\``;
  }

  // Bug fixing & error handling
  if (lowercasePrompt.includes('fix') || lowercasePrompt.includes('bug') || lowercasePrompt.includes('error') || lowercasePrompt.includes('optimize')) {
    return `I audited **${filePath}** and ensured all type bindings, null assertions, and edge cases are handled safely! 🛠️\n\n\`\`\`tsx\n// Verified type bindings and optimized state flow\nexport const SafeComponent: React.FC<{ data?: string[] }> = ({ data = [] }) => {\n  return (\n    <div className="text-emerald-400 font-medium p-4 rounded-xl bg-zinc-900 border border-emerald-500/30">\n      <span className="font-bold">✓ Status:</span> State and type compilation verified! Total elements: {data.length}\n    </div>\n  );\n};\n\`\`\``;
  }

  // Generic gaming / game creation
  if (lowercasePrompt.includes('game') || lowercasePrompt.includes('play') || lowercasePrompt.includes('canvas')) {
    return `Let's build something awesome! 🎮 Here is a clean 2D game architecture loop:\n- **Fluid Controls**: Responsive physics and touch support.\n- **Score & Particles**: Rewarding feedback loops.\n- **Dynamic Obstacles**: Procedural spawning for endless replayability.\n\n\`\`\`typescript\nexport interface GameState {\n  score: number;\n  level: number;\n  speed: number;\n  isAlive: boolean;\n}\n\`\`\`\n\nHead over to the **Creator Hub** tab to pick an engine (Python, Unity style, Godot, or Phaser) and start building!`;
  }

  return `Great idea! 🚀 I'm ready to help you build, test, and deploy in **${filePath}**.\n\nYou can ask me to:\n- Generate complete applications in any language (C, C++, Python, Flutter, Kotlin, HTML)\n- Save & sync workspaces to Google Drive\n- Write modern React & Tailwind components\n- Explain architectural concepts or optimize runtime performance\n- Fix bugs and auto-heal compilation errors\n\nLet's keep building! 🔥`;
}

// AI Chat Streaming Endpoint (SSE)
app.post('/api/ai/chat/stream', async (req, res) => {
  const { prompt, activeFileName, activeFileContent, history } = req.body;

  if (!prompt && !activeFileContent) {
    return res.status(400).json({ error: 'Missing prompt or content.' });
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isClientDisconnected = false;
  res.on('close', () => {
    isClientDisconnected = true;
  });

  const sendChunk = (text: string) => {
    if (!isClientDisconnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  };

  const sendDone = () => {
    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  };

  // 1. Try Gemini API if client and credentials are valid
  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const formattedContents = buildFormattedContents(prompt, history, activeFileName, activeFileContent);

      let responseStream: any = null;
      try {
        responseStream = await aiClient.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });
      } catch (primaryErr: any) {
        console.error('[AI stream] Primary Gemini model failed:', primaryErr?.status || '', primaryErr?.message || primaryErr);
        if (!isAuthOrQuotaError(primaryErr)) {
          try {
            responseStream = await aiClient.models.generateContentStream({
              model: 'gemini-3.1-flash-lite',
              contents: formattedContents,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
              }
            });
          } catch (secondaryErr: any) {
            console.error('[AI stream] Fallback Gemini model failed:', secondaryErr?.status || '', secondaryErr?.message || secondaryErr);
          }
        }
      }

      if (responseStream) {
        for await (const chunk of responseStream) {
          if (isClientDisconnected || res.writableEnded) break;
          if (chunk.text) {
            sendChunk(chunk.text);
          }
        }
        sendDone();
        return;
      }
    } catch (err: any) {
      console.error('[AI stream] Request failed:', err?.status || '', err?.message || err);
    }
  }

  // Do not present a scripted mock as a real AI-generated response.
  sendChunk('⚠️ No AI provider is configured or available. Add a valid GEMINI_API_KEY to the server environment.');
  sendDone();
});

// AI Chat Non-Streaming Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, activeFileName, activeFileContent, history } = req.body;

  if (!prompt && !activeFileContent) {
    return res.status(400).json({ error: 'Missing prompt or content.' });
  }

  // 1. If Gemini API is configured and credentials are valid, call it
  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const formattedContents = buildFormattedContents(prompt, history, activeFileName, activeFileContent);
      let response: any = null;
      try {
        response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });
      } catch (firstError: any) {
        console.error('[AI chat] Primary Gemini model failed:', firstError?.status || '', firstError?.message || firstError);
        if (!isAuthOrQuotaError(firstError)) {
          try {
            response = await aiClient.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: formattedContents,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
              }
            });
          } catch (secondError: any) {
            console.error('[AI chat] Fallback Gemini model failed:', secondError?.status || '', secondError?.message || secondError);
          }
        }
      }

      if (response && response.text) {
        return res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error('[AI chat] Request failed:', error?.status || '', error?.message || error);
    }
  }

  // Do not return scripted output that pretends to be generated by a model.
  return res.status(503).json({ error: 'No AI provider is configured or available. Add a valid GEMINI_API_KEY to the server environment.' });
});

// Setup Vite Dev server middleware in development, or Static assets serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
