import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Trophy,
  Star,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Crown,
  MapPin,
  Check,
} from 'lucide-react';
import { CAR_CATALOG } from '../../../utils/racingStorage';
import racingAudio from '../../../utils/racingAudio';

/**
 * Racing HUD matching Reference Image 1:
 * - Top header with TYPE RACE logo, Stars, Rank, and Settings
 * - Top-center futuristic typing console with text progress
 * - Top-right Neon Coast minimap with live racer dots & round indicator
 * - Left vertical race standings (1 to 6) with car icons
 * - Mid-left track radar circle
 * - Bottom-left "Change Your Car" carousel drawer
 * - Bottom-right circular glowing Speedometer (KM/H + Gear + Nitro)
 * - Bottom center status banner: "Keep typing. Keep moving. 🚀"
 */
export const RacingHUD = ({
  textPrompt = '',
  typedText = '',
  currentLetterCount = 0,
  totalLetters = 200,
  wpm = 0,
  speedKmH = 0,
  accuracy = 100,
  gear = 4,
  nitroPercent = 85,
  isNitroActive = false,
  onActivateNitro = () => {},
  selectedCar = null,
  onSelectCar = () => {},
  racers = [],
  userRank = 2,
  stars = 3420,
  trackName = 'Neon Coast',
  round = '1/3',
  onBack = () => {},
}) => {
  const [isMuted, setIsMuted] = useState(() => racingAudio.getMuted());
  const [carCarouselIndex, setCarCarouselIndex] = useState(0);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    racingAudio.setMuted(next);
  };

  const handlePrevCar = () => {
    setCarCarouselIndex((prev) => (prev > 0 ? prev - 1 : CAR_CATALOG.length - 1));
  };

  const handleNextCar = () => {
    setCarCarouselIndex((prev) => (prev < CAR_CATALOG.length - 1 ? prev + 1 : 0));
  };

  // Speedometer needle angle calculation (from -120deg to +120deg)
  const clampedSpeed = Math.min(220, Math.max(0, speedKmH));
  const needleAngle = -120 + (clampedSpeed / 220) * 240;

  // Split text for high-precision typing rendering
  const typedLength = typedText.length;
  const currentTargetChar = textPrompt[typedLength] || '';
  const remainingText = textPrompt.slice(typedLength + 1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* ========================================================
          1. TOP NAVIGATION / STATUS BAR (Image 1)
      ======================================================== */}
      <div className="w-full flex items-center justify-between pointer-events-auto z-20">
        {/* Left: Back Arrow & TYPE RACE Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg active:scale-95"
            title="Exit Race"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black italic tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                TYPE<span className="text-white">RACE</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Type. Drive. Win.
            </span>
          </div>
        </div>

        {/* Right Badges: Stars, Trophy Rank, Sound & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Currency */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span>{stars.toLocaleString()}</span>
          </div>

          {/* Trophy Rank */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md text-cyan-300 text-xs sm:text-sm font-bold shadow-md shadow-cyan-950/20">
            <Trophy size={14} className="fill-cyan-400 text-cyan-400" />
            <span>#{userRank}</span>
          </div>

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Settings button */}
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. TOP-CENTER TYPING HUD CONSOLE & MINIMAP (Image 1)
      ======================================================== */}
      <div className="w-full flex items-start justify-between gap-4 pointer-events-auto z-10 mt-1">
        {/* Left Standings HUD (Described in section 3 below) - Placeholders for flex balance */}
        <div className="hidden lg:block w-48 xl:w-56" />

        {/* Center: The Futuristic Cockpit Typing Box */}
        <div className="flex-1 max-w-2xl mx-auto flex flex-col items-center">
          <div className="text-center mb-1">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 drop-shadow">
              Type the next {totalLetters} letters to move your car
            </span>
          </div>

          {/* Glassmorphic Cockpit Bracket */}
          <div className="relative w-full px-5 py-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.18)]">
            {/* Cyber Corner Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            {/* Live Typing Text Stream with high-visibility letter styling */}
            <div className="font-mono text-sm sm:text-base md:text-lg tracking-wider leading-relaxed break-all select-none">
              {/* Correctly typed portion */}
              <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                {typedText}
              </span>

              {/* Current Active Character Cursor */}
              {currentTargetChar && (
                <span className="relative inline-block text-white font-extrabold bg-cyan-500/30 px-0.5 rounded border-b-2 border-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]">
                  {currentTargetChar === ' ' ? '␣' : currentTargetChar}
                </span>
              )}

              {/* Remaining prompt text */}
              <span className="text-slate-400/80 font-normal">
                {remainingText.slice(0, 75)}
                {remainingText.length > 75 ? '...' : ''}
              </span>
            </div>

            {/* Glowing Dual Progress Bar + Counter */}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-400 font-mono">
              <div className="flex-1 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                  style={{ width: `${Math.min(100, (currentLetterCount / totalLetters) * 100)}%` }}
                />
              </div>
              <span className="text-cyan-300 drop-shadow">
                {currentLetterCount} / {totalLetters}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Round & Track Minimap Card (Image 1 Top-Right) */}
        <div className="w-36 sm:w-44 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg flex flex-col items-end">
          <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-300 mb-1">
            <span>Round</span>
            <span className="text-white font-mono">{round}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium mb-2">
            <MapPin size={11} />
            <span>{trackName}</span>
          </div>

          {/* Minimap Loop Canvas/SVG with Moving Racer Blips */}
          <div className="relative w-28 sm:w-32 h-16 border border-slate-800/60 rounded-xl bg-slate-900/60 flex items-center justify-center p-1 overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full stroke-slate-600 fill-none stroke-[2.5]">
              {/* Circuit loop path */}
              <path
                d="M 15 25 C 15 10, 35 10, 45 15 C 55 20, 75 10, 85 20 C 92 30, 85 42, 65 42 C 45 42, 35 30, 25 35 C 18 38, 15 35, 15 25 Z"
                className="stroke-slate-700/80"
              />
              {/* Start/finish hash */}
              <line x1="15" y1="20" x2="15" y2="30" stroke="#ef4444" strokeWidth="2" />

              {/* Racer blips placed along the minimap */}
              {racers.map((racer, idx) => {
                const normProg = ((racer.progress || 0) / 100) % 1;
                // Parametric approximation of loop
                const angle = normProg * Math.PI * 2;
                const bx = 50 + Math.cos(angle) * 32 + (idx % 2 ? 3 : -3);
                const by = 25 + Math.sin(angle) * 14;
                const isUser = racer.isUser || racer.username === 'You' || idx === userRank - 1;

                return (
                  <circle
                    key={idx}
                    cx={Math.max(10, Math.min(90, bx))}
                    cy={Math.max(10, Math.min(40, by))}
                    r={isUser ? 3.5 : 2.5}
                    fill={isUser ? '#a855f7' : racer.color || '#38bdf8'}
                    stroke={isUser ? '#ffffff' : '#000000'}
                    strokeWidth="1"
                    className={isUser ? 'animate-pulse' : ''}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. LEFT COLUMN: STANDINGS & RADAR (Image 1)
      ======================================================== */}
      <div className="flex items-center justify-between w-full pointer-events-none my-auto">
        <div className="flex flex-col gap-4 pointer-events-auto">
          {/* Standings List (Places 1 to 6) */}
          <div className="w-44 sm:w-52 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col gap-1">
            {racers.map((racer, idx) => {
              const place = idx + 1;
              const isUser = racer.isUser || racer.username === 'You' || place === userRank;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-900/60 to-purple-600/40 border border-purple-500/50 shadow-md shadow-purple-950/40'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black ${
                        place === 1
                          ? 'text-amber-400'
                          : place === 2
                          ? 'text-purple-300'
                          : place === 3
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {place === 1 ? '👑 ' : ''}
                      {place}
                    </span>

                    <span
                      className={`text-xs font-bold truncate max-w-[85px] ${
                        isUser ? 'text-white drop-shadow' : 'text-slate-300'
                      }`}
                    >
                      {isUser ? 'You' : racer.name || racer.username}
                    </span>
                  </div>

                  {/* Real Car Miniature Artwork */}
                  {racer.image ? (
                    <img
                      src={racer.image}
                      alt="Car"
                      className="w-7 h-4 object-cover rounded border border-white/20 shadow-sm"
                      title={racer.carName || 'Supercar'}
                    />
                  ) : (
                    <div
                      className="w-6 h-3 rounded-sm border border-black/40 shadow-sm"
                      style={{ backgroundColor: racer.color || '#3b82f6' }}
                      title={racer.carName || 'Supercar'}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Track Radar Compass (Image 1 mid-left) */}
          <div className="w-20 h-20 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md relative flex items-center justify-center shadow-lg">
            {/* North marker */}
            <span className="absolute top-1 text-[9px] font-bold text-cyan-400">N</span>
            <span className="absolute bottom-1 text-[9px] font-bold text-slate-500">S</span>

            {/* Rotating radar sweep */}
            <div className="w-16 h-16 rounded-full border border-dashed border-slate-700/60 relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM ROW: CAR DRAWER + PROMPT + SPEEDOMETER (Image 1)
      ======================================================== */}
      <div className="w-full flex flex-col md:flex-row items-end justify-between gap-3 pointer-events-auto z-20">
        {/* Bottom-Left: "Change Your Car" Drawer & Carousel */}
        <div className="w-full sm:w-auto p-3 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
            <span>Change Your Car</span>
          </div>

          {/* Carousel thumbnails */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevCar}
              className="w-7 h-12 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 overflow-hidden py-1">
              {CAR_CATALOG.slice(carCarouselIndex, carCarouselIndex + 4).map((car) => {
                const isSelected = selectedCar?.id === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => {
                      onSelectCar(car);
                      racingAudio.playKey(true);
                    }}
                    className={`relative w-14 h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Real Car Miniature Artwork */}
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-12 h-7 object-cover rounded-md shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-8 h-4 rounded-md border border-white/20 shadow-sm"
                        style={{ backgroundColor: car.color }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextCar}
              className="w-7 h-12 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Active Car info footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
            <span className="font-bold text-white tracking-wide">
              {selectedCar?.name || 'Shadow V12'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
              {selectedCar?.tier || 'Legendary'}
            </span>
          </div>
        </div>

        {/* Bottom Center: Encouraging Race Motivational Bar (Image 1) */}
        <div className="w-full md:w-auto flex flex-col items-center justify-center text-center my-auto pb-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 drop-shadow">
            <span>Keep typing. Keep moving.</span>
            <span>🚀</span>
          </div>
          {/* Subtle neon progress pill */}
          <div className="w-48 sm:w-64 h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-purple-500 transition-all duration-200"
              style={{ width: `${Math.min(100, (currentLetterCount / totalLetters) * 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom-Right: Neon Circular Speedometer Dial (Image 1: 143 KM/H, Gear 4) */}
        <div className="flex items-center gap-3">
          {/* Nitro Activation Button */}
          <button
            onClick={() => {
              if (nitroPercent >= 50 && !isNitroActive) {
                onActivateNitro();
                racingAudio.playNitro();
              }
            }}
            disabled={nitroPercent < 50 || isNitroActive}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all ${
              isNitroActive
                ? 'bg-cyan-500 text-white border-cyan-300 shadow-[0_0_20px_#06b6d4] animate-pulse'
                : nitroPercent >= 50
                ? 'bg-slate-900/90 text-cyan-400 border-cyan-500/50 hover:bg-cyan-950/60 shadow-lg active:scale-95'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Press SPACE or Click for Nitro!"
          >
            <Zap size={20} className={nitroPercent >= 50 ? 'fill-cyan-400' : ''} />
            <span className="text-[10px] font-black tracking-wider uppercase mt-0.5">
              {isNitroActive ? 'BOOST' : 'NITRO'}
            </span>
          </button>

          {/* Speedometer Gauge */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-slate-950/90 border-2 border-cyan-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center p-2">
            {/* Outer Circular Speed Arc SVG */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(30, 41, 59, 0.8)"
                strokeWidth="6"
                fill="none"
              />
              {/* Active illuminated speed ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#speedoGrad)"
                strokeWidth="6"
                fill="none"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.min(220, clampedSpeed)) / 220}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
              <defs>
                <linearGradient id="speedoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="70%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Needle line */}
            <div
              className="absolute w-0.5 h-14 bg-gradient-to-t from-transparent to-cyan-300 origin-bottom transition-transform duration-100 shadow-[0_0_8px_#38bdf8]"
              style={{
                bottom: '50%',
                transform: `rotate(${needleAngle}deg)`,
              }}
            />

            {/* Digital Speed Value */}
            <div className="flex flex-col items-center z-10">
              <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] font-mono">
                {Math.round(clampedSpeed)}
              </span>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase -mt-1">
                KM/H
              </span>

              {/* Digital Gear Box (Image 1: '4') */}
              <div className="mt-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xs font-black text-purple-300 shadow-inner">
                {gear}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RacingHUD;
