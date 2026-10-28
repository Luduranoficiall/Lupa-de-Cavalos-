export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'hard_master';

export interface Stage {
  id: string;
  stageNumber: number;
  level: DifficultyLevel;
  title: string;
  subtitle: string;
  description: string;
  secretIds: string[];
  timeLimitSeconds?: number; // undefined = sem limite de tempo
  lensRadius: number; // tamanho da lente
  targetZoomMin: number;
  unlocked: boolean;
  stars: number; // 0 a 3
  bestScore: number;
  bestTime?: number;
  hasWindTremor?: boolean;
  hasDynamicFog?: boolean;
}

export interface HorseSecret {
  id: string;
  name: string;
  locationName: string;
  description: string;
  hint: string;
  xPercent: number; // 0 to 100 on horse canvas
  yPercent: number;
  radiusPercent: number;
  found: boolean;
  minZoom: number; // Required zoom level to clearly reveal
  category: 'anatomy' | 'secret' | 'godot' | 'tickle' | 'cosmic';
  icon: string;
  color: string;
  difficulty?: DifficultyLevel;
}

export interface ChangelogItem {
  id: string;
  pr: string;
  category: '3D' | 'Assetlib' | 'Core' | 'Editor' | 'GDExtension' | 'GUI' | 'Input' | 'Multiplayer' | 'Navigation' | 'Network' | 'Platforms' | 'Rendering' | 'Thirdparty';
  title: string;
  description: string;
  impact: string;
  author?: string;
}

export interface GodotDownload {
  os: 'Linux' | 'macOS' | 'Windows';
  edition: 'Padrão' | '.NET (C#)';
  architecture: string;
  size: string;
  filename: string;
  sha256: string;
}

export interface SceneNode {
  id: string;
  name: string;
  type: 'Node2D' | 'CharacterBody2D' | 'Sprite2D' | 'CollisionShape2D' | 'Camera2D' | 'AudioStreamPlayer2D';
  children?: SceneNode[];
  properties: {
    position: { x: number; y: number };
    scale: { x: number; y: number };
    rotation: number;
    modulate: string;
    visible: boolean;
    customParams?: Record<string, any>;
  };
}
