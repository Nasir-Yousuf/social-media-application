// Module 6: Operating Systems & System Utilities (Lecture File 06)
// Lessons 27 to 32: What is an OS, Efficiency Metrics, OS Lineage, Kernel vs Transient, Utilities, and Capstone Exam.

export const MODULE_6_LESSONS = [
  // ========================================================
  // LESSON 27: What is an Operating System? Dual Objectives & Core Roles
  // ========================================================
  {
    id: 'cb-what-is-an-operating-system',
    track: 'computer-basics',
    order: 27,
    difficulty: 'Beginner',
    estimatedMinutes: 14,
    title: {
      en: '27. What is an Operating System? Dual Objectives & Core Roles',
      bn: '২৭. অপারেটিং সিস্টেম কী? দ্বৈত উদ্দেশ্য ও মূল দায়িত্বসমূহ',
    },
    subtitle: {
      en: 'The master conductor: balancing user convenience with relentless hardware efficiency.',
      bn: 'কম্পিউটারের প্রধান পরিচালক: ব্যবহারকারীর সুবিধা এবং যন্ত্রপাতির সর্বোচ্চ ব্যবহার নিশ্চিতকরণ।',
    },
    keyTakeaways: [
      'An Operating System (OS) is the master software coordinating all hardware, apps, and user interactions.',
      'Two Primary Objectives: (1) Convenience (making the PC easy and intuitive to use) and (2) Efficiency (optimizing hardware).',
      'Program Loading: Fetches executable binaries from storage, allocates RAM space, and initiates CPU execution.',
      'Resource Management: Arbitrates disputes between apps competing for CPU time, memory blocks, and printers.',
      'Memory Management: Tracks free vs occupied RAM blocks, preventing applications from crashing into each other.',
      'Security & Authentication: Verifies passwords, enforces file permissions, and isolates user accounts.',
    ],
    keyTakeawaysBn: [
      'অপারেটিং সিস্টেম (OS) হলো প্রধান সিস্টেম সফটওয়্যার যা হার্ডওয়্যার, অ্যাপস এবং ব্যবহারকারীর মাঝে সংযোগ স্থাপন করে।',
      'দুটি প্রধান উদ্দেশ্য: (১) সুবিধা (Convenience - পিসি ব্যবহার সহজ ও সুন্দর করা) এবং (২) দক্ষতা (Efficiency - হার্ডওয়্যারের সর্বোচ্চ ব্যবহার)।',
      'প্রোগ্রাম লোডিং: ডিস্ক থেকে অ্যাপ্লিকেশনের ফাইল র‍্যামে লোড করে এবং সিপিইউ-তে চালু করে।',
      'রিসোর্স ব্যবস্থাপনা: একই সাথে একাধিক অ্যাপ চললে কে কখন সিপিইউ বা প্রিন্টার পাবে তার সুষ্ঠু বণ্টন করে।',
      'মেমোরি ব্যবস্থাপনা: র‍্যামের কোন অংশ ফাঁকা আর কোথায় কোন অ্যাপ আছে তা নিখুঁতভাবে তদারকি করে।',
      'নিরাপত্তা ও একাউন্ট: পাসওয়ার্ড যাচাই করে এবং এক ব্যবহারকারীর ব্যক্তিগত ফাইলে অন্য কারও অনধিকার প্রবেশ ঠেকায়।',
    ],
    contentSections: [
      {
        heading: 'What is an Operating System? (The Hotel General Manager Analogy)',
        headingBn: 'অপারেটিং সিস্টেম কী? (হোটেলের প্রধান ম্যানেজারের উপমা)',
        bodyEn: `Imagine checking into a giant 5-star hotel:
- You don't have to rewire the elevator, manually stoke the boiler, clean the laundry, or coordinate security guards.
- The **General Manager** coordinates the entire staff behind the scenes so your stay is effortless.
- **The Operating System is that General Manager:**
  - **The Guests:** You and your applications (Chrome, Discord, Minecraft).
  - **The Hotel Facilities:** CPU, RAM, SSD, Graphic card, Wi-Fi adapter.
  - When you launch a game, you don't write assembly code to energize memory pins; you just click! The OS handles millions of hardware chores in the background!`,
        bodyBn: `একটি আন্তর্জাতিক পাঁচ তারকা হোটেলের কথা কল্পনা করুন:
- অতিথি হিসেবে আপনাকে গিয়ে লিফটের মোটর ঠিক করতে হয় না, বয়লার জ্বালাতে হয় না কিংবা নিরাপত্তারক্ষী মোতায়েন করতে হয় না।
- হোটেলের **জেনারেল ম্যানেজার** পর্দার আড়ালে থেকে সমস্ত বিভাগ পরিচালনা করেন যাতে অতিথিরা আরামে থাকতে পারেন।
- **কম্পিউটারের অপারেটিং সিস্টেম হলো সেই জেনারেল ম্যানেজার:**
  - **অতিথিবৃন্দ:** আপনি এবং আপনার সফটওয়্যারসমূহ (Chrome, Word, Games)।
  - **হোটেলের সুযোগ-সুবিধা:** সিপিইউ, র‍্যাম, এসএসডি, গ্রাফিক্স কার্ড, ওয়াইফাই।
  - আপনি যখন কোনো গেম ওপেন করেন, আপনাকে সিলিকনের কোটি কোটি পিন নিয়ন্ত্রণ করতে হয় না; আপনি শুধু ক্লিক করেন, আর বাকি কোটি জটিল কাজ অপারেটিং সিস্টেম নিজে সম্পন্ন করে দেয়!`,
      },
      {
        heading: 'The 8 Fundamental Responsibilities of an OS',
        headingBn: 'অপারেটিং সিস্টেমের ৮টি প্রধান দায়িত্ব',
        bodyEn: `According to Professor Akkas Ali's curriculum, every operating system performs 8 core roles:
1. **Program Loading:** Reads executable files from disk, allocates memory space, and hands execution to the CPU.
2. **Resource Management:** Fairly distributes CPU time, memory blocks, and peripherals among competing software.
3. **Memory Management:** Dynamically allocates and frees RAM sectors so open programs never corrupt each other.
4. **Process Management:** Creates, pauses, prioritizes, synchronizes, and terminates active processes and threads.
5. **File Management:** Maintains the hierarchical folder tree, file naming rules, and read/write security permissions.
6. **Command Interpretation:** Parses typed shell terminal commands (CLI) or window clicks (GUI).
7. **Error Handling & Protection:** Traps software bugs, prevents illegal hardware access, and prevents blue-screen system crashes.
8. **Security & Authentication:** Enforces passwords, biometric logins, and shields system files from unauthorized tampering.`,
        bodyBn: `প্রফেসর আক্কাস আলীর লেকচার অনুসারে যেকোনো অপারেটিং সিস্টেমের ৮টি মূল দায়িত্ব:
১. **প্রোগ্রাম লোডিং (Program Loading):** ডিস্ক থেকে অ্যাপের ফাইল র‍্যামে তোলে এবং প্রসেসরে চালানোর ব্যবস্থা করে।
২. **রিসোর্স ব্যবস্থাপনা (Resource Management):** সিপিইউ-র সময়, মেমোরি ও প্রিন্টারের সুষম বণ্টন নিশ্চিত করে।
৩. **মেমোরি ব্যবস্থাপনা (Memory Management):** র‍্যামের খালি ও পূর্ণ জায়গা নিয়ন্ত্রণ করে যাতে দুটি অ্যাপের ডাটা সংঘর্ষে না জড়ায়।
৪. **প্রসেস ব্যবস্থাপনা (Process Management):** ব্যাকগ্রাউন্ড ও ফোরগ্রাউন্ড প্রসেস চালু, স্থগিত বা বন্ধ করার কাজ করে।
৫. **ফাইল ব্যবস্থাপনা (File Management):** ফোল্ডার সাজানো, ফাইলের নাম দেওয়া এবং ফাইলের অনুমতি (Permissions) রক্ষা করে।
৬. **কমান্ড ইন্টারপ্রিটেশন (Command Interpretation):** মাউসের ক্লিক বা টার্মিনালের টাইপ করা কমান্ডের অর্থ বুঝে কাজ সম্পন্ন করে।
৭. **ত্রুটি নিরসন (Error Handling):** সফটওয়্যারে ভুল হলে ক্র্যাশ হওয়া থেকে পুরো সিস্টেমকে রক্ষা করে।
৮. **নিরাপত্তা ও অথেনটিকেশন (Security):** পাসওয়ার্ড যাচাই করে এবং সিস্টেমের সংবেদনশীল ফাইলকে সুরক্ষিত রাখে।`,
      },
    ],
    interactiveType: 'lesson6-suite',
  },

  // ========================================================
  // LESSON 28: Measuring OS Efficiency: Throughput, Turnaround Time & Response Time
  // ========================================================
  {
    id: 'cb-measuring-os-efficiency',
    track: 'computer-basics',
    order: 28,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '28. Measuring OS Efficiency: Throughput, Turnaround Time & Response Time',
      bn: '২৮. অপারেটিং সিস্টেমের দক্ষতা পরিমাপ: থ্রুপুট, টার্নএরাউন্ড টাইম ও রেসপন্স টাইম',
    },
    subtitle: {
      en: 'The 3 golden benchmarks of OS performance and CPU round-robin time slicing.',
      bn: 'ওএস পারফরম্যান্সের ৩টি মূল সূচক এবং সিপিইউ টাইম-শেয়ারিং শিডিউলার।',
    },
    keyTakeaways: [
      'Throughput: The total number of processes or jobs completed per unit of time (higher is better).',
      'Turnaround Time: The total elapsed duration from when a job is submitted until it finishes completely.',
      'Response Time: The elapsed time from user input submission until the very first visible response appears on screen.',
      'Multitasking uses Time-Sharing: the CPU switches between active apps every few milliseconds (Time Quantum).',
      'CUI (Command User Interface / CLI) uses text prompts; fast, scriptable, but requires memorizing commands.',
      'GUI (Graphical User Interface) uses WIMP (Windows, Icons, Menus, Pointers); friendly, visual, and intuitive.',
    ],
    keyTakeawaysBn: [
      'থ্রুপুট (Throughput): নির্দিষ্ট সময়ে কম্পিউটার মোট কতটি কাজ বা প্রসেস সফলভাবে সম্পন্ন করল (যত বেশি, তত ভালো)।',
      'টার্নএরাউন্ড টাইম (Turnaround Time): কোনো কাজ জমা দেওয়ার মুহূর্ত থেকে তা পুরোপুরি শেষ হওয়া পর্যন্ত মোট অতিক্রান্ত সময়।',
      'রেসপন্স টাইম (Response Time): ব্যবহারকারী বাটন চাপার পর স্ক্রিনে প্রথম প্রতিক্রিয়া ভেসে উঠতে যেটুকু সময় লাগে।',
      'মাল্টিটাস্কিং টাইম-শেয়ারিংয়ের মাধ্যমে চলে: প্রসেসর প্রতি কয়েক মিলি-সেকেন্ড পর পর দ্রুত অ্যাপ অদলবদল করে।',
      'সিইউআই (CUI / CLI): কালো স্ক্রিনে টেক্সট কমান্ড লিখে কাজ করা; দ্রুত হলেও কোড মুখস্থ রাখতে হয়।',
      'গুই (GUI): উইন্ডো, আইকন, মেনু ও পয়েন্টার (WIMP); অত্যন্ত সহজ, সুন্দর ও ব্যবহারকারী-বান্ধব।',
    ],
    contentSections: [
      {
        heading: 'The 3 Pillars of OS Efficiency (The Fast-Food Counter Analogy)',
        headingBn: 'ওএস দক্ষতার ৩টি প্রধান স্তম্ভ (ফাস্টফুড কাউন্টারের উপমা)',
        bodyEn: `How do computer scientists measure if Windows or Linux is performing well? They look at 3 metrics:

Imagine a busy burger restaurant drive-through:
1. **Throughput (How many orders served?):**
   - The total number of cars that successfully receive their burgers and leave per hour.
   - In an OS: The number of user tasks completed per minute or second. High throughput = productive system!
2. **Turnaround Time (How long was the total wait?):**
   - From the exact second you joined the line of cars, placed your order, waited for cooking, and grabbed your bag.
   - In an OS: Total elapsed time from submitting a program until the final output is saved.
3. **Response Time (How fast was the first greeting?):**
   - You pull up to the speaker box, and in **0.8 seconds**, the employee says: *"Welcome to Burger King, what can I get you?"* That instant acknowledgment is Response Time!
   - In an OS: When you click a button or type a letter, how many milliseconds before the cursor reacts or the menu pops open! Low response time = snappy, responsive computer!`,
        bodyBn: `কম্পিউটার বিজ্ঞানীরা কীভাবে বোঝেন উইন্ডোজ বা লিনাক্স কতটা দক্ষভাবে কাজ করছে? তারা ৩টি মানদণ্ড দেখেন:

একটি ব্যস্ত ফাস্টফুড রেস্তোরাঁর কথা ভাবুন:
১. **থ্রুপুট (Throughput - মোট সম্পন্ন কাজের সংখ্যা):**
   - প্রতি এক ঘণ্টায় রেস্তোরাঁটি মোট কতজন গ্রাহককে খাবার সরবরাহ করতে পারল।
   - কম্পিউটারে: প্রতি সেকেন্ড বা মিনিটে ওএস মোট কতটি প্রসেস সফলভাবে শেষ করল।
২. **টার্নএরাউন্ড টাইম (Turnaround Time - মোট অতিক্রান্ত সময়):**
   - আপনি গাড়ির লাইনে দাঁড়ানো থেকে শুরু করে খাবার হাতে পাওয়া পর্যন্ত মোট যে সময় লাগল।
   - কম্পিউটারে: কোনো সফটওয়্যার চালু করা থেকে শুরু করে তার কাজ পুরোপুরি শেষ হওয়া পর্যন্ত মোট সময়।
৩. **রেসপন্স টাইম (Response Time - প্রথম প্রতিক্রিয়ার সময়):**
   - কাউন্টারে দাঁড়ানোর সাথে সাথে কর্মী বললেন: *"স্যার, কী খাবার দেব?"* এই প্রথম সম্ভাষণের সময়টুকুই হলো রেসপন্স টাইম!
   - কম্পিউটারে: মাউস ক্লিক করার পর স্ক্রিনে মেনু বা উইন্ডো ফুটে উঠতে যে কয়েক মিলি-সেকেন্ড সময় লাগে! কম রেসপন্স টাইম মানে পিসি অত্যন্ত চটপটে ও ফাস্ট!`,
      },
      {
        heading: 'CUI vs. GUI: The Typing Terminal vs. The Windowed World',
        headingBn: 'সিইউআই বনাম গুই: কমান্ড প্রম্পট বনাম রঙিন উইন্ডোজ',
        bodyEn: `How humans interact with the Operating System:

- **CUI (Command User Interface / CLI):**
  - Text-based terminal (MS-DOS, Linux Bash, PowerShell).
  - You type exact text commands with switches (e.g., \`mkdir project\`, \`copy file.txt d:\\\`).
  - **Pros:** Uses 0% graphics power, runs over slow networks, and allows writing scripts to automate 10,000 files in seconds.
  - **Cons:** Intimidating for beginners; a single typo results in *"Syntax Error"*.

- **GUI (Graphical User Interface):**
  - Uses the **WIMP** model: **W**indows, **I**cons, **M**enus, and **P**ointers.
  - **Pros:** Intuitive, friendly, visual, and allows easy multitasking. A 5-year-old child can drag a photo into a folder without reading a technical manual!`,
        bodyBn: `অপারেটিং সিস্টেমের সাথে মানুষের যোগাযোগের দুটি পদ্ধতি:

- **সিইউআই বা সিএলআই (Command User Interface - CLI):**
  - কালো স্ক্রিনের টেক্সট ভিত্তিক ইন্টারফেস (যেমন: MS-DOS, Linux Terminal)।
  - কিবোর্ডে নির্দিষ্ট কমান্ড টাইপ করতে হয় (যেমন: \`dir\`, \`copy\`, \`format\`)।
  - **সুবিধা:** গ্রাফিক্সের বাড়তি চাপ নেই, অত্যন্ত দ্রুত চলে এবং হাজার হাজার ফাইল এক সেকেন্ডে প্রসেস করা যায়।
  - **অসুবিধা:** নতুনদের জন্য কঠিন; কমান্ডের একটি অক্ষর ভুল হলেই কাজ আটকে যায়।

- **গুই বা গ্রাফিক্যাল ইন্টারফেস (Graphical User Interface - GUI):**
  - কাজ করে **WIMP** মডেলে: **W**indows (উইন্ডো), **I**cons (আইকন), **M**enus (মেনু) এবং **P**ointers (পয়েন্টার)।
  - **সুবিধা:** রঙিন, আকর্ষণীয় ও ব্যবহারবান্ধব। ৫ বছরের একটি শিশুও মাউস দিয়ে কোনো ফাইল টেনে রিসাইকেল বিনে ফেলতে পারে!`,
      },
    ],
    interactiveType: 'lesson28-suite',
  },

  // ========================================================
  // LESSON 29: The Evolution of OS: MS-DOS, Windows, Unix, Linux & macOS
  // ========================================================
  {
    id: 'cb-os-evolution-and-lineage',
    track: 'computer-basics',
    order: 29,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '29. The Evolution of OS: MS-DOS, Windows, Unix, Linux & macOS',
      bn: '২৯. অপারেটিং সিস্টেমের বিবর্তন: ডস, উইন্ডোজ, ইউনিক্স, লিনাক্স ও ম্যাক ওএস',
    },
    subtitle: {
      en: 'The great operating system family tree: from Bell Labs in 1969 to Linus Torvalds and modern smartphones.',
      bn: 'অপারেটিং সিস্টেমের মহান ইতিহাস: ১৯৬৯ সালের বেল ল্যাব থেকে লিনাস টরভাল্ডস ও স্মার্টফোন।',
    },
    keyTakeaways: [
      'MS-DOS was developed in 1981 by Microsoft for the original IBM PC; 16-bit, single-user, single-tasking CUI.',
      'Microsoft Windows started as a graphical desktop shell for DOS (Windows 3.1 in 1990) before becoming standalone in Windows 95.',
      'Unix was developed at Bell Labs (Ken Thompson & Dennis Ritchie) in the 1970s; written in C; powers modern internet servers.',
      'Linux was created in 1991 by Linus Torvalds as a free, open-source Unix-like kernel; powers Android and supercomputers.',
      'macOS is Apple\'s proprietary Unix-based operating system renowned for its Aqua 3D interface and creative workflows.',
    ],
    keyTakeawaysBn: [
      'এমএস-ডস (MS-DOS): ১৯৮১ সালে আইবিএম পিসির জন্য মাইক্রোসফট তৈরি করে; ১৬-বিট, একক ব্যবহারকারী ও কমান্ড ভিত্তিক।',
      'উইন্ডোজ শুরুতে ডসের ওপর একটি গ্রাফিক্যাল খোলস (Shell) ছিল; ১৯৯৫ সালে Windows 95-এর মাধ্যমে পূর্ণাঙ্গ ওএস হয়।',
      'ইউনিক্স (Unix): ১৯৭০-এর দশকে বেল ল্যাবসে কেন থম্পসন ও ডেনিস রিচি সি (C) ভাষায় তৈরি করেন; আধুনিক ইন্টারনেটের ভিত্তি।',
      'লিনাক্স (Linux): ১৯৯১ সালে হেলসিঙ্কির তরুণ লিনাস টরভাল্ডস উন্মুক্ত ও ফ্রি ওএস হিসেবে শুরু করেন; আজকের অ্যান্ড্রয়েড এর ওপর ভিত্তি করে তৈরি।',
      'ম্যাক ওএস (macOS): অ্যাপল কম্পিউটারের জন্য তৈরি ইউনিক্স-ভিত্তিক প্রিমিয়াম অপারেটিং সিস্টেম।',
    ],
    contentSections: [
      {
        heading: 'The 5 Giants of Operating System History',
        headingBn: 'ইতিহাসের ৫টি বিশ্বখ্যাত অপারেটিং সিস্টেম',
        bodyEn: `Let's explore the landmark operating systems that shaped our digital world:

1. **MS-DOS (1981):**
   - Developed by Microsoft for IBM personal computers.
   - A single-user, single-tasking CUI operating system. You could only run **one program at a time**! If you were typing an essay in WordPerfect, you had to completely exit the program just to check your calendar!

2. **Microsoft Windows:**
   - Started as an overlay shell running on top of DOS (Windows 1.0 in 1985, Windows 3.1 in 1990).
   - In 1995, **Windows 95** revolutionized personal computing with the Start button, taskbar, true 32-bit multitasking, and plug-and-play hardware support! Followed by Windows 98, 2000, XP, 7, 10, and 11.

3. **Unix (1969–1970s):**
   - Created at AT&T Bell Labs by legendary computer scientists **Ken Thompson** and **Dennis Ritchie**.
   - Rewritten in the **C programming language** for portability across different hardware architectures. Designed from day one as a true multi-user, multi-tasking powerhouse.

4. **Linux (1991 - The Open Source Revolution):**
   - College student **Linus Torvalds** in Helsinki, Finland, wanted a free Unix-like system for his PC. He wrote the Linux kernel and released it to the world for free!
   - Today, Linux runs **100% of the world's top 500 supercomputers**, powers the backend of Google, Facebook, and Netflix, and forms the core of **Android smartphones**!

5. **macOS (Apple Macintosh):**
   - Apple introduced the first mass-market GUI with the Macintosh in 1984.
   - Evolved into Mac OS X (built upon the rock-solid Darwin Unix core) featuring the famous **Aqua** interface.`,
        bodyBn: `ডিজিটাল বিশ্বের রূপদানকারী ৫টি মহান অপারেটিং সিস্টেম:

১. **এমএস-ডস (MS-DOS - ১৯৮১):**
   - আইবিএম পিসির জন্য মাইক্রোসফটের তৈরি প্রথম দিককার ওএস।
   - এতে একবারে কেবল **একটি কাজই করা যেত** (Single-tasking)! আপনি ওয়ার্ড ফাইলে লেখার সময় গান শুনতে পারতেন না বা ক্যালেন্ডার দেখতে পারতেন না।

২. **মাইক্রোসফট উইন্ডোজ (Windows):**
   - শুরুতে এটি ডস-এর ওপর গ্রাফিক্যাল ইন্টারফেস হিসেবে কাজ করত।
   - ১৯৯৫ সালে **Windows 95** স্টার্ট বাটন, টাস্কবার এবং পূর্ণাঙ্গ মাল্টিটাস্কিং নিয়ে এসে ব্যক্তিগত কম্পিউটারে বিপ্লব ঘটায়! পরবর্তীতে উইন্ডোজ এক্সপি, ৭, ১০ এবং আজকের ১১ বাজারে আসে।

৩. **ইউনিক্স (Unix - ১৯৬৯-১৯৭০):**
   - বেল ল্যাবসে বিখ্যাত বিজ্ঞানী **কেন থম্পসন** ও **ডেনিস রিচি** এটি তৈরি করেন।
   - এটি **সি (C) ভাষায়** লেখা হওয়ায় যেকোনো প্রসেসরে চালানো যেত। এটি বহু ব্যবহারকারী (Multi-user) একসাথে ব্যবহারের উপযোগী প্রথম শক্তিশালী ওএস।

৪. **লিনাক্স (Linux - ১৯৯১ সালের মুক্ত বিপ্লব):**
   - ফিনল্যান্ডের তরুণ ছাত্র **লিনাস টরভাল্ডস** তার পিসিতে চালানোর জন্য এটি তৈরি করেন এবং পুরো বিশ্বের জন্য এর কোড ফ্রি করে দেন!
   - আজকের বিশ্বের **সেরা ৫০০টি সুপারকম্পিউটারের সবকয়টি**, গুগল ও ইউটিউবের ক্লাউড সার্ভার এবং আমাদের হাতের **অ্যান্ড্রয়েড ফোন** লিনাক্স কার্নেলে চলে!

৫. **ম্যাক ওএস (macOS - অ্যাপল):**
   - ১৯৮৪ সালে প্রথম সফল গ্রাফিক্যাল কম্পিউটার হিসেবে অ্যাপল ম্যাকিন্টশ নিয়ে আসে।
   - আধুনিক ম্যাক ওএস শক্তিশালী ইউনিক্স ভিত্তির ওপর প্রতিষ্ঠিত এবং এর আকর্ষণীয় ইন্টারফেসের জন্য গ্রাফিক্স ডিজাইনার ও ডেভেলপারদের পছন্দের শীর্ষে।`,
      },
    ],
    interactiveType: 'lesson6-suite',
  },

  // ========================================================
  // LESSON 30: Inside the OS: Kernel vs. Transient Programs
  // ========================================================
  {
    id: 'cb-kernel-vs-transient-programs',
    track: 'computer-basics',
    order: 30,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '30. Inside the OS: Kernel vs. Transient Programs',
      bn: '৩০. ওএস-এর অভ্যন্তরীণ রূপ: কার্নেল বনাম ট্রানজিয়েন্ট প্রোগ্রাম',
    },
    subtitle: {
      en: 'The king permanently resident in memory (Kernel) vs the visiting utility workers (Transient routines).',
      bn: 'মেমোরিতে আজীবন অবস্থানকারী কার্নেল বনাম প্রয়োজনে লোড হওয়া ট্রানজিয়েন্ট প্রোগ্রাম।',
    },
    keyTakeaways: [
      'The Kernel (Nucleus) is the central core of the operating system that resides permanently in RAM from boot to shutdown.',
      'The Kernel directly controls the CPU, memory paging, interrupt handlers, and low-level hardware device drivers.',
      'Transient Programs are secondary system routines and utilities that remain stored on disk and load into RAM ONLY on-demand.',
      'Once a transient program (like disk formatting or CHKDSK) finishes its work, the OS unloads it to free up RAM.',
      'This architectural division ensures that the computer saves precious high-speed RAM for user games and applications.',
    ],
    keyTakeawaysBn: [
      'কার্নেল (Kernel / Nucleus) হলো অপারেটিং সিস্টেমের মূল মস্তিষ্ক যা পিসি চালু হওয়া থেকে বন্ধ হওয়া পর্যন্ত স্থায়ীভাবে র‍্যামে থাকে।',
      'কার্নেল সরাসরি প্রসেসর, মেমোরি পেজিং, ইন্টারাপ্ট হ্যান্ডলার এবং হার্ডওয়্যার ড্রাইভার নিয়ন্ত্রণ করে।',
      'ট্রানজিয়েন্ট প্রোগ্রাম (Transient Programs) হলো সহকারী সিস্টেম রুটিন যা ডিস্কে থাকে এবং প্রয়োজনের সময় সাময়িকভাবে র‍্যামে আসে।',
      'কাজ শেষ হয়ে গেলে ওএস সাথে সাথে ট্রানজিয়েন্ট প্রোগ্রামটিকে র‍্যাম থেকে খালাস করে মেমোরি ফাঁকা করে দেয়।',
      'এই কাঠামোর কারণে মূল্যবান র‍্যাম অপচয় না হয়ে ব্যবহারকারীর অন্যান্য সফটওয়্যার ও গেমসের জন্য উন্মুক্ত থাকে।',
    ],
    contentSections: [
      {
        heading: 'The King vs. The Visiting Workers: Kernel vs. Transient',
        headingBn: 'রাজা বনাম অতিথি কর্মী: কার্নেল বনাম ট্রানজিয়েন্ট',
        bodyEn: `An operating system is massive. If every single line of code stayed in your RAM all the time, your memory would be 100% full before you even opened a browser!
To solve this, OS architects divided software into two categories:

1. **The Kernel (The Resident King):**
   - The absolute nucleus of the operating system.
   - Loaded into RAM during system bootup and **never leaves** until you turn off the computer.
   - Manages memory allocation, schedules CPU clock ticks, controls hardware device drivers, and handles traps and interrupts.

2. **Transient Programs (The Visiting Workers):**
   - Auxiliary system utilities and command routines that reside safely on your solid-state drive or hard disk.
   - They are loaded into RAM **only when you specifically call them** (e.g., \`FORMAT\`, \`CHKDSK\`, disk defragmenter, partition managers).
   - The second their job is done, the operating system purges them from RAM, giving the memory back to your apps!`,
        bodyBn: `একটি অপারেটিং সিস্টেমের আকার বিশাল। এর সব কোড যদি সারাদিন র‍্যামে বসে থাকত, তবে অন্য কোনো অ্যাপ বা গেম চালানোর মতো জায়গাই থাকত না!
এই কারণে বিজ্ঞানীরা ওএস-কে দুটি ভাগে ভাগ করেছেন:

১. **কার্নেল বা নিউক্লিয়াস (The Kernel - স্থায়ী রাজা):**
   - এটি অপারেটিং সিস্টেমের হৃৎপিণ্ড ও মূল প্রাণ।
   - কম্পিউটার অন হওয়ার সময় এটি র‍্যামে লোড হয় এবং পিসি বন্ধ না হওয়া পর্যন্ত **স্থায়ীভাবে র‍্যামে অবস্থান করে**।
   - এটি প্রসেসরের সময় বণ্টন, মেমোরি নিয়ন্ত্রণ এবং হার্ডওয়্যারের ড্রাইভার সামলানোর মতো অত্যন্ত জরুরি দায়িত্ব পালন করে।

২. **ট্রানজিয়েন্ট প্রোগ্রাম (Transient Programs - অতিথি কর্মী):**
   - এগুলো হলো সহায়ক ওএস টুলস যা হার্ডডিস্কে ঘুমিয়ে থাকে।
   - যখন আপনি কোনো বিশেষ কমান্ড দেন (যেমন: পেনড্রাইভ ফরম্যাট করা বা ডিস্ক চেক করা), তখন সাময়িকভাবে এটি র‍্যামে উঠে আসে।
   - কাজ শেষ হওয়ামাত্রই অপারেটিং সিস্টেম একে মেমোরি থেকে মুছে দিয়ে র‍্যামকে আবার খালি করে দেয়!`,
      },
    ],
    interactiveType: 'lesson6-suite',
  },

  // ========================================================
  // LESSON 31: System Utilities & Security: Defragmenter, ScanDisk, Firewalls & Antivirus
  // ========================================================
  {
    id: 'cb-system-utilities-and-security',
    track: 'computer-basics',
    order: 31,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '31. System Utilities & Security: Defragmenter, ScanDisk, Firewalls & Antivirus',
      bn: '৩১. সিস্টেম ইউটিলিটি ও নিরাপত্তা: ডিফ্র্যাগমেন্টার, স্ক্যানডিস্ক, ফায়ারওয়াল ও অ্যান্টিভাইরাস',
    },
    subtitle: {
      en: 'The maintenance and defense crew keeping your computer fast, clean, healthy, and secure.',
      bn: 'কম্পিউটারের পরিচ্ছন্নতাকর্মী ও নিরাপত্তা বাহিনী: ডিস্ক অপ্টিমাইজেশন ও সাইবার সুরক্ষা।',
    },
    keyTakeaways: [
      'Utility Programs perform maintenance, housekeeping, diagnostic checks, and security protection for the computer system.',
      'Disk Defragmenter reorganizes scattered non-contiguous file fragments into adjacent clusters for faster read speeds.',
      'ScanDisk / CHKDSK inspects file allocation tables and scans hard drive sectors for physical and logical surface damage.',
      'Antivirus software scans RAM and storage media for malicious virus signatures, quarantining and neutralizing malware.',
      'A Firewall acts as a security barrier filtering inbound and outbound network data packets based on trusted rules.',
      'Screen Savers originally prevented phosphor burn-in on older CRT monitors; now used for entertainment and password locks.',
    ],
    keyTakeawaysBn: [
      'ইউটিলিটি সফটওয়্যার কম্পিউটারের রক্ষণাবেক্ষণ, পরিচ্ছন্নতা, সমস্যা সমাধান এবং নিরাপত্তা নিশ্চিত করে।',
      'ডিস্ক ডিফ্র্যাগমেন্টার (Defragmenter): ডিস্কের বিভিন্ন জায়গায় ছড়িয়ে থাকা ফাইলকে এক সারিতে সাজিয়ে স্পিড বাড়ায়।',
      'স্ক্যানডিস্ক (ScanDisk / CHKDSK): ফাইল টেবিল পরীক্ষা করে এবং হার্ডডিস্কের ক্ষতিগ্রস্ত সেক্টর (Bad Sectors) চিহ্নিত করে ফাইল রক্ষা করে।',
      'অ্যান্টিভাইরাস সফটওয়্যার মেমোরি ও স্টোরেজ স্ক্যান করে ক্ষতিকর ভাইরাস ও ম্যালওয়্যার ধ্বংস করে।',
      'ফায়ারওয়াল (Firewall): ইন্টারনেটের সন্দেহভাজন ডাটা প্যাকেট আটকে দিয়ে অনধিকার প্রবেশ ও হ্যাকিং প্রতিহত করে।',
      'স্ক্রিন সেভার অতীতে সিআরটি মনিটরের ফসফরাস জ্বলে নষ্ট হওয়া রোধ করতে উদ্ভাবন করা হয়েছিল।',
    ],
    contentSections: [
      {
        heading: 'The 6 Essential System Utility Programs',
        headingBn: '৬টি অপরিহার্য সিস্টেম ইউটিলিটি সফটওয়্যার',
        bodyEn: `Your operating system includes a team of specialized caretakers:

1. **Disk Defragmenter (The File Organizer):**
   - When files are saved, deleted, and edited, pieces of a single movie or game get scattered across non-contiguous clusters on a mechanical disk. The read head has to jump all over the platter, slowing access to a crawl!
   - The defragmenter reorganizes and packs the pieces into continuous sequential sectors, accelerating read speeds!

2. **ScanDisk / Error-Checking (The Disk Doctor):**
   - Inspects the File Allocation Table (FAT/NTFS) for cross-linked files and scans physical platter sectors. If it finds a magnetically damaged area (**Bad Sector**), it marks it as defective so the OS never loses data there again!

3. **Backup Utilities (The Safety Net):**
   - Automatically archives crucial documents and system images to external drives or cloud vaults, protecting you against hardware failure.

4. **Antivirus Software (The Immune System):**
   - Continuously monitors active RAM and storage for known viral signatures and suspicious heuristic behaviors, quarantining trojans and ransomware.

5. **Firewall (The Security Gatehouse):**
   - A hardware or software barrier monitoring all incoming and outgoing IP network packets. Blocks unauthorized hackers from probing open ports on your computer.

6. **Screen Saver (The Phosphor Shield):**
   - Invented for older CRT monitors. If a static screen remained untouched for hours, electrons permanently "burned" the image into the glass phosphors! Screen savers displayed moving patterns to preserve screen life.`,
        bodyBn: `কম্পিউটার সুস্থ ও দ্রুত রাখার জন্য প্রয়োজনীয় ইউটিলিটি প্রোগ্রামসমূহ:

১. **ডিস্ক ডিফ্র্যাগমেন্টার (Disk Defragmenter - ফাইল সংগঠক):**
   - ফাইল সেভ ও ডিলিট করার ফলে একটি ফাইলের বিভিন্ন টুকরো ডিস্কের বিভিন্ন কোণায় ছড়িয়ে পড়ে (**ফ্র্যাগমেন্টেশন**)। ফলে ফাইলটি ওপেন করতে ড্রাইভের হেডকে এপাশ-ওপাশ দৌড়াতে হয়।
   - ডিফ্র্যাগমেন্টার ছড়ানো টুকরোগুলোকে এক সারিতে এনে সাজিয়ে দেয়, যার ফলে কম্পিউটার আবার নতুন পিসির মতো ফাস্ট হয়ে যায়!

২. **স্ক্যানডিস্ক / চেকডিস্ক (ScanDisk - ডিস্ক ডাক্তার):**
   - ফাইল সিস্টেম পরীক্ষা করে এবং ডিস্কের কোনো অংশে ভৌত ক্ষতি (**Bad Sector**) থাকলে তা চিহ্নিত করে সেখানে ডাটা সেভ করা বন্ধ করে।

৩. **ব্যাকআপ ইউটিলিটি (Backup - সুরক্ষার ঢাল):**
   - প্রয়োজনীয় ডকুমেন্টের হুবহু কপি পেনড্রাইভ বা ক্লাউডে জমা রাখে যাতে কম্পিউটার নষ্ট হলেও কোনো ফাইল হারিয়ে না যায়।

৪. **অ্যান্টিভাইরাস (Antivirus - ডিজিটাল রোগ প্রতিরোধ ব্যবস্থা):**
   - মেমোরি ও স্টোরেজ পাহারা দেয় এবং বিপজ্জনক ভাইরাস, ট্রোজান ও ম্যালওয়্যার ঢুকলে তা আটকে ধ্বংস করে।

৫. **ফায়ারওয়াল (Firewall - ডিজিটাল নিরাপত্তা ফটক):**
   - ইন্টারনেটের সমস্ত ডাটা ট্রাফিকের ওপর নজর রাখে। অপরিচিত কোনো হ্যাকার বা স্পাইওয়্যার যেন কম্পিউটারের পোর্ট দিয়ে ঢুকতে না পারে তা নিশ্চিত করে।

৬. **স্ক্রিন সেভার (Screen Saver - পর্দা সংরক্ষক):**
   - পুরনো সিআরটি মনিটরে এক ছবি অনেকক্ষণ থাকলে ফসফরাস স্থায়ীভাবে দাগ পড়ে নষ্ট হয়ে যেত (**Burn-in**)। পর্দা বাঁচাতে স্বয়ংক্রিয়ভাবে চলমান ছবি ভেসে ওঠার জন্য স্ক্রিন সেভার তৈরি হয়েছিল।`,
      },
    ],
    interactiveType: 'lesson31-suite',
  },

  // ========================================================
  // LESSON 32: Grand Master Review & Final Capstone Challenge
  // ========================================================
  {
    id: 'cb-grand-capstone-mastery-exam',
    track: 'computer-basics',
    order: 32,
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    title: {
      en: '32. Grand Master Review & Final Capstone Challenge',
      bn: '৩২. গ্র্যান্ড মাস্টার রিভিশন ও চূড়ান্ত ক্যাপস্টোন পরীক্ষা',
    },
    subtitle: {
      en: 'Complete comprehensive assessment covering all 6 lecture files of Web-101 and course certification.',
      bn: 'ওয়েব-১০১ কোর্সের সমস্ত ৬টি লেকচারের ওপর চূড়ান্ত পরীক্ষা ও মাইলস্টোন সনদ।',
    },
    keyTakeaways: [
      'Comprehensive mastery of all 6 lecture modules by Professor K M Akkas Ali (Web-101).',
      'Module 1: Principles, IPO cycle, 5 units, hardware vs software, and electrical vs electronic.',
      'Module 2: CPU architecture, RISC vs CISC, bus highway (address, data, control), ports, and speed factors.',
      'Module 3: Memory capacity hierarchy (bit to exabyte), SRAM vs DRAM, ROM subtypes, registers, and read/write cycles.',
      'Module 4: Keyboard layout, scan codes, IRQ 1 interrupt, mouse 5 techniques, OMR, OCR, MICR, and speech AI.',
      'Module 5: Hard copy vs soft copy, printers, print spooling, display physics (CRT vs LCD), and audio DAC.',
      'Module 6: Operating system dual objectives, 8 core roles, efficiency metrics, OS history, kernel, and utilities.',
    ],
    keyTakeawaysBn: [
      'প্রফেসর কে এম আক্কাস আলীর ওয়েব-১০১ কোর্সের সমস্ত ৬টি লেকচারের পূর্ণাঙ্গ পুনরাবৃত্তি ও চূড়ান্ত প্রস্তুতি।',
      'মডিউল ১: আইপিও চক্র, ৫টি ইউনিট, হার্ডওয়্যার বনাম সফটওয়্যার এবং ইলেকট্রিক্যাল বনাম ইলেকট্রনিক।',
      'মডিউল ২: সিপিইউ আর্কিটেকচার, রিস্ক বনাম সিস্ক, বাস হাইওয়ে (এড্রেস, ডাটা, কন্ট্রোল) ও প্রসেসর গতি।',
      'মডিউল ৩: মেমোরি একক (বিট থেকে এক্সাবাইট), র‍্যাম/রমের প্রকারভেদ, রেজিস্টার ও মেমোরি সাইকেল।',
      'মডিউল ৪: কীবোর্ড, স্ক্যান কোড, IRQ 1 ইন্টারাপ্ট, মাউস, ওএমআর, ওসিআর, এমআইসিআর এবং স্পিচ প্রযুক্তি।',
      'মডিউল ৫: হার্ড কপি বনাম সফট কপি, প্রিন্টার, প্রিন্ট স্পুলিং, সিআরটি বনাম এলসিডি এবং অডিও সাবসিস্টেম।',
      'মডিউল ৬: অপারেটিং সিস্টেমের কাজ, পারফরম্যান্স সূচক, ওএস-এর ইতিহাস, কার্নেল এবং নিরাপত্তা ইউটিলিটি।',
    ],
    contentSections: [
      {
        heading: 'Course Graduation: You Are Now a Computer Fundamentals Master!',
        headingBn: 'কোর্স সমাপ্তি: আপনি এখন কম্পিউটার ফান্ডামেন্টালসে একজন মাস্টার!',
        bodyEn: `Look back at the incredible journey across all 32 lessons:
- You went from the ancient Latin root **"computare"** to 64-bit multi-core processors.
- You navigated the **3-lane bus highway** (Address, Data, Control) and decoded the **RISC vs CISC** architecture duel.
- You explored the memory ladder from a single **Bit** all the way to an **Exabyte**, and peeked inside **SRAM flip-flops** and **DRAM capacitors**.
- You understood how a keystroke fires **IRQ 1**, how **OMR** grades exams, and how **MICR** prevents bank check fraud.
- You uncovered the magic of **Print Spooling**, witnessed electron beams in **CRT** monitors, and unraveled the **Kernel** of modern Operating Systems!

Complete the final capstone assessment below to claim your Computer Hardware & Software Fundamentals Milestone Badge and XP!`,
        bodyBn: `৩২টি লেসন জুড়ে আপনার এই অসাধারণ যাত্রার দিকে ফিরে তাকান:
- আপনি ল্যাটিন শব্দ **"computare"** থেকে শুরু করে আধুনিক ৬৪-বিট মাল্টি-কোর প্রসেসর পর্যন্ত শিখেছেন।
- আপনি **৩ লেনের বাস হাইওয়ে** ভ্রমণ করেছেন এবং **রিস্ক বনাম সিস্ক** আর্কিটেকচারের লড়াইয়ের গভীর রহস্য জেনেছেন।
- মেমোরির একক **১ বিট** থেকে শুরু করে সুবিশাল **এক্সাবাইট** পর্যন্ত আরোহণ করেছেন এবং **SRAM** ও **DRAM**-এর ভেতরের কারসাজি বুঝেছেন।
- কীবোর্ডের বাটন কীভাবে **IRQ 1 ইন্টারাপ্ট** পাঠায়, কীভাবে **OMR** খাতা দেখে এবং কীভাবে **MICR** চেকের জালিয়াতি ঠেকায় তা শিখেছেন।
- আপনি **প্রিন্ট স্পুলিংয়ের** জাদু দেখেছেন, **সিআরটি** মনিটরের ইলেকট্রন গানের গতিবিধি জেনেছেন এবং অপারেটিং সিস্টেমের **কার্নেল** সম্পর্কে স্পষ্ট ধারণা পেয়েছেন!

নিচের চূড়ান্ত ক্যাপস্টোন পরীক্ষায় অংশ নিয়ে আপনার দক্ষতা প্রমাণ করুন এবং অর্জন করুন পূর্ণাঙ্গ কম্পিউটার ফান্ডামেন্টালস মাইলস্টোন সনদ!`,
      },
    ],
    interactiveType: 'comprehensive-quiz-and-drills',
  },
];
