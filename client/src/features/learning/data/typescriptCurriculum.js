// Clearfeed Learn & Practice - TypeScript Curriculum (30 Lessons)

export const TYPESCRIPT_LESSONS = Array.from({ length: 30 }, (_, index) => {
  const order = index + 1;
  let chapter = 'Chapter 1: Fundamentals';
  if (order > 10 && order <= 20) chapter = 'Chapter 2: Advanced Types';
  if (order > 20) chapter = 'Chapter 3: TypeScript in Applications';

  const topics = [
    'Why TypeScript Exists & Static Type Checking',
    'Installation, Compiler & tsconfig.json Options',
    'Primitive Types & Automatic Type Inference',
    'Typed Arrays, Tuples & Literal Types',
    'Object Types & Type Aliases (type User = {...})',
    'Interfaces & Contract Extension (interface User {...})',
    'Union Types (A | B) & Intersection Types (A & B)',
    'Function Signatures, Return Types & Optional Params',
    'Type Narrowing, Control Flow & Type Guards',
    'Mini Project: Typed Utility Function Library',
    'Optional Properties & Strict Null Checks (strictNullChecks)',
    'Enums vs Union String Literals',
    'Generics (function identity<T>(arg: T): T)',
    'Generic Constraints & Default Type Parameters',
    'Utility Types: Partial, Required, Pick, Omit, Record',
    'Mapped Types & Conditional Types (T extends U ? X : Y)',
    'keyof, typeof & Indexed Access Types',
    'Discriminated Unions for Safe Application States',
    'Declaration Files (.d.ts) & Third-Party Typings',
    'Mini Project: Typed Data Models & API Contracts',
    'TypeScript with React Props, State & Event Handlers',
    'Reusable Generic React Components in TypeScript',
    'Typing Async API Responses & Runtime Validation',
    'TypeScript Configuration for Node.js Applications',
    'TypeScript with Express.js Request/Response Handlers',
    'TypeScript with Next.js App Router Pages & Actions',
    'Runtime Schema Validation with Zod / Type-Safe Schemas',
    'Testing Typed Code & Type-Level Testing',
    'Diagnosing & Resolving Complex Compiler Diagnostics',
    'Final TypeScript Capstone: Fully Typed Full-Stack App',
  ];

  const titleText = topics[index] || `TypeScript Lesson ${order}`;

  return {
    id: `ts-${String(order).padStart(2, '0')}`,
    track: 'typescript',
    order: order,
    chapter: chapter,
    difficulty: order <= 10 ? 'Beginner' : order <= 20 ? 'Intermediate' : 'Advanced',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Write type-safe JavaScript applications with ${titleText}.`,
      bn: `টাইপস্কিপ্ট দিয়ে বাগ-মুক্ত কোড লেখা শিখুন।`,
    },
    explanation: {
      simple: {
        en: `TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.`,
        bn: `টাইপস্ক্রিপ্ট জাভাস্ক্রিপ্টের উপর তৈরি একটি টাইপড ল্যাঙ্গুয়েজ যা কম্পাইল টাইমে ভুল বা বাগ শনাক্ত করে।`,
      },
      analogy: {
        en: `JavaScript is like driving without a seatbelt or GPS; TypeScript is having an active co-pilot warning you before taking a wrong turn!`,
        bn: `টাইপস্ক্রিপ্ট যেন একজন সহ-চালক যিনি ভুল করার আগেই সতর্ক করেন।`,
      },
      technical: {
        en: `TypeScript adds compile-time static type checking via the tsc compiler, emitting clean vanilla JavaScript.`,
        bn: `কম্পাইল টাইমে স্ট্যাটিক টাইপ চেকিং নিশ্চিত করে।`,
      },
    },
    outcomes: [
      `Understand ${titleText}`,
      'Write type annotations and interface contracts',
      'Prevent common runtime TypeError crashes',
    ],
    starterCode: {
      javascript: `// TypeScript Type Contracts Simulation
interface User {
  id: number;
  name: string;
  role: 'admin' | 'student';
}

const user: User = {
  id: 101,
  name: "Nasir",
  role: "admin"
};

console.log("Valid User Created:", user.name, "(" + user.role + ")");
`,
    },
    exercise: {
      instructions: {
        en: `Examine the TypeScript interface and check type accuracy.`,
        bn: `ইন্টারফেস টাইপ চেক করুন।`,
      },
      hint: {
        en: 'Specify types for parameters and return values.',
        bn: 'প্যারামিটার টাইপ লিখুন।',
      },
      solution: {
        javascript: `interface Item { id: number; title: string; }\nconst i: Item = { id: 1, title: "Book" };\nconsole.log(i.title);`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'console.log',
      },
    },
  };
});
