import React, { useRef, useEffect } from 'react';
import { loadCarSprite, getCachedSprite } from '../../../utils/carSpriteLoader';

/**
 * World-Class 2.5D Canvas Racing Highway Engine
 * - Photorealistic track backdrop with illuminated skyline, ferris wheel, and bridge
 * - Genuine high-performance supercar artwork for player & opponents
 * - Perspective road with wet asphalt light reflections & scrolling lane markers
 * - Hero player hypercar with suspension squat, custom license plate, ground shadow, and animated exhaust flames
 * - High-speed motion blur streaks and Nitro warp distortion
 */
export const RacingTrackCanvas = ({
  playerProgress = 0,
  playerSpeedKmH = 0,
  isNitroActive = false,
  isFinished = false,
  playerCar = null,
  opponents = [],
  licensePlate = 'NASIR',
  trackTheme = 'neon_coast',
}) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    roadOffset: 0,
    speedLerp: 0,
    shake: 0,
    squatY: 0,
    frame: 0,
    bgImage: null,
    carSprites: {},
  });

  const propsRef = useRef({
    playerProgress,
    playerSpeedKmH,
    isNitroActive,
    isFinished,
    playerCar,
    opponents,
    licensePlate,
    trackTheme,
  });

  useEffect(() => {
    propsRef.current = {
      playerProgress,
      playerSpeedKmH,
      isNitroActive,
      isFinished,
      playerCar,
      opponents,
      licensePlate,
      trackTheme,
    };
  }, [playerProgress, playerSpeedKmH, isNitroActive, isFinished, playerCar, opponents, licensePlate, trackTheme]);

  // Preload track background and all car models
  useEffect(() => {
    const bg = new Image();
    bg.src = '/racing/track_neon_coast.jpg';
    bg.onload = () => {
      stateRef.current.bgImage = bg;
    };

    // Preload car sprites
    const carsToLoad = [
      { id: 'shadow_v12', src: '/racing/shadow_v12.jpg' },
      { id: 'street_phantom', src: '/racing/street_phantom.jpg' },
      { id: 'neon_gt', src: '/racing/neon_gt.jpg' },
      { id: 'cyber_cruiser', src: '/racing/cyber_cruiser.jpg' },
      { id: 'thunder_rs', src: '/racing/thunder_rs.jpg' },
      { id: 'apex_x', src: '/racing/apex_x.jpg' },
    ];

    carsToLoad.forEach((c) => {
      loadCarSprite(c.id, c.src).then((sprite) => {
        if (sprite) stateRef.current.carSprites[c.id] = sprite;
      });
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const state = stateRef.current;
      const props = propsRef.current;
      state.frame++;

      const targetSpeed = Math.max(15, props.playerSpeedKmH);
      state.speedLerp += (targetSpeed - state.speedLerp) * 0.14;

      // Road speed scroll step
      const moveMultiplier = (state.speedLerp / 75) * (props.isNitroActive ? 1.9 : 1);
      state.roadOffset = (state.roadOffset + moveMultiplier * dt * 500) % 1000;

      // Camera vibration & acceleration suspension squat
      const targetShake = state.speedLerp > 120 ? (state.speedLerp - 120) * 0.04 : 0;
      state.shake += (targetShake - state.shake) * 0.2;
      const shakeX = (Math.random() - 0.5) * state.shake * 2.5;
      const shakeY = (Math.random() - 0.5) * state.shake * 2.5;

      // Squat rear downwards when accelerating
      const targetSquat = state.speedLerp > 80 ? Math.min(8, (state.speedLerp - 80) * 0.08) : 0;
      state.squatY += (targetSquat - state.squatY) * 0.15;

      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // ========================================================
      // 1. CINEMATIC TRACK BACKGROUND (Image 1 & 2 Signature)
      // ========================================================
      const horizonY = H * 0.46;

      if (state.bgImage && state.bgImage.complete) {
        // Draw panoramic city waterfront & skyline
        ctx.drawImage(state.bgImage, 0, 0, W, H);
      } else {
        // High-fidelity fallback dusk gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(0.5, '#0d1532');
        skyGrad.addColorStop(1, '#2c143d');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // ========================================================
      // 2. DYNAMIC 2.5D PERSPECTIVE HIGHWAY
      // ========================================================
      const vanishX = W * 0.5;
      const vanishY = horizonY;
      const roadTopWidth = W * 0.22;
      const roadBottomWidth = W * 0.96;
      const roadTopLeft = vanishX - roadTopWidth / 2;
      const roadTopRight = vanishX + roadTopWidth / 2;
      const roadBottomLeft = vanishX - roadBottomWidth / 2;
      const roadBottomRight = vanishX + roadBottomWidth / 2;

      // Dark wet asphalt overlay
      const roadGrad = ctx.createLinearGradient(0, vanishY, 0, H);
      roadGrad.addColorStop(0, 'rgba(10, 15, 30, 0.95)');
      roadGrad.addColorStop(0.3, 'rgba(8, 12, 24, 0.92)');
      roadGrad.addColorStop(0.7, 'rgba(5, 7, 16, 0.96)');
      roadGrad.addColorStop(1, 'rgba(3, 4, 10, 0.98)');
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, vanishY);
      ctx.lineTo(roadTopRight, vanishY);
      ctx.lineTo(roadBottomRight, H);
      ctx.lineTo(roadBottomLeft, H);
      ctx.closePath();
      ctx.fill();

      // Road boundary safety guardrails
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, vanishY);
      ctx.lineTo(roadBottomLeft, H);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.beginPath();
      ctx.moveTo(roadTopRight, vanishY);
      ctx.lineTo(roadBottomRight, H);
      ctx.stroke();

      // Red Glowing Chevron Arrows along right barrier ('>>>')
      for (let c = 0; c < 5; c++) {
        const t = ((c * 0.2 + (state.roadOffset % 200) / 1000) % 1);
        if (t < 0.05 || t > 0.95) continue;
        const cy = vanishY + (H - vanishY) * Math.pow(t, 1.8);
        const cx = vanishX + (roadTopRight - vanishX + (roadBottomRight - roadTopRight) * Math.pow(t, 1.8)) + 18 * t;
        const cSize = 8 + 24 * t;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10 * t;
        ctx.beginPath();
        ctx.moveTo(cx, cy - cSize / 2);
        ctx.lineTo(cx + cSize * 0.65, cy);
        ctx.lineTo(cx, cy + cSize / 2);
        ctx.lineTo(cx - cSize * 0.2, cy + cSize / 2);
        ctx.lineTo(cx + cSize * 0.4, cy);
        ctx.lineTo(cx - cSize * 0.2, cy - cSize / 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ========================================================
      // 3. PERSPECTIVE DASHED LANE MARKINGS
      // ========================================================
      const laneOffsets = [-0.25, 0, 0.25];
      const segments = 18;

      laneOffsets.forEach((laneRatio) => {
        for (let i = 0; i < segments; i++) {
          const t1 = ((i / segments + state.roadOffset / 450) % 1);
          const t2 = t1 + 0.032;
          if (t2 > 1 || t1 < 0.02) continue;

          const depth1 = Math.pow(t1, 2.3);
          const depth2 = Math.pow(Math.min(1, t2), 2.3);

          const y1 = vanishY + (H - vanishY) * depth1;
          const y2 = vanishY + (H - vanishY) * depth2;

          const currentRoadW1 = roadTopWidth + (roadBottomWidth - roadTopWidth) * depth1;
          const currentRoadW2 = roadTopWidth + (roadBottomWidth - roadTopWidth) * depth2;

          const x1 = vanishX + laneRatio * currentRoadW1;
          const x2 = vanishX + laneRatio * currentRoadW2;

          ctx.strokeStyle = laneRatio === 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = Math.max(1.5, 5 * depth2);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });

      // Wet road neon reflection bloom from city & car taillights
      const playerColor = props.playerCar?.color || '#a855f7';
      const wetBloom = ctx.createRadialGradient(vanishX, H * 0.9, 30, vanishX, H * 0.9, W * 0.45);
      wetBloom.addColorStop(0, `${playerColor}55`);
      wetBloom.addColorStop(0.4, `${playerColor}22`);
      wetBloom.addColorStop(1, 'transparent');
      ctx.fillStyle = wetBloom;
      ctx.fillRect(vanishX - W * 0.45, H * 0.6, W * 0.9, H * 0.4);

      // ========================================================
      // 4. OPPONENT RACERS (REAL AUTOMOTIVE ARTWORK)
      // ========================================================
      const opponentLanes = [-0.28, 0.28, -0.14, 0.14, 0];
      const opponentCarModels = [
        'street_phantom', // Alex (Red)
        'neon_gt',        // Sophia (Green)
        'cyber_cruiser',  // Rohan (Blue)
        'thunder_rs',     // Emma (Gold)
        'apex_x',         // Liam (Silver)
      ];

      (props.opponents || []).slice(0, 5).forEach((opp, idx) => {
        const progressDiff = (opp.progress || 0) - props.playerProgress;
        let oppDepth = 0.48 + progressDiff * 0.016;
        oppDepth = Math.max(0.12, Math.min(0.72, oppDepth));

        const nonLinearDepth = Math.pow(oppDepth, 2.1);
        const oppY = vanishY + (H - vanishY) * nonLinearDepth;
        const currentRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * nonLinearDepth;
        const laneRatio = opponentLanes[idx % opponentLanes.length];
        const oppX = vanishX + laneRatio * currentRoadW;

        const carScale = Math.max(0.22, nonLinearDepth * 0.78);
        const oppCarW = Math.max(36, 260 * carScale);
        const oppCarH = oppCarW * 0.58;

        const modelId = opponentCarModels[idx % opponentCarModels.length];
        const oppSprite = state.carSprites[modelId] || getCachedSprite(modelId);

        ctx.save();
        ctx.translate(oppX, oppY);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 2, oppCarW * 0.52, 6 * carScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Opponent Car
        if (oppSprite) {
          ctx.drawImage(oppSprite, -oppCarW / 2, -oppCarH, oppCarW, oppCarH);
        } else {
          // Fallback colored vehicle chassis
          ctx.fillStyle = opp.color || '#ef4444';
          ctx.fillRect(-oppCarW / 2, -oppCarH, oppCarW, oppCarH);
        }

        // Opponent Overhead Identity Tag (👑 Alex / Sophia)
        const tagY = -oppCarH - 14 * carScale - 8;
        const name = opp.name || opp.username || `Racer ${idx + 1}`;
        const isLeader = opp.rank === 1 || idx === 0;

        ctx.font = `bold ${Math.max(10, Math.floor(13 * carScale))}px system-ui, sans-serif`;
        const textW = ctx.measureText(name).width;

        // Tag capsule
        ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
        ctx.strokeStyle = isLeader ? 'rgba(250, 204, 21, 0.9)' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-textW / 2 - 12, tagY - 14, textW + 24, 18, 9);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isLeader ? '#fde047' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${isLeader ? '👑 ' : ''}${name}`, 0, tagY);

        // Indicator arrow
        ctx.fillStyle = isLeader ? '#fde047' : 'rgba(56, 189, 248, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-4, tagY + 4);
        ctx.lineTo(4, tagY + 4);
        ctx.lineTo(0, tagY + 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // ========================================================
      // 5. HERO PLAYER SUPERCAR (HIGH-RESOLUTION ARTWORK)
      // ========================================================
      const playerX = vanishX;
      const playerY = H * 0.93 + state.squatY;
      const pCarW = Math.min(W * 0.44, 340);
      const pCarH = pCarW * 0.58;

      const playerCarId = props.playerCar?.id || 'shadow_v12';
      const playerSprite = state.carSprites[playerCarId] || getCachedSprite(playerCarId);

      ctx.save();
      ctx.translate(playerX, playerY);

      // Realistic Tire Road Contact Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.ellipse(0, 8, pCarW * 0.54, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neon Underglow Aura
      const underglowRadius = pCarW * 0.65;
      const underglow = ctx.createRadialGradient(0, 8, pCarW * 0.1, 0, 8, underglowRadius);
      underglow.addColorStop(0, `${playerColor}ee`);
      underglow.addColorStop(0.5, `${playerColor}55`);
      underglow.addColorStop(1, 'transparent');
      ctx.fillStyle = underglow;
      ctx.beginPath();
      ctx.ellipse(0, 8, pCarW * 0.62, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated Exhaust Flames & Turbo Burners
      if (props.isNitroActive || state.speedLerp > 90) {
        const intensity = props.isNitroActive ? 2.0 : (state.speedLerp - 90) / 45;
        const flameLen = (35 + Math.random() * 30) * intensity;
        const flameColor = props.isNitroActive ? '#06b6d4' : '#f43f5e';

        [-pCarW * 0.18, pCarW * 0.18].forEach((pipeX) => {
          ctx.save();
          ctx.shadowColor = flameColor;
          ctx.shadowBlur = 25;

          const flameGrad = ctx.createLinearGradient(pipeX, -10, pipeX, flameLen);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, flameColor);
          flameGrad.addColorStop(0.8, `${flameColor}44`);
          flameGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = flameGrad;

          ctx.beginPath();
          ctx.moveTo(pipeX - 12, -10);
          ctx.lineTo(pipeX + 12, -10);
          ctx.lineTo(pipeX, flameLen);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // Draw The Genuine Supercar Render
      if (playerSprite) {
        ctx.drawImage(playerSprite, -pCarW / 2, -pCarH, pCarW, pCarH);
      }

      // Subtle OLED Taillight Bloom Glow Overlay
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 22;
      ctx.strokeStyle = 'rgba(255, 30, 86, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-pCarW * 0.38, -pCarH * 0.42);
      ctx.bezierCurveTo(-pCarW * 0.15, -pCarH * 0.46, pCarW * 0.15, -pCarH * 0.46, pCarW * 0.38, -pCarH * 0.42);
      ctx.stroke();
      ctx.restore();

      // High-Contrast Custom License Plate Badge (NASIR)
      const plateW = pCarW * 0.31;
      const plateH = 20;
      const plateY = -pCarH * 0.27;
      ctx.fillStyle = '#05070e';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-plateW / 2, plateY, plateW, plateH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cleanPlate = (props.licensePlate || 'NASIR').toUpperCase().slice(0, 8);
      ctx.fillText(cleanPlate, 0, plateY + plateH / 2 + 1);

      // Player identity marker (👤 YOU ▼)
      const pTagY = -pCarH - 24;
      ctx.font = 'bold 12px system-ui, sans-serif';
      const pTextW = ctx.measureText('YOU').width;

      ctx.fillStyle = 'rgba(147, 51, 234, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-pTextW / 2 - 12, pTagY - 14, pTextW + 24, 18, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', 0, pTagY);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, pTagY + 4);
      ctx.lineTo(4, pTagY + 4);
      ctx.lineTo(0, pTagY + 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // ========================================================
      // 6. SPEED WARP LINES & NITRO DISTORTION
      // ========================================================
      if (props.isNitroActive || state.speedLerp > 125) {
        const streakCount = props.isNitroActive ? 26 : 10;
        const streakColor = props.isNitroActive ? 'rgba(6, 182, 212, 0.85)' : 'rgba(255, 255, 255, 0.45)';

        for (let s = 0; s < streakCount; s++) {
          const angle = Math.random() * Math.PI * 2;
          const dist1 = 140 + Math.random() * (W * 0.45);
          const dist2 = dist1 + 60 + Math.random() * 110;
          const sx1 = vanishX + Math.cos(angle) * dist1;
          const sy1 = vanishY + Math.sin(angle) * (dist1 * 0.58);
          const sx2 = vanishX + Math.cos(angle) * dist2;
          const sy2 = vanishY + Math.sin(angle) * (dist2 * 0.58);

          ctx.strokeStyle = streakColor;
          ctx.lineWidth = Math.random() * 2.5 + 1;
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};

export default RacingTrackCanvas;
