import React, { useRef, useEffect } from 'react';

/**
 * 2.5D Hardware-Accelerated Canvas Highway Engine
 * Matches the cyberpunk night highway aesthetic in reference Image 1 & Image 2.
 * Renders city skyline, neon reflections, perspective road, player supercar with custom plate,
 * opponent cars with overhead nameplates, and dynamic speed/nitro warp lines.
 */
export const RacingTrackCanvas = ({
  playerProgress = 0, // 0 to 100
  playerSpeedKmH = 0, // 0 to 220+
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
    nitroParticles: [],
    streakLines: [],
    frame: 0,
  });

  // Keep stateRef updated with incoming props without re-binding loops
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

    // Main animation loop
    const render = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const state = stateRef.current;
      const props = propsRef.current;
      state.frame++;

      const targetSpeed = Math.max(20, props.playerSpeedKmH);
      state.speedLerp += (targetSpeed - state.speedLerp) * 0.12;

      // Road scroll step
      const moveMultiplier = (state.speedLerp / 80) * (props.isNitroActive ? 1.8 : 1);
      state.roadOffset = (state.roadOffset + moveMultiplier * dt * 420) % 1000;

      // Camera vibration at high speeds
      const targetShake = state.speedLerp > 130 ? (state.speedLerp - 130) * 0.035 : 0;
      state.shake += (targetShake - state.shake) * 0.2;
      const shakeX = (Math.random() - 0.5) * state.shake * 3;
      const shakeY = (Math.random() - 0.5) * state.shake * 3;

      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // --- 1. DUSK & NIGHT SKY GRADIENT ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      skyGrad.addColorStop(0, '#040714');
      skyGrad.addColorStop(0.35, '#0b142d');
      skyGrad.addColorStop(0.7, '#24143a');
      skyGrad.addColorStop(1, '#441c48');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const starSeed = [0.12, 0.28, 0.45, 0.68, 0.82, 0.93, 0.35, 0.55, 0.77];
      starSeed.forEach((sx, i) => {
        ctx.fillRect(W * sx, H * (0.05 + (i % 4) * 0.05), 1.5, 1.5);
      });

      // --- 2. MOUNTAINS / COASTLINE SILHOUETTE ---
      const horizonY = H * 0.44;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(0, horizonY - H * 0.08);
      ctx.bezierCurveTo(W * 0.15, horizonY - H * 0.22, W * 0.3, horizonY - H * 0.06, W * 0.45, horizonY - H * 0.14);
      ctx.bezierCurveTo(W * 0.6, horizonY - H * 0.04, W * 0.8, horizonY - H * 0.18, W, horizonY - H * 0.05);
      ctx.lineTo(W, horizonY);
      ctx.closePath();
      const mountainGrad = ctx.createLinearGradient(0, horizonY - H * 0.2, 0, horizonY);
      mountainGrad.addColorStop(0, '#0e0b1d');
      mountainGrad.addColorStop(1, '#1b122c');
      ctx.fillStyle = mountainGrad;
      ctx.fill();

      // --- 3. CYBERPUNK CITY SKYLINE (Image 1 & 2) ---
      // Distant glowing skyscrapers
      const buildings = [
        { x: 0.02, w: 0.045, h: 0.28, color: '#09152b', light: '#38bdf8' },
        { x: 0.08, w: 0.035, h: 0.34, color: '#0f1738', light: '#818cf8' },
        { x: 0.13, w: 0.055, h: 0.22, color: '#131233', light: '#c084fc' },
        { x: 0.22, w: 0.04, h: 0.26, color: '#0c1b33', light: '#38bdf8' },
        { x: 0.38, w: 0.06, h: 0.38, color: '#160d2e', light: '#e879f9' },
        { x: 0.46, w: 0.045, h: 0.42, color: '#11183c', light: '#60a5fa' }, // Tall spire
        { x: 0.52, w: 0.05, h: 0.33, color: '#1a1038', light: '#f472b6' },
        { x: 0.62, w: 0.04, h: 0.36, color: '#0c1834', light: '#38bdf8' },
        { x: 0.72, w: 0.065, h: 0.29, color: '#170e30', light: '#a855f7' },
        { x: 0.82, w: 0.05, h: 0.35, color: '#0f1738', light: '#38bdf8' },
        { x: 0.9, w: 0.07, h: 0.25, color: '#0a1024', light: '#818cf8' },
      ];

      buildings.forEach((b) => {
        const bx = W * b.x;
        const bw = W * b.w;
        const bh = H * b.h;
        const by = horizonY - bh;

        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, bw, bh);

        // Tower spire / rooftop beacon
        ctx.fillStyle = b.light;
        ctx.fillRect(bx + bw * 0.45, by - 12, bw * 0.1, 12);
        ctx.beginPath();
        ctx.arc(bx + bw * 0.5, by - 13, 2, 0, Math.PI * 2);
        ctx.fill();

        // Building window grid
        ctx.fillStyle = b.light;
        ctx.globalAlpha = 0.45;
        const cols = 3;
        const rows = 12;
        for (let r = 0; r < rows; r++) {
          if ((r + Math.floor(b.x * 20)) % 3 === 0) continue; // Random unlit floors
          for (let c = 0; c < cols; c++) {
            ctx.fillRect(bx + 4 + c * (bw / 3.5), by + 10 + r * (bh / rows), Math.max(1.5, bw * 0.12), Math.max(2, bh * 0.035));
          }
        }
        ctx.globalAlpha = 1.0;
      });

      // Ferris Wheel (from Reference Image 1 & 2)
      const fwX = W * 0.58;
      const fwY = horizonY - H * 0.14;
      const fwR = H * 0.085;
      ctx.strokeStyle = 'rgba(232, 121, 249, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(fwX, fwY, fwR * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      // Rotating spokes
      const spokeAngle = (state.frame * 0.005) % (Math.PI * 2);
      for (let s = 0; s < 8; s++) {
        const a = spokeAngle + (s * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(fwX, fwY);
        ctx.lineTo(fwX + Math.cos(a) * fwR, fwY + Math.sin(a) * fwR);
        ctx.stroke();
      }

      // Distant suspension bridge / waterfront lights
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.65, horizonY - 10);
      ctx.bezierCurveTo(W * 0.8, horizonY - 35, W * 0.9, horizonY - 20, W, horizonY - 5);
      ctx.stroke();

      // Waterfront neon water glow / shoreline reflection
      const waterGrad = ctx.createLinearGradient(0, horizonY - 15, 0, horizonY);
      waterGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      waterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, horizonY - 15, W, 15);

      // --- 4. PERSPECTIVE ROAD (HIGHWAY) ---
      const vanishX = W * 0.5;
      const vanishY = horizonY;
      const roadTopWidth = W * 0.18;
      const roadBottomWidth = W * 0.94;
      const roadTopLeft = vanishX - roadTopWidth / 2;
      const roadTopRight = vanishX + roadTopWidth / 2;
      const roadBottomLeft = vanishX - roadBottomWidth / 2;
      const roadBottomRight = vanishX + roadBottomWidth / 2;

      // Asphalt base
      const roadGrad = ctx.createLinearGradient(0, vanishY, 0, H);
      roadGrad.addColorStop(0, '#0d1326');
      roadGrad.addColorStop(0.4, '#090d1a');
      roadGrad.addColorStop(1, '#05070e');
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, vanishY);
      ctx.lineTo(roadTopRight, vanishY);
      ctx.lineTo(roadBottomRight, H);
      ctx.lineTo(roadBottomLeft, H);
      ctx.closePath();
      ctx.fill();

      // Highway barriers with glowing safety reflectors (Image 1 red/cyan chevron arrows)
      // Left barrier
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, vanishY);
      ctx.lineTo(roadBottomLeft, H);
      ctx.stroke();

      // Right barrier
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(roadTopRight, vanishY);
      ctx.lineTo(roadBottomRight, H);
      ctx.stroke();

      // Red Chevron signs on right barrier (Reference Image 1: '>>>')
      const chevronCount = 4;
      for (let c = 0; c < chevronCount; c++) {
        const t = ((c * 0.25 + (state.roadOffset % 250) / 1000) % 1);
        if (t < 0.05 || t > 0.95) continue;
        const cy = vanishY + (H - vanishY) * Math.pow(t, 1.8);
        const cx = vanishX + (roadTopRight - vanishX + (roadBottomRight - roadTopRight) * Math.pow(t, 1.8)) + 15 * t;
        const cSize = 6 + 18 * t;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - cSize / 2);
        ctx.lineTo(cx + cSize * 0.6, cy);
        ctx.lineTo(cx, cy + cSize / 2);
        ctx.lineTo(cx - cSize * 0.2, cy + cSize / 2);
        ctx.lineTo(cx + cSize * 0.35, cy);
        ctx.lineTo(cx - cSize * 0.2, cy - cSize / 2);
        ctx.closePath();
        ctx.fill();
      }

      // --- 5. ANIMATED PERSPECTIVE LANE MARKERS ---
      // 4 highway lanes = 3 divider lines (-0.25, 0, +0.25 offset from center)
      const laneOffsets = [-0.25, 0, 0.25];
      const segments = 16;

      laneOffsets.forEach((laneRatio) => {
        for (let i = 0; i < segments; i++) {
          const t1 = ((i / segments + state.roadOffset / 500) % 1);
          const t2 = t1 + 0.035;
          if (t2 > 1 || t1 < 0.02) continue;

          // Non-linear projection for realistic road depth
          const depth1 = Math.pow(t1, 2.2);
          const depth2 = Math.pow(Math.min(1, t2), 2.2);

          const y1 = vanishY + (H - vanishY) * depth1;
          const y2 = vanishY + (H - vanishY) * depth2;

          const currentRoadWidth1 = roadTopWidth + (roadBottomWidth - roadTopWidth) * depth1;
          const currentRoadWidth2 = roadTopWidth + (roadBottomWidth - roadTopWidth) * depth2;

          const x1 = vanishX + laneRatio * currentRoadWidth1;
          const x2 = vanishX + laneRatio * currentRoadWidth2;

          const lineWidth = Math.max(1, 4 * depth2);

          ctx.strokeStyle = laneRatio === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });

      // Neon road ground light trails (Wet road light reflections)
      const playerColor = props.playerCar?.color || '#a855f7';
      const groundGlow = ctx.createRadialGradient(vanishX, H * 0.88, 20, vanishX, H * 0.88, W * 0.3);
      groundGlow.addColorStop(0, `${playerColor}44`);
      groundGlow.addColorStop(0.6, `${playerColor}15`);
      groundGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = groundGlow;
      ctx.fillRect(vanishX - W * 0.35, H * 0.65, W * 0.7, H * 0.35);

      // --- 6. OPPONENT CARS IN PERSPECTIVE (Image 1) ---
      // Opponents positioned according to their race progress vs player
      const opponentLanes = [-0.28, 0.28, -0.15, 0.15, 0];
      const sortedOpponents = (props.opponents || []).slice(0, 5);

      sortedOpponents.forEach((opp, idx) => {
        // Distance offset from player: positive = ahead, negative = behind
        const progressDiff = (opp.progress || 0) - props.playerProgress;
        // Clamp relative perspective depth: ahead is depth 0.2 to 0.75
        let oppDepth = 0.5 + progressDiff * 0.015;
        oppDepth = Math.max(0.12, Math.min(0.72, oppDepth));

        const nonLinearDepth = Math.pow(oppDepth, 2.0);
        const oppY = vanishY + (H - vanishY) * nonLinearDepth;
        const currentRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * nonLinearDepth;
        const laneRatio = opponentLanes[idx % opponentLanes.length];
        const oppX = vanishX + laneRatio * currentRoadW;

        const carScale = Math.max(0.2, nonLinearDepth * 0.8);
        const oppCarW = Math.max(22, 140 * carScale);
        const oppCarH = Math.max(14, 80 * carScale);

        // Draw opponent car
        ctx.save();
        ctx.translate(oppX, oppY);

        // Glow
        const oppColor = opp.color || (idx === 0 ? '#ef4444' : idx === 1 ? '#22c55e' : '#3b82f6');
        ctx.shadowColor = oppColor;
        ctx.shadowBlur = 8 * carScale;

        // Opponent body
        ctx.fillStyle = oppColor;
        ctx.beginPath();
        ctx.roundRect(-oppCarW / 2, -oppCarH, oppCarW, oppCarH, 4 * carScale);
        ctx.fill();

        // Opponent windshield / roof
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-oppCarW * 0.35, -oppCarH * 0.95, oppCarW * 0.7, oppCarH * 0.45, 3 * carScale);
        ctx.fill();

        // Opponent glowing taillights
        ctx.fillStyle = '#ff1e56';
        ctx.shadowColor = '#ff1e56';
        ctx.shadowBlur = 10 * carScale;
        ctx.fillRect(-oppCarW * 0.45, -oppCarH * 0.35, oppCarW * 0.28, oppCarH * 0.2);
        ctx.fillRect(oppCarW * 0.17, -oppCarH * 0.35, oppCarW * 0.28, oppCarH * 0.2);

        // Opponent overhead identification badge (Reference Image 1: 👑 Alex / Sophia)
        ctx.shadowBlur = 0;
        const badgeY = -oppCarH - 12 * carScale - 8;
        const name = opp.name || opp.username || `Racer ${idx + 1}`;
        const isLeader = opp.rank === 1 || idx === 0;

        ctx.font = `bold ${Math.max(10, Math.floor(13 * carScale))}px system-ui, sans-serif`;
        const textW = ctx.measureText(name).width;

        // Badge pill
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = isLeader ? 'rgba(250, 204, 21, 0.8)' : 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-textW / 2 - 10, badgeY - 14, textW + 20, 18, 9);
        ctx.fill();
        ctx.stroke();

        // Badge text + crown
        ctx.fillStyle = isLeader ? '#fde047' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${isLeader ? '👑 ' : ''}${name}`, 0, badgeY);

        // Pointer triangle
        ctx.fillStyle = isLeader ? '#fde047' : 'rgba(56, 189, 248, 0.8)';
        ctx.beginPath();
        ctx.moveTo(-4, badgeY + 4);
        ctx.lineTo(4, badgeY + 4);
        ctx.lineTo(0, badgeY + 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // --- 7. PLAYER SUPERCAR (FOREGROUND CENTER) ---
      // Matches the hypercar in Reference Image 1 (Shadow V12 purple with NASIR license plate)
      const playerX = vanishX;
      const playerY = H * 0.92;
      const pCarW = Math.min(W * 0.42, 310);
      const pCarH = pCarW * 0.58;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Nitro exhaust flame animation
      if (props.isNitroActive || state.speedLerp > 110) {
        const flameIntensity = props.isNitroActive ? 1.6 : 0.8;
        const flameLength = (40 + Math.random() * 25) * flameIntensity;
        const flameColor = props.isNitroActive ? '#06b6d4' : '#e879f9';

        [-pCarW * 0.18, pCarW * 0.18].forEach((pipeX) => {
          ctx.save();
          ctx.shadowColor = flameColor;
          ctx.shadowBlur = 20;

          const flameGrad = ctx.createLinearGradient(pipeX, 0, pipeX, flameLength);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, flameColor);
          flameGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = flameGrad;

          ctx.beginPath();
          ctx.moveTo(pipeX - 10, 0);
          ctx.lineTo(pipeX + 10, 0);
          ctx.lineTo(pipeX, flameLength);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // Ground underglow reflection
      const underglowGrad = ctx.createRadialGradient(0, 0, pCarW * 0.1, 0, 0, pCarW * 0.7);
      underglowGrad.addColorStop(0, `${playerColor}bb`);
      underglowGrad.addColorStop(0.6, `${playerColor}44`);
      underglowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = underglowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 10, pCarW * 0.65, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tire shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 4, pCarW * 0.55, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rear tires
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-pCarW * 0.48, -pCarH * 0.35, pCarW * 0.14, pCarH * 0.38);
      ctx.fillRect(pCarW * 0.34, -pCarH * 0.35, pCarW * 0.14, pCarH * 0.38);

      // Carbon Wing Spoiler
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-pCarW * 0.46, -pCarH * 0.98, pCarW * 0.92, 10);
      // Spoiler upright struts
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-pCarW * 0.28, -pCarH * 0.98, 8, pCarH * 0.3);
      ctx.fillRect(pCarW * 0.28 - 8, -pCarH * 0.98, 8, pCarH * 0.3);

      // Aerodynamic Rear Bodywork
      const carBodyGrad = ctx.createLinearGradient(0, -pCarH * 0.9, 0, 0);
      carBodyGrad.addColorStop(0, '#110b24');
      carBodyGrad.addColorStop(0.3, playerColor);
      carBodyGrad.addColorStop(0.7, '#240b3c');
      carBodyGrad.addColorStop(1, '#0b0617');
      ctx.fillStyle = carBodyGrad;

      ctx.beginPath();
      ctx.moveTo(-pCarW * 0.44, 0);
      ctx.lineTo(-pCarW * 0.46, -pCarH * 0.4);
      ctx.bezierCurveTo(-pCarW * 0.44, -pCarH * 0.75, -pCarW * 0.35, -pCarH * 0.85, -pCarW * 0.28, -pCarH * 0.88);
      ctx.lineTo(pCarW * 0.28, -pCarH * 0.88);
      ctx.bezierCurveTo(pCarW * 0.35, -pCarH * 0.85, pCarW * 0.44, -pCarH * 0.75, pCarW * 0.46, -pCarH * 0.4);
      ctx.lineTo(pCarW * 0.44, 0);
      ctx.closePath();
      ctx.fill();

      // Rear Glass Canopy / Cockpit
      const canopyGrad = ctx.createLinearGradient(0, -pCarH * 0.88, 0, -pCarH * 0.45);
      canopyGrad.addColorStop(0, '#090d1a');
      canopyGrad.addColorStop(0.6, '#18223d');
      canopyGrad.addColorStop(1, '#05070f');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.moveTo(-pCarW * 0.24, -pCarH * 0.84);
      ctx.lineTo(pCarW * 0.24, -pCarH * 0.84);
      ctx.lineTo(pCarW * 0.3, -pCarH * 0.46);
      ctx.lineTo(-pCarW * 0.3, -pCarH * 0.46);
      ctx.closePath();
      ctx.fill();

      // OLED Continuous Taillight Bar (Image 1 signature horizontal glowing blade)
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#ff1e56';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-pCarW * 0.41, -pCarH * 0.42);
      ctx.bezierCurveTo(-pCarW * 0.2, -pCarH * 0.48, pCarW * 0.2, -pCarH * 0.48, pCarW * 0.41, -pCarH * 0.42);
      ctx.stroke();

      // Taillight core white neon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // Carbon Diffuser & Quad Exhaust Fins
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-pCarW * 0.36, -pCarH * 0.22, pCarW * 0.72, pCarH * 0.22);

      // License Plate (Image 1: 'NASIR')
      ctx.fillStyle = '#05070e';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      const plateW = pCarW * 0.32;
      const plateH = 20;
      const plateY = -pCarH * 0.28;
      ctx.beginPath();
      ctx.roundRect(-plateW / 2, plateY, plateW, plateH, 3);
      ctx.fill();
      ctx.stroke();

      // License plate embossed lettering
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cleanPlate = (props.licensePlate || 'NASIR').toUpperCase().slice(0, 8);
      ctx.fillText(cleanPlate, 0, plateY + plateH / 2 + 1);

      ctx.restore();

      // --- 8. SPEED WARP STREAKS & NITRO PARTICLES ---
      if (props.isNitroActive || state.speedLerp > 120) {
        const streakCount = props.isNitroActive ? 22 : 8;
        const streakColor = props.isNitroActive ? 'rgba(6, 182, 212, 0.75)' : 'rgba(255, 255, 255, 0.4)';

        for (let s = 0; s < streakCount; s++) {
          const angle = Math.random() * Math.PI * 2;
          const dist1 = 120 + Math.random() * (W * 0.4);
          const dist2 = dist1 + 50 + Math.random() * 90;
          const sx1 = vanishX + Math.cos(angle) * dist1;
          const sy1 = vanishY + Math.sin(angle) * (dist1 * 0.6);
          const sx2 = vanishX + Math.cos(angle) * dist2;
          const sy2 = vanishY + Math.sin(angle) * (dist2 * 0.6);

          ctx.strokeStyle = streakColor;
          ctx.lineWidth = Math.random() * 2 + 1;
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
