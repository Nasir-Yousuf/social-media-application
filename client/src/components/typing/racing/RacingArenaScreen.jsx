import React, { useState, useEffect, useRef, useCallback } from 'react';
import RacingTrackCanvas from './RacingTrackCanvas';
import RacingHUD from './RacingHUD';
import {
  CAR_CATALOG,
  TRACK_CIRCUITS,
  getPlayerGarage,
  recordRaceCompletion,
} from '../../../utils/racingStorage';
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
  currentUser = null,
}) => {
  const [garage, setGarage] = useState(() => getPlayerGarage(currentUser));
  const selectedCar =
    CAR_CATALOG.find((c) => c.id === garage.selectedCarId) || CAR_CATALOG[0];

  const [raceText] = useState(DEFAULT_RACE_TEXT);
  const [typedIndex, setTypedIndex] = useState(0);
  const [countdown, setCountdown] = useState(3); // 3, 2, 1, 0 (Started)
  const [raceActive, setRaceActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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

  // Opponent Racers (Alex, Sophia, Rohan, Emma, Liam matching Reference Image 1)
  const [opponents, setOpponents] = useState([
    { id: 'alex', name: 'Alex', rank: 1, color: '#ef4444', progress: 0, targetWpm: 125, isLeader: true },
    { id: 'sophia', name: 'Sophia', rank: 2, color: '#22c55e', progress: 0, targetWpm: 118 },
    { id: 'rohan', name: 'Rohan', rank: 3, color: '#3b82f6', progress: 0, targetWpm: 110 },
    { id: 'emma', name: 'Emma', rank: 5, color: '#eab308', progress: 0, targetWpm: 96 },
    { id: 'liam', name: 'Liam', rank: 6, color: '#94a3b8', progress: 0, targetWpm: 88 },
  ]);

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

    const finalResult = recordRaceCompletion({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      characters: raceText.length,
      durationSec: Math.round(elapsedSec),
      position: userRank,
      totalRacers: 6,
      carId: selectedCar.id,
      trackId: 'neon_coast',
      nitroUsed: isNitroActive ? 1 : 0,
      currentUser,
    });

    onFinishRace(finalResult);
  }, [isFinished, raceText.length, userRank, selectedCar.id, isNitroActive, currentUser, onFinishRace]);

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

      const targetChar = raceText[typedIndex];

      if (key === targetChar) {
        // Correct character typed!
        const nextIndex = typedIndex + 1;
        setTypedIndex(nextIndex);
        setStreak((prev) => prev + 1);
        setNitroPercent((prev) => Math.min(100, prev + 1.2));
        racingAudio.playKey(true);

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
        racingAudio.updateEnginePitch(currentWpm, isNitroActive);

        // Check if finished entire prompt
        if (nextIndex >= raceText.length) {
          handleFinish();
        }
      } else if (key.length === 1) {
        // Typo
        errorsRef.current += 1;
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

  // Opponent progress simulation loop
  useEffect(() => {
    if (!raceActive || isFinished) return;

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;

      setOpponents((prev) =>
        prev.map((opp) => {
          // Progress as percentage of race length
          const charsTyped = (opp.targetWpm * 5 * (elapsedSec / 60));
          const progress = Math.min(100, (charsTyped / raceText.length) * 100);
          return { ...opp, progress };
        })
      );

      // Determine player's live rank among opponents
      const playerProgress = (typedIndex / raceText.length) * 100;
      setOpponents((currentOpponents) => {
        const higherRacers = currentOpponents.filter((o) => o.progress > playerProgress).length;
        setUserRank(higherRacers + 1);
        return currentOpponents;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [raceActive, isFinished, typedIndex, raceText.length]);

  const playerProgress = (typedIndex / raceText.length) * 100;

  // Build sorted roster for HUD left column
  const sortedRacers = [
    { username: 'You', name: 'You', color: selectedCar.color, progress: playerProgress, isUser: true, carName: selectedCar.name },
    ...opponents,
  ].sort((a, b) => b.progress - a.progress);

  return (
    <div className="relative w-full h-[88vh] min-h-[640px] rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-950">
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

      {/* Hidden input to ensure mobile virtual keyboards can open */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-96 left-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default RacingArenaScreen;
