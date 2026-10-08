import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import RacingTrackCanvas from './RacingTrackCanvas';
import RacingHUD from './RacingHUD';
import RaceInviteModal from './RaceInviteModal';
import {
  CAR_CATALOG,
  TRACK_CIRCUITS,
  getPlayerGarage,
  recordRaceCompletion,
} from '../../../utils/racingStorage';
import { saveTypingResultLocally } from '../../../utils/typingStorage';
import api from '../../../api/client';
import racingAudio from '../../../utils/racingAudio';

const DEFAULT_RACE_TEXT =
  'the quick brown fox jumps over the lazy dog as glowing neon lights illuminate the dark night highway and engines roar with adrenaline on the coastal circuit';

/**
 * Full in-race screen matching Reference Image 1:
 * - 2.5D Canvas highway + perspective cars
 * - High-tech racing HUD (speedometer, minimap, standings, typing cockpit)
 * - Countdown sequence (3, 2, 1, START!)
 * - Live WPM & KM/H calculations
 * - Finish celebration with XP, stars and stats recording
 */
export const RacingArenaScreen = ({
  onExit = () => {},
  onFinishRace = () => {},
  onShareRace = () => {},
  currentUser = null,
  initialRival = null,
}) => {
  const [garage, setGarage] = useState(() => getPlayerGarage(currentUser));
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeRival, setActiveRival] = useState(initialRival);
  const selectedCar =
    CAR_CATALOG.find((c) => c.id === garage.selectedCarId) || CAR_CATALOG[0];

  const [raceText] = useState(DEFAULT_RACE_TEXT);
  const [typedIndex, setTypedIndex] = useState(0);
  const [countdown, setCountdown] = useState(3); // 3, 2, 1, 0 (Started)
  const [raceActive, setRaceActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishData, setFinishData] = useState(null);

  // Telemetry
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [speedKmH, setSpeedKmH] = useState(0);
  const [gear, setGear] = useState(1);
  const [nitroPercent, setNitroPercent] = useState(40);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userRank, setUserRank] = useState(4);

  const startTimeRef = useRef(null);
  const errorsRef = useRef(0);
  const hiddenInputRef = useRef(null);
  const prevRankRef = useRef(6);
  const lastTickRef = useRef(null);
  const lastErrorTimeRef = useRef(0);
  const recentErrorsRef = useRef(0);

  // Resume Web Audio context immediately on any user gesture so engine audio is never blocked
  useEffect(() => {
    const unlockAudio = () => {
      racingAudio.init();
      if (!racingAudio.getMuted() && !racingAudio.isEngineRunning) {
        racingAudio.startEngine(speedKmH || 40);
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [speedKmH]);

  // Adaptive Opponent Racers: Dynamically calibrated around player speed tier
  const [opponents, setOpponents] = useState(() => [
    {
      id: initialRival ? (initialRival.username || initialRival._id) : 'alex',
      name: initialRival ? (initialRival.name || initialRival.username) : 'Alex',
      rank: 1,
      color: initialRival ? (initialRival.carColor || '#ef4444') : '#ef4444',
      carName: initialRival ? (initialRival.carName || 'Street Phantom') : 'Street Phantom',
      image: initialRival ? (initialRival.carImage || '/racing/street_phantom.png') : '/racing/street_phantom.png',
      progress: 0,
      speedRatio: 1.04, // Rival Leader: just ahead (+4%), catches podium
      isLeader: true,
      isRival: !!initialRival,
    },
    {
      id: 'sophia',
      name: 'Sophia',
      rank: 2,
      color: '#22c55e',
      carName: 'Neon GT',
      image: '/racing/neon_gt.png',
      progress: 0,
      speedRatio: 0.98, // Podium contender, neck-and-neck (98%)
    },
    {
      id: 'rohan',
      name: 'Rohan',
      rank: 3,
      color: '#3b82f6',
      carName: 'Cyber Cruiser',
      image: '/racing/cyber_cruiser.png',
      progress: 0,
      speedRatio: 0.90, // Solid driver (90%)
    },
    {
      id: 'emma',
      name: 'Emma',
      rank: 5,
      color: '#eab308',
      carName: 'Thunder RS',
      image: '/racing/thunder_rs.png',
      progress: 0,
      speedRatio: 0.79, // Cruiser (79%)
    },
    {
      id: 'liam',
      name: 'Liam',
      rank: 6,
      color: '#e2e8f0',
      carName: 'Apex X',
      image: '/racing/apex_x.png',
      progress: 0,
      speedRatio: 0.67, // Rookie, easily overtaken (67%)
    },
  ]);

  // Synchronize dynamic rival when passed or updated from challenge URL
  useEffect(() => {
    if (initialRival) {
      setOpponents((prev) => {
        const rivalOpponent = {
          id: initialRival.username || initialRival._id || 'rival',
          name: initialRival.name || initialRival.username || 'Rival Driver',
          rank: 1,
          color: initialRival.carColor || '#ef4444',
          carName: initialRival.carName || 'Street Phantom',
          image: initialRival.carImage || '/racing/street_phantom.png',
          progress: 0,
          speedRatio: 1.03,
          isLeader: true,
          isRival: true,
        };
        const rest = prev.filter((o) => !o.isRival && o.id !== 'alex');
        return [rivalOpponent, ...rest];
      });
    }
  }, [initialRival]);

  // Start countdown sequence
  useEffect(() => {
    racingAudio.startEngine(40);

    let count = 3;
    racingAudio.playCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      racingAudio.playCountdown(count);

      if (count <= 0) {
        clearInterval(timer);
        setRaceActive(true);
        startTimeRef.current = Date.now();
        if (hiddenInputRef.current) hiddenInputRef.current.focus();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      racingAudio.stopEngine();
    };
  }, []);

  // Nitro Boost Trigger
  const activateNitro = useCallback(() => {
    if (nitroPercent < 50 || isNitroActive) return;
    setIsNitroActive(true);
    racingAudio.playNitro();
    setNitroPercent((prev) => Math.max(0, prev - 50));

    setTimeout(() => {
      setIsNitroActive(false);
    }, 2800);
  }, [nitroPercent, isNitroActive]);

  // Finish Race Handler
  const handleFinish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    setRaceActive(false);
    racingAudio.stopEngine();
    racingAudio.playVictory();

    const elapsedSec = startTimeRef.current
      ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
      : 30;

    const finalWpm = Math.round((raceText.length / 5) / (elapsedSec / 60));
    const finalAccuracy = Math.max(80, Math.round(100 - (errorsRef.current / raceText.length) * 100));
    const effectiveSec = Math.max(15, Math.round(elapsedSec));

    const finalResult = recordRaceCompletion({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      characters: raceText.length,
      durationSec: effectiveSec,
      position: userRank,
      totalRacers: 6,
      carId: selectedCar.id,
      trackId: 'neon_coast',
      nitroUsed: isNitroActive ? 1 : 0,
      currentUser,
    });

    // Save race score to typing leaderboard and local persistent stats
    saveTypingResultLocally(
      {
        wpm: finalWpm,
        rawWpm: finalWpm,
        accuracy: finalAccuracy,
        duration: effectiveSec,
        mode: 'words',
        charCount: raceText.length,
        highestCombo: streak || 0,
        telemetry: [finalWpm],
        isRace: true,
      },
      currentUser
    );

    // Also attempt remote background sync if authenticated
    if (currentUser) {
      api
        .post('/typing/submit', {
          wpm: finalWpm,
          rawWpm: finalWpm,
          accuracy: finalAccuracy,
          duration: [15, 30, 60, 120].includes(effectiveSec) ? effectiveSec : 60,
          mode: 'words_200',
          charCount: raceText.length,
          highestCombo: streak || 0,
          telemetry: [finalWpm],
        })
        .catch((e) => {
          console.info('Racing remote score save notice (saved locally):', e?.message);
        });
    }

    setFinishData(finalResult);
    onFinishRace(finalResult);
  }, [isFinished, raceText.length, userRank, selectedCar.id, isNitroActive, currentUser, onFinishRace, streak]);

  // Restart / Rematch race
  const handleRestartRace = useCallback(() => {
    setFinishData(null);
    setIsFinished(false);
    setTypedIndex(0);
    errorsRef.current = 0;
    lastErrorTimeRef.current = 0;
    recentErrorsRef.current = 0;
    lastTickRef.current = null;
    prevRankRef.current = 6;
    setUserRank(6);
    setWpm(0);
    setSpeedKmH(0);
    setGear(1);
    setNitroPercent(40);
    setIsNitroActive(false);
    setStreak(0);
    setOpponents((prev) => prev.map((o) => ({ ...o, progress: 0 })));
    setCountdown(3);
    racingAudio.startEngine(40);

    let count = 3;
    racingAudio.playCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      racingAudio.playCountdown(count);

      if (count <= 0) {
        clearInterval(timer);
        setRaceActive(true);
        startTimeRef.current = Date.now();
        if (hiddenInputRef.current) hiddenInputRef.current.focus();
      }
    }, 1000);
  }, []);

  // Launch live 1v1 duel with an invited rival racer
  const handleStartDuelWithRacer = useCallback((racer) => {
    setActiveRival(racer);
    setOpponents([
      {
        id: racer.username || racer._id,
        name: racer.name || racer.username,
        rank: 1,
        color: racer.carColor || '#ef4444',
        carName: racer.carName || 'Street Phantom',
        image: racer.carImage || '/racing/street_phantom.png',
        progress: 0,
        speedRatio: 1.03,
        isLeader: true,
        isRival: true,
      },
      {
        id: 'sophia',
        name: 'Sophia',
        rank: 2,
        color: '#22c55e',
        carName: 'Neon GT',
        image: '/racing/neon_gt.png',
        progress: 0,
        speedRatio: 0.98,
      },
      {
        id: 'rohan',
        name: 'Rohan',
        rank: 3,
        color: '#3b82f6',
        carName: 'Cyber Cruiser',
        image: '/racing/cyber_cruiser.png',
        progress: 0,
        speedRatio: 0.90,
      },
      {
        id: 'emma',
        name: 'Emma',
        rank: 5,
        color: '#eab308',
        carName: 'Thunder RS',
        image: '/racing/thunder_rs.png',
        progress: 0,
        speedRatio: 0.79,
      },
      {
        id: 'liam',
        name: 'Liam',
        rank: 6,
        color: '#e2e8f0',
        carName: 'Apex X',
        image: '/racing/apex_x.png',
        progress: 0,
        speedRatio: 0.67,
      },
    ]);
    handleRestartRace();
  }, [handleRestartRace]);

  // Keystroke handler for typing challenge
  const handleKeyDown = useCallback(
    (e) => {
      if (!raceActive || isFinished) return;

      // Space activates Nitro if at end or if ctrl/alt pressed
      if (e.code === 'Space' && (e.ctrlKey || nitroPercent >= 100)) {
        e.preventDefault();
        activateNitro();
        return;
      }

      const key = e.key;
      if (key.length !== 1 && key !== 'Backspace') return;

      // Backspace: Allow navigating back across characters and words to fix mistakes
      if (key === 'Backspace') {
        e.preventDefault();
        if (typedIndex > 0) {
          let nextIndex = typedIndex - 1;
          if (e.ctrlKey) {
            // Ctrl+Backspace: jump back to previous word boundary
            while (nextIndex > 0 && raceText[nextIndex - 1] === ' ') nextIndex--;
            while (nextIndex > 0 && raceText[nextIndex - 1] !== ' ') nextIndex--;
          }
          setTypedIndex(nextIndex);
          setStreak((prev) => Math.max(0, prev - 1));
          racingAudio.playKey(false);

          if (startTimeRef.current) {
            const elapsedSec = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
            const currentWpm = Math.max(10, Math.round((nextIndex / 5) / (elapsedSec / 60)));
            setWpm(currentWpm);
          }
        }
        return;
      }

      const targetChar = raceText[typedIndex];

      if (key === targetChar) {
        // Correct character typed!
        const nextIndex = typedIndex + 1;
        setTypedIndex(nextIndex);
        setStreak((prev) => prev + 1);
        setNitroPercent((prev) => Math.min(100, prev + 1.2));
        racingAudio.playKey(true);
        racingAudio.revThrottle(); // Throttle surge on every correct keystroke!

        if (recentErrorsRef.current > 0 && nextIndex % 5 === 0) {
          recentErrorsRef.current = Math.max(0, recentErrorsRef.current - 1);
        }

        // Update live WPM & Speedometer
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const currentWpm = Math.max(10, Math.round((nextIndex / 5) / (elapsedSec / 60)));
        setWpm(currentWpm);

        // KM/H calculation: WPM * 1.15 + combo/nitro bonus
        const calculatedKmH = Math.round(
          currentWpm * 1.15 + Math.min(40, streak * 0.8) + (isNitroActive ? 45 : 0)
        );
        setSpeedKmH(calculatedKmH);

        // Calculate dynamic gear 1-6
        const currentGear = Math.min(6, Math.max(1, Math.floor(calculatedKmH / 35) + 1));
        setGear(currentGear);

        // Modulate engine sound pitch with speed
        racingAudio.updateEnginePitch(calculatedKmH, isNitroActive);

        // Check if finished entire prompt
        if (nextIndex >= raceText.length) {
          handleFinish();
        }
      } else if (key.length === 1) {
        // Typo: trigger error penalty so rivals catch up!
        errorsRef.current += 1;
        lastErrorTimeRef.current = Date.now();
        recentErrorsRef.current = Math.min(5, (recentErrorsRef.current || 0) + 1);
        setStreak(0);
        racingAudio.playKey(false);
        setAccuracy(Math.max(70, Math.round(100 - (errorsRef.current / (typedIndex + 1)) * 100)));
      }
    },
    [raceActive, isFinished, typedIndex, raceText, nitroPercent, activateNitro, streak, isNitroActive, handleFinish]
  );

  // Global Keydown listener for instant input
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Adaptive Rubberbanding Opponent progress simulation loop
  useEffect(() => {
    if (!raceActive || isFinished) return;

    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const dt = lastTickRef.current
        ? Math.min(0.25, Math.max(0.02, (now - lastTickRef.current) / 1000))
        : 0.1;
      lastTickRef.current = now;

      const elapsedSec = (now - startTimeRef.current) / 1000;

      // 1. Calculate player's live running speed (WPM)
      // If race just started (< 1.5s), assume friendly benchmark of 48 WPM
      const playerLiveWpm = (elapsedSec > 1.2 && typedIndex > 2)
        ? (typedIndex / 5) / (elapsedSec / 60)
        : 48;

      // Bound baseline so AI is always fair and challenging (22 to 140 WPM)
      const benchmarkWpm = Math.max(22, Math.min(140, playerLiveWpm));

      // 2. Error penalty: when player makes mistakes, rivals seize the opportunity (+4-12% surge)
      const isRecentError = (now - lastErrorTimeRef.current) < 2600;
      const errorSurge = isRecentError ? Math.min(0.12, (recentErrorsRef.current || 1) * 0.04) : 0;

      // 3. Clean typing momentum boost: when player maintains a combo streak (>= 6 chars),
      // player gets a natural slipstream edge to overtake!
      const streakRelief = streak >= 6 ? Math.min(0.09, streak * 0.0035) : 0;

      // 4. Nitro Surge: player roars ahead, AI does not cheat through nitro
      const nitroRelief = isNitroActive ? 0.16 : 0;

      // 5. Climax factor: in the final 20% of the race, pack tightens slightly for an exhilarating finish
      const playerProg = (typedIndex / raceText.length) * 100;
      const climaxFactor = playerProg > 80 ? 0.02 : 0;

      setOpponents((prev) =>
        prev.map((opp, idx) => {
          let baseRatio = opp.speedRatio || (1.04 - idx * 0.09);

          // Calculate effective dynamic ratio
          const dynamicRatio = baseRatio + errorSurge + (idx === 0 ? climaxFactor : -climaxFactor) - streakRelief - nitroRelief;

          // Natural human wave variation (+/- 2.2 WPM)
          const wave = Math.sin(elapsedSec * 1.5 + idx * 2.2) * 2.2;
          const targetWpm = Math.max(12, benchmarkWpm * dynamicRatio + wave);

          // Incremental distance added this tick
          const charsPerSec = (targetWpm * 5) / 60;
          const progressDelta = (charsPerSec * dt / raceText.length) * 100;
          const newProgress = Math.min(100, (opp.progress || 0) + progressDelta);

          return { ...opp, progress: newProgress, currentWpm: Math.round(targetWpm) };
        })
      );

      // Determine player's live rank among opponents
      const playerProgress = (typedIndex / raceText.length) * 100;
      setOpponents((currentOpponents) => {
        const higherRacers = currentOpponents.filter((o) => o.progress > playerProgress).length;
        const newRank = higherRacers + 1;

        // If player overtook a rival, play exciting Doppler pass-by swoosh!
        if (newRank < prevRankRef.current && prevRankRef.current <= 6) {
          racingAudio.playOvertake();
        }
        prevRankRef.current = newRank;
        setUserRank(newRank);
        return currentOpponents;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceActive, isFinished, typedIndex, raceText.length, streak, isNitroActive]);

  const playerProgress = (typedIndex / raceText.length) * 100;

  // Active word data for the Holographic On-Car Typing Cockpit HUD
  const activeWordData = useMemo(() => {
    if (!raceText) return { activeWord: '', activeWordTyped: 0, nextWord: '', isSpaceNeeded: false };

    const tokens = [];
    const regex = /(\S+)(\s*)/g;
    let match;
    while ((match = regex.exec(raceText)) !== null) {
      tokens.push({
        word: match[1],
        space: match[2],
        wordStart: match.index,
        wordEnd: match.index + match[1].length,
        spaceStart: match.index + match[1].length,
        spaceEnd: match.index + match[1].length + match[2].length,
      });
    }

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const nextT = tokens[i + 1];
      const nextWord = nextT ? nextT.word : '';

      if (typedIndex >= t.wordStart && typedIndex < t.wordEnd) {
        return {
          activeWord: t.word,
          activeWordTyped: typedIndex - t.wordStart,
          nextWord,
          isSpaceNeeded: false,
        };
      } else if (typedIndex >= t.spaceStart && typedIndex < t.spaceEnd) {
        return {
          activeWord: t.word,
          activeWordTyped: t.word.length,
          nextWord,
          isSpaceNeeded: true,
        };
      }
    }

    if (tokens.length > 0) {
      const last = tokens[tokens.length - 1];
      return {
        activeWord: last.word,
        activeWordTyped: last.word.length,
        nextWord: '',
        isSpaceNeeded: false,
      };
    }

    return { activeWord: '', activeWordTyped: 0, nextWord: '', isSpaceNeeded: false };
  }, [raceText, typedIndex]);

  // Build sorted roster for HUD left column
  const sortedRacers = [
    {
      username: 'You',
      name: 'You',
      color: selectedCar.color,
      progress: playerProgress,
      isUser: true,
      carName: selectedCar.name,
      image: selectedCar.image || '/racing/shadow_v12.png',
    },
    ...opponents,
  ].sort((a, b) => b.progress - a.progress);

  return (
    <div className="relative w-full flex-1 min-h-[440px] max-h-[740px] rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-950 flex flex-col">
      {/* 2.5D Canvas Highway */}
      <RacingTrackCanvas
        playerProgress={playerProgress}
        playerSpeedKmH={speedKmH}
        isNitroActive={isNitroActive}
        isFinished={isFinished}
        playerCar={selectedCar}
        opponents={opponents}
        licensePlate={garage.licensePlate || 'NASIR'}
        trackTheme="neon_coast"
        activeWord={activeWordData.activeWord}
        activeWordTyped={activeWordData.activeWordTyped}
        nextWord={activeWordData.nextWord}
        isSpaceNeeded={activeWordData.isSpaceNeeded}
        userRank={userRank}
      />

      {/* Futuristic Cockpit HUD matching Reference Image 1 */}
      <RacingHUD
        textPrompt={raceText}
        typedText={raceText.slice(0, typedIndex)}
        currentLetterCount={typedIndex}
        totalLetters={raceText.length}
        wpm={wpm}
        speedKmH={speedKmH}
        accuracy={accuracy}
        gear={gear}
        nitroPercent={nitroPercent}
        isNitroActive={isNitroActive}
        onActivateNitro={activateNitro}
        selectedCar={selectedCar}
        onSelectCar={(car) => {
          setGarage((g) => ({ ...g, selectedCarId: car.id, paintColor: car.color }));
        }}
        racers={sortedRacers}
        userRank={userRank}
        stars={3420}
        trackName="Neon Coast"
        round="1/3"
        onBack={onExit}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />

      {/* Countdown overlay (3, 2, 1, GO!) */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none">
          <span className="text-8xl sm:text-9xl font-black italic tracking-tighter text-cyan-400 animate-ping font-mono drop-shadow-[0_0_35px_#06b6d4]">
            {countdown}
          </span>
          <span className="text-xl font-bold uppercase tracking-widest text-slate-200 mt-4">
            GET READY TO TYPE
          </span>
        </div>
      )}

      {/* 🏁 Cinematic Finish Result Screen (Requirement 26 & 27) */}
      {finishData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-950/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-5">
            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black italic tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                {finishData.race.position === 1
                  ? '🏆 1ST PLACE!'
                  : finishData.race.position === 2
                  ? '🥈 2ND PLACE!'
                  : finishData.race.position === 3
                  ? '🥉 3RD PLACE!'
                  : `🏁 #${finishData.race.position} PLACE`}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                {finishData.race.position === 1
                  ? 'VICTORY! Dominant Highway Master!'
                  : finishData.race.position === 2
                  ? 'PODIUM FINISH! Incredible typing speed!'
                  : finishData.race.position === 3
                  ? 'PODIUM BRONZE! Outstanding performance!'
                  : 'RACE COMPLETE! Keep typing and pushing for the podium!'}
              </p>
            </div>

            {/* Showcase Car */}
            <div className="relative mx-auto w-64 h-36 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img
                src={selectedCar.image || '/racing/shadow_v12.jpg'}
                alt={selectedCar.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-slate-950/90 text-white font-mono text-[10px] font-bold">
                {selectedCar.name}
              </div>
            </div>

            {/* Performance Analysis Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-950/60">
                <span className="text-[10px] text-slate-400 block font-sans">Speed</span>
                <span className="text-xl font-black text-cyan-400">{finishData.race.wpm} WPM</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60">
                <span className="text-[10px] text-slate-400 block font-sans">Accuracy</span>
                <span className="text-xl font-black text-emerald-400">{finishData.race.accuracy}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60">
                <span className="text-[10px] text-slate-400 block font-sans">Time</span>
                <span className="text-xl font-black text-white">{finishData.race.durationSec}s</span>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-center gap-6 text-sm font-bold">
              <span className="text-cyan-300">+{finishData.xpEarned} XP ⚡</span>
              <span className="text-amber-300">+{finishData.starsEarned} Stars ⭐</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleRestartRace}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
              >
                REMATCH / RACE AGAIN
              </button>
              <button
                onClick={() => {
                  onShareRace({
                    text: `🏁 Just finished a Typing Arena Race!\n\n⚡ ${finishData.race.wpm} WPM • ${finishData.race.accuracy}% Accuracy\n🏆 #${finishData.race.position} in ${selectedCar.name}\n\nBeat my score in the Typing Arena!`,
                    wpm: finishData.race.wpm,
                    accuracy: finishData.race.accuracy,
                    position: finishData.race.position,
                    carName: selectedCar.name,
                  });
                }}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
              >
                SHARE TO FEED 🚀
              </button>
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input to ensure mobile virtual keyboards can open */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-96 left-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Race Invite & 1v1 Challenger Modal */}
      <RaceInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onStartDuelWithRacer={handleStartDuelWithRacer}
        selectedCar={selectedCar}
      />
    </div>
  );
};

export default RacingArenaScreen;
