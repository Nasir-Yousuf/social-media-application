// Web-101: Computer & Web Fundamentals
// Lecture 01: Computer Hardware & Software Fundamentals
// Complete 8-Lesson Curriculum for Clearfeed Computer Basics

export const COMPUTER_BASICS_TRACK = {
  id: 'computer-basics',
  title: 'Computer Basics',
  subtitle: {
    en: 'Master hardware, software, CPU architecture & fundamentals',
    bn: 'কম্পিউটার হার্ডওয়্যার, সফটওয়্যার, সিপিইউ আর্কিটেকচার ও মূল বিষয়সমূহ',
  },
  description: {
    en: 'Web-101: Computer Hardware & Software Fundamentals. Learn how computers work, five functional units, CPU, ALU, Control Unit, memory hierarchy, operating systems, and electrical vs electronic devices.',
    bn: 'ওয়েব-১০১: কম্পিউটার হার্ডওয়্যার ও সফটওয়্যার ফান্ডামেন্টালস। কম্পিউটার কীভাবে কাজ করে, ৫টি কার্যকরী ইউনিট, সিপিইউ, মেমোরি এবং সফটওয়্যার সম্পর্কে জানুন।',
  },
  icon: 'cpu',
  color: 'from-emerald-500 to-teal-600',
  accentColor: '#10b981',
  badge: 'Core Fundamentals',
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
    estimatedMinutes: 12,
    title: {
      en: '1. Introduction to Computers',
      bn: '১. কম্পিউটারের পরিচিতি',
    },
    subtitle: {
      en: 'What a computer is, historical context, working principles, and real-world applications.',
      bn: 'কম্পিউটার কী, ঐতিহাসিক প্রেক্ষাপট, কাজের মূল নীতি এবং বাস্তব জীবনের ব্যবহার।',
    },
    keyTakeaways: [
      'A computer is an electronic device that accepts data (input), processes it, generates results (output), and stores it for future use.',
      'The word computer originates from the Latin verb "computare", which means to reckon or calculate.',
      'Historically, a "computer" was a human job title for someone who performed complex calculations by hand.',
      'The foundational operating cycle is Input → Processing → Output (IPO cycle), supported by Storage.',
      'Key reasons for using computers: speed, reliability, consistency, massive storage, and global communications.',
      'Computers impact every modern sector: business, healthcare, manufacturing, banking, education, and research.',
    ],
    contentSections: [
      {
        heading: 'Definition of a Computer',
        bodyEn: `A computer is an electronic device operating under the control of instructions stored in its own memory. It can:
1. Accept raw facts and figures (**Input** / Data).
2. Manipulate and compute the data according to specified instructions (**Processing**).
3. Produce meaningful results (**Output** / Information).
4. Store the instructions, intermediate data, and final results for future retrieval (**Storage**).

In simple terms, **Data** is raw, unorganized facts (like the numbers 10 and 20), whereas **Information** is organized, meaningful data that has been processed (such as "The total sales amount is $30").`,
        bodyBn: `কম্পিউটার হলো নিজস্ব মেমরিতে সংরক্ষিত নির্দেশের মাধ্যমে পরিচালিত একটি ইলেকট্রনিক যন্ত্র। এটি:
১. কাঁচা উপাত্ত বা তথ্য গ্রহণ করে (**ইনপুট** / Data)।
২. সুনির্দিষ্ট নির্দেশ অনুযায়ী সেই উপাত্ত প্রক্রিয়াজাত করে (**প্রসেসিং**)।
৩. বোধগম্য ও অর্থপূর্ণ ফলাফল তৈরি করে (**আউটপুট** / Information)।
৪. ভবিষ্যতের জন্য নির্দেশাবলি ও ফলাফল সংরক্ষণ করে (**স্টোরেজ**)।`,
      },
      {
        heading: 'Meaning and Historical Context of the Word "Computer"',
        bodyEn: `The word **computer** is derived from the Latin verb **computare**, where:
- *com* means "together"
- *putare* means "to reckon", "to think", or "to calculate"

Hence, to compute literally means to reckon together or calculate mathematically.

**Historical Milestone:**
Before mechanical and electronic computing machines existed, the word **"computer"** was originally a **human job title**! Starting in the 17th century and continuing through World War II and the early space race, thousands of human mathematicians—many of whom were women—were hired as "computers" to manually calculate astronomical tables, ballistic trajectories, and navigational coordinates using pen and paper.

In the mid-20th century, as electromechanical and electronic calculating machines were invented to automate these tedious human tasks, the title transferred from human beings to machines.`,
        bodyBn: `**Computer** শব্দটি এসেছে ল্যাটিন শব্দ **computare** থেকে, যার অর্থ একসাথে গণনা করা বা হিসাব করা।

ঐতিহাসিকভাবে, কম্পিউটার কোনো যন্ত্রের নাম ছিল না; এটি ছিল একটি **মানুষের চাকরির পদবি**! সপ্তদশ শতাব্দী থেকে বিংশ শতাব্দীর মাঝামাঝি পর্যন্ত যেসব গণিতবিদ ও হিসাবকারী হাতে-কলমে দীর্ঘ জটিল বৈজ্ঞানিক গণনা করতেন, তাদেরকে "কম্পিউটার" বলা হতো। পরবর্তীতে যখন ইলেকট্রনিক যন্ত্র এই গণনাগুলো স্বয়ংক্রিয়ভাবে করতে শুরু করে, তখন যন্ত্রটির নাম দেওয়া হয় কম্পিউটার।`,
      },
      {
        heading: 'Basic Working Principle: The IPO Cycle',
        bodyEn: `Every computer, from a tiny smartwatch to a colossal supercomputer, operates on the **Input → Processing → Output (IPO) cycle**:

1. **Input (Data in):** The user or external sensor feeds raw data into the machine using input devices (e.g., keyboard, mouse, scanner).
2. **Processing (Data transformation):** The Central Processing Unit (CPU) executes instructions, performs mathematical arithmetic, and evaluates logic decisions.
3. **Output (Information out):** The processed results are delivered to the user via output devices (e.g., screen display, audio speaker, printed paper).
4. **Storage (Data persistence):** Because memory is temporary, secondary storage safely preserves files, operating system software, and user documents even when the power is turned off.`,
        bodyBn: `প্রতিটি কম্পিউটার মূলত **IPO সাইকেল** বা Input → Processing → Output নীতি অনুযায়ী কাজ করে:
১. **Input:** ব্যবহারকারী ইনপুট ডিভাইসের (যেমন কী-বোর্ড বা মাউস) মাধ্যমে কাঁচা উপাত্ত প্রদান করে।
২. **Processing:** সিপিইউ (CPU) সেই ডেটা বিশ্লেষণ ও গণনা করে।
৩. **Output:** মনিটর বা প্রিন্টারের মাধ্যমে ব্যবহারকারীকে ফলাফল দেখানো হয়।
৪. **Storage:** ভবিষ্যৎ ব্যবহারের জন্য স্থায়ীভাবে ডিস্কে ডেটা জমা রাখা হয়।`,
      },
      {
        heading: 'Why Do We Use Computers? (Core Strengths)',
        bodyEn: `Humans use computers because they excel in capabilities where human biology has limits:

- **Speed:** Computers execute billions of instructions per second (measured in Gigahertz and MIPS). Calculations that would take human mathematicians lifetimes happen in milliseconds.
- **Reliability:** Hardware components have exceptionally low failure rates and operate round-the-clock without fatigue or emotional distraction.
- **Consistency:** Given the identical input and instructions, a computer produces the exact same output every single time (eliminating human fatigue errors).
- **Storage Capacity:** A single thumb drive smaller than a coin can store entire libraries of textbooks, videos, and scientific databases.
- **Communications:** Computers can instantly transmit data across continents via high-speed global networks.`,
        bodyBn: `আমরা কম্পিউটার ব্যবহার করি কারণ এর গতি, নির্ভুলতা, ক্লান্তিহীন কর্মক্ষমতা এবং বিপুল তথ্য সংরক্ষণের ক্ষমতা রয়েছে। একই কাজ লক্ষ বার করলেও কম্পিউটার কোনো ভুল বা ক্লান্তি ছাড়াই অবিকল ফলাফল দেয়।`,
      },
      {
        heading: 'Applications of Computers Across Industries',
        bodyEn: `Computers have transformed every facet of human civilization:

- **Business:** Inventory management, enterprise resource planning (ERP), e-commerce, payroll, and billing.
- **Manufacturing:** Computer-Aided Manufacturing (CAM), robotics, automated assembly lines, quality control.
- **Offices:** Document processing, automated scheduling, video conferencing, spreadsheets.
- **Banking:** Automated Teller Machines (ATMs), internet banking, fraud detection, electronic fund transfers (EFT).
- **Medicine & Healthcare:** MRI and CT scanners, intensive care patient monitoring, robotic surgery, medical records.
- **Scientific Research:** Weather forecasting, climate modeling, particle physics analysis, space exploration (NASA/ISRO).
- **Engineering & Architecture:** Computer-Aided Design (CAD), structural simulation, 3D architectural rendering.
- **Government:** Census management, tax administration, citizen identity databases (NID/Social Security), digital voting.
- **Communication:** Email, instant messaging, satellite transmissions, video calling.
- **Education:** E-learning platforms, interactive simulations, digital textbooks, online examinations.
- **Publishing & Media:** Desktop publishing (DTP), digital typography, animation, video editing, music production.
- **Transportation:** Air traffic control (ATC), GPS satellite navigation, flight booking engines, autonomous vehicles.
- **Everyday Life:** Smart home automation, mobile apps, digital entertainment, streaming, smart utilities.`,
        bodyBn: `ব্যবসা, শিল্প কারখানা, ব্যাংক, চিকিৎসা, প্রকৌশল, শিক্ষা, যোগাযোগ ও দৈনন্দিন জীবনে কম্পিউটার অপরিহার্য। এটি ছাড়া আধুনিক জীবন ও বৈজ্ঞানিক অগ্রগতি অসম্ভব।`,
      },
    ],
    interactiveType: 'ipo-explorer',
  },

  // ========================================================
  // LESSON 2: Basic Components of a Computer
  // ========================================================
  {
    id: 'cb-basic-components',
    track: 'computer-basics',
    order: 2,
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    title: {
      en: '2. Basic Components of a Computer',
      bn: '২. কম্পিউটারের মৌলিক উপাদানসমূহ',
    },
    subtitle: {
      en: 'The five functional units: Input, Memory, ALU, Control Unit, and Output.',
      bn: 'কম্পিউটারের ৫টি কার্যকরী ইউনিট: ইনপুট, মেমোরি, এএলইউ, কন্ট্রোল ইউনিট ও আউটপুট।',
    },
    keyTakeaways: [
      'Every computer hardware system consists of Five Functional Units: Input Unit, Memory Unit, ALU, Control Unit, and Output Unit.',
      'The CPU (Central Processing Unit) contains the ALU, the Control Unit, and high-speed internal registers.',
      'The ALU (Arithmetic & Logic Unit) performs calculations (+, -, *, /) and comparison decisions (<, >, =).',
      'The Control Unit (CU) coordinates and supervises all operations like a traffic director or orchestra conductor.',
      'Primary Memory (RAM) holds currently running programs, while Secondary Storage provides long-term non-volatile storage.',
      'Input devices convert human-readable data into binary machine-readable signals; output devices do the reverse.',
    ],
    contentSections: [
      {
        heading: 'The Five Functional Units of a Computer',
        bodyEn: `A computer is not a single monolith; it is an organized team of specialized hardware units working in tight synchrony:

1. **Input Unit:** Accepts data and instructions from the outside world.
2. **Memory Unit (Storage):** Holds incoming data, intermediate calculation results, and outgoing data.
3. **Arithmetic and Logic Unit (ALU):** The calculation workshop where numbers are processed and conditions are evaluated.
4. **Control Unit (CU):** The supervisory manager that fetches instructions, decodes them, and tells every other unit when to act.
5. **Output Unit:** Translates machine-processed binary data back into human-understandable visual, printed, or auditory form.

**The Central Processing Unit (CPU):**
In modern computers, the **ALU** and the **Control Unit** (along with internal CPU registers and onboard cache) are integrated on a single silicon microchip called the **CPU** or microprocessor. The CPU is rightly nicknamed the **"Brain of the Computer"**.`,
        bodyBn: `কম্পিউটারের পাঁচটি প্রধান কার্যকরী ইউনিট রয়েছে:
১. ইনপুট ইউনিট (Input Unit)
২. মেমোরি ইউনিট (Memory Unit)
৩. অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট (ALU)
৪. কন্ট্রোল ইউনিট (Control Unit)
৫. আউটপুট ইউনিট (Output Unit)
সিপিইউ (CPU)-কে কম্পিউটারের "মস্তিষ্ক" বলা হয়, যার ভেতরে ALU এবং কন্ট্রোল ইউনিট অন্তর্ভুক্ত।`,
      },
      {
        heading: 'The Arithmetic and Logic Unit (ALU)',
        bodyEn: `The **ALU** is the mathematical engine of the computer. Its functions are split into two categories:

- **Arithmetic Operations:**
  - Addition (+)
  - Subtraction (-)
  - Multiplication (×)
  - Division (÷)
  - Percentage and modulus calculations

- **Logical Operations:**
  - Comparisons: Equal to (=), Not equal to (≠), Greater than (>), Less than (<), Greater than or equal (≥), Less than or equal (≤).
  - Boolean Logic: **AND**, **OR**, **NOT**.
  - Example: Determining if *age ≥ 18* to allow a user to vote, or checking if *password matches record*.`,
        bodyBn: `**ALU (অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট):**
১. গাণিতিক কাজ: যোগ, বিয়োগ, গুণ, ভাগ সম্পন্ন করে।
২. যৌক্তিক বা লজিক্যাল সিদ্ধান্ত: দুটি মানের তুলনা করা (যেমন: বড়, ছোট বা সমান কিনা নির্ণয় করা) এবং AND, OR, NOT অপারেশন পরিচালনা করা।`,
      },
      {
        heading: 'The Control Unit (CU)',
        bodyEn: `The **Control Unit (CU)** does **not** process data or perform calculations directly. Instead, it directs and coordinates all operations across the computer.

**Key Functions of the Control Unit:**
- **Instruction Fetching:** Retrieves instructions one by one from primary memory.
- **Instruction Decoding:** Interprets what operation the instruction requires (e.g., "Add register A to register B").
- **Control Signal Generation:** Issues electronic timing pulses and control signals to memory, the ALU, and I/O devices.
- **Traffic Direction:** Directs the flow of data packets between internal registers, ALU, and system bus.

**Helpful Analogy:**
Think of the Control Unit as an **orchestra conductor** or a **police officer directing heavy traffic at a busy intersection**. The conductor does not play the instruments, but ensures every musician plays in perfect timing.`,
        bodyBn: `**কন্ট্রোল ইউনিট (CU):**
কন্ট্রোল ইউনিট নিজে কোনো গণনা করে না, কিন্তু পুরো কম্পিউটারের সমস্ত যন্ত্রাংশের মধ্যে যোগাযোগ ও নিয়ন্ত্রণ বজায় রাখে। এটি মেমোরি থেকে নির্দেশ গ্রহণ করে এবং অন্যান্য ইউনিটকে সংকেত পাঠিয়ে পরিচালনা করে, ঠিক যেমন একজন ট্রাফিক পুলিশ ব্যস্ত মোড়ে গাড়ি নিয়ন্ত্রণ করেন।`,
      },
      {
        heading: 'Input and Output Devices in Detail',
        bodyEn: `**Input Devices (Human $\\rightarrow$ Machine):**
Convert human gestures, characters, sounds, and images into digital binary pulses (0s and 1s):
- **Keyboard:** QWERTY layout for text input, commands, and shortcuts.
- **Mouse & Touchpad:** Point-and-click graphical navigation.
- **Scanner:** Converts physical documents and photographs into digital raster images.
- **Microphone:** Converts analog acoustic sound waves into digital audio waveforms.
- **Digital Camera / Webcam:** Captures optical light and encodes it into digital video or photos.
- **Barcode & QR Code Reader:** Optical sensor reading encoded black-and-white patterns for retail and logistics.

**Output Devices (Machine $\\rightarrow$ Human):**
Convert internal binary data into sights, sounds, or physical prints:
- **Monitor / Visual Display Unit (VDU):** LCD, LED, and OLED displays presenting graphical user interfaces and text.
- **Printer:** Inkjet, laser, and thermal printers creating physical hard copies on paper.
- **Speakers and Headphones:** Acoustic transducers converting digital audio streams into audible sound.
- **Projector:** High-lumen optical projection onto large screens for presentations and classrooms.`,
        bodyBn: `ইনপুট ডিভাইস (যেমন: কীবোর্ড, মাউস, স্ক্যানার, মাইক্রোফোন) মানুষের ডেটাকে বাইনারিতে রূপান্তর করে কম্পিউটারে পাঠায়। আউটপুট ডিভাইস (যেমন: মনিটর, প্রিন্টার, স্পিকার) প্রক্রিয়াজাত বাইনারি তথ্যকে মানুষের জন্য পাঠযোগ্য করে উপস্থাপন করে।`,
      },
    ],
    interactiveType: 'functional-units-explorer',
  },

  // ========================================================
  // LESSON 3: How a Computer Works (Signature Interactive Lesson)
  // ========================================================
  {
    id: 'cb-how-a-computer-works',
    track: 'computer-basics',
    order: 3,
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    title: {
      en: '3. How a Computer Works',
      bn: '৩. কম্পিউটার কীভাবে কাজ করে',
    },
    subtitle: {
      en: 'Interactive functional block diagram: information flow vs timing and control signals.',
      bn: 'ইন্টারেক্টিভ ফাংশনাল ব্লক ডায়াগ্রাম: ইনফরমেশন ফ্লো বনাম টাইমিং ও কন্ট্রোল সিগন্যাল।',
    },
    keyTakeaways: [
      'The classic teaching model depicts 6 core nodes: Operator, Input Device, Memory, ALU, Control Unit, and Output Device.',
      'Information flow (solid arrows) carries actual data packets: Operator → Input Device → Memory ↔ ALU, then Memory → Output Device → Operator.',
      'Timing and Control signals (dashed arrows) carry supervisory command pulses from the Control Unit to every component.',
      'Notice that data NEVER flows directly from the Input Device straight into the ALU; it must always go through Memory first!',
      'Similarly, the ALU NEVER sends calculated results directly to the Output Device; the result is always stored back in Memory first.',
      'Follow the animated 10 + 20 = 30 simulation step-by-step or enter your own custom math expression!',
    ],
    contentSections: [
      {
        heading: 'The Conceptual Functional Block Diagram',
        bodyEn: `In introductory computer science education, professors use the classic **Functional Block Diagram of a Typical Computer**. This conceptual model illustrates the exact communication pathways between the operator and the internal functional units.

### The Six Key Entities:
1. **Operator (The Human User):** The person interacting with the machine.
2. **Input Device (e.g., Keyboard):** Receives physical input from the operator.
3. **Memory (Primary Working Storage):** The central holding hub for all operands, instructions, and results.
4. **Arithmetic and Logic Unit (ALU):** Performs calculations and evaluations.
5. **Control Unit (CU):** Generates timing signals and coordinates the sequence.
6. **Output Device (e.g., Monitor):** Displays the final computed results back to the operator.

### Understanding the Two Types of Connections:
- **Solid Arrows = Information Flow:**
  - Carries numeric values, characters, files, and data packets.
  - Pathway: **Operator → Input Device → Memory ↔ ALU**, and **Memory → Output Device → Operator**.
  - Notice the **bidirectional arrow (↔)** between Memory and ALU: Memory sends operands to the ALU, and the ALU writes the result back into Memory!
- **Dashed Arrows = Timing and Control Signals:**
  - Carries supervisory synchronization pulses, enable flags, and clock signals.
  - Radiates from the **Control Unit** to the Input Device, Memory, ALU, and Output Device.`,
        bodyBn: `কম্পিউটারের কার্যপদ্ধতির মূল ব্লক ডায়াগ্রামে দুটি ভিন্ন ধরনের সংযোগ থাকে:
১. **সলিড তীর (Solid Arrows - ইনফরমেশন ফ্লো):** ডেটা আদান-প্রদান করে (Operator → Input → Memory ↔ ALU এবং Memory → Output → Operator)।
২. **ড্যাশযুক্ত তীর (Dashed Arrows - কন্ট্রোল সিগন্যাল):** কন্ট্রোল ইউনিট থেকে অন্যান্য ইউনিটে যাওয়ার কমান্ড ও টাইমিং সংকেত নির্দেশ করে।`,
      },
      {
        heading: 'Step-by-Step Walkthrough: Calculating 10 + 20 = 30',
        bodyEn: `Watch how the system handles the simple arithmetic addition of **10 + 20 = 30**:

1. **Step 1 (Input Entry):** The Operator enters numbers 10 and 20 and the addition command via the Input Device.
2. **Step 2 (Input Ready):** The Input Device registers the keystrokes and prepares binary data packets.
3. **Step 3 (Transfer to Memory):** Under control signaling, the data packet travels along the solid arrow and is stored in Memory addresses.
4. **Step 4 (CU Coordinates):** The Control Unit decodes the instruction "ADD" and issues timing signals to Memory and the ALU.
5. **Step 5 (Operands to ALU):** Memory transmits values 10 and 20 over the internal data bus into the ALU's input registers.
6. **Step 6 (Computation):** The ALU executes the binary addition ($10 + 20$) and generates the sum **30**.
7. **Step 7 (Result Returned to Memory):** The ALU writes the answer **30** back across the bidirectional connection into Memory.
8. **Step 8 (Memory to Output):** The Control Unit signals Memory to push the result value **30** to the Output Device buffer.
9. **Step 9 (Delivery to Operator):** The Output Device (Monitor) illuminates pixels displaying "30", which the Operator perceives!`,
        bodyBn: `১০ + ২০ = ৩০ গণনা করার প্রতিটি ধাপ নিচে দেওয়া ইন্টারেক্টিভ সিমুলেটরে পর্যবেক্ষণ করুন। লক্ষ্য করুন কীভাবে কন্ট্রোল ইউনিট সংকেত পাঠায় এবং মেমোরি ও এএলইউ-এর মধ্যে ডেটা আদান-প্রদান হয়।`,
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
    estimatedMinutes: 14,
    title: {
      en: '4. Computer Systems, Hardware and Software',
      bn: '৪. কম্পিউটার সিস্টেম, হার্ডওয়্যার ও সফটওয়্যার',
    },
    subtitle: {
      en: 'System concept, hardware vs software taxonomy, and organizational hierarchy.',
      bn: 'সিস্টেমের ধারণা, হার্ডওয়্যার বনাম সফটওয়্যার এবং সাংগঠনিক কাঠামো।',
    },
    keyTakeaways: [
      'A system is an integrated set of interrelated components working cooperatively toward a defined objective.',
      'General systems involve Input, Processing, Output, and a Feedback loop.',
      'A computer system consists of Hardware, Software, Data, Procedures, and People.',
      'Hardware represents tangible physical electronic and mechanical parts that you can physically touch.',
      'Software represents intangible sets of instructions, programs, and code that tell the hardware what to do.',
      'Hardware and software are complementary: hardware without software is an inert paperweight; software without hardware is an abstract idea.',
    ],
    contentSections: [
      {
        heading: 'What is a System?',
        bodyEn: `A **system** is defined as an orderly collection of interrelated and interdependent components working harmoniously together to achieve a specific goal.

A complete system exhibits four universal characteristics:
1. **Input:** Material, energy, or data gathered from the environment.
2. **Processing:** Operations, modifications, or transformations performed on inputs.
3. **Output:** The end product, outcome, or information produced.
4. **Feedback & Control:** Output monitoring that provides corrective signals to adjust future processing.

**A Computer System:**
A computer is not just a plastic box with wires; it is a complete **system** comprising:
- **Hardware:** Physical electronic machinery.
- **Software:** Programs, compilers, and operating systems.
- **Data:** Unprocessed facts waiting to be manipulated.
- **People (Users):** Operators, programmers, and administrators.
- **Procedures:** Operational manuals and security rules.`,
        bodyBn: `সিস্টেম হলো পরস্পরের সাথে সম্পর্কযুক্ত একাধিক উপাদানের সমন্বিত রূপ, যা একটি সাধারণ লক্ষ্য অর্জনে কাজ করে। একটি পূর্ণাঙ্গ কম্পিউটার সিস্টেম হার্ডওয়্যার, সফটওয়্যার, ডেটা এবং ব্যবহারকারীর সমন্বয়ে গঠিত।`,
      },
      {
        heading: 'Hardware: Definition, Categories and Examples',
        bodyEn: `**Hardware** encompasses all the physical, tangible electronic, magnetic, and mechanical parts of a computer system. If you can physically touch it, weigh it on a scale, or see its circuit boards, it is hardware!

**Categories of Hardware:**
1. **Input Hardware:** Keyboard, optical mouse, flatbed scanner, barcode scanner, microphone.
2. **Processing Hardware:** Central Processing Unit (CPU), Graphics Processing Unit (GPU), motherboard chipset.
3. **Storage Hardware:**
   - *Primary:* RAM sticks, cache SRAM chips, BIOS ROM chip.
   - *Secondary:* NVMe SSD, SATA Hard Disk Drive, USB flash drive.
4. **Output Hardware:** Monitor, laser printer, stereo speakers, projector.
5. **Communication Hardware:** Network Interface Card (NIC), Wi-Fi adapter, router, fiber-optic modem.`,
        bodyBn: `**হার্ডওয়্যার:** কম্পিউটারের সকল দৃশ্যমান এবং স্পর্শযোগ্য যন্ত্রাংশকে হার্ডওয়্যার বলে। যেমন: মাদারবোর্ড, প্রসেসর, র‍্যাম, হার্ডডিস্ক, কীবোর্ড, মাউস ইত্যাদি।`,
      },
      {
        heading: 'Software: Definition, Categories and Examples',
        bodyEn: `**Software** refers to the intangible set of instructions, programs, data structures, and documentation that command the computer hardware to execute designated tasks. You cannot touch software physically; it exists as patterns of binary charges and logic code.

**Primary Categories of Software:**
1. **System Software:**
   - Controls and manages internal computer hardware.
   - Acts as the foundational intermediary between hardware and user applications.
   - *Examples:* Operating Systems (Windows 11, Linux Ubuntu, macOS), device drivers, system utilities (disk formatters, antivirus).
2. **Application Software:**
   - Designed to help the end-user accomplish specific productive, creative, or communicative tasks.
   - *Examples:* Microsoft Word (word processing), Google Chrome (web browsing), VLC (media player), AutoCAD (engineering design).`,
        bodyBn: `**সফটওয়্যার:** কম্পিউটারের অদৃশ্য নির্দেশাবলি, কোড ও প্রোগ্রামসমূহকে সফটওয়্যার বলে যা হার্ডওয়্যারকে পরিচালনা করে। সফটওয়্যার প্রধানত দুই প্রকার: সিস্টেম সফটওয়্যার (যেমন: উইন্ডোজ, লিনাক্স) এবং অ্যাপ্লিকেশন সফটওয়্যার (যেমন: এমএস ওয়ার্ড, গুগল ক্রোম)।`,
      },
      {
        heading: 'Hardware versus Software Comparison Table',
        bodyEn: `| Characteristic | Hardware | Software |
| :--- | :--- | :--- |
| **Physical Nature** | Tangible (can touch, hold, and see physically) | Intangible (logic, code, and instructions) |
| **Manufacturing** | Fabricated in semiconductor foundries and factories | Authored and compiled by software engineers |
| **Wear & Tear** | Subject to physical wear, friction, and heat failure | Does not wear out physically (can have bugs) |
| **Replacement** | If broken, physically repaired or replaced with new part | If buggy, patched, updated, or re-installed |
| **Dependency** | Cannot function without software instructions | Cannot execute without hardware circuitry |
| **Viruses** | Not infected directly by software viruses | Vulnerable to malware, trojans, and virus infection |`,
        bodyBn: `হার্ডওয়্যার এবং সফটওয়্যার একে অপরের পরিপূরক। হার্ডওয়্যার ছাড়া সফটওয়্যার চলতে পারে না, আর সফটওয়্যার ছাড়া হার্ডওয়্যার কেবল কিছু মূল্যহীন ধাতব টুকরো।`,
      },
      {
        heading: 'Organizational Chart of a Computer System',
        bodyEn: `Here is the comprehensive taxonomic hierarchy of a computer system:

\`\`\`
                     ┌───────────────────────────────┐
                     │        COMPUTER SYSTEM        │
                     └───────────────┬───────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────┐                         ┌─────────────────────────┐
│        HARDWARE         │                         │        SOFTWARE         │
└──────────┬──────────────┘                         └──────────┬──────────────┘
           │                                                   │
 ┌─────────┼─────────┬─────────┐                     ┌─────────┴─────────┐
 ▼         ▼         ▼         ▼                     ▼                   ▼
Input   Processing Storage  Output             System Software     Application Software
Device    (CPU)     Device   Device                  │                   │
                                               ┌─────┴─────┐       ┌─────┴─────┐
                                               ▼           ▼       ▼           ▼
                                            Operating   Utility  General    Custom/
                                             System    Software  Purpose   Specialized
\`\`\``,
        bodyBn: `কম্পিউটার সিস্টেমের সাংগঠনিক চার্টটি হার্ডওয়্যার ও সফটওয়্যার এবং তাদের উপশাখাগুলোকে পরিষ্কারভাবে উপস্থাপন করে।`,
      },
    ],
    interactiveType: 'hardware-software-chart',
  },

  // ========================================================
  // LESSON 5: Memory and Storage
  // ========================================================
  {
    id: 'cb-memory-and-storage',
    track: 'computer-basics',
    order: 5,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '5. Memory and Storage',
      bn: '৫. মেমোরি ও স্টোরেজ',
    },
    subtitle: {
      en: 'Primary memory vs secondary storage, memory hierarchy, and storage media.',
      bn: 'প্রাইমারি মেমোরি বনাম সেকেন্ডারি স্টোরেজ, মেমোরি হায়ারার্কি ও স্টোরেজ মাধ্যম।',
    },
    keyTakeaways: [
      'Primary memory (RAM, Cache, Registers) is fast, directly accessible by the CPU, but generally volatile.',
      'Secondary storage (SSD, HDD, Optical, Magnetic tape) is non-volatile, large capacity, but significantly slower.',
      'Volatile memory loses its contents immediately when electrical power is switched off; Non-volatile retains data permanently.',
      'The Memory Hierarchy trades speed against capacity and cost per bit: Registers > Cache (L1, L2, L3) > RAM > Secondary Storage.',
      'ROM (Read Only Memory) contains permanent bootup firmware (BIOS/UEFI) written by manufacturers.',
      'Understand historical and modern storage media: Floppy disks, CDs, DVDs, Magnetic Tape, and USB Pen Drives.',
    ],
    contentSections: [
      {
        heading: 'Primary Memory versus Secondary Storage',
        bodyEn: `A computer utilizes two distinct tiers of memory:

- **Primary Memory (Main Memory / Working Memory):**
  - Directly communicated with by the CPU over the system bus.
  - Houses the operating system kernel and actively running programs and data.
  - Extremely fast electronic access times (nanoseconds).
  - High cost per gigabyte, smaller capacity.
  - Mostly **Volatile** (loses data on power loss).

- **Secondary Storage (Auxiliary Memory / Mass Storage):**
  - Not directly addressable by the CPU; data must first be copied into RAM before the CPU can read it.
  - Preserves user files, games, operating system installations, and documents permanently.
  - Slower access times (milliseconds for magnetic disks, microseconds for SSDs).
  - Low cost per gigabyte, enormous storage capacity (terabytes).
  - **Non-Volatile** (data remains intact when powered down).`,
        bodyBn: `**প্রাইমারি মেমোরি:** বিদ্যুৎ চলে গেলে এর ডেটা মুছে যায় (ভলাটাইল), তবে এটি অত্যন্ত দ্রুতগতির। যেমন: র‍্যাম (RAM)।
**সেকেন্ডারি স্টোরেজ:** বিদ্যুৎ চলে গেলেও ডেটা অক্ষত থাকে (নন-ভলাটাইল), যেমন: হার্ডডিস্ক, এসএসডি বা পেনড্রাইভ।`,
      },
      {
        heading: 'Primary Memory Types: Registers, Cache, RAM, and ROM',
        bodyEn: `### 1. CPU Registers
- Located directly inside the CPU core.
- The absolute fastest memory in the entire computer (sub-nanosecond speeds).
- Tiny storage capacity (usually 32 bits to 64 bits per register).
- *Examples:* Program Counter (PC), Instruction Register (IR), Memory Address Register (MAR), Accumulator (ACC).

### 2. Cache Memory
- Ultra-high-speed Static RAM (SRAM) sitting between the CPU and main memory (RAM).
- Stores copies of frequently used instructions and data to minimize CPU idle wait times.
- Organized into levels:
  - **L1 Cache:** Smallest (32KB–64KB) and fastest, built directly inside each CPU core.
  - **L2 Cache:** Larger (512KB–1MB per core), slightly slower than L1.
  - **L3 Cache:** Shared across all CPU cores (8MB–64MB+).

### 3. RAM (Random Access Memory)
- Dynamic RAM (DRAM) chips mounted on DIMM sticks on the motherboard.
- "Random access" means any memory cell can be accessed directly in the same amount of time regardless of its physical location.
- **Volatile:** When your computer reboots or turns off, everything in RAM evaporates.

### 4. ROM (Read Only Memory)
- **Non-Volatile** semiconductor memory chip on the motherboard.
- Contains the initial startup instructions (**BIOS / Basic Input Output System** or modern UEFI).
- When you turn on your PC, the CPU immediately begins executing instructions from ROM to perform the Power-On Self-Test (POST) and find your operating system drive.`,
        bodyBn: `রেজিস্টার (সবচেয়ে দ্রুত), ক্যাশ মেমোরি (L1, L2, L3), র‍্যাম (কাজের সময় অস্থায়ী মেমোরি), এবং রম (কম্পিউটার চালু করার বুটস্ট্র্যাপ নির্দেশ ধারণকারী স্থায়ী মেমোরি)।`,
      },
      {
        heading: 'Secondary Storage Media (Historical and Modern)',
        bodyEn: `### Magnetic Storage:
- **Hard Disk Drives (HDD):** Spinning aluminum platters coated with magnetic material, read by mechanical actuator heads. High storage capacity at low cost.
- **Floppy Disks (Historical Milestone):** 3.5-inch magnetic diskettes with a flexible plastic disc inside. Standard capacity was only **1.44 Megabytes**! Highly popular in the 1980s and 1990s.
- **Magnetic Tape Storage:** Long plastic ribbons coated with magnetic oxide. Very slow sequential access, but massive capacity and multi-decade lifespan make it the gold standard for long-term bank and government archival backups.

### Optical Storage:
- **Compact Disc (CD):** Polycarbonate disc read by an infrared laser. Holds **700 Megabytes** of audio or data. Formats: CD-ROM (read-only), CD-R (recordable once), CD-RW (rewritable).
- **Digital Versatile Disc (DVD):** Uses a narrower red laser to store more tightly packed pits and tracks. Capacity: **4.7 Gigabytes** (single layer) to **8.5 Gigabytes** (dual layer).

### Solid-State Flash Storage:
- **Pen Drives / USB Flash Drives:** Portable thumb drives utilizing non-volatile NAND flash memory chips. No moving parts, shock resistant, plug-and-play.
- **Solid State Drives (SSD):** Modern replacement for mechanical hard drives. Uses NAND flash chips connected via high-speed NVMe/PCIe buses, offering 10x to 50x faster read/write speeds than HDDs.`,
        bodyBn: `সেকেন্ডারি স্টোরেজ মাধ্যমের মধ্যে রয়েছে স্পিনিং হার্ডডিস্ক, ঐতিহাসিক ফ্লপি ডিস্ক (১.৪৪ মেগাবাইট), অপটিক্যাল সিডি ও ডিভিডি, দীর্ঘমেয়াদী ম্যাগনেটিক টেপ এবং আধুনিক ইউএসবি পেনড্রাইভ ও দ্রুতগতির এসএসডি।`,
      },
    ],
    interactiveType: 'memory-hierarchy-pyramid',
  },

  // ========================================================
  // LESSON 6: Types of Software and Operating Systems
  // ========================================================
  {
    id: 'cb-software-and-os',
    track: 'computer-basics',
    order: 6,
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    title: {
      en: '6. Types of Software and Operating Systems',
      bn: '৬. সফটওয়্যার ও অপারেটিং সিস্টেমের প্রকারভেদ',
    },
    subtitle: {
      en: 'System vs application software, OS roles, GUI vs CUI/CLI, and software categories.',
      bn: 'সিস্টেম বনাম অ্যাপ্লিকেশন সফটওয়্যার, ওএস-এর কাজ, গুই বনাম সিইউআই/সিএলআই।',
    },
    keyTakeaways: [
      'System Software manages hardware and provides a stable platform for applications to run.',
      'The Operating System (OS) is the master control program that orchestrates hardware, CPU scheduling, file storage, and user security.',
      'Utility software performs maintenance, protection, and housekeeping tasks (antivirus, disk cleanup, file compression).',
      'User Interfaces evolved from Character/Command-Line Interfaces (CUI/CLI) to Graphical User Interfaces (GUI).',
      'Application software serves user tasks: word processing, spreadsheets, databases, presentations, graphics, browsing, and multimedia.',
      'Recognize both historical classics (Lotus 1-2-3, WordPerfect, Netscape) and modern standards (Excel, Word, Chrome).',
    ],
    contentSections: [
      {
        heading: 'System Software: The Backbone of the Computer',
        bodyEn: `**System Software** manages the internal computer hardware and provides a platform upon which application software can operate. It is composed of:

1. **Operating System (OS):**
   - The master control program that boots first and supervises everything.
   - *Core Responsibilities:*
     - **Process Management:** Allocates CPU time slices to active processes.
     - **Memory Management:** Allocates and frees RAM blocks safely.
     - **File System Management:** Organizes files into directories and handles disk reads/writes.
     - **Device Management:** Communicates with peripherals via device drivers.
     - **Security & User Access:** Authenticates usernames, passwords, and permission controls.
   - *Popular Examples:* Microsoft Windows, macOS, Linux (Ubuntu, Debian, RedHat), Android, Apple iOS.

2. **Device Drivers:** Specialized translation programs that allow the OS to talk to specific hardware (like an NVIDIA graphics card or an HP printer).

3. **Utility Software:** Housekeeping and maintenance tools:
   - Antivirus and antimalware utilities (Windows Defender, Malwarebytes).
   - Disk cleanup and defragmentation tools.
   - File archivers and compression utilities (WinRAR, 7-Zip).
   - Backup and recovery software.`,
        bodyBn: `সিস্টেম সফটওয়্যার হার্ডওয়্যারের সাথে অ্যাপ্লিকেশন সফটওয়্যারের যোগসূত্র তৈরি করে। এর মূল হলো অপারেটিং সিস্টেম (OS), যা প্রসেসর, মেমোরি, ফাইল এবং সিকিউরিটি নিয়ন্ত্রণ করে।`,
      },
      {
        heading: 'User Interfaces: GUI versus CUI / CLI',
        bodyEn: `How do humans talk to the operating system? Through a **User Interface (UI)**:

### 1. CUI (Character User Interface) / Modern CLI (Command Line Interface)
- The user communicates solely by typing text commands into a terminal.
- *Characteristics:*
  - Requires memorizing command syntax (e.g., \`dir\`, \`ls\`, \`cd\`, \`mkdir\`).
  - Minimal memory and processor consumption.
  - Extremely fast and powerful for experienced system administrators, developers, and servers.
- *Examples:* MS-DOS (historical), Linux Bash Terminal, Windows PowerShell.

### 2. GUI (Graphical User Interface)
- Built around visual elements known as **WIMP** (**W**indows, **I**cons, **M**enus, and **P**ointers).
- *Characteristics:*
  - Intuitive and beginner-friendly: you point and click with a mouse or tap with your finger.
  - Requires more RAM and graphical processing power to render animations, shadows, and windows.
- *Examples:* Windows 11, macOS desktop, smartphone touch interfaces.`,
        bodyBn: `**CUI/CLI:** কীবোর্ডে টেক্সট কমান্ড লিখে কাজ করতে হয় (যেমন: MS-DOS, Linux Terminal)। দ্রুত ও শক্তিশালী।
**GUI:** আইকন, উইন্ডো ও মাউস ক্লিকের মাধ্যমে গ্রাফিক্যাল ইন্টারফেসে সহজে কাজ করা যায় (যেমন: Windows 11, macOS)।`,
      },
      {
        heading: 'Major Categories of Application Software',
        bodyEn: `| Category | Primary Purpose | Modern Industry Standards | Historical Exam Classics |
| :--- | :--- | :--- | :--- |
| **Word Processing** | Writing, editing, formatting text documents | Microsoft Word, Google Docs | WordPerfect, WordStar |
| **Spreadsheets** | Grid calculation, financial formulas, charts | Microsoft Excel, Google Sheets | Lotus 1-2-3, VisiCalc |
| **Database Software** | Storing, querying, and indexing structured records | MySQL, PostgreSQL, Oracle, MongoDB | Microsoft Access, dBASE, FoxPro |
| **Presentation** | Creating slide decks with animations & audio | Microsoft PowerPoint, Google Slides | Harvard Graphics, Lotus Freelance |
| **Graphics & Design** | Photo retouching, vector art, digital illustration | Adobe Photoshop, Illustrator, Figma, Canva | CorelDRAW 3.0, Paintbrush |
| **Web Browsers** | Rendering HTML/CSS/JS web pages from the internet | Google Chrome, Mozilla Firefox, Safari, Edge | Netscape Navigator, Mosaic, IE 6 |
| **Email Software** | Sending, receiving, and managing electronic mail | Outlook, Apple Mail, Gmail web | Eudora, Pegasus Mail |
| **Multimedia** | Playing audio/video, editing sound and movie clips | VLC Media Player, Spotify, Premiere Pro | Windows Media Player, Winamp |`,
        bodyBn: `অ্যাপ্লিকেশন সফটওয়্যারের মধ্যে রয়েছে ওয়ার্ড প্রসেসিং (Word), স্প্রেডশীট (Excel), ডেটাবেস (MySQL), প্রেজেন্টেশন (PowerPoint), গ্রাফিক্স (Photoshop), ব্রাউজার (Chrome) ইত্যাদি।`,
      },
    ],
    interactiveType: 'software-categorizer',
  },

  // ========================================================
  // LESSON 7: Electrical versus Electronic Devices
  // ========================================================
  {
    id: 'cb-electrical-vs-electronic',
    track: 'computer-basics',
    order: 7,
    difficulty: 'Beginner',
    estimatedMinutes: 14,
    title: {
      en: '7. Electrical versus Electronic Devices',
      bn: '৭. ইলেকট্রিক্যাল বনাম ইলেকট্রনিক ডিভাইস',
    },
    subtitle: {
      en: 'Scientific definitions, components, semiconductor principles, and real-world examples.',
      bn: 'বৈজ্ঞানিক সংজ্ঞা, উপাদান, সেমিকন্ডাক্টর নীতি এবং বাস্তব জীবনের উদাহরণ।',
    },
    keyTakeaways: [
      'Electrical devices convert electrical energy directly into other forms (heat, light, mechanical motion) with little or no decision processing.',
      'Electronic devices manipulate and control the flow of electrons to process signals, information, and logic data.',
      'Transistors and semiconductor materials (Silicon, Germanium) are the defining technological heart of electronics.',
      'The Lecture Examples: A standard Toaster is electrical (converts current directly to heat energy); a light sensor circuit is electronic (processes light level signals to trigger actions).',
      'Crucial Nuance: Categories often overlap in modern devices! A modern microwave or smart car has both electrical power elements and electronic computer microcontrollers.',
      'Avoid outdated myths: AC vs DC power or size alone does not define whether a device is electrical or electronic.',
    ],
    contentSections: [
      {
        heading: 'Definitions: Electrical versus Electronic',
        bodyEn: `While people often use the words interchangeably in everyday speech, in engineering and computer science they represent two distinct physical domains:

### 1. Electrical Devices:
- **Definition:** Devices that primarily use electrical current as a source of **raw energy** and convert it directly into other forms of physical energy:
  - Electric current $\\rightarrow$ **Heat** (e.g., electric heater, water geyser).
  - Electric current $\\rightarrow$ **Light** (e.g., incandescent light bulb).
  - Electric current $\\rightarrow$ **Mechanical Motion** (e.g., electric fan, washing machine motor).
- **Key Characteristics:** Heavy copper wiring, coils, heating elements, high current draw, mechanical switches.

### 2. Electronic Devices:
- **Definition:** Devices that carefully manipulate, control, and switch the flow of electrons through semiconductor materials to process **signals, information, and data**.
- **Key Characteristics:** Diodes, transistors, microchips, printed circuit boards (PCBs), logic gates, low-voltage control signals.`,
        bodyBn: `**ইলেকট্রিক্যাল ডিভাইস:** বিদ্যুৎ শক্তিকে সরাসরি তাপ, আলো বা গতিশক্তিতে রূপান্তর করে (যেমন: বৈদ্যুতিক পাখা, হিটার, সাধারণ টোস্টার)।
**ইলেকট্রনিক ডিভাইস:** সেমিকন্ডাক্টরের মাধ্যমে ইলেকট্রনের প্রবাহ নিয়ন্ত্রণ করে সিগন্যাল, তথ্য ও লজিক প্রক্রিয়াজাত করে (যেমন: কম্পিউটার, স্মার্টফোন, লাইট সেন্সর)।`,
      },
      {
        heading: 'The Secret Weapon of Electronics: Semiconductors & Transistors',
        bodyEn: `What allowed electronics to give birth to modern computers? **The Transistor!**

- **Semiconductors (Silicon and Germanium):** Materials whose electrical conductivity lies between a good conductor (like copper) and an insulator (like rubber).
- By introducing tiny microscopic chemical impurities ("doping"), engineers can control whether electric charge flows or is blocked.
- **The Transistor:** Invented in 1947 at Bell Labs, the transistor acts as an ultra-fast electronic switch with **no moving parts**. When a tiny control voltage is applied, it allows current to flow (representing binary **1**); when removed, current stops (representing binary **0**).
- Modern computer CPUs pack over **10 to 50 billion microscopic transistors** onto a silicon chip no bigger than your postage stamp!`,
        bodyBn: `সেমিকন্ডাক্টর (যেমন: সিলিকন) এবং ট্রানজিস্টর হলো ইলেকট্রনিক্সের ভিত্তি। ট্রানজিস্টর কোনো নড়াচড়া ছাড়াই চোখের পলকে সুইচ হিসেবে অন-অফ হতে পারে, যা দিয়ে কম্পিউটারের বাইনারি (০ ও ১) কোড পরিচালিত হয়।`,
      },
      {
        heading: 'The Lecture Comparison Examples',
        bodyEn: `Let's examine the two classic examples highlighted in the lecture:

### Example 1: The Bread Toaster (Electrical Device)
- When you push down the lever, electrical current flows through nichrome resistance heating coils.
- The resistance causes the coils to glow red-hot, directly converting electrical energy into thermal heat to toast the bread.
- There is no decision making, binary computation, or data manipulation occurring.

### Example 2: The Battery & Light-Sensor Circuit (Electronic Device)
- A battery supplies electrical current, but the circuit contains a **photodiode / light-dependent semiconductor sensor**.
- When ambient light falls on the sensor, the semiconductor's resistance shifts, generating a delicate analog electronic signal.
- An electronic transistor amplifier interprets this signal and decides whether to trigger an alarm or switch on a night lamp.
- Information (ambient light level) was measured, processed, and acted upon!`,
        bodyBn: `১. সাধারণ টোস্টার: বিদ্যুৎ থেকে সরাসরি তাপ উৎপাদন করে পাউরুটি সেঁকে (ইলেকট্রিক্যাল)।
২. লাইট সেন্সর সার্কিট: আলোর উপস্থিতি শনাক্ত করে সিগন্যাল প্রক্রিয়াজাত করে সিদ্ধান্ত নেয় (ইলেকট্রনিক)।`,
      },
      {
        heading: 'Comparison Matrix and Modern Nuances',
        bodyEn: `| Dimension | Electrical Devices | Electronic Devices |
| :--- | :--- | :--- |
| **Primary Purpose** | Direct energy conversion (work, heat, mechanical motion) | Information, signal processing, and decision logic |
| **Core Components** | Coils, heating elements, magnets, mechanical switches | Diodes, transistors, microprocessors, semiconductors |
| **Power Consumption** | Typically higher power (hundreds to thousands of Watts) | Typically low to micro-power for signal paths |
| **Heat Generation** | High heat is often the deliberate intended output | Heat is an unwanted byproduct of silicon resistance |
| **Decision Making** | Fixed passive operation | Dynamic logic, branching, programmable decisions |

> [!NOTE]
> **Important Engineering Nuance:**
> In the modern world, electrical and electronic categories frequently overlap! A modern smart toaster or microwave has high-voltage heating coils (electrical) supervised by a microprocessor circuit board with digital timer displays (electronic). Modern electric vehicles (EVs) unite massive electric drive motors with hundreds of electronic computing chips.`,
        bodyBn: `আজকের আধুনিক যুগে অনেক যন্ত্রে ইলেকট্রিক্যাল ও ইলেকট্রনিক উভয় অংশের মেলবন্ধন থাকে। যেমন: একটি আধুনিক ওভেনে রান্নার জন্য ইলেকট্রিক্যাল হিটার থাকে এবং সেটি নিয়ন্ত্রণের জন্য ডিজিটাল ইলেকট্রনিক প্যানেল থাকে।`,
      },
    ],
    interactiveType: 'electrical-electronic-comparator',
  },

  // ========================================================
  // LESSON 8: Revision and Practice
  // ========================================================
  {
    id: 'cb-revision-and-practice',
    track: 'computer-basics',
    order: 8,
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    title: {
      en: '8. Revision and Practice',
      bn: '৮. পুনরাবৃত্তি ও অনুশীলন',
    },
    subtitle: {
      en: 'Comprehensive exam review, MCQs, classification drills, and architecture simulation quiz.',
      bn: 'পরীক্ষার প্রস্তুতি, বহুনির্বাচনী প্রশ্ন, শ্রেণিবিন্যাস অনুশীলন ও স্থাপত্য কুইজ।',
    },
    keyTakeaways: [
      'Consolidate every core concept learned across all seven previous lessons.',
      'Practice with exam-style Multiple Choice Questions with detailed pedagogical explanations.',
      'Test your mastery with interactive Hardware vs Software and Input vs Output classification drills.',
      'Verify your understanding of memory hierarchy speeds and storage media capacities.',
      'Pass the final revision assessment to complete the Computer Basics learning track and claim 200 total XP!',
    ],
    contentSections: [
      {
        heading: 'Course Summary & Exam Preparation Guidelines',
        bodyEn: `Congratulations on progressing through the complete syllabus of **Web-101 Lecture 01: Computer Hardware & Software Fundamentals**!

### Key Exam Checkpoints:
1. **Definition & IPO:** Be prepared to write the exact definition of a computer and diagram the Input $\\rightarrow$ Processing $\\rightarrow$ Output cycle.
2. **Word Origin:** Remember that the word computer comes from the Latin verb *computare* ("to reckon/calculate") and historically referred to human mathematicians.
3. **Five Functional Units:** Clearly distinguish ALU (math/logic) from Control Unit (supervisory conductor). Remember data passes through Memory before ALU!
4. **Hardware vs Software:** Know the difference between tangible components and intangible code.
5. **Memory Hierarchy:** Order registers, cache, RAM, and storage by speed, cost, and capacity. Be ready to explain volatile vs non-volatile.
6. **Operating System Roles:** Cite GUI vs CLI, and list categories of application software.
7. **Electrical vs Electronic:** Explain that electrical converts raw energy to heat/motion, while electronics manipulates electron signals using semiconductors.`,
        bodyBn: `ওয়েব-১০১ প্রথম লেকচারের সমস্ত গুরুত্বপূর্ণ বিষয়গুলো এখানে রিভিশন করুন এবং নিচের ইন্টারেক্টিভ কুইজ ও অনুশীলনীগুলো সমাধান করে আপনার দক্ষতা যাচাই করুন।`,
      },
    ],
    interactiveType: 'comprehensive-quiz-and-drills',
  },
];
