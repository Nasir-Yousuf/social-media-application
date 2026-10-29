// Realistic JavaScript lessons structured into levels and difficulty tiers for code practice.

export const JAVASCRIPT_LESSONS = [
  // LEVEL 1: FUNDAMENTALS (Lessons 1-15)
  {
    id: 'js-1',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 1,
    title: 'Variables & Console Log',
    difficulty: 'Beginner',
    description: 'Type basic variable declarations and console statements.',
    snippet: `const userScore = 100;
let isCompleted = false;

console.log("Current score:", userScore);
console.log("Status:", isCompleted);`,
  },
  {
    id: 'js-2',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 2,
    title: 'EventListener & QuerySelector',
    difficulty: 'Beginner',
    description: 'Practice fundamental DOM selector and click handler syntax.',
    snippet: `const button = document.querySelector("#button");

button.addEventListener("click", () => {
  console.log("Button clicked");
});`,
  },
  {
    id: 'js-3',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 3,
    title: 'String Interpolation',
    difficulty: 'Beginner',
    description: 'Master template literal syntax with backticks and ${expr}.',
    snippet: `const firstName = "Sarah";
const role = "Frontend Developer";
const greeting = \`Hello \${firstName}, welcome as \${role}!\`;

console.log(greeting);`,
  },
  {
    id: 'js-4',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 4,
    title: 'Conditional Statements',
    difficulty: 'Beginner',
    description: 'Type if / else logic and comparison operators.',
    snippet: `const accuracy = 96;

if (accuracy >= 95) {
  console.log("Excellent typing speed!");
} else if (accuracy >= 80) {
  console.log("Good job, keep practicing.");
} else {
  console.log("Focus on precision.");
}`,
  },
  {
    id: 'js-5',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 5,
    title: 'Arrow Functions & Parameters',
    difficulty: 'Beginner',
    description: 'Type modern arrow functions with arguments and return.',
    snippet: `const calculateWpm = (typedChars, timeInSeconds) => {
  const words = typedChars / 5;
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
};`,
  },
  {
    id: 'js-6',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 6,
    title: 'Array Declarations & Indexing',
    difficulty: 'Beginner',
    description: 'Practice array bracket syntax and length properties.',
    snippet: `const languages = ["HTML", "CSS", "JavaScript"];
const firstLang = languages[0];

console.log(\`Selected: \${firstLang}\`);
console.log("Total items:", languages.length);`,
  },
  {
    id: 'js-7',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 7,
    title: 'Object Literals & Properties',
    difficulty: 'Beginner',
    description: 'Type key-value pairs inside curly brace objects.',
    snippet: `const userProfile = {
  username: "alex_coder",
  level: 12,
  wpm: 58,
  isOnline: true,
};

console.log(userProfile.username);`,
  },
  {
    id: 'js-8',
    level: 1,
    levelName: 'Fundamentals',
    lessonNumber: 8,
    title: 'Ternary Operator',
    difficulty: 'Beginner',
    description: 'Type compact inline conditional statements.',
    snippet: `const score = 85;
const statusText = score >= 50 ? "PASSED" : "FAILED";
const themeClass = isDarkMode ? "dark-theme" : "light-theme";`,
  },

  // LEVEL 2: FUNCTIONS & ARRAYS (Lessons 16-30)
  {
    id: 'js-16',
    level: 2,
    levelName: 'Functions & Arrays',
    lessonNumber: 16,
    title: 'Array map() Method',
    difficulty: 'Intermediate',
    description: 'Practice mapping over arrays with arrow callbacks.',
    snippet: `const scores = [45, 52, 61, 70];
const updatedScores = scores.map((score) => score + 5);

console.log(updatedScores);`,
  },
  {
    id: 'js-17',
    level: 2,
    levelName: 'Functions & Arrays',
    lessonNumber: 17,
    title: 'Array filter() Method',
    difficulty: 'Intermediate',
    description: 'Filter elements based on condition predicate.',
    snippet: `const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Charlie", active: true },
];

const activeUsers = users.filter((u) => u.active);`,
  },
  {
    id: 'js-18',
    level: 2,
    levelName: 'Functions & Arrays',
    lessonNumber: 18,
    title: 'Array reduce() Accumulator',
    difficulty: 'Intermediate',
    description: 'Type reduce methods with initial values.',
    snippet: `const prices = [12.99, 5.50, 24.00, 8.75];
const totalCost = prices.reduce((acc, current) => {
  return acc + current;
}, 0);

console.log("Total:", totalCost.toFixed(2));`,
  },
  {
    id: 'js-19',
    level: 2,
    levelName: 'Functions & Arrays',
    lessonNumber: 19,
    title: 'Object & Array Destructuring',
    difficulty: 'Intermediate',
    description: 'Practice extracting properties using destructuring syntax.',
    snippet: `const stats = { wpm: 64, accuracy: 98, errors: 2 };
const { wpm, accuracy } = stats;

const [primary, secondary] = ["#0284c7", "#10b981"];`,
  },
  {
    id: 'js-20',
    level: 2,
    levelName: 'Functions & Arrays',
    lessonNumber: 20,
    title: 'Spread & Rest Operators',
    difficulty: 'Intermediate',
    description: 'Type three dots (...) for cloning and expanding items.',
    snippet: `const defaultSettings = { theme: "dark", fontSize: 14 };
const userSettings = { ...defaultSettings, fontSize: 16 };

const addAll = (...numbers) => {
  return numbers.reduce((sum, n) => sum + n, 0);
};`,
  },

  // LEVEL 3: DOM MANIPULATION (Lessons 31-45)
  {
    id: 'js-31',
    level: 3,
    levelName: 'DOM Manipulation',
    lessonNumber: 31,
    title: 'Creating & Appending Elements',
    difficulty: 'Intermediate',
    description: 'Type document.createElement and appendChild syntax.',
    snippet: `const createNotification = (text) => {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerText = text;
  document.body.appendChild(toast);
};`,
  },
  {
    id: 'js-32',
    level: 3,
    levelName: 'DOM Manipulation',
    lessonNumber: 32,
    title: 'Toggle ClassList & Datasets',
    difficulty: 'Intermediate',
    description: 'Practice classList.toggle and dataset manipulation.',
    snippet: `const card = document.querySelector(".card");

card.classList.toggle("is-active");
card.dataset.state = "expanded";
const id = card.getAttribute("data-id");`,
  },

  // LEVEL 4: MODERN JS & ASYNC (Lessons 46-60)
  {
    id: 'js-46',
    level: 4,
    levelName: 'Modern JS & Async',
    lessonNumber: 46,
    title: 'Fetch API & Async / Await',
    difficulty: 'Advanced',
    description: 'Master async functions and fetch request handling.',
    snippet: `const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error("Failed to fetch user");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
};`,
  },
  {
    id: 'js-47',
    level: 4,
    levelName: 'Modern JS & Async',
    lessonNumber: 47,
    title: 'LocalStorage Helper Utility',
    difficulty: 'Advanced',
    description: 'Practice JSON parsing and stringifying to localStorage.',
    snippet: `const saveProgress = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn("Could not save to localStorage", err);
  }
};`,
  },
  {
    id: 'js-48',
    level: 4,
    levelName: 'Modern JS & Async',
    lessonNumber: 48,
    title: 'Promises & Promise.all',
    difficulty: 'Advanced',
    description: 'Type concurrent async operations with Promise.all.',
    snippet: `const loadDashboardData = async () => {
  const [profile, posts, stats] = await Promise.all([
    fetch("/api/profile").then((res) => res.json()),
    fetch("/api/posts").then((res) => res.json()),
    fetch("/api/stats").then((res) => res.json()),
  ]);

  return { profile, posts, stats };
};`,
  },

  // LEVEL 5: REAL-WORLD PATTERNS (Lessons 61-75)
  {
    id: 'js-61',
    level: 5,
    levelName: 'Real-World JavaScript',
    lessonNumber: 61,
    title: 'Debounce Utility Function',
    difficulty: 'Expert',
    description: 'Type high-performance debounce utility for search inputs.',
    snippet: `const debounce = (fn, delay = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};`,
  },
  {
    id: 'js-62',
    level: 5,
    levelName: 'Real-World JavaScript',
    lessonNumber: 62,
    title: 'Custom Event Emitter Pattern',
    difficulty: 'Expert',
    description: 'Master dispatching custom browser window events.',
    snippet: `const publishAchievement = (achievement) => {
  const event = new CustomEvent("clearfeed:achievement", {
    detail: { achievement, timestamp: Date.now() },
  });
  window.dispatchEvent(event);
};`,
  },
  {
    id: 'js-63',
    level: 5,
    levelName: 'Real-World JavaScript',
    lessonNumber: 63,
    title: 'State Management Store Class',
    difficulty: 'Expert',
    description: 'Type ES6 class constructor and state update methods.',
    snippet: `class TypingStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }
}`,
  },
];
