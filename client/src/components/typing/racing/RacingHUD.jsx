import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Users,
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
  onOpenInvite = () => {},
}) => {
  const [isMuted, setIsMuted] = useState(() => racingAudio.getMuted());
  const [carCarouselIndex, setCarCarouselIndex] = useState(0);

  const cockpitRef = useRef(null);
  const activeCharRef = useRef(null);

  // Split text for high-precision typing rendering
  const typedLength = typedText.length;

  // Auto-scroll cockpit console to keep the active typing line comfortably centered
  useEffect(() => {
    if (activeCharRef.current && cockpitRef.current) {
      const container = cockpitRef.current;
      const charEl = activeCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const charRect = charEl.getBoundingClientRect();

      if (charRect.bottom > containerRect.bottom - 12 || charRect.top < containerRect.top + 8) {
        charEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [typedLength]);

  // Parse words and spaces into intact word tokens so words NEVER break across lines
  const wordsTokens = useMemo(() => {
    const tokens = [];
    const regex = /(\S+)(\s*)/g;
    let match;

    while ((match = regex.exec(textPrompt)) !== null) {
      const wordText = match[1];
      const spaceText = match[2];
      const wordStart = match.index;
      const wordEnd = wordStart + wordText.length;
      const spaceStart = wordEnd;
      const spaceEnd = spaceStart + spaceText.length;

      tokens.push({
        wordText,
        spaceText,
        wordStart,
        wordEnd,
        spaceStart,
        spaceEnd,
      });
    }
    return tokens;
  }, [textPrompt]);

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
  const currentTargetChar = textPrompt[typedLength] || '';
  const remainingText = textPrompt.slice(typedLength + 1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-3.5 select-none font-sans overflow-hidden">
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

        {/* Right Badges: Invite, Stars, Trophy Rank, Sound & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Invite Racers Button */}
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-400/40 backdrop-blur-md text-cyan-300 hover:text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-950/20 active:scale-95 transition"
            title="Invite Racers to Live Highway Duel"
          >
            <Users size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Invite Racers</span>
          </button>

          {/* Adaptive AI Badge */}
          <div
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md text-purple-300 text-xs font-bold shadow-md shadow-purple-950/20"
            title="Adaptive AI: Rivals adjust to your typing speed so you can win and reach the podium!"
          >
            <Zap size={13} className="text-purple-400 fill-purple-400" />
            <span>Adaptive AI</span>
          </div>

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
          <div className="relative w-full px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.18)]">
            {/* Cyber Corner Accents */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />

            {/* Stationary Cockpit Typing Display: Words NEVER break across lines and glyph width is 100% stable */}
            <div
              ref={cockpitRef}
              className="font-mono text-xs sm:text-sm tracking-normal leading-relaxed select-none min-h-[38px] max-h-[58px] overflow-y-auto no-scrollbar text-left w-full"
            >
              {wordsTokens.map((token, tIdx) => {
                return (
                  <React.Fragment key={tIdx}>
                    {/* Whole Word Token: inline-block + whitespace-nowrap guarantees the word is never split across lines */}
                    <span className="inline-block whitespace-nowrap">
                      {token.wordText.split('').map((char, cIdx) => {
                        const globalIdx = token.wordStart + cIdx;
                        const isTyped = globalIdx < typedLength;
                        const isCurrent = globalIdx === typedLength;

                        if (isTyped) {
                          return (
                            <span
                              key={globalIdx}
                              className="inline-block w-[1ch] text-center font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                            >
                              {char}
                            </span>
                          );
                        }

                        if (isCurrent) {
                          return (
                            <span
                              key={globalIdx}
                              ref={activeCharRef}
                              className="relative inline-block w-[1ch] text-center font-semibold text-white bg-cyan-500/40 rounded-xs ring-1 ring-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse"
                            >
                              {char}
                            </span>
                          );
                        }

                        return (
                          <span
                            key={globalIdx}
                            className="inline-block w-[1ch] text-center font-semibold text-slate-400/80"
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>

                    {/* Trailing Space Token: Serves as the natural line-break boundary with identical 1ch width */}
                    {token.spaceText.split('').map((_, sIdx) => {
                      const globalIdx = token.spaceStart + sIdx;
                      const isTyped = globalIdx < typedLength;
                      const isCurrent = globalIdx === typedLength;

                      if (isCurrent) {
                        return (
                          <span
                            key={globalIdx}
                            ref={activeCharRef}
                            className="relative inline-block w-[1ch] text-center font-semibold text-cyan-300 bg-cyan-500/30 rounded-xs ring-1 ring-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse"
                          >
                            &nbsp;
                          </span>
                        );
                      }

                      return (
                        <span
                          key={globalIdx}
                          className={`inline-block w-[1ch] text-center font-semibold ${
                            isTyped ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        >
                          &nbsp;
                        </span>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Glowing Dual Progress Bar + Counter */}
            <div className="mt-1.5 flex items-center justify-between gap-2.5 text-[11px] font-bold text-slate-400 font-mono">
              <div className="flex-1 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  style={{ width: `${Math.min(100, (currentLetterCount / totalLetters) * 100)}%` }}
                />
              </div>
              <span className="text-cyan-300 drop-shadow text-[11px]">
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
      <div className="flex items-center justify-between w-full pointer-events-none my-0.5 sm:my-auto">
        <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto">
          {/* Standings List (Places 1 to 6) */}
          <div className="w-38 sm:w-46 p-1.5 sm:p-2 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col gap-0.5 sm:gap-1">
            {racers.map((racer, idx) => {
              const place = idx + 1;
              const isUser = racer.isUser || racer.username === 'You' || place === userRank;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-900/60 to-purple-600/40 border border-purple-500/50 shadow-md shadow-purple-950/40'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-black ${
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
                      className={`text-[11px] font-bold truncate max-w-[75px] sm:max-w-[85px] ${
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
                      className="w-6 h-3.5 object-cover rounded border border-white/20 shadow-sm"
                      title={racer.carName || 'Supercar'}
                    />
                  ) : (
                    <div
                      className="w-5 h-2.5 rounded-xs border border-black/40 shadow-sm"
                      style={{ backgroundColor: racer.color || '#3b82f6' }}
                      title={racer.carName || 'Supercar'}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Track Radar Compass (Shown on larger displays) */}
          <div className="hidden 2xl:flex w-16 h-16 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md relative items-center justify-center shadow-lg">
            {/* North marker */}
            <span className="absolute top-1 text-[8px] font-bold text-cyan-400">N</span>
            <span className="absolute bottom-1 text-[8px] font-bold text-slate-500">S</span>

            {/* Rotating radar sweep */}
            <div className="w-13 h-13 rounded-full border border-dashed border-slate-700/60 relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM ROW: CAR DRAWER + PROMPT + SPEEDOMETER (Image 1)
      ======================================================== */}
      <div className="w-full flex items-end justify-between gap-2 sm:gap-3 pointer-events-auto z-20 shrink-0">
        {/* Bottom-Left: "Change Your Car" Drawer & Carousel */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 max-w-[280px] sm:max-w-sm shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
            <span>Change Your Car</span>
          </div>

          {/* Carousel thumbnails */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handlePrevCar}
              className="w-6 h-9 sm:w-7 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5 overflow-hidden py-0.5">
              {CAR_CATALOG.slice(carCarouselIndex, carCarouselIndex + 4).map((car) => {
                const isSelected = selectedCar?.id === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => {
                      onSelectCar(car);
                      racingAudio.playKey(true);
                    }}
                    className={`relative w-11 h-9 sm:w-13 sm:h-11 rounded-lg flex flex-col items-center justify-center border transition-all ${
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
                        className="w-9.5 h-5 sm:w-11 sm:h-6.5 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-7 h-3.5 rounded-xs border border-white/20 shadow-sm"
                        style={{ backgroundColor: car.color }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                        <Check size={8} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextCar}
              className="w-6 h-9 sm:w-7 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Active Car info footer */}
          <div className="flex items-center justify-between pt-0.5 border-t border-slate-800/80 text-[10px] sm:text-xs">
            <span className="font-bold text-white tracking-wide truncate max-w-[120px]">
              {selectedCar?.name || 'Shadow V12'}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/40">
              {selectedCar?.tier || 'Legendary'}
            </span>
          </div>
        </div>

        {/* Bottom Center: Encouraging Race Motivational Bar (Image 1) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center pb-1 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 drop-shadow">
            <span>Keep typing. Keep moving.</span>
            <span>🚀</span>
          </div>
          {/* Subtle neon progress pill */}
          <div className="w-40 sm:w-56 h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-purple-500 transition-all duration-200"
              style={{ width: `${Math.min(100, (currentLetterCount / totalLetters) * 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom-Right: Neon Circular Speedometer Dial (Image 1: 143 KM/H, Gear 4) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Nitro Activation Button */}
          <button
            onClick={() => {
              if (nitroPercent >= 50 && !isNitroActive) {
                onActivateNitro();
                racingAudio.playNitro();
              }
            }}
            disabled={nitroPercent < 50 || isNitroActive}
            className={`flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border transition-all ${
              isNitroActive
                ? 'bg-cyan-500 text-white border-cyan-300 shadow-[0_0_20px_#06b6d4] animate-pulse'
                : nitroPercent >= 50
                ? 'bg-slate-900/90 text-cyan-400 border-cyan-500/50 hover:bg-cyan-950/60 shadow-lg active:scale-95'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Press SPACE or Click for Nitro!"
          >
            <Zap size={15} className={nitroPercent >= 50 ? 'fill-cyan-400' : ''} />
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase mt-0.5">
              {isNitroActive ? 'BOOST' : 'NITRO'}
            </span>
          </button>

          {/* Speedometer Gauge */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-slate-950/90 border-2 border-cyan-500/40 backdrop-blur-xl shadow-[0_0_24px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center p-1">
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
              className="absolute w-0.5 h-7 sm:h-8 md:h-9 bg-gradient-to-t from-transparent to-cyan-300 origin-bottom transition-transform duration-100 shadow-[0_0_8px_#38bdf8]"
              style={{
                bottom: '50%',
                transform: `rotate(${needleAngle}deg)`,
              }}
            />

            {/* Digital Speed Value */}
            <div className="flex flex-col items-center z-10">
              <span className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] font-mono leading-none">
                {Math.round(clampedSpeed)}
              </span>
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-cyan-400 uppercase mt-0.5">
                KM/H
              </span>

              {/* Digital Gear Box (Image 1: '4') */}
              <div className="mt-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-purple-300 shadow-inner">
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
