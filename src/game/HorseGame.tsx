import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2, VolumeX, Pause, Play, RotateCcw, ZoomIn, ZoomOut, Trophy, X,
  Sparkles, BookOpen, Clock, Star, ArrowRight, ShieldAlert, Award, ChevronLeft,
  Flame, CheckCircle2, Lock
} from 'lucide-react';
import { drawHorseWorld, drawMagnifierLens } from './horseArt';
import { sound } from '../audio/soundEffects';
import { DifficultyLevel, HorseSecret, Stage } from '../types';
import { ALL_SECRETS, STAGES, DIFFICULTY_LABELS } from '../data/stagesData';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface HorseGameProps {
  onExitGame?: () => void;
  onOpenDocs?: () => void;
}

export const HorseGame: React.FC<HorseGameProps> = ({ onExitGame, onOpenDocs }) => {
  // Game states: 'title' | 'stage_select' | 'playing' | 'paused' | 'stage_clear' | 'defeat' | 'campaign_victory'
  const [gameState, setGameState] = useState<
    'title' | 'stage_select' | 'playing' | 'paused' | 'stage_clear' | 'defeat' | 'campaign_victory'
  >('title');

  // Stages & Progress State
  const [stages, setStages] = useState<Stage[]>(() => {
    const saved = localStorage.getItem('godot_horse_stages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return STAGES;
      }
    }
    return STAGES;
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('facil');
  const [currentStage, setCurrentStage] = useState<Stage>(STAGES[0]);
  const [stageSecrets, setStageSecrets] = useState<HorseSecret[]>([]);
  const [foundSecretIds, setFoundSecretIds] = useState<Set<string>>(new Set());

  // Timer & Score
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [currentZoom, setCurrentZoom] = useState<number>(2.2);
  const [inspectModalSecret, setInspectModalSecret] = useState<HorseSecret | null>(null);
  const [showAlbum, setShowAlbum] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation state kept in mutable ref so React renders don't hitch the 60fps canvas loop
  const simRef = useRef({
    lensX: 0,
    lensY: 0,
    targetLensX: 0,
    targetLensY: 0,
    lensRadius: 105,
    zoom: 2.2,
    time: 0,
    lastTime: performance.now(),
    cameraShake: 0,
    hitstopUntil: 0,
    horseSquash: { x: 1, y: 1 },
    squashVelocity: { x: 0, y: 0 },
    particles: [] as Particle[],
    isMouseDown: false,
    nearSecret: null as HorseSecret | null,
    revealedIds: new Set<string>(),
    width: 1200,
    height: 700,
    hasWindTremor: false,
    hasDynamicFog: false,
  });

  // Save stage progress to local storage
  const saveProgress = (updatedStages: Stage[]) => {
    setStages(updatedStages);
    localStorage.setItem('godot_horse_stages', JSON.stringify(updatedStages));
  };

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Set Zoom
  const handleZoomChange = useCallback((newZoom: number) => {
    const clamped = Math.max(1.2, Math.min(6.0, newZoom));
    simRef.current.zoom = clamped;
    setCurrentZoom(clamped);
    sound.playClick(600 + clamped * 100);
  }, []);

  // Start a specific stage
  const handleStartStage = (stage: Stage) => {
    setCurrentStage(stage);
    const activeSecrets = ALL_SECRETS.filter((s) => stage.secretIds.includes(s.id));
    setStageSecrets(activeSecrets);
    setFoundSecretIds(new Set());
    simRef.current.revealedIds = new Set();
    simRef.current.lensRadius = stage.lensRadius;
    simRef.current.zoom = Math.max(stage.targetZoomMin, 2.0);
    simRef.current.hasWindTremor = !!stage.hasWindTremor;
    simRef.current.hasDynamicFog = !!stage.hasDynamicFog;
    setCurrentZoom(simRef.current.zoom);

    if (stage.timeLimitSeconds) {
      setTimeLeft(stage.timeLimitSeconds);
    } else {
      setTimeLeft(null);
    }
    setElapsedTime(0);

    setGameState('playing');
    sound.playClick(900);
  };

  // Timer countdown hook for timed stages
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time out! Defeat
          clearInterval(timer);
          sound.playDefeat();
          setGameState('defeat');
          return 0;
        }

        // Heartbeat warning sound when under 15 seconds in hard/master
        if (prev <= 15 && prev % 2 === 0) {
          sound.playHeartbeat();
        }

        return prev - 1;
      });

      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Inspect or Discover Secret
  const handleInspect = useCallback(
    (secret: HorseSecret) => {
      sound.playDiscoveryChime();

      // Trigger hitstop & camera shake for game feel
      simRef.current.hitstopUntil = performance.now() + 60;
      simRef.current.cameraShake = 16;
      simRef.current.horseSquash = { x: 1.25, y: 0.75 }; // Squash!

      if (secret.category === 'tickle') {
        sound.playTickle();
        sound.playHorseWhinny();
      }

      // Spawn burst particles
      const px = (secret.xPercent / 100) * simRef.current.width;
      const py = (secret.yPercent / 100) * simRef.current.height;
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        simRef.current.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: secret.color || '#f59e0b',
          size: 3 + Math.random() * 4,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.03,
        });
      }

      setFoundSecretIds((prev) => {
        const next = new Set(prev);
        next.add(secret.id);
        simRef.current.revealedIds.add(secret.id);

        // Check if all secrets for this stage are found!
        if (next.size >= stageSecrets.length) {
          // Stage cleared!
          setTimeout(() => {
            // Calculate Stars
            let stars = 3;
            if (currentStage.timeLimitSeconds && timeLeft !== null) {
              const ratio = timeLeft / currentStage.timeLimitSeconds;
              if (ratio >= 0.5) stars = 3;
              else if (ratio >= 0.2) stars = 2;
              else stars = 1;
            }
            setEarnedStars(stars);

            // Unlock next stage
            const updated = stages.map((st, idx) => {
              if (st.id === currentStage.id) {
                return {
                  ...st,
                  stars: Math.max(st.stars, stars),
                  bestScore: Math.max(st.bestScore, 1000 + (timeLeft || 60) * 20),
                };
              }
              // Unlock subsequent stage
              if (idx === currentStage.stageNumber) {
                return { ...st, unlocked: true };
              }
              return st;
            });

            saveProgress(updated);

            // If final stage 16 completed, trigger campaign victory!
            if (currentStage.stageNumber === 16) {
              setGameState('campaign_victory');
              sound.playVictory();
              confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 } });
            } else {
              setGameState('stage_clear');
              sound.playVictory();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
          }, 600);
        }

        return next;
      });

      setInspectModalSecret(secret);
    },
    [currentStage, stageSecrets.length, stages, timeLeft]
  );

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if ((e.key === ' ' || e.key === 'Enter') && gameState === 'title') {
        e.preventDefault();
        setGameState('stage_select');
        sound.playClick(900);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomChange(simRef.current.zoom + 0.4);
      } else if (e.key === '-' || e.key === '_') {
        handleZoomChange(simRef.current.zoom - 0.4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleToggleMute, handleZoomChange]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      simRef.current.width = rect.width;
      simRef.current.height = rect.height;

      // Center lens initially
      if (simRef.current.lensX === 0) {
        simRef.current.lensX = rect.width * 0.5;
        simRef.current.lensY = rect.height * 0.5;
        simRef.current.targetLensX = rect.width * 0.5;
        simRef.current.targetLensY = rect.height * 0.5;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Game loop
    const render = (now: number) => {
      const rawDt = (now - simRef.current.lastTime) / 1000;
      simRef.current.lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      // Hitstop logic
      if (now < simRef.current.hitstopUntil) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      simRef.current.time += dt;

      const sim = simRef.current;
      const w = sim.width;
      const h = sim.height;

      // Wind tremor offset for hard levels
      let windX = 0;
      let windY = 0;
      if (sim.hasWindTremor && gameState === 'playing') {
        windX = Math.sin(sim.time * 6) * 1.8;
        windY = Math.cos(sim.time * 8) * 1.2;
      }

      // Smooth lens motion interpolation (lerp)
      sim.lensX += (sim.targetLensX + windX - sim.lensX) * Math.min(1, dt * 14);
      sim.lensY += (sim.targetLensY + windY - sim.lensY) * Math.min(1, dt * 14);

      // Camera shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (sim.cameraShake > 0) {
        shakeX = (Math.random() - 0.5) * sim.cameraShake;
        shakeY = (Math.random() - 0.5) * sim.cameraShake;
        sim.cameraShake = Math.max(0, sim.cameraShake - dt * 40);
      }

      // Squash and stretch spring physics
      const springK = 180;
      const damping = 12;
      const fx = -springK * (sim.horseSquash.x - 1) - damping * sim.squashVelocity.x;
      const fy = -springK * (sim.horseSquash.y - 1) - damping * sim.squashVelocity.y;
      sim.squashVelocity.x += fx * dt;
      sim.squashVelocity.y += fy * dt;
      sim.horseSquash.x += sim.squashVelocity.x * dt;
      sim.horseSquash.y += sim.squashVelocity.y * dt;

      // Check proximity to secrets
      let hoveredSecret: HorseSecret | null = null;
      if (gameState === 'playing') {
        const lensPercentX = (sim.lensX / w) * 100;
        const lensPercentY = (sim.lensY / h) * 100;

        for (const secret of stageSecrets) {
          if (foundSecretIds.has(secret.id)) continue;

          const dx = lensPercentX - secret.xPercent;
          const dy = lensPercentY - secret.yPercent;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= secret.radiusPercent && sim.zoom >= secret.minZoom) {
            hoveredSecret = secret;
            break;
          }
        }
      }
      sim.nearSecret = hoveredSecret;

      // Clear Canvas
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Apply camera shake
      ctx.translate(shakeX, shakeY);

      // 1. Draw Normal World
      drawHorseWorld(
        ctx,
        w,
        h,
        sim.time,
        sim.horseSquash,
        false,
        1.0,
        sim.revealedIds,
        sim.hasDynamicFog
      );

      // 2. Draw Magnified View inside Lens Circle via Clipping
      if (gameState === 'playing' || gameState === 'paused') {
        ctx.save();

        // Create circular clip for lens
        ctx.beginPath();
        ctx.arc(sim.lensX, sim.lensY, sim.lensRadius - 8, 0, Math.PI * 2);
        ctx.clip();

        // Magnify world around lens center
        ctx.translate(sim.lensX, sim.lensY);
        ctx.scale(sim.zoom, sim.zoom);
        ctx.translate(-sim.lensX, -sim.lensY);

        // Draw enhanced microscopic world details
        drawHorseWorld(ctx, w, h, sim.time, sim.horseSquash, true, sim.zoom, sim.revealedIds);

        ctx.restore();

        // 3. Draw Lens Frame, Bezel, Reticle and Highlights
        drawMagnifierLens(
          ctx,
          sim.lensX,
          sim.lensY,
          sim.lensRadius,
          sim.zoom,
          hoveredSecret !== null,
          hoveredSecret ? hoveredSecret.name : undefined
        );
      }

      // 4. Update and Draw Particles
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          sim.particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, stageSecrets, foundSecretIds]);

  // Pointer / Mouse events for lens control
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    simRef.current.isMouseDown = true;
    simRef.current.targetLensX = x;
    simRef.current.targetLensY = y;

    // If near a secret, inspect it!
    if (simRef.current.nearSecret) {
      handleInspect(simRef.current.nearSecret);
    } else {
      sound.playClick(500);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    simRef.current.targetLensX = x;
    simRef.current.targetLensY = y;

    if (simRef.current.nearSecret) {
      sound.playSecretProximity(1);
    }
  };

  const handlePointerUp = () => {
    simRef.current.isMouseDown = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    handleZoomChange(simRef.current.zoom + zoomDelta);
  };

  // Filter stages by difficulty for Stage Select Screen
  const filteredStages = stages.filter((s) => s.level === selectedDifficulty);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[640px] select-none bg-[#10141d] overflow-hidden flex flex-col items-center justify-center font-sans"
    >
      {/* 60fps Simulation Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* ================= 1. TITLE SCREEN ================= */}
      {gameState === 'title' && (
        <div className="absolute inset-0 bg-[#0f172a]/80 flex flex-col items-center justify-center z-30 p-6 text-center animate-fadeIn">
          {/* Godot 4.7.2 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#478cbf]/20 border border-[#478cbf]/40 text-[#478cbf] text-xs font-mono rounded mb-4">
            <span className="w-2 h-2 rounded-full bg-[#478cbf] animate-ping" />
            GODOT ENGINE 4.7.2 · EDIÇÃO ESPECIAL CAMPANHA
          </div>

          {/* Title Lockup */}
          <div className="max-w-2xl w-full mb-6">
            <svg viewBox="0 0 700 130" className="w-full h-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="goldTitle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="godotBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="100%" stopColor="#478cbf" />
                </linearGradient>
              </defs>
              <text x="350" y="48" textAnchor="middle" fill="url(#godotBlue)" fontSize="26" fontFamily="sans-serif" fontWeight="900" letterSpacing="6">
                LUPA DE CAVALOS
              </text>
              <text x="350" y="105" textAnchor="middle" fill="url(#goldTitle)" fontSize="48" fontFamily="serif" fontWeight="bold" letterSpacing="3">
                O CAVALO COMPLETO
              </text>
            </svg>
          </div>

          <p className="text-gray-300 max-w-xl text-sm sm:text-base mb-6 leading-relaxed">
            Campanha completa com <strong>16 Fases</strong> e <strong>4 Níveis de Dificuldade</strong> (Fácil, Médio, Difícil e Hard Master). Inspecione cada detalhe anatômico de sketbordcat com sua lente de alta precisão!
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => {
                setGameState('stage_select');
                sound.playClick(900);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#478cbf] to-[#3a729e] hover:from-[#559fd9] hover:to-[#478cbf] text-white font-bold text-base sm:text-lg rounded-xl shadow-xl shadow-[#478cbf]/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              ESCOLHER FASE & NÍVEL [ESPAÇO]
            </button>

            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="px-6 py-3.5 bg-[#1e293b] hover:bg-[#2d3748] text-amber-300 font-semibold text-sm rounded-xl transition border border-amber-500/40 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                Documentação do Cliente
              </button>
            )}

            {onExitGame && (
              <button
                onClick={onExitGame}
                className="px-6 py-3.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl transition border border-gray-700 cursor-pointer"
              >
                Portal Godot 4.7.2
              </button>
            )}
          </div>

          {/* Control Hint */}
          <div className="text-xs text-gray-400 font-mono tracking-wide">
            Arrastar Mouse / Touch p/ Mirar · Scroll p/ Zoom · Clique p/ Inspecionar · M Mutar · Esc Pausar
          </div>
        </div>
      )}

      {/* ================= 2. STAGE & DIFFICULTY SELECTOR SCREEN ================= */}
      {gameState === 'stage_select' && (
        <div className="absolute inset-0 bg-[#0f172a]/95 z-30 p-4 sm:p-8 flex flex-col items-center justify-between overflow-y-auto">
          {/* Header */}
          <div className="w-full max-w-5xl flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGameState('title')}
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar ao Título
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Mapa de Fases do Cavalo Completo
                </h2>
                <p className="text-xs text-gray-400">16 Fases distribuídas em 4 Níveis de Domínio Equino</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAlbum(true)}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg border border-gray-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Álbum ({stages.reduce((acc, s) => acc + s.stars, 0)}/48 ⭐)
              </button>
              {onOpenDocs && (
                <button
                  onClick={onOpenDocs}
                  className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" /> Manual do Cliente
                </button>
              )}
            </div>
          </div>

          {/* Difficulty Tabs: Fácil | Médio | Difícil | Hard Master */}
          <div className="w-full max-w-5xl mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {(['facil', 'medio', 'dificil', 'hard_master'] as const).map((lvl) => {
                const info = DIFFICULTY_LABELS[lvl];
                const isSelected = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedDifficulty(lvl);
                      sound.playClick(700);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#1e293b] shadow-lg scale-102'
                        : 'bg-[#141a26]/60 border-gray-800 hover:bg-[#1b2333]'
                    }`}
                    style={{
                      borderColor: isSelected ? info.color : undefined,
                    }}
                  >
                    {lvl === 'hard_master' && (
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                        <Flame className="w-3 h-3 fill-current" /> PESADELO
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white" style={{ color: info.color }}>
                        {info.name}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {stages.filter((s) => s.level === lvl && s.stars > 0).length}/4
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 font-medium truncate">{info.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Current Difficulty Description Box */}
            <div className="bg-[#1e293b]/60 border border-gray-800 p-3 rounded-lg mt-3 text-xs text-gray-300 flex items-center justify-between">
              <span>{DIFFICULTY_LABELS[selectedDifficulty].desc}</span>
              <span className="font-mono text-[11px] text-gray-400 ml-4 flex-shrink-0">
                4 Fases Disponíveis
              </span>
            </div>
          </div>

          {/* Stages Grid (4 phases per selected difficulty) */}
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-1">
            {filteredStages.map((stage) => {
              const isLocked = !stage.unlocked;
              return (
                <div
                  key={stage.id}
                  className={`bg-[#1e293b] border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                    isLocked
                      ? 'border-gray-800 opacity-60'
                      : 'border-gray-700 hover:border-[#478cbf] hover:shadow-xl'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-3 right-3 text-gray-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#478cbf]">
                        FASE #{stage.stageNumber}
                      </span>
                      {stage.stars > 0 && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: stage.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-1">{stage.title}</h3>
                    <div className="text-xs text-amber-400/90 font-mono mb-2">{stage.subtitle}</div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4 line-clamp-3">
                      {stage.description}
                    </p>
                  </div>

                  <div>
                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono mb-4">
                      <span>{stage.secretIds.length} Segredos</span>
                      {stage.timeLimitSeconds ? (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <Clock className="w-3 h-3" /> {stage.timeLimitSeconds}s
                        </span>
                      ) : (
                        <span className="text-emerald-400">Livre</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartStage(stage)}
                      disabled={isLocked}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isLocked
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-[#478cbf] hover:bg-[#559fd9] text-white shadow'
                      }`}
                    >
                      {isLocked ? (
                        <>Bloqueado</>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Jogar Fase
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Back */}
          <div className="w-full max-w-5xl flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-400 font-mono">
            <span>Dica: Conclua as fases para desbloquear os desafios seguintes</span>
            <button
              onClick={() => {
                // Quick unlock all for convenience
                const unlockedAll = stages.map((s) => ({ ...s, unlocked: true }));
                saveProgress(unlockedAll);
                sound.playDiscoveryChime();
              }}
              className="text-gray-500 hover:text-white underline cursor-pointer"
            >
              Desbloquear Todas as Fases (Modo Teste)
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. LOW-OCCLUSION PLAYING HUD ================= */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between">
            {/* Stage Info & Target Secrets */}
            <div className="pointer-events-auto bg-[#0f172a]/90 border border-[#478cbf]/50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase text-black"
                    style={{ backgroundColor: DIFFICULTY_LABELS[currentStage.level].color }}
                  >
                    {DIFFICULTY_LABELS[currentStage.level].name}
                  </span>
                  <span className="text-xs font-bold text-white">Fase #{currentStage.stageNumber}: {currentStage.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-300 font-mono">
                    Descobertas: <strong className="text-amber-400">{foundSecretIds.size} / {stageSecrets.length}</strong>
                  </span>
                  <div className="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#478cbf] to-amber-400 h-full transition-all duration-300"
                      style={{ width: `${(foundSecretIds.size / stageSecrets.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timer countdown (if stage is timed) */}
            {timeLeft !== null && (
              <div
                className={`pointer-events-auto px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-sm font-bold shadow-lg transition-all ${
                  timeLeft <= 15
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-[#0f172a]/90 border-gray-700 text-white'
                }`}
              >
                <Clock className={`w-4 h-4 ${timeLeft <= 15 ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>{timeLeft}s RESTANTES</span>
              </div>
            )}

            {/* Quick Actions (Pause, Zoom, Sound, Exit) */}
            <div className="pointer-events-auto flex items-center gap-2 bg-[#0f172a]/90 border border-gray-700 p-1.5 rounded-xl shadow-lg">
              <button
                onClick={() => setShowAlbum(true)}
                title="Álbum de Descobertas"
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-gray-700" />

              <button
                onClick={() => handleZoomChange(currentZoom - 0.4)}
                title="Diminuir Zoom (-)"
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-cyan-400 font-bold px-1 tabular-nums">
                {currentZoom.toFixed(1)}x
              </span>

              <button
                onClick={() => handleZoomChange(currentZoom + 0.4)}
                title="Aumentar Zoom (+)"
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-gray-700" />

              <button
                onClick={handleToggleMute}
                title={isMuted ? 'Ativar Som (M)' : 'Mutar Som (M)'}
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setGameState('paused')}
                title="Pausar (Esc)"
                className="p-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Control Clue Line */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <div className="bg-[#0f172a]/80 px-3 py-1 rounded-lg border border-gray-800">
              💡 Alvo: Aproxime a lente e ajuste o zoom até a mira travar em verde
            </div>
            <button
              onClick={() => setGameState('stage_select')}
              className="pointer-events-auto bg-[#0f172a]/90 hover:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 transition cursor-pointer"
            >
              Voltar às Fases
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. PAUSE MODAL ================= */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-[#0f172a]/85 flex items-center justify-center z-40 p-4">
          <div className="bg-[#1e293b] border border-gray-700 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Jogo Pausado</h3>
            <p className="text-xs text-amber-400 font-mono mb-4">Fase #{currentStage.stageNumber}: {currentStage.title}</p>

            <div className="space-y-3">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-2.5 bg-[#478cbf] hover:bg-[#559fd9] text-white font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> Continuar
              </button>

              <button
                onClick={() => handleStartStage(currentStage)}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition flex items-center justify-center gap-2 border border-gray-700 cursor-pointer text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Reiniciar Fase
              </button>

              <button
                onClick={() => setGameState('stage_select')}
                className="w-full py-2.5 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition cursor-pointer text-sm"
              >
                Voltar à Seleção de Fases
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. STAGE CLEAR MODAL ================= */}
      {gameState === 'stage_clear' && (
        <div className="absolute inset-0 bg-[#0f172a]/90 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1e293b] border-2 border-emerald-500/70 p-7 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              Fase Concluída com Sucesso!
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">Fase #{currentStage.stageNumber}: {currentStage.title}</h3>

            {/* Stars Earned */}
            <div className="flex items-center justify-center gap-2 my-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-7 h-7 ${
                    i < earnedStars ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-gray-600'
                  }`}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>

            <div className="bg-[#0f172a] p-3 rounded-xl border border-gray-800 my-4 text-xs font-mono text-gray-300 flex justify-around">
              <div>
                <span className="text-gray-500 block">Tempo Decorrido</span>
                <strong className="text-white text-sm">{elapsedTime}s</strong>
              </div>
              <div className="w-px bg-gray-800" />
              <div>
                <span className="text-gray-500 block">Segredos Coletados</span>
                <strong className="text-amber-400 text-sm">{stageSecrets.length}/{stageSecrets.length}</strong>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => setGameState('stage_select')}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Menu de Fases
              </button>

              {currentStage.stageNumber < 16 && (
                <button
                  onClick={() => {
                    const nextStage = stages.find((s) => s.stageNumber === currentStage.stageNumber + 1);
                    if (nextStage) handleStartStage(nextStage);
                  }}
                  className="px-6 py-2.5 bg-[#478cbf] hover:bg-[#559fd9] text-white text-sm font-bold rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
                >
                  Próxima Fase <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. DEFEAT / TIME OUT MODAL ================= */}
      {gameState === 'defeat' && (
        <div className="absolute inset-0 bg-[#0f172a]/90 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1e293b] border-2 border-rose-500/70 p-7 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/40">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block mb-1">
              Tempo Esgotado!
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">Fase #{currentStage.stageNumber}</h3>
            <p className="text-xs text-gray-300 mb-6">
              O cavalo se mexeu antes que você encontrasse todos os alvos. No nível <strong>{DIFFICULTY_LABELS[currentStage.level].name}</strong>, a velocidade de foco e zoom é fundamental!
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleStartStage(currentStage)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Tentar Novamente
              </button>
              <button
                onClick={() => setGameState('stage_select')}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                Mudar Fase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. CAMPAIGN VICTORY (ALL 16 PHASES) ================= */}
      {gameState === 'campaign_victory' && (
        <div className="absolute inset-0 bg-[#0f172a]/95 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1e293b] border-2 border-amber-400 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-1">CAMPANHA CONCLUÍDA!</h3>
            <p className="text-amber-400 font-mono text-xs uppercase tracking-widest mb-4">
              HONRA MÁXIMA: HARD MASTER SUPREMO DO GODOT 4.7.2
            </p>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
              Você superou todas as <strong>16 Fases</strong> através dos 4 níveis de dificuldade, do pasto amigável até a singularidade quântica do Hard Master! Toda a anatomia de <strong>sketbordcat</strong> foi decifrada com maestria.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setGameState('stage_select')}
                className="px-6 py-2.5 bg-[#478cbf] hover:bg-[#559fd9] text-white font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Ver Mapa de Fases
              </button>
              {onOpenDocs && (
                <button
                  onClick={onOpenDocs}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl transition cursor-pointer"
                >
                  Abrir Documentação do Cliente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= INSPECTED SECRET POPUP ================= */}
      {inspectModalSecret && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1e293b] border border-amber-500/50 p-6 rounded-2xl max-w-md w-full shadow-2xl relative text-left">
            <button
              onClick={() => setInspectModalSecret(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{inspectModalSecret.icon}</span>
              <div>
                <span className="text-xs uppercase font-mono text-amber-400 font-bold tracking-wider">
                  Descoberta {inspectModalSecret.category}
                </span>
                <h4 className="text-xl font-bold text-white">{inspectModalSecret.name}</h4>
                <p className="text-xs text-gray-400">Localização: {inspectModalSecret.locationName}</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-[#0f172a]/60 p-3.5 rounded-lg border border-gray-800">
              {inspectModalSecret.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Gravado na fase atual!
              </span>
              <button
                onClick={() => setInspectModalSecret(null)}
                className="px-5 py-2 bg-gradient-to-r from-[#478cbf] to-[#3a729e] hover:from-[#559fd9] hover:to-[#478cbf] text-white text-sm font-bold rounded-lg transition cursor-pointer"
              >
                Continuar Busca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAMP ALBUM MODAL ================= */}
      {showAlbum && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-gray-700 p-6 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#478cbf]" />
                  Catálogo Anatômico do Cavalo Completo
                </h3>
                <p className="text-xs text-gray-400">16 Segredos Totais catalogados nos 4 Níveis</p>
              </div>
              <button
                onClick={() => setShowAlbum(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {ALL_SECRETS.map((s) => {
                const isFound = foundSecretIds.has(s.id) || simRef.current.revealedIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border transition ${
                      isFound
                        ? 'bg-[#0f172a] border-amber-500/40'
                        : 'bg-[#0f172a]/30 border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-2 bg-gray-800 rounded-lg flex-shrink-0">
                        {isFound ? s.icon : '❓'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-gray-400">{s.locationName}</div>
                        <div className="font-bold text-xs text-white truncate">
                          {isFound ? s.name : 'Segredo Não Revelado'}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {isFound ? s.description : `Dica: ${s.hint}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAlbum(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Fechar Álbum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
