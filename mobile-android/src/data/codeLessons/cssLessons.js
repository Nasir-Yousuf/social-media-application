// Realistic CSS lessons structured into levels and difficulty tiers for code practice.

export const CSS_LESSONS = [
  // LEVEL 1: CSS BASICS (Lessons 1-10)
  {
    id: 'css-1',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 1,
    title: 'Basic Typography & Background',
    difficulty: 'Beginner',
    description: 'Type simple font, background, and text rules.',
    snippet: `body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333333;
  line-height: 1.6;
}`,
  },
  {
    id: 'css-2',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 2,
    title: 'Class Selectors & Margins',
    difficulty: 'Beginner',
    description: 'Practice styling containers with width, margin, and padding.',
    snippet: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
}`,
  },
  {
    id: 'css-3',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 3,
    title: 'Borders & Border Radius',
    difficulty: 'Beginner',
    description: 'Type card styling with borders and rounded corners.',
    snippet: `.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}`,
  },
  {
    id: 'css-4',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 4,
    title: 'Button Hover States',
    difficulty: 'Beginner',
    description: 'Practice pseudo-classes like :hover and :active.',
    snippet: `.btn-primary {
  background-color: #0284c7;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #0369a1;
}`,
  },
  {
    id: 'css-5',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 5,
    title: 'ID Selectors & Header Styling',
    difficulty: 'Beginner',
    description: 'Type ID selectors and header layout rules.',
    snippet: `#main-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}`,
  },
  {
    id: 'css-6',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 6,
    title: 'Text Alignment & Colors',
    difficulty: 'Beginner',
    description: 'Practice text properties and HEX / HSL colors.',
    snippet: `.hero-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: hsl(210, 100%, 45%);
  letter-spacing: -0.025em;
}`,
  },
  {
    id: 'css-7',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 7,
    title: 'Box Model: Margin & Padding',
    difficulty: 'Beginner',
    description: 'Master shorthand margin and padding definitions.',
    snippet: `.article-content {
  margin-top: 24px;
  margin-bottom: 32px;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
}`,
  },
  {
    id: 'css-8',
    level: 1,
    levelName: 'CSS Basics',
    lessonNumber: 8,
    title: 'Links and Focus Rings',
    difficulty: 'Beginner',
    description: 'Type accessible focus states and link underlines.',
    snippet: `a {
  color: #0ea5e9;
  text-decoration: none;
}

a:focus-visible {
  outline: 2px solid #0284c7;
  outline-offset: 4px;
}`,
  },

  // LEVEL 2: CSS LAYOUT (Lessons 11-20)
  {
    id: 'css-11',
    level: 2,
    levelName: 'CSS Layout',
    lessonNumber: 11,
    title: 'Display Block & Inline-Block',
    difficulty: 'Intermediate',
    description: 'Practice display values and vertical-align properties.',
    snippet: `.nav-item {
  display: inline-block;
  margin-right: 16px;
  vertical-align: middle;
}

.hidden-mobile {
  display: none;
}`,
  },
  {
    id: 'css-12',
    level: 2,
    levelName: 'CSS Layout',
    lessonNumber: 12,
    title: 'Absolute & Relative Positioning',
    difficulty: 'Intermediate',
    description: 'Master top, right, bottom, left positioning properties.',
    snippet: `.badge-wrapper {
  position: relative;
  display: inline-flex;
}

.notification-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background-color: #ef4444;
  border-radius: 50%;
}`,
  },
  {
    id: 'css-13',
    level: 2,
    levelName: 'CSS Layout',
    lessonNumber: 13,
    title: 'Overflow & Scrollbars',
    difficulty: 'Intermediate',
    description: 'Type overflow properties and custom scrollbar styles.',
    snippet: `.scrollable-panel {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.scrollable-panel::-webkit-scrollbar {
  width: 6px;
}`,
  },

  // LEVEL 3: FLEXBOX & GRID (Lessons 21-30)
  {
    id: 'css-21',
    level: 3,
    levelName: 'Flexbox & Grid',
    lessonNumber: 21,
    title: 'Flex Alignment & Justification',
    difficulty: 'Intermediate',
    description: 'Master flexbox alignment properties.',
    snippet: `.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
}`,
  },
  {
    id: 'css-22',
    level: 3,
    levelName: 'Flexbox & Grid',
    lessonNumber: 22,
    title: 'Flex Wrap & Growth',
    difficulty: 'Intermediate',
    description: 'Type flex-wrap, flex-grow, and flex-shrink rules.',
    snippet: `.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.flexible-column {
  flex: 1 1 300px;
  min-width: 0;
}`,
  },
  {
    id: 'css-23',
    level: 3,
    levelName: 'Flexbox & Grid',
    lessonNumber: 23,
    title: 'CSS Grid Template Columns',
    difficulty: 'Advanced',
    description: 'Type CSS Grid repeat and minmax functions.',
    snippet: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  align-items: start;
}`,
  },
  {
    id: 'css-24',
    level: 3,
    levelName: 'Flexbox & Grid',
    lessonNumber: 24,
    title: 'Grid Areas & Placement',
    difficulty: 'Advanced',
    description: 'Master grid-area and grid-template-areas syntax.',
    snippet: `.layout-wrapper {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
}`,
  },

  // LEVEL 4: RESPONSIVE & MODERN CSS (Lessons 31-40)
  {
    id: 'css-31',
    level: 4,
    levelName: 'Responsive & Modern CSS',
    lessonNumber: 31,
    title: 'Media Queries for Mobile',
    difficulty: 'Advanced',
    description: 'Practice responsive break points with @media.',
    snippet: `@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .main-content {
    padding: 12px;
  }
}`,
  },
  {
    id: 'css-32',
    level: 4,
    levelName: 'Responsive & Modern CSS',
    lessonNumber: 32,
    title: 'CSS Custom Variables',
    difficulty: 'Advanced',
    description: 'Master declaring and referencing var(--custom-props).',
    snippet: `:root {
  --primary-color: #0284c7;
  --bg-dark: #0f172a;
  --text-light: #f8fafc;
  --radius-md: 8px;
}

.box {
  background: var(--bg-dark);
  color: var(--text-light);
  border-radius: var(--radius-md);
}`,
  },
  {
    id: 'css-33',
    level: 4,
    levelName: 'Responsive & Modern CSS',
    lessonNumber: 33,
    title: 'Dark Theme Overrides',
    difficulty: 'Expert',
    description: 'Type modern CSS prefers-color-scheme & dark class rules.',
    snippet: `@media (prefers-color-scheme: dark) {
  :root {
    --bg-surface: #121519;
    --border-color: rgba(255, 255, 255, 0.1);
  }
}

.dark .card {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
}`,
  },
  {
    id: 'css-34',
    level: 4,
    levelName: 'Responsive & Modern CSS',
    lessonNumber: 34,
    title: 'Keyframe Animations',
    difficulty: 'Expert',
    description: 'Practice @keyframes and CSS animation declarations.',
    snippet: `@keyframes pulseGlow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.loader-dot {
  animation: pulseGlow 1.5s infinite ease-in-out;
}`,
  },
];
