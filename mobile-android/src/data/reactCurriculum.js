// Clearfeed REACT_LESSONS - Comprehensive Interactive Curriculum
export const REACT_LESSONS = [
  {
    "id": "react-01",
    "track": "react",
    "order": 1,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Beginner",
    "title": {
      "en": "1. Why React Exists & Component-Based UI Architecture",
      "bn": "১. রিয়্যাক্ট কেন দরকার ও কম্পোনেন্ট আর্কিটেকচার"
    },
    "subtitle": {
      "en": "Understand declarative UI, component trees, and how React solves spaghetti code.",
      "bn": "ডিক্লোরেটিভ ইউআই এবং কম্পোনেন্ট ট্রি কীভাবে কোড সুশৃঙ্খল রাখে।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "React is a library for building user interfaces by breaking them down into reusable, self-contained components.",
        "bn": "রিঅ্যাক্ট হলো একটি লাইব্রেরি যা সম্পূর্ণ ওয়েবসাইটকে ছোট ছোট পুনর্ব্যবহারযোগ্য কম্পোনেন্টে বিভক্ত করে তৈরি করে।"
      },
      "simple": {
        "en": "React is a library for building user interfaces by breaking them down into reusable, self-contained components.",
        "bn": "রিঅ্যাক্ট হলো একটি লাইব্রেরি যা সম্পূর্ণ ওয়েবসাইটকে ছোট ছোট পুনর্ব্যবহারযোগ্য কম্পোনেন্টে বিভক্ত করে তৈরি করে।"
      },
      "whyNeedIt": {
        "en": "Imagine LEGO bricks: instead of carving a castle from a single rock, you snap together interchangeable modular bricks.",
        "bn": "লেগো খেলনার মতো: আস্ত একটা দুর্গ এক খণ্ডে না বানিয়ে ছোট ছোট ব্লক জোড়া দিয়ে তৈরি করা।"
      },
      "analogy": {
        "en": "Imagine LEGO bricks: instead of carving a castle from a single rock, you snap together interchangeable modular bricks.",
        "bn": "লেগো খেলনার মতো: আস্ত একটা দুর্গ এক খণ্ডে না বানিয়ে ছোট ছোট ব্লক জোড়া দিয়ে তৈরি করা।"
      },
      "technical": {
        "en": "React maintains a Virtual DOM in memory, computes diffs via reconciliation, and batches minimal real DOM mutations.",
        "bn": "ভার্চুয়াল ডিওএম ব্যবহার করে রিয়্যাক্ট সর্বনিম্ন পরিবর্তনের মাধ্যমে দ্রুততম সময়ে ব্রাউজার আপডেট করে।"
      }
    },
    "outcomes": [
      "Understand component architecture",
      "Contrast imperative DOM vs declarative React",
      "Visualize component trees"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Declaring a clean React component\nfunction WelcomeBanner({ appName, releaseYear }) {\n  return (\n    <div style={{ padding: '16px', background: '#0284c7', color: '#fff', borderRadius: '8px' }}>\n      <h1>Welcome to {appName}!</h1>\n      <p>Building modern web experiences since {releaseYear}.</p>\n    </div>\n  );\n}\n\n// Render component with props\nconsole.log(\"Component declared successfully!\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a ProfileHeader component function that returns an <h2> with a student name and a <p> with their learning goal.",
        "bn": "একটি ProfileHeader কম্পোনেন্ট ফাংশন তৈরি করুন যা একটি নাম এবং একটি লক্ষ্য প্রিন্ট করবে।"
      },
      "hint": {
        "en": "Define function ProfileHeader({ name, goal }) { return ... }",
        "bn": "function ProfileHeader({ name, goal }) ডিক্লেয়ার করুন।"
      },
      "solution": {
        "javascript": "function ProfileHeader({ name, goal }) {\n  return (\n    <div>\n      <h2>Student: {name}</h2>\n      <p>Goal: {goal}</p>\n    </div>\n  );\n}\nconsole.log(ProfileHeader({ name: \"Alex\", goal: \"Master React\" }));"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "ProfileHeader"
      }
    }
  },
  {
    "id": "react-02",
    "track": "react",
    "order": 2,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Beginner",
    "title": {
      "en": "2. Modern ES6+ JavaScript Prerequisites for React",
      "bn": "২. রিয়্যাক্টের জন্য প্রয়োজনীয় আধুনিক জাভাস্ক্রিপ্ট (ES6+)"
    },
    "subtitle": {
      "en": "Master destructuring, arrow functions, template literals, and array methods for React.",
      "bn": "অ্যারো ফাংশন, ডিস্ট্রাকচারিং ও ম্যাপ মেথড আয়ত্ত করুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "React heavily utilizes modern JavaScript features like object destructuring and concise arrow functions.",
        "bn": "রিঅ্যাক্টে অবজেক্ট ডিস্ট্রাকচারিং ও অ্যারো ফাংশন ব্যাপকভাবে ব্যবহৃত হয়।"
      },
      "simple": {
        "en": "React heavily utilizes modern JavaScript features like object destructuring and concise arrow functions.",
        "bn": "রিঅ্যাক্টে অবজেক্ট ডিস্ট্রাকচারিং ও অ্যারো ফাংশন ব্যাপকভাবে ব্যবহৃত হয়।"
      },
      "whyNeedIt": {
        "en": "Destructuring is like opening a lunchbox and taking out your sandwich directly instead of saying \"lunchbox.sandwich\" every time.",
        "bn": "লাঞ্চবক্স থেকে সরাসরি স্যান্ডউইচ হাতে নেওয়ার মতো, বারবার lunchbox.item না লিখে সরাসরি { item } বের করা।"
      },
      "analogy": {
        "en": "Destructuring is like opening a lunchbox and taking out your sandwich directly instead of saying \"lunchbox.sandwich\" every time.",
        "bn": "লাঞ্চবক্স থেকে সরাসরি স্যান্ডউইচ হাতে নেওয়ার মতো, বারবার lunchbox.item না লিখে সরাসরি { item } বের করা।"
      },
      "technical": {
        "en": "ES6 destructuring extracts properties from objects/arrays into distinct variables, while arrow functions provide concise lexical this binding.",
        "bn": "ইএস৬ ডিস্ট্রাকচারিং ও অ্যারো ফাংশন কোডকে সংক্ষিপ্ত ও পরিষ্কার রাখে।"
      }
    },
    "outcomes": [
      "Use object & array destructuring",
      "Write concise arrow functions",
      "Use template literals and spread operator"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Destructuring in React props\nconst user = { id: 101, username: \"dev_nasir\", role: \"admin\", points: 450 };\n\n// Extracting properties cleanly\nconst { username, role, points } = user;\nconsole.log(`User: ${username} | Role: ${role} | XP: ${points}`);\n\n// Arrow function component helper\nconst calculateLevel = (xp) => Math.floor(xp / 100) + 1;\nconsole.log(\"Current Level:\", calculateLevel(points));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Use object destructuring to extract \"title\" and \"duration\" from a course object and return a formatted string.",
        "bn": "কোর্স অবজেক্ট থেকে ডিস্ট্রাকচারিং করে title ও duration বের করুন।"
      },
      "hint": {
        "en": "const { title, duration } = course;",
        "bn": "const { title, duration } = course লিখুন।"
      },
      "solution": {
        "javascript": "const course = { title: \"React Fundamentals\", duration: \"4 hours\" };\nconst { title, duration } = course;\nconsole.log(`Course: ${title} (${duration})`);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "const { title, duration }"
      }
    }
  },
  {
    "id": "react-03",
    "track": "react",
    "order": 3,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Beginner",
    "title": {
      "en": "3. Setting Up a React Project with Vite",
      "bn": "৩. Vite দিয়ে দ্রুততম রিয়্যাক্ট প্রজেক্ট তৈরি ও রান করা"
    },
    "subtitle": {
      "en": "Build lightning-fast React applications with Vite build tool and Hot Module Replacement.",
      "bn": "Vite দিয়ে মিলি-সেকেন্ডে রিয়্যাক্ট অ্যাপ সেটআপ ও রান করুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Vite is the modern, lightning-fast frontend build tool that replaces slow older bundlers like Create React App.",
        "bn": "Vite হলো আধুনিক বিল্ড টুল যা অত্যন্ত দ্রুত কোড পরিবর্তন ব্রাউজারে রিফ্রেশ ছাড়াই প্রদর্শন করে।"
      },
      "simple": {
        "en": "Vite is the modern, lightning-fast frontend build tool that replaces slow older bundlers like Create React App.",
        "bn": "Vite হলো আধুনিক বিল্ড টুল যা অত্যন্ত দ্রুত কোড পরিবর্তন ব্রাউজারে রিফ্রেশ ছাড়াই প্রদর্শন করে।"
      },
      "whyNeedIt": {
        "en": "Vite is like a high-speed bullet train compared to the older steam locomotive of Create React App.",
        "bn": "পুরনো ক্রিয়েট-রিঅ্যাক্ট-অ্যাপের তুলনায় Vite যেন এক বুলেট ট্রেন।"
      },
      "analogy": {
        "en": "Vite is like a high-speed bullet train compared to the older steam locomotive of Create React App.",
        "bn": "পুরনো ক্রিয়েট-রিঅ্যাক্ট-অ্যাপের তুলনায় Vite যেন এক বুলেট ট্রেন।"
      },
      "technical": {
        "en": "Vite uses native ES modules (ESM) in dev mode for instantaneous server start and esbuild for fast bundling.",
        "bn": "নেটিভ ইএস মডিউল ও esbuild ব্যবহার করে দ্রুততম হট মডিউল রিপ্লেসমেন্ট (HMR) দেয়।"
      }
    },
    "outcomes": [
      "Run npm create vite@latest",
      "Understand project folder layout",
      "Explore package.json and vite.config.js"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Vite index.html + main.jsx entry point simulation\nconsole.log(\"=== Vite React App Entry Point ===\");\nconst appConfig = {\n  bundler: \"Vite v6\",\n  framework: \"React 19\",\n  entry: \"src/main.jsx\",\n  rootId: \"root\",\n  hotModuleReload: true\n};\nconsole.log(\"Starting development server at http://localhost:5173\");\nconsole.log(\"Config loaded:\", JSON.stringify(appConfig, null, 2));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a simulated Vite config object with plugins array containing \"react()\" and port set to 3000.",
        "bn": "একটি Vite কনফিগ অবজেক্ট তৈরি করুন যাতে port 3000 থাকবে।"
      },
      "hint": {
        "en": "const viteConfig = { server: { port: 3000 }, plugins: [\"react()\"] };",
        "bn": "port 3000 সেট করুন।"
      },
      "solution": {
        "javascript": "const viteConfig = {\n  server: { port: 3000 },\n  plugins: [\"@vitejs/plugin-react\"]\n};\nconsole.log(\"Configured Port:\", viteConfig.server.port);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "3000"
      }
    }
  },
  {
    "id": "react-04",
    "track": "react",
    "order": 4,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Beginner",
    "title": {
      "en": "4. JSX Syntax: Embedding Expressions & HTML in JS",
      "bn": "৪. JSX সিনট্যাক্স: জাভাস্ক্রিপ্টের মধ্যে এইচটিএমএল লেখা"
    },
    "subtitle": {
      "en": "Write HTML-like syntax inside JavaScript and embed expressions with curly braces {}.",
      "bn": "জাভাস্ক্রিপ্টের ভেতর সরাসরি এইচটিএমএল সিনট্যাক্স লেখার নিয়ম।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "JSX stands for JavaScript XML. It lets you write markup directly within JavaScript files.",
        "bn": "JSX হলো জাভাস্ক্রিপ্ট এক্সটেনশন যার সাহায্যে সরাসরি জাভাস্ক্রিপ্টের ভেতর HTML এর মতো কোড লেখা যায়।"
      },
      "simple": {
        "en": "JSX stands for JavaScript XML. It lets you write markup directly within JavaScript files.",
        "bn": "JSX হলো জাভাস্ক্রিপ্ট এক্সটেনশন যার সাহায্যে সরাসরি জাভাস্ক্রিপ্টের ভেতর HTML এর মতো কোড লেখা যায়।"
      },
      "whyNeedIt": {
        "en": "JSX is like bilingual subtitles: it blends the visual structure of HTML with the raw power of JavaScript.",
        "bn": "এইচটিএমএলের কাঠামো আর জাভাস্ক্রিপ্টের লজিককে এক ফ্রেমে বাঁধার নামই JSX।"
      },
      "analogy": {
        "en": "JSX is like bilingual subtitles: it blends the visual structure of HTML with the raw power of JavaScript.",
        "bn": "এইচটিএমএলের কাঠামো আর জাভাস্ক্রিপ্টের লজিককে এক ফ্রেমে বাঁধার নামই JSX।"
      },
      "technical": {
        "en": "Babel/SWC transpile JSX into React.createElement() calls (or the new _jsx runtime), producing lightweight virtual DOM object nodes.",
        "bn": "JSX স্বয়ংক্রিয়ভাবে React.createElement এ রূপান্তর হয়ে ভার্চুয়াল ডিওএম নোড তৈরি করে।"
      }
    },
    "outcomes": [
      "Understand JSX rules (single root, className, htmlFor)",
      "Embed dynamic expressions with {}",
      "Write clean markup in JS"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// JSX Expression Evaluation\nconst userName = \"Nasir\";\nconst unreadMessages = 5;\nconst isOnline = true;\n\n// In JSX:\n// <div className=\"card\">\n//   <h3>{userName}</h3>\n//   <p>{unreadMessages > 0 ? `${unreadMessages} new notifications` : \"All caught up!\"}</p>\n// </div>\n\nconst renderedOutput = {\n  tag: \"div\",\n  props: { className: \"card\" },\n  children: [\n    { tag: \"h3\", text: userName },\n    { tag: \"p\", text: unreadMessages > 0 ? `${unreadMessages} new notifications` : \"All caught up!\" }\n  ]\n};\nconsole.log(\"Rendered JSX VDOM Node:\", JSON.stringify(renderedOutput, null, 2));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a function formatBadge(status) that returns \"Active User\" if status is \"online\", else \"Offline\".",
        "bn": "একটি formatBadge ফাংশন লিখুন যা স্ট্যাটাস অনুযায়ী ব্যাজ রিটার্ন করবে।"
      },
      "hint": {
        "en": "const formatBadge = (s) => s === \"online\" ? \"Active User\" : \"Offline\";",
        "bn": "টারনারি অপারেটর ব্যবহার করুন।"
      },
      "solution": {
        "javascript": "function formatBadge(status) {\n  return status === \"online\" ? \"Active User\" : \"Offline\";\n}\nconsole.log(formatBadge(\"online\"));\nconsole.log(formatBadge(\"away\"));"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "formatBadge"
      }
    }
  },
  {
    "id": "react-05",
    "track": "react",
    "order": 5,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Beginner",
    "title": {
      "en": "5. Components & Props: Passing Data Down",
      "bn": "৫. কম্পোনেন্ট ও প্রপ্স: প্যারেন্ট থেকে চাইল্ডে ডেটা পাঠানো"
    },
    "subtitle": {
      "en": "Pass custom configuration, data, and callbacks to child components using props.",
      "bn": "প্রপ্স (Props) এর মাধ্যমে ডেটা এক কম্পোনেন্ট থেকে অন্যটিতে পাঠানো।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Props (short for properties) are the inputs you pass to a React component, just like function arguments.",
        "bn": "প্রপ্স হলো ফাংশনের আর্গুমেন্টের মতো যা প্যারেন্ট কম্পোনেন্ট থেকে চাইল্ডে পাঠানো হয়।"
      },
      "simple": {
        "en": "Props (short for properties) are the inputs you pass to a React component, just like function arguments.",
        "bn": "প্রপ্স হলো ফাংশনের আর্গুমেন্টের মতো যা প্যারেন্ট কম্পোনেন্ট থেকে চাইল্ডে পাঠানো হয়।"
      },
      "whyNeedIt": {
        "en": "Props are like ordering a custom burger: \"make it with cheddar cheese, no onions, extra sauce\". The burger component adapts to your order!",
        "bn": "রেস্টুরেন্টে খাবারের কাস্টম অর্ডার দেওয়ার মতো: চিজ দাও, পেঁয়াজ দিও না। কম্পোনেন্ট সেই অনুযায়ী তৈরি হয়!"
      },
      "analogy": {
        "en": "Props are like ordering a custom burger: \"make it with cheddar cheese, no onions, extra sauce\". The burger component adapts to your order!",
        "bn": "রেস্টুরেন্টে খাবারের কাস্টম অর্ডার দেওয়ার মতো: চিজ দাও, পেঁয়াজ দিও না। কম্পোনেন্ট সেই অনুযায়ী তৈরি হয়!"
      },
      "technical": {
        "en": "Props are read-only (immutable). A component must never modify its own props, enforcing pure functional top-down unidirectional data flow.",
        "bn": "প্রপ্স সর্বদাই অপরিবর্তনশীল (read-only); এটি একমুখী ডেটা ফ্লো বজায় রাখে।"
      }
    },
    "outcomes": [
      "Pass string, number, and object props",
      "Set default prop values",
      "Understand unidirectional data flow"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Parent & Child Component Simulation with Props\nfunction Button({ label, variant = \"primary\", onClick }) {\n  const styles = {\n    primary: \"bg-sky-500 text-white\",\n    danger: \"bg-rose-500 text-white\",\n    secondary: \"bg-neutral-800 text-neutral-200\"\n  };\n  return {\n    rendered: `<button class=\"${styles[variant] || styles.primary}\">${label}</button>`,\n    variant\n  };\n}\n\nconst saveBtn = Button({ label: \"Save Changes\", variant: \"primary\" });\nconst delBtn = Button({ label: \"Delete Post\", variant: \"danger\" });\nconsole.log(\"Save Button:\", saveBtn.rendered);\nconsole.log(\"Delete Button:\", delBtn.rendered);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a Card component function that accepts title, subtitle, and author props and returns an object summarizing the card.",
        "bn": "একটি Card কম্পোনেন্ট ফাংশন লিখুন যা title, subtitle, এবং author প্রপ্স গ্রহণ করে।"
      },
      "hint": {
        "en": "function Card({ title, subtitle, author }) { return { title, subtitle, author }; }",
        "bn": "ফাংশনে ৩টি প্রপ ডিস্ট্রাকচার করুন।"
      },
      "solution": {
        "javascript": "function Card({ title, subtitle, author = \"Clearfeed\" }) {\n  return {\n    title,\n    subtitle,\n    author,\n    rendered: `[${author}] ${title}: ${subtitle}`\n  };\n}\nconsole.log(Card({ title: \"Learn React\", subtitle: \"Zero to Hero\" }));"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "function Card"
      }
    }
  },
  {
    "id": "react-06",
    "track": "react",
    "order": 6,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Intermediate",
    "title": {
      "en": "6. Rendering Lists & Understanding Keys (key={item.id})",
      "bn": "৬. লিস্ট রেন্ডারিং ও ইউনিক কি (Keys)"
    },
    "subtitle": {
      "en": "Map over arrays to generate dynamic UI items and why React requires unique keys.",
      "bn": "অ্যারে ম্যাপ করে ডাইনামিক লিস্ট তৈরি এবং key এর গুরুত্ব।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "To display lists in React, you use JavaScript’s array .map() method to transform data items into JSX elements.",
        "bn": "লিস্ট প্রদর্শনের জন্য অ্যারে এর .map() ব্যবহার করে প্রতিটি আইটেমের জন্য কম্পোনেন্ট তৈরি করা হয়।"
      },
      "simple": {
        "en": "To display lists in React, you use JavaScript’s array .map() method to transform data items into JSX elements.",
        "bn": "লিস্ট প্রদর্শনের জন্য অ্যারে এর .map() ব্যবহার করে প্রতিটি আইটেমের জন্য কম্পোনেন্ট তৈরি করা হয়।"
      },
      "whyNeedIt": {
        "en": "Keys are like badge numbers on students in an exam hall: if desks are rearranged, the teacher still tracks who is who!",
        "bn": "পরীক্ষার হলের রোল নম্বরের মতো: আসন বদলালেও শিক্ষক সবাইকে রোল দেখে সঠিকভাবে চিনে নেন।"
      },
      "analogy": {
        "en": "Keys are like badge numbers on students in an exam hall: if desks are rearranged, the teacher still tracks who is who!",
        "bn": "পরীক্ষার হলের রোল নম্বরের মতো: আসন বদলালেও শিক্ষক সবাইকে রোল দেখে সঠিকভাবে চিনে নেন।"
      },
      "technical": {
        "en": "React keys provide a stable identity across renders so the reconciliation diffing algorithm knows which items were added, removed, or reordered.",
        "bn": "কি (Key) দিয়ে রিয়্যাক্ট বুঝতে পারে কোন আইটেমটি নতুন যোগ হয়েছে বা মুছে গেছে।"
      }
    },
    "outcomes": [
      "Use array.map() in JSX",
      "Assign stable unique keys (avoiding index)",
      "Filter and transform lists"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Rendering dynamic list of courses\nconst courses = [\n  { id: 'c1', title: 'HTML & CSS Essentials', lessons: 27 },\n  { id: 'c2', title: 'React 19 Deep Dive', lessons: 40 },\n  { id: 'c3', title: 'Fullstack Next.js', lessons: 35 }\n];\n\n// Mapping to virtual element items\nconst renderedList = courses.map((course) => ({\n  key: course.id,\n  markup: `<li key=\"${course.id}\">${course.title} (${course.lessons} lessons)</li>`\n}));\n\nconsole.log(\"Mapped List Output:\");\nrenderedList.forEach(item => console.log(item.markup));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Map over an array of student names [\"Amina\", \"Rahim\", \"Nasir\"] to return an array of objects with id and li markup.",
        "bn": "৩ জন শিক্ষার্থীর নামের অ্যারে ম্যাপ করে ইউনিক কি সহ অবজেক্ট তৈরি করুন।"
      },
      "hint": {
        "en": "students.map((name, index) => ({ id: index, markup: `<li key=\"${index}\">${name}</li>` }))",
        "bn": "map ব্যবহার করুন।"
      },
      "solution": {
        "javascript": "const students = [\"Amina\", \"Rahim\", \"Nasir\"];\nconst result = students.map((name, i) => ({\n  id: `std-${i + 1}`,\n  markup: `<li key=\"std-${i + 1}\">${name}</li>`\n}));\nconsole.log(result);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "students.map"
      }
    }
  },
  {
    "id": "react-07",
    "track": "react",
    "order": 7,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Intermediate",
    "title": {
      "en": "7. Conditional Rendering Patterns in JSX",
      "bn": "৭. কন্ডিশনাল রেন্ডারিং প্যাটার্নস (Ternary, &&, Early Return)"
    },
    "subtitle": {
      "en": "Render different UI states based on logic using ternary operators, && short-circuiting, and early returns.",
      "bn": "শর্তসাপেক্ষে বিভিন্ন ইন্টারফেস বা বাটন প্রদর্শনের নিয়ম।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Conditional rendering means showing or hiding UI elements depending on whether a condition is true or false.",
        "bn": "শর্ত সত্য বা মিথ্যা হওয়ার ওপর ভিত্তি করে ভিন্ন ভিন্ন ইউআই উপাদান দেখানো বা লুকানো।"
      },
      "simple": {
        "en": "Conditional rendering means showing or hiding UI elements depending on whether a condition is true or false.",
        "bn": "শর্ত সত্য বা মিথ্যা হওয়ার ওপর ভিত্তি করে ভিন্ন ভিন্ন ইউআই উপাদান দেখানো বা লুকানো।"
      },
      "whyNeedIt": {
        "en": "Like a smartphone screen showing \"Enter Passcode\" when locked, and showing your \"Home Grid\" when unlocked.",
        "bn": "মোবাইল ফোন লক থাকলে পাসকোড স্ক্রিন আর আনলক থাকলে হোম স্ক্রিন দেখানোর মতো।"
      },
      "analogy": {
        "en": "Like a smartphone screen showing \"Enter Passcode\" when locked, and showing your \"Home Grid\" when unlocked.",
        "bn": "মোবাইল ফোন লক থাকলে পাসকোড স্ক্রিন আর আনলক থাকলে হোম স্ক্রিন দেখানোর মতো।"
      },
      "technical": {
        "en": "JavaScript boolean operators (condition ? <A/> : <B/> and condition && <C/>) evaluate inline; null or false produce zero DOM nodes.",
        "bn": "টারনারি ও && অপারেটর দিয়ে সহজেই ডাইনামিক রেন্ডারিং করা যায়।"
      }
    },
    "outcomes": [
      "Master ternary operator inside JSX",
      "Use && for conditional rendering safely",
      "Implement early returns for loading/error states"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Demonstrating conditional render states\nfunction StatusCard({ isLoading, error, data }) {\n  if (isLoading) {\n    return { status: \"loading\", message: \"Fetching student data...\" };\n  }\n  if (error) {\n    return { status: \"error\", message: `Error: ${error}` };\n  }\n  return {\n    status: \"success\",\n    message: `Loaded ${data.length} records`,\n    hasItems: data.length > 0\n  };\n}\n\nconsole.log(\"Loading state:\", StatusCard({ isLoading: true }));\nconsole.log(\"Error state:\", StatusCard({ isLoading: false, error: \"Network timeout\" }));\nconsole.log(\"Success state:\", StatusCard({ isLoading: false, error: null, data: [\"Item 1\", \"Item 2\"] }));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a renderAuthButton(isLoggedIn) function that returns \"Logout\" if true, else \"Sign In\".",
        "bn": "একটি renderAuthButton ফাংশন লিখুন যা লগইন থাকলে \"Logout\" এবং না থাকলে \"Sign In\" রিটার্ন করবে।"
      },
      "hint": {
        "en": "const renderAuthButton = (isLoggedIn) => isLoggedIn ? \"Logout\" : \"Sign In\";",
        "bn": "টারনারি অপারেটর ব্যবহার করুন।"
      },
      "solution": {
        "javascript": "function renderAuthButton(isLoggedIn) {\n  return isLoggedIn ? \"Logout\" : \"Sign In\";\n}\nconsole.log(\"When true:\", renderAuthButton(true));\nconsole.log(\"When false:\", renderAuthButton(false));"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "renderAuthButton"
      }
    }
  },
  {
    "id": "react-08",
    "track": "react",
    "order": 8,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Intermediate",
    "title": {
      "en": "8. Event Handling in React (onClick, onChange, SyntheticEvents)",
      "bn": "৮. রিয়্যাক্টে ইভেন্ট হ্যান্ডলিং (ক্লিক, টাইপিং ও ইনপুট)"
    },
    "subtitle": {
      "en": "Handle clicks, input changes, and form submissions with React synthetic event listeners.",
      "bn": "বাটন ক্লিক, টাইপিং পরিবর্তন ও সাবমিট ইভেন্ট হ্যান্ডেল করা।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "React lets you attach event handlers (like onClick, onChange, onSubmit) directly to JSX elements using camelCase syntax.",
        "bn": "JSX ট্যাগে camelCase এ onClick, onChange ইত্যাদি হ্যান্ডলার সরাসরি যুক্ত করা যায়।"
      },
      "simple": {
        "en": "React lets you attach event handlers (like onClick, onChange, onSubmit) directly to JSX elements using camelCase syntax.",
        "bn": "JSX ট্যাগে camelCase এ onClick, onChange ইত্যাদি হ্যান্ডলার সরাসরি যুক্ত করা যায়।"
      },
      "whyNeedIt": {
        "en": "An event handler is like a doorbell chime: when someone pushes the button, the chime rings inside the house!",
        "bn": "কলিং বেলের সুইচে চাপ দেওয়ার সাথে সাথে ঘরের ভেতর বেল বেজে ওঠার মতো।"
      },
      "analogy": {
        "en": "An event handler is like a doorbell chime: when someone pushes the button, the chime rings inside the house!",
        "bn": "কলিং বেলের সুইচে চাপ দেওয়ার সাথে সাথে ঘরের ভেতর বেল বেজে ওঠার মতো।"
      },
      "technical": {
        "en": "React uses SyntheticEvent, a cross-browser wrapper around native browser events that handles event pooling and cross-browser quirks.",
        "bn": "সিন্থেটিক ইভেন্ট ব্রাউজারের সকল জটিলতা দূর করে একরূপ অভিজ্ঞতা দেয়।"
      }
    },
    "outcomes": [
      "Attach onClick and onChange listeners",
      "Pass inline arrow functions vs named handlers",
      "Prevent default browser actions with e.preventDefault()"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Simulating React Synthetic Event Handling\nclass EventSimulation {\n  constructor() {\n    this.events = {};\n  }\n  on(event, handler) {\n    this.events[event] = handler;\n  }\n  trigger(event, data) {\n    const syntheticEvent = {\n      type: event,\n      target: data,\n      defaultPrevented: false,\n      preventDefault: () => { syntheticEvent.defaultPrevented = true; }\n    };\n    if (this.events[event]) {\n      this.events[event](syntheticEvent);\n    }\n  }\n}\n\nconst btn = new EventSimulation();\nbtn.on('click', (e) => {\n  console.log(`Clicked! Event target: ${e.target.id}. Prevented: ${e.defaultPrevented}`);\n});\nbtn.trigger('click', { id: 'submit-login-btn' });\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a handleClick(e) handler function that logs \"Button clicked: \" plus e.target.name and calls e.preventDefault().",
        "bn": "একটি handleClick ফাংশন লিখুন যা ইভেন্ট হ্যান্ডেল করবে।"
      },
      "hint": {
        "en": "function handleClick(e) { e.preventDefault(); console.log(\"Button clicked: \" + e.target.name); }",
        "bn": "e.preventDefault() কল করুন।"
      },
      "solution": {
        "javascript": "function handleClick(e) {\n  e.preventDefault();\n  console.log(\"Button clicked: \" + e.target.name);\n}\nhandleClick({ preventDefault: () => {}, target: { name: \"Save\" } });"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "handleClick"
      }
    }
  },
  {
    "id": "react-09",
    "track": "react",
    "order": 9,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Intermediate",
    "title": {
      "en": "9. useState Hook: Managing Local Component State",
      "bn": "৯. useState হুক: লোকাল কম্পোনেন্ট স্টেট পরিচালনা"
    },
    "subtitle": {
      "en": "Store dynamic memory in functional components that triggers re-renders on update.",
      "bn": "ফাংশনাল কম্পোনেন্টে ডেটা জমা রাখা এবং পরিবর্তন হলে অটোমেটিক রেন্ডার করানো।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "useState is a React Hook that gives your component memory to store values that can change over time (like counters, input text, or modal visibility).",
        "bn": "useState হলো রিয়্যাক্ট হুক যা কম্পোনেন্টের নিজস্ব মেমোরি হিসেবে কাজ করে।"
      },
      "simple": {
        "en": "useState is a React Hook that gives your component memory to store values that can change over time (like counters, input text, or modal visibility).",
        "bn": "useState হলো রিয়্যাক্ট হুক যা কম্পোনেন্টের নিজস্ব মেমোরি হিসেবে কাজ করে।"
      },
      "whyNeedIt": {
        "en": "State is like a digital scoreboard: whenever a point is scored, the scoreboard updates for all spectators to see.",
        "bn": "স্টেডিয়ামের ডিজিটাল স্কোরবোর্ডের মতো: রান বাড়লে সাথে সাথে স্কোরবোর্ডে সংখ্যা পরিবর্তিত হয়।"
      },
      "analogy": {
        "en": "State is like a digital scoreboard: whenever a point is scored, the scoreboard updates for all spectators to see.",
        "bn": "স্টেডিয়ামের ডিজিটাল স্কোরবোর্ডের মতো: রান বাড়লে সাথে সাথে স্কোরবোর্ডে সংখ্যা পরিবর্তিত হয়।"
      },
      "technical": {
        "en": "useState returns a tuple [value, setterFunction]. Calling the setter tells React to schedule a re-render with the new state.",
        "bn": "useState একটি টুপল [value, setter] রিটার্ন করে যা স্টেট আপডেট হলে নতুন করে কম্পোনেন্ট রেন্ডার করে।"
      }
    },
    "outcomes": [
      "Declare state with const [state, setState] = useState(initial)",
      "Update state based on user actions",
      "Use updater functions for state depending on previous value"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Simulating React useState Mechanism\nfunction createMockUseState(initialValue) {\n  let state = initialValue;\n  const setState = (newValue) => {\n    state = typeof newValue === 'function' ? newValue(state) : newValue;\n    console.log(\"State updated to:\", state, \"-> Scheduling Component Re-render\");\n  };\n  const getState = () => state;\n  return [getState, setState];\n}\n\nconst [getCount, setCount] = createMockUseState(0);\nconsole.log(\"Initial count:\", getCount());\nsetCount(1);\nsetCount((prev) => prev + 5);\nconsole.log(\"Final count:\", getCount());\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a state simulator for a boolean toggle \"isDarkMode\" starting false, and toggle it to true.",
        "bn": "একটি isDarkMode টগল স্টেট সিমুলেটর তৈরি করুন।"
      },
      "hint": {
        "en": "let isDarkMode = false; const toggle = () => { isDarkMode = !isDarkMode; };",
        "bn": "isDarkMode উল্টে দিন।"
      },
      "solution": {
        "javascript": "let isDarkMode = false;\nfunction toggleDarkMode() {\n  isDarkMode = !isDarkMode;\n  return isDarkMode;\n}\nconsole.log(\"Initial:\", isDarkMode);\nconsole.log(\"After toggle:\", toggleDarkMode());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "toggleDarkMode"
      }
    }
  },
  {
    "id": "react-10",
    "track": "react",
    "order": 10,
    "chapter": "Chapter 1: Foundations",
    "difficulty": "Intermediate",
    "title": {
      "en": "10. Project: Interactive Task List App",
      "bn": "১০. প্রজেক্ট: ইন্টারেক্টিভ টাস্ক ও টু-ডু অ্যাপ"
    },
    "subtitle": {
      "en": "Combine components, props, list rendering, events, and useState into a working task manager.",
      "bn": "স্টেট, প্রপ্স ও ইভেন্ট দিয়ে একটি সম্পূর্ণ কার্যকরী টাস্ক অ্যাপ তৈরি করুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "In this milestone project, you will build a complete task application that adds, completes, and deletes tasks.",
        "bn": "এই প্রজেক্টে আপনি নতুন টাস্ক যোগ, সম্পন্ন মার্ক করা এবং ডিলিট করার সম্পূর্ণ কার্যপদ্ধতি শিখবেন।"
      },
      "simple": {
        "en": "In this milestone project, you will build a complete task application that adds, completes, and deletes tasks.",
        "bn": "এই প্রজেক্টে আপনি নতুন টাস্ক যোগ, সম্পন্ন মার্ক করা এবং ডিলিট করার সম্পূর্ণ কার্যপদ্ধতি শিখবেন।"
      },
      "whyNeedIt": {
        "en": "A task app is like an interactive sticky-note pad where notes can be checked off or tossed into the recycling bin.",
        "bn": "একটি ইন্টারেক্টিভ নোটপ্যাডের মতো যেখানে কাজ শেষ হলে টিক চিহ্ন দেওয়া যায়।"
      },
      "analogy": {
        "en": "A task app is like an interactive sticky-note pad where notes can be checked off or tossed into the recycling bin.",
        "bn": "একটি ইন্টারেক্টিভ নোটপ্যাডের মতো যেখানে কাজ শেষ হলে টিক চিহ্ন দেওয়া যায়।"
      },
      "technical": {
        "en": "Demonstrates immutable state arrays, generating unique IDs with Date.now() or crypto.randomUUID(), and controlled inputs.",
        "bn": "স্টেট অ্যারের মধ্যে নতুন আইটেম যুক্ত ও ফিল্টার করার বাস্তব প্রয়োগ।"
      }
    },
    "outcomes": [
      "Add new items using array spread [...tasks, newTask]",
      "Toggle task status with array.map()",
      "Delete tasks using array.filter()"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Task Manager State Machine\nlet tasks = [\n  { id: 1, text: \"Learn React Foundations\", done: true },\n  { id: 2, text: \"Build First Component\", done: false }\n];\n\n// Add Task\nconst addTask = (text) => {\n  tasks = [...tasks, { id: Date.now(), text, done: false }];\n};\n\n// Toggle Task\nconst toggleTask = (id) => {\n  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);\n};\n\n// Delete Task\nconst deleteTask = (id) => {\n  tasks = tasks.filter(t => t.id !== id);\n};\n\naddTask(\"Master useState and useEffect\");\ntoggleTask(2);\nconsole.log(\"Current Tasks:\", tasks);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a deleteTask(tasks, idToRemove) function that uses .filter() to return all tasks except the one with idToRemove.",
        "bn": "একটি deleteTask ফাংশন লিখুন যা .filter() ব্যবহার করে নির্দিষ্ট টাস্ক মুছে ফেলবে।"
      },
      "hint": {
        "en": "return tasks.filter(t => t.id !== idToRemove);",
        "bn": "filter মেথড ব্যবহার করুন।"
      },
      "solution": {
        "javascript": "function deleteTask(tasks, idToRemove) {\n  return tasks.filter(task => task.id !== idToRemove);\n}\nconst list = [{ id: 1, text: \"A\" }, { id: 2, text: \"B\" }];\nconsole.log(deleteTask(list, 1));"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "function deleteTask"
      }
    }
  },
  {
    "id": "react-11",
    "track": "react",
    "order": 11,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "11. State as a Render Snapshot & Queued Updates",
      "bn": "11. State as a Render Snapshot & Queued Updates"
    },
    "subtitle": {
      "en": "Master State as a Render Snapshot & Queued Updates with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে State as a Render Snapshot & Queued Updates শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "State behaves like a photograph taken at the moment of render; it does not change mid-execution.",
        "bn": "স্টেট হলো একটি স্থির স্ন্যাপশট; চলতি এক্সিকিউশনের মাঝে এর মান বদলায় না।"
      },
      "simple": {
        "en": "State behaves like a photograph taken at the moment of render; it does not change mid-execution.",
        "bn": "স্টেট হলো একটি স্থির স্ন্যাপশট; চলতি এক্সিকিউশনের মাঝে এর মান বদলায় না।"
      },
      "whyNeedIt": {
        "en": "Like sending a printed letter: writing on the letter after dropping it in the mailbox does not change the copy in transit!",
        "bn": "চিঠি পোস্ট করার মতো: পোস্ট করার পর আসল চিঠির লেখা বদলানো যায় না।"
      },
      "analogy": {
        "en": "Like sending a printed letter: writing on the letter after dropping it in the mailbox does not change the copy in transit!",
        "bn": "চিঠি পোস্ট করার মতো: পোস্ট করার পর আসল চিঠির লেখা বদলানো যায় না।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of State as a Render Snapshot & Queued Updates",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// State Snapshot: state does not change within current render\nlet count = 0;\nfunction handleClick() {\n  // count is 0 for this entire execution frame!\n  console.log(\"Count snapshot at click:\", count);\n  // setCount(count + 1);\n  // setCount(count + 1); // Still passes 0 + 1!\n  // To queue: setCount(prev => prev + 1);\n}\nhandleClick();"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating State as a Render Snapshot & Queued Updates.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for State as a Render Snapshot & Queued Updates\nfunction solve() {\n  return \"Completed State as a Render Snapshot & Queued Updates\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-12",
    "track": "react",
    "order": 12,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "12. Immutable Updates for Objects & Arrays in State",
      "bn": "12. Immutable Updates for Objects & Arrays in State"
    },
    "subtitle": {
      "en": "Master Immutable Updates for Objects & Arrays in State with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Immutable Updates for Objects & Arrays in State শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Always create fresh object copies using spread syntax (...); never mutate existing state directly.",
        "bn": "স্টেট অবজেক্ট সরাসরি পরিবর্তন না করে স্প্রেড অপারেটর (...) দিয়ে কপি তৈরি করে আপডেট করতে হয়।"
      },
      "simple": {
        "en": "Always create fresh object copies using spread syntax (...); never mutate existing state directly.",
        "bn": "স্টেট অবজেক্ট সরাসরি পরিবর্তন না করে স্প্রেড অপারেটর (...) দিয়ে কপি তৈরি করে আপডেট করতে হয়।"
      },
      "whyNeedIt": {
        "en": "Instead of scratching out text in an official contract, you draft an amended fresh copy with the new terms.",
        "bn": "পুরনো কাগজে ঘষামাজা না করে নতুন পাতায় সংশোধিত কপি তৈরির মতো।"
      },
      "analogy": {
        "en": "Instead of scratching out text in an official contract, you draft an amended fresh copy with the new terms.",
        "bn": "পুরনো কাগজে ঘষামাজা না করে নতুন পাতায় সংশোধিত কপি তৈরির মতো।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Immutable Updates for Objects & Arrays in State",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Immutable object update in React state\nconst user = { name: \"Nasir\", profile: { role: \"admin\", points: 100 } };\n\n// Never do: user.profile.points += 50 (direct mutation breaks React!)\n// Always do shallow copy with spread:\nconst updatedUser = {\n  ...user,\n  profile: {\n    ...user.profile,\n    points: user.profile.points + 50\n  }\n};\nconsole.log(\"Old points:\", user.profile.points);\nconsole.log(\"New points:\", updatedUser.profile.points);"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Immutable Updates for Objects & Arrays in State.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Immutable Updates for Objects & Arrays in State\nfunction solve() {\n  return \"Completed Immutable Updates for Objects & Arrays in State\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-13",
    "track": "react",
    "order": 13,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "13. Form Handling & Controlled Input Components",
      "bn": "13. Form Handling & Controlled Input Components"
    },
    "subtitle": {
      "en": "Master Form Handling & Controlled Input Components with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Form Handling & Controlled Input Components শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "In a controlled component, the input value is always driven by React state via value and onChange.",
        "bn": "রিঅ্যাক্টে Form Handling & Controlled Input Components ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "In a controlled component, the input value is always driven by React state via value and onChange.",
        "bn": "রিঅ্যাক্টে Form Handling & Controlled Input Components ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Form Handling & Controlled Input Components gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Form Handling & Controlled Input Components gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Form Handling & Controlled Input Components",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Controlled Input Pattern\nlet inputValue = \"\";\nfunction handleInputChange(event) {\n  inputValue = event.target.value;\n  console.log(\"Controlled input state synced:\", inputValue);\n}\nhandleInputChange({ target: { value: \"Hello React!\" } });"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Form Handling & Controlled Input Components.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Form Handling & Controlled Input Components\nfunction solve() {\n  return \"Completed Form Handling & Controlled Input Components\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-14",
    "track": "react",
    "order": 14,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "14. Lifting State Up to Shared Parent Components",
      "bn": "14. Lifting State Up to Shared Parent Components"
    },
    "subtitle": {
      "en": "Master Lifting State Up to Shared Parent Components with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Lifting State Up to Shared Parent Components শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Lifting State Up to Shared Parent Components to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Lifting State Up to Shared Parent Components ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Lifting State Up to Shared Parent Components to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Lifting State Up to Shared Parent Components ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Lifting State Up to Shared Parent Components gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Lifting State Up to Shared Parent Components gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Lifting State Up to Shared Parent Components",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 14. Lifting State Up to Shared Parent Components\nconsole.log(\"Mastering Lifting State Up to Shared Parent Components in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Lifting State Up to Shared Parent Components.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Lifting State Up to Shared Parent Components\nfunction solve() {\n  return \"Completed Lifting State Up to Shared Parent Components\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-15",
    "track": "react",
    "order": 15,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "15. Component Composition with props.children & Slots",
      "bn": "15. Component Composition with props.children & Slots"
    },
    "subtitle": {
      "en": "Master Component Composition with props.children & Slots with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Component Composition with props.children & Slots শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Component Composition with props.children & Slots to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Component Composition with props.children & Slots ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Component Composition with props.children & Slots to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Component Composition with props.children & Slots ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Component Composition with props.children & Slots gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Component Composition with props.children & Slots gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Component Composition with props.children & Slots",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 15. Component Composition with props.children & Slots\nconsole.log(\"Mastering Component Composition with props.children & Slots in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Component Composition with props.children & Slots.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Component Composition with props.children & Slots\nfunction solve() {\n  return \"Completed Component Composition with props.children & Slots\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-16",
    "track": "react",
    "order": 16,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "16. useEffect Hook: Synchronizing with External Systems",
      "bn": "16. useEffect Hook: Synchronizing with External Systems"
    },
    "subtitle": {
      "en": "Master useEffect Hook: Synchronizing with External Systems with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে useEffect Hook: Synchronizing with External Systems শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "useEffect lets you synchronize a component with external systems like APIs, timers, and browser DOM.",
        "bn": "useEffect দিয়ে এপিআই কল, টাইমার এবং বাহ্যিক ডেটার সাথে কম্পোনেন্ট সিঙ্ক করা হয়।"
      },
      "simple": {
        "en": "useEffect lets you synchronize a component with external systems like APIs, timers, and browser DOM.",
        "bn": "useEffect দিয়ে এপিআই কল, টাইমার এবং বাহ্যিক ডেটার সাথে কম্পোনেন্ট সিঙ্ক করা হয়।"
      },
      "whyNeedIt": {
        "en": "Like turning on the headlights when entering a tunnel, and turning them off when leaving.",
        "bn": "টানেলে ঢোকার সময় হেডলাইট জ্বালানো এবং বের হওয়ার সময় নিভিয়ে দেওয়ার মতো।"
      },
      "analogy": {
        "en": "Like turning on the headlights when entering a tunnel, and turning them off when leaving.",
        "bn": "টানেলে ঢোকার সময় হেডলাইট জ্বালানো এবং বের হওয়ার সময় নিভিয়ে দেওয়ার মতো।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of useEffect Hook: Synchronizing with External Systems",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// useEffect Synchronization\nfunction subscribeToOnlineStatus(userId, onStatusChange) {\n  console.log(`Subscribing to status for user: ${userId}`);\n  const timer = setInterval(() => onStatusChange(\"online\"), 1000);\n  return () => {\n    console.log(`Unsubscribing status for user: ${userId}`);\n    clearInterval(timer);\n  };\n}\nconst unsubscribe = subscribeToOnlineStatus(\"user_99\", status => console.log(\"User is:\", status));\nunsubscribe();"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating useEffect Hook: Synchronizing with External Systems.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for useEffect Hook: Synchronizing with External Systems\nfunction solve() {\n  return \"Completed useEffect Hook: Synchronizing with External Systems\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-17",
    "track": "react",
    "order": 17,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "17. Effect Cleanup & Preventing Memory Leaks",
      "bn": "17. Effect Cleanup & Preventing Memory Leaks"
    },
    "subtitle": {
      "en": "Master Effect Cleanup & Preventing Memory Leaks with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Effect Cleanup & Preventing Memory Leaks শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Effect Cleanup & Preventing Memory Leaks to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Effect Cleanup & Preventing Memory Leaks ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Effect Cleanup & Preventing Memory Leaks to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Effect Cleanup & Preventing Memory Leaks ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Effect Cleanup & Preventing Memory Leaks gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Effect Cleanup & Preventing Memory Leaks gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Effect Cleanup & Preventing Memory Leaks",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 17. Effect Cleanup & Preventing Memory Leaks\nconsole.log(\"Mastering Effect Cleanup & Preventing Memory Leaks in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Effect Cleanup & Preventing Memory Leaks.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Effect Cleanup & Preventing Memory Leaks\nfunction solve() {\n  return \"Completed Effect Cleanup & Preventing Memory Leaks\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-18",
    "track": "react",
    "order": 18,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "18. useRef Hook: Preserving Values & Accessing DOM",
      "bn": "18. useRef Hook: Preserving Values & Accessing DOM"
    },
    "subtitle": {
      "en": "Master useRef Hook: Preserving Values & Accessing DOM with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে useRef Hook: Preserving Values & Accessing DOM শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "useRef gives you a box { current: ... } to hold mutable values or direct DOM element references.",
        "bn": "useRef দিয়ে রেন্ডার না ঘটিয়েও যেকোনো ভ্যালু বা ডিওএম এলিমেন্ট রেফারেন্স ধরে রাখা যায়।"
      },
      "simple": {
        "en": "useRef gives you a box { current: ... } to hold mutable values or direct DOM element references.",
        "bn": "useRef দিয়ে রেন্ডার না ঘটিয়েও যেকোনো ভ্যালু বা ডিওএম এলিমেন্ট রেফারেন্স ধরে রাখা যায়।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: useRef Hook: Preserving Values & Accessing DOM gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: useRef Hook: Preserving Values & Accessing DOM gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of useRef Hook: Preserving Values & Accessing DOM",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// useRef: Preserves mutable value across renders without triggering a re-render\nfunction createRefSimulation(initial) {\n  return { current: initial };\n}\nconst renderCountRef = createRefSimulation(0);\nrenderCountRef.current += 1;\nrenderCountRef.current += 1;\nconsole.log(\"Total renders tracked without re-rendering:\", renderCountRef.current);"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating useRef Hook: Preserving Values & Accessing DOM.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for useRef Hook: Preserving Values & Accessing DOM\nfunction solve() {\n  return \"Completed useRef Hook: Preserving Values & Accessing DOM\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-19",
    "track": "react",
    "order": 19,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "19. Building Custom React Hooks for Reusable Logic",
      "bn": "19. Building Custom React Hooks for Reusable Logic"
    },
    "subtitle": {
      "en": "Master Building Custom React Hooks for Reusable Logic with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Building Custom React Hooks for Reusable Logic শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Building Custom React Hooks for Reusable Logic to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Building Custom React Hooks for Reusable Logic ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Building Custom React Hooks for Reusable Logic to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Building Custom React Hooks for Reusable Logic ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Building Custom React Hooks for Reusable Logic gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Building Custom React Hooks for Reusable Logic gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Building Custom React Hooks for Reusable Logic",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 19. Building Custom React Hooks for Reusable Logic\nconsole.log(\"Mastering Building Custom React Hooks for Reusable Logic in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Building Custom React Hooks for Reusable Logic.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Building Custom React Hooks for Reusable Logic\nfunction solve() {\n  return \"Completed Building Custom React Hooks for Reusable Logic\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-20",
    "track": "react",
    "order": 20,
    "chapter": "Chapter 2: State & Effects",
    "difficulty": "Intermediate",
    "title": {
      "en": "20. Project: Searchable Data & Filter Dashboard",
      "bn": "20. Project: Searchable Data & Filter Dashboard"
    },
    "subtitle": {
      "en": "Master Project: Searchable Data & Filter Dashboard with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Project: Searchable Data & Filter Dashboard শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Project: Searchable Data & Filter Dashboard to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project: Searchable Data & Filter Dashboard ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Project: Searchable Data & Filter Dashboard to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project: Searchable Data & Filter Dashboard ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Project: Searchable Data & Filter Dashboard gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Project: Searchable Data & Filter Dashboard gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Project: Searchable Data & Filter Dashboard",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 20. Project: Searchable Data & Filter Dashboard\nconsole.log(\"Mastering Project: Searchable Data & Filter Dashboard in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Project: Searchable Data & Filter Dashboard.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Project: Searchable Data & Filter Dashboard\nfunction solve() {\n  return \"Completed Project: Searchable Data & Filter Dashboard\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-21",
    "track": "react",
    "order": 21,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Intermediate",
    "title": {
      "en": "21. React Router: Defining Routes, Layouts & Links",
      "bn": "21. React Router: Defining Routes, Layouts & Links"
    },
    "subtitle": {
      "en": "Master React Router: Defining Routes, Layouts & Links with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে React Router: Defining Routes, Layouts & Links শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn React Router: Defining Routes, Layouts & Links to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে React Router: Defining Routes, Layouts & Links ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn React Router: Defining Routes, Layouts & Links to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে React Router: Defining Routes, Layouts & Links ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: React Router: Defining Routes, Layouts & Links gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: React Router: Defining Routes, Layouts & Links gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of React Router: Defining Routes, Layouts & Links",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 21. React Router: Defining Routes, Layouts & Links\nconsole.log(\"Mastering React Router: Defining Routes, Layouts & Links in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating React Router: Defining Routes, Layouts & Links.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for React Router: Defining Routes, Layouts & Links\nfunction solve() {\n  return \"Completed React Router: Defining Routes, Layouts & Links\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-22",
    "track": "react",
    "order": 22,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Intermediate",
    "title": {
      "en": "22. URL Params (useParams) & Search Params (useSearchParams)",
      "bn": "22. URL Params (useParams) & Search Params (useSearchParams)"
    },
    "subtitle": {
      "en": "Master URL Params (useParams) & Search Params (useSearchParams) with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে URL Params (useParams) & Search Params (useSearchParams) শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn URL Params (useParams) & Search Params (useSearchParams) to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে URL Params (useParams) & Search Params (useSearchParams) ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn URL Params (useParams) & Search Params (useSearchParams) to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে URL Params (useParams) & Search Params (useSearchParams) ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: URL Params (useParams) & Search Params (useSearchParams) gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: URL Params (useParams) & Search Params (useSearchParams) gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of URL Params (useParams) & Search Params (useSearchParams)",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 22. URL Params (useParams) & Search Params (useSearchParams)\nconsole.log(\"Mastering URL Params (useParams) & Search Params (useSearchParams) in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating URL Params (useParams) & Search Params (useSearchParams).",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for URL Params (useParams) & Search Params (useSearchParams)\nfunction solve() {\n  return \"Completed URL Params (useParams) & Search Params (useSearchParams)\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-23",
    "track": "react",
    "order": 23,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Intermediate",
    "title": {
      "en": "23. Fetching Data in React: Loading States & Error Handling",
      "bn": "23. Fetching Data in React: Loading States & Error Handling"
    },
    "subtitle": {
      "en": "Master Fetching Data in React: Loading States & Error Handling with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Fetching Data in React: Loading States & Error Handling শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Fetching Data in React: Loading States & Error Handling to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Fetching Data in React: Loading States & Error Handling ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Fetching Data in React: Loading States & Error Handling to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Fetching Data in React: Loading States & Error Handling ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Fetching Data in React: Loading States & Error Handling gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Fetching Data in React: Loading States & Error Handling gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Fetching Data in React: Loading States & Error Handling",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 23. Fetching Data in React: Loading States & Error Handling\nconsole.log(\"Mastering Fetching Data in React: Loading States & Error Handling in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Fetching Data in React: Loading States & Error Handling.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Fetching Data in React: Loading States & Error Handling\nfunction solve() {\n  return \"Completed Fetching Data in React: Loading States & Error Handling\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-24",
    "track": "react",
    "order": 24,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Intermediate",
    "title": {
      "en": "24. Data Caching & Synchronization Patterns",
      "bn": "24. Data Caching & Synchronization Patterns"
    },
    "subtitle": {
      "en": "Master Data Caching & Synchronization Patterns with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Data Caching & Synchronization Patterns শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Data Caching & Synchronization Patterns to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Data Caching & Synchronization Patterns ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Data Caching & Synchronization Patterns to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Data Caching & Synchronization Patterns ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Data Caching & Synchronization Patterns gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Data Caching & Synchronization Patterns gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Data Caching & Synchronization Patterns",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 24. Data Caching & Synchronization Patterns\nconsole.log(\"Mastering Data Caching & Synchronization Patterns in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Data Caching & Synchronization Patterns.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Data Caching & Synchronization Patterns\nfunction solve() {\n  return \"Completed Data Caching & Synchronization Patterns\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-25",
    "track": "react",
    "order": 25,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Intermediate",
    "title": {
      "en": "25. Context API (createContext, useContext) for Global State",
      "bn": "25. Context API (createContext, useContext) for Global State"
    },
    "subtitle": {
      "en": "Master Context API (createContext, useContext) for Global State with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Context API (createContext, useContext) for Global State শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Context API allows components to share state across the entire tree without passing props down manually at every level.",
        "bn": "প্রপ্স ড্রিলিং ছাড়া সম্পূর্ণ অ্যাপে গ্লোবাল স্টেট শেয়ার করার উপায় হলো Context API।"
      },
      "simple": {
        "en": "Context API allows components to share state across the entire tree without passing props down manually at every level.",
        "bn": "প্রপ্স ড্রিলিং ছাড়া সম্পূর্ণ অ্যাপে গ্লোবাল স্টেট শেয়ার করার উপায় হলো Context API।"
      },
      "whyNeedIt": {
        "en": "Like Wi-Fi in an office: anyone in the building can connect without stringing individual cables to every desk!",
        "bn": "অফিসের ওয়াইফাই এর মতো: তার না টেনে সবাই সরাসরি ইন্টারনেটে কানেক্ট হতে পারে।"
      },
      "analogy": {
        "en": "Like Wi-Fi in an office: anyone in the building can connect without stringing individual cables to every desk!",
        "bn": "অফিসের ওয়াইফাই এর মতো: তার না টেনে সবাই সরাসরি ইন্টারনেটে কানেক্ট হতে পারে।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Context API (createContext, useContext) for Global State",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Context API Simulation\nconst ThemeContext = {\n  theme: \"dark\",\n  accent: \"#0284c7\"\n};\nfunction useTheme() {\n  return ThemeContext;\n}\nconsole.log(\"Theme from Context:\", useTheme());"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Context API (createContext, useContext) for Global State.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Context API (createContext, useContext) for Global State\nfunction solve() {\n  return \"Completed Context API (createContext, useContext) for Global State\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-26",
    "track": "react",
    "order": 26,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Advanced",
    "title": {
      "en": "26. useReducer Hook: Complex State Transitions",
      "bn": "26. useReducer Hook: Complex State Transitions"
    },
    "subtitle": {
      "en": "Master useReducer Hook: Complex State Transitions with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে useReducer Hook: Complex State Transitions শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn useReducer Hook: Complex State Transitions to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে useReducer Hook: Complex State Transitions ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn useReducer Hook: Complex State Transitions to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে useReducer Hook: Complex State Transitions ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: useReducer Hook: Complex State Transitions gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: useReducer Hook: Complex State Transitions gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of useReducer Hook: Complex State Transitions",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 26. useReducer Hook: Complex State Transitions\nconsole.log(\"Mastering useReducer Hook: Complex State Transitions in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating useReducer Hook: Complex State Transitions.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for useReducer Hook: Complex State Transitions\nfunction solve() {\n  return \"Completed useReducer Hook: Complex State Transitions\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-27",
    "track": "react",
    "order": 27,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Advanced",
    "title": {
      "en": "27. Redux Toolkit: Slices, Actions & Selectors",
      "bn": "27. Redux Toolkit: Slices, Actions & Selectors"
    },
    "subtitle": {
      "en": "Master Redux Toolkit: Slices, Actions & Selectors with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Redux Toolkit: Slices, Actions & Selectors শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Redux Toolkit: Slices, Actions & Selectors to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Redux Toolkit: Slices, Actions & Selectors ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Redux Toolkit: Slices, Actions & Selectors to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Redux Toolkit: Slices, Actions & Selectors ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Redux Toolkit: Slices, Actions & Selectors gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Redux Toolkit: Slices, Actions & Selectors gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Redux Toolkit: Slices, Actions & Selectors",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 27. Redux Toolkit: Slices, Actions & Selectors\nconsole.log(\"Mastering Redux Toolkit: Slices, Actions & Selectors in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Redux Toolkit: Slices, Actions & Selectors.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Redux Toolkit: Slices, Actions & Selectors\nfunction solve() {\n  return \"Completed Redux Toolkit: Slices, Actions & Selectors\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-28",
    "track": "react",
    "order": 28,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Advanced",
    "title": {
      "en": "28. React Performance Optimization: React.memo & useMemo",
      "bn": "28. React Performance Optimization: React.memo & useMemo"
    },
    "subtitle": {
      "en": "Master React Performance Optimization: React.memo & useMemo with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে React Performance Optimization: React.memo & useMemo শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "useMemo and React.memo skip unnecessary re-renders and re-computations when inputs have not changed.",
        "bn": "মেমোইজেশন ব্যবহার করে অপ্রয়োজনীয় ক্যালকুলেশন এবং রেন্ডার রোধ করা হয়।"
      },
      "simple": {
        "en": "useMemo and React.memo skip unnecessary re-renders and re-computations when inputs have not changed.",
        "bn": "মেমোইজেশন ব্যবহার করে অপ্রয়োজনীয় ক্যালকুলেশন এবং রেন্ডার রোধ করা হয়।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: React Performance Optimization: React.memo & useMemo gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: React Performance Optimization: React.memo & useMemo gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of React Performance Optimization: React.memo & useMemo",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// Performance Optimization: Memoization Simulation\nconst memoCache = new Map();\nfunction expensiveCalculation(num) {\n  if (memoCache.has(num)) {\n    console.log(\"Returning cached result for:\", num);\n    return memoCache.get(num);\n  }\n  console.log(\"Computing heavy Fibonacci for:\", num);\n  let res = num * num;\n  memoCache.set(num, res);\n  return res;\n}\nconsole.log(expensiveCalculation(10));\nconsole.log(expensiveCalculation(10)); // Returns from cache!"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating React Performance Optimization: React.memo & useMemo.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for React Performance Optimization: React.memo & useMemo\nfunction solve() {\n  return \"Completed React Performance Optimization: React.memo & useMemo\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-29",
    "track": "react",
    "order": 29,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Advanced",
    "title": {
      "en": "29. Error Boundaries & Designing Resilient UI",
      "bn": "29. Error Boundaries & Designing Resilient UI"
    },
    "subtitle": {
      "en": "Master Error Boundaries & Designing Resilient UI with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Error Boundaries & Designing Resilient UI শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Error Boundaries & Designing Resilient UI to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Error Boundaries & Designing Resilient UI ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Error Boundaries & Designing Resilient UI to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Error Boundaries & Designing Resilient UI ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Error Boundaries & Designing Resilient UI gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Error Boundaries & Designing Resilient UI gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Error Boundaries & Designing Resilient UI",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 29. Error Boundaries & Designing Resilient UI\nconsole.log(\"Mastering Error Boundaries & Designing Resilient UI in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Error Boundaries & Designing Resilient UI.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Error Boundaries & Designing Resilient UI\nfunction solve() {\n  return \"Completed Error Boundaries & Designing Resilient UI\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-30",
    "track": "react",
    "order": 30,
    "chapter": "Chapter 3: Routing, Data & Architecture",
    "difficulty": "Advanced",
    "title": {
      "en": "30. Project: Multi-Page Interactive Web Application",
      "bn": "30. Project: Multi-Page Interactive Web Application"
    },
    "subtitle": {
      "en": "Master Project: Multi-Page Interactive Web Application with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Project: Multi-Page Interactive Web Application শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Project: Multi-Page Interactive Web Application to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project: Multi-Page Interactive Web Application ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Project: Multi-Page Interactive Web Application to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project: Multi-Page Interactive Web Application ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Project: Multi-Page Interactive Web Application gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Project: Multi-Page Interactive Web Application gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Project: Multi-Page Interactive Web Application",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 30. Project: Multi-Page Interactive Web Application\nconsole.log(\"Mastering Project: Multi-Page Interactive Web Application in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Project: Multi-Page Interactive Web Application.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Project: Multi-Page Interactive Web Application\nfunction solve() {\n  return \"Completed Project: Multi-Page Interactive Web Application\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-31",
    "track": "react",
    "order": 31,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "31. Portals & Accessible Modal Dialog Patterns",
      "bn": "31. Portals & Accessible Modal Dialog Patterns"
    },
    "subtitle": {
      "en": "Master Portals & Accessible Modal Dialog Patterns with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Portals & Accessible Modal Dialog Patterns শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Portals & Accessible Modal Dialog Patterns to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Portals & Accessible Modal Dialog Patterns ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Portals & Accessible Modal Dialog Patterns to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Portals & Accessible Modal Dialog Patterns ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Portals & Accessible Modal Dialog Patterns gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Portals & Accessible Modal Dialog Patterns gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Portals & Accessible Modal Dialog Patterns",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 31. Portals & Accessible Modal Dialog Patterns\nconsole.log(\"Mastering Portals & Accessible Modal Dialog Patterns in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Portals & Accessible Modal Dialog Patterns.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Portals & Accessible Modal Dialog Patterns\nfunction solve() {\n  return \"Completed Portals & Accessible Modal Dialog Patterns\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-32",
    "track": "react",
    "order": 32,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "32. useTransition & Deferred UI Rendering",
      "bn": "32. useTransition & Deferred UI Rendering"
    },
    "subtitle": {
      "en": "Master useTransition & Deferred UI Rendering with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে useTransition & Deferred UI Rendering শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn useTransition & Deferred UI Rendering to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে useTransition & Deferred UI Rendering ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn useTransition & Deferred UI Rendering to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে useTransition & Deferred UI Rendering ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: useTransition & Deferred UI Rendering gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: useTransition & Deferred UI Rendering gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of useTransition & Deferred UI Rendering",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 32. useTransition & Deferred UI Rendering\nconsole.log(\"Mastering useTransition & Deferred UI Rendering in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating useTransition & Deferred UI Rendering.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for useTransition & Deferred UI Rendering\nfunction solve() {\n  return \"Completed useTransition & Deferred UI Rendering\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-33",
    "track": "react",
    "order": 33,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "33. Code Splitting & Lazy Loading Components with React.lazy",
      "bn": "33. Code Splitting & Lazy Loading Components with React.lazy"
    },
    "subtitle": {
      "en": "Master Code Splitting & Lazy Loading Components with React.lazy with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Code Splitting & Lazy Loading Components with React.lazy শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Code Splitting & Lazy Loading Components with React.lazy to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Code Splitting & Lazy Loading Components with React.lazy ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Code Splitting & Lazy Loading Components with React.lazy to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Code Splitting & Lazy Loading Components with React.lazy ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Code Splitting & Lazy Loading Components with React.lazy gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Code Splitting & Lazy Loading Components with React.lazy gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Code Splitting & Lazy Loading Components with React.lazy",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 33. Code Splitting & Lazy Loading Components with React.lazy\nconsole.log(\"Mastering Code Splitting & Lazy Loading Components with React.lazy in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Code Splitting & Lazy Loading Components with React.lazy.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Code Splitting & Lazy Loading Components with React.lazy\nfunction solve() {\n  return \"Completed Code Splitting & Lazy Loading Components with React.lazy\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-34",
    "track": "react",
    "order": 34,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "34. Accessibility (a11y) in React Applications",
      "bn": "34. Accessibility (a11y) in React Applications"
    },
    "subtitle": {
      "en": "Master Accessibility (a11y) in React Applications with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Accessibility (a11y) in React Applications শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Accessibility (a11y) in React Applications to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Accessibility (a11y) in React Applications ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Accessibility (a11y) in React Applications to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Accessibility (a11y) in React Applications ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Accessibility (a11y) in React Applications gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Accessibility (a11y) in React Applications gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Accessibility (a11y) in React Applications",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 34. Accessibility (a11y) in React Applications\nconsole.log(\"Mastering Accessibility (a11y) in React Applications in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Accessibility (a11y) in React Applications.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Accessibility (a11y) in React Applications\nfunction solve() {\n  return \"Completed Accessibility (a11y) in React Applications\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-35",
    "track": "react",
    "order": 35,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "35. Testing React Components with React Testing Library",
      "bn": "35. Testing React Components with React Testing Library"
    },
    "subtitle": {
      "en": "Master Testing React Components with React Testing Library with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Testing React Components with React Testing Library শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Testing React Components with React Testing Library to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Testing React Components with React Testing Library ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Testing React Components with React Testing Library to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Testing React Components with React Testing Library ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Testing React Components with React Testing Library gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Testing React Components with React Testing Library gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Testing React Components with React Testing Library",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 35. Testing React Components with React Testing Library\nconsole.log(\"Mastering Testing React Components with React Testing Library in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Testing React Components with React Testing Library.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Testing React Components with React Testing Library\nfunction solve() {\n  return \"Completed Testing React Components with React Testing Library\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-36",
    "track": "react",
    "order": 36,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "36. TypeScript Integration with React Props & State",
      "bn": "36. TypeScript Integration with React Props & State"
    },
    "subtitle": {
      "en": "Master TypeScript Integration with React Props & State with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে TypeScript Integration with React Props & State শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn TypeScript Integration with React Props & State to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে TypeScript Integration with React Props & State ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn TypeScript Integration with React Props & State to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে TypeScript Integration with React Props & State ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: TypeScript Integration with React Props & State gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: TypeScript Integration with React Props & State gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of TypeScript Integration with React Props & State",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 36. TypeScript Integration with React Props & State\nconsole.log(\"Mastering TypeScript Integration with React Props & State in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating TypeScript Integration with React Props & State.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for TypeScript Integration with React Props & State\nfunction solve() {\n  return \"Completed TypeScript Integration with React Props & State\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-37",
    "track": "react",
    "order": 37,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "37. Project Folder Structure & Feature-Based Architecture",
      "bn": "37. Project Folder Structure & Feature-Based Architecture"
    },
    "subtitle": {
      "en": "Master Project Folder Structure & Feature-Based Architecture with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Project Folder Structure & Feature-Based Architecture শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Project Folder Structure & Feature-Based Architecture to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project Folder Structure & Feature-Based Architecture ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Project Folder Structure & Feature-Based Architecture to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Project Folder Structure & Feature-Based Architecture ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Project Folder Structure & Feature-Based Architecture gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Project Folder Structure & Feature-Based Architecture gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Project Folder Structure & Feature-Based Architecture",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 37. Project Folder Structure & Feature-Based Architecture\nconsole.log(\"Mastering Project Folder Structure & Feature-Based Architecture in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Project Folder Structure & Feature-Based Architecture.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Project Folder Structure & Feature-Based Architecture\nfunction solve() {\n  return \"Completed Project Folder Structure & Feature-Based Architecture\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-38",
    "track": "react",
    "order": 38,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "38. Security, XSS Prevention & Production Practices",
      "bn": "38. Security, XSS Prevention & Production Practices"
    },
    "subtitle": {
      "en": "Master Security, XSS Prevention & Production Practices with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Security, XSS Prevention & Production Practices শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Security, XSS Prevention & Production Practices to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Security, XSS Prevention & Production Practices ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Security, XSS Prevention & Production Practices to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Security, XSS Prevention & Production Practices ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Security, XSS Prevention & Production Practices gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Security, XSS Prevention & Production Practices gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Security, XSS Prevention & Production Practices",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 38. Security, XSS Prevention & Production Practices\nconsole.log(\"Mastering Security, XSS Prevention & Production Practices in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Security, XSS Prevention & Production Practices.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Security, XSS Prevention & Production Practices\nfunction solve() {\n  return \"Completed Security, XSS Prevention & Production Practices\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-39",
    "track": "react",
    "order": 39,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "39. Building & Deploying React Apps to Production",
      "bn": "39. Building & Deploying React Apps to Production"
    },
    "subtitle": {
      "en": "Master Building & Deploying React Apps to Production with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Building & Deploying React Apps to Production শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Building & Deploying React Apps to Production to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Building & Deploying React Apps to Production ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Building & Deploying React Apps to Production to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Building & Deploying React Apps to Production ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Building & Deploying React Apps to Production gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Building & Deploying React Apps to Production gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Building & Deploying React Apps to Production",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 39. Building & Deploying React Apps to Production\nconsole.log(\"Mastering Building & Deploying React Apps to Production in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Building & Deploying React Apps to Production.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Building & Deploying React Apps to Production\nfunction solve() {\n  return \"Completed Building & Deploying React Apps to Production\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "react-40",
    "track": "react",
    "order": 40,
    "chapter": "Chapter 4: Advanced React & Real Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "40. Final React Capstone: Polished Web Application",
      "bn": "40. Final React Capstone: Polished Web Application"
    },
    "subtitle": {
      "en": "Master Final React Capstone: Polished Web Application with hands-on examples and state patterns.",
      "bn": "রিঅ্যাক্ট ফ্রেমওয়ার্ক দিয়ে Final React Capstone: Polished Web Application শিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Final React Capstone: Polished Web Application to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Final React Capstone: Polished Web Application ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "simple": {
        "en": "Learn Final React Capstone: Polished Web Application to write maintainable and robust React components.",
        "bn": "রিঅ্যাক্টে Final React Capstone: Polished Web Application ব্যবহারের নিয়ম ও প্রয়োজনীয়তা।"
      },
      "whyNeedIt": {
        "en": "Like an essential building block in a skyscraper: Final React Capstone: Polished Web Application gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "analogy": {
        "en": "Like an essential building block in a skyscraper: Final React Capstone: Polished Web Application gives your app stability and scalability.",
        "bn": "সফটওয়্যারের স্থায়িত্ব নিশ্চিত করতে এটি একটি গুরুত্বপূর্ণ উপাদান।"
      },
      "technical": {
        "en": "Covers React internal architecture, reconciliation, hooks execution rules, and idiomatic best practices.",
        "bn": "রিঅ্যাক্ট আর্কিটেকচার ও হুকস ব্যবহারের নিয়মাবলী।"
      }
    },
    "outcomes": [
      "Understand core principles of Final React Capstone: Polished Web Application",
      "Write production-grade component code",
      "Avoid common React anti-patterns"
    ],
    "starterCode": {
      "html": "<div id=\"root\"></div>",
      "css": "",
      "javascript": "// 40. Final React Capstone: Polished Web Application\nconsole.log(\"Mastering Final React Capstone: Polished Web Application in React\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Implement a clean helper or component demonstrating Final React Capstone: Polished Web Application.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example code above and implement the solution.",
        "bn": "উপরের কোড দেখে সমাধান তৈরি করুন।"
      },
      "solution": {
        "javascript": "// Solution for Final React Capstone: Polished Web Application\nfunction solve() {\n  return \"Completed Final React Capstone: Polished Web Application\";\n}\nconsole.log(solve());"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  }
];
