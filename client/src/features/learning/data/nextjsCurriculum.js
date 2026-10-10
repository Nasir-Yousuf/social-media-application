// Clearfeed Learn & Practice - Next.js App Router Curriculum (35 Lessons)

export const NEXTJS_LESSONS = Array.from({ length: 35 }, (_, index) => {
  const order = index + 1;
  let chapter = 'Chapter 1: Foundations & Routing';
  if (order > 10 && order <= 20) chapter = 'Chapter 2: Data & Full-Stack Features';
  if (order > 20 && order <= 30) chapter = 'Chapter 3: Advanced Next.js';
  if (order > 30) chapter = 'Chapter 4: Production & Capstone';

  const topics = [
    'What Is Next.js & Why Full-Stack React Matters?',
    'Create a Next.js Project with create-next-app',
    'Next.js Project Directory Structure (app/, page.tsx, layout.tsx)',
    'File-Based App Router Architecture & Nested Segments',
    'Shared Layouts (layout.tsx) & Template Components',
    'Dynamic Routes ([id]/page.tsx) & Slug Parameters',
    'Loading UI (loading.tsx) & Error Boundaries (error.tsx)',
    'Custom 404 Not Found Pages & Programmatic Navigation',
    'React Server Components (RSC) vs Client Components ("use client")',
    'Determining When to Use Server vs Client Components',
    'Fetching Data Directly inside Server Components',
    'Caching, Revalidation & Data Freshness Strategies',
    'Forms & Server Actions for Mutations ("use server")',
    'Building Custom API Route Handlers (route.ts)',
    'Connecting Next.js to PostgreSQL / MongoDB Data Layer',
    'Authentication Concepts: Sessions, JWT & Cookies',
    'Authorization, Middleware & Route Protection',
    'Managing Environment Variables (.env.local) & Secrets',
    'File Uploads, Storage Providers & External Services',
    'Project: Full-Stack Database-Backed Web Application',
    'Rendering Strategies: SSG, SSR, ISR & Client-side',
    'Streaming Responses & Suspense Loading Boundaries',
    'Optimizing Images (<Image />), Fonts & Static Assets',
    'SEO Optimization, Dynamic Metadata & OpenGraph',
    'Next.js Middleware for Request Interception & Redirects',
    'Parallel Routes (@slot) & Intercepting Routes ((.))',
    'State Management Options: Server Data, URL State vs Context',
    'TypeScript Integration & Runtime Zod Validation',
    'Testing Next.js App Router Routes & Server Actions',
    'Performance Auditing & Vercel / Docker Deployment',
    'Enterprise Feature Architecture & Scalable Directory Layout',
    'Responsive & Accessible UI Design in Next.js',
    'Security Audit: Action Protection, CSRF & Rate Limiting',
    'Production Monitoring, Logging & Maintenance',
    'Final Next.js Capstone Project: Production Full-Stack SaaS Prototype',
  ];

  const titleText = topics[index] || `Next.js Lesson ${order}`;

  return {
    id: `next-${String(order).padStart(2, '0')}`,
    track: 'nextjs',
    order: order,
    chapter: chapter,
    difficulty: order <= 10 ? 'Intermediate' : order <= 25 ? 'Advanced' : 'Expert',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Build modern full-stack web applications with Next.js App Router and ${titleText}.`,
      bn: `নেক্সট জেস (Next.js) অ্যাপ রাউটার দিয়ে ফুলস্ট্যাক অ্যাপ তৈরি শিখুন।`,
    },
    explanation: {
      simple: {
        en: `Next.js is a React framework for building full-stack web applications with automatic routing, server rendering, and database integration.`,
        bn: `নেক্সট জেস হলো রিঅ্যাক্টের ওপর তৈরি ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরির ফ্রেমওয়ার্ক।`,
      },
      analogy: {
        en: `React is like an engine; Next.js is the fully assembled sports car with transmission, dashboard, lighting, and GPS included!`,
        bn: `রিঅ্যাক্ট যদি ইনজিন হয়, তবে নেক্সট জেস হলো একটি সম্পূর্ণ তৈরি স্পোর্টস কার।`,
      },
      technical: {
        en: `Next.js App Router leverages React Server Components (RSC), zero-bundle-size server code execution, and automatic static optimization.`,
        bn: `রিয়েক্ট সার্ভার কম্পোনেন্ট ও সার্ভার সাইড রেন্ডারিং।`,
      },
    },
    outcomes: [
      `Master ${titleText}`,
      'Understand Next.js App Router file conventions',
      'Build server actions and API route handlers',
    ],
    starterCode: {
      javascript: `// Next.js App Router Server Component Simulation
async function ServerPage({ params }) {
  const data = { title: "${titleText}", timestamp: new Date().toISOString() };
  console.log("Server Component Fetched Data on Server:", data);
  return data;
}
ServerPage({ params: { id: "1" } });
`,
    },
    exercise: {
      instructions: {
        en: `Examine the Next.js App Router layout structure and test navigation.`,
        bn: `নেক্সট জেস অ্যাপ রাউটার পরীক্ষা করুন।`,
      },
      hint: {
        en: 'Use page.tsx for page routes.',
        bn: 'page.tsx ব্যবহার করুন।',
      },
      solution: {
        javascript: `export default function Page() { return <h1>Next.js App Router</h1>; }`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'function',
      },
    },
  };
});
