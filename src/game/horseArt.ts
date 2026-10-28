import { HorseSecret } from '../types';
import { ALL_SECRETS } from '../data/stagesData';

export const INITIAL_SECRETS: HorseSecret[] = ALL_SECRETS;


// Draw the full majestic horse in natural landscape
export function drawHorseWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  horseSquash: { x: number; y: number },
  isMagnifiedView: boolean = false,
  zoomLevel: number = 1.0,
  revealedSecrets: Set<string> = new Set(),
  hasDynamicFog: boolean = false
) {
  // Save context state
  ctx.save();

  // Background rolling hills and sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#70a5d4');
  skyGrad.addColorStop(0.55, '#c7e2f5');
  skyGrad.addColorStop(0.65, '#a3d99f');
  skyGrad.addColorStop(1, '#5a9957');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft distant sun / Godot blue glow
  ctx.fillStyle = 'rgba(255, 255, 230, 0.45)';
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.2, Math.min(width, height) * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Distant fluffy clouds
  const cloudOffset = (time * 12) % (width + 300);
  drawCloud(ctx, (width - cloudOffset + 100) % (width + 200) - 100, height * 0.15, 60);
  drawCloud(ctx, (width * 0.45 - cloudOffset * 0.6 + width) % width, height * 0.22, 45);

  // Distant green rolling hill
  ctx.fillStyle = '#6ab86d';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.62);
  ctx.bezierCurveTo(width * 0.3, height * 0.58, width * 0.7, height * 0.66, width, height * 0.61);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Foreground pastoral field with flowers
  ctx.fillStyle = '#4e8d51';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  ctx.bezierCurveTo(width * 0.35, height * 0.73, width * 0.65, height * 0.68, width, height * 0.72);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Draw some clovers & flowers
  drawFoliage(ctx, width, height, time);

  // Horse shadow
  ctx.fillStyle = 'rgba(25, 45, 25, 0.35)';
  ctx.beginPath();
  ctx.ellipse(width * 0.52, height * 0.84, width * 0.32, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base Horse Dimensions
  const breath = Math.sin(time * 2.5) * 3;
  const tailSwish = Math.sin(time * 3.2) * 0.08;
  const earTwitch = Math.sin(time * 4) > 0.85 ? Math.sin(time * 20) * 0.15 : 0;

  // Horse Transform with Squash & Stretch
  ctx.save();
  ctx.translate(width * 0.5, height * 0.55);
  ctx.scale(horseSquash.x, horseSquash.y);
  ctx.translate(-width * 0.5, -height * 0.55);

  // --- HORSE ANATOMY ---
  const horseBodyColor = '#804825'; // Rich Chestnut brown
  const horseUnderbelly = '#9b5b32';
  const horseManeColor = '#2d180d'; // Dark chocolate brown
  const horseMuzzleColor = '#cca383'; // Soft tan muzzle
  const horseHoofColor = '#3a3430';

  // 1. TAIL
  ctx.save();
  ctx.translate(width * 0.78, height * 0.48);
  ctx.rotate(tailSwish);
  ctx.fillStyle = horseManeColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(width * 0.08, height * 0.08, width * 0.12, height * 0.22, width * 0.05, height * 0.32);
  ctx.bezierCurveTo(width * 0.02, height * 0.24, width * 0.03, height * 0.12, -width * 0.03, height * 0.04);
  ctx.closePath();
  ctx.fill();

  // If in magnified view or discovered: show secret tail fiber optic cables!
  if (isMagnifiedView && zoomLevel >= 2.0) {
    ctx.strokeStyle = `hsl(${(time * 120) % 360}, 95%, 65%)`;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 8);
      ctx.bezierCurveTo(width * 0.06, height * 0.08 + i * 4, width * 0.09, height * 0.2 + i * 3, width * 0.04, height * 0.3);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. BACK LEGS (Far & Near)
  // Far back leg
  ctx.fillStyle = '#693717';
  drawLeg(ctx, width * 0.73, height * 0.52, width * 0.71, height * 0.83, width, height, horseHoofColor);
  // Near back leg
  ctx.fillStyle = horseBodyColor;
  drawLeg(ctx, width * 0.67, height * 0.52, width * 0.69, height * 0.84, width, height, horseHoofColor);

  // 3. FRONT LEGS (Far & Near)
  // Far front leg
  ctx.fillStyle = '#693717';
  drawLeg(ctx, width * 0.41, height * 0.52, width * 0.43, height * 0.82, width, height, horseHoofColor);
  // Near front leg
  ctx.fillStyle = horseBodyColor;
  drawLeg(ctx, width * 0.35, height * 0.52, width * 0.34, height * 0.83, width, height, horseHoofColor);

  // 4. MAIN TORSO / BARREL
  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.42);
  // Top spine/withers curve to croup
  ctx.bezierCurveTo(width * 0.45, height * 0.44 + breath * 0.3, width * 0.62, height * 0.41, width * 0.75, height * 0.46);
  // Rump curve down
  ctx.bezierCurveTo(width * 0.79, height * 0.5, width * 0.78, height * 0.62, width * 0.71, height * 0.65);
  // Underbelly curve
  ctx.bezierCurveTo(width * 0.58, height * 0.68 + breath * 0.5, width * 0.42, height * 0.67, width * 0.34, height * 0.6);
  // Chest curve forward
  ctx.bezierCurveTo(width * 0.28, height * 0.56, width * 0.29, height * 0.46, width * 0.35, height * 0.42);
  ctx.closePath();
  ctx.fill();

  // Underbelly highlight
  ctx.fillStyle = horseUnderbelly;
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.58);
  ctx.bezierCurveTo(width * 0.52, height * 0.65 + breath * 0.4, width * 0.66, height * 0.63, width * 0.7, height * 0.62);
  ctx.bezierCurveTo(width * 0.62, height * 0.59, width * 0.48, height * 0.58, width * 0.38, height * 0.58);
  ctx.closePath();
  ctx.fill();

  // 5. NECK & HEAD
  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.moveTo(width * 0.36, height * 0.45);
  // Crest of neck up to poll
  ctx.bezierCurveTo(width * 0.35, height * 0.32, width * 0.33, height * 0.25, width * 0.31, height * 0.23);
  // Forehead to nose bridge
  ctx.lineTo(width * 0.24, height * 0.32);
  // Nose down to muzzle tip
  ctx.lineTo(width * 0.16, height * 0.43);
  // Chin / muzzle curve
  ctx.bezierCurveTo(width * 0.16, height * 0.48, width * 0.21, height * 0.49, width * 0.23, height * 0.46);
  // Throat latch back down to chest
  ctx.bezierCurveTo(width * 0.27, height * 0.45, width * 0.31, height * 0.52, width * 0.34, height * 0.56);
  ctx.closePath();
  ctx.fill();

  // Soft tan muzzle
  ctx.fillStyle = horseMuzzleColor;
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.38);
  ctx.lineTo(width * 0.16, height * 0.43);
  ctx.bezierCurveTo(width * 0.16, height * 0.48, width * 0.21, height * 0.49, width * 0.23, height * 0.46);
  ctx.bezierCurveTo(width * 0.21, height * 0.42, width * 0.21, height * 0.39, width * 0.2, height * 0.38);
  ctx.closePath();
  ctx.fill();

  // Nostril
  ctx.fillStyle = '#422216';
  ctx.beginPath();
  ctx.ellipse(width * 0.18, height * 0.44, width * 0.012, height * 0.008, Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth line
  ctx.strokeStyle = '#5a301e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.17, height * 0.46);
  ctx.lineTo(width * 0.2, height * 0.465);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#1c100a';
  ctx.beginPath();
  ctx.ellipse(width * 0.26, height * 0.33, width * 0.014, height * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye gleam
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(width * 0.258, height * 0.326, width * 0.0035, 0, Math.PI * 2);
  ctx.fill();

  // EARS
  ctx.save();
  ctx.translate(width * 0.31, height * 0.23);
  ctx.rotate(earTwitch);
  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.moveTo(-width * 0.012, 0);
  ctx.lineTo(0, -height * 0.05);
  ctx.lineTo(width * 0.012, 0);
  ctx.closePath();
  ctx.fill();
  // Inner ear
  ctx.fillStyle = '#b57954';
  ctx.beginPath();
  ctx.moveTo(-width * 0.006, -height * 0.005);
  ctx.lineTo(0, -height * 0.038);
  ctx.lineTo(width * 0.006, -height * 0.005);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // MANE (Chocolate flowing locks)
  ctx.fillStyle = horseManeColor;
  ctx.beginPath();
  ctx.moveTo(width * 0.3, height * 0.23);
  ctx.bezierCurveTo(width * 0.33, height * 0.22, width * 0.37, height * 0.26, width * 0.38, height * 0.35);
  ctx.bezierCurveTo(width * 0.36, height * 0.36, width * 0.37, height * 0.4, width * 0.35, height * 0.43);
  ctx.bezierCurveTo(width * 0.33, height * 0.35, width * 0.33, height * 0.28, width * 0.3, height * 0.23);
  ctx.closePath();
  ctx.fill();

  // Forelock over forehead
  ctx.beginPath();
  ctx.moveTo(width * 0.29, height * 0.24);
  ctx.bezierCurveTo(width * 0.26, height * 0.26, width * 0.25, height * 0.29, width * 0.26, height * 0.31);
  ctx.bezierCurveTo(width * 0.27, height * 0.29, width * 0.28, height * 0.27, width * 0.29, height * 0.24);
  ctx.closePath();
  ctx.fill();

  // --- DETAILS VISIBLE ONLY IN MAGNIFIER OR DISCOVERED ---
  if (isMagnifiedView) {
    drawMicroSecretsInsideWorld(ctx, width, height, time, zoomLevel, revealedSecrets);
  }

  ctx.restore(); // Restore squash and stretch

  // Dynamic Fog for Difícil & Hard Master modes
  if (hasDynamicFog && !isMagnifiedView) {
    ctx.save();
    const fogGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.2,
      width * 0.5,
      height * 0.5,
      width * 0.6
    );
    fogGrad.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
    fogGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.4)');
    fogGrad.addColorStop(1, 'rgba(10, 15, 30, 0.85)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  ctx.restore(); // Restore global canvas
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  topX: number,
  topY: number,
  botX: number,
  botY: number,
  w: number,
  h: number,
  hoofColor: string
) {
  const midX = (topX + botX) * 0.5 + (botX > topX ? -w * 0.005 : w * 0.005);
  const midY = (topY + botY) * 0.5;

  ctx.beginPath();
  ctx.moveTo(topX - w * 0.02, topY);
  ctx.lineTo(midX - w * 0.015, midY);
  ctx.lineTo(botX - w * 0.012, botY - h * 0.02);
  ctx.lineTo(botX + w * 0.012, botY - h * 0.02);
  ctx.lineTo(midX + w * 0.015, midY);
  ctx.lineTo(topX + w * 0.02, topY);
  ctx.closePath();
  ctx.fill();

  // Hoof
  ctx.fillStyle = hoofColor;
  ctx.beginPath();
  ctx.moveTo(botX - w * 0.014, botY - h * 0.02);
  ctx.lineTo(botX - w * 0.016, botY);
  ctx.lineTo(botX + w * 0.016, botY);
  ctx.lineTo(botX + w * 0.014, botY - h * 0.02);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + r * 0.95, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawFoliage(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const flowerPositions = [
    { x: w * 0.12, y: h * 0.78, c: '#fbbf24' },
    { x: w * 0.22, y: h * 0.88, c: '#f43f5e' },
    { x: w * 0.48, y: h * 0.86, c: '#60a5fa' },
    { x: w * 0.82, y: h * 0.79, c: '#c084fc' },
    { x: w * 0.91, y: h * 0.85, c: '#facc15' },
    { x: w * 0.55, y: h * 0.91, c: '#ffffff' },
  ];

  flowerPositions.forEach((fl, idx) => {
    const sway = Math.sin(time * 2 + idx) * 2;
    // Stem
    ctx.strokeStyle = '#22543d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y + 12);
    ctx.lineTo(fl.x + sway, fl.y);
    ctx.stroke();

    // Petals
    ctx.fillStyle = fl.c;
    ctx.beginPath();
    ctx.arc(fl.x + sway, fl.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Microscopic eccentric secrets drawn in magnified space
function drawMicroSecretsInsideWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number,
  revealed: Set<string>
) {
  // 1. Nostril Tea Party (18%, 44%)
  if (zoom >= 2.0) {
    const nx = w * 0.18;
    const ny = h * 0.44;
    ctx.save();
    ctx.translate(nx, ny);
    // Tiny tea table & cup
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, 2, 12, 2); // table top
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-1, 4, 2, 6); // table leg
    // Teacup
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(2, 0, 3, 0, Math.PI);
    ctx.fill();
    // Steam
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(2 + Math.sin(t * 5) * 2, -6);
    ctx.stroke();
    // Tiny Sir Neigh-a-Lot (micro horse face with top hat & monocle)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, -9, 5, 5); // top hat
    ctx.fillRect(-11, -4, 9, 2); // brim
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(-7, -1, 3, 0, Math.PI * 2); // face
    ctx.fill();
    // Monocle
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(-6, -1, 1.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Cosmic Galaxy Pupil (26%, 33%)
  if (zoom >= 2.2) {
    const ex = w * 0.26;
    const ey = h * 0.33;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(t * 0.8);
    // Spiral arms
    for (let arm = 0; arm < 3; arm++) {
      ctx.strokeStyle = arm === 0 ? '#a855f7' : arm === 1 ? '#38bdf8' : '#ec4899';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let step = 0; step < 20; step++) {
        const angle = (arm * Math.PI * 2) / 3 + step * 0.25;
        const dist = step * 0.5;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        if (step === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // Star core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Ear Satellite Antenna (31%, 22%)
  if (zoom >= 1.9) {
    const ax = w * 0.31;
    const ay = h * 0.22;
    ctx.save();
    ctx.translate(ax, ay);
    // Dish
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 8, Math.PI * 0.7, Math.PI * 1.5);
    ctx.stroke();
    // Feeder
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(2, 2);
    ctx.stroke();
    // Red beacon
    ctx.fillStyle = Math.sin(t * 8) > 0 ? '#ef4444' : '#475569';
    ctx.beginPath();
    ctx.arc(2, 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Mane Rollercoaster (38%, 29%)
  if (zoom >= 2.5) {
    const rx = w * 0.38;
    const ry = h * 0.29;
    ctx.save();
    ctx.translate(rx, ry);
    // Rails
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.bezierCurveTo(-10, -18, 5, 12, 18, -12);
    ctx.stroke();
    // Track ties
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    for (let i = -14; i <= 14; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i, 2);
      ctx.stroke();
    }
    // Moving Cart with tiny screaming hands
    const cartPos = ((t * 0.8) % 1);
    const cartX = -15 + cartPos * 30;
    const cartY = Math.sin(cartPos * Math.PI * 2) * 6 - 4;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(cartX - 4, cartY - 3, 8, 4);
    // Tiny head
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(cartX, cartY - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Clockwork Hamster (44%, 49%)
  if (zoom >= 2.0) {
    const cx = w * 0.44;
    const cy = h * 0.49;
    ctx.save();
    ctx.translate(cx, cy);
    // Brass Gear 1
    ctx.save();
    ctx.rotate(t * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    for (let g = 0; g < 8; g++) {
      const a = (g * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
      ctx.stroke();
    }
    ctx.restore();
    // Tiny Hamster Wheel
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(14, 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    // Cute Hamster running
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(14 + Math.cos(t * 8) * 4, 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 6. Holographic Godot Node Tree (58%, 42%)
  if (zoom >= 1.8) {
    const sx = w * 0.58;
    const sy = h * 0.42;
    ctx.save();
    ctx.translate(sx, sy);
    // Neon Godot icon
    ctx.fillStyle = '#478cbf';
    ctx.beginPath();
    ctx.arc(0, -6, 5, 0, Math.PI * 2);
    ctx.fill();
    // Branches
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(-7, 7);
    ctx.moveTo(0, -1);
    ctx.lineTo(7, 7);
    ctx.stroke();
    // Sub-nodes
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(-7, 7, 2.5, 0, Math.PI * 2);
    ctx.arc(7, 7, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 7. Tickle Heart (57%, 58%)
  const tx = w * 0.57;
  const ty = h * 0.58;
  ctx.save();
  ctx.translate(tx, ty);
  const pulse = Math.sin(t * 6) * 1.5;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(-2, -2 + pulse, 3.5, 0, Math.PI * 2);
  ctx.arc(2, -2 + pulse, 3.5, 0, Math.PI * 2);
  ctx.lineTo(0, 4 + pulse);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 8. Ancient Rune Horseshoe (36%, 82%)
  if (zoom >= 2.2) {
    const hx = w * 0.36;
    const hy = h * 0.82;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, Math.PI * 0.2, Math.PI * 0.8, true);
    ctx.stroke();
    // Glowing rune
    ctx.fillStyle = '#fef08a';
    ctx.font = '7px monospace';
    ctx.fillText('ᚱ', -2, -1);
    ctx.restore();
  }

  // 9. Ferris GDExtension Crab (74%, 83%)
  if (zoom >= 2.4) {
    const fx = w * 0.74;
    const fy = h * 0.83;
    ctx.save();
    ctx.translate(fx, fy);
    // Crab body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Claws
    ctx.beginPath();
    ctx.arc(-7, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Tiny wrench
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(7, -3);
    ctx.lineTo(12, -7);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -4, 1.2, 0, Math.PI * 2);
    ctx.arc(2, -4, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 10. Golden Carrot (21%, 46%)
  if (zoom >= 2.2) {
    const gx = w * 0.21;
    const gy = h * 0.46;
    ctx.save();
    ctx.translate(gx, gy);
    // Carrot body
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();
    // Carrot leaves
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-3, -11);
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -12);
    ctx.moveTo(0, -6);
    ctx.lineTo(3, -11);
    ctx.stroke();
    ctx.restore();
  }

  // 11. Steam Valve GH-109639 (33%, 55%)
  if (zoom >= 2.3) {
    const vx = w * 0.33;
    const vy = h * 0.55;
    ctx.save();
    ctx.translate(vx, vy);
    // Gauge body
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Needle
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const needleAngle = -Math.PI * 0.5 + Math.sin(t * 8) * 0.8;
    ctx.lineTo(Math.cos(needleAngle) * 5, Math.sin(needleAngle) * 5);
    ctx.stroke();
    ctx.restore();
  }

  // 12. Quantum Signal GDScript 2.0 (48%, 39%)
  if (zoom >= 2.5) {
    const qx = w * 0.48;
    const qy = h * 0.39;
    ctx.save();
    ctx.translate(qx, qy);
    for (let r = 1; r <= 3; r++) {
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.9 - r * 0.25})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 4 + ((t * 10) % 5), -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 13. Micro Clover 7-Leaf (40%, 86%)
  if (zoom >= 2.6) {
    const lx = w * 0.4;
    const ly = h * 0.86;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.fillStyle = '#22c55e';
    for (let leaf = 0; leaf < 7; leaf++) {
      const ang = (leaf * Math.PI * 2) / 7;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 4.5, Math.sin(ang) * 4.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 14. Black Hole Core (50%, 50%)
  if (zoom >= 3.0) {
    const bx = w * 0.5;
    const by = h * 0.5;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-t * 3);
    // Accretion disk
    const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, 14);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.3, '#f43f5e');
    grad.addColorStop(0.7, '#fbbf24');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    // Event horizon core
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 15. Cosmic Monocle (30%, 18%)
  if (zoom >= 3.2) {
    const mx = w * 0.3;
    const my = h * 0.18;
    ctx.save();
    ctx.translate(mx, my);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.stroke();
    // 4D hypercube inner cross
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-3, -3, 6, 6);
    ctx.restore();
  }
}

// Render the high-tech magnifying glass with brass bezel, reticle, refraction and controls
export function drawMagnifierLens(
  ctx: CanvasRenderingContext2D,
  lensX: number,
  lensY: number,
  lensRadius: number,
  zoom: number,
  targetNearSecret: boolean,
  currentSecretHint?: string
) {
  ctx.save();

  // 1. Outer Brass Frame / Rim
  const rimGrad = ctx.createLinearGradient(lensX - lensRadius, lensY - lensRadius, lensX + lensRadius, lensY + lensRadius);
  rimGrad.addColorStop(0, '#fef08a');
  rimGrad.addColorStop(0.3, '#d97706');
  rimGrad.addColorStop(0.7, '#78350f');
  rimGrad.addColorStop(1, '#fef08a');

  // Shadow under entire lens
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;

  // Brass Ring
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(lensX, lensY, lensRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Reset shadow for inner elements
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 2. Beveled Dark Inner Rim
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(lensX, lensY, lensRadius - 6, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Brass Handle sticking out at bottom-right
  const handleAngle = Math.PI * 0.28;
  const startHandleX = lensX + Math.cos(handleAngle) * (lensRadius + 4);
  const startHandleY = lensY + Math.sin(handleAngle) * (lensRadius + 4);
  const endHandleX = lensX + Math.cos(handleAngle) * (lensRadius + 75);
  const endHandleY = lensY + Math.sin(handleAngle) * (lensRadius + 75);

  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startHandleX, startHandleY);
  ctx.lineTo(endHandleX, endHandleY);
  ctx.stroke();

  // Handle Grip Wrap
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(startHandleX + Math.cos(handleAngle) * 20, startHandleY + Math.sin(handleAngle) * 20);
  ctx.lineTo(endHandleX - Math.cos(handleAngle) * 6, endHandleY - Math.sin(handleAngle) * 6);
  ctx.stroke();

  // 4. Glass Lens Glare / Reflection Arc
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(lensX, lensY, lensRadius - 14, Math.PI * 1.15, Math.PI * 1.6);
  ctx.stroke();

  // 5. Reticle / Crosshair (Turns green/gold when near a secret)
  const reticleColor = targetNearSecret ? '#22c55e' : 'rgba(255, 255, 255, 0.45)';
  ctx.strokeStyle = reticleColor;
  ctx.lineWidth = targetNearSecret ? 2 : 1;

  // Center crosshair
  const chSize = 14;
  ctx.beginPath();
  ctx.moveTo(lensX - chSize, lensY);
  ctx.lineTo(lensX + chSize, lensY);
  ctx.moveTo(lensX, lensY - chSize);
  ctx.lineTo(lensX, lensY + chSize);
  ctx.stroke();

  // Center target ring
  ctx.beginPath();
  ctx.arc(lensX, lensY, 8, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Perimeter Zoom & Status Badges on Rim
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(lensX - 38, lensY - lensRadius - 18, 76, 22, 6);
  ctx.fill();
  ctx.strokeStyle = '#478cbf';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${zoom.toFixed(1)}x ZOOM`, lensX, lensY - lensRadius - 7);

  // If secret proximity active, show discovery alert tag
  if (targetNearSecret) {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(lensX - 55, lensY + lensRadius - 4, 110, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f0fdf4';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('✨ CLIQUE P/ INSPECIONAR', lensX, lensY + lensRadius + 7);
  }

  ctx.restore();
}
