// Code Typing Speed, Accuracy & Weakness Analyzer Utility

const STORAGE_KEY = 'clearfeed_code_practice_progress';

export const INITIAL_PROGRESS = {
  completedLessons: {
    html: [],
    css: [],
    javascript: [],
  },
  bestWpm: {
    html: 0,
    css: 0,
    javascript: 0,
  },
  bestAccuracy: {
    html: 0,
    css: 0,
    javascript: 0,
  },
  totalPracticeTime: 0, // seconds
  totalCharactersTyped: 0,
  xp: 0,
  level: 1,
  streak: 1,
  lastPracticedDate: null,
  weakKeysMap: {}, // char -> { errors: count, total: count }
  achievements: [],
};

// Calculate Level from total XP
export const calculateLevel = (xp = 0) => {
  return Math.floor(xp / 100) + 1;
};

// Available Achievements
export const ACHIEVEMENTS_LIST = [
  { id: 'first_lesson', title: 'First Code Lesson', desc: 'Complete your first programming typing snippet.', icon: '🏆' },
  { id: 'streak_3', title: '3 Day Streak', desc: 'Practice coding speed for 3 consecutive days.', icon: '🔥' },
  { id: 'wpm_50', title: '50 WPM Speed Demon', desc: 'Reach 50 WPM in any programming language.', icon: '⚡' },
  { id: 'html_master', title: 'HTML Master', desc: 'Complete 5 HTML structure lessons.', icon: '💻' },
  { id: 'css_master', title: 'CSS Master', desc: 'Complete 5 CSS styling lessons.', icon: '🎨' },
  { id: 'js_master', title: 'JavaScript Master', desc: 'Complete 5 JavaScript logic lessons.', icon: '⚙️' },
  { id: 'chars_1000', title: '1,000 Code Characters', desc: 'Type over 1,000 accurate code characters.', icon: '⌨️' },
  { id: 'chars_10000', title: '10,000 Code Characters', desc: 'Type over 10,000 accurate code characters.', icon: '🚀' },
];

export const loadProgressFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_PROGRESS, ...parsed };
  } catch (err) {
    console.warn('Failed to load code practice progress:', err);
    return INITIAL_PROGRESS;
  }
};

export const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save code practice progress:', err);
  }
};

// Calculate Typing WPM
export const calculateWPM = (correctChars, seconds) => {
  if (!seconds || seconds <= 0 || !correctChars) return 0;
  const words = correctChars / 5;
  const minutes = seconds / 60;
  return Math.max(0, Math.round(words / minutes));
};

// Calculate Typing Accuracy %
export const calculateAccuracy = (correctKeystrokes, totalKeystrokes) => {
  if (!totalKeystrokes || totalKeystrokes <= 0) return 100;
  const raw = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
};

// Analyze typing strengths and weaknesses
export const analyzeSessionPerformance = (sessionMistakes = {}, textSnippet = '') => {
  const symbolChars = new Set([
    '<', '>', '/', '=', '"', "'", '`', ';', ':', '(', ')', '[', ']', '{', '}', '_', '-', '+', '*', '&', '|', '!', '?', '@', '#', '$', '%'
  ]);

  const mistakesSet = new Set(Object.keys(sessionMistakes));
  const goodCategories = [];
  const needsPracticeChars = [];

  // Check categories
  let hadLetterError = false;
  let hadNumberError = false;
  let hadBasicPunctuationError = false;

  mistakesSet.forEach((char) => {
    if (/[a-zA-Z]/.test(char)) hadLetterError = true;
    else if (/[0-9]/.test(char)) hadNumberError = true;
    else if (['.', ',', ' '].includes(char)) hadBasicPunctuationError = true;
    
    if (symbolChars.has(char)) {
      needsPracticeChars.push(char);
    }
  });

  if (!hadLetterError) goodCategories.push('Letters (a-z, A-Z)');
  if (!hadNumberError) goodCategories.push('Numbers (0-9)');
  if (!hadBasicPunctuationError) goodCategories.push('Spaces & Basic Punctuation');

  return {
    goodCategories: goodCategories.length > 0 ? goodCategories : ['Overall Typing Rhythm'],
    needsPracticeChars: needsPracticeChars.length > 0 ? Array.from(new Set(needsPracticeChars)) : ['None! Great precision.'],
  };
};

// Update local progress with session results
export const recordSessionProgress = ({
  language,
  lessonId,
  wpm,
  accuracy,
  errorsCount,
  timeSeconds,
  typedLength,
  sessionWeakMap = {},
}) => {
  const current = loadProgressFromStorage();
  const langKey = (language || 'javascript').toLowerCase();

  const completedForLang = current.completedLessons[langKey] || [];
  const isNewCompletion = lessonId && !completedForLang.includes(lessonId);
  const updatedCompleted = isNewCompletion ? [...completedForLang, lessonId] : completedForLang;

  const prevBestWpm = current.bestWpm[langKey] || 0;
  const isPersonalBestWpm = wpm > prevBestWpm;
  const newBestWpm = Math.max(prevBestWpm, wpm);

  const prevBestAcc = current.bestAccuracy[langKey] || 0;
  const newBestAcc = Math.max(prevBestAcc, accuracy);

  const xpGain = (isNewCompletion ? 50 : 15) + (isPersonalBestWpm ? 25 : 0);
  const totalXp = (current.xp || 0) + xpGain;
  const totalTime = (current.totalPracticeTime || 0) + (timeSeconds || 0);
  const totalChars = (current.totalCharactersTyped || 0) + (typedLength || 0);

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  let streak = current.streak || 1;
  if (current.lastPracticedDate) {
    const last = new Date(current.lastPracticedDate);
    const now = new Date(today);
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  // Update Weak Keys Map
  const updatedWeakMap = { ...current.weakKeysMap };
  Object.entries(sessionWeakMap).forEach(([char, stats]) => {
    if (!updatedWeakMap[char]) {
      updatedWeakMap[char] = { errors: 0, total: 0 };
    }
    updatedWeakMap[char].errors += stats.errors || 0;
    updatedWeakMap[char].total += stats.total || 0;
  });

  // Evaluate unlocked achievements
  const unlocked = new Set(current.achievements || []);
  if (isNewCompletion || totalChars > 0) unlocked.add('first_lesson');
  if (streak >= 3) unlocked.add('streak_3');
  if (wpm >= 50) unlocked.add('wpm_50');
  if ((updatedCompleted.filter((id) => id.startsWith('html')).length) >= 5) unlocked.add('html_master');
  if ((updatedCompleted.filter((id) => id.startsWith('css')).length) >= 5) unlocked.add('css_master');
  if ((updatedCompleted.filter((id) => id.startsWith('js')).length) >= 5) unlocked.add('js_master');
  if (totalChars >= 1000) unlocked.add('chars_1000');
  if (totalChars >= 10000) unlocked.add('chars_10000');

  const updatedProgress = {
    ...current,
    completedLessons: {
      ...current.completedLessons,
      [langKey]: updatedCompleted,
    },
    bestWpm: {
      ...current.bestWpm,
      [langKey]: newBestWpm,
    },
    bestAccuracy: {
      ...current.bestAccuracy,
      [langKey]: newBestAcc,
    },
    totalPracticeTime: totalTime,
    totalCharactersTyped: totalChars,
    xp: totalXp,
    level: calculateLevel(totalXp),
    streak: streak,
    lastPracticedDate: today,
    weakKeysMap: updatedWeakMap,
    achievements: Array.from(unlocked),
  };

  saveProgressToStorage(updatedProgress);

  return {
    updatedProgress,
    isPersonalBestWpm,
    wpmDiff: isPersonalBestWpm ? wpm - prevBestWpm : 0,
    xpGained: xpGain,
    isNewCompletion,
  };
};

// Get sorted weak programming keys
export const getWeakestKeysList = (weakKeysMap = {}) => {
  const result = [];
  Object.entries(weakKeysMap).forEach(([char, stats]) => {
    if (stats.total >= 2) {
      const accuracy = Math.round(((stats.total - stats.errors) / stats.total) * 100);
      result.push({ char, accuracy: Math.max(0, accuracy), errors: stats.errors, total: stats.total });
    }
  });

  return result.sort((a, b) => a.accuracy - b.accuracy).slice(0, 6);
};
