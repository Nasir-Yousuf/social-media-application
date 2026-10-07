// Typing Arena calculation engine, metrics, tiers, and word stream helpers
import { WORDS_TOP_200 } from '../data/typing/wordsTop200';
import { WORDS_TOP_1000 } from '../data/typing/wordsTop1000';
import { CODE_KEYWORDS } from '../data/typing/codeKeywords';
import { PROGRAMMING_QUOTES } from '../data/typing/quotes';

export const SPEED_TIERS = [
  { min: 0, max: 39, name: 'Novice', badge: '🥉', color: 'text-amber-700', bg: 'bg-amber-900/20', border: 'border-amber-700/30' },
  { min: 40, max: 59, name: 'Apprentice', badge: '🥈', color: 'text-slate-300', bg: 'bg-slate-700/20', border: 'border-slate-500/30' },
  { min: 60, max: 79, name: 'Swift Hacker', badge: '🥇', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  { min: 80, max: 99, name: 'Speed Demon', badge: '💎', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/30' },
  { min: 100, max: 119, name: 'Cyber Master', badge: '⚡', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  { min: 120, max: 999, name: 'Transcendent', badge: '🔥', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
];

export const getSpeedTier = (wpm) => {
  const rounded = Math.round(wpm || 0);
  return SPEED_TIERS.find((t) => rounded >= t.min && rounded <= t.max) || SPEED_TIERS[0];
};

export const getComboInfo = (streak) => {
  if (streak >= 100) return { multiplier: 5, label: 'GODLIKE', color: 'text-rose-500', glow: 'shadow-rose-500/50' };
  if (streak >= 50) return { multiplier: 4, label: 'SUPERNOVA', color: 'text-purple-400', glow: 'shadow-purple-500/50' };
  if (streak >= 25) return { multiplier: 3, label: 'BLAZING', color: 'text-amber-400', glow: 'shadow-amber-500/50' };
  if (streak >= 10) return { multiplier: 2, label: 'IGNITED', color: 'text-sky-400', glow: 'shadow-sky-500/50' };
  return { multiplier: 1, label: 'WARMING UP', color: 'text-neutral-400', glow: '' };
};

export const calculateWpm = (correctChars, elapsedSeconds) => {
  if (!elapsedSeconds || elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(0, Math.round((correctChars / 5) / minutes));
};

export const calculateRawWpm = (totalTypedChars, elapsedSeconds) => {
  if (!elapsedSeconds || elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(0, Math.round((totalTypedChars / 5) / minutes));
};

export const calculateAccuracy = (correctKeystrokes, totalKeystrokes) => {
  if (!totalKeystrokes || totalKeystrokes <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((correctKeystrokes / totalKeystrokes) * 100)));
};

// Generates an array of words for the arena based on selected mode
export const generateWords = (mode = 'words_200', count = 100) => {
  let pool = WORDS_TOP_200;
  if (mode === 'words_1000') pool = WORDS_TOP_1000;
  if (mode === 'code') pool = CODE_KEYWORDS;

  if (mode === 'quote') {
    const randomQuote = PROGRAMMING_QUOTES[Math.floor(Math.random() * PROGRAMMING_QUOTES.length)];
    return {
      words: randomQuote.text.split(' '),
      quoteAuthor: randomQuote.author,
    };
  }

  // Shuffle and pick random words
  const result = [];
  for (let i = 0; i < count; i++) {
    const word = pool[Math.floor(Math.random() * pool.length)];
    result.push(word);
  }
  return { words: result, quoteAuthor: null };
};
