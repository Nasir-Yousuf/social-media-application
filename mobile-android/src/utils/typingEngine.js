// Typing Arena calculation engine, metrics, tiers, and word stream helpers
import { WORDS_TOP_200 } from '../data/typing/wordsTop200.js';
import { WORDS_TOP_1000 } from '../data/typing/wordsTop1000.js';
import { CODE_KEYWORDS } from '../data/typing/codeKeywords.js';
import { PROGRAMMING_QUOTES } from '../data/typing/quotes.js';

export const SPEED_TIERS = [
  { min: 0, max: 39, name: 'Novice', gameName: 'BRONZE', badge: '🥉', color: 'text-amber-700', bg: 'bg-amber-900/20', border: 'border-amber-700/30', nextMin: 40, nextTier: 'Silver' },
  { min: 40, max: 59, name: 'Apprentice', gameName: 'SILVER', badge: '🥈', color: 'text-slate-300', bg: 'bg-slate-700/20', border: 'border-slate-500/30', nextMin: 60, nextTier: 'Gold' },
  { min: 60, max: 79, name: 'Swift Hacker', gameName: 'GOLD', badge: '🥇', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', nextMin: 80, nextTier: 'Platinum' },
  { min: 80, max: 99, name: 'Speed Demon', gameName: 'PLATINUM', badge: '💎', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/30', nextMin: 100, nextTier: 'Diamond' },
  { min: 100, max: 119, name: 'Cyber Master', gameName: 'DIAMOND', badge: '⚡', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', nextMin: 120, nextTier: 'Master' },
  { min: 120, max: 999, name: 'Transcendent', gameName: 'MASTER', badge: '🔥', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', nextMin: 999, nextTier: 'Max Rank' },
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
  if (!elapsedSeconds || elapsedSeconds < 1) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(0, Math.round((correctChars / 5) / minutes));
};

export const calculateRawWpm = (totalTypedChars, elapsedSeconds) => {
  if (!elapsedSeconds || elapsedSeconds < 1) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(0, Math.round((totalTypedChars / 5) / minutes));
};

export const calculateAccuracy = (correctKeystrokes, totalKeystrokes) => {
  if (!totalKeystrokes || totalKeystrokes <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((correctKeystrokes / totalKeystrokes) * 100)));
};

// Generates an array of words for the arena based on selected mode & options
export const generateWords = (options = 'words_200', count = 120) => {
  const mode = typeof options === 'string' ? options : options.mode || 'words_200';
  const punctuation = typeof options === 'object' ? !!options.punctuation : false;
  const numbers = typeof options === 'object' ? !!options.numbers : false;
  const wordCount = typeof options === 'object' && options.count ? options.count : count;

  let pool = WORDS_TOP_200;
  if (mode === 'words_1000' || mode === 'words_5000') pool = WORDS_TOP_1000;
  if (mode === 'code') pool = CODE_KEYWORDS;

  // Daily seed: consistent across all players today
  if (mode === 'daily') {
    const todayStr = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) {
      seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
    }
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const dailyWords = [];
    for (let i = 0; i < wordCount; i++) {
      const idx = Math.floor(pseudoRandom() * WORDS_TOP_1000.length);
      dailyWords.push(WORDS_TOP_1000[idx]);
    }
    return { words: dailyWords, quoteAuthor: null };
  }

  if (mode === 'quote') {
    const randomQuote = PROGRAMMING_QUOTES[Math.floor(Math.random() * PROGRAMMING_QUOTES.length)];
    return {
      words: randomQuote.text.split(' '),
      quoteAuthor: randomQuote.author,
    };
  }

  // Shuffle and pick random words with optional numbers and punctuation
  const result = [];
  const numbersPool = ['42', '100', '2026', '500', '7', '12', '99', '2048', '360', '80', '10'];
  const punctMarks = ['.', ',', '!', '?', ';'];

  for (let i = 0; i < wordCount; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)];

    if (numbers && Math.random() < 0.12) {
      word = numbersPool[Math.floor(Math.random() * numbersPool.length)];
    } else if (punctuation) {
      if (Math.random() < 0.25) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (Math.random() < 0.2) {
        const mark = punctMarks[Math.floor(Math.random() * punctMarks.length)];
        word = word + mark;
      }
    }

    result.push(word);
  }

  return { words: result, quoteAuthor: null };
};
