import { HTML_LESSONS } from './htmlLessons';
import { CSS_LESSONS } from './cssLessons';
import { JAVASCRIPT_LESSONS } from './javascriptLessons';

export { HTML_LESSONS, CSS_LESSONS, JAVASCRIPT_LESSONS };

export const LESSON_MAP = {
  html: HTML_LESSONS,
  css: CSS_LESSONS,
  javascript: JAVASCRIPT_LESSONS,
};

export const getLessonsByLanguage = (lang = 'html') => {
  return LESSON_MAP[lang.toLowerCase()] || HTML_LESSONS;
};

export const getLessonById = (lang, lessonId) => {
  const list = getLessonsByLanguage(lang);
  return list.find((l) => l.id === lessonId) || list[0];
};

// Generates real, meaningful code snippets emphasizing specified weak keys
export const generateWeakKeysSnippet = (lang = 'javascript', weakKeys = ['{', '}', ';', '(']) => {
  const currentLang = lang.toLowerCase();
  
  if (currentLang === 'html') {
    return {
      id: 'weak-html-practice',
      title: 'Adaptive Symbol Practice (HTML)',
      difficulty: 'Targeted',
      description: 'Snippet tailored to strengthen your HTML tag & attribute keys.',
      snippet: `<div class="container" id="main-wrapper">
  <header class="header" data-role="banner">
    <h1 class="title">Practice Tag Syntax</h1>
    <a href="/profile?ref=practice" target="_blank" rel="noopener">
      <img src="/avatar.png" alt="Profile avatar" />
    </a>
  </header>
</div>`,
    };
  }

  if (currentLang === 'css') {
    return {
      id: 'weak-css-practice',
      title: 'Adaptive Symbol Practice (CSS)',
      difficulty: 'Targeted',
      description: 'Snippet tailored to strengthen your CSS brackets, colons & semicolons.',
      snippet: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  background-color: #121519;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}`,
    };
  }

  // Default to JS
  return {
    id: 'weak-js-practice',
    title: 'Adaptive Symbol Practice (JavaScript)',
    difficulty: 'Targeted',
    description: 'Snippet tailored to strengthen your weak JS characters.',
    snippet: `const processStats = ({ wpm = 0, accuracy = 100 }) => {
  const result = {
    isPassed: wpm >= 40 && accuracy >= 95,
    timestamp: Date.now(),
  };

  console.log(\`Result: \${result.isPassed ? "SUCCESS" : "RETRY"}\`);
  return result;
};`,
  };
};

export const DAILY_CHALLENGES = [
  {
    id: 'daily-1',
    lang: 'javascript',
    title: 'Daily Code Sprint: Async Fetch Engine',
    difficulty: 'Intermediate',
    snippet: `const fetchProductDetails = async (id) => {
  const res = await fetch(\`/api/products/\${id}\`);
  const data = await res.json();
  return { ...data, loadedAt: Date.now() };
};`,
  },
  {
    id: 'daily-2',
    lang: 'css',
    title: 'Daily Code Sprint: Glassmorphism Card',
    difficulty: 'Intermediate',
    snippet: `.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}`,
  },
  {
    id: 'daily-3',
    lang: 'html',
    title: 'Daily Code Sprint: Semantic Search Form',
    difficulty: 'Intermediate',
    snippet: `<form role="search" action="/search" method="GET" class="search-box">
  <input type="search" name="q" placeholder="Search code..." required />
  <button type="submit" aria-label="Search">Submit</button>
</form>`,
  },
];

export const getDailyChallenge = () => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
};
