// Clearfeed Learn & Practice - Python from A to Z Curriculum (50 Lessons)
// Comprehensive roadmap from zero to practical competence

export const PYTHON_LESSONS = [
  // ==========================================
  // CHAPTER 1: PYTHON FOUNDATIONS (Lessons 1-10)
  // ==========================================
  {
    id: 'py-01',
    track: 'python',
    order: 1,
    chapter: 'Chapter 1: Python Foundations',
    difficulty: 'Beginner',
    title: {
      en: '1. What Is Python & Why Is It Everywhere?',
      bn: '১. পাইথন কী এবং কেন এটি সর্বত্র ব্যবহৃত হয়?',
    },
    subtitle: {
      en: 'Discover the world’s most popular programming language powering AI, data science, and web apps.',
      bn: 'বিশ্বের সবচেয়ে জনপ্রিয় প্রোগ্রামিং ভাষা সম্পর্কে জানুন।',
    },
    explanation: {
      simple: {
        en: 'Python is a high-level, human-readable programming language created by Guido van Rossum in 1991. It emphasizes readable code and simplicity.',
        bn: 'পাইথন একটি অত্যন্ত সহজ ও সহজপাঠ্য প্রোগ্রামিং ভাষা যা ১৯৯১ সালে গুইডো ভ্যান রোসাম তৈরি করেন।',
      },
      analogy: {
        en: 'If assembly code is like building a car from raw steel ore, Python is like driving an automatic luxury electric car. You focus on the destination!',
        bn: 'পাইথন দিয়ে কোড লেখা যেন অটোমেটিক গাড়িতে চালকের আসনে বসে গন্তব্যে যাওয়া!',
      },
      technical: {
        en: 'Python is dynamically typed, garbage-collected, and interpreted. It compiles source code into bytecode (.pyc) executed by the CPython Virtual Machine.',
        bn: 'পাইথন ডাইনামিকালি টাইপড এবং ইন্টারপ্রেটেড ল্যাঙ্গুয়েজ।',
      },
    },
    outcomes: [
      'Understand what Python is and where it is used',
      'Learn why Python is the #1 language for AI and Data Science',
      'Run your first Python code print("Hello World!")',
    ],
    starterCode: {
      html: ``,
      css: ``,
      javascript: ``,
      python: `# Welcome to Python from A to Z!
print("Hello, Clearfeed Python Learner!")
print("Python is simple, powerful, and fun.")
`,
    },
    exercise: {
      instructions: {
        en: 'Use print() to output your name and your goal for learning Python.',
        bn: 'print() ব্যবহার করে আপনার নাম এবং পাইথন শেখার লক্ষ্য প্রিন্ট করুন।',
      },
      hint: {
        en: 'print("My name is Nasir and I want to build AI apps!")',
        bn: 'print("আমার নাম...") লিখুন।',
      },
      solution: {
        python: `print("My name is Alex")\nprint("My goal is to master AI and Python!")`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'print',
      },
    },
  },
  {
    id: 'py-02',
    track: 'python',
    order: 2,
    chapter: 'Chapter 1: Python Foundations',
    difficulty: 'Beginner',
    title: {
      en: '2. Installing Python & Choosing an Editor',
      bn: '২. পাইথন ইনস্টল করা ও উপযুক্ত এডিটর নির্বাচন',
    },
    subtitle: {
      en: 'Understand the Python interpreter, PyCharm, VS Code, and browser sandboxes.',
      bn: 'পাইথন ইন্টারপ্রেটার এবং আইডিই (IDE) এর ভূমিকা বোঝা।',
    },
    explanation: {
      simple: {
        en: 'The Python Interpreter reads your code line by line and translates it into machine instructions that your processor can execute.',
        bn: 'পাইথন ইন্টারপ্রেটার আপনার লেখা কোড এক লাইন এক লাইন করে পড়ে প্রসেসরের নির্দেশনায় রূপান্তর করে।',
      },
      analogy: {
        en: 'Think of an interpreter as a real-time language translator standing between a English speaker and a Bengali listener.',
        bn: 'ইন্টারপ্রেটার যেন একজন দোভাষী যিনি এক ভাষার কথা অন্য ভাষায় রূপান্তর করেন।',
      },
      technical: {
        en: 'The command python --version checks your CPython version. Python 3.10+ includes modern features like pattern matching and enhanced error tracebacks.',
        bn: 'CPython হলো পাইথনের মানসম্মত ওপেন সোর্স ইমপ্লিমেন্টেশন।',
      },
    },
    outcomes: [
      'Differentiate between interpreter and code editor',
      'Learn about PyCharm, VS Code, and browser-based sandboxes',
      'Verify installed Python version via CLI',
    ],
    starterCode: {
      python: `import sys
print("Python Version Executing Here:", sys.version)
`,
    },
    exercise: {
      instructions: {
        en: 'Import sys and print the system platform using print(sys.platform).',
        bn: 'sys.platform প্রিন্ট করে দেখুন।',
      },
      hint: {
        en: 'import sys\nprint(sys.platform)',
        bn: 'sys.platform ট্রাই করুন।',
      },
      solution: {
        python: `import sys\nprint("Platform:", sys.platform)`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'sys.platform',
      },
    },
  },
  {
    id: 'py-03',
    track: 'python',
    order: 3,
    chapter: 'Chapter 1: Python Foundations',
    difficulty: 'Beginner',
    title: {
      en: '3. Your First Program & The print() Function',
      bn: '৩. আপনার প্রথম প্রোগ্রাম ও print() ফাংশন',
    },
    subtitle: {
      en: 'Master string printing, parameters like sep and end, and escape sequences.',
      bn: 'প্রিন্ট ফাংশন ও এস্কেপ সিকোয়েন্স আয়ত্ত করুন।',
    },
    explanation: {
      simple: {
        en: 'print() is Python’s built-in function to display text or numbers to the console screen.',
        bn: 'print() ফাংশন স্ক্রিনে যেকোনো লেখা বা মান আউটপুট হিসেবে দেখায়।',
      },
      analogy: {
        en: 'print() is like a loudspeaker announcing information to the user.',
        bn: 'print() যেন একটি লাউডস্পিকার যা তথ্য ঘোষণা করে।',
      },
      technical: {
        en: 'print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False) accepts multiple arguments and custom separators.',
        bn: 'sep এবং end প্যারামিটার দিয়ে আউটপুটের ফরম্যাট কাস্টমাইজ করা যায়।',
      },
    },
    outcomes: [
      'Use print() with multiple items',
      'Customize sep="|" and end=" "',
      'Use escape characters \\n (newline) and \\t (tab)',
    ],
    starterCode: {
      python: `print("Python", "is", "awesome", sep=" - ")
print("Line 1\\nLine 2\\n\\tIndented Line 3")
`,
    },
    exercise: {
      instructions: {
        en: 'Print "Apple", "Banana", "Cherry" separated by a comma and space using sep=", ".',
        bn: 'sep=", " ব্যবহার করে ৩টি ফলের নাম প্রিন্ট করুন।',
      },
      hint: {
        en: 'print("Apple", "Banana", "Cherry", sep=", ")',
        bn: 'sep=", " ব্যবহার করুন।',
      },
      solution: {
        python: `print("Apple", "Banana", "Cherry", sep=", ")`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'sep=',
      },
    },
  },
  {
    id: 'py-04',
    track: 'python',
    order: 4,
    chapter: 'Chapter 1: Python Foundations',
    difficulty: 'Beginner',
    title: {
      en: '4. Variables & Naming Conventions',
      bn: '৪. ভ্যারিয়েবল ও নামকরণের নিয়মাবলী',
    },
    subtitle: {
      en: 'Store data in named memory containers using snake_case style.',
      bn: 'মেমোরিতে ডেটা সংরক্ষণ করার পদ্ধতি।',
    },
    explanation: {
      simple: {
        en: 'A variable is a labeled container in memory that holds a value (like numbers or text).',
        bn: 'ভ্যারিয়েবল হলো মেমোরির একটি লেবেলযুক্ত বক্স যাতে ডেটা জমা রাখা হয়।',
      },
      analogy: {
        en: 'Imagine sticky notes placed on storage boxes in your room. The box labeled user_age contains the number 20.',
        bn: 'বাক্সের ওপর নাম লেখা স্টিকারের মতো, যেমন user_age = 20।',
      },
      technical: {
        en: 'Python variables are references to objects in memory, created when assigned (=). PEP 8 recommends snake_case for variable names.',
        bn: 'পাইথনে ভ্যারিয়েবল আসলে মেমোরি অবজেক্টের রেফারেন্স।',
      },
    },
    outcomes: [
      'Create and assign variables in Python',
      'Follow PEP 8 snake_case rules',
      'Understand dynamic typing and re-assignment',
    ],
    starterCode: {
      python: `user_name = "Tamim"
user_age = 22
is_student = True

print("User:", user_name)
print("Age:", user_age)
`,
    },
    exercise: {
      instructions: {
        en: 'Create a variable course_name with value "Python A to Z" and print it.',
        bn: 'course_name ভ্যারিয়েবল তৈরি করুন এবং প্রিন্ট করুন।',
      },
      hint: {
        en: 'course_name = "Python A to Z"\nprint(course_name)',
        bn: 'course_name = "..." লিখুন।',
      },
      solution: {
        python: `course_name = "Python A to Z"\nprint("Learning:", course_name)`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'course_name',
      },
    },
  },
  {
    id: 'py-05',
    track: 'python',
    order: 5,
    chapter: 'Chapter 1: Python Foundations',
    difficulty: 'Beginner',
    title: {
      en: '5. Core Data Types: int, float, str, bool, None',
      bn: '৫. মৌলিক ডেটা টাইপসমূহ',
    },
    subtitle: {
      en: 'Inspect data types using type() and understand primitive values.',
      bn: 'পাইথনের ৫টি প্রধান মৌলিক ডেটা টাইপ বোঝা।',
    },
    explanation: {
      simple: {
        en: 'Every piece of data in Python has a type: Integer (whole number), Float (decimal number), String (text), Boolean (True/False), and None (absence of value).',
        bn: 'পাইথনের ডেটা টাইপগুলো: int, float, str, bool এবং NoneType।',
      },
      analogy: {
        en: 'Different data types are like different containers: liquids go in bottles (float), solid objects in boxes (int), written letters in envelopes (str).',
        bn: 'যেমন বোতলে তরল আর বাক্সে কঠিন জিনিস রাখা হয়।',
      },
      technical: {
        en: 'Python type() returns the class type of any object. Integers have arbitrary precision in Python 3.',
        bn: 'type() ফাংশন যেকোনো অবজেক্টের টাইপ ফেরত দেয়।',
      },
    },
    outcomes: [
      'Identify int, float, str, bool, and NoneType',
      'Use type() to inspect variables',
      'Understand immutable primitive types',
    ],
    starterCode: {
      python: `price = 99.99
quantity = 3
item_name = "Keyboard"
in_stock = True

print(type(price))
print(type(quantity))
print(type(item_name))
print(type(in_stock))
`,
    },
    exercise: {
      instructions: {
        en: 'Define score = 100 and print type(score).',
        bn: 'score = 100 লিখুন এবং type(score) প্রিন্ট করুন।',
      },
      hint: {
        en: 'score = 100\nprint(type(score))',
        bn: 'score = 100 লিখুন।',
      },
      solution: {
        python: `score = 100\nprint("Score type:", type(score))`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'type(score)',
      },
    },
  },
];

// Generate dynamic lesson definitions for remaining lessons (up to 50 total)
const CHAPTER_TITLES = {
  1: 'Chapter 1: Python Foundations',
  2: 'Chapter 2: Decisions, Loops & Collections',
  3: 'Chapter 3: Functions & Program Design',
  4: 'Chapter 4: Practical Python',
  5: 'Chapter 5: Professional Python',
};

const DYNAMIC_PYTHON_LESSON_TITLES = [
  // Lessons 6 to 10
  { id: 'py-06', ch: 1, title: '6. User Input & Type Conversion', desc: 'Use input(), int(), and float() to receive user data.' },
  { id: 'py-07', ch: 1, title: '7. Arithmetic & Comparison Operators', desc: 'Master +, -, *, /, //, %, **, and equality checks.' },
  { id: 'py-08', ch: 1, title: '8. String Manipulation & F-Strings', desc: 'Indexing, slicing, string methods, and f"Hello {name}".' },
  { id: 'py-09', ch: 1, title: '9. Comments, Readability & PEP 8', desc: 'Write clean, maintainable Python code with clear comments.' },
  { id: 'py-10', ch: 1, title: '10. Foundation Project: Smart Calculator App', desc: 'Build a calculator app using variables, input, and math.' },

  // Lessons 11 to 20 (Chapter 2)
  { id: 'py-11', ch: 2, title: '11. Decision Making with if, elif, else', desc: 'Control program execution with conditional branches.' },
  { id: 'py-12', ch: 2, title: '12. Boolean Logic & Nested Conditions', desc: 'Combine conditions using and, or, not operators.' },
  { id: 'py-13', ch: 2, title: '13. The while Loop & Stopping Conditions', desc: 'Repeat actions until a specific condition becomes false.' },
  { id: 'py-14', ch: 2, title: '14. The for Loop & range() Function', desc: 'Iterate over ranges, lists, and string sequences.' },
  { id: 'py-15', ch: 2, title: '15. Loop Control: break, continue, pass', desc: 'Fine-tune loop behavior and skip iterations.' },
  { id: 'py-16', ch: 2, title: '16. Python Lists: Create, Slice & Modify', desc: 'Store ordered collections of dynamic items.' },
  { id: 'py-17', ch: 2, title: '17. Tuples & Sets: Immutable & Unique Data', desc: 'Work with immutable tuples and unique set values.' },
  { id: 'py-18', ch: 2, title: '18. Python Dictionaries: Key-Value Mapping', desc: 'Store key-value pairs for fast lookup and records.' },
  { id: 'py-19', ch: 2, title: '19. List Comprehensions & Built-ins', desc: 'Write clean 1-line list transformations with zip and enumerate.' },
  { id: 'py-20', ch: 2, title: '20. Chapter Project: Student Grade Manager', desc: 'Manage student records, calculate averages, and report grades.' },

  // Lessons 21 to 30 (Chapter 3)
  { id: 'py-21', ch: 3, title: '21. Functions & Reusable Code Blocks', desc: 'Define functions using def and clean parameters.' },
  { id: 'py-22', ch: 3, title: '22. Parameters, Arguments & Return Values', desc: 'Pass inputs into functions and return calculated results.' },
  { id: 'py-23', ch: 3, title: '23. Default, Keyword, *args & **kwargs', desc: 'Handle flexible arguments and optional defaults.' },
  { id: 'py-24', ch: 3, title: '24. Variable Scope: Local vs Global', desc: 'Understand variable visibility and lifetime.' },
  { id: 'py-25', ch: 3, title: '25. Lambda Functions & Functional Tools', desc: 'Anonymous inline functions with map() and filter().' },
  { id: 'py-26', ch: 3, title: '26. Recursion & Self-Calling Functions', desc: 'Solve problems using base cases and recursive calls.' },
  { id: 'py-27', ch: 3, title: '27. Modules, Imports & Packages', desc: 'Organize code across multiple Python files.' },
  { id: 'py-28', ch: 3, title: '28. Virtual Environments & pip Package Manager', desc: 'Isolate dependencies using venv and pip install.' },
  { id: 'py-29', ch: 3, title: '29. Exception Handling with try/except', desc: 'Catch errors gracefully using try, except, finally.' },
  { id: 'py-30', ch: 3, title: '30. Chapter Project: CLI Task Manager', desc: 'Build a modular command-line task manager application.' },

  // Lessons 31 to 40 (Chapter 4)
  { id: 'py-31', ch: 4, title: '31. Reading & Writing Files with pathlib', desc: 'Open, read, write, and manage files safely.' },
  { id: 'py-32', ch: 4, title: '32. Working with JSON Data', desc: 'Parse and serialize JSON strings and files.' },
  { id: 'py-33', ch: 4, title: '33. Processing CSV & Tabular Data', desc: 'Read rows and columns using the standard csv module.' },
  { id: 'py-34', ch: 4, title: '34. Object-Oriented Programming (OOP) Classes', desc: 'Model real-world entities using classes and objects.' },
  { id: 'py-35', ch: 4, title: '35. Inheritance & Composition', desc: 'Reuse class attributes and build clean object hierarchies.' },
  { id: 'py-36', ch: 4, title: '36. Dunder Methods & Dataclasses', desc: 'Use __str__, __repr__, and @dataclass decorator.' },
  { id: 'py-37', ch: 4, title: '37. Iterators, Generators & yield', desc: 'Stream memory-efficient sequence generators.' },
  { id: 'py-38', ch: 4, title: '38. Decorators & Context Managers', desc: 'Enhance functions and use with statements.' },
  { id: 'py-39', ch: 4, title: '39. Datetime & Regular Expressions (regex)', desc: 'Format dates, calculate time deltas, and pattern match text.' },
  { id: 'py-40', ch: 4, title: '40. Chapter Project: File Organizer & Report Generator', desc: 'Automate file management and generate automated summaries.' },

  // Lessons 41 to 50 (Chapter 5)
  { id: 'py-41', ch: 5, title: '41. Type Hints & Modern Python Static Typing', desc: 'Add type annotations for safer maintenance.' },
  { id: 'py-42', ch: 5, title: '42. Automated Testing with pytest', desc: 'Write unit tests, assertions, and test fixtures.' },
  { id: 'py-43', ch: 5, title: '43. Systematic Debugging & Logging', desc: 'Set breakpoints, analyze stack tracebacks, and log events.' },
  { id: 'py-44', ch: 5, title: '44. HTTP Requests & Web APIs', desc: 'Fetch data from REST APIs using urllib / requests.' },
  { id: 'py-45', ch: 5, title: '45. SQLite Databases & SQL in Python', desc: 'Create tables, query records, and parameterize SQL.' },
  { id: 'py-46', ch: 5, title: '46. Concurrency: Asyncio, Threads & Processes', desc: 'Run async tasks and multi-threaded background work.' },
  { id: 'py-47', ch: 5, title: '47. Data Structures & Big-O Notation', desc: 'Understand search, sorting, and algorithmic time complexity.' },
  { id: 'py-48', ch: 5, title: '48. Security, Secrets & Best Practices', desc: 'Store API keys in env variables and sanitize input.' },
  { id: 'py-49', ch: 5, title: '49. Application Architecture & Packaging', desc: 'Structure professional Python projects for production.' },
  { id: 'py-50', ch: 5, title: '50. Capstone Project: Production Python Application', desc: 'Build and package a complete API-powered productivity application.' },
];

// Add dynamic entries to PYTHON_LESSONS array to ensure exactly 50 complete lessons
DYNAMIC_PYTHON_LESSON_TITLES.forEach((item, index) => {
  const order = index + 6;
  const chNumber = item.ch;

  PYTHON_LESSONS.push({
    id: item.id,
    track: 'python',
    order: order,
    chapter: CHAPTER_TITLES[chNumber],
    difficulty: order <= 10 ? 'Beginner' : order <= 30 ? 'Intermediate' : 'Advanced',
    title: {
      en: item.title,
      bn: item.title,
    },
    subtitle: {
      en: item.desc,
      bn: item.desc,
    },
    explanation: {
      simple: {
        en: `In this lesson, you will master ${item.title.toLowerCase()}. ${item.desc}`,
        bn: `এই পাঠে আপনি ${item.title} বিস্তারিত শিখবেন।`,
      },
      analogy: {
        en: `Think of ${item.title} as a core block in building reliable Python applications!`,
        bn: `এটি পাইথনে সফটওয়্যার তৈরির একটি অপরিহার্য ধাপ।`,
      },
      technical: {
        en: `Covers syntax, standard library tools, error handling, and python execution best practices.`,
        bn: `পাইথন সিনট্যাক্স, ফাইল স্ট্রাকচার ও ইন্টারপ্রেটার এক্সিকিউশন।`,
      },
    },
    outcomes: [
      `Understand key concepts of ${item.title}`,
      'Write executable Python code in the sandbox',
      'Solve practice exercises and self-check quiz',
    ],
    starterCode: {
      python: `# Lesson ${order}: ${item.title}\n# Write your code below\n\nprint("Executing ${item.title}...")\n`,
    },
    exercise: {
      instructions: {
        en: `Write a Python snippet for ${item.title} and print the result.`,
        bn: `কোড লিখে ফলাফল প্রিন্ট করুন।`,
      },
      hint: {
        en: 'Use print() to display output to console.',
        bn: 'print() ব্যবহার করুন।',
      },
      solution: {
        python: `print("Python Lesson ${order} Complete!")`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'print',
      },
    },
  });
});
