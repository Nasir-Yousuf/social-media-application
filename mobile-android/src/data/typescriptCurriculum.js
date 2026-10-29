// Clearfeed TYPESCRIPT_LESSONS - Comprehensive Interactive Curriculum
export const TYPESCRIPT_LESSONS = [
  {
    "id": "ts-01",
    "track": "typescript",
    "order": 1,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "1. Why TypeScript Exists & Static Type Checking",
      "bn": "১. টাইপস্ক্রিপ্ট কেন প্রয়োজন ও স্ট্যাটিক টাইপ চেকিং"
    },
    "subtitle": {
      "en": "Learn how compile-time type checking eliminates runtime bugs before code reaches users.",
      "bn": "কোড রান করার আগেই এরর খুঁজে বের করার ম্যাজিক।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "TypeScript is a strongly typed superset of JavaScript that compiles down to standard JavaScript.",
        "bn": "টাইপস্ক্রিপ্ট হলো জাভাস্ক্রিপ্টের উপর তৈরি টাইপড ল্যাঙ্গুয়েজ যা কম্পাইল টাইমে টাইপ ভুল বা বাগ শনাক্ত করে।"
      },
      "simple": {
        "en": "TypeScript is a strongly typed superset of JavaScript that compiles down to standard JavaScript.",
        "bn": "টাইপস্ক্রিপ্ট হলো জাভাস্ক্রিপ্টের উপর তৈরি টাইপড ল্যাঙ্গুয়েজ যা কম্পাইল টাইমে টাইপ ভুল বা বাগ শনাক্ত করে।"
      },
      "whyNeedIt": {
        "en": "JavaScript is like walking on a tightrope without a net; TypeScript installs a sturdy safety harness and railing.",
        "bn": "নিরাপত্তা বেষ্টনী ছাড়া দড়ির ওপর হাঁটা বনাম শক্ত রেলিং ধরে হাঁটা।"
      },
      "analogy": {
        "en": "JavaScript is like walking on a tightrope without a net; TypeScript installs a sturdy safety harness and railing.",
        "bn": "নিরাপত্তা বেষ্টনী ছাড়া দড়ির ওপর হাঁটা বনাম শক্ত রেলিং ধরে হাঁটা।"
      },
      "technical": {
        "en": "tsc analyzes AST nodes against type contracts, emitting standard ES code while removing all type annotations.",
        "bn": "টাইপস্ক্রিপ্ট কম্পাইলার কোড অ্যানালাইসিস করে এরর ধরে এবং পরিচ্ছন্ন জাভাস্ক্রিপ্ট কোড তৈরি করে।"
      }
    },
    "outcomes": [
      "Understand 1. Why TypeScript Exists & Static Type Checking",
      "Write type annotations and interface contracts",
      "Prevent common runtime TypeError crashes"
    ],
    "starterCode": {
      "javascript": "// TypeScript Static Type Annotation\nlet appName: string = \"Clearfeed\";\nlet activeUsers: number = 2400;\nlet isPro: boolean = true;\n\n// Type error caught at compile-time:\n// activeUsers = \"two thousand\"; // ❌ Type 'string' is not assignable to type 'number'\n\nconsole.log(`App: ${appName} | Active: ${activeUsers} | Pro: ${isPro}`);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Declare a typed variable \"points: number = 100;\" and log it.",
        "bn": "points ভ্যারিয়েবল ডিক্লেয়ার করে প্রিন্ট করুন।"
      },
      "hint": {
        "en": "Review the code example above.",
        "bn": "উপরের উদাহরণটি দেখুন।"
      },
      "solution": {
        "javascript": "let points: number = 100;\nconsole.log(\"Points:\", points);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "points"
      }
    }
  },
  {
    "id": "ts-02",
    "track": "typescript",
    "order": 2,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "2. Installation, Compiler & tsconfig.json Options",
      "bn": "২. টাইপস্ক্রিপ্ট ইনস্টল ও tsconfig.json কনফিগারেশন"
    },
    "subtitle": {
      "en": "Configure compiler targets (ESNext), module resolution, strict mode, and build outputs.",
      "bn": "tsconfig.json এর মাধ্যমে কম্পাইলার নিয়ম নির্ধারণ।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "tsconfig.json is the configuration file that directs the TypeScript compiler how to parse and compile your project.",
        "bn": "tsconfig.json হলো কনফিগারেশন ফাইল যা কম্পাইলারকে নির্দেশ দেয় কীভাবে কোড প্রসেস করতে হবে।"
      },
      "simple": {
        "en": "tsconfig.json is the configuration file that directs the TypeScript compiler how to parse and compile your project.",
        "bn": "tsconfig.json হলো কনফিগারেশন ফাইল যা কম্পাইলারকে নির্দেশ দেয় কীভাবে কোড প্রসেস করতে হবে।"
      },
      "whyNeedIt": {
        "en": "Like the blueprint and rulebook given to the construction team before building a house.",
        "bn": "বাড়ি বানানোর আগে ইঞ্জিনিয়ারের ব্লুপ্রিন্ট ও নিয়মাবলীর মতো।"
      },
      "analogy": {
        "en": "Like the blueprint and rulebook given to the construction team before building a house.",
        "bn": "বাড়ি বানানোর আগে ইঞ্জিনিয়ারের ব্লুপ্রিন্ট ও নিয়মাবলীর মতো।"
      },
      "technical": {
        "en": "Key options include target, module, moduleResolution, strict: true, noImplicitAny: true, and outDir.",
        "bn": "strict: true দিলে কোড সর্বোচ্চ সুরক্ষা পায়।"
      }
    },
    "outcomes": [
      "Understand 2. Installation, Compiler & tsconfig.json Options",
      "Write type annotations and interface contracts",
      "Prevent common runtime TypeError crashes"
    ],
    "starterCode": {
      "javascript": "// Simulating tsconfig.json configuration\nconst tsConfig = {\n  compilerOptions: {\n    target: \"ES2022\",\n    module: \"NodeNext\",\n    strict: true,\n    noImplicitAny: true,\n    exactOptionalPropertyTypes: true,\n    outDir: \"./dist\"\n  },\n  include: [\"src/**/*\"]\n};\nconsole.log(\"TypeScript Compiler Config Loaded:\", JSON.stringify(tsConfig, null, 2));\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a simulated tsconfig object with strict: true and target: \"ES2022\".",
        "bn": "একটি tsconfig অবজেক্ট তৈরি করুন।"
      },
      "hint": {
        "en": "Review the code example above.",
        "bn": "উপরের উদাহরণটি দেখুন।"
      },
      "solution": {
        "javascript": "const config = { compilerOptions: { strict: true, target: \"ES2022\" } };\nconsole.log(\"Strict Mode:\", config.compilerOptions.strict);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "strict: true"
      }
    }
  },
  {
    "id": "ts-03",
    "track": "typescript",
    "order": 3,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "3. Primitive Types & Automatic Type Inference",
      "bn": "৩. প্রিমিটিভ টাইপস ও স্বয়ংক্রিয় টাইপ ইনফারেন্স"
    },
    "subtitle": {
      "en": "Master string, number, boolean, null, undefined, symbol, and how TypeScript infers types.",
      "bn": "প্রিমিটিভ টাইপস এবং টাইপ নিজে থেকে বুঝে নেওয়ার ক্ষমতা।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "TypeScript automatically infers types when variables are initialized, so you do not have to write types everywhere.",
        "bn": "শুরুতে ভ্যালু অ্যাসাইন করলে টাইপস্ক্রিপ্ট নিজে থেকেই টাইপ বুঝে নেয়।"
      },
      "simple": {
        "en": "TypeScript automatically infers types when variables are initialized, so you do not have to write types everywhere.",
        "bn": "শুরুতে ভ্যালু অ্যাসাইন করলে টাইপস্ক্রিপ্ট নিজে থেকেই টাইপ বুঝে নেয়।"
      },
      "whyNeedIt": {
        "en": "If an animal walks like a duck and quacks like a duck, you do not need to label it \"Duck\"—you already know!",
        "bn": "হাঁসের মতো ডাকলে যেমন তাকে হাঁস বলেই চেনা যায়, তেমনি মান দেখেই টাইপ বোঝা যায়।"
      },
      "analogy": {
        "en": "If an animal walks like a duck and quacks like a duck, you do not need to label it \"Duck\"—you already know!",
        "bn": "হাঁসের মতো ডাকলে যেমন তাকে হাঁস বলেই চেনা যায়, তেমনি মান দেখেই টাইপ বোঝা যায়।"
      },
      "technical": {
        "en": "Type inference calculates the most specific type based on the initial assigned value using control flow analysis.",
        "bn": "টাইপ ইনফারেন্স কোডের মান পর্যবেক্ষণ করে স্বয়ংক্রিয় টাইপ নির্ধারণ করে।"
      }
    },
    "outcomes": [
      "Understand 3. Primitive Types & Automatic Type Inference",
      "Write type annotations and interface contracts",
      "Prevent common runtime TypeError crashes"
    ],
    "starterCode": {
      "javascript": "// Automatic Type Inference\nlet message = \"Hello Clearfeed\"; // inferred as string\nlet count = 42;                 // inferred as number\nlet isValid = true;             // inferred as boolean\n\n// Explicit vs Inferred\nconsole.log(typeof message, typeof count, typeof isValid);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Declare a variable greeting with value \"Hi\" and log its typeof.",
        "bn": "greeting ভ্যারিয়েবল ডিক্লেয়ার করে typeof প্রিন্ট করুন।"
      },
      "hint": {
        "en": "Review the code example above.",
        "bn": "উপরের উদাহরণটি দেখুন।"
      },
      "solution": {
        "javascript": "const greeting = \"Hi\";\nconsole.log(typeof greeting);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "typeof"
      }
    }
  },
  {
    "id": "ts-04",
    "track": "typescript",
    "order": 4,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "4. Typed Arrays, Tuples & Literal Types",
      "bn": "৪. টাইপড অ্যারে, টাপল (Tuples) ও লিটারেল টাইপস"
    },
    "subtitle": {
      "en": "Define arrays of types (string[]), fixed-length tuples [string, number], and exact literal types.",
      "bn": "অ্যারে এবং নির্দিষ্ট দৈর্ঘ্যের টাপল ব্যবহারের নিয়ম।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Tuples allow you to express an array with a fixed number of elements whose types are known.",
        "bn": "টাপল হলো নির্দিষ্ট সংখ্যক ও নির্দিষ্ট টাইপের উপাদানের সমন্বয়ে গঠিত বিশেষ অ্যারে।"
      },
      "simple": {
        "en": "Tuples allow you to express an array with a fixed number of elements whose types are known.",
        "bn": "টাপল হলো নির্দিষ্ট সংখ্যক ও নির্দিষ্ট টাইপের উপাদানের সমন্বয়ে গঠিত বিশেষ অ্যারে।"
      },
      "whyNeedIt": {
        "en": "A GPS coordinate is always [latitude, longitude]: exactly two numbers in an exact order.",
        "bn": "জিপিএস কোঅর্ডিনেট যেমন [অক্ষাংশ, দ্রাঘিমাংশ]: ঠিক দুটি সংখ্যা নির্দিষ্ট ক্রমে থাকে।"
      },
      "analogy": {
        "en": "A GPS coordinate is always [latitude, longitude]: exactly two numbers in an exact order.",
        "bn": "জিপিএস কোঅর্ডিনেট যেমন [অক্ষাংশ, দ্রাঘিমাংশ]: ঠিক দুটি সংখ্যা নির্দিষ্ট ক্রমে থাকে।"
      },
      "technical": {
        "en": "Tuples have strict length and index type checking; readonly tuples prevent mutable pushes.",
        "bn": "টাপল এর দৈর্ঘ্য ও ইনডেক্স টাইপ অপরিবর্তনশীল রাখা যায়।"
      }
    },
    "outcomes": [
      "Understand 4. Typed Arrays, Tuples & Literal Types",
      "Write type annotations and interface contracts",
      "Prevent common runtime TypeError crashes"
    ],
    "starterCode": {
      "javascript": "// Typed Arrays & Tuples\nconst tags: string[] = [\"react\", \"typescript\", \"tailwindcss\"];\n\n// Tuple: [id, title, isCompleted]\ntype TaskTuple = [number, string, boolean];\nconst task: TaskTuple = [101, \"Configure TypeScript\", true];\n\nconsole.log(\"Tags:\", tags.join(\", \"));\nconsole.log(`Task #${task[0]}: ${task[1]} (Done: ${task[2]})`);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a coordinate tuple [number, number] with values [23.8103, 90.4125].",
        "bn": "একটি [number, number] টাপল তৈরি করুন।"
      },
      "hint": {
        "en": "Review the code example above.",
        "bn": "উপরের উদাহরণটি দেখুন।"
      },
      "solution": {
        "javascript": "const coordinates: [number, number] = [23.8103, 90.4125];\nconsole.log(\"Lat:\", coordinates[0], \"Lng:\", coordinates[1]);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "coordinates"
      }
    }
  },
  {
    "id": "ts-05",
    "track": "typescript",
    "order": 5,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "5. Object Types & Type Aliases (type User = {...})",
      "bn": "৫. অবজেক্ট টাইপস ও টাইপ এলিয়াস (Type Aliases)"
    },
    "subtitle": {
      "en": "Define structured contracts for objects with optional properties and custom aliases.",
      "bn": "অবজেক্টের জন্য সুনির্দিষ্ট টাইপ ব্লুপ্রিন্ট তৈরি করা।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "A Type Alias gives a custom name to any shape of data, making code reusable and readable.",
        "bn": "টাইপ এলিয়াস দিয়ে অবজেক্ট বা ডেটা স্ট্রাকচারের একটি কাস্টম নাম দেওয়া যায়।"
      },
      "simple": {
        "en": "A Type Alias gives a custom name to any shape of data, making code reusable and readable.",
        "bn": "টাইপ এলিয়াস দিয়ে অবজেক্ট বা ডেটা স্ট্রাকচারের একটি কাস্টম নাম দেওয়া যায়।"
      },
      "whyNeedIt": {
        "en": "Like an official passport application form: specifies exactly what fields are required and what are optional.",
        "bn": "পাসপোর্ট ফরমের মতো: কোন তথ্যগুলো বাধ্যতামূলক আর কোনগুলো ঐচ্ছিক তা নির্দিষ্ট করা থাকে।"
      },
      "analogy": {
        "en": "Like an official passport application form: specifies exactly what fields are required and what are optional.",
        "bn": "পাসপোর্ট ফরমের মতো: কোন তথ্যগুলো বাধ্যতামূলক আর কোনগুলো ঐচ্ছিক তা নির্দিষ্ট করা থাকে।"
      },
      "technical": {
        "en": "Type aliases (type T = ...) can represent objects, primitives, unions, tuples, and mapped types.",
        "bn": "টাইপ এলিয়াস অবজেক্ট, ইউনিয়ন ও অন্যান্য জটিল টাইপের জন্য ব্যবহার করা যায়।"
      }
    },
    "outcomes": [
      "Understand 5. Object Types & Type Aliases (type User = {...})",
      "Write type annotations and interface contracts",
      "Prevent common runtime TypeError crashes"
    ],
    "starterCode": {
      "javascript": "// Type Alias for User\ntype UserProfile = {\n  id: string;\n  name: string;\n  email: string;\n  bio?: string; // Optional property\n  readonly createdAt: number; // Immutable field\n};\n\nconst user: UserProfile = {\n  id: \"usr_001\",\n  name: \"Nasir\",\n  email: \"nasir@example.com\",\n  createdAt: Date.now()\n};\n\nconsole.log(`Profile: ${user.name} (${user.email})`);\n"
    },
    "exercise": {
      "instructions": {
        "en": "Create a Product type with id (number), name (string), and price (number).",
        "bn": "একটি Product টাইপ তৈরি করুন।"
      },
      "hint": {
        "en": "Review the code example above.",
        "bn": "উপরের উদাহরণটি দেখুন।"
      },
      "solution": {
        "javascript": "type Product = { id: number; name: string; price: number; };\nconst p: Product = { id: 1, name: \"Keyboard\", price: 45 };\nconsole.log(p);"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "type Product"
      }
    }
  },
  {
    "id": "ts-06",
    "track": "typescript",
    "order": 6,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "6. Interfaces & Contract Extension (interface User {...})",
      "bn": "6. Interfaces & Contract Extension (interface User {...})"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Interfaces & Contract Extension (interface User {...}).",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Interfaces define extensible contracts for object shapes that can be augmented via extends.",
        "bn": "ইন্টারফেস দিয়ে অবজেক্টের কাঠামো তৈরি করা হয় এবং extends দিয়ে বাড়ানো যায়।"
      },
      "simple": {
        "en": "Interfaces define extensible contracts for object shapes that can be augmented via extends.",
        "bn": "ইন্টারফেস দিয়ে অবজেক্টের কাঠামো তৈরি করা হয় এবং extends দিয়ে বাড়ানো যায়।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Interfaces & Contract Extension (interface User {...})",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// Interface vs Type Alias\ninterface BaseEntity {\n  id: string;\n  createdAt: Date;\n}\n\ninterface UserAccount extends BaseEntity {\n  username: string;\n  email: string;\n}\n\nconst account: UserAccount = {\n  id: \"acc_101\",\n  createdAt: new Date(),\n  username: \"nasir_dev\",\n  email: \"nasir@example.com\"\n};\nconsole.log(\"User Account Interface:\", account.username);"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Interfaces & Contract Extension (interface User {...}) and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 6 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-07",
    "track": "typescript",
    "order": 7,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "7. Union Types (A | B) & Intersection Types (A & B)",
      "bn": "7. Union Types (A | B) & Intersection Types (A & B)"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Union Types (A | B) & Intersection Types (A & B).",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Union types (A | B) mean a value can be either type; Intersection types (A & B) combine both.",
        "bn": "টাইপস্ক্রিপ্টে Union Types (A | B) & Intersection Types (A & B) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Union types (A | B) mean a value can be either type; Intersection types (A & B) combine both.",
        "bn": "টাইপস্ক্রিপ্টে Union Types (A | B) & Intersection Types (A & B) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Union Types (A | B) & Intersection Types (A & B)",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// Union & Intersection Types\ntype Result = \"success\" | \"error\" | \"loading\"; // Union\ntype Timestamped = { timestamp: number };\ntype ErrorPayload = { errorCode: number; message: string };\n\ntype LoggedError = Timestamped & ErrorPayload; // Intersection\n\nconst err: LoggedError = {\n  timestamp: Date.now(),\n  errorCode: 404,\n  message: \"Resource not found\"\n};\nconsole.log(\"Logged Error:\", err);"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Union Types (A | B) & Intersection Types (A & B) and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 7 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-08",
    "track": "typescript",
    "order": 8,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "8. Function Signatures, Return Types & Optional Params",
      "bn": "8. Function Signatures, Return Types & Optional Params"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Function Signatures, Return Types & Optional Params.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Function Signatures, Return Types & Optional Params to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Function Signatures, Return Types & Optional Params এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Function Signatures, Return Types & Optional Params to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Function Signatures, Return Types & Optional Params এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Function Signatures, Return Types & Optional Params",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 8. Function Signatures, Return Types & Optional Params\nconsole.log(\"Mastering Function Signatures, Return Types & Optional Params in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Function Signatures, Return Types & Optional Params and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 8 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-09",
    "track": "typescript",
    "order": 9,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "9. Type Narrowing, Control Flow & Type Guards",
      "bn": "9. Type Narrowing, Control Flow & Type Guards"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Type Narrowing, Control Flow & Type Guards.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Type Narrowing, Control Flow & Type Guards to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Type Narrowing, Control Flow & Type Guards এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Type Narrowing, Control Flow & Type Guards to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Type Narrowing, Control Flow & Type Guards এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Type Narrowing, Control Flow & Type Guards",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 9. Type Narrowing, Control Flow & Type Guards\nconsole.log(\"Mastering Type Narrowing, Control Flow & Type Guards in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Type Narrowing, Control Flow & Type Guards and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 9 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-10",
    "track": "typescript",
    "order": 10,
    "chapter": "Chapter 1: Fundamentals",
    "difficulty": "Beginner",
    "title": {
      "en": "10. Mini Project: Typed Utility Function Library",
      "bn": "10. Mini Project: Typed Utility Function Library"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Mini Project: Typed Utility Function Library.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Mini Project: Typed Utility Function Library to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mini Project: Typed Utility Function Library এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Mini Project: Typed Utility Function Library to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mini Project: Typed Utility Function Library এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Mini Project: Typed Utility Function Library",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 10. Mini Project: Typed Utility Function Library\nconsole.log(\"Mastering Mini Project: Typed Utility Function Library in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Mini Project: Typed Utility Function Library and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 10 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-11",
    "track": "typescript",
    "order": 11,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "11. Optional Properties & Strict Null Checks (strictNullChecks)",
      "bn": "11. Optional Properties & Strict Null Checks (strictNullChecks)"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Optional Properties & Strict Null Checks (strictNullChecks).",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Optional Properties & Strict Null Checks (strictNullChecks) to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Optional Properties & Strict Null Checks (strictNullChecks) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Optional Properties & Strict Null Checks (strictNullChecks) to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Optional Properties & Strict Null Checks (strictNullChecks) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Optional Properties & Strict Null Checks (strictNullChecks)",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 11. Optional Properties & Strict Null Checks (strictNullChecks)\nconsole.log(\"Mastering Optional Properties & Strict Null Checks (strictNullChecks) in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Optional Properties & Strict Null Checks (strictNullChecks) and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 11 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-12",
    "track": "typescript",
    "order": 12,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "12. Enums vs Union String Literals",
      "bn": "12. Enums vs Union String Literals"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Enums vs Union String Literals.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Enums vs Union String Literals to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Enums vs Union String Literals এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Enums vs Union String Literals to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Enums vs Union String Literals এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Enums vs Union String Literals",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 12. Enums vs Union String Literals\nconsole.log(\"Mastering Enums vs Union String Literals in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Enums vs Union String Literals and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 12 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-13",
    "track": "typescript",
    "order": 13,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "13. Generics (function identity<T>(arg: T): T)",
      "bn": "13. Generics (function identity<T>(arg: T): T)"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Generics (function identity<T>(arg: T): T).",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Generics allow you to write reusable functions and classes that work with any type while preserving type safety.",
        "bn": "জেনেরিক্স ব্যবহার করে যেকোনো টাইপের জন্য পুনর্ব্যবহারযোগ্য কোড লেখা যায়।"
      },
      "simple": {
        "en": "Generics allow you to write reusable functions and classes that work with any type while preserving type safety.",
        "bn": "জেনেরিক্স ব্যবহার করে যেকোনো টাইপের জন্য পুনর্ব্যবহারযোগ্য কোড লেখা যায়।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Generics (function identity<T>(arg: T): T)",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// Generic Function: preserves exact type\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst numVal = identity<number>(42);\nconst strVal = identity<string>(\"Clearfeed\");\nconsole.log(\"Generic Returns:\", numVal, strVal);"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Generics (function identity<T>(arg: T): T) and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 13 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-14",
    "track": "typescript",
    "order": 14,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "14. Generic Constraints & Default Type Parameters",
      "bn": "14. Generic Constraints & Default Type Parameters"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Generic Constraints & Default Type Parameters.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Generic Constraints & Default Type Parameters to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Generic Constraints & Default Type Parameters এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Generic Constraints & Default Type Parameters to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Generic Constraints & Default Type Parameters এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Generic Constraints & Default Type Parameters",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 14. Generic Constraints & Default Type Parameters\nconsole.log(\"Mastering Generic Constraints & Default Type Parameters in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Generic Constraints & Default Type Parameters and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 14 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-15",
    "track": "typescript",
    "order": 15,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "15. Utility Types: Partial, Required, Pick, Omit, Record",
      "bn": "15. Utility Types: Partial, Required, Pick, Omit, Record"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Utility Types: Partial, Required, Pick, Omit, Record.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Utility types like Partial, Pick, Omit transform existing types without rewriting them.",
        "bn": "ইউটিলিটি টাইপস দিয়ে সহজেই বিদ্যমান টাইপ থেকে নতুন টাইপ তৈরি করা যায়।"
      },
      "simple": {
        "en": "Utility types like Partial, Pick, Omit transform existing types without rewriting them.",
        "bn": "ইউটিলিটি টাইপস দিয়ে সহজেই বিদ্যমান টাইপ থেকে নতুন টাইপ তৈরি করা যায়।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Utility Types: Partial, Required, Pick, Omit, Record",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// Utility Types: Partial, Pick, Omit\ninterface Post {\n  id: string;\n  title: string;\n  content: string;\n  published: boolean;\n}\n\n// Partial: all properties optional\ntype PostDraft = Partial<Post>;\n\n// Pick: only selected properties\ntype PostSummary = Pick<Post, \"id\" | \"title\">;\n\nconst summary: PostSummary = { id: \"p1\", title: \"TypeScript Mastery\" };\nconsole.log(\"Post Summary:\", summary);"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Utility Types: Partial, Required, Pick, Omit, Record and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 15 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-16",
    "track": "typescript",
    "order": 16,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "16. Mapped Types & Conditional Types (T extends U ? X : Y)",
      "bn": "16. Mapped Types & Conditional Types (T extends U ? X : Y)"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Mapped Types & Conditional Types (T extends U ? X : Y).",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Mapped Types & Conditional Types (T extends U ? X : Y) to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mapped Types & Conditional Types (T extends U ? X : Y) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Mapped Types & Conditional Types (T extends U ? X : Y) to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mapped Types & Conditional Types (T extends U ? X : Y) এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Mapped Types & Conditional Types (T extends U ? X : Y)",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 16. Mapped Types & Conditional Types (T extends U ? X : Y)\nconsole.log(\"Mastering Mapped Types & Conditional Types (T extends U ? X : Y) in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Mapped Types & Conditional Types (T extends U ? X : Y) and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 16 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-17",
    "track": "typescript",
    "order": 17,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "17. keyof, typeof & Indexed Access Types",
      "bn": "17. keyof, typeof & Indexed Access Types"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with keyof, typeof & Indexed Access Types.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn keyof, typeof & Indexed Access Types to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে keyof, typeof & Indexed Access Types এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn keyof, typeof & Indexed Access Types to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে keyof, typeof & Indexed Access Types এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master keyof, typeof & Indexed Access Types",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 17. keyof, typeof & Indexed Access Types\nconsole.log(\"Mastering keyof, typeof & Indexed Access Types in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating keyof, typeof & Indexed Access Types and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 17 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-18",
    "track": "typescript",
    "order": 18,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "18. Discriminated Unions for Safe Application States",
      "bn": "18. Discriminated Unions for Safe Application States"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Discriminated Unions for Safe Application States.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Discriminated Unions for Safe Application States to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Discriminated Unions for Safe Application States এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Discriminated Unions for Safe Application States to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Discriminated Unions for Safe Application States এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Discriminated Unions for Safe Application States",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 18. Discriminated Unions for Safe Application States\nconsole.log(\"Mastering Discriminated Unions for Safe Application States in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Discriminated Unions for Safe Application States and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 18 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-19",
    "track": "typescript",
    "order": 19,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "19. Declaration Files (.d.ts) & Third-Party Typings",
      "bn": "19. Declaration Files (.d.ts) & Third-Party Typings"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Declaration Files (.d.ts) & Third-Party Typings.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Declaration Files (.d.ts) & Third-Party Typings to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Declaration Files (.d.ts) & Third-Party Typings এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Declaration Files (.d.ts) & Third-Party Typings to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Declaration Files (.d.ts) & Third-Party Typings এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Declaration Files (.d.ts) & Third-Party Typings",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 19. Declaration Files (.d.ts) & Third-Party Typings\nconsole.log(\"Mastering Declaration Files (.d.ts) & Third-Party Typings in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Declaration Files (.d.ts) & Third-Party Typings and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 19 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-20",
    "track": "typescript",
    "order": 20,
    "chapter": "Chapter 2: Advanced Types",
    "difficulty": "Intermediate",
    "title": {
      "en": "20. Mini Project: Typed Data Models & API Contracts",
      "bn": "20. Mini Project: Typed Data Models & API Contracts"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Mini Project: Typed Data Models & API Contracts.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Mini Project: Typed Data Models & API Contracts to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mini Project: Typed Data Models & API Contracts এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Mini Project: Typed Data Models & API Contracts to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Mini Project: Typed Data Models & API Contracts এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Mini Project: Typed Data Models & API Contracts",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 20. Mini Project: Typed Data Models & API Contracts\nconsole.log(\"Mastering Mini Project: Typed Data Models & API Contracts in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Mini Project: Typed Data Models & API Contracts and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 20 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-21",
    "track": "typescript",
    "order": 21,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "21. TypeScript with React Props, State & Event Handlers",
      "bn": "21. TypeScript with React Props, State & Event Handlers"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with TypeScript with React Props, State & Event Handlers.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn TypeScript with React Props, State & Event Handlers to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with React Props, State & Event Handlers এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn TypeScript with React Props, State & Event Handlers to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with React Props, State & Event Handlers এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master TypeScript with React Props, State & Event Handlers",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 21. TypeScript with React Props, State & Event Handlers\nconsole.log(\"Mastering TypeScript with React Props, State & Event Handlers in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating TypeScript with React Props, State & Event Handlers and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 21 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-22",
    "track": "typescript",
    "order": 22,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "22. Reusable Generic React Components in TypeScript",
      "bn": "22. Reusable Generic React Components in TypeScript"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Reusable Generic React Components in TypeScript.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Reusable Generic React Components in TypeScript to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Reusable Generic React Components in TypeScript এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Reusable Generic React Components in TypeScript to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Reusable Generic React Components in TypeScript এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Reusable Generic React Components in TypeScript",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 22. Reusable Generic React Components in TypeScript\nconsole.log(\"Mastering Reusable Generic React Components in TypeScript in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Reusable Generic React Components in TypeScript and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 22 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-23",
    "track": "typescript",
    "order": 23,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "23. Typing Async API Responses & Runtime Validation",
      "bn": "23. Typing Async API Responses & Runtime Validation"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Typing Async API Responses & Runtime Validation.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Typing Async API Responses & Runtime Validation to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Typing Async API Responses & Runtime Validation এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Typing Async API Responses & Runtime Validation to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Typing Async API Responses & Runtime Validation এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Typing Async API Responses & Runtime Validation",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 23. Typing Async API Responses & Runtime Validation\nconsole.log(\"Mastering Typing Async API Responses & Runtime Validation in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Typing Async API Responses & Runtime Validation and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 23 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-24",
    "track": "typescript",
    "order": 24,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "24. TypeScript Configuration for Node.js Applications",
      "bn": "24. TypeScript Configuration for Node.js Applications"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with TypeScript Configuration for Node.js Applications.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn TypeScript Configuration for Node.js Applications to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript Configuration for Node.js Applications এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn TypeScript Configuration for Node.js Applications to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript Configuration for Node.js Applications এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master TypeScript Configuration for Node.js Applications",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 24. TypeScript Configuration for Node.js Applications\nconsole.log(\"Mastering TypeScript Configuration for Node.js Applications in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating TypeScript Configuration for Node.js Applications and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 24 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-25",
    "track": "typescript",
    "order": 25,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "25. TypeScript with Express.js Request/Response Handlers",
      "bn": "25. TypeScript with Express.js Request/Response Handlers"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with TypeScript with Express.js Request/Response Handlers.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn TypeScript with Express.js Request/Response Handlers to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with Express.js Request/Response Handlers এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn TypeScript with Express.js Request/Response Handlers to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with Express.js Request/Response Handlers এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master TypeScript with Express.js Request/Response Handlers",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 25. TypeScript with Express.js Request/Response Handlers\nconsole.log(\"Mastering TypeScript with Express.js Request/Response Handlers in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating TypeScript with Express.js Request/Response Handlers and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 25 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-26",
    "track": "typescript",
    "order": 26,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "26. TypeScript with Next.js App Router Pages & Actions",
      "bn": "26. TypeScript with Next.js App Router Pages & Actions"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with TypeScript with Next.js App Router Pages & Actions.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn TypeScript with Next.js App Router Pages & Actions to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with Next.js App Router Pages & Actions এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn TypeScript with Next.js App Router Pages & Actions to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে TypeScript with Next.js App Router Pages & Actions এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master TypeScript with Next.js App Router Pages & Actions",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 26. TypeScript with Next.js App Router Pages & Actions\nconsole.log(\"Mastering TypeScript with Next.js App Router Pages & Actions in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating TypeScript with Next.js App Router Pages & Actions and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 26 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-27",
    "track": "typescript",
    "order": 27,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "27. Runtime Schema Validation with Zod / Type-Safe Schemas",
      "bn": "27. Runtime Schema Validation with Zod / Type-Safe Schemas"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Runtime Schema Validation with Zod / Type-Safe Schemas.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Zod bridges the gap between compile-time TypeScript and runtime API validation.",
        "bn": "রানটাইমে ডেটা ভ্যালিডেশনের জন্য Zod অত্যন্ত জনপ্রিয়।"
      },
      "simple": {
        "en": "Zod bridges the gap between compile-time TypeScript and runtime API validation.",
        "bn": "রানটাইমে ডেটা ভ্যালিডেশনের জন্য Zod অত্যন্ত জনপ্রিয়।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Runtime Schema Validation with Zod / Type-Safe Schemas",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// Runtime Validation with Zod Simulation\nconst UserSchema = {\n  parse(data) {\n    if (!data.id || typeof data.id !== \"number\") throw new Error(\"Invalid id\");\n    if (!data.email || !data.email.includes(\"@\")) throw new Error(\"Invalid email\");\n    return data;\n  }\n};\n\nconst valid = UserSchema.parse({ id: 1, email: \"dev@clearfeed.com\" });\nconsole.log(\"Parsed User Schema safely at runtime:\", valid);"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Runtime Schema Validation with Zod / Type-Safe Schemas and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 27 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-28",
    "track": "typescript",
    "order": 28,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "28. Testing Typed Code & Type-Level Testing",
      "bn": "28. Testing Typed Code & Type-Level Testing"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Testing Typed Code & Type-Level Testing.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Testing Typed Code & Type-Level Testing to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Testing Typed Code & Type-Level Testing এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Testing Typed Code & Type-Level Testing to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Testing Typed Code & Type-Level Testing এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Testing Typed Code & Type-Level Testing",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 28. Testing Typed Code & Type-Level Testing\nconsole.log(\"Mastering Testing Typed Code & Type-Level Testing in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Testing Typed Code & Type-Level Testing and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 28 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-29",
    "track": "typescript",
    "order": 29,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "29. Diagnosing & Resolving Complex Compiler Diagnostics",
      "bn": "29. Diagnosing & Resolving Complex Compiler Diagnostics"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Diagnosing & Resolving Complex Compiler Diagnostics.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Diagnosing & Resolving Complex Compiler Diagnostics to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Diagnosing & Resolving Complex Compiler Diagnostics এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Diagnosing & Resolving Complex Compiler Diagnostics to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Diagnosing & Resolving Complex Compiler Diagnostics এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Diagnosing & Resolving Complex Compiler Diagnostics",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 29. Diagnosing & Resolving Complex Compiler Diagnostics\nconsole.log(\"Mastering Diagnosing & Resolving Complex Compiler Diagnostics in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Diagnosing & Resolving Complex Compiler Diagnostics and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 29 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  },
  {
    "id": "ts-30",
    "track": "typescript",
    "order": 30,
    "chapter": "Chapter 3: TypeScript in Applications",
    "difficulty": "Advanced",
    "title": {
      "en": "30. Final TypeScript Capstone: Fully Typed Full-Stack App",
      "bn": "30. Final TypeScript Capstone: Fully Typed Full-Stack App"
    },
    "subtitle": {
      "en": "Write safer JavaScript applications with Final TypeScript Capstone: Fully Typed Full-Stack App.",
      "bn": "টাইপস্ক্রিপ্ট দিয়ে বাগ-মুক্ত কোড লিখুন।"
    },
    "explanation": {
      "whatIsIt": {
        "en": "Learn Final TypeScript Capstone: Fully Typed Full-Stack App to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Final TypeScript Capstone: Fully Typed Full-Stack App এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "simple": {
        "en": "Learn Final TypeScript Capstone: Fully Typed Full-Stack App to make your code type-safe and resilient to refactoring.",
        "bn": "টাইপস্ক্রিপ্টে Final TypeScript Capstone: Fully Typed Full-Stack App এর ব্যবহার ও কার্যপদ্ধতি।"
      },
      "whyNeedIt": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "analogy": {
        "en": "Like an exact contract between two business partners: no misunderstandings or unexpected surprises.",
        "bn": "ব্যবসায়িক চুক্তির মতো: কোনো পক্ষই ভুল বোঝাবুঝির শিকার হয় না।"
      },
      "technical": {
        "en": "Leverages TypeScript compiler type-checking, structural typing, and static verification.",
        "bn": "কম্পাইলার টাইপ চেকিং ও স্ট্যাটিক ভেরিফিকেশন।"
      }
    },
    "outcomes": [
      "Master Final TypeScript Capstone: Fully Typed Full-Stack App",
      "Write strict type annotations",
      "Avoid any and maintain type safety"
    ],
    "starterCode": {
      "javascript": "// 30. Final TypeScript Capstone: Fully Typed Full-Stack App\nconsole.log(\"Mastering Final TypeScript Capstone: Fully Typed Full-Stack App in TypeScript\");\n"
    },
    "exercise": {
      "instructions": {
        "en": "Write a TypeScript snippet demonstrating Final TypeScript Capstone: Fully Typed Full-Stack App and log the result.",
        "bn": "এই পাঠের জন্য সঠিক কোড সমাধান লিখুন।"
      },
      "hint": {
        "en": "Review the example above and implement the solution.",
        "bn": "উদাহরণ দেখে কোড সমাধান করুন।"
      },
      "solution": {
        "javascript": "console.log(\"TypeScript Lesson 30 Completed!\");"
      },
      "validation": {
        "type": "js_contains",
        "keyword": "console.log"
      }
    }
  }
];
