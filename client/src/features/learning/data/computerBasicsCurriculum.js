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
      bn: '১. কম্পিউটারের পরিচিতি',
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
    contentSections: [
      {
        heading: 'What Exactly is a Computer? (In Plain English)',
        bodyEn: `Think of a computer like a super-smart digital kitchen:
- You feed it raw ingredients (**Data / Input**) like typing numbers or taking a photo.
- Its internal chef mixes and cooks the ingredients (**Processing**) using step-by-step rules.
- It serves you a delicious finished meal (**Information / Output**) on your screen or speaker.
- It packs leftovers into the fridge (**Storage**) so you can use them anytime tomorrow!

**Data vs. Information:**
- **Data (Raw):** Numbers like \`98, 85, 92\` without context.
- **Information (Useful):** \`"Alex's average exam score is 91.6% (Grade A!)"\`. Processing turns confusing data into clear knowledge.`,
        bodyBn: `কম্পিউটার হলো এমন এক ইলেকট্রনিক যন্ত্র যা কাঁচা উপাত্ত (Data) গ্রহণ করে, নির্দেশ অনুযায়ী কাজ (Processing) করে, অর্থপূর্ণ ফলাফল (Information) প্রকাশ করে এবং ভবিষ্যতে ব্যবহারের জন্য সংরক্ষণ (Storage) করে।`,
      },
      {
        heading: 'Fun Fact: Did You Know "Computer" Used to Be a Human Job Title?',
        bodyEn: `Where did the word come from?
- It comes from the ancient Latin verb **computare**, which means "to calculate or reckon together".
- For over 300 years (before electronic machines existed), a **"computer"** was a **person**!
- Famous human computers (including brilliant women mathematicians at NASA) worked for hours with paper and pencils calculating moon landing rocket paths and astronomy tables.
- In the mid-1900s, when electronic machines were invented to automate that exhausting math, we gave the machines the same title: **Computers**!`,
        bodyBn: `কম্পিউটার শব্দটি এসেছে ল্যাটিন "computare" থেকে যার অর্থ গণনা করা। মজার ব্যাপার হলো, যন্ত্র আবিষ্কারের আগে যেসব মানুষ হাতে-কলমে দীর্ঘ হিসাব করতেন, তাদের পদবি ছিল "কম্পিউটার"!`,
      },
      {
        heading: 'The Universal IPO Cycle: Input → Processing → Output',
        bodyEn: `Every single computer on Earth (your phone, your laptop, a smart TV) works in this 4-step loop:

1. **Input (Data In):** Keystrokes, mouse clicks, camera photos, or mic voice.
2. **Processing (Work Happening):** The CPU runs math and logic instructions at lightning speed.
3. **Output (Answers Out):** Screen displays pixels, speakers play sound, printers stamp ink.
4. **Storage (Permanent Vault):** Your SSD or hard drive saves files safely even when power is OFF.`,
        bodyBn: `ইনপুট (উপাত্ত প্রবেশ) → প্রসেসিং (সিপিইউ কর্তৃক প্রক্রিয়াজাত) → আউটপুট (ফলাফল প্রদর্শন) এবং স্টোরেজ (সংরক্ষণ) হলো যেকোনো কম্পিউটারের কাজের মূল নীতি।`,
      },
      {
        heading: 'Why Do We Rely on Computers So Much?',
        bodyEn: `Humans are creative and smart, but human biology has natural limits:
- **Speed:** A phone processor does over **3,000,000,000 calculations every single second**. A human needs 10 seconds for just one!
- **Consistency & Reliability:** Humans get sleepy, bored, or distracted. A computer does the 1,000,000th calculation with the exact same 100% precision as the 1st.
- **Giant Storage:** A fingernail-sized microSD card can store 500,000 books, 10,000 songs, and 200 movies.
- **Global Communication:** Computers send text, photos, and live video across oceans in less than a single blink.`,
        bodyBn: `কম্পিউটারের তীব্র গতি, ক্লান্তিহীন নির্ভুলতা এবং বিশাল তথ্য ধারণ ক্ষমতার কারণেই আজ আধুনিক পৃথিবী সম্পূর্ণভাবে এর ওপর নির্ভরশীল।`,
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
    contentSections: [
      {
        heading: 'Meet the 5 Functional Units (The Dream Team)',
        bodyEn: `A computer is not just one magic box. Inside, 5 specialized units work together like a well-drilled sports team:

1. **Input Unit:** The eyes and ears (accepts mouse clicks, typing, mic sounds).
2. **Memory Unit (RAM):** The desk (holds open programs, current numbers, and variables).
3. **Arithmetic & Logic Unit (ALU):** The math whiz (adds, subtracts, and checks true/false conditions).
4. **Control Unit (CU):** The coach & traffic supervisor (tells everyone when to move and what to do).
5. **Output Unit:** The voice & screen (shows the final computed results to the human user).

**The CPU ("The Brain"):**
The **ALU** and the **Control Unit** (plus tiny high-speed storage slots called **Registers**) sit together on a single silicon chip called the **Central Processing Unit (CPU)**.`,
        bodyBn: `কম্পিউটারের পাঁচটি প্রধান কার্যকরী ইউনিট হলো: ইনপুট ইউনিট, মেমোরি ইউনিট, এএলইউ (ALU), কন্ট্রোল ইউনিট (CU) এবং আউটপুট ইউনিট। সিপিইউ (CPU)-এর ভেতর ALU এবং কন্ট্রোল ইউনিট অন্তর্ভুক্ত থাকে।`,
      },
      {
        heading: 'ALU vs. Control Unit: What Is the Difference?',
        bodyEn: `Students often confuse these two, so here is the crystal-clear breakdown:

| Feature | Arithmetic & Logic Unit (ALU) | Control Unit (CU) |
| :--- | :--- | :--- |
| **Simple Analogy** | The Math Genius with a Calculator | The Orchestra Conductor / Traffic Cop |
| **Does Math?** | **YES!** Addition, subtraction, multiplication, division | **NO!** Does zero math directly |
| **Does Logic?** | **YES!** Compares values: is \`age >= 18\`? | **NO!** |
| **Main Job** | Solves equations and returns the numeric answer | Directs data traffic, decodes instructions, and clocks timing |
| **How It Talks** | Only reads and writes data with **Memory** | Sends command signals to **ALL units** |`,
        bodyBn: `ALU মূলত হিসাব-নিকাশ ও লজিক্যাল সিদ্ধান্ত নেয় (যেমন যোগ, বিয়োগ বা তুলনা)। অন্যদিকে কন্ট্রোল ইউনিট নিজে হিসাব করে না, বরং ট্রাফিক পুলিশের মতো সমস্ত যন্ত্রাংশের মধ্যে সংকেত পাঠিয়ে নিয়ন্ত্রণ বজায় রাখে।`,
      },
      {
        heading: 'Input Devices vs. Output Devices: Quick Examples',
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
        bodyBn: `ইনপুট ডিভাইস মানুষের নির্দেশকে বাইনারি কোডে কম্পিউটারে পাঠায় (কীবোর্ড, মাউস, স্ক্যানার)। আউটপুট ডিভাইস প্রক্রিয়াজাত বাইনারি তথ্যকে মানুষের জন্য পাঠযোগ্য করে প্রকাশ করে (মনিটর, স্পিকার, প্রিন্টার)।`,
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
      bn: '৩. কম্পিউটার কীভাবে কাজ করে',
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
    contentSections: [
      {
        heading: 'The Famous Block Diagram (The 2 Signal Paths)',
        bodyEn: `Every computer science student starts here! Look closely at the connections:

1. **Solid Lines (Information Flow):**
   - This is where the actual numbers, letters, and game data travel:
   - **Operator → Input Device → Memory ↔ ALU**
   - **Memory → Output Device → Operator**
   - Notice the **bidirectional arrow (↔)** between Memory and ALU: Memory sends numbers into the ALU, and the ALU writes the calculated answer back into Memory!

2. **Dashed Lines (Timing & Control Signals):**
   - These are supervisory command pulses sent by the **Control Unit**:
   - Radiates like a star from the Control Unit to Input, Memory, ALU, and Output!`,
        bodyBn: `কম্পিউটারের অভ্যন্তরীণ যোগাযোগের ডায়াগ্রামে সলিড তীর দিয়ে ডেটা চলাচল (ইনফরমেশন ফ্লো) এবং ড্যাশযুক্ত তীর দিয়ে কন্ট্রোল ইউনিটের কমান্ড ও টাইমিং সিগন্যাল দেখানো হয়।`,
      },
      {
        heading: 'Story Time: Calculating 10 + 20 = 30 in 9 Simple Steps',
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
        bodyBn: `নিচের ইন্টারেক্টিভ সিমুলেশনে প্লে বাটনে চাপুন অথবা নেক্সট ধাপে ক্লিক করে ১০ + ২০ = ৩০ গণনা করার প্রতিটি ধাপ লাইভ পর্যবেক্ষণ করুন।`,
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
    contentSections: [
      {
        heading: 'What is a System? (The Human Body Analogy)',
        bodyEn: `A **system** is a group of interrelated parts working together toward a common goal.

Think of the **Human Body vs. Computer System**:
- **Hardware (Body):** Your skull, muscles, eyes, hands, and heart. (You can physically touch them).
- **Software (Mind):** Your thoughts, language rules, how to play soccer, and math knowledge. (You cannot touch a thought, but it tells your muscles what to do!).
- **Data:** What your eyes read on this screen right now.
- **The Magic:** Neither works alone! A body without thoughts cannot move; thoughts without a body have nowhere to live.`,
        bodyBn: `হার্ডওয়্যার হলো কম্পিউটারের দৃশ্যমান ও স্পর্শযোগ্য অংশ (যেমন প্রসেসর, র‍্যাম, কীবোর্ড), আর সফটওয়্যার হলো অদৃশ্য কোড ও নির্দেশ যা হার্ডওয়্যারকে পরিচালনা করে।`,
      },
      {
        heading: 'Why Feedback Loops Make Computers Smart',
        bodyEn: `A simple machine just does one thing blindly. A **Computer System** has a **Feedback Loop**:
1. **Sensor Reads:** Sensor checks CPU temperature = 38°C (Hot!).
2. **CPU Decides:** *"Temperature is too high! Spin up the fans."*
3. **Action Output:** Fans spin at 100% turbo speed.
4. **Feedback:** Cooling air drops temperature back to 22°C.
5. **Adjustment:** CPU detects the cooler temp and slows fans down to save power!`,
        bodyBn: `ফিডব্যাক লুপের মাধ্যমে কম্পিউটার নিজের কাজের ফলাফল পর্যবেক্ষণ করে স্বয়ংক্রিয়ভাবে সিদ্ধান্ত পরিবর্তন করতে পারে (যেমন প্রসেসর গরম হলে ফ্যান জোরে চালানো)।`,
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
    contentSections: [
      {
        heading: 'RAM vs. Storage: The Desk vs. Bookshelf Story',
        bodyEn: `Why can't a computer just use one type of memory?
- **Your Desk = RAM (Working Memory):**
  - Right in front of you. You can grab your open notebook in half a second.
  - But the desk is small. And when you leave the room and shut off the lights (**Power OFF**), the janitor clears your desk completely (**Volatile**)!
- **Your Bookshelf = SSD / Hard Drive (Storage):**
  - Holds 5,000 heavy books, photo albums, and games permanently (**Non-Volatile**).
  - But it takes a few seconds to walk over and fetch a book.
- **How they work together:** When you click to play a game, the computer copies the game from the Bookshelf (SSD) onto your Desk (RAM) so the CPU can play it smoothly!`,
        bodyBn: `র‍্যাম হলো কাজের টেবিলের মতো—খুব দ্রুত কাজ করা যায়, কিন্তু বিদ্যুৎ চলে গেলে সব মুছে যায় (ভলাটাইল)। আর হার্ডডিস্ক বা এসএসডি হলো বুকশেলফের মতো—বিপুল তথ্য স্থায়ীভাবে জমা থাকে (নন-ভলাটাইল)।`,
      },
      {
        heading: 'The 4 Speed Tiers of Computer Memory',
        bodyEn: `From the fastest rocket to the giant vault:

1. **CPU Registers:** Inside the CPU core. Holds 1 or 2 numbers. Speed: **< 1 nanosecond**!
2. **Cache Memory (L1, L2, L3):** Ultra-fast SRAM sitting right next to the CPU core. Speed: **1 to 10 nanoseconds**.
3. **RAM (Main Memory):** Sticks on the motherboard. Holds active apps (Chrome, Discord, Games). Speed: **~20 nanoseconds**.
4. **Secondary Storage (SSD / Hard Disk):** Terabytes of long-term storage. Speed: **Microseconds to Milliseconds**.`,
        bodyBn: `মেমোরি স্পিড হায়ারার্কি: রেজিস্টার (সবচেয়ে দ্রুত) > ক্যাশ মেমোরি > র‍্যাম > সেকেন্ডারি স্টোরেজ (এসএসডি বা হার্ডডিস্ক)।`,
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
    contentSections: [
      {
        heading: 'System Software vs. Application Software',
        bodyEn: `Think of your smartphone:
- **System Software (The Operating System):** Android or iOS. You don't "play" with it directly, but without it, the phone cannot turn on, manage the battery, or connect to Wi-Fi.
- **Application Software (Apps):** WhatsApp, YouTube, Roblox, and TikTok. Programs you download to chat, watch videos, write homework, or play games!
- **Utility Software:** Tools that clean and protect your PC, like Antivirus (Windows Defender), Disk Cleanup, and Zip file compressors (7-Zip).`,
        bodyBn: `সিস্টেম সফটওয়্যার (যেমন Windows, Android) হার্ডওয়্যার নিয়ন্ত্রণ করে প্ল্যাটফর্ম দেয়, আর অ্যাপ্লিকেশন সফটওয়্যার (যেমন YouTube, Word) ব্যবহারকারীর নির্দিষ্ট কাজ সম্পাদন করে।`,
      },
      {
        heading: 'CLI vs. GUI: Why Do Programmers Still Type Commands?',
        bodyEn: `How do humans communicate with the OS?
- **CUI / CLI (Character / Command Line):**
  - A black screen with green/white text. You type commands like \`dir\`, \`cd\`, \`date\`.
  - **Why programmers love it:** Uses 0% graphics power, runs lightning-fast over the cloud, and allows automating 10,000 files in one keystroke!
- **GUI (Graphical User Interface):**
  - Uses **WIMP**: **W**indows, **I**cons, **M**enus, and **P**ointers.
  - **Why everyone loves it:** You don't need to memorize scary code commands. You just drag a picture to the Trash Can!`,
        bodyBn: `CLI-তে কীবোর্ডে টেক্সট লিখে দ্রুত কমান্ড দেওয়া হয় (প্রোগ্রামারদের প্রিয়)। GUI-তে আইকন, উইন্ডো ও মাউস ক্লিকের মাধ্যমে সহজে কাজ করা যায়।`,
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
    contentSections: [
      {
        heading: 'Electrical vs. Electronic: The Muscle vs. Brain Rule',
        bodyEn: `In everyday life, people mix these words up. Here is the golden rule:
- **Electrical = Pure Muscle & Raw Energy:**
  - Converts electricity directly into heat, light, or spinning motor power.
  - *Examples:* Electric space heater, hair dryer, ceiling fan, classic bread toaster.
  - No computing, no decision logic.
- **Electronic = The Brain & Information Flow:**
  - Uses semiconductor materials (Silicon) to gently control electron streams to process signals, numbers, and decisions.
  - *Examples:* Smartphone, laptop, smartwatch, digital thermometer, camera.`,
        bodyBn: `ইলেকট্রিক্যাল ডিভাইস বিদ্যুৎকে সরাসরি তাপ, আলো বা গতিশক্তিতে রূপান্তর করে (যেমন হিটার, পাখা)। ইলেকট্রনিক ডিভাইস সেমিকন্ডাক্টরের মাধ্যমে ইলেকট্রন নিয়ন্ত্রণ করে তথ্য ও সিগন্যাল প্রসেস করে (যেমন কম্পিউটার, ফোন)।`,
      },
      {
        heading: 'The Transistor: The Secret Hero of Computers',
        bodyEn: `How does electricity become Minecraft or YouTube? **The Transistor!**
- A transistor is an electronic switch with **no moving parts**.
- When a tiny voltage is applied to its gate, current flows (**Binary 1**).
- When voltage is removed, current stops (**Binary 0**).
- Modern CPU chips pack over **15 Billion microscopic transistors** into a square smaller than a postage stamp!`,
        bodyBn: `ট্রানজিস্টর হলো এমন এক ইলেকট্রনিক সুইচ যার কোনো নড়াচড়া নেই। এটি চোখের পলকে অন (১) বা অফ (০) হয়ে কম্পিউটারের সমস্ত বাইনারি হিসাব পরিচালনা করে।`,
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
      bn: '৮. পুনরাবৃত্তি ও অনুশীলন',
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
    contentSections: [
      {
        heading: 'Course Summary: You Are Now a Computer Basics Master!',
        bodyEn: `Look how much you have learned across the 8 lessons:
1. **The IPO Principle:** Data in → Processed by CPU → Information out → Saved in Storage.
2. **The 5 Units:** Input, Memory, ALU, Control Unit, and Output.
3. **The Block Diagram:** Solid arrows carry data; dashed arrows carry Control Unit timing commands.
4. **RAM vs SSD:** Desk (RAM - volatile, fast) vs Bookshelf (SSD - permanent, non-volatile).
5. **Software & OS:** System software manages the hardware; applications do your fun tasks.
6. **Electrical vs Electronic:** Raw energy conversion (muscle) vs semiconductor signal control (brain).

Test your skills in the revision suite below!`,
        bodyBn: `অভিনন্দন! আপনি কম্পিউটার বেসিক্সের ৮টি লেসন সফলভাবে শেষ করেছেন। নিচের কুইজ ও অনুশীলনীগুলোর মাধ্যমে আপনার প্রস্তুতি যাচাই করুন।`,
      },
    ],
    interactiveType: 'comprehensive-quiz-and-drills',
  },
];
