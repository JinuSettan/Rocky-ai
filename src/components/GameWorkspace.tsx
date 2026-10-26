/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Sparkles, AlertTriangle, Play, CheckCircle2, 
  ChevronRight, Folder, FileCode, Copy, Check, Sliders, Sun, 
  HelpCircle, RefreshCw, Cpu, Flame, Compass, Crosshair, Terminal, Download, ArrowRight, Save, Laptop, Smartphone
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface GameWorkspaceProps {
  engineId: string | null;
  isConnected: boolean;
  onConnectEngine: () => void;
}

interface PromptPreset {
  title: string;
  desc: string;
  prompt: string;
  icon: string;
  genre: 'horror' | 'survival' | 'fps' | 'gta' | 'racing';
}

const PRESETS: PromptPreset[] = [
  {
    title: 'Realistic Horror Game',
    desc: 'Dark vignetted atmospheric flashlight view, physical jump scares, dynamic fog & shadow triggers.',
    prompt: 'Create a realistic horror game with adaptive flashlight rendering, ambient spatial tension controllers, physical jump-scares, and local inventory saves.',
    icon: '👻',
    genre: 'horror'
  },
  {
    title: 'Open-World Survival',
    desc: 'Procedural day/night cycle, raw material crafting inventory, weather nodes, and survival meters.',
    prompt: 'Create an open-world survival game with procedural terrain map, hunger/hydration status monitors, raw wood/stone crafting mechanics, and save state system.',
    icon: '🌲',
    genre: 'survival'
  },
  {
    title: 'Multiplayer FPS',
    desc: 'Lobby server synchronization, fully animated gun models, crosshair shooting targets, and team counters.',
    prompt: 'Create a multiplayer FPS arena with network-synchronized character state managers, dynamic shooting crosshairs, ammo reload controllers, and active match log.',
    icon: '🎯',
    genre: 'fps'
  },
  {
    title: 'GTA-Style City',
    desc: 'Procedural asphalt roads, autonomous pedestrian nav AI, collision boundaries, and drivable physics.',
    prompt: 'Create a GTA-style city sandbox with grid road systems, pedestrian pathfinding state machines, drivable sports cars, and police alert systems.',
    icon: '🚗',
    genre: 'gta'
  },
  {
    title: 'Racing Simulator',
    desc: 'Perspective wireframe track, physical drag vectors, tachometer gauges, and tire smoke particles.',
    prompt: 'Create a racing simulator with high-speed perspective racing tracks, wheel torque aerodynamics, interactive RPM gauges, and gear shifting rules.',
    icon: '🏎️',
    genre: 'racing'
  }
];

// Mock Project files generated per genre
const GENERATED_FILES_MAP = {
  horror: [
    { name: 'PlayerFlashlight.cs', code: `using UnityEngine;\n\npublic class PlayerFlashlight : MonoBehaviour {\n    public Light flashlightSource;\n    public float drainRate = 0.05f;\n    private float batteryLife = 1.0f;\n\n    void Update() {\n        if (Input.GetKeyDown(KeyCode.F)) {\n            flashlightSource.enabled = !flashlightSource.enabled;\n            PlayClickSound();\n        }\n        if (flashlightSource.enabled) {\n            batteryLife -= drainRate * Time.deltaTime;\n            flashlightSource.intensity = Mathf.Lerp(0f, 3.5f, batteryLife);\n        }\n    }\n}` },
    { name: 'JumpScareTrigger.cs', code: `using System.Collections;\n\npublic class JumpScareTrigger : MonoBehaviour {\n    public AudioSource scareAudio;\n    public GameObject ghostlyApparition;\n    private bool activated = false;\n\n    void OnTriggerEnter(Collider other) {\n        if (other.CompareTag("Player") && !activated) {\n            activated = true;\n            ghostlyApparition.SetActive(true);\n            scareAudio.Play();\n            StartCoroutine(DismissGraveGhost());\n        }\n    }\n}` },
    { name: 'AmbientFogController.cs', code: `using UnityEngine;\n\npublic class AmbientFogController : MonoBehaviour {\n    public Color fogMidnight = new Color(0.02f, 0.02f, 0.03f);\n    public float targetDensity = 0.09f;\n\n    void Start() {\n        RenderSettings.fog = true;\n        RenderSettings.fogColor = fogMidnight;\n        RenderSettings.fogDensity = targetDensity;\n    }\n}` }
  ],
  survival: [
    { name: 'SurvivalMeters.cs', code: `using UnityEngine;\nusing UnityEngine.UI;\n\npublic class SurvivalMeters : MonoBehaviour {\n    public float hunger = 100f;\n    public float hydration = 100f;\n    public float decayRate = 0.2f;\n\n    void Update() {\n        hunger -= decayRate * Time.deltaTime;\n        hydration -= decayRate * 1.5f * Time.deltaTime;\n        if (hunger <= 0 || hydration <= 0) {\n            ApplyStarvationDamage();\n        }\n    }\n}` },
    { name: 'CraftingManager.cs', code: `using System.Collections.Generic;\n\npublic class CraftingManager : MonoBehaviour {\n    public List<Recipe> recipes = new List<Recipe>();\n\n    public bool TryCraftItem(Item itemToCraft, Inventory playerInv) {\n        if (playerInv.HasIngredients(itemToCraft.recipe)) {\n            playerInv.RemoveIngredients(itemToCraft.recipe);\n            playerInv.AddItem(itemToCraft);\n            return true;\n        }\n        return false;\n    }\n}` },
    { name: 'TerrainGenerator.cs', code: `using UnityEngine;\n\npublic class TerrainGenerator : MonoBehaviour {\n    public int width = 256;\n    public int height = 256;\n    public float scale = 20f;\n\n    TerrainData GenerateTerrain(TerrainData tData) {\n        tData.heightmapResolution = width + 1;\n        tData.size = new Vector3(width, 50, height);\n        tData.SetHeights(0, 0, CalculateNoiseHeights());\n        return tData;\n    }\n}` }
  ],
  fps: [
    { name: 'WeaponSystem.cs', code: `using UnityEngine;\n\npublic class WeaponSystem : MonoBehaviour {\n    public int damage = 25;\n    public float fireRate = 0.15f;\n    public int maxAmmo = 30;\n    private int currentAmmo;\n    private float nextFireTime;\n\n    void Shoot() {\n        if (Time.time < nextFireTime || currentAmmo <= 0) return;\n        currentAmmo--;\n        nextFireTime = Time.time + fireRate;\n        \n        RaycastHit hit;\n        if (Physics.Raycast(cam.transform.position, cam.transform.forward, out hit)) {\n            ApplyDamage(hit.collider, damage);\n        }\n    }\n}` },
    { name: 'LobbyNetworkSync.cs', code: `using Photon.Pun;\n\npublic class LobbyNetworkSync : MonoBehaviourPunCallbacks {\n    public override void OnJoinedRoom() {\n        PhotonNetwork.Instantiate("PlayerPrefab", Vector3.zero, Quaternion.identity);\n        SyncInitialScores();\n    }\n}` },
    { name: 'HUDController.cs', code: `using TMPro;\n\npublic class HUDController : MonoBehaviour {\n    public TextMeshProUGUI ammoCounter;\n    public TextMeshProUGUI healthIndicator;\n\n    public void RefreshHUD(int ammo, int health) {\n        ammoCounter.text = $"AMMO: {ammo}/30";\n        healthIndicator.text = $"HP: {health}%";\n    }\n}` }
  ],
  gta: [
    { name: 'VehicleController.cs', code: `using UnityEngine;\n\npublic class VehicleController : MonoBehaviour {\n    public float motorTorque = 1500f;\n    public float steeringLimit = 30f;\n    public Rigidbody rigidBody;\n\n    void ApplyDrive(float accel, float steer) {\n        frontLeftWheel.steerAngle = steer * steeringLimit;\n        frontRightWheel.steerAngle = steer * steeringLimit;\n        rearLeftWheel.motorTorque = accel * motorTorque;\n        rearRightWheel.motorTorque = accel * motorTorque;\n    }\n}` },
    { name: 'PedestrianNavAI.cs', code: `using UnityEngine.AI;\n\npublic class PedestrianNavAI : MonoBehaviour {\n    public NavMeshAgent agent;\n    public Transform[] waypoints;\n\n    void Update() {\n        if (!agent.pathPending && agent.remainingDistance < 0.5f) {\n            agent.destination = waypoints[Random.Range(0, waypoints.Length)].position;\n        }\n    }\n}` },
    { name: 'WantedLevelSystem.cs', code: `public class WantedLevelSystem {\n    private int stars = 0;\n\n    public void AlertPolice(float threatFactor) {\n        if (threatFactor > 50) {\n            stars = 3;\n            DeployPatrols();\n        }\n    }\n}` }
  ],
  racing: [
    { name: 'Aerodynamics.cs', code: `using UnityEngine;\n\npublic class Aerodynamics : MonoBehaviour {\n    public float dragCoefficient = 0.32f;\n    public float downforceFactor = 2.5f;\n    private Rigidbody rb;\n\n    void FixedUpdate() {\n        float speed = rb.velocity.magnitude;\n        Vector3 drag = -rb.velocity.normalized * 0.5f * dragCoefficient * speed * speed;\n        Vector3 downforce = -transform.up * downforceFactor * speed;\n        rb.AddForce(drag + downforce);\n    }\n}` },
    { name: 'RPMController.cs', code: `public class RPMController {\n    public float currentRPM = 800f;\n    public int currentGear = 1;\n    public float maxRPM = 8500f;\n\n    public void ShiftGear(int dir) {\n        currentGear += dir;\n        currentRPM *= 0.65f;\n    }\n}` },
    { name: 'TachometerHUD.cs', code: `using UnityEngine.UI;\n\npublic class TachometerHUD : MonoBehaviour {\n    public Image tachometerNeedle;\n\n    public void UpdateNeedle(float rpm, float max) {\n        float angle = Mathf.Lerp(180f, -60f, rpm / max);\n        tachometerNeedle.transform.rotation = Quaternion.Euler(0, 0, angle);\n    }\n}` }
  ]
};

export const GameWorkspace: React.FC<GameWorkspaceProps> = ({
  engineId,
  isConnected,
  onConnectEngine
}) => {
  const { addNotification, addTerminalLine } = useProject();

  const [activeTab, setActiveTab] = useState<'prompt' | 'generator' | 'files' | 'preview'>('prompt');
  const [selectedPreset, setSelectedPreset] = useState<PromptPreset>(PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Generation Process State
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genLogs, setGenLogs] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeGenStep, setActiveGenStep] = useState('');

  // Selected Generated File
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // 3D Preview State parameters
  const [zoomLevel, setZoomLevel] = useState(50);
  const [lightIntensity, setLightIntensity] = useState(40);
  const [cameraAngle, setCameraAngle] = useState(25);
  
  // Interactive mini-game variables
  // Horror
  const [isFlashlightOn, setIsFlashlightOn] = useState(true);
  // Survival
  const [survivalMeters, setSurvivalMeters] = useState({ wood: 12, stone: 8, hunger: 90, health: 100 });
  // FPS
  const [fpsScore, setFpsScore] = useState(0);
  const [bulletsRemaining, setBulletsRemaining] = useState(30);
  const [fpsTargets, setFpsTargets] = useState<{ id: number; top: number; left: number }[]>([
    { id: 1, top: 40, left: 30 },
    { id: 2, top: 25, left: 70 },
    { id: 3, top: 60, left: 55 }
  ]);
  // GTA
  const [gtaCars, setGtaCars] = useState([
    { id: 1, name: 'Pursuit Car', x: 20, y: 50, color: 'bg-blue-500' },
    { id: 2, name: 'Sports GT', x: 60, y: 30, color: 'bg-orange-500' },
    { id: 3, name: 'Cruiser', x: 45, y: 80, color: 'bg-zinc-400' }
  ]);
  // Racing
  const [racingSpeed, setRacingSpeed] = useState(120);

  // Build target packaging
  const [selectedTarget, setSelectedTarget] = useState<'android' | 'windows' | 'macos' | 'linux' | 'webgl'>('windows');
  const [isCompilingPackage, setIsCompilingPackage] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [isCompileSuccessful, setIsCompileSuccessful] = useState(false);

  // Get Name
  const getEngineName = () => {
    switch (engineId) {
      case 'ue5': return 'Unreal Engine 5';
      case 'unity6': return 'Unity 6';
      case 'godot4': return 'Godot 4';
      case 'o3de': return 'O3DE';
      case 'stride': return 'Stride Engine';
      case 'bevy': return 'Bevy Engine';
      default: return 'Unreal Engine 5';
    }
  };

  const getEngineColorTheme = () => {
    switch (engineId) {
      case 'ue5': return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10' };
      case 'unity6': return { text: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/10' };
      case 'godot4': return { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' };
      case 'o3de': return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
      case 'stride': return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10' };
      case 'bevy': return { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10' };
      default: return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' };
    }
  };

  const themeColors = getEngineColorTheme();

  // Simulated AI Game Generation Steps
  const stepsToBuild = [
    { name: 'Folder Structure', desc: 'Synthesizing directories (/Assets, /Scripts, /Prefabs, /Configs)' },
    { name: 'Source Code & Scripts', desc: 'Compiling structural controller logic bindings' },
    { name: 'Visual Interface (UI)', desc: 'Drafting Canvas HUD layers & screen layout' },
    { name: 'Character Controller', desc: 'Assembling physics movement & key inputs' },
    { name: 'NPC System & Pathfinding', desc: 'Wiring navigational nodes & AI state engines' },
    { name: 'Inventory Controller', desc: 'Structuring relational save matrices' },
    { name: 'Weapons & Shooting System', desc: 'Deploying raycast damage vectors' },
    { name: 'Procedural Maps & Terrains', desc: 'Erecting high-contrast level meshes' },
    { name: 'Lumen / HDR Lighting presets', desc: 'Baking ambient spatial lighting files' },
    { name: 'Material & Custom Shaders', desc: 'Baking physical vertex mappings' },
    { name: 'Animations & Skeletal joints', desc: 'Compiling smooth keyframe controllers' },
    { name: 'Save / Load binary states', desc: 'Securing local state-holder slots' },
    { name: 'Multiplayer Client Framework', desc: 'Integrating high-speed server sockets' },
    { name: 'Project Documentation', desc: 'Publishing Markdown and C# instructions' }
  ];

  const triggerAIGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCompletedSteps([]);
    setGenLogs([]);
    setActiveTab('generator');
    
    addNotification('Rock AI Game Synthesis', 'Initiating procedural game compiler node.', 'info');
    addTerminalLine(`game-generator --engine=${engineId} --genre=${selectedPreset.genre}`, 'input');
  };

  useEffect(() => {
    if (!isGenerating) return;

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < stepsToBuild.length) {
        const step = stepsToBuild[stepIdx];
        setActiveGenStep(step.name);
        setCompletedSteps(prev => [...prev, step.name]);
        setGenLogs(prev => [
          ...prev,
          `[LOG ${new Date().toLocaleTimeString()}] Successfully synthesized Game ${step.name}.`,
          `  -> Action: ${step.desc}.`,
          `  -> Status: [OK] Compiled 0 errors.`
        ]);
        
        // Progress percentage calculation
        setGenerationProgress(Math.min(100, Math.floor(((stepIdx + 1) / stepsToBuild.length) * 100)));
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        addNotification('Game Generation Complete', `Successfully procedurally generated ${selectedPreset.title} on ${getEngineName()}!`, 'success');
        addTerminalLine(`[OK] Successfully compiled game template tree on ${getEngineName()}`, 'success');
        setActiveTab('files'); // Switch to files tree
      }
    }, 900);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Click handler for target shots
  const handleShotTarget = (id: number) => {
    if (bulletsRemaining <= 0) return;
    setFpsScore(prev => prev + 100);
    setBulletsRemaining(prev => Math.max(0, prev - 1));
    // Relocate shot target
    setFpsTargets(prev => prev.map(t => t.id === id ? {
      ...t,
      top: Math.floor(Math.random() * 65) + 15,
      left: Math.floor(Math.random() * 75) + 10
    } : t));
  };

  const handleReloadGun = () => {
    setBulletsRemaining(30);
    addNotification('Gun Reloaded', 'Synchronized full magazine state.', 'info');
  };

  const triggerMockPackageCompilation = () => {
    if (!isConnected) {
      addNotification('Engine Blocked', 'Please connect your local game engine prior to packaging targets.', 'error');
      return;
    }
    
    setIsCompilingPackage(true);
    setCompileProgress(0);
    setIsCompileSuccessful(false);
    setCompileLogs([
      `[COMPILER] Initializing package deployment for ${selectedTarget.toUpperCase()}...`,
      `[COMPILER] Linking target assemblies and game frameworks...`,
      `[COMPILER] Bundling assets, levels, and lighting pre-bakes...`
    ]);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setCompileProgress(prog);
      if (prog === 40) {
        setCompileLogs(prev => [...prev, `[COMPILER] Loading dynamic shaders... Compiled 144 textures.`]);
      } else if (prog === 80) {
        setCompileLogs(prev => [...prev, `[COMPILER] Encapsulating core C# system classes and scripts...`]);
      } else if (prog >= 100) {
        clearInterval(interval);
        setIsCompilingPackage(false);
        setIsCompileSuccessful(true);
        setCompileLogs(prev => [...prev, `[SUCCESS] Build successful! Saved game target to /dist/builds/${selectedPreset.genre}-game.${selectedTarget === 'android' ? 'apk' : selectedTarget === 'windows' ? 'exe' : 'zip'}`]);
        addNotification('Game Compiled Successfully', `Ready to run package target.`, 'success');
      }
    }, 1000);
  };

  const currentFiles = GENERATED_FILES_MAP[selectedPreset.genre] || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 text-left select-none">
      
      {/* 1. Header Toolbar */}
      <div className="h-10 border-b border-zinc-900 bg-zinc-950/40 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Gamepad2 className={`w-4 h-4 ${themeColors.text}`} />
          <h3 className="text-xs font-black tracking-wide text-zinc-100 uppercase flex items-center gap-1.5">
            Prompt-to-Game Workspace:
            <span className={`${themeColors.text} bg-zinc-900/50 border ${themeColors.border} px-2 py-0.5 rounded text-[10px] font-black`}>
              {getEngineName()}
            </span>
          </h3>
        </div>

        {/* Workspace tabs switcher */}
        <div className="flex items-center gap-1">
          {[
            { id: 'prompt', label: '1. AI Setup' },
            { id: 'generator', label: '2. Generation Monitor' },
            { id: 'files', label: '3. Source & Tree' },
            { id: 'preview', label: '4. Dynamic 3D Preview' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={isGenerating && tab.id !== 'generator'}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? `${themeColors.text} bg-zinc-900 border ${themeColors.border} shadow`
                  : 'text-zinc-500 hover:text-zinc-300 bg-transparent border-transparent hover:bg-zinc-900/20'
              } disabled:opacity-40`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Workbench Core */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 relative flex flex-col md:flex-row gap-4">
        
        {/* LEFT COMPONENT COLUMN (Width matches options) */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          
          {/* A. SETUP TAB: Options presets selection */}
          {activeTab === 'prompt' && (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-500/10 via-blue-500/5 to-purple-500/5 p-4 rounded-2xl border border-zinc-900 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-zinc-100">
                    <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
                    <h4 className="text-sm font-black uppercase tracking-wider">AI Game Project Compiler</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                    Describe your dream project or click a high-fidelity template preset beneath. Rock AI will compile the asset folders, generate customized physics controllers, set up NPCs, render lighting templates, and link build systems inside <strong>{getEngineName()}</strong>.
                  </p>
                </div>

                {/* Connection Status notice */}
                {!isConnected ? (
                  <div className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 animate-pulse" />
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold uppercase tracking-wide">Warning: Engine connection required to build and package the final game.</p>
                      <p className="text-zinc-500 leading-relaxed">
                        Procedural mock generation is fully operational. To execute live builds, connect your engine core using the 'Connect Local' button in the sidebar.
                      </p>
                      <button 
                        onClick={onConnectEngine}
                        className="mt-1 bg-red-950/60 border border-red-800 hover:border-red-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-white transition-all cursor-pointer"
                      >
                        Force Connect Engine Bridge
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-950/10 border border-green-900/30 rounded-xl text-green-400 select-none">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-400 animate-pulse" />
                    <div className="text-xs leading-none">
                      <span className="font-extrabold uppercase tracking-wide">Active Connection Synced.</span> Full compilation and packaging ready.
                    </div>
                  </div>
                )}

                {/* Templates Selector */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Choose AI Game Preset Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRESETS.map((preset) => (
                      <div
                        key={preset.title}
                        onClick={() => {
                          setSelectedPreset(preset);
                          setCustomPrompt(preset.prompt);
                        }}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-1.5 ${
                          selectedPreset.title === preset.title
                            ? `bg-zinc-900/90 ${themeColors.border} text-white shadow-lg scale-[1.01]`
                            : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-600 font-mono">
                            {preset.genre}
                          </span>
                        </div>
                        <h5 className="text-xs font-extrabold truncate tracking-wide">{preset.title}</h5>
                        <p className="text-[9px] leading-relaxed text-zinc-500 line-clamp-3 font-medium">
                          {preset.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text prompt description field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Custom Game Specifications Prompt</label>
                  <textarea
                    value={customPrompt || selectedPreset.prompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g., Create a voxel retro block game with procedural water meshes and fluid simulation state loops..."
                    className="w-full h-24 bg-black border border-zinc-900 focus:border-orange-500/40 rounded-xl p-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed select-text font-sans"
                  />
                </div>
              </div>

              {/* Action submission buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-900/40">
                <button
                  onClick={triggerAIGeneration}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_4px_24px_rgba(249,115,22,0.15)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.3)] transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Procedurally Generate Game Layout</span>
                </button>
              </div>
            </div>
          )}

          {/* B. GENERATION TAB */}
          {activeTab === 'generator' && (
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex flex-col gap-4 h-full min-h-[300px]">
              <div className="flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''} text-orange-400`} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100">Rock AI Core Synthesizer</h4>
                    <p className="text-[10px] text-zinc-500">Compiling classes, meshes, maps, and audio layers procedurally.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-orange-400 font-mono">{generationProgress}%</span>
                  <div className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold font-mono">Compiling</div>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300 rounded-full"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* Splits - Left Steps, Right Console Logs */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                
                {/* Generation steps list */}
                <div className="border border-zinc-900 rounded-xl p-3 bg-black/40 overflow-y-auto space-y-1.5 scrollbar-thin">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Synthesized Modules</span>
                  <div className="space-y-1 mt-1">
                    {stepsToBuild.map((step, idx) => {
                      const isDone = completedSteps.includes(step.name);
                      const isActive = activeGenStep === step.name;

                      return (
                        <div 
                          key={step.name} 
                          className={`p-2 rounded-lg border flex items-center justify-between text-left transition-colors ${
                            isDone 
                              ? 'bg-zinc-900/20 border-green-950/30 text-zinc-300' 
                              : isActive 
                                ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 animate-pulse'
                                : 'bg-transparent border-transparent text-zinc-650'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold font-mono text-zinc-500">{String(idx + 1).padStart(2, '0')}</span>
                            <div>
                              <div className="text-xs font-extrabold">{step.name}</div>
                              <div className="text-[9px] text-zinc-550 truncate max-w-[160px]">{step.desc}</div>
                            </div>
                          </div>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : isActive ? (
                            <RefreshCw className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-zinc-800" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Raw Compiler tty console output */}
                <div className="border border-zinc-900 rounded-xl p-3 bg-black text-left flex flex-col min-h-0">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5 border-b border-zinc-900 pb-1.5">
                    <Terminal className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[9px] uppercase font-bold tracking-widest font-mono">procedural-synth-tty</span>
                  </div>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-400 space-y-1 scrollbar-thin">
                    {genLogs.length === 0 ? (
                      <span className="text-zinc-700 italic">Synthesizer standby... Awaiting trigger.</span>
                    ) : (
                      genLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith(' ') ? 'text-zinc-500 pl-4' : 'text-orange-300 font-bold'}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* C. FILES & SOURCE CODE VIEW TAB */}
          {activeTab === 'files' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/40 min-h-[350px]">
              
              {/* Generated Files Directory Tree List */}
              <div className="border-r border-zinc-900 p-3 bg-black/40 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Generated Project Code</span>
                
                <div className="p-2 rounded-lg bg-zinc-900/30 border border-zinc-900 flex items-center gap-2 text-zinc-300">
                  <Folder className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold font-mono truncate">/{selectedPreset.genre}-procedural-core/</span>
                </div>

                <div className="space-y-1 pl-3 mt-1.5">
                  {currentFiles.map((file, idx) => (
                    <div
                      key={file.name}
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedFileIdx === idx
                          ? `${themeColors.text} bg-zinc-900/60 ${themeColors.border}`
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/20'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono font-medium truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Editor Preview Pane */}
              <div className="col-span-2 flex flex-col min-h-0 bg-black">
                {currentFiles[selectedFileIdx] ? (
                  <>
                    <div className="px-4 py-2 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 font-bold uppercase">
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <span>{currentFiles[selectedFileIdx].name}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentFiles[selectedFileIdx].code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                          addNotification('Code Copied', 'Successfully copied generated code to clipboard.', 'success');
                        }}
                        className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 flex-1 overflow-auto text-left font-mono text-[11px] text-zinc-300 leading-relaxed bg-black/40 scrollbar-thin max-h-[350px]">
                      <code>{currentFiles[selectedFileIdx].code}</code>
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-650 italic text-xs">
                    Synthesize game templates to review autogenerated C# class structures.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* D. 3D INTERACTIVE VISUAL GAME PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-black border border-zinc-900 rounded-2xl p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden shadow-2xl min-h-[350px]">
                
                {/* Visual rendering canvas area */}
                <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                  
                  {/* Backdrop glowing grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

                  {/* Dynamic Graphics per selected preset category */}
                  {/* Genre: HORROR */}
                  {selectedPreset.genre === 'horror' && (
                    <div 
                      className="w-full h-full min-h-[220px] flex flex-col items-center justify-center relative cursor-crosshair overflow-hidden"
                      onClick={() => setIsFlashlightOn(!isFlashlightOn)}
                    >
                      {/* Vignette Flashlight overlay */}
                      <div 
                        className="absolute inset-0 transition-all duration-500 flex items-center justify-center"
                        style={{
                          background: isFlashlightOn 
                            ? `radial-gradient(circle 100px at 50% 50%, rgba(254,243,199,0.18) 0%, rgba(0,0,0,0.96) 100%)`
                            : 'rgba(0,0,0,0.98)'
                        }}
                      />

                      <div className="z-10 text-center space-y-2 pointer-events-none">
                        <Flame className={`w-12 h-12 mx-auto ${isFlashlightOn ? 'text-amber-300 animate-pulse' : 'text-zinc-800'}`} />
                        <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">Haunted House Sandbox</h5>
                        <p className="text-[10px] text-zinc-500">Click anywhere to toggle custom Flashlight light sources.</p>
                        <p className="text-[8px] uppercase tracking-widest font-bold text-zinc-650">Lumen Baked Shadows: Active</p>
                      </div>
                    </div>
                  )}

                  {/* Genre: SURVIVAL */}
                  {selectedPreset.genre === 'survival' && (
                    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center relative">
                      {/* Interactive forest view */}
                      <div className="z-10 grid grid-cols-2 gap-3 max-w-sm w-full select-none">
                        <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-center space-y-1.5">
                          <span className="text-lg">🌲</span>
                          <div className="text-[10px] font-bold text-zinc-450 uppercase">Pine Forest wood</div>
                          <div className="flex justify-between items-center bg-black/40 px-2 py-0.5 rounded text-[10px]">
                            <span className="text-zinc-500 font-mono">WOOD:</span>
                            <span className="text-orange-400 font-bold">{survivalMeters.wood}</span>
                          </div>
                          <button
                            onClick={() => setSurvivalMeters(prev => ({ ...prev, wood: prev.wood + 1 }))}
                            className="w-full py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-[8px] uppercase tracking-widest text-zinc-200 font-extrabold rounded-md cursor-pointer transition-colors"
                          >
                            Chop Pine
                          </button>
                        </div>

                        <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-center space-y-1.5">
                          <span className="text-lg">⛰️</span>
                          <div className="text-[10px] font-bold text-zinc-450 uppercase">Granite Stone</div>
                          <div className="flex justify-between items-center bg-black/40 px-2 py-0.5 rounded text-[10px]">
                            <span className="text-zinc-500 font-mono">STONE:</span>
                            <span className="text-sky-400 font-bold">{survivalMeters.stone}</span>
                          </div>
                          <button
                            onClick={() => setSurvivalMeters(prev => ({ ...prev, stone: prev.stone + 1 }))}
                            className="w-full py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-[8px] uppercase tracking-widest text-zinc-200 font-extrabold rounded-md cursor-pointer transition-colors"
                          >
                            Mine Stone
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] uppercase tracking-wider font-extrabold text-zinc-600 border-t border-zinc-900/60 pt-2 z-10">
                        <span>Terrain Grid: 256x256</span>
                        <span>Meters: {survivalMeters.wood + survivalMeters.stone} assets</span>
                      </div>
                    </div>
                  )}

                  {/* Genre: FPS */}
                  {selectedPreset.genre === 'fps' && (
                    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950/80 rounded-xl">
                      <Crosshair className="absolute w-8 h-8 text-red-500/50 pointer-events-none animate-ping" />
                      
                      {/* Shot target nodes */}
                      {fpsTargets.map(target => (
                        <button
                          key={target.id}
                          onClick={() => handleShotTarget(target.id)}
                          style={{ top: `${target.top}%`, left: `${target.left}%` }}
                          className="absolute w-6 h-6 rounded-full bg-red-600/30 hover:bg-red-500/80 border-2 border-red-500 flex items-center justify-center transition-all cursor-pointer transform hover:scale-110 active:scale-90"
                          title="Click to shoot!"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </button>
                      ))}

                      {/* Score metrics */}
                      <div className="absolute top-2 left-2 flex items-center gap-4 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-900 z-10 font-mono text-[10px] text-zinc-400 uppercase font-bold">
                        <div>Score: <span className="text-red-400">{fpsScore}</span></div>
                        <div>Magazine: <span className="text-yellow-400">{bulletsRemaining}/30</span></div>
                      </div>

                      {bulletsRemaining === 0 && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 space-y-3 select-none">
                          <AlertTriangle className="w-8 h-8 text-orange-500 animate-bounce" />
                          <div className="text-center">
                            <p className="text-xs font-black uppercase text-white">Out of Ammo!</p>
                            <p className="text-[10px] text-zinc-500">Reload gun magazine to continue shoot simulations.</p>
                          </div>
                          <button
                            onClick={handleReloadGun}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] px-4 py-2 uppercase tracking-widest rounded-lg cursor-pointer transition-all"
                          >
                            Reload Weapon
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 text-[9px] uppercase font-bold text-zinc-650">
                        Tactical Target AI: Ready
                      </div>
                    </div>
                  )}

                  {/* Genre: GTA CITY */}
                  {selectedPreset.genre === 'gta' && (
                    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Stylized navigation grid overlay */}
                      <div className="absolute inset-0 border border-zinc-900 bg-black/40 flex items-center justify-center">
                        <div className="grid grid-cols-4 grid-rows-4 w-full h-full border border-zinc-900/60 opacity-30">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="border border-zinc-900/20" />
                          ))}
                        </div>
                      </div>

                      {/* Moving isometric car outlines */}
                      <div className="w-full max-w-sm relative h-40 border border-zinc-900/40 rounded-xl bg-black/20 p-2 overflow-hidden select-none z-10">
                        <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-wider">Cop Patrol alerts</span>
                        <div className="space-y-2 mt-1.5">
                          {gtaCars.map(car => (
                            <div 
                              key={car.id} 
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${car.color}`} />
                                <span className="text-[10px] font-bold text-zinc-300">{car.name}</span>
                              </div>
                              <button
                                onClick={() => {
                                  // Randomize vehicle position coordinate
                                  addNotification('GPS Navigation Vector', `Relocating vector positions for ${car.name}.`, 'info');
                                }}
                                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-[8px] text-zinc-400 rounded cursor-pointer uppercase font-bold"
                              >
                                Ping GPS
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Genre: RACING */}
                  {selectedPreset.genre === 'racing' && (
                    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center relative bg-black/40 p-4">
                      {/* Tachometer Speed display panel */}
                      <div className="text-center space-y-3 z-10 select-none">
                        <div className="inline-flex flex-col items-center justify-center p-6 rounded-full border-4 border-orange-500/30 bg-zinc-950/80 w-36 h-36 shadow-lg shadow-orange-500/5">
                          <span className="text-zinc-650 text-[9px] uppercase tracking-widest font-bold">Velocity</span>
                          <span className="text-2xl font-black text-orange-400 tracking-tight font-mono">{racingSpeed}</span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">KM / H</span>
                        </div>
                        
                        <div className="flex items-center gap-2 max-w-xs mx-auto">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Speed:</span>
                          <input
                            type="range"
                            min="30"
                            max="320"
                            value={racingSpeed}
                            onChange={(e) => setRacingSpeed(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Camera Sliders Adjustments controls Panel */}
                <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-4 md:pt-0 md:pl-4 space-y-4 flex flex-col justify-between select-none">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Camera Adjustments
                    </span>

                    <div className="space-y-3">
                      {/* Slider 1: Camera zoom */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                          <span>Camera FOV</span>
                          <span className="text-orange-400 font-mono">{zoomLevel}°</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="90"
                          value={zoomLevel}
                          onChange={(e) => setZoomLevel(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Slider 2: Lighting Intensity */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Sun className="w-3 h-3 text-yellow-400" />
                            Light Power
                          </span>
                          <span className="text-yellow-400 font-mono">{lightIntensity}W</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={lightIntensity}
                          onChange={(e) => setLightIntensity(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-yellow-500"
                        />
                      </div>

                      {/* Slider 3: Camera Angle */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                          <span>Pitch Tilt Angle</span>
                          <span className="text-teal-400 font-mono">{cameraAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={cameraAngle}
                          onChange={(e) => setCameraAngle(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900/60 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Rendering details</span>
                    <div className="text-[8px] text-zinc-600 leading-relaxed font-semibold mt-0.5">
                      Target Engine: <span className="text-zinc-550">{getEngineName()}</span><br />
                      Mesh Shader Core: <span className="text-emerald-500">GLSL_300</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL - COMPILATION TARGETS & PACKAGING CONTROL (Always visible alongside splits) */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between flex-shrink-0 select-none">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Build Targets Panel
            </span>

            {/* Target Radio list layout */}
            <div className="space-y-1.5 text-left">
              {[
                { id: 'android', label: 'Android APK', icon: '📱', desc: 'Pre-compile mobile package target.' },
                { id: 'windows', label: 'Windows EXE', icon: '🖥', desc: 'Direct compilation of DirectX 32/64 execution binaries.' },
                { id: 'macos', label: 'macOS Bundle', icon: '🍎', desc: 'Pre-pack Apple Silicon binary code.' },
                { id: 'linux', label: 'Linux Binary', icon: '🐧', desc: 'Create static ELF binary frameworks.' },
                { id: 'webgl', label: 'WebGL Bundle', icon: '🌐', desc: 'Render HTML5 WebAssembly deployment packages.' }
              ].map(target => (
                <div
                  key={target.id}
                  onClick={() => !isCompilingPackage && setSelectedTarget(target.id as any)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTarget === target.id
                      ? `bg-zinc-900/80 ${themeColors.border} text-white`
                      : 'bg-transparent border-zinc-900 text-zinc-400 hover:border-zinc-800'
                  } ${isCompilingPackage ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{target.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{target.label}</div>
                      <div className="text-[8px] text-zinc-500 truncate max-w-[170px] leading-none mt-0.5">{target.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compilation Button & Logs Panel */}
          <div className="space-y-3 pt-4 border-t border-zinc-900/60 text-left">
            
            {/* Realtime compilation loading tracker */}
            {isCompilingPackage && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-zinc-400 uppercase tracking-widest">Compiling Package</span>
                  <span className="text-orange-400 font-mono">{compileProgress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${compileProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Compile output log box */}
            {compileLogs.length > 0 && (
              <div className="p-2.5 rounded-lg bg-black border border-zinc-900 font-mono text-[9px] text-zinc-500 max-h-[100px] overflow-y-auto leading-relaxed scrollbar-none">
                {compileLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('[SUCCESS]') ? 'text-green-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={triggerMockPackageCompilation}
              disabled={isCompilingPackage}
              className={`w-full py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isCompilingPackage
                  ? 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                  : isConnected
                    ? 'bg-zinc-100 hover:bg-white text-zinc-950 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] active:scale-95'
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed hover:bg-zinc-950'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Compile Target</span>
            </button>

            {isCompileSuccessful && isConnected && (
              <button
                onClick={() => {
                  addNotification('Mock Download Started', `Successfully compiled game package file down.`, 'success');
                }}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-extrabold uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedTarget.toUpperCase()} Game</span>
              </button>
            )}

            {!isConnected && (
              <p className="text-[8px] text-zinc-600 text-center uppercase tracking-wide font-extrabold">
                ⚠️ Connect core engine node to package final game binaries.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
