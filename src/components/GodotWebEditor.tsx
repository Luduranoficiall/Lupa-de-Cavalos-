import React, { useState } from 'react';
import { Play, Square, RotateCcw, Folder, FileCode, Layers, Eye, Settings, Terminal, Sparkles, Check, ChevronRight, ChevronDown } from 'lucide-react';

export const GodotWebEditor: React.FC = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<'2D' | '3D' | 'Script' | 'AssetLib'>('2D');
  const [selectedNode, setSelectedNode] = useState<string>('HorseBody');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Godot Engine v4.7.2.stable.official.ed1daf0bf - https://godotengine.org',
    'Vulkan 1.3.268 - Forward+ - Using Device #0: WebGL 2.0 (Shader Pipeline)',
    'Loaded project: "Horse Magnifier: The Full Horse" (res://project.godot)',
    'Scene loaded: res://scenes/horse_world.tscn with 5 nodes',
    'GH-109639: High polling rate mouse smooth filter initialized.',
  ]);

  // Editable scene properties
  const [horseScale, setHorseScale] = useState<number>(1.0);
  const [horseColor, setHorseColor] = useState<string>('#804825');
  const [lensPower, setLensPower] = useState<number>(2.5);
  const [horseMood, setHorseMood] = useState<'Feliz' | 'Curioso' | 'Sonolento'>('Feliz');

  // Script editor content
  const [scriptCode, setScriptCode] = useState<string>(`extends CharacterBody2D
# Script para o Cavalo Completo - Godot 4.7.2
# Atualizado para compatibilidade com commit ed1daf0bf

@export var magnification_power: float = 2.5
@export var tickle_resistance: float = 10.0
@onready var lens_camera: Camera2D = $MagnifierLens

signal secret_discovered(secret_name: String)

func _ready() -> void:
    print("Cavalo inicializado com sucesso no Godot 4.7.2!")
    print("Taxa de polling do mouse calibrada (GH-109639).")

func inspect_anatomy(coords: Vector2) -> void:
    if coords.distance_to(Vector2(57, 58)) < 5.0:
        relinchar_de_rir()
        secret_discovered.emit("Ponto de Cócegas Secreto")

func relinchar_de_rir() -> void:
    # Animação squash-and-stretch
    var tween := create_tween()
    tween.tween_property(self, "scale", Vector2(1.2, 0.8), 0.1)
    tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)
`);

  const handleRunProject = () => {
    setIsRunning(true);
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executando cena principal (F5)...`,
      `[${new Date().toLocaleTimeString()}] Viewport instanciada com sucesso. Escala: ${horseScale}x.`,
    ]);
  };

  const handleStopProject = () => {
    setIsRunning(false);
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Projeto interrompido pelo usuário.`,
    ]);
  };

  return (
    <div className="w-full h-[780px] bg-[#1a1d24] text-[#e0e1e5] flex flex-col font-sans border border-[#2b303c] rounded-xl overflow-hidden shadow-2xl my-6">
      {/* Top Application Bar */}
      <div className="bg-[#242933] border-b border-[#2e3444] px-3 py-1.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#478cbf] rounded flex items-center justify-center font-bold text-[10px] text-white">
              G
            </div>
            <span className="font-bold text-gray-200">Godot 4.7.2 Web Editor</span>
            <span className="text-gray-500 font-mono text-[11px]">- Horse_Magnifier.project</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-gray-400">
            <span className="hover:text-white cursor-pointer">Cena</span>
            <span className="hover:text-white cursor-pointer">Projeto</span>
            <span className="hover:text-white cursor-pointer">Depurar</span>
            <span className="hover:text-white cursor-pointer">Editor</span>
            <span className="hover:text-white cursor-pointer">Ajuda</span>
          </div>
        </div>

        {/* Center Workspace Switcher: 2D | 3D | Script | AssetLib */}
        <div className="flex items-center bg-[#191d26] rounded-md p-0.5 border border-gray-700">
          {(['2D', '3D', 'Script', 'AssetLib'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveWorkspace(tab)}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                activeWorkspace === tab
                  ? 'bg-[#478cbf] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Play Controls (F5 Run, Stop, Reload) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRunProject}
            disabled={isRunning}
            title="Executar Projeto (F5)"
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1 ${
              isRunning
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2f3646] hover:bg-[#3b4458] text-emerald-400'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline font-mono text-[11px]">Executar</span>
          </button>

          <button
            onClick={handleStopProject}
            disabled={!isRunning}
            title="Parar Projeto (F8)"
            className="p-1.5 bg-[#2f3646] hover:bg-[#3b4458] disabled:opacity-40 text-rose-400 rounded transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Docks */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Dock: Scene Tree & FileSystem */}
        <div className="w-64 bg-[#20242d] border-r border-[#2b303c] flex flex-col select-none">
          {/* Scene Tree Header */}
          <div className="p-2 border-b border-[#2b303c] flex items-center justify-between text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#478cbf]" /> Cena (Árvore de Nós)
            </span>
            <span className="text-[10px] text-gray-500 font-mono">res://</span>
          </div>

          {/* Node List */}
          <div className="p-2 space-y-1 text-xs overflow-y-auto flex-1">
            {[
              { id: 'HorseWorld', name: 'HorseWorld', type: 'Node2D', icon: '🌐' },
              { id: 'HorseBody', name: 'HorseBody', type: 'CharacterBody2D', icon: '🐎', parent: 'HorseWorld' },
              { id: 'SpriteHorse', name: 'SpriteHorse', type: 'Sprite2D', icon: '🖼️', parent: 'HorseBody' },
              { id: 'MagnifierLens', name: 'MagnifierLens', type: 'Camera2D', icon: '🔍', parent: 'HorseBody' },
              { id: 'AudioPlayer', name: 'AudioStreamPlayer2D', type: 'AudioStreamPlayer2D', icon: '🔊', parent: 'HorseWorld' },
            ].map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                  selectedNode === node.id
                    ? 'bg-[#478cbf] text-white font-bold'
                    : 'text-gray-300 hover:bg-[#2b303c]'
                } ${node.parent ? 'ml-4' : ''}`}
              >
                <span>{node.icon}</span>
                <span className="truncate">{node.name}</span>
                <span className="text-[10px] text-gray-400 ml-auto font-mono">{node.type}</span>
              </div>
            ))}
          </div>

          {/* FileSystem Dock */}
          <div className="border-t border-[#2b303c] p-2 bg-[#1b1e25]">
            <div className="text-[11px] font-bold text-gray-400 mb-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-amber-400" /> Sistema de Arquivos
            </div>
            <div className="space-y-0.5 text-xs text-gray-300">
              <div className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-gray-800 rounded">
                <FileCode className="w-3.5 h-3.5 text-[#478cbf]" /> horse_world.tscn
              </div>
              <div className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-gray-800 rounded">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" /> magnifier.gd
              </div>
              <div className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-gray-800 rounded">
                <FileCode className="w-3.5 h-3.5 text-purple-400" /> lens_shader.gdshader
              </div>
            </div>
          </div>
        </div>

        {/* Center: Viewport / Script Editor */}
        <div className="flex-1 flex flex-col bg-[#14171d] relative overflow-hidden">
          {activeWorkspace === '2D' && (
            <div className="flex-1 flex flex-col items-center justify-center relative p-4">
              {/* Viewport Grid Overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#478cbf_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Viewport Live Simulation Box */}
              <div className="relative w-full max-w-xl aspect-[16/10] bg-[#1a1f2c] border border-gray-700 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6">
                {/* 2D Ruler Overlay (Highlighting GH-120890) */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-[#478cbf] bg-[#0f172a]/90 px-2 py-0.5 rounded border border-[#478cbf]/30">
                  Régua 2D: (x: 480, y: 320) · Escala: {horseScale.toFixed(2)}x
                </div>

                {/* Animated Horse Canvas Preview */}
                <div
                  className="transition-transform duration-200"
                  style={{
                    transform: `scale(${horseScale})`,
                  }}
                >
                  <div
                    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center shadow-lg transition-colors"
                    style={{
                      backgroundColor: horseColor + '33',
                      borderColor: horseColor,
                    }}
                  >
                    <span className="text-6xl mb-2">🐎</span>
                    <span className="font-bold text-white text-sm">O Cavalo Completo</span>
                    <span className="text-xs text-gray-300 font-mono">Humor: {horseMood} · Lente: {lensPower}x</span>
                  </div>
                </div>

                {isRunning && (
                  <div className="absolute bottom-3 right-3 bg-emerald-500/20 text-emerald-300 text-xs font-mono px-2.5 py-1 rounded border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> CENA EXECUTANDO A 60 FPS
                  </div>
                )}
              </div>
            </div>
          )}

          {activeWorkspace === '3D' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-[#1f2533] p-8 rounded-2xl border border-gray-700 max-w-md">
                <span className="text-5xl block mb-3">📐</span>
                <h4 className="text-lg font-bold text-white mb-2">Viewport 3D & Régua 3D</h4>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  Demonstração da correção <strong>GH-120890</strong> no Godot 4.7.2: A dica de ferramenta da régua 3D agora mantém a orientação correta independente da rotação da câmera orbital.
                </p>
                <div className="p-3 bg-[#0f172a] rounded font-mono text-xs text-emerald-400 border border-gray-800">
                  Gizmo::MeasureRuler3D: Tooltip anchored at screen space vector
                </div>
              </div>
            </div>
          )}

          {activeWorkspace === 'Script' && (
            <div className="flex-1 flex flex-col bg-[#11141a]">
              <div className="bg-[#191d26] px-4 py-1.5 border-b border-[#2b303c] text-xs font-mono text-gray-400 flex items-center justify-between">
                <span>res://scripts/magnifier.gd (GDScript 2.0)</span>
                <span className="text-emerald-400">● Sintaxe Válida Godot 4.7.2</span>
              </div>
              <textarea
                value={scriptCode}
                onChange={(e) => setScriptCode(e.target.value)}
                className="flex-1 p-4 bg-transparent font-mono text-xs text-gray-200 resize-none focus:outline-none selection:bg-[#478cbf]/40 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {activeWorkspace === 'AssetLib' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4">Godot Asset Store (4.7.2 HiDPI Corrigido)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1e232e] p-4 rounded-xl border border-gray-700">
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="font-bold text-white text-sm">Horse Magnifier Lens Shader</h4>
                  <p className="text-xs text-gray-400 mt-1">Shader 2D de refração esférica e aberração cromática por sketbordcat.</p>
                  <span className="text-[11px] text-emerald-400 mt-2 block font-mono">Instalado no projeto</span>
                </div>
                <div className="bg-[#1e232e] p-4 rounded-xl border border-gray-700">
                  <div className="text-2xl mb-2">🎮</div>
                  <h4 className="font-bold text-white text-sm">Smooth Polling Rate Controller</h4>
                  <p className="text-xs text-gray-400 mt-1">Implementação de alta fidelidade para mouses de 8000Hz (GH-109639).</p>
                  <span className="text-[11px] text-[#478cbf] mt-2 block font-mono">Disponível na AssetLib</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Dock: Node Inspector */}
        <div className="w-72 bg-[#20242d] border-l border-[#2b303c] flex flex-col select-none">
          <div className="p-2 border-b border-[#2b303c] flex items-center justify-between text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-amber-400" /> Inspetor de Nós
            </span>
            <span className="text-[11px] text-[#478cbf] font-mono">{selectedNode}</span>
          </div>

          <div className="p-3 space-y-4 text-xs overflow-y-auto flex-1">
            {/* Transform Properties */}
            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider block mb-2">
                Transform 2D
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Escala:</span>
                    <span className="font-mono text-cyan-400">{horseScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={horseScale}
                    onChange={(e) => setHorseScale(parseFloat(e.target.value))}
                    className="w-full accent-[#478cbf]"
                  />
                </div>
              </div>
            </div>

            {/* Custom Parameters */}
            <div className="pt-3 border-t border-[#2b303c]">
              <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider block mb-2">
                Propriedades do Cavalo
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 block mb-1">Cor do Pelame (Modulate):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={horseColor}
                      onChange={(e) => setHorseColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-gray-400 text-xs">{horseColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Poder da Lente Magnifier:</label>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.2"
                    value={lensPower}
                    onChange={(e) => setLensPower(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="text-right font-mono text-amber-400 text-[11px]">{lensPower}x</div>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Humor do Cavalo:</label>
                  <select
                    value={horseMood}
                    onChange={(e) => setHorseMood(e.target.value as any)}
                    className="w-full bg-[#161920] border border-gray-700 rounded p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Feliz">Feliz (Gosta de carinho)</option>
                    <option value="Curioso">Curioso (Olhando a lente)</option>
                    <option value="Sonolento">Sonolento (Respirando lento)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Console / Output Dock */}
      <div className="h-28 bg-[#16181f] border-t border-[#2b303c] p-2 flex flex-col font-mono text-xs select-none">
        <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-1 border-b border-gray-800 pb-1">
          <span className="text-white font-bold flex items-center gap-1">
            <Terminal className="w-3 h-3 text-[#478cbf]" /> Saída
          </span>
          <span className="hover:text-white cursor-pointer">Depurador</span>
          <span className="hover:text-white cursor-pointer">Áudio</span>
          <span className="hover:text-white cursor-pointer">Animação</span>
          <span className="hover:text-white cursor-pointer">Shader</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 text-gray-300 text-[11px]">
          {consoleLogs.map((log, index) => (
            <div key={index} className="leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
