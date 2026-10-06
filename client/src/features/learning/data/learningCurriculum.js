// Clearfeed Learn & Practice - Beginner Web Development Curriculum
// Bilingual: English + বাংলা + Both

export const TRACKS = [
  {
    id: 'html',
    title: 'HTML',
    subtitle: {
      en: 'Build the skeleton & structure of websites',
      bn: 'ওয়েবসাইটের মূল কাঠামো ও হাড্ডি তৈরি করুন',
    },
    description: {
      en: 'HTML (HyperText Markup Language) is the foundation of every website on the internet. It defines all the headings, paragraphs, images, links, and buttons that users see.',
      bn: 'HTML হলো ইন্টারনেটের প্রতিটি ওয়েবসাইটের ভিত্তি। এটি নির্ধারণ করে কোথায় শিরোনাম, লেখা, ছবি, লিঙ্ক এবং বাটন থাকবে।',
    },
    icon: 'layout',
    color: 'from-orange-500 to-amber-500',
    accentColor: '#f97316',
    badge: 'Structure',
    totalLessons: 8,
  },
  {
    id: 'css',
    title: 'CSS',
    subtitle: {
      en: 'Make websites beautiful with colors & layouts',
      bn: 'রং, ফন্ট এবং সুন্দর লেআউট দিয়ে ওয়েবসাইট সাজান',
    },
    description: {
      en: 'CSS (Cascading Style Sheets) brings your HTML skeleton to life with colors, modern typography, spacing, flexible box layouts, and smooth hover animations.',
      bn: 'CSS দিয়ে HTML কাঠামোকে আকর্ষণীয় করা হয়। এটি দিয়ে রং, ফন্ট, মার্জিন, প্যাডিং, ফ্লেক্সবক্স এবং অ্যানিমেশন তৈরি করা যায়।',
    },
    icon: 'palette',
    color: 'from-sky-500 to-blue-600',
    accentColor: '#0284c7',
    badge: 'Design',
    totalLessons: 8,
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    subtitle: {
      en: 'Make websites interactive, alive, and smart',
      bn: 'বাটন ক্লিক, গণনা এবং জীবন্ত ইন্টারঅ্যাকশন তৈরি করুন',
    },
    description: {
      en: 'JavaScript is the programming language of the browser. It allows you to respond to button clicks, manipulate text on the fly, calculate values, and build dynamic web apps.',
      bn: 'জাভাস্ক্রিপ্ট হলো ব্রাউজারের প্রোগ্রামিং ভাষা। বাটন ক্লিকে কোনো কাজ করানো, ক্যালকুলেশন এবং লাইভ পরিবর্তন করার জন্য এটি ব্যবহৃত হয়।',
    },
    icon: 'sparkles',
    color: 'from-amber-400 to-yellow-500',
    accentColor: '#eab308',
    badge: 'Logic & Interactivity',
    totalLessons: 8,
  },
];

export const LESSONS = [
  // ==========================================
  // HTML TRACK (8 Lessons)
  // ==========================================
  {
    id: 'html-intro',
    track: 'html',
    order: 1,
    difficulty: 'Beginner',
    title: {
      en: '1. What is a Website & What is HTML?',
      bn: '১. ওয়েবসাইট ও HTML কী?',
    },
    subtitle: {
      en: 'Understanding the skeleton of every webpage.',
      bn: 'যেকোনো ওয়েবপেজের মূল হাড়গোড় বা কাঠামো বোঝা।',
    },
    explanation: {
      whatIsIt: {
        en: 'HTML stands for HyperText Markup Language. It is not a programming language like Python or C++; instead, it is a markup language that tells the web browser what elements exist on a page (like headings, text, images, and links).',
        bn: 'HTML-এর পূর্ণরূপ হলো HyperText Markup Language। এটি কোনো জটিল প্রোগ্রামিং ভাষা নয়, বরং এটি ব্রাউজারকে নির্দেশ দেয় একটি পেজে কী কী উপাদান থাকবে (যেমন শিরোনাম, লেখা, ছবি বা লিঙ্ক)।',
      },
      whyNeedIt: {
        en: 'Without HTML, a web browser would just see an empty white screen. HTML is required to give every piece of content its role—whether it is a main title, a paragraph, or a clickable button.',
        bn: 'HTML ছাড়া ব্রাউজার শুধু একটি খালি সাদা স্ক্রিন দেখবে। পেজের কোনটি শিরোনাম, কোনটি প্যারাগ্রাফ আর কোনটি বাটন—তা ব্রাউজারকে বোঝাতে HTML অপরিহার্য।',
      },
      analogy: {
        en: 'Think about building a house. The concrete pillars and brick walls give the house its structure. Without them, you cannot paint the walls or install electricity. HTML is those concrete pillars and brick walls for a website!',
        bn: 'একটি নতুন বাড়ি বানানোর কথা ভাবুন। বাড়ির রড, সিমেন্ট এবং ইটের দেয়াল হলো বাড়ির মূল কাঠামো। এগুলো ছাড়া রং বা লাইট লাগানো সম্ভব নয়। ওয়েবসাইটেও HTML হলো সেই ইটের দেয়াল!',
      },
    },
    exampleCode: {
      html: `<h1>Hello World!</h1>\n<p>Welcome to my very first webpage.</p>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'The <h1> tag represents the largest heading. The <p> tag stands for paragraph. Notice how each tag opens with <tag> and closes with </tag>.',
      bn: '<h1> ট্যাগ হলো সবচেয়ে বড় শিরোনাম। <p> ট্যাগ হলো প্যারাগ্রাফ বা অনুচ্ছেদ। খেয়াল করুন, প্রতিটি ট্যাগ <tag> দিয়ে শুরু হয় এবং </tag> দিয়ে শেষ হয়।',
    },
    starterCode: {
      html: `<!-- Type your code below -->\n<h1>My Website</h1>\n<p>I am learning HTML on Clearfeed.</p>`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Create an <h1> heading containing your name, followed by a <p> paragraph stating your favorite hobby.',
        bn: 'একটি <h1> হেডিং তৈরি করুন যাতে আপনার নাম থাকবে, এবং তার নিচে একটি <p> প্যারাগ্রাফে আপনার প্রিয় শখের কথা লিখুন।',
      },
      hint: {
        en: 'Use <h1>Your Name</h1> and <p>My hobby is coding</p>. Remember the closing slash / in tags!',
        bn: '<h1>আপনার নাম</h1> এবং <p>আমার শখ...</p> ব্যবহার করুন। ট্যাগ শেষ করার স্ল্যাশ (/) মনে রাখবেন!',
      },
      solution: {
        html: `<h1>Nasir</h1>\n<p>My hobby is building cool software!</p>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['h1', 'p'],
        minTextLength: 6,
      },
    },
  },
  {
    id: 'html-structure',
    track: 'html',
    order: 2,
    difficulty: 'Beginner',
    title: {
      en: '2. The HTML Document Skeleton',
      bn: '২. HTML ডকুমেন্টের মূল গঠন',
    },
    subtitle: {
      en: 'The standard blueprint every single webpage follows.',
      bn: 'প্রতিটি ওয়েবপেজের স্ট্যান্ডার্ড ব্লুপ্রিন্ট।',
    },
    explanation: {
      whatIsIt: {
        en: 'A proper HTML file has a standard envelope: <!DOCTYPE html> declares modern HTML5, <html> wraps everything, <head> holds meta information (like page title), and <body> holds everything visible to the user.',
        bn: 'একটি পূর্ণাঙ্গ HTML ফাইলের একটি বাঁধাই করা খাম থাকে: <!DOCTYPE html> বোঝায় এটি HTML5, <html> পুরো ফাইলটি ধরে রাখে, <head>-এ থাকে শিরোনাম ও তথ্য, এবং <body>-এর ভেতর থাকে যা স্ক্রিনে দেখা যায়।',
      },
      whyNeedIt: {
        en: 'Web browsers need this structure to properly parse your page, display the tab title in the browser bar, and know what language and encoding to use.',
        bn: 'ব্রাউজার যাতে পেজটি সঠিকভাবে পড়তে পারে এবং ব্রাউজার ট্যাবে সঠিক নাম দেখাতে পারে, সেজন্য এই গঠন প্রয়োজন।',
      },
      analogy: {
        en: 'Think of an envelope. The address on the outside of the envelope is the <head>, while the actual handwritten letter inside is the <body>!',
        bn: 'একটি চিঠির খামের মতো চিন্তা করুন। খামের উপরের ঠিকানা ও তথ্য হলো <head>, আর খামের ভেতরে আসল চিঠিটি হলো <body>!',
      },
    },
    exampleCode: {
      html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Portfolio</title>\n  </head>\n  <body>\n    <h1>Welcome</h1>\n  </body>\n</html>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'Whatever you put inside <body>...</body> appears directly on the screen.',
      bn: '<body>...</body>-এর ভেতরে আপনি যা রাখবেন, ঠিক সেটাই স্ক্রিনে ভেসে উঠবে।',
    },
    starterCode: {
      html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Starter Page</title>\n  </head>\n  <body>\n    <!-- Add your heading and text inside here -->\n    \n  </body>\n</html>`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Inside the <body> tag, add an <h2> subheading that says "Developer in Progress" and a <p> paragraph.',
        bn: '<body> ট্যাগের ভেতরে একটি <h2> সাব-হেডিং যোগ করুন যাতে লেখা থাকবে "Developer in Progress", এবং নিচে একটি <p> প্যারাগ্রাফ যোগ করুন।',
      },
      hint: {
        en: 'Write <h2>Developer in Progress</h2> between the opening <body> and closing </body> tags.',
        bn: '<body> এবং </body> ট্যাগের ঠিক মাঝখানে <h2>Developer in Progress</h2> লিখুন।',
      },
      solution: {
        html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Starter Page</title>\n  </head>\n  <body>\n    <h2>Developer in Progress</h2>\n    <p>Starting my journey today.</p>\n  </body>\n</html>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['body', 'h2', 'p'],
        minTextLength: 10,
      },
    },
  },
  {
    id: 'html-headings-paragraphs',
    track: 'html',
    order: 3,
    difficulty: 'Beginner',
    title: {
      en: '3. Headings (h1 to h6) and Paragraphs',
      bn: '৩. হেডিংস (h1 থেকে h6) এবং প্যারাগ্রাফ',
    },
    subtitle: {
      en: 'Organizing content hierarchy from big titles to small details.',
      bn: 'বড় শিরোনাম থেকে ছোট বিবরণ পর্যন্ত লেখার স্তর সাজানো।',
    },
    explanation: {
      whatIsIt: {
        en: 'HTML provides 6 levels of headings: <h1> is the biggest and most important, descending to <h6> which is the smallest. Paragraphs are written using <p>.',
        bn: 'HTML-এ ৬ ধরনের হেডিং ট্যাগ রয়েছে: <h1> হলো সবচেয়ে বড় ও প্রধান, এবং <h6> হলো সবচেয়ে ছোট। সাধারণ লেখার জন্য <p> ট্যাগ ব্যবহার করা হয়।',
      },
      whyNeedIt: {
        en: 'Headings create hierarchy. Search engines and readers scan headings first to understand what a section is about before reading the paragraphs.',
        bn: 'হেডিং লেখার স্তর তৈরি করে। যেকোনো পাঠক বা সার্চ ইঞ্জিন প্রথমে বড় হেডিং দেখে বোঝে এখানে কী নিয়ে আলোচনা করা হয়েছে।',
      },
      analogy: {
        en: 'Like a newspaper: the front page main headline is <h1>, the article title is <h2>, sub-sections are <h3>, and the body text is <p>.',
        bn: 'সংবাদপত্রের মতো: প্রথম পাতার প্রধান শিরোনাম <h1>, ভেতরের সংবাদের নাম <h2>, ছোট বিভাগের নাম <h3>, আর বাকি খবর <p>।',
      },
    },
    exampleCode: {
      html: `<h1>Main Title (h1)</h1>\n<h2>Chapter Title (h2)</h2>\n<h3>Sub-section (h3)</h3>\n<p>This is a normal paragraph with standard text.</p>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'Notice how the browser automatically makes higher headings bigger and bolder, with natural spacing around paragraphs.',
      bn: 'দেখুন ব্রাউজার নিজে থেকেই হেডিংগুলোকে বড় ও বোল্ড করে এবং প্যারাগ্রাফের চারপাশে ফাঁকা জায়গা রাখে।',
    },
    starterCode: {
      html: `<h1>My Daily Routine</h1>\n<!-- Add an h2 for Morning and a p describing it -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Create an <h1> for "My Journal", an <h2> for "Morning", and a <p> describing what you do in the morning.',
        bn: '"My Journal" নামে একটি <h1> হেডিং, "Morning" নামে একটি <h2> হেডিং এবং নিচে একটি <p> তৈরি করুন।',
      },
      hint: {
        en: 'Use <h1>My Journal</h1> then <h2>Morning</h2> then <p>I wake up and drink coffee.</p>.',
        bn: '<h1>My Journal</h1> এর নিচে <h2>Morning</h2> এবং তারপর <p>... লিখুন।',
      },
      solution: {
        html: `<h1>My Journal</h1>\n<h2>Morning</h2>\n<p>I wake up early and practice coding.</p>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['h1', 'h2', 'p'],
        minTextLength: 15,
      },
    },
  },
  {
    id: 'html-links',
    track: 'html',
    order: 4,
    difficulty: 'Beginner',
    title: {
      en: '4. Links & Navigating the Web (<a>)',
      bn: '৪. লিঙ্ক এবং ওয়েবে ঘুরে বেড়ানো (<a>)',
    },
    subtitle: {
      en: 'Connecting web pages together using the anchor tag.',
      bn: 'অ্যাঙ্কর ট্যাগ দিয়ে এক পেজের সাথে অন্য পেজের সংযোগ স্থাপন।',
    },
    explanation: {
      whatIsIt: {
        en: 'The <a> tag (Anchor tag) creates clickable links. It uses the "href" attribute (hypertext reference) to tell the browser where to take the user when clicked.',
        bn: '<a> ট্যাগ (Anchor) দিয়ে ক্লিকযোগ্য লিঙ্ক তৈরি করা হয়। এতে "href" অ্যাট্রিবিউট ব্যবহার করে ব্রাউজারকে বলা হয় লিঙ্কে ক্লিক করলে কোন ওয়েবসাইটে যাবে।',
      },
      whyNeedIt: {
        en: 'The entire World Wide Web is connected by links! Without links, every page would be an isolated island that nobody could navigate between.',
        bn: 'পুরো ইন্টারনেট দুনিয়াই লিঙ্কের ওপর দাঁড়িয়ে! লিঙ্ক না থাকলে এক পেজ থেকে অন্য পেজে কোনোভাবেই যাওয়া সম্ভব হতো না।',
      },
      analogy: {
        en: 'Think of a portal door in a fantasy movie. Walking through the door instantly transports you to another castle. That is what a link does!',
        bn: 'একটি জাদুকরি দরজার মতো চিন্তা করুন। যে দরজায় হাত দিলে আপনি এক নিমেষে অন্য শহরে পৌঁছে যাবেন। লিঙ্ক ঠিক এই কাজটিই করে!',
      },
    },
    exampleCode: {
      html: `<a href="https://example.com" target="_blank">Visit Example Website</a>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'href is the destination URL. target="_blank" tells the browser to open the link in a new tab.',
      bn: 'href হলো গন্তব্যস্থলের ওয়েব ঠিকানা। target="_blank" দিলে লিঙ্কটি নতুন ব্রাউজার ট্যাবে খোলে।',
    },
    starterCode: {
      html: `<p>Check out these cool developer tools:</p>\n<!-- Create an <a> link below pointing to https://clearfeed.dev -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Create an <a> link with href="https://clearfeed.dev" and link text saying "Join Clearfeed".',
        bn: 'href="https://clearfeed.dev" দিয়ে একটি <a> লিঙ্ক তৈরি করুন এবং লেখার ভেতরে লিখুন "Join Clearfeed"।',
      },
      hint: {
        en: 'Write <a href="https://clearfeed.dev">Join Clearfeed</a>',
        bn: '<a href="https://clearfeed.dev">Join Clearfeed</a> লিখুন।',
      },
      solution: {
        html: `<p>Check out these cool developer tools:</p>\n<a href="https://clearfeed.dev">Join Clearfeed</a>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_contains_attr',
        tag: 'a',
        attr: 'href',
      },
    },
  },
  {
    id: 'html-images',
    track: 'html',
    order: 5,
    difficulty: 'Beginner',
    title: {
      en: '5. Adding Images to Your Webpage (<img>)',
      bn: '৫. ওয়েবপেজে ছবি যোগ করা (<img>)',
    },
    subtitle: {
      en: 'Displaying photos, graphics, and logos using src and alt attributes.',
      bn: 'src এবং alt দিয়ে ছবি, গ্রাফিক্স বা লোগো প্রদর্শন করা।',
    },
    explanation: {
      whatIsIt: {
        en: 'The <img> tag displays an image. Unlike <h1> or <p>, <img> is a self-closing tag (it does not need a closing </img>). It requires the "src" (source URL) and "alt" (alternative text description) attributes.',
        bn: '<img> ট্যাগ দিয়ে ছবি দেখানো হয়। <h1> বা <p>-এর মতো এর কোনো ক্লোজিং </img> লাগে না, এটি একাই কাজ করে। এতে "src" (ছবির ঠিকানা) এবং "alt" (ছবির বিবরণ) দিতে হয়।',
      },
      whyNeedIt: {
        en: 'Visuals make websites engaging. The alt attribute is crucial for accessibility (screen readers for blind users) and appears if the image fails to load.',
        bn: 'ছবি ওয়েবসাইটকে সুন্দর ও জীবন্ত করে। আর alt লেখাটি দৃষ্টিহীনদের স্ক্রিন-রিডার পড়ে শোনায় এবং কোনো কারণে ছবি লোড না হলে লেখাটি দেখায়।',
      },
      analogy: {
        en: 'Think of a picture frame on your living room wall. The frame itself is <img>, the photo inside is src, and the caption underneath is alt!',
        bn: 'দেয়ালে ঝুলানো একটি ছবির ফ্রেমের মতো। ফ্রেমটি হলো <img>, ফ্রেমের ভেতরের ছবিটি হলো src, আর নিচে ছবির নাম লেখা হলো alt!',
      },
    },
    exampleCode: {
      html: `<img \n  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" \n  alt="Laptop sitting on wooden desk" \n  width="300" \n/>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'src contains the web address of the image. width="300" sets the width in pixels.',
      bn: 'src-এ ছবির অনলাইন লিঙ্ক থাকে। width="300" দিয়ে ছবির প্রস্থ নির্দিষ্ট করা হয়।',
    },
    starterCode: {
      html: `<h2>My Tech Workspace</h2>\n<!-- Add an <img> tag with src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" and an alt attribute -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Add an <img> tag with src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" and an alt attribute describing the image.',
        bn: 'উপরে দেওয়া লিঙ্কটি দিয়ে একটি <img> ট্যাগ যোগ করুন এবং alt অ্যাট্রিবিউটে একটি সংক্ষিপ্ত বিবরণ লিখুন।',
      },
      hint: {
        en: 'Remember: <img src="..." alt="Code on screen" width="300" />. Do NOT write </img>.',
        bn: '<img src="..." alt="বিবরণ" /> লিখুন। কোনো </img> লিখবেন না।',
      },
      solution: {
        html: `<h2>My Tech Workspace</h2>\n<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" alt="Laptop with code on screen" width="300" />`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_contains_attr',
        tag: 'img',
        attr: 'src',
      },
    },
  },
  {
    id: 'html-lists',
    track: 'html',
    order: 6,
    difficulty: 'Beginner',
    title: {
      en: '6. Bulleted & Numbered Lists (<ul>, <ol>, <li>)',
      bn: '৬. তালিকা বা লিস্ট তৈরি (<ul>, <ol>, <li>)',
    },
    subtitle: {
      en: 'Organizing items cleanly with ordered and unordered lists.',
      bn: 'বুলেট পয়েন্ট বা ১, ২, ৩ ক্রমিক নম্বর দিয়ে সুন্দর তালিকা তৈরি।',
    },
    explanation: {
      whatIsIt: {
        en: 'HTML has two main list types: <ul> (Unordered List, shows bullet points) and <ol> (Ordered List, shows 1, 2, 3 numbers). Each item inside is wrapped in <li> (List Item).',
        bn: 'HTML-এ দুই ধরনের লিস্ট বেশি ব্যবহৃত হয়: <ul> (অর্ডারহীন, গোল ডট দিয়ে দেখায়) এবং <ol> (ক্রমিক, ১, ২, ৩ নম্বর দিয়ে দেখায়)। প্রতিটি উপাদানের জন্য <li> (List Item) ট্যাগ দিতে হয়।',
      },
      whyNeedIt: {
        en: 'Lists make information easy to digest, such as navigation menus, recipe ingredients, step-by-step guides, or feature lists.',
        bn: 'লিস্ট তথ্যকে গুছিয়ে তোলে। মেনু বার, রান্নার উপাদানের তালিকা বা নির্দেশিকা তৈরিতে লিস্টের কোনো বিকল্প নেই।',
      },
      analogy: {
        en: '<ul> is like a grocery shopping list (it does not matter if you buy apples or bread first). <ol> is like a cooking recipe where Step 1 must come before Step 2!',
        bn: '<ul> হলো বাজারের ফর্দ (আলু আগে কিনলেন না চাল, তাতে কিছু যায় আসে না)। আর <ol> হলো রান্নার রেসিপি, যেখানে ১ নম্বর ধাপের পরেই ২ নম্বর ধাপে যেতে হয়!',
      },
    },
    exampleCode: {
      html: `<h3>My Skills</h3>\n<ul>\n  <li>HTML Basics</li>\n  <li>CSS Styling</li>\n  <li>JavaScript Logic</li>\n</ul>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'Every <li> item sits neatly inside the opening <ul> and closing </ul> tags.',
      bn: 'প্রতিটি <li> উপাদান সুন্দরভাবে <ul> এবং </ul> ট্যাগের ভেতরে অবস্থান করে।',
    },
    starterCode: {
      html: `<h3>Top 3 Goals</h3>\n<!-- Create an ordered list <ol> with 3 <li> items -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Create an ordered list (<ol>) with three items (<li>) stating your top 3 coding goals.',
        bn: '<ol> ট্যাগ ব্যবহার করে তিনটি <li> উপাদানের একটি ক্রমানুযায়ী তালিকা তৈরি করুন।',
      },
      hint: {
        en: 'Use <ol> <li>Goal 1</li> <li>Goal 2</li> <li>Goal 3</li> </ol>',
        bn: '<ol> ট্যাগের ভেতরে তিনটি <li>...</li> ট্যাগ রাখুন।',
      },
      solution: {
        html: `<h3>Top 3 Goals</h3>\n<ol>\n  <li>Learn HTML</li>\n  <li>Build web projects</li>\n  <li>Help other developers</li>\n</ol>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['ol', 'li'],
        minTextLength: 10,
      },
    },
  },
  {
    id: 'html-buttons-inputs',
    track: 'html',
    order: 7,
    difficulty: 'Beginner',
    title: {
      en: '7. Buttons & Text Inputs (<button>, <input>)',
      bn: '৭. বাটন ও টেক্সট ইনপুট (<button>, <input>)',
    },
    subtitle: {
      en: 'Letting users type text and click buttons to interact.',
      bn: 'ব্যবহারকারীদের লেখা ইনপুট দেওয়া এবং বাটনে ক্লিক করার সুবিধা।',
    },
    explanation: {
      whatIsIt: {
        en: 'The <button> tag creates a clickable button. The <input> tag creates an entry box where users can type text, passwords, or emails. <input> uses a "placeholder" attribute to show helpful hint text.',
        bn: '<button> দিয়ে ক্লিকযোগ্য বাটন তৈরি করা হয়। আর <input> দিয়ে এমন একটি বাক্স তৈরি হয় যেখানে ব্যবহারকারী নাম, ইমেইল বা পাসওয়ার্ড টাইপ করতে পারে। এতে "placeholder" দিয়ে হালকা রঙের নির্দেশিকা লেখা যায়।',
      },
      whyNeedIt: {
        en: 'This is the basis of login forms, search bars, comment boxes, and chat message inputs across all websites.',
        bn: 'লগইন ফর্ম, সার্চ বক্স, কমেন্ট লেখার জায়গা এবং চ্যাট ইনপুট—সবকিছুই এই বাটন ও ইনপুট দিয়ে তৈরি।',
      },
      analogy: {
        en: 'Think of a television remote control. The power button is a <button>, and the text box where you search for a movie is an <input>!',
        bn: 'টিভির রিমোটের কথা ভাবুন। রিমোটের পাওয়ার সুইচ হলো <button>, আর ইউটিউবে গান সার্চ করার লেখার বক্সটি হলো <input>!',
      },
    },
    exampleCode: {
      html: `<input type="text" placeholder="Type your username..." />\n<button>Submit Profile</button>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'Notice that <input> is self-closing, while <button> has an opening and closing tag wrapping the button label.',
      bn: '<input> একা থাকে, কিন্তু <button> ওপেনিং ও ক্লোজিং ট্যাগের মাঝে বাটনের নাম লেখা থাকে।',
    },
    starterCode: {
      html: `<h3>Newsletter Sign Up</h3>\n<!-- Add an input with type="email" and a button saying "Subscribe" -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Create an <input> with placeholder="Enter your email" and a <button> that says "Subscribe".',
        bn: 'placeholder="Enter your email" সহ একটি <input> এবং "Subscribe" লেখা একটি <button> তৈরি করুন।',
      },
      hint: {
        en: 'Write <input type="email" placeholder="Enter your email" /> then <button>Subscribe</button>.',
        bn: '<input placeholder="..." /> এবং পাশে <button>Subscribe</button> লিখুন।',
      },
      solution: {
        html: `<h3>Newsletter Sign Up</h3>\n<input type="email" placeholder="Enter your email" />\n<button>Subscribe</button>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['input', 'button'],
        minTextLength: 8,
      },
    },
  },
  {
    id: 'html-mini-project',
    track: 'html',
    order: 8,
    difficulty: 'Challenge',
    title: {
      en: '8. Mini Project: Build Your Personal Bio Card!',
      bn: '৮. মিনি প্রজেক্ট: নিজের বায়ো কার্ড তৈরি করুন!',
    },
    subtitle: {
      en: 'Combining headings, images, lists, and buttons into a complete webpage.',
      bn: 'হেডিং, ছবি, লিস্ট এবং বাটন মিলিয়ে একটি পূর্ণাঙ্গ ওয়েবপেজ তৈরি।',
    },
    explanation: {
      whatIsIt: {
        en: 'In this mini project, you will combine all the HTML concepts you learned: headings, paragraphs, images, bulleted lists, and a contact button into a complete profile card!',
        bn: 'এই মিনি প্রজেক্টে আপনি যা যা শিখেছেন (হেডিং, প্যারাগ্রাফ, ছবি, লিস্ট এবং বাটন)—সবগুলোকে একসাথে কাজে লাগিয়ে একটি আকর্ষণীয় বায়ো কার্ড বানাবেন!',
      },
      whyNeedIt: {
        en: 'Real development is about assembling individual building blocks into something useful and coherent.',
        bn: 'আসল ডেভেলপার হওয়া মানে ছোট ছোট ট্যাগগুলোকে একসাথে জুড়ে অর্থপূর্ণ কোনো প্রজেক্ট তৈরি করা।',
      },
      analogy: {
        en: 'Like assembling Lego blocks! Each individual block is simple, but when you connect them together, you build a spaceship!',
        bn: 'লেগো খেলনার মতো! প্রতিটি ব্লক আলাদাভাবে খুব সাধারণ, কিন্তু একসাথে জুড়লে আস্ত একটি বাড়ি তৈরি হয়ে যায়!',
      },
    },
    exampleCode: {
      html: `<h1>Developer Bio</h1>\n<img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" alt="Avatar" width="120" />\n<p>Junior Web Developer passionate about frontend.</p>\n<h3>Skills:</h3>\n<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n</ul>\n<button>Contact Me</button>`,
      css: ``,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'A full structure featuring title, profile photo, bio description, skill bullet points, and an action button.',
      bn: 'একটি সম্পূর্ণ কাঠামো যাতে টাইটেল, ছবি, বিবরণ, দক্ষতার তালিকা এবং একটি কল-টু-অ্যাকশন বাটন রয়েছে।',
    },
    starterCode: {
      html: `<!-- Build your Bio Card here: -->\n<!-- 1. Heading with your name -->\n<!-- 2. Paragraph with a short bio -->\n<!-- 3. List of 2 skills you are learning -->\n<!-- 4. A button to Connect -->\n`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Build your bio card containing: an <h1> or <h2> with your name, a <p> bio, a <ul> list with at least two <li> skills, and a <button>.',
        bn: 'আপনার বায়ো কার্ডে থাকতে হবে: একটি <h1> বা <h2> নাম, একটি <p> বায়ো, অন্তত ২টি <li> সহ একটি <ul> লিস্ট এবং একটি <button>।',
      },
      hint: {
        en: 'Include <h1>, <p>, <ul> with <li>, and <button> in the editor, then click Run Code and Check Your Code.',
        bn: '<h1>, <p>, <ul>, <li> এবং <button> ব্যবহার করুন। তারপর Run Code ও Check Your Code চাপুন।',
      },
      solution: {
        html: `<h1>Alex Johnson</h1>\n<p>Aspiring developer learning web development on Clearfeed.</p>\n<h3>My Skills:</h3>\n<ul>\n  <li>Semantic HTML</li>\n  <li>Problem Solving</li>\n</ul>\n<button>Say Hello</button>`,
        css: ``,
        javascript: ``,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['h1', 'p', 'ul', 'li', 'button'],
        minTextLength: 25,
      },
    },
  },

  // ==========================================
  // CSS TRACK (8 Lessons)
  // ==========================================
  {
    id: 'css-intro',
    track: 'css',
    order: 1,
    difficulty: 'Beginner',
    title: {
      en: '1. What is CSS & Adding Colors',
      bn: '১. CSS কী এবং রঙের জাদু',
    },
    subtitle: {
      en: 'Transforming plain black-and-white text with colors.',
      bn: 'সাদা-কালো লেখাকে আকর্ষণীয় রঙে সাজিয়ে তোলা।',
    },
    explanation: {
      whatIsIt: {
        en: 'CSS stands for Cascading Style Sheets. While HTML builds the structure, CSS controls how everything looks: colors, background tones, text size, and spacing.',
        bn: 'CSS-এর পূর্ণরূপ হলো Cascading Style Sheets। HTML কাঠামো তৈরি করে, আর CSS ঠিক করে সবকিছু কেমন দেখাবে: লেখার রং, ব্যাকগ্রাউন্ড, সাইজ এবং ফাঁকা জায়গা।',
      },
      whyNeedIt: {
        en: 'Without CSS, all websites would look like plain black text on white paper from 1991. CSS is what makes a site look like modern Twitter, YouTube, or Clearfeed!',
        bn: 'CSS ছাড়া ইন্টারনেটের সব ওয়েবসাইট ১৯৯১ সালের সাদাকালো দলিলের মতো দেখাত। CSS-ই একটি সাইটকে আধুনিক ও সুন্দর করে তোলে!',
      },
      analogy: {
        en: 'HTML is the blank sketch drawing; CSS is the paintbrush, vibrant watercolors, and colorful markers!',
        bn: 'HTML হলো সাদা কাগজে পেন্সিলের আঁকা স্কেচ; আর CSS হলো সেই স্কেচে তুলি দিয়ে আঁকা চমৎকার সব রঙের খেলা!',
      },
    },
    exampleCode: {
      html: `<h1>Welcome to CSS</h1>\n<p>This text has vibrant styling.</p>`,
      css: `h1 {\n  color: #0284c7; /* Sky blue */\n}\n\np {\n  color: #16a34a; /* Emerald green */\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'We select the element (h1), open curly braces { }, and write property: value; inside.',
      bn: 'প্রথমে সিলেক্টর (h1) লিখি, তারপর সেকেন্ড ব্র্যাকেট { } দিয়ে প্রোপার্টি: ভ্যালু; লিখি।',
    },
    starterCode: {
      html: `<h1>Colorful Heading</h1>\n<p>Style this paragraph with your favorite color.</p>`,
      css: `/* Write your CSS rules here */\nh1 {\n  color: #3b82f6;\n}\n`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Change the color of the <p> paragraph to purple, tomato, or any color code like #9333ea.',
        bn: '<p> প্যারাগ্রাফের রং পরিবর্তন করে purple, tomato বা #9333ea করুন।',
      },
      hint: {
        en: 'In the CSS tab, add: p { color: purple; }',
        bn: 'CSS ট্যাবে লিখুন: p { color: purple; }',
      },
      solution: {
        html: `<h1>Colorful Heading</h1>\n<p>Style this paragraph with your favorite color.</p>`,
        css: `h1 {\n  color: #3b82f6;\n}\np {\n  color: purple;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'color',
      },
    },
  },
  {
    id: 'css-backgrounds',
    track: 'css',
    order: 2,
    difficulty: 'Beginner',
    title: {
      en: '2. Background Colors & Containers',
      bn: '২. ব্যাকগ্রাউন্ড কালার এবং কনটেইনার বক্স',
    },
    subtitle: {
      en: 'Painting backgrounds and organizing content into card blocks.',
      bn: 'পেজের পেছনে রং দেওয়া এবং কার্ড ব্লক তৈরি করা।',
    },
    explanation: {
      whatIsIt: {
        en: 'The "background-color" property fills an element with color. Combined with the HTML <div> tag (a generic divider box), you can create colorful cards and containers.',
        bn: '"background-color" প্রোপার্টি দিয়ে যেকোনো উপাদানের পেছনে রং দেওয়া যায়। HTML-এর <div> ট্যাগের সাথে এটি ব্যবহার করে সুন্দর কার্ড ও কনটেইনার বানানো যায়।',
      },
      whyNeedIt: {
        en: 'Background colors visually separate different parts of a webpage, creating clean sections like hero banners, feed cards, and sidebars.',
        bn: 'ব্যাকগ্রাউন্ড কালার পেজের বিভিন্ন অংশকে আলাদাভাবে চোখে পড়ার মতো করে তোলে, যেমন সাইডবার, ব্যানার বা পোস্ট কার্ড।',
      },
      analogy: {
        en: 'Think of putting a colorful tablecloth on your dining table. The table is the container, and the cloth is the background-color!',
        bn: 'খাবারের টেবিলের ওপর একটি সুন্দর টেবিল ক্লথ বিছানোর মতো। টেবিলটি হলো কনটেইনার, আর টেবিল ক্লথটি হলো ব্যাকগ্রাউন্ড কালার!',
      },
    },
    exampleCode: {
      html: `<div class="card">\n  <h2>Card Title</h2>\n  <p>Inside a styled background card.</p>\n</div>`,
      css: `.card {\n  background-color: #f0f9ff;\n  color: #0369a1;\n  padding: 16px;\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: '.card selects any element with class="card". Notice the light sky-blue background color.',
      bn: '.card সিলেক্টর দিয়ে class="card" যুক্ত যেকোনো উপাদানকে ডিজাইন করা যায়।',
    },
    starterCode: {
      html: `<div class="banner">\n  <h2>Special Announcement</h2>\n  <p>Learn CSS step-by-step!</p>\n</div>`,
      css: `.banner {\n  /* Set background-color to #fef3c7 or yellow */\n  \n}`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'In the CSS tab, give the .banner class a background-color of #fef3c7 (or any color of your choice).',
        bn: 'CSS ট্যাবে .banner ক্লাসে একটি background-color যোগ করুন (যেমন #fef3c7 বা আপনার পছন্দের রং)।',
      },
      hint: {
        en: 'Write: .banner { background-color: #fef3c7; }',
        bn: '.banner { background-color: #fef3c7; } লিখুন।',
      },
      solution: {
        html: `<div class="banner">\n  <h2>Special Announcement</h2>\n  <p>Learn CSS step-by-step!</p>\n</div>`,
        css: `.banner {\n  background-color: #fef3c7;\n  color: #92400e;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'background-color',
      },
    },
  },
  {
    id: 'css-fonts',
    track: 'css',
    order: 3,
    difficulty: 'Beginner',
    title: {
      en: '3. Fonts & Typography (font-size, text-align)',
      bn: '৩. ফন্ট ও লেখার স্টাইল (font-size, text-align)',
    },
    subtitle: {
      en: 'Controlling text size, weight, alignment, and readability.',
      bn: 'লেখার আকার বড়-ছোট করা, মাঝে নেওয়া ও সুন্দর করা।',
    },
    explanation: {
      whatIsIt: {
        en: 'CSS typography properties control how text reads: font-size changes how big the words are, font-family changes the font typeface, and text-align positions text (left, center, right).',
        bn: 'CSS-এর টাইপোগ্রাফি প্রোপার্টি দিয়ে লেখা নিয়ন্ত্রণ করা হয়: font-size দিয়ে লেখা বড়-ছোট করা হয়, font-family দিয়ে ফন্টের ধরন বদলানো হয়, আর text-align দিয়ে লেখাকে মাঝে বা ডানে নেওয়া হয়।',
      },
      whyNeedIt: {
        en: 'Readable typography is the difference between a website that looks professional versus one that looks amateurish.',
        bn: 'সুন্দর ফন্ট ও সঠিক সাইজ একটি ওয়েবসাইটকে প্রফেশনাল ও সহজে পড়ার উপযোগী করে তোলে।',
      },
      analogy: {
        en: 'Writing with an elegant fountain pen with neat cursive calligraphy versus scribbling with a crayon on the wall!',
        bn: 'দেয়ালে চক দিয়ে আঁকাবাঁকা লেখার বদলে মসৃণ কালির ফাউন্টেন পেন দিয়ে সুন্দর অক্ষরে লেখার মতো!',
      },
    },
    exampleCode: {
      html: `<h1>Center Heading</h1>\n<p>This text is cleanly styled.</p>`,
      css: `h1 {\n  font-size: 32px;\n  text-align: center;\n  color: #0f172a;\n}\n\np {\n  font-size: 16px;\n  text-align: center;\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'text-align: center positions both the heading and paragraph directly in the middle of the screen.',
      bn: 'text-align: center দিয়ে হেডিং এবং প্যারাগ্রাফকে স্ক্রিনের একেবারে মাঝখানে নেওয়া হয়েছে।',
    },
    starterCode: {
      html: `<h2>Main Headline</h2>\n<p>A subtitle that needs clean centering and proper font size.</p>`,
      css: `h2 {\n  /* Set text-align to center */\n}\n`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'In CSS, set text-align: center on the <h2>, and set font-size to 28px.',
        bn: 'CSS ট্যাবে <h2> এর ভেতরে text-align: center এবং font-size: 28px লিখুন।',
      },
      hint: {
        en: 'Add: h2 { text-align: center; font-size: 28px; }',
        bn: 'h2 { text-align: center; font-size: 28px; } যোগ করুন।',
      },
      solution: {
        html: `<h2>Main Headline</h2>\n<p>A subtitle that needs clean centering and proper font size.</p>`,
        css: `h2 {\n  text-align: center;\n  font-size: 28px;\n  color: #0284c7;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'text-align',
      },
    },
  },
  {
    id: 'css-box-model',
    track: 'css',
    order: 4,
    difficulty: 'Beginner',
    title: {
      en: '4. The CSS Box Model: Margin, Padding & Border',
      bn: '৪. সিএসএস বক্স মডেল: মার্জিন, প্যাডিং এবং বর্ডার',
    },
    subtitle: {
      en: 'The most important concept in web design: spacing and borders.',
      bn: 'ওয়েব ডিজাইনের সবচেয়ে গুরুত্বপূর্ণ বিষয়: ভেতরের ও বাইরের দূরত্ব।',
    },
    explanation: {
      whatIsIt: {
        en: 'Every single HTML element on a webpage is a rectangular box. The Box Model consists of: Content (the text or image), Padding (space inside the box), Border (the boundary line), and Margin (space outside the box).',
        bn: 'একটি ওয়েবপেজের প্রতিটি উপাদানই আসলে একটি চারকোনা বক্স। বক্স মডেলে ৪টি অংশ থাকে: Content (মূল লেখা বা ছবি), Padding (ভেতরের ফাঁকা জায়গা), Border (চারপাশের দেয়াল বা বর্ডার), এবং Margin (বাইরের ফাঁকা জায়গা)।',
      },
      whyNeedIt: {
        en: 'Understanding the box model is the secret to making web layouts breathe without elements cramping or colliding into each other.',
        bn: 'বক্স মডেল ঠিকমতো বুঝলেই উপাদানগুলো একে অপরের গায়ে চেপে না গিয়ে সুন্দর ও গোছানো দেখায়।',
      },
      analogy: {
        en: 'Think of a framed photo: The picture is Content. The white matting paper around the photo is Padding. The wooden frame is Border. The empty wall space around the frame is Margin!',
        bn: 'একটি বাঁধাই করা ছবির কথা ভাবুন: ভেতরের ছবিটি হলো Content। ছবির চারপাশে সাদা কাগজের মার্জিন হলো Padding। কাঠের ফ্রেমটি হলো Border। আর ফ্রেমের চারপাশে দেয়ালের ফাঁকা জায়গা হলো Margin!',
      },
    },
    exampleCode: {
      html: `<div class="box">\n  <p>Inside the box model!</p>\n</div>`,
      css: `.box {\n  background-color: #f1f5f9;\n  padding: 20px;\n  border: 2px solid #3b82f6;\n  margin: 15px;\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'padding: 20px gives breathing room inside the blue border. margin: 15px pushes other elements away on the outside.',
      bn: 'padding: 20px বর্ডারের ভেতরে ফাঁকা জায়গা দেয়, আর margin: 15px বর্ডারের বাইরে দূরত্ব তৈরি করে।',
    },
    starterCode: {
      html: `<div class="badge">\n  <h3>Clearfeed Card</h3>\n  <p>Spacing makes designs feel premium.</p>\n</div>`,
      css: `.badge {\n  background-color: #f8fafc;\n  /* Add padding: 18px and border: 2px solid #0284c7 */\n  \n}`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Give .badge a padding of 18px and a border of 2px solid #0284c7.',
        bn: '.badge ক্লাসে padding: 18px এবং border: 2px solid #0284c7 যোগ করুন।',
      },
      hint: {
        en: 'Add: padding: 18px; border: 2px solid #0284c7; inside the .badge rule.',
        bn: '.badge { padding: 18px; border: 2px solid #0284c7; } লিখুন।',
      },
      solution: {
        html: `<div class="badge">\n  <h3>Clearfeed Card</h3>\n  <p>Spacing makes designs feel premium.</p>\n</div>`,
        css: `.badge {\n  background-color: #f8fafc;\n  padding: 18px;\n  border: 2px solid #0284c7;\n  margin: 10px;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'padding',
      },
    },
  },
  {
    id: 'css-flexbox',
    track: 'css',
    order: 5,
    difficulty: 'Intermediate',
    title: {
      en: '5. Flexbox: Putting Items Side-by-Side',
      bn: '৫. ফ্লেক্সবক্স দিয়ে পাশাপাশি সাজানো',
    },
    subtitle: {
      en: 'Creating modern horizontal layouts with display: flex.',
      bn: 'display: flex দিয়ে একাধিক উপাদান এক সারিতে সাজানো।',
    },
    explanation: {
      whatIsIt: {
        en: 'By default, HTML elements stack on top of each other vertically like bricks. Flexbox (display: flex) changes that by lining items up horizontally side-by-side with simple alignment controls.',
        bn: 'সাধারণত HTML উপাদানগুলো একের নিচে আরেকটা বসে। কিন্তু Flexbox (display: flex) দিলে উপাদানগুলো পাশাপাশি এক সারিতে বসে যায়।',
      },
      whyNeedIt: {
        en: 'Every modern navigation bar, product grid, chat interface, and button group uses Flexbox!',
        bn: 'যেকোনো আধুনিক ওয়েবসাইটের মেনুবার, চ্যাট বক্স এবং বাটন পাশাপাশি রাখতে Flexbox অপরিহার্য।',
      },
      analogy: {
        en: 'Think of books on a bookshelf. Instead of stacking them in a tall, unstable vertical pile, you arrange them neatly standing side-by-side in a row!',
        bn: 'বইয়ের তাকে বই সাজানোর মতো। একটার ওপর আরেকটা চাপিয়ে না রেখে পাশাপাশি সুন্দর সারিতে সাজিয়ে রাখার মতো!',
      },
    },
    exampleCode: {
      html: `<div class="nav-bar">\n  <button>Home</button>\n  <button>Explore</button>\n  <button>Learn</button>\n</div>`,
      css: `.nav-bar {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'display: flex puts the buttons in a row. gap: 12px adds consistent space between them. justify-content: center centers the entire row.',
      bn: 'display: flex দিলে বাটনগুলো এক সারিতে আসে। gap: 12px বাটনগুলোর মাঝে দূরত্ব দেয়।',
    },
    starterCode: {
      html: `<div class="container">\n  <div class="box">Box 1</div>\n  <div class="box">Box 2</div>\n  <div class="box">Box 3</div>\n</div>`,
      css: `.container {\n  /* Add display: flex and gap: 16px */\n  \n}\n\n.box {\n  background-color: #0284c7;\n  color: white;\n  padding: 12px 20px;\n}`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'In CSS, add display: flex and gap: 16px to .container so the boxes sit side by side.',
        bn: '.container ক্লাসে display: flex এবং gap: 16px যোগ করুন যাতে বক্সগুলো পাশাপাশি বসে।',
      },
      hint: {
        en: 'Write: .container { display: flex; gap: 16px; }',
        bn: '.container { display: flex; gap: 16px; } লিখুন।',
      },
      solution: {
        html: `<div class="container">\n  <div class="box">Box 1</div>\n  <div class="box">Box 2</div>\n  <div class="box">Box 3</div>\n</div>`,
        css: `.container {\n  display: flex;\n  gap: 16px;\n}\n\n.box {\n  background-color: #0284c7;\n  color: white;\n  padding: 12px 20px;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'display',
      },
    },
  },
  {
    id: 'css-hover',
    track: 'css',
    order: 6,
    difficulty: 'Intermediate',
    title: {
      en: '6. Interactive Hover Effects & Transitions',
      bn: '৬. মাউস নিলে অ্যানিমেশন (:hover এবং transition)',
    },
    subtitle: {
      en: 'Making buttons and links respond when users move their mouse over them.',
      bn: 'মাউস রাখলে বাটনের রং মসৃণভাবে পরিবর্তন করা।',
    },
    explanation: {
      whatIsIt: {
        en: 'The :hover pseudo-class applies styles ONLY when a user hovers their mouse cursor over an element. The "transition" property makes that change smooth and animated rather than instant.',
        bn: ':hover দিয়ে মাউসের কার্সার কোনো বাটনের ওপর নিলে কী ঘটবে তা ঠিক করা হয়। আর "transition" প্রোপার্টি সেই পরিবর্তনকে মসৃণ অ্যানিমেশনে রূপ দেয়।',
      },
      whyNeedIt: {
        en: 'Micro-interactions tell the user: "Hey, this is clickable!" It makes web applications feel tactile, alive, and responsive.',
        bn: 'এই ছোট ছোট অ্যানিমেশনগুলো ব্যবহারকারীকে বুঝিয়ে দেয় এই বাটনে ক্লিক করা যাবে, যা অ্যাপকে জীবন্ত করে তোলে।',
      },
      analogy: {
        en: 'Like a smart touch lamp. When your hand gently touches it, it smoothly dims or brightens up with warm light!',
        bn: 'একটি স্পর্শ-সংবেদনশীল আধুনিক ল্যাম্পের মতো। হাত ছোঁয়ালেই যা মসৃণ আলো ছড়ায়!',
      },
    },
    exampleCode: {
      html: `<button class="magic-btn">Hover Over Me!</button>`,
      css: `.magic-btn {\n  background-color: #0284c7;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: 0.3s ease;\n}\n\n.magic-btn:hover {\n  background-color: #0369a1;\n  transform: translateY(-2px);\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'transition: 0.3s ease makes the color and position transition take 0.3 seconds smoothly.',
      bn: 'transition: 0.3s দিলে রং ও অবস্থান পরিবর্তন ০.৩ সেকেন্ড ধরে মসৃণভাবে ঘটে।',
    },
    starterCode: {
      html: `<button class="btn">Explore Courses</button>`,
      css: `.btn {\n  background-color: #10b981;\n  color: white;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: 0.2s;\n}\n\n/* Add .btn:hover with a darker background-color */\n`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Add a .btn:hover rule that changes background-color to #059669 when hovered.',
        bn: 'একটি .btn:hover রুল যোগ করুন যাতে মাউস নিলে background-color বদলে #059669 হয়।',
      },
      hint: {
        en: 'Write: .btn:hover { background-color: #059669; }',
        bn: '.btn:hover { background-color: #059669; } লিখুন।',
      },
      solution: {
        html: `<button class="btn">Explore Courses</button>`,
        css: `.btn {\n  background-color: #10b981;\n  color: white;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: 0.2s;\n}\n\n.btn:hover {\n  background-color: #059669;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_contains',
        keyword: ':hover',
      },
    },
  },
  {
    id: 'css-border-radius-shadow',
    track: 'css',
    order: 7,
    difficulty: 'Intermediate',
    title: {
      en: '7. Rounded Corners & Drop Shadows',
      bn: '৭. গোলাকার কোণা ও ছায়ার গভীরতা (border-radius, box-shadow)',
    },
    subtitle: {
      en: 'Softening sharp corners and adding depth like real physical cards.',
      bn: 'কোণাগুলোকে মসৃণ গোল করা এবং নিচে সুন্দর ছায়া ফেলা।',
    },
    explanation: {
      whatIsIt: {
        en: 'border-radius rounds the sharp edges of any box. box-shadow creates a soft shadow underneath, making elements look like they are elevated above the screen.',
        bn: 'border-radius দিয়ে চারকোনা ধারালো কোণাগুলোকে সুন্দরভাবে গোল করা যায়। আর box-shadow দিয়ে নিচে হালকা ছায়া ফেলা যায় যাতে জিনিসগুলো ত্রিমাত্রিক দেখায়।',
      },
      whyNeedIt: {
        en: 'Modern design (Apple, Twitter, Clearfeed) uses rounded cards and subtle shadows to feel approachable, tactile, and sleek.',
        bn: 'আধুনিক ডিজাইনে চোখ ধাঁধানো ভাব আনতে এবং সবকিছুকে নরম ও মসৃণ দেখাতে এই দুটি প্রোপার্টি সবচেয়ে জনপ্রিয়।',
      },
      analogy: {
        en: 'Think of a modern smartphone with curved smooth edges resting on a white table, casting a soft shadow on the wood!',
        bn: 'টেবিলের ওপর রাখা একটি আধুনিক কার্ভড স্মার্টফোনের মতো, যার নিচে কাঠের ওপর হালকা সুন্দর ছায়া পড়ে থাকে!',
      },
    },
    exampleCode: {
      html: `<div class="elevated-card">\n  <h3>Floating Card</h3>\n  <p>Feels elevated off the page.</p>\n</div>`,
      css: `.elevated-card {\n  background: white;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'border-radius: 16px rounds the corners. box-shadow creates the elevation effect.',
      bn: 'border-radius: 16px কোণা গোল করে, আর box-shadow হালকা ছায়া তৈরি করে।',
    },
    starterCode: {
      html: `<div class="card">\n  <h3>Pro Developer</h3>\n  <p>Learning modern styling.</p>\n</div>`,
      css: `.card {\n  background-color: #ffffff;\n  padding: 20px;\n  /* Add border-radius: 14px and a box-shadow */\n  \n}`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Add border-radius: 14px and box-shadow: 0 4px 12px rgba(0,0,0,0.08) to the .card class.',
        bn: '.card ক্লাসে border-radius: 14px এবং box-shadow: 0 4px 12px rgba(0,0,0,0.08) যোগ করুন।',
      },
      hint: {
        en: 'Write: border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); inside .card.',
        bn: '.card { border-radius: 14px; box-shadow: ... } লিখুন।',
      },
      solution: {
        html: `<div class="card">\n  <h3>Pro Developer</h3>\n  <p>Learning modern styling.</p>\n</div>`,
        css: `.card {\n  background-color: #ffffff;\n  padding: 20px;\n  border-radius: 14px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.08);\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_property',
        property: 'border-radius',
      },
    },
  },
  {
    id: 'css-mini-project',
    track: 'css',
    order: 8,
    difficulty: 'Challenge',
    title: {
      en: '8. Mini Project: Style a Complete Profile Card!',
      bn: '৮. মিনি প্রজেক্ট: আকর্ষণীয় প্রোফাইল কার্ড ডিজাইন!',
    },
    subtitle: {
      en: 'Combine Flexbox, colors, box-model, and hover effects into a showcase card.',
      bn: 'সবগুলো CSS কৌশল একসাথে ব্যবহার করে একটি চমৎকার কার্ড তৈরি।',
    },
    explanation: {
      whatIsIt: {
        en: 'Now put everything together: Take an HTML structure and style it with colors, rounded corners, padding, a hoverable button, and a clean shadow.',
        bn: 'এখন সবকিছু একসাথে কাজে লাগানোর সময়: ব্যাকগ্রাউন্ড কালার, গোল কোণা, প্যাডিং, ছায়া এবং অ্যানিমেশন যুক্ত বাটন দিয়ে কার্ড সাজান।',
      },
      whyNeedIt: {
        en: 'This is the exact way modern social cards, member widgets, and user profiles in Clearfeed are created!',
        bn: 'Clearfeed-এর যেকোনো মেম্বার কার্ড বা পোস্ট কার্ড ঠিক এভাবেই তৈরি করা হয়!',
      },
      analogy: {
        en: 'Decorating a furnished apartment: painting walls, putting down carpets, arranging furniture, and hanging lamps!',
        bn: 'একটি নতুন ফ্ল্যাট সাজানোর মতো: দেয়ালে রং করা, কার্পেট বিছানো, ফার্নিচার সাজানো এবং সুন্দর লাইট লাগানো!',
      },
    },
    exampleCode: {
      html: `<div class="profile-card">\n  <h2>Dev Star</h2>\n  <p>Frontend Explorer</p>\n  <button class="follow-btn">Follow</button>\n</div>`,
      css: `.profile-card {\n  background: #ffffff;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 8px 20px rgba(0,0,0,0.06);\n  text-align: center;\n}\n\n.follow-btn {\n  background: #0284c7;\n  color: white;\n  border: none;\n  padding: 8px 18px;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: 0.2s;\n}\n\n.follow-btn:hover {\n  background: #0369a1;\n}`,
      javascript: ``,
    },
    exampleExplanation: {
      en: 'Notice how cleanly all CSS rules combine to create a delightful result.',
      bn: 'লক্ষ করুন কীভাবে সবগুলো নিয়ম মিলে একটি আকর্ষণীয় ফলাফল তৈরি করেছে।',
    },
    starterCode: {
      html: `<div class="user-card">\n  <h2>Samir Khan</h2>\n  <p>Web Developer</p>\n  <button class="action-btn">Connect</button>\n</div>`,
      css: `/* Add background-color, padding, border-radius, and button styling */\n.user-card {\n  background-color: #f8fafc;\n  padding: 20px;\n  border-radius: 12px;\n  text-align: center;\n}\n\n.action-btn {\n  background-color: #0284c7;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 8px;\n  cursor: pointer;\n}\n`,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: 'Add a hover effect on .action-btn:hover, and give .user-card a box-shadow.',
        bn: '.action-btn:hover এ একটি কালার পরিবর্তন যোগ করুন এবং .user-card এ একটি box-shadow দিন।',
      },
      hint: {
        en: 'Add box-shadow to .user-card, and write .action-btn:hover { background-color: #0369a1; }',
        bn: '.user-card এ box-shadow এবং .action-btn:hover এ নতুন কালার দিন।',
      },
      solution: {
        html: `<div class="user-card">\n  <h2>Samir Khan</h2>\n  <p>Web Developer</p>\n  <button class="action-btn">Connect</button>\n</div>`,
        css: `.user-card {\n  background-color: #f8fafc;\n  padding: 20px;\n  border-radius: 12px;\n  text-align: center;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.08);\n}\n\n.action-btn {\n  background-color: #0284c7;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: 0.2s;\n}\n\n.action-btn:hover {\n  background-color: #0369a1;\n}`,
        javascript: ``,
      },
      validation: {
        type: 'css_contains',
        keyword: ':hover',
      },
    },
  },

  // ==========================================
  // JAVASCRIPT TRACK (8 Lessons)
  // ==========================================
  {
    id: 'js-intro',
    track: 'javascript',
    order: 1,
    difficulty: 'Beginner',
    title: {
      en: '1. What is JavaScript & Console Output',
      bn: '১. জাভাস্ক্রিপ্ট কী এবং কনসোলে আউটপুট',
    },
    subtitle: {
      en: 'The brain of the web browser: printing messages and running code.',
      bn: 'ব্রাউজারের মস্তিষ্ক: স্ক্রিনে বার্তা পাঠানো ও কোড চালানো।',
    },
    explanation: {
      whatIsIt: {
        en: 'JavaScript is a real programming language that runs directly in your web browser. It allows you to calculate numbers, store information, and react when users click or type.',
        bn: 'জাভাস্ক্রিপ্ট হলো একটি আসল প্রোগ্রামিং ভাষা যা সরাসরি আপনার ওয়েব ব্রাউজারে কাজ করে। এটি দিয়ে হিসাব করা, তথ্য মনে রাখা এবং ব্যবহারকারীর ক্লিকে সাড়া দেওয়া যায়।',
      },
      whyNeedIt: {
        en: 'HTML is static, CSS is style, but JavaScript is ACTION. It is what makes Netflix play videos, Google Search autocomplete, and Clearfeed like posts!',
        bn: 'HTML হলো স্থির কাঠামো, CSS হলো রং, কিন্তু জাভাস্ক্রিপ্ট হলো আসল কাজ। ফেসবুকের লাইক বাটন বা গুগলের সার্চ সাজেশন জাভাস্ক্রিপ্ট দিয়েই চলে!',
      },
      analogy: {
        en: 'HTML is the human skeleton. CSS is the skin, hair, and clothes. JavaScript is the brain and muscles that allow walking, talking, and thinking!',
        bn: 'HTML হলো মানুষের কঙ্কাল। CSS হলো চামড়া ও সুন্দর পোশাক। আর জাভাস্ক্রিপ্ট হলো মস্তিষ্ক ও পেশী, যা মানুষকে চলাফেরা ও চিন্তা করার শক্তি দেয়!',
      },
    },
    exampleCode: {
      html: `<h1>Check Developer Console</h1>`,
      css: ``,
      javascript: `console.log("Hello from JavaScript!");\nconsole.log(10 + 20);`,
    },
    exampleExplanation: {
      en: 'console.log(...) prints messages into the browser console. It evaluated 10 + 20 and printed 30!',
      bn: 'console.log(...) ব্রাউজারের কনসোলে মেসেজ প্রিন্ট করে। এটি ১০ + ২০ যোগ করে ৩০ প্রিন্ট করেছে!',
    },
    starterCode: {
      html: `<h3>JavaScript Console Test</h3>\n<p>Open the Console tab below to see output.</p>`,
      css: ``,
      javascript: `// Print your first message below using console.log\n`,
    },
    exercise: {
      instructions: {
        en: 'In the JavaScript tab, write console.log("I am learning JavaScript!"); and run the code.',
        bn: 'জাভাস্ক্রিপ্ট ট্যাবে console.log("I am learning JavaScript!"); লিখুন এবং কোডটি রান করুন।',
      },
      hint: {
        en: 'Type: console.log("I am learning JavaScript!"); then click Run Code.',
        bn: 'console.log("I am learning JavaScript!"); লিখে Run Code বাটনে চাপুন।',
      },
      solution: {
        html: `<h3>JavaScript Console Test</h3>\n<p>Open the Console tab below to see output.</p>`,
        css: ``,
        javascript: `console.log("I am learning JavaScript!");`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'console.log',
      },
    },
  },
  {
    id: 'js-variables',
    track: 'javascript',
    order: 2,
    difficulty: 'Beginner',
    title: {
      en: '2. Variables with let & const',
      bn: '২. ভেরিয়েবল বা তথ্য সংরক্ষণ (let ও const)',
    },
    subtitle: {
      en: 'Storing values in memory using labeled containers.',
      bn: 'নাম দেওয়া বাক্সে তথ্য বা মান জমা রাখা।',
    },
    explanation: {
      whatIsIt: {
        en: 'A variable is a named storage container for data. In modern JavaScript, we declare variables using "let" (for values that can change) and "const" (for constants that never change).',
        bn: 'ভেরিয়েবল হলো কোনো তথ্য বা মান জমা রাখার একটি নাম দেওয়া পাত্র। আধুনিক জাভাস্ক্রিপ্টে পরিবর্তনশীল তথ্যের জন্য "let" এবং অপরিবর্তনশীল তথ্যের জন্য "const" ব্যবহার করা হয়।',
      },
      whyNeedIt: {
        en: 'Computers must remember user names, cart totals, game scores, and login states while someone browses a website.',
        bn: 'ব্যবহারকারীর নাম, খেলার স্কোর বা মোট টাকার পরিমাণ ওয়েবসাইট ব্যবহারের সময় মনে রাখার জন্য ভেরিয়েবল দরকার।',
      },
      analogy: {
        en: 'Think of labeled jars in your kitchen: one jar is labeled "Sugar" and another is labeled "Salt". You put whatever you want inside, and the label tells you what it is!',
        bn: 'রান্নাঘরের নাম লেখা বৈয়ামের মতো: একটির গায়ে লেখা "চিনি", আরেকটিতে লেখা "লবণ"। লেবেল দেখে খুব সহজেই জানা যায় ভেতরে কী আছে!',
      },
    },
    exampleCode: {
      html: `<h3>Variables in Action</h3>`,
      css: ``,
      javascript: `const appName = "Clearfeed";\nlet currentStreak = 3;\n\nconsole.log(appName);\nconsole.log("Current streak: " + currentStreak);`,
    },
    exampleExplanation: {
      en: 'const appName cannot be reassigned. let currentStreak can be incremented anytime.',
      bn: 'const appName এর মান বদলানো যাবে না। কিন্তু let currentStreak যে কোনো সময় বাড়ানো যাবে।',
    },
    starterCode: {
      html: `<h3>Practice Variables</h3>`,
      css: ``,
      javascript: `// 1. Declare const myName = "Your Name";\n// 2. Declare let score = 100;\n// 3. Print them with console.log\n`,
    },
    exercise: {
      instructions: {
        en: 'Create a const myName with your name, a let score = 100, and print both using console.log.',
        bn: 'আপনার নাম দিয়ে const myName এবং let score = 100 তৈরি করুন, এবং console.log দিয়ে প্রিন্ট করুন।',
      },
      hint: {
        en: 'Write: const myName = "Alex"; let score = 100; console.log(myName, score);',
        bn: 'const myName = "..."; let score = 100; console.log(myName); লিখুন।',
      },
      solution: {
        html: `<h3>Practice Variables</h3>`,
        css: ``,
        javascript: `const myName = "Nasir";\nlet score = 100;\nconsole.log(myName, score);`,
      },
      validation: {
        type: 'js_contains_any',
        keywords: ['const', 'let'],
      },
    },
  },
  {
    id: 'js-data-types',
    track: 'javascript',
    order: 3,
    difficulty: 'Beginner',
    title: {
      en: '3. Data Types: Strings, Numbers & Booleans',
      bn: '৩. ডাটা টাইপ: টেক্সট, সংখ্যা এবং সত্য/মিথ্যা',
    },
    subtitle: {
      en: 'The basic building blocks of all information in programming.',
      bn: 'প্রোগ্রামিংয়ের তথ্যের মূল ভিত্তি।',
    },
    explanation: {
      whatIsIt: {
        en: 'JavaScript has 3 core primitive data types you will use constantly: String (text wrapped in quotes like "hello"), Number (numeric digits like 42 or 3.14), and Boolean (either true or false).',
        bn: 'জাভাস্ক্রিপ্টে ৩টি প্রধান ডাটা টাইপ সবচেয়ে বেশি ব্যবহৃত হয়: String (কোটেশনে মোড়ানো লেখা যেমন "hello"), Number (সংখ্যা যেমন ৪২ বা ৩.১৪), এবং Boolean (শুধুমাত্র true বা false)।',
      },
      whyNeedIt: {
        en: 'Programming is all about knowing what type of data you are handling. You add numbers together (5 + 5 = 10), but you glue strings together ("5" + "5" = "55")!',
        bn: 'কম্পিউটারকে জানতে হয় এটি কী ধরনের তথ্য। কারণ সংখ্যার ক্ষেত্রে ৫ + ৫ = ১০ হয়, কিন্তু টেক্সটের ক্ষেত্রে "৫" + "৫" = "৫৫" হয়ে যায়!',
      },
      analogy: {
        en: 'A book has sentences (Strings), page numbers (Numbers), and an on/off bookmark (Boolean: isRead = true / false)!',
        bn: 'একটি বইয়ের গল্প হলো টেক্সট (String), পৃষ্ঠার নম্বর হলো সংখ্যা (Number), আর বইটি পড়া শেষ হয়েছে কি না তা হলো সত্য/মিথ্যা (Boolean)!',
      },
    },
    exampleCode: {
      html: `<h3>Data Types</h3>`,
      css: ``,
      javascript: `let title = "Web Basics"; // String\nlet lessonsCount = 8;     // Number\nlet isPublished = true;   // Boolean\n\nconsole.log(typeof title);\nconsole.log(typeof lessonsCount);\nconsole.log(typeof isPublished);`,
    },
    exampleExplanation: {
      en: 'typeof reveals the data type of any variable in JavaScript.',
      bn: 'typeof দিয়ে যেকোনো ভেরিয়েবল কোন ধরনের ডাটা টাইপ তা দেখা যায়।',
    },
    starterCode: {
      html: `<h3>Practice Data Types</h3>`,
      css: ``,
      javascript: `// Create a string, a number, and a boolean variable\n`,
    },
    exercise: {
      instructions: {
        en: 'Declare a string variable for language, a number variable for hours, and a boolean isFun = true.',
        bn: 'একটি স্ট্রিং ভেরিয়েবল language, একটি সংখ্যা ভেরিয়েবল hours এবং একটি বুলিয়ান isFun = true তৈরি করুন।',
      },
      hint: {
        en: 'Write: let language = "JavaScript"; let hours = 5; let isFun = true;',
        bn: 'let language = "JS"; let hours = 2; let isFun = true; লিখুন।',
      },
      solution: {
        html: `<h3>Practice Data Types</h3>`,
        css: ``,
        javascript: `let language = "JavaScript";\nlet hours = 5;\nlet isFun = true;\nconsole.log(language, hours, isFun);`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'true',
      },
    },
  },
  {
    id: 'js-conditions',
    track: 'javascript',
    order: 4,
    difficulty: 'Beginner',
    title: {
      en: '4. If / Else: Making Decisions',
      bn: '৪. শর্ত এবং সিদ্ধান্ত নেওয়া (if / else)',
    },
    subtitle: {
      en: 'Teaching your code how to make choices based on conditions.',
      bn: 'কোডকে শর্ত অনুযায়ী বিভিন্ন সিদ্ধান্ত নেওয়ার ক্ষমতা দেওয়া।',
    },
    explanation: {
      whatIsIt: {
        en: 'The "if" statement runs a block of code ONLY if a condition is true. If the condition is false, the "else" block runs instead.',
        bn: '"if" স্টেটমেন্ট একটি নির্দিষ্ট শর্ত পূরণ হলেই ভেতরের কোড চালায়। আর শর্ত পূরণ না হলে "else" অংশের কোড কাজ করে।',
      },
      whyNeedIt: {
        en: 'Web apps make decisions constantly: "If user is logged in, show feed. Else, show login button."',
        bn: 'সব ওয়েবসাইটেই সিদ্ধান্ত নিতে হয়: "যদি ইউজার লগইন করা থাকে তবে হোমপেজ দেখাও, নয়তো লগইন বাটন দেখাও।"',
      },
      analogy: {
        en: 'Like checking the weather before leaving home: IF it is raining, take an umbrella; ELSE, wear your favorite sunglasses!',
        bn: 'ঘর থেকে বের হওয়ার সিদ্ধান্তের মতো: যদি বৃষ্টি হয় (if), তবে ছাতা নাও; নয়তো (else), সানগ্লাস পরে বের হও!',
      },
    },
    exampleCode: {
      html: `<h3>Decisions in Code</h3>`,
      css: ``,
      javascript: `let userScore = 85;\n\nif (userScore >= 80) {\n  console.log("Outstanding job! Passed with honors.");\n} else {\n  console.log("Keep practicing, you will get it!");\n}`,
    },
    exampleExplanation: {
      en: 'Since 85 is greater than 80, the first block executes and prints the celebration message.',
      bn: 'যেহেতু ৮৫ সংখ্যাটি ৮০-এর বেশি, তাই প্রথম ব্লকের কোডটি চলে অভিনন্দন বার্তা দিয়েছে।',
    },
    starterCode: {
      html: `<h3>Check Age for Voting</h3>`,
      css: ``,
      javascript: `let age = 18;\n\n// Write an if statement: if age >= 18 print "Eligible", else print "Too young"\n`,
    },
    exercise: {
      instructions: {
        en: 'Write an if / else condition checking if age >= 18. If true, print "Eligible"; otherwise print "Too young".',
        bn: 'age >= 18 শর্ত দিয়ে একটি if / else লিখুন। সত্য হলে "Eligible", নয়তো "Too young" প্রিন্ট করুন।',
      },
      hint: {
        en: 'if (age >= 18) { console.log("Eligible"); } else { console.log("Too young"); }',
        bn: 'if (age >= 18) { console.log("Eligible"); } else { ... } লিখুন।',
      },
      solution: {
        html: `<h3>Check Age for Voting</h3>`,
        css: ``,
        javascript: `let age = 18;\nif (age >= 18) {\n  console.log("Eligible");\n} else {\n  console.log("Too young");\n}`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'if',
      },
    },
  },
  {
    id: 'js-functions',
    track: 'javascript',
    order: 5,
    difficulty: 'Intermediate',
    title: {
      en: '5. Functions: Reusable Code Recipes',
      bn: '৫. ফাংশন বা কাজের রেসিপি (Functions)',
    },
    subtitle: {
      en: 'Bundling instructions together so you can run them anytime.',
      bn: 'কাজের নির্দেশিকা এক জায়গায় বেঁধে রেখে বারবার ব্যবহার করা।',
    },
    explanation: {
      whatIsIt: {
        en: 'A function is a reusable block of code designed to perform a specific task. You define it once, give it a name, and can call it thousands of times with different inputs (parameters).',
        bn: 'ফাংশন হলো কোনো নির্দিষ্ট কাজ করার জন্য তৈরি করা একটি কোডের বান্ডিল। এটি একবার লিখে নাম দিয়ে রাখলে যখন খুশি যতবার খুশি কল করে চালানো যায়।',
      },
      whyNeedIt: {
        en: 'Without functions, you would have to duplicate the exact same 20 lines of code every single time a user calculates a price or submits a form.',
        bn: 'ফাংশন না থাকলে একই ২০ লাইনের কোড বারবার কপি-পেস্ট করতে হতো, যা কোডকে নষ্ট করে দেয়।',
      },
      analogy: {
        en: 'Think of an electric blender: you press the "Blend" button. It takes whatever fruits you put inside (inputs), blends them, and gives you a delicious smoothie (output)!',
        bn: 'একটি ব্লেন্ডার মেশিনের মতো: আপনি ব্লেন্ডারে যে ফলই দেন না কেন (ইনপুট), সুইচ চাপলেই সে জুস বানিয়ে দেয় (আউটপুট)!',
      },
    },
    exampleCode: {
      html: `<h3>Functions</h3>`,
      css: ``,
      javascript: `function greetUser(name) {\n  return "Welcome to Clearfeed, " + name + "!";\n}\n\nlet message = greetUser("Rahim");\nconsole.log(message);`,
    },
    exampleExplanation: {
      en: 'name is a parameter. When we call greetUser("Rahim"), it returns "Welcome to Clearfeed, Rahim!".',
      bn: 'name হলো প্যারামিটার। greetUser("Rahim") ডাকলেই সে নামের সাথে শুভেচ্ছা বাক্য ফেরত দেয়।',
    },
    starterCode: {
      html: `<h3>Calculate Total</h3>`,
      css: ``,
      javascript: `// Write a function add(a, b) that returns a + b\n`,
    },
    exercise: {
      instructions: {
        en: 'Write a function named add(a, b) that returns the sum of a and b. Then call it with add(15, 25) and log the result.',
        bn: 'add(a, b) নামে একটি ফাংশন লিখুন যা a + b ফেরত দেবে। তারপর add(15, 25) কল করে প্রিন্ট করুন।',
      },
      hint: {
        en: 'function add(a, b) { return a + b; } console.log(add(15, 25));',
        bn: 'function add(a, b) { return a + b; } লিখুন।',
      },
      solution: {
        html: `<h3>Calculate Total</h3>`,
        css: ``,
        javascript: `function add(a, b) {\n  return a + b;\n}\nconsole.log(add(15, 25));`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'function',
      },
    },
  },
  {
    id: 'js-dom',
    track: 'javascript',
    order: 6,
    difficulty: 'Intermediate',
    title: {
      en: '6. The DOM: Changing HTML with JavaScript',
      bn: '৬. জাভাস্ক্রিপ্ট দিয়ে লাইভ HTML পরিবর্তন (The DOM)',
    },
    subtitle: {
      en: 'Grabbing elements on the page and changing their text dynamically.',
      bn: 'পেজের উপাদান খুঁজে নিয়ে চোখের পলকে তার লেখা বদলে দেওয়া।',
    },
    explanation: {
      whatIsIt: {
        en: 'The DOM (Document Object Model) is how JavaScript sees your HTML page. Using document.getElementById("..."), JavaScript can grab any HTML tag and change its text content or colors on the fly!',
        bn: 'DOM হলো জাভাস্ক্রিপ্টের চোখে পুরো ওয়েবপেজটি। document.getElementById("...") দিয়ে জাভাস্ক্রিপ্ট যেকোনো HTML ট্যাগ ধরে ফেলতে পারে এবং সাথে সাথে তার লেখা বা ডিজাইন বদলে দিতে পারে!',
      },
      whyNeedIt: {
        en: 'This is how websites update without reloading the whole page: notifications counter changes, post like number jumps from 4 to 5, or names update.',
        bn: 'পুরো পেজ রিলোড না দিয়েই লাইক সংখ্যা ৪ থেকে ৫ হওয়া বা নোটিফিকেশন আসা—সবকিছুই এভাবে পেজের লেখা বদলে করা হয়।',
      },
      analogy: {
        en: 'Think of using a TV remote control. You press a button on the remote, and the channel title on your TV screen instantly changes!',
        bn: 'টিভির রিমোটের মতো। রিমোটের বাটন চাপলে যেমন টিভির ডিসপ্লের চ্যানেলের নাম বা শব্দ সাথে সাথে বদলে যায়!',
      },
    },
    exampleCode: {
      html: `<h1 id="headline">Old Heading</h1>\n<button id="btn">Update Text</button>`,
      css: ``,
      javascript: `const heading = document.getElementById("headline");\nheading.textContent = "Magical New Heading!";`,
    },
    exampleExplanation: {
      en: 'document.getElementById("headline") found the <h1> tag, and .textContent changed the words inside it!',
      bn: 'getElementById দিয়ে <h1> ট্যাগটি খুঁজে বের করে .textContent দিয়ে ভেতরের লেখা বদলে দেওয়া হয়েছে!',
    },
    starterCode: {
      html: `<h2 id="status">Status: Offline</h2>\n<p>Use JavaScript to change status to "Status: Online"</p>`,
      css: ``,
      javascript: `// Select the element with id "status" and change textContent to "Status: Online"\n`,
    },
    exercise: {
      instructions: {
        en: 'Use document.getElementById("status").textContent = "Status: Online"; to update the heading text.',
        bn: 'document.getElementById("status").textContent = "Status: Online"; লিখে হেডিংয়ের লেখা পরিবর্তন করুন।',
      },
      hint: {
        en: 'Write: document.getElementById("status").textContent = "Status: Online";',
        bn: 'document.getElementById("status").textContent = "Status: Online"; লিখুন।',
      },
      solution: {
        html: `<h2 id="status">Status: Offline</h2>\n<p>Use JavaScript to change status to "Status: Online"</p>`,
        css: ``,
        javascript: `document.getElementById("status").textContent = "Status: Online";`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'getElementById',
      },
    },
  },
  {
    id: 'js-events',
    track: 'javascript',
    order: 7,
    difficulty: 'Intermediate',
    title: {
      en: '7. Button Click Events (addEventListener)',
      bn: '৭. বাটনে ক্লিক ইভেন্ট (addEventListener)',
    },
    subtitle: {
      en: 'Making web pages react when a user clicks a button.',
      bn: 'ব্যবহারকারী কোনো বাটনে ক্লিক করলে চমৎকার কাজ করানো।',
    },
    explanation: {
      whatIsIt: {
        en: 'An event is an action that happens on the webpage (like a mouse click or key press). addEventListener("click", ... ) tells the browser: "When the user clicks this button, execute this function!"',
        bn: 'ইভেন্ট হলো পেজে ব্যবহারকারীর কোনো আচরণ (যেমন মাউস ক্লিক)। addEventListener("click", ...) ব্রাউজারকে বলে: "ব্যবহারকারী যখনই এই বাটনে ক্লিক করবে, তখনই এই কোডটি চালাও!"',
      },
      whyNeedIt: {
        en: 'Buttons are useless without events. Clicking a button to submit a post, toggle dark mode, or open a modal all use click events.',
        bn: 'ক্লিক ইভেন্ট ছাড়া বাটন শুধুই একটি ছবি। ডার্ক মোড অন করা, পোস্ট সাবমিট করা বা পপআপ খোলার মূল চাবিকাঠি হলো এই ক্লিক ইভেন্ট।',
      },
      analogy: {
        en: 'Think of a doorbell. Pressing the button outside triggers the bell sound inside the house. addEventListener is the wire connecting the button to the bell!',
        bn: 'দরজার কলিং বেলের মতো। বাইরের সুইচে চাপ দিলেই ভেতরের বেল বেজে ওঠে। addEventListener হলো সেই তার যা সুইচ আর বেলের সংযোগ ঘটায়!',
      },
    },
    exampleCode: {
      html: `<button id="like-btn">❤️ Like</button>\n<p id="msg">Not liked yet.</p>`,
      css: `button { padding: 8px 16px; border-radius: 6px; cursor: pointer; }`,
      javascript: `const btn = document.getElementById("like-btn");\nconst msg = document.getElementById("msg");\n\nbtn.addEventListener("click", () => {\n  msg.textContent = "You liked this post! 🎉";\n});`,
    },
    exampleExplanation: {
      en: 'When the button is clicked, the arrow function triggers and updates the message text on the screen.',
      bn: 'বাটনে ক্লিক করার সাথে সাথে ফাংশনটি চলে স্ক্রিনের মেসেজটি বদলে দেয়।',
    },
    starterCode: {
      html: `<button id="action-btn">Click Me!</button>\n<h3 id="display">Waiting for click...</h3>`,
      css: ``,
      javascript: `const btn = document.getElementById("action-btn");\nconst display = document.getElementById("display");\n\n// Add a click listener to btn that changes display.textContent\n`,
    },
    exercise: {
      instructions: {
        en: 'Attach a "click" event listener to btn that changes display.textContent to "Button Clicked Successfully!".',
        bn: 'btn এ একটি "click" ইভেন্ট লিসেনার লাগান যা display.textContent বদলে "Button Clicked Successfully!" করবে।',
      },
      hint: {
        en: 'btn.addEventListener("click", () => { display.textContent = "Button Clicked Successfully!"; });',
        bn: 'btn.addEventListener("click", () => { display.textContent = "Button Clicked Successfully!"; }); লিখুন।',
      },
      solution: {
        html: `<button id="action-btn">Click Me!</button>\n<h3 id="display">Waiting for click...</h3>`,
        css: ``,
        javascript: `const btn = document.getElementById("action-btn");\nconst display = document.getElementById("display");\n\nbtn.addEventListener("click", () => {\n  display.textContent = "Button Clicked Successfully!";\n});`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'addEventListener',
      },
    },
  },
  {
    id: 'js-mini-project',
    track: 'javascript',
    order: 8,
    difficulty: 'Challenge',
    title: {
      en: '8. Mini Project: Interactive Click Counter!',
      bn: '৮. মিনি প্রজেক্ট: ইন্টারেক্টিভ ক্লিক কাউন্টার!',
    },
    subtitle: {
      en: 'Build a working counter app that increases numbers on button click.',
      bn: 'বাটনে ক্লিক করলেই সংখ্যা বাড়ে এমন একটি সুন্দর অ্যাপ তৈরি করুন।',
    },
    explanation: {
      whatIsIt: {
        en: 'In this mini project, you will build a real interactive web gadget! You will create a number display, an Increment button, and a Reset button.',
        bn: 'এই মিনি প্রজেক্টে আপনি একটি আসল ক্লিক কাউন্টার গ্যাজেট বানাবেন! বাটনে ক্লিক করলে সংখ্যা বাড়বে এবং আরেকটি বাটনে চাপলে আবার ০ হয়ে যাবে।',
      },
      whyNeedIt: {
        en: 'This teaches state management in JavaScript: storing a number in a variable, modifying it on user clicks, and rendering the new number onto the DOM.',
        bn: 'এটি শেখায় কীভাবে ভেরিয়েবলে তথ্য রাখতে হয়, ক্লিকে তা পরিবর্তন করতে হয় এবং স্ক্রিনে নতুন মান দেখাতে হয়।',
      },
      analogy: {
        en: 'Like a handheld tally counter used by security guards or cricket umpires to count numbers with a satisfying click!',
        bn: 'একটি ডিজিটাল তসবিহ বা কাউন্টার মেশিনের মতো, যেখানে প্রতি ক্লিকে এক এক করে গণনা বাড়ে!',
      },
    },
    exampleCode: {
      html: `<div style="text-align: center; padding: 20px;">\n  <h1>Counter: <span id="count">0</span></h1>\n  <button id="add-btn">+ Increment</button>\n  <button id="reset-btn">Reset</button>\n</div>`,
      css: `button { padding: 10px 18px; margin: 4px; border-radius: 8px; cursor: pointer; }`,
      javascript: `let count = 0;\nconst countSpan = document.getElementById("count");\nconst addBtn = document.getElementById("add-btn");\nconst resetBtn = document.getElementById("reset-btn");\n\naddBtn.addEventListener("click", () => {\n  count = count + 1;\n  countSpan.textContent = count;\n});\n\nresetBtn.addEventListener("click", () => {\n  count = 0;\n  countSpan.textContent = count;\n});`,
    },
    exampleExplanation: {
      en: 'Every click on addBtn increases count by 1 and updates the screen. resetBtn sets it back to 0.',
      bn: 'প্রতিটি ক্লিকে সংখ্যা ১ বাড়ে এবং স্ক্রিনে আপডেট হয়। রিসেট বাটনে চাপলে আবার ০ হয়ে যায়।',
    },
    starterCode: {
      html: `<div style="text-align: center; padding: 20px;">\n  <h2>Score: <span id="score">0</span></h2>\n  <button id="plus-btn">+ Add Point</button>\n</div>`,
      css: `button {\n  background: #0284c7;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  cursor: pointer;\n}`,
      javascript: `let score = 0;\nconst scoreSpan = document.getElementById("score");\nconst plusBtn = document.getElementById("plus-btn");\n\n// Add click listener to plusBtn that increments score and updates scoreSpan.textContent\n`,
    },
    exercise: {
      instructions: {
        en: 'Attach a click listener to plusBtn: increase score by 1, and update scoreSpan.textContent with the new score.',
        bn: 'plusBtn এ একটি ক্লিক লিসেনার যোগ করুন: প্রতি ক্লিকে score ১ বাড়ান এবং scoreSpan.textContent এ নতুন স্কোর দেখান।',
      },
      hint: {
        en: 'plusBtn.addEventListener("click", () => { score += 1; scoreSpan.textContent = score; });',
        bn: 'plusBtn.addEventListener("click", () => { score = score + 1; scoreSpan.textContent = score; }); লিখুন।',
      },
      solution: {
        html: `<div style="text-align: center; padding: 20px;">\n  <h2>Score: <span id="score">0</span></h2>\n  <button id="plus-btn">+ Add Point</button>\n</div>`,
        css: `button {\n  background: #0284c7;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  cursor: pointer;\n}`,
        javascript: `let score = 0;\nconst scoreSpan = document.getElementById("score");\nconst plusBtn = document.getElementById("plus-btn");\n\nplusBtn.addEventListener("click", () => {\n  score = score + 1;\n  scoreSpan.textContent = score;\n});`,
      },
      validation: {
        type: 'js_contains',
        keyword: 'addEventListener',
      },
    },
  },
];
