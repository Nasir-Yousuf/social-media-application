// Web-101: Computer & Web Fundamentals
// Lecture 01: Computer Hardware & Software Fundamentals
// Ultra-Clean, Organized, 14-Year-Old Friendly 8-Lesson Curriculum for Clearfeed

export const COMPUTER_BASICS_TRACK = {
  id: 'computer-basics',
  title: 'Computer Basics',
  subtitle: {
    en: 'Master hardware, software, CPU architecture & fundamentals',
    bn: 'কম্পিউটার হার্ডওয়্যার, সফটওয়্যার, সিপিইউ আর্কিটেকচার ও মূল বিষয়সমূহ',
  },
  description: {
    en: 'Web-101: Computer Hardware & Software Fundamentals. Learn how computers work, five functional units, CPU, ALU, Control Unit, memory hierarchy, operating systems, and electrical vs electronic devices with interactive visualizers.',
    bn: 'ওয়েব-১০১: কম্পিউটার হার্ডওয়্যার ও সফটওয়্যার ফান্ডামেন্টালস। কম্পিউটার কীভাবে কাজ করে, ৫টি কার্যকরী ইউনিট, সিপিইউ, মেমোরি এবং সফটওয়্যার সম্পর্কে জানুন।',
  },
  icon: 'cpu',
  color: 'from-emerald-500 via-teal-600 to-sky-600',
  accentColor: '#10b981',
  badge: '8 Lessons • Web-101 Core',
  category: 'Foundations',
  totalLessons: 8,
};

export const COMPUTER_BASICS_LESSONS = [
  // ========================================================
  // LESSON 1: Introduction to Computers
  // ========================================================
  {
    id: 'cb-intro-to-computers',
    track: 'computer-basics',
    order: 1,
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    title: {
      en: '1. Introduction to Computers',
      bn: '১. কম্পিউটারের পরিচিতি ও কাজের মূল নীতি',
    },
    subtitle: {
      en: 'What a computer is, where the word came from, the IPO cycle, and why we use them.',
      bn: 'কম্পিউটার কী, শব্দটি কোথা থেকে এলো, আইপিও সাইকেল এবং কেন আমরা ব্যবহার করি।',
    },
    keyTakeaways: [
      'A computer takes raw facts (Input), crunches them (Processing), shows results (Output), and saves them (Storage).',
      'The word computer comes from Latin "computare" (to reckon/calculate). It used to be a human job title!',
      'Data is raw unorganized facts (like 10 and 20); Information is meaningful result (like "Total Score = 30").',
      'We use computers for 3 superpowers: crazy speed, never getting tired (consistency), and giant storage memory.',
      'Computers power everything from smartphones and games to hospitals, banks, and space rockets.',
    ],
    keyTakeawaysBn: [
      'কম্পিউটার কাঁচা উপাত্ত (ইনপুট) নেয়, প্রসেস করে, ফলাফল (আউটপুট) দেখায় এবং ভবিষ্যতে ব্যবহারের জন্য সংরক্ষণ (স্টোরেজ) করে।',
      'কম্পিউটার শব্দটি ল্যাটিন "computare" থেকে এসেছে। যন্ত্র আবিষ্কারের আগে এটি ছিল একজন মানুষের পেশাগত পদবি!',
      'ডাটা হলো অসংগঠিত কাঁচা তথ্য (যেমন ১০ ও ২০); ইনফরমেশন হলো অর্থপূর্ণ ফলাফল (যেমন "মোট নম্বর = ৩০")।',
      'কম্পিউটারের ৩টি বড় ক্ষমতা: অবিশ্বাস্য গতি, ক্লান্তিহীন নির্ভুলতা এবং বিশাল স্টোরেজ ক্ষমতা।',
      'স্মার্টফোন ও গেম থেকে শুরু করে হাসপাতাল, ব্যাংক এবং মহাকাশযান—সবকিছুই কম্পিউটার দিয়ে নিয়ন্ত্রিত।',
    ],
    contentSections: [
      {
        heading: 'What Exactly is a Computer? (In Plain English)',
        headingBn: 'কম্পিউটার আসলে কী? (সহজ ভাষায় ব্যাখ্যা)',
        bodyEn: `Think of a computer like a super-smart digital kitchen:
- You feed it raw ingredients (**Data / Input**) like typing numbers or taking a photo.
- Its internal chef mixes and cooks the ingredients (**Processing**) using step-by-step rules.
- It serves you a delicious finished meal (**Information / Output**) on your screen or speaker.
- It packs leftovers into the fridge (**Storage**) so you can use them anytime tomorrow!

**Data vs. Information:**
- **Data (Raw):** Numbers like \`98, 85, 92\` without context.
- **Information (Useful):** \`"Alex's average exam score is 91.6% (Grade A!)"\`. Processing turns confusing data into clear knowledge.`,
        bodyBn: `কম্পিউটারকে একটি আধুনিক ডিজিটাল রান্নাঘরের সাথে তুলনা করা যায়:
- আপনি এতে কাঁচা উপাদান সরবরাহ করেন (**ডাটা / ইনপুট**)—যেমন কীবোর্ডে সংখ্যা লেখা বা ছবি তোলা।
- এর ভেতরের শেফ নির্দিষ্ট নিয়ম মেনে রান্না করে (**প্রসেসিং / প্রক্রিয়াকরণ**)।
- তারপর পরিবেশন করে সুস্বাদু খাবার (**ইনফরমেশন / আউটপুট**)—যেমন স্ক্রিনে ফলাফল বা স্পিকারে গান।
- অবশিষ্ট খাবার ফ্রিজে সংরক্ষণ করা হয় (**স্টোরেজ**)—যাতে যেকোনো সময় আবার ব্যবহার করা যায়!

**ডাটা বনাম ইনফরমেশন (Data vs. Information):**
- **ডাটা (কাঁচা তথ্য):** যেমন \`৯৮, ৮৫, ৯২\`—যার আলাদা কোনো অর্থ বোঝা যায় না।
- **ইনফরমেশন (অর্থপূর্ণ জ্ঞান):** \`"সাকিবের পরীক্ষার গড় নম্বর ৯১.৬% (গ্রেড A!)"\`। প্রসেসিং এলোমেলো ডাটাকে মানুষের জন্য প্রয়োজনীয় তথ্যে রূপান্তর করে।`,
      },
      {
        heading: 'Fun Fact: Did You Know "Computer" Used to Be a Human Job Title?',
        headingBn: 'মজার তথ্য: "কম্পিউটার" অতীতে মানুষের চাকরির পদবি ছিল!',
        bodyEn: `Where did the word come from?
- It comes from the ancient Latin verb **computare**, which means "to calculate or reckon together".
- For over 300 years (before electronic machines existed), a **"computer"** was a **person**!
- Famous human computers worked for hours with paper and pencils calculating moon landing rocket paths and astronomy tables.
- In the mid-1900s, when electronic machines were invented to automate that exhausting math, we gave the machines the same title: **Computers**!`,
        bodyBn: `কম্পিউটার শব্দটি কোথা থেকে এলো?
- এটি এসেছে প্রাচীন ল্যাটিন শব্দ **computare** থেকে, যার অর্থ "একত্রে হিসাব বা গণনা করা"।
- ইলেকট্রনিক যন্ত্র আবিষ্কারের আগে প্রায় ৩০০ বছর ধরে **"কম্পিউটার"** ছিল একজন রক্তমাংসের **মানুষের চাকরির পদবি**!
- সেসময় শত শত গণিতবিদ সারাদিন খাতা-কলম নিয়ে জ্যোতির্বিজ্ঞান এবং রকেটের গতিপথের জটিল হিসাব করতেন।
- বিংশ শতাব্দীর মাঝামাঝি যখন এই ক্লান্তিকর হিসাব স্বয়ংক্রিয়ভাবে করার ইলেকট্রনিক যন্ত্র তৈরি হলো, তখন সেই যন্ত্রের নাম দেওয়া হলো: **কম্পিউটার**!`,
      },
      {
        heading: 'The Universal IPO Cycle: Input → Processing → Output',
        headingBn: 'ইউনিভার্সাল আইপিও (IPO) সাইকেল: ইনপুট → প্রসেসিং → আউটপুট',
        bodyEn: `Every single computer on Earth (your phone, your laptop, a smart TV) works in this 4-step loop:

1. **Input (Data In):** Keystrokes, mouse clicks, camera photos, or mic voice.
2. **Processing (Work Happening):** The CPU runs math and logic instructions at lightning speed.
3. **Output (Answers Out):** Screen displays pixels, speakers play sound, printers stamp ink.
4. **Storage (Permanent Vault):** Your SSD or hard drive saves files safely even when power is OFF.`,
        bodyBn: `পৃথিবীর প্রতিটি কম্পিউটার (আপনার স্মার্টফোন, ল্যাপটপ কিংবা স্মার্ট টিভি) এই ৪টি ধাপে কাজ সম্পন্ন করে:

1. **ইনপুট (Input):** কীবোর্ডের বাটন প্রেস, মাউস ক্লিক, ক্যামেরা বা মাইক্রোফোনের অডিও।
2. **প্রসেসিং (Processing):** সিপিইউ (CPU) চোখের পলকে গাণিতিক ও যৌক্তিক হিসাব সম্পন্ন করে।
3. **আউটপুট (Output):** মনিটরে রঙিন পিক্সেল ভেসে ওঠে, স্পিকারে শব্দ বাজে কিংবা প্রিন্টারে কাগজ বের হয়।
4. **স্টোরেজ (Storage):** হার্ডডিস্ক বা এসএসডি-তে ফাইল চিরতরে সংরক্ষিত থাকে—এমনকি বিদ্যুৎ বন্ধ হলেও মুছে যায় না।`,
      },
      {
        heading: 'Why Do We Rely on Computers So Much?',
        headingBn: 'আমরা কম্পিউটারের ওপর এতো বেশি নির্ভরশীল কেন?',
        bodyEn: `Humans are creative and smart, but human biology has natural limits:
- **Speed:** A phone processor does over **3,000,000,000 calculations every single second**. A human needs 10 seconds for just one!
- **Consistency & Reliability:** Humans get sleepy, bored, or distracted. A computer does the 1,000,000th calculation with the exact same 100% precision as the 1st.
- **Giant Storage:** A fingernail-sized microSD card can store 500,000 books, 10,000 songs, and 200 movies.
- **Global Communication:** Computers send text, photos, and live video across oceans in less than a single blink.`,
        bodyBn: `মানুষ সৃজনশীল হলেও মানুষের শরীরের কিছু প্রাকৃতিক সীমাবদ্ধতা রয়েছে:
- **তীব্র গতি (Speed):** একটি সাধারণ ফোন প্রসেসর প্রতি সেকেন্ডে **৩০০ কোটিরও বেশি হিসাব** করতে পারে। মানুষের একটি হিসাব করতেই কয়েক সেকেন্ড লেগে যায়!
- **ক্লান্তিহীন নির্ভুলতা (Consistency):** মানুষ ক্লান্ত বা অন্যমনস্ক হতে পারে, কিন্তু কম্পিউটার প্রথম হিসাবটি যেভাবে করে, ১০ লক্ষতম হিসাবটিও ঠিক একই নিখুঁতভাবে করে।
- **বিশাল তথ্য ধারণ ক্ষমতা (Storage):** আঙুলের নখের সমান একটি মেমোরি কার্ডে ৫ লক্ষ বই, ১০ হাজার গান এবং ২০০টি সিনেমা সংরক্ষণ করা যায়।
- **তাত্ক্ষণিক যোগাযোগ (Global Communication):** এক নিমেষের মধ্যে সমুদ্র পেরিয়ে বিশ্বের যেকোনো প্রান্তে মেসেজ ও ভিডিও পাঠানো সম্ভব হয়।`,
      },
    ],
    interactiveType: 'lesson1-suite',
  },

  // ========================================================
  // LESSON 2: Basic Components of a Computer
  // ========================================================
  {
    id: 'cb-basic-components',
    track: 'computer-basics',
    order: 2,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '2. Basic Components of a Computer',
      bn: '২. কম্পিউটারের মৌলিক উপাদানসমূহ',
    },
    subtitle: {
      en: 'The 5 functional units: Input, Memory, ALU, Control Unit, and Output.',
      bn: 'কম্পিউটারের ৫টি কার্যকরী ইউনিট: ইনপুট, মেমোরি, এএলইউ, কন্ট্রোল ইউনিট ও আউটপুট।',
    },
    keyTakeaways: [
      'A computer is a team of 5 specialized functional units: Input, Memory, ALU, Control Unit, and Output.',
      'The CPU (Central Processing Unit) contains the ALU, the Control Unit, and internal Registers.',
      'The ALU (Arithmetic & Logic Unit) does the heavy math (+, -, ×, ÷) and true/false decisions.',
      'The Control Unit (CU) does NOT do math; it directs traffic like a traffic cop or conductor.',
      'Memory holds open apps and numbers; storage keeps files permanently.',
      'Input devices turn human actions into 0s and 1s; output devices turn 0s and 1s into sights and sounds.',
    ],
    keyTakeawaysBn: [
      'একটি কম্পিউটার মূলত ৫টি কার্যকরী ইউনিটের দল: ইনপুট, মেমোরি, এএলইউ (ALU), কন্ট্রোল ইউনিট (CU) এবং আউটপুট।',
      'সিপিইউ (CPU)-এর ভেতর থাকে এএলইউ, কন্ট্রোল ইউনিট এবং উচ্চগতির অভ্যন্তরীণ রেজিস্টার।',
      'এএলইউ (ALU) সব ধরনের গাণিতিক হিসাব (+, -, ×, ÷) এবং সত্য/মিথ্যা যৌক্তিক সিদ্ধান্ত নেয়।',
      'কন্ট্রোল ইউনিট (CU) কোনো হিসাব করে না; এটি ট্রাফিক পুলিশ বা পরিচালকের মতো সংকেত নিয়ন্ত্রণ করে।',
      'মেমোরি চলমান সফটওয়্যার ও ডাটা সাময়িকভাবে ধরে রাখে; স্টোরেজ ফাইল স্থায়ীভাবে সংরক্ষণ করে।',
      'ইনপুট ডিভাইস মানুষের নির্দেশকে ০ ও ১-এ রূপান্তর করে; আউটপুট ডিভাইস তা মানুষ্য পাঠযোগ্য করে দেখায়।',
    ],
    contentSections: [
      {
        heading: 'Meet the 5 Functional Units (The Dream Team)',
        headingBn: 'কম্পিউটারের ৫টি কার্যকরী ইউনিট (The Dream Team)',
        bodyEn: `A computer is not just one magic box. Inside, 5 specialized units work together like a well-drilled sports team:

1. **Input Unit:** The eyes and ears (accepts mouse clicks, typing, mic sounds).
2. **Memory Unit (RAM):** The desk (holds open programs, current numbers, and variables).
3. **Arithmetic & Logic Unit (ALU):** The math whiz (adds, subtracts, and checks true/false conditions).
4. **Control Unit (CU):** The coach & traffic supervisor (tells everyone when to move and what to do).
5. **Output Unit:** The voice & screen (shows the final computed results to the human user).

**The CPU ("The Brain"):**
The **ALU** and the **Control Unit** (plus tiny high-speed storage slots called **Registers**) sit together on a single silicon chip called the **Central Processing Unit (CPU)**.`,
        bodyBn: `কম্পিউটার কেবল একটি একক বাক্স নয়। এর ভেতরে ৫টি বিশেষ ইউনিট একটি দক্ষ স্পোর্টস টিমের মতো একত্রে কাজ করে:

1. **ইনপুট ইউনিট (Input Unit):** কম্পিউটারের চোখ ও কান (কীবোর্ডের টাইপিং, মাউস ক্লিক এবং অডিও গ্রহণ করে)।
2. **মেমোরি ইউনিট (Memory Unit / RAM):** কাজের টেবিল (চলমান অ্যাপস, বর্তমান হিসাবের সংখ্যা এবং ভেরিয়েবল জমা রাখে)।
3. **অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট (ALU):** গণিতের জাদুকর (সব ধরনের যোগ, বিয়োগ, গুণ, ভাগ এবং সত্য/মিথ্যা তুলনা করে)।
4. **কন্ট্রোল ইউনিট (Control Unit / CU):** ট্রাফিক পুলিশ ও কন্ডাক্টর (কাউকে কোনো হিসাব করায় না, বরং কখন কার কী করা উচিত সেই সংকেত পাঠায়)।
5. **আউটপুট ইউনিট (Output Unit):** কম্পিউটারের মুখ ও পর্দা (চূড়ান্ত প্রক্রিয়াজাত ফলাফল মানুষের সামনে সুন্দরভাবে প্রদর্শন করে)।

**সিপিইউ বা কেন্দ্রীয় প্রক্রিয়াকরণ ইউনিট (The CPU):**
**ALU** এবং **কন্ট্রোল ইউনিট** (সাথে অতি দ্রুতগতির মেমোরি স্লট **রেজিস্টার**) একটি ক্ষুদ্র সিলিকন চিপে একত্রে অবস্থান করে, যাকে বলা হয় **Central Processing Unit (CPU)**।`,
      },
      {
        heading: 'ALU vs. Control Unit: What Is the Difference?',
        headingBn: 'ALU বনাম কন্ট্রোল ইউনিট: মূল পার্থক্য কী?',
        bodyEn: `Students often confuse these two, so here is the crystal-clear breakdown:

| Feature | Arithmetic & Logic Unit (ALU) | Control Unit (CU) |
| :--- | :--- | :--- |
| **Simple Analogy** | The Math Genius with a Calculator | The Orchestra Conductor / Traffic Cop |
| **Does Math?** | **YES!** Addition, subtraction, multiplication, division | **NO!** Does zero math directly |
| **Does Logic?** | **YES!** Compares values: is \`age >= 18\`? | **NO!** Does zero comparisons |
| **Main Job** | Solves equations and returns the numeric answer | Directs data traffic, decodes instructions, and clocks timing |
| **How It Talks** | Only reads and writes data with **Memory** | Sends command signals to **ALL units** |`,
        bodyBn: `শিক্ষার্থীরা প্রায়ই এই দুটি ইউনিটের মাঝে গুলিয়ে ফেলে। নিচের ছকে এদের মধ্যকার মূল পার্থক্য পরিষ্কারভাবে দেওয়া হলো:

| বৈশিষ্ট্য | অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট (ALU) | কন্ট্রোল ইউনিট (CU) |
| :--- | :--- | :--- |
| **সহজ উপমা** | ক্যালকুলেটর হাতে থাকা গণিত বিশেষজ্ঞ | ট্রাফিক পুলিশ বা অর্কেস্ট্রা পরিচালক |
| **হিসাব করে কি?** | **হ্যাঁ!** যোগ, বিয়োগ, গুণ, ভাগ সম্পন্ন করে | **না!** সরাসরি কোনো হিসাব করে না |
| **যৌক্তিক তুলনা?** | **হ্যাঁ!** সত্য/মিথ্যা যাচাই করে (যেমন: \`age >= 18\`?) | **না!** কোনো তুলনা করে না |
| **প্রধান কাজ** | সমীকরণ সমাধান করে সঠিক সংখ্যাগত ফলাফল তৈরি করা | ডাটা চলাচলের পথ নির্দেশ, নির্দেশ ডিকোড ও টাইমিং রক্ষা |
| **যোগাযোগের নিয়ম** | শুধুমাত্র **মেমোরি**-র সাথে লেনদেন করে | কম্পিউটারের **সমস্ত ইউনিটে** কন্ট্রোল সিগন্যাল পাঠায় |`,
      },
      {
        heading: 'Input Devices vs. Output Devices: Quick Examples',
        headingBn: 'ইনপুট ডিভাইস বনাম আউটপুট ডিভাইস: বাস্তব উদাহরণ',
        bodyEn: `**Input Devices (Human World → Computer):**
- **Keyboard & Mouse:** Typing letters and clicking buttons.
- **Microphone:** Converting voice sounds into digital audio waves.
- **Webcam / Camera:** Converting light into digital photos.
- **Barcode & QR Scanner:** Reading encoded black-and-white patterns in stores.

**Output Devices (Computer → Human World):**
- **Monitor / Screen:** Illuminating colored pixels so you can see games and websites.
- **Speakers & Headphones:** Vibrating sound cones so you can hear music and game sounds.
- **Printer:** Stamping ink or laser toner onto physical paper.
- **Projector:** Beaming large video frames onto classroom walls.`,
        bodyBn: `**ইনপুট ডিভাইস (মানুষের জগত → কম্পিউটার):**
- **কীবোর্ড ও মাউস:** লেখা টাইপ করা এবং স্ক্রিনে ক্লিক করে নির্দেশ দেওয়া।
- **মাইক্রোফোন:** মানুষের কণ্ঠস্বরকে ডিজিটাল অডিও সিগন্যালে রূপান্তর করা।
- **ওয়েবক্যাম / ক্যামেরা:** বাস্তব আলোকরশ্মিকে ডিজিটাল ছবিতে রূপান্তর করা।
- **বারকোড ও কিউআর স্ক্যানার:** দোকানে পণ্যের কোড স্ক্যান করে তথ্য নেওয়া।

**আউটপুট ডিভাইস (কম্পিউটার → মানুষের জগত):**
- **মনিটর / ডিসপ্লে:** রঙিন পিক্সেল জ্বালিয়ে ছবি, ভিডিও এবং ওয়েবসাইট দেখানো।
- **স্পিকার ও হেডফোন:** ডিজিটাল কোডকে শ্রুতিমধুর শব্দতরঙ্গে রূপান্তর করা।
- **প্রিন্টার:** ডিজিটাল নথিকে কালির মাধ্যমে বাস্তব কাগজের পাতায় ছাপানো।
- **প্রজেক্টর:** দেয়ালে বড় আকারে ভিডিও ও প্রেজেন্টেশন প্রদর্শন করা।`,
      },
    ],
    interactiveType: 'lesson2-suite',
  },

  // ========================================================
  // LESSON 3: How a Computer Works
  // ========================================================
  {
    id: 'cb-how-a-computer-works',
    track: 'computer-basics',
    order: 3,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '3. How a Computer Works',
      bn: '৩. কম্পিউটার কীভাবে কাজ করে (কার্যপদ্ধতি)',
    },
    subtitle: {
      en: 'Interactive functional block diagram: information flow vs timing and control signals.',
      bn: 'ইন্টারেক্টিভ ফাংশনাল ব্লক ডায়াগ্রাম: ইনফরমেশন ফ্লো বনাম টাইমিং ও কন্ট্রোল সিগন্যাল।',
    },
    keyTakeaways: [
      'The classic teaching diagram shows 6 core nodes: Operator, Input Device, Memory, ALU, Control Unit, and Output Device.',
      'Solid Arrows = Information Flow (Data packets & numbers moving).',
      'Dashed Arrows = Timing & Control Signals (Supervisory commands from the Control Unit).',
      'Crucial Rule: Data NEVER goes straight from keyboard to ALU; it MUST enter Memory first!',
      'Crucial Rule: The ALU NEVER writes straight to your monitor; the result is ALWAYS saved in Memory first!',
      'Watch the guided 10 + 20 = 30 simulation below or test your own custom numbers!',
    ],
    keyTakeawaysBn: [
      'ক্লাসিক্যাল ডায়াগ্রামে ৬টি মূল অংশ থাকে: অপারেটর, ইনপুট, মেমোরি, এএলইউ, কন্ট্রোল ইউনিট ও আউটপুট।',
      'সলিড লাল তীর = ইনফরমেশন ফ্লো (প্রকৃত ডাটা ও ফলাফলের চলাচল)।',
      'ড্যাশযুক্ত নীল তীর = টাইমিং ও কন্ট্রোল সিগন্যাল (কন্ট্রোল ইউনিটের তদারকি সংকেত)।',
      'জরুরি নিয়ম: কীবোর্ড থেকে ডাটা কখনোই সরাসরি ALU-তে যায় না; আগে মেমোরিতে ঢুকতেই হবে!',
      'জরুরি নিয়ম: ALU কখনোই সরাসরি মনিটরে কিছু লেখে না; ফলাফল সর্বদা আগে মেমোরিতে জমা হয়!',
      'নিচের সিমুলেশনে ১০ + ২০ = ৩০ গণনা করার প্রতিটি দৃশ্য লাইভ পর্যবেক্ষণ করুন!',
    ],
    contentSections: [
      {
        heading: 'The Famous Block Diagram (The 2 Signal Paths)',
        headingBn: 'বিখ্যাত ফাংশনাল ব্লক ডায়াগ্রাম (২টি সিগন্যাল পথ)',
        bodyEn: `Every computer science student starts here! Look closely at the connections:

1. **Solid Lines (Information Flow):**
   - This is where the actual numbers, letters, and game data travel:
   - **Operator → Input Device → Memory ↔ ALU**
   - **Memory → Output Device → Operator**
   - Notice the **bidirectional arrow (↔)** between Memory and ALU: Memory sends numbers into the ALU, and the ALU writes the calculated answer back into Memory!

2. **Dashed Lines (Timing & Control Signals):**
   - These are supervisory command pulses sent by the **Control Unit**:
   - Radiates like a star from the Control Unit to Input, Memory, ALU, and Output!`,
        bodyBn: `কম্পিউটার বিজ্ঞানের প্রতিটি শিক্ষার্থী এই ডায়াগ্রাম থেকেই যাত্রা শুরু করে। সংযোগগুলো লক্ষ্য করুন:

1. **সলিড লাইন (ইনফরমেশন ফ্লো / Information Flow):**
   - এখানে প্রকৃত সংখ্যা, অক্ষর এবং ফাইল চলাচল করে:
   - **অপারেটর → ইনপুট ডিভাইস → মেমোরি ↔ ALU**
   - **মেমোরি → আউটপুট ডিভাইস → অপারেটর**
   - মেমোরি ও ALU-র মধ্যকার **দ্বিমুখী তীর (↔)** লক্ষ্য করুন: মেমোরি থেকে সংখ্যা ALU-তে যায়, আর ALU হিসাব শেষে উত্তর আবার মেমোরিতে ফেরত পাঠায়!

2. **ড্যাশযুক্ত লাইন (টাইমিং ও কন্ট্রোল সিগন্যাল):**
   - এগুলো হলো কন্ট্রোল ইউনিটের প্রেরিত তদারকি কমান্ড বা সিগন্যাল:
   - কন্ট্রোল ইউনিট থেকে নক্ষত্রের মতো ইনপুট, মেমোরি, ALU এবং আউটপুটে ছড়িয়ে পড়ে!`,
      },
      {
        heading: 'Story Time: Calculating 10 + 20 = 30 in 9 Simple Steps',
        headingBn: 'গল্পের ছলে: ৯টি সহজ ধাপে ১০ + ২০ = ৩০ হিসাবের গল্প',
        bodyEn: `Here is the exact movie of what happens inside when you type \`10 + 20\`:

- **Step 1:** You (the Operator) type "10" and "20" and hit "+".
- **Step 2:** The keyboard registers the keys and packs them into binary bits.
- **Step 3:** The bits travel along the solid line and sit safely in **Memory**.
- **Step 4:** The **Control Unit** pulses a signal: *"Hey Memory & ALU, wake up and sync!"*
- **Step 5:** Memory slides numbers 10 and 20 into the ALU input slots.
- **Step 6:** The ALU adds them up: **10 + 20 = 30**!
- **Step 7:** The ALU sends the answer **30** back into **Memory** to be saved.
- **Step 8:** The Control Unit signals Memory: *"Push answer 30 to the monitor buffer!"*
- **Step 9:** The monitor lights up showing **"30"**, and your eyes celebrate!`,
        bodyBn: `আপনি যখন কীবোর্ডে \`১০ + ২০\` লিখেন, তখন কম্পিউটারের ভেতরে যা ঘটে:

- **ধাপ ১:** আপনি (অপারেটর) কীবোর্ডে ১০ ও ২০ লিখে যোগ চিহ্ন চাপলেন।
- **ধাপ ২:** কীবোর্ডের সুইচ অন হয়ে তথ্যগুলো বাইনারি বিটে রূপান্তরিত হলো।
- **ধাপ ৩:** ডাটা প্যাকেট সলিড লাইন দিয়ে সরাসরি **মেমোরি**-র ঠিকানায় জমা হলো।
- **ধাপ ৪:** **কন্ট্রোল ইউনিট** সংকেত পাঠাল: *"মেমোরি ও ALU, প্রস্তুত হও এবং সিঙ্ক করো!"*
- **ধাপ ৫:** মেমোরি থেকে সংখ্যা ১০ ও ২০ সোজা ALU-র রেজিস্টারে প্রবেশ করল।
- **ধাপ ৬:** ALU যোগ সম্পন্ন করল: **১০ + ২০ = ৩০**!
- **ধাপ ৭:** ALU ফলাফল **৩০** আবার মেমোরির ৩ নম্বর ঠিকানায় ফেরত পাঠিয়ে সংরক্ষণ করল।
- **ধাপ ৮:** কন্ট্রোল ইউনিট মেমোরিকে বলল: *"উত্তর ৩০ আউটপুট স্ক্রিনে পাঠিয়ে দাও!"*
- **ধাপ ৯:** মনিটর আলোকিত হয়ে ভেসে উঠল **"৩০"**, আর আপনার চোখ তা দেখে আনন্দিত হলো!`,
      },
    ],
    interactiveType: 'architecture-diagram-simulation',
  },

  // ========================================================
  // LESSON 4: Computer Systems, Hardware and Software
  // ========================================================
  {
    id: 'cb-systems-hardware-software',
    track: 'computer-basics',
    order: 4,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '4. Computer Systems, Hardware and Software',
      bn: '৪. কম্পিউটার সিস্টেম, হার্ডওয়্যার ও সফটওয়্যার',
    },
    subtitle: {
      en: 'System concepts, hardware vs software taxonomy, and feedback loops.',
      bn: 'সিস্টেমের ধারণা, হার্ডওয়্যার বনাম সফটওয়্যার এবং ফিডব্যাক লুপ।',
    },
    keyTakeaways: [
      'A system is a team of connected parts working together with Input, Processing, Output, and Feedback.',
      'Hardware = Physical parts you can touch (chips, screen, keyboard, wires).',
      'Software = Intangible code and instructions that tell the hardware what to do (games, apps, Windows).',
      'Hardware without software is an expensive paperweight; Software without hardware is just an idea on paper.',
      'Feedback loops make systems smart: a computer reads temperature or battery level and automatically adjusts!',
    ],
    keyTakeawaysBn: [
      'সিস্টেম হলো পরস্পর সংযুক্ত উপাদানসমূহের দল যা ইনপুট, প্রসেসিং, আউটপুট ও ফিডব্যাকের মাধ্যমে কাজ করে।',
      'হার্ডওয়্যার = যে অংশগুলো স্পর্শ করা যায় (চিপ, মনিটর, কীবোর্ড, মাদারবোর্ড)।',
      'সফটওয়্যার = অদৃশ্য নির্দেশ ও কোড যা হার্ডওয়্যারকে পরিচালনা করে (উইন্ডোজ, গেমস, অ্যাপস)।',
      'সফটওয়্যার ছাড়া হার্ডওয়্যার কেবল জড় বস্তু; হার্ডওয়্যার ছাড়া সফটওয়্যার শুধুই কাগজের চিন্তা।',
      'ফিডব্যাক লুপ সিস্টেমকে বুদ্ধিমান বানায়: প্রসেসরের তাপমাত্রা বেশি হলে ফ্যান স্বয়ংক্রিয়ভাবে দ্রুত ঘোরে!',
    ],
    contentSections: [
      {
        heading: 'What is a System? (The Human Body Analogy)',
        headingBn: 'সিস্টেম কী? (মানবদেহের সাথে তুলনা)',
        bodyEn: `A **system** is a group of interrelated parts working together toward a common goal.

Think of the **Human Body vs. Computer System**:
- **Hardware (Body):** Your skull, muscles, eyes, hands, and heart. (You can physically touch them).
- **Software (Mind):** Your thoughts, language rules, how to play soccer, and math knowledge. (You cannot touch a thought, but it tells your muscles what to do!).
- **Data:** What your eyes read on this screen right now.
- **The Magic:** Neither works alone! A body without thoughts cannot move; thoughts without a body have nowhere to live.`,
        bodyBn: `একটি সাধারণ লক্ষ্য অর্জনে যখন কতগুলো উপাদান পরস্পরের সাথে মিলে কাজ করে, তাকে **সিস্টেম (System)** বলে।

**মানবদেহ বনাম কম্পিউটার সিস্টেম:**
- **হার্ডওয়্যার (শরীর):** আপনার হাড়, পেশি, চোখ, হাত এবং হৃৎপিণ্ড—যা আপনি স্পর্শ করতে পারেন।
- **সফটওয়্যার (মন ও বুদ্ধি):** আপনার চিন্তা, ভাষা, ফুটবল খেলার কৌশল—যা স্পর্শ করা যায় না, কিন্তু এটিই শরীরকে পরিচালনা করে!
- **ডাটা:** যা আপনার চোখ এখন এই স্ক্রিনে পড়ছে।
- **যৌথ শক্তি:** দুটি ছাড়া একটিও স্বয়ংসম্পূর্ণ নয়! চিন্তা ছাড়া শরীর জড় পদার্থ, আর শরীর ছাড়া চিন্তার কোনো অস্তিত্ব নেই।`,
      },
      {
        heading: 'Why Feedback Loops Make Computers Smart',
        headingBn: 'ফিডব্যাক লুপ কম্পিউটারকে বুদ্ধিমান করে কীভাবে?',
        bodyEn: `A simple machine just does one thing blindly. A **Computer System** has a **Feedback Loop**:
1. **Sensor Reads:** Sensor checks CPU temperature = 38°C (Hot!).
2. **CPU Decides:** *"Temperature is too high! Spin up the fans."*
3. **Action Output:** Fans spin at 100% turbo speed.
4. **Feedback:** Cooling air drops temperature back to 22°C.
5. **Adjustment:** CPU detects the cooler temp and slows fans down to save power!`,
        bodyBn: `একটি সাধারণ যন্ত্র অন্ধের মতো কাজ করে যায়। কিন্তু একটি **কম্পিউটার সিস্টেম**-এ থাকে **ফিডব্যাক লুপ (Feedback Loop)**:
1. **সেন্সর পরিমাপ করে:** সেন্সর দেখল প্রসেসরের তাপমাত্রা ৩৮°C (খুব গরম!)।
2. **সিপিইউ সিদ্ধান্ত নেয়:** *"তাপমাত্রা অতিরিক্ত! কুলিং ফ্যান দ্রুত চালাও।"*
3. **অ্যাকশন আউটপুট:** ফ্যান পূর্ণ গতিতে ঘোরা শুরু করল।
4. **ফিডব্যাক:** শীতল বাতাসে তাপমাত্রা নেমে ২২°C হলো।
5. **সমন্বয়:** সিপিইউ দেখল তাপমাত্রা স্বাভাবিক, তাই শক্তি বাঁচাতে ফ্যানের গতি আবার কমিয়ে দিল!`,
      },
    ],
    interactiveType: 'lesson4-suite',
  },

  // ========================================================
  // LESSON 5: Memory and Storage
  // ========================================================
  {
    id: 'cb-memory-and-storage',
    track: 'computer-basics',
    order: 5,
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    title: {
      en: '5. Memory and Storage',
      bn: '৫. মেমোরি ও স্টোরেজ',
    },
    subtitle: {
      en: 'Primary memory vs secondary storage, memory hierarchy, and storage media.',
      bn: 'প্রাইমারি মেমোরি বনাম সেকেন্ডারি স্টোরেজ, মেমোরি হায়ারার্কি ও স্টোরেজ মাধ্যম।',
    },
    keyTakeaways: [
      'The Golden Rule: RAM is your Study Desk (super fast, but temporary); SSD is your Bookshelf (giant, holds files forever).',
      'Volatile Memory (RAM): Loses everything the second power is turned OFF.',
      'Non-Volatile Storage (SSD, HDD, Flash Drive): Keeps files safe even if power is OFF for 10 years.',
      'Speed Hierarchy: Registers (fastest, inside CPU) > Cache (L1, L2, L3) > RAM > SSD / Hard Drives.',
      'Historical storage milestones: Floppy disks held only 1.44 MB! Today’s SSDs hold over 2,000,000 MB!',
    ],
    keyTakeawaysBn: [
      'সোনালী নিয়ম: র‍্যাম হলো পড়ার টেবিল (অত্যন্ত দ্রুত, কিন্তু অস্থায়ী); এসএসডি হলো বুকশেলফ (বিশাল, ফাইল চিরতরে রাখে)।',
      'ভলাটাইল মেমোরি (র‍্যাম): বিদ্যুৎ চলে যাওয়ার সাথে সাথেই সমস্ত তথ্য মুছে যায়।',
      'নন-ভলাটাইল স্টোরেজ (SSD, HDD): ১০ বছর বিদ্যুৎ বন্ধ থাকলেও সব ফাইল অক্ষত থাকে।',
      'গতির স্তর: রেজিস্টার (সবচেয়ে দ্রুত) > ক্যাশ (L1, L2, L3) > র‍্যাম > এসএসডি / হার্ডডিস্ক।',
      'ঐতিহাসিক অগ্রগতি: ফ্লপি ডিস্কে জায়গা হতো মাত্র ১.৪৪ মেগাবাইট! আজকের এসএসডি-তে জায়গা হয় ২০ লক্ষ মেগাবাইট!',
    ],
    contentSections: [
      {
        heading: 'RAM vs. Storage: The Desk vs. Bookshelf Story',
        headingBn: 'র‍্যাম বনাম স্টোরেজ: পড়ার টেবিল ও বুকশেলফের গল্প',
        bodyEn: `Why can't a computer just use one type of memory?
- **Your Desk = RAM (Working Memory):**
  - Right in front of you. You can grab your open notebook in half a second.
  - But the desk is small. And when you leave the room and shut off the lights (**Power OFF**), the desk is cleared (**Volatile**)!
- **Your Bookshelf = SSD / Hard Drive (Storage):**
  - Holds 5,000 heavy books, photo albums, and games permanently (**Non-Volatile**).
  - But it takes a few seconds to walk over and fetch a book.
- **How they work together:** When you click to play a game, the computer copies the game from the Bookshelf (SSD) onto your Desk (RAM) so the CPU can play it smoothly!`,
        bodyBn: `কম্পিউটার কেন শুধু এক ধরনের মেমোরি দিয়ে চলতে পারে না?
- **পড়ার টেবিল = র‍্যাম (RAM / ওয়ার্কিং মেমোরি):**
  - আপনার সামনে থাকে। এক সেকেন্ডেই খোলা খাতা তুলে নেওয়া যায়।
  - কিন্তু টেবিল ছোট। আর রুমের লাইট বন্ধ করে চলে গেলে টেবিল ফাঁকা হয়ে যায় (**ভলাটাইল বা অস্থায়ী**)!
- **বুকশেলফ = এসএসডি বা হার্ডডিস্ক (Storage):**
  - ৫,০০০ ভারী বই, ছবির অ্যালবাম ও গেম আজীবন জমা রাখে (**নন-ভলাটাইল বা স্থায়ী**)।
  - কিন্তু হেঁটে গিয়ে বই আনতে কয়েক সেকেন্ড বেশি সময় লাগে।
- **যেভাবে তারা একত্রে কাজ করে:** আপনি যখন কোনো গেম ওপেন করেন, কম্পিউটার এসএসডি থেকে গেমের ফাইলগুলো তুলে এনে র‍্যামের টেবিলে সাজিয়ে রাখে, যাতে সিপিইউ দ্রুত খেলতে পারে!`,
      },
      {
        heading: 'The 4 Speed Tiers of Computer Memory',
        headingBn: 'কম্পিউটার মেমোরির ৪টি গতির স্তর',
        bodyEn: `From the fastest rocket to the giant vault:

1. **CPU Registers:** Inside the CPU core. Holds 1 or 2 numbers. Speed: **< 1 nanosecond**!
2. **Cache Memory (L1, L2, L3):** Ultra-fast SRAM sitting right next to the CPU core. Speed: **1 to 10 nanoseconds**.
3. **RAM (Main Memory):** Sticks on the motherboard. Holds active apps (Chrome, Discord, Games). Speed: **~20 nanoseconds**.
4. **Secondary Storage (SSD / Hard Disk):** Terabytes of long-term storage. Speed: **Microseconds to Milliseconds**.`,
        bodyBn: `সবচেয়ে দ্রুতগতির রকেট থেকে শুরু করে বিশাল ভল্ট পর্যন্ত মেমোরির স্তরবিন্যাস:

1. **সিপিইউ রেজিস্টার (Registers):** সিপিইউ কোরের ভেতরে থাকে। ১ বা ২টি সংখ্যা ধরে রাখে। গতি: **১ ন্যানোসেকেন্ডেরও কম**!
2. **ক্যাশ মেমোরি (L1, L2, L3 Cache):** সিপিইউ-র ঠিক পাশে থাকা অতি দ্রুতগতির মেমোরি। গতি: **১ থেকে ১০ ন্যানোসেকেন্ড**।
3. **র‍্যাম (RAM / প্রধান মেমোরি):** মাদারবোর্ডে লাগানো থাকে। চলমান অ্যাপস জমা রাখে। গতি: **প্রায় ২০ ন্যানোসেকেন্ড**।
4. **সেকেন্ডারি স্টোরেজ (SSD / HDD):** টেরাবাইট পরিমাণের স্থায়ী ফাইল ধারণ করে। গতি: **মাইক্রোসেকেন্ড থেকে মিলিমেকেন্ড**।`,
      },
    ],
    interactiveType: 'lesson5-suite',
  },

  // ========================================================
  // LESSON 6: Types of Software and Operating Systems
  // ========================================================
  {
    id: 'cb-software-and-os',
    track: 'computer-basics',
    order: 6,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '6. Types of Software and Operating Systems',
      bn: '৬. সফটওয়্যার ও অপারেটিং সিস্টেমের প্রকারভেদ',
    },
    subtitle: {
      en: 'System vs application software, OS roles, GUI vs CUI/CLI, and software categories.',
      bn: 'সিস্টেম বনাম অ্যাপ্লিকেশন সফটওয়্যার, ওএস-এর কাজ, গুই বনাম সিইউআই/সিএলআই।',
    },
    keyTakeaways: [
      'System Software (Windows, macOS, Linux) runs the machine; Application Software (Word, Chrome, Spotify) does your tasks.',
      'The Operating System (OS) is the master manager: it schedules CPU time, shares RAM, and manages files.',
      'CLI (Command Line): Typing text commands in a terminal. Super fast and loved by programmers.',
      'GUI (Graphical User Interface): WIMP (Windows, Icons, Menus, Pointers). Clickable, colorful, and beginner-friendly.',
      'Application categories: Word processing (Word), spreadsheets (Excel), browsers (Chrome), graphics (Photoshop).',
    ],
    keyTakeawaysBn: [
      'সিস্টেম সফটওয়্যার (Windows, macOS, Linux) যন্ত্রকে সচল রাখে; অ্যাপ্লিকেশন সফটওয়্যার ব্যবহারকারীর কাজ করে।',
      'অপারেটিং সিস্টেম (OS) হলো প্রধান ব্যবস্থাপক: এটি সিপিইউ-র সময় বণ্টন, র‍্যাম শেয়ারিং ও ফাইল সংরক্ষণ নিয়ন্ত্রণ করে।',
      'সিএলআই (CLI): টার্মিনালে টেক্সট কমান্ড টাইপ করা। অত্যন্ত দ্রুতগতির এবং প্রোগ্রামারদের ভীষণ প্রিয়।',
      'গুই (GUI): উইন্ডো, আইকন, মেনু ও মাউস পয়েন্টার। রঙিন, ক্লিকেবল এবং নতুনদের জন্য সবচেয়ে সহজ।',
      'অ্যাপ্লিকেশনের ধরণ: ওয়ার্ড প্রসেসর (Word), স্প্রেডশিট (Excel), ব্রাউজার (Chrome), গ্রাফিক্স (Photoshop)।',
    ],
    contentSections: [
      {
        heading: 'System Software vs. Application Software',
        headingBn: 'সিস্টেম সফটওয়্যার বনাম অ্যাপ্লিকেশন সফটওয়্যার',
        bodyEn: `Think of your smartphone:
- **System Software (The Operating System):** Android or iOS. You don't "play" with it directly, but without it, the phone cannot turn on, manage the battery, or connect to Wi-Fi.
- **Application Software (Apps):** WhatsApp, YouTube, Roblox, and TikTok. Programs you download to chat, watch videos, write homework, or play games!
- **Utility Software:** Tools that clean and protect your PC, like Antivirus (Windows Defender), Disk Cleanup, and Zip file compressors (7-Zip).`,
        bodyBn: `আপনার স্মার্টফোনের কথা ভাবুন:
- **সিস্টেম সফটওয়্যার (অপারেটিং সিস্টেম):** Android বা iOS। আপনি সরাসরি এতে খেলাধুলা করেন না, কিন্তু এটি ছাড়া ফোন চালু হতে পারে না, ব্যাটারি নিয়ন্ত্রণ করতে পারে না কিংবা ওয়াইফাই চালাতে পারে না।
- **অ্যাপ্লিকেশন সফটওয়্যার (অ্যাপস):** WhatsApp, YouTube, Word এবং গেমস। যে প্রোগ্রামগুলো আপনি গান শুনতে, পড়াশোনা করতে বা যোগাযোগ করতে নিজে ওপেন করেন!
- **ইউটিলিটি সফটওয়্যার:** পিসিকে সুরক্ষিত ও পরিষ্কার রাখার টুলস—যেমন অ্যান্টিভাইরাস, ডিস্ক ক্লিনআপ এবং ফাইল জিপ করার সফটওয়্যার।`,
      },
      {
        heading: 'CLI vs. GUI: Why Do Programmers Still Type Commands?',
        headingBn: 'সিএলআই বনাম গুই (CLI vs. GUI): প্রোগ্রামাররা এখনো কোড টাইপ করেন কেন?',
        bodyEn: `How do humans communicate with the OS?
- **CUI / CLI (Character / Command Line):**
  - A black screen with green/white text. You type commands like \`dir\`, \`cd\`, \`date\`.
  - **Why programmers love it:** Uses 0% graphics power, runs lightning-fast over the cloud, and allows automating 10,000 files in one keystroke!
- **GUI (Graphical User Interface):**
  - Uses **WIMP**: **W**indows, **I**cons, **M**enus, and **P**ointers.
  - **Why everyone loves it:** You don't need to memorize scary code commands. You just drag a picture to the Trash Can!`,
        bodyBn: `মানুষ কীভাবে অপারেটিং সিস্টেমের সাথে কথা বলে?
- **সিএলআই বা কমান্ড লাইন (Command Line Interface - CLI):**
  - কালো স্ক্রিনে সাদা বা সবুজ টেক্সট। \`dir\`, \`cd\`, \`mkdir\` ইত্যাদি কমান্ড টাইপ করতে হয়।
  - **প্রোগ্রামারদের কেন প্রিয়:** গ্রাফিক্সের বাড়তি চাপ নেই, সুপারফাস্ট এবং একটি ক্লিকেই হাজার হাজার ফাইল একসাথে প্রসেস করা যায়!
- **গুই বা গ্রাফিক্যাল ইন্টারফেস (GUI):**
  - কাজ করে **WIMP** পদ্ধতিতে: **W**indows (উইন্ডো), **I**cons (আইকন), **M**enus (মেনু) এবং **P**ointers (পয়েন্টার)।
  - **সবার কেন প্রিয়:** কোনো কঠিন কোড মুখস্থ করতে হয় না, মাউস দিয়ে ছবি টেনে রিসাইকেল বিনে ফেললেই ডিলিট হয়ে যায়!`,
      },
    ],
    interactiveType: 'lesson6-suite',
  },

  // ========================================================
  // LESSON 7: Electrical versus Electronic Devices
  // ========================================================
  {
    id: 'cb-electrical-vs-electronic',
    track: 'computer-basics',
    order: 7,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '7. Electrical versus Electronic Devices',
      bn: '৭. ইলেকট্রিক্যাল বনাম ইলেকট্রনিক ডিভাইস',
    },
    subtitle: {
      en: 'Scientific definitions, semiconductor transistors, the toaster, and light sensor.',
      bn: 'বৈজ্ঞানিক সংজ্ঞা, সেমিকন্ডাক্টর ট্রানজিস্টর, টোস্টার ও লাইট সেন্সর।',
    },
    keyTakeaways: [
      'Electrical devices convert raw electricity into heat, light, or spinning motion (muscles without a brain).',
      'Electronic devices manipulate tiny electron flows through semiconductors to process signals and information (brain).',
      'Transistors are microscopic electronic switches with no moving parts; they create binary 0s and 1s.',
      'The Toaster: Electricity glows through heating coils to toast bread (Pure Electrical).',
      'The Light Sensor: Semiconductor measures light levels and makes an automatic decision to turn on a lamp (Electronic).',
      'Modern devices often overlap: a smart microwave has electrical heating power guided by an electronic computer chip!',
    ],
    keyTakeawaysBn: [
      'ইলেকট্রিক্যাল ডিভাইস বিদ্যুৎকে সরাসরি তাপ, আলো বা গতিতে রূপান্তর করে (মস্তিষ্কহীন পেশির মতো শক্তি)।',
      'ইলেকট্রনিক ডিভাইস সেমিকন্ডাক্টরের মধ্য দিয়ে সূক্ষ্ম ইলেকট্রন প্রবাহ নিয়ন্ত্রণ করে সিগন্যাল ও তথ্য প্রসেস করে (মস্তিষ্ক)।',
      'ট্রানজিস্টর হলো চলনহীন ইলেকট্রনিক সুইচ যা চোখের পলকে বাইনারি ০ ও ১ তৈরি করে।',
      'টোস্টার: কয়েলের মধ্য দিয়ে কারেন্ট গিয়ে পাউরুটি গরম করে (সম্পূর্ণ ইলেকট্রিক্যাল)।',
      'লাইট সেন্সর: আলোর মাত্রা মেপে স্বয়ংক্রিয়ভাবে বাতি জ্বালানোর সিদ্ধান্ত নেয় (ইলেকট্রনিক)।',
      'আধুনিক ডিভাইসে উভয়টির মিশ্রণ থাকে: ওভেনের হিটিং পাওয়ার ইলেকট্রিক্যাল, আর এর টাইমার কন্ট্রোলার চিপ ইলেকট্রনিক!',
    ],
    contentSections: [
      {
        heading: 'Electrical vs. Electronic: The Muscle vs. Brain Rule',
        headingBn: 'ইলেকট্রিক্যাল বনাম ইলেকট্রনিক: পেশিশক্তি বনাম মস্তিষ্কের নীতি',
        bodyEn: `In everyday life, people mix these words up. Here is the golden rule:
- **Electrical = Pure Muscle & Raw Energy:**
  - Converts electricity directly into heat, light, or spinning motor power.
  - *Examples:* Electric space heater, hair dryer, ceiling fan, classic bread toaster.
  - No computing, no decision logic.
- **Electronic = The Brain & Information Flow:**
  - Uses semiconductor materials (Silicon) to gently control electron streams to process signals, numbers, and decisions.
  - *Examples:* Smartphone, laptop, smartwatch, digital thermometer, camera.`,
        bodyBn: `দৈনন্দিন জীবনে মানুষ এই দুটি শব্দ প্রায়ই গুলিয়ে ফেলে। এদের আলাদা করার সহজ নিয়মটি জেনে নিন:
- **ইলেকট্রিক্যাল = পেশিশক্তি ও সরাসরি শক্তি রূপান্তর:**
  - বিদ্যুৎ শক্তিকে সরাসরি তাপ, আলো বা মোটরের ঘূর্ণনে রূপান্তর করে।
  - *উদাহরণ:* রুম হিটার, হেয়ার ড্রায়ার, সিলিং ফ্যান, সাধারণ রুটি টোস্টার।
  - এতে কোনো চিন্তা, সিদ্ধান্ত বা ডাটা প্রসেসিং নেই।
- **ইলেকট্রনিক = মস্তিষ্ক ও তথ্যের প্রবাহ:**
  - সেমিকন্ডাক্টর পদার্থ (সিলিকন) ব্যবহার করে সূক্ষ্ম ইলেকট্রন নিয়ন্ত্রণ করে সিদ্ধান্ত ও সিগন্যাল তৈরি করে।
  - *উদাহরণ:* স্মার্টফোন, ল্যাপটপ, ডিজিটাল ঘড়ি, ডিজিটাল থার্মোমিটার, ক্যামেরা।`,
      },
      {
        heading: 'The Transistor: The Secret Hero of Computers',
        headingBn: 'ট্রানজিস্টর: আধুনিক কম্পিউটারের গোপন নায়ক',
        bodyEn: `How does electricity become Minecraft or YouTube? **The Transistor!**
- A transistor is an electronic switch with **no moving parts**.
- When a tiny voltage is applied to its gate, current flows (**Binary 1**).
- When voltage is removed, current stops (**Binary 0**).
- Modern CPU chips pack over **15 Billion microscopic transistors** into a square smaller than a postage stamp!`,
        bodyBn: `সাধারণ বিদ্যুৎ কীভাবে গেম বা ভিডিওতে পরিণত হয়? **ট্রানজিস্টর-এর জাদুতে!**
- ট্রানজিস্টর হলো এমন এক ইলেকট্রনিক সুইচ যার ভেতরে কোনো নড়াচড়া নেই।
- যখন এর গেটে সামান্য ভোল্টেজ দেওয়া হয়, কারেন্ট চলে (**বাইনারি ১**)।
- যখন ভোল্টেজ বন্ধ করা হয়, কারেন্ট আটকে যায় (**বাইনারি ০**)।
- আধুনিক একটি প্রসেসর চিপে ডাকটিকিটের চেয়েও ছোট জায়গায় **১৫০০ কোটিরও বেশি ক্ষুদ্রাতিক্ষুদ্র ট্রানজিস্টর** বসানো থাকে!`,
      },
    ],
    interactiveType: 'lesson7-suite',
  },

  // ========================================================
  // LESSON 8: Revision and Practice
  // ========================================================
  {
    id: 'cb-revision-and-practice',
    track: 'computer-basics',
    order: 8,
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    title: {
      en: '8. Revision and Practice',
      bn: '৮. পুনরাবৃত্তি ও চূড়ান্ত অনুশীলন',
    },
    subtitle: {
      en: 'Complete exam review, multiple-choice challenge, and interactive sorting drills.',
      bn: 'পরীক্ষার প্রস্তুতি, বহুনির্বাচনী প্রশ্ন ও ইন্টারেক্টিভ অনুশীলনী।',
    },
    keyTakeaways: [
      'Review all core topics from Web-101 Lecture 01 in clean interactive exercises.',
      'Test your knowledge with 8 Multiple-Choice questions with instant helpful explanations.',
      'Play the Hardware vs Software and Input vs Output sorting mini-games.',
      'Check model answers for exam short-answer questions.',
      'Complete the final assessment to earn your Computer Basics milestone and +25 XP!',
    ],
    keyTakeawaysBn: [
      'ওয়েব-১০১ লেকচার ১-এর সমস্ত মৌলিক বিষয় ইন্টারেক্টিভ অনুশীলনের মাধ্যমে ঝালাই করুন।',
      'তাত্ক্ষণিক ব্যাখ্যাসহ ৮টি বহুনির্বাচনী প্রশ্নের মাধ্যমে নিজের মেধা যাচাই করুন।',
      'হার্ডওয়্যার বনাম সফটওয়্যার এবং ইনপুট বনাম আউটপুট সাজানোর গেম খেলুন।',
      'পরীক্ষার সংক্ষিপ্ত প্রশ্নের আদর্শ উত্তর দেখে প্রস্তুতি সম্পন্ন করুন।',
      'চূড়ান্ত পরীক্ষা সম্পন্ন করে অর্জন করুন কম্পিউটার বেসিক্স মাইলস্টোন ব্যাজ এবং +২৫ এক্সপি!',
    ],
    contentSections: [
      {
        heading: 'Course Summary: You Are Now a Computer Basics Master!',
        headingBn: 'কোর্স সারসংক্ষেপ: আপনি এখন কম্পিউটার বেসিক্সে দক্ষ!',
        bodyEn: `Look how much you have learned across the 8 lessons:
1. **The IPO Principle:** Data in → Processed by CPU → Information out → Saved in Storage.
2. **The 5 Units:** Input, Memory, ALU, Control Unit, and Output.
3. **The Block Diagram:** Solid arrows carry data; dashed arrows carry Control Unit timing commands.
4. **RAM vs SSD:** Desk (RAM - volatile, fast) vs Bookshelf (SSD - permanent, non-volatile).
5. **Software & OS:** System software manages the hardware; applications do your fun tasks.
6. **Electrical vs Electronic:** Raw energy conversion (muscle) vs semiconductor signal control (brain).

Test your skills in the revision suite below!`,
        bodyBn: `৮টি লেসন জুড়ে আপনি যা যা শিখেছেন:
1. **আইপিও (IPO) নীতি:** ডাটা ইনপুট → সিপিইউ প্রসেসিং → ইনফরমেশন আউটপুট → স্টোরেজে সংরক্ষণ।
2. **৫টি প্রধান ইউনিট:** ইনপুট, মেমোরি, এএলইউ (ALU), কন্ট্রোল ইউনিট (CU) এবং আউটপুট।
3. **ব্লক ডায়াগ্রাম:** সলিড তীর দিয়ে ডাটা চলাচল; ড্যাশযুক্ত তীর দিয়ে কন্ট্রোল ইউনিটের টাইমিং সংকেত।
4. **র‍্যাম বনাম এসএসডি:** পড়ার টেবিল (র‍্যাম - অস্থায়ী ও দ্রুত) বনাম বুকশেলফ (এসএসডি - স্থায়ী স্টোরেজ)।
5. **সফটওয়্যার ও ওএস:** সিস্টেম সফটওয়্যার যন্ত্রকে চালায়; অ্যাপ্লিকেশন আমাদের কাজ সহজ করে।
6. **ইলেকট্রিক্যাল বনাম ইলেকট্রনিক:** কাঁচা শক্তির রূপান্তর (পেশিশক্তি) বনাম সেমিকন্ডাক্টরে তথ্য নিয়ন্ত্রণ (মস্তিষ্ক)।

নিচের রিভিশন সেন্টারে কুইজ ও অনুশীলনী সম্পন্ন করে আপনার দক্ষতা যাচাই করুন!`,
      },
    ],
    interactiveType: 'comprehensive-quiz-and-drills',
  },
];
