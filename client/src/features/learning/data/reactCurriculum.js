// Clearfeed Learn & Practice - React Curriculum (40 Lessons)

export const REACT_LESSONS = Array.from({ length: 40 }, (_, index) => {
  const order = index + 1;
  let chapter = 'Chapter 1: Foundations';
  if (order > 10 && order <= 20) chapter = 'Chapter 2: State & Effects';
  if (order > 20 && order <= 30) chapter = 'Chapter 3: Routing, Data & Architecture';
  if (order > 30) chapter = 'Chapter 4: Advanced React & Real Applications';

  const topics = [
    'Why React Exists & Component-Based UI Architecture',
    'JavaScript Modern ES6+ Prerequisites for React',
    'Setting Up a React Project with Vite',
    'JSX Syntax: Embedding Expressions & Components',
    'Components & Props: Passing Data Down',
    'Rendering Lists & Understanding Keys (key={item.id})',
    'Conditional Rendering Patterns in JSX',
    'Event Handling in React (onClick, onChange)',
    'useState Hook: Managing Local Component State',
    'Project: Interactive Task List App',
    'State as a Render Snapshot & Queued Updates',
    'Immutable Updates for Objects & Arrays in State',
    'Form Handling & Controlled Input Components',
    'Lifting State Up to Shared Parent Components',
    'Component Composition with props.children & Slots',
    'useEffect Hook: Synchronizing with External Systems',
    'Effect Cleanup & Preventing Memory Leaks',
    'useRef Hook: Preserving Values & Accessing DOM',
    'Building Custom React Hooks for Reusable Logic',
    'Project: Searchable Data & Filter Dashboard',
    'React Router: Defining Routes, Layouts & Links',
    'URL Params (useParams) & Search Params (useSearchParams)',
    'Fetching Data in React: Loading States & Error Handling',
    'Data Caching & Synchronization Patterns',
    'Context API (createContext, useContext) for Global State',
    'useReducer Hook: Complex State Transitions',
    'Redux Toolkit: Slices, Actions & Selectors',
    'React Performance Optimization: React.memo & useMemo',
    'Error Boundaries & Designing Resilient UI',
    'Project: Multi-Page Interactive Web Application',
    'Portals & Accessible Modal Dialog Patterns',
    'useTransition & Deferred UI Rendering',
    'Code Splitting & Lazy Loading Components with React.lazy',
    'Accessibility (a11y) in React Applications',
    'Testing React Components with React Testing Library',
    'TypeScript Integration with React Props & State',
    'Project Folder Structure & Feature-Based Architecture',
    'Security, XSS Prevention & Production Practices',
    'Building & Deploying React Apps to Production',
    'Final React Capstone: Polished Web Application',
  ];

  const titleText = topics[index] || `React Lesson ${order}`;

  return {
    id: `react-${String(order).padStart(2, '0')}`,
    track: 'react',
    order: order,
    chapter: chapter,
    difficulty: order <= 10 ? 'Beginner' : order <= 25 ? 'Intermediate' : 'Advanced',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Master ${titleText} with interactive JSX components and state patterns.`,
      bn: `রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে ডায়নামিক ইউআই তৈরি করা শিখুন।`,
    },
    explanation: {
      simple: {
        en: `React is a JavaScript library for building user interfaces based on reusable components.`,
        bn: `রিঅ্যাক্ট হলো ইউজার ইন্টারফেস (UI) তৈরির একটি জনপ্রিয় জাভাস্ক্রিপ্ট লাইব্রেরি।`,
      },
      analogy: {
        en: `React components are like reusable custom HTML elements: write once, pass different props, render anywhere!`,
        bn: `পুনর্ব্যবহারযোগ্য কম্পোনেন্ট দিয়ে ওয়েবসাইট সাজানো।`,
      },
      technical: {
        en: `React uses a Virtual DOM reconciliation algorithm to calculate minimal DOM mutations when state changes.`,
        bn: `ভার্চুয়াল ডিওএম (Virtual DOM) দিয়ে দ্রুততম রেন্ডারিং নিশ্চিত করা হয়।`,
      },
    },
    outcomes: [
      `Understand ${titleText}`,
      'Build reusable React components with JSX',
      'Manage state and side-effects cleanly',
    ],
    starterCode: {
      html: `<div id="root"></div>`,
      css: ``,
      javascript: `// Interactive React Playground Simulation
function CounterApp() {
  let count = 0;
  console.log("React Component Rendered! Initial Count:", count);
  return "<div>Counter Component</div>";
}
CounterApp();
`,
    },
    exercise: {
      instructions: {
        en: `Examine the React component and test state changes.`,
        bn: `রিঅ্যাক্ট কম্পোনেন্ট স্টেট পরীক্ষা করুন।`,
      },
      hint: {
        en: 'Use useState hook for dynamic state.',
        bn: 'useState ব্যবহার করুন।',
      },
      solution: {
        javascript: `function App() { return <h1>Hello React!</h1>; }\nApp();`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'function',
      },
    },
  };
});
