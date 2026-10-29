// Module 2: CPU Fundamentals & Architecture (Lecture File 02)
// Lessons 9 to 13: CPU Internals, Compatibility, RISC vs CISC, The Bus Highway, Standards & Ports, and Measuring Speed.

export const MODULE_2_LESSONS = [
  // ========================================================
  // LESSON 9: Inside the CPU: Registers, Compatibility & Coprocessors
  // ========================================================
  {
    id: 'cb-cpu-internals-compatibility',
    track: 'computer-basics',
    order: 9,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '9. Inside the CPU: Registers, Compatibility & Coprocessors',
      bn: '৯. সিপিইউ-র অভ্যন্তরীণ গঠন: রেজিস্টার, সামঞ্জস্য ও কো-প্রসেসর',
    },
    subtitle: {
      en: 'What processing is, CPU anatomy, upward vs downward compatibility, and math coprocessors.',
      bn: 'প্রসেসিং কী, সিপিইউ-র মূল উপাদান, আপওয়ার্ড বনাম ডাউনওয়ার্ড সামঞ্জস্য ও কো-প্রসেসর।',
    },
    keyTakeaways: [
      'Processing transforms raw data into meaningful information; handled by the CPU and Memory on the motherboard.',
      'The CPU has 3 pillars: ALU (math/logic), Control Unit (traffic cop), and Registers (super-fast internal scratchpads).',
      'Registers sit directly on the CPU silicon die, operating at sub-nanosecond speeds (< 1 ns).',
      'Upward (Forward) Compatibility: Software written for an older CPU runs smoothly on newer CPU generations.',
      'Downward (Backward) Compatibility: A new CPU or operating system can run older predecessor software.',
      'A Co-processor is a dedicated math specialist (FPU) offloading heavy floating-point and trigonometry calculations.',
    ],
    keyTakeawaysBn: [
      'প্রসেসিং হলো কাঁচা উপাত্তকে প্রয়োজনীয় তথ্যে রূপান্তরের প্রক্রিয়া; যা মাদারবোর্ডে সিপিইউ ও মেমোরি দ্বারা সম্পন্ন হয়।',
      'সিপিইউ-র ৩টি প্রধান স্তম্ভ: এএলইউ (গণিত/যুক্তি), কন্ট্রোল ইউনিট (ট্রাফিক পুলিশ) এবং রেজিস্টার (অতি দ্রুতগতির মেমোরি)।',
      'রেজিস্টার সরাসরি সিপিইউ কোরের ভেতরে থাকে এবং ১ ন্যানোসেকেন্ডেরও কম সময়ে কাজ করে।',
      'আপওয়ার্ড সামঞ্জস্য (Upward Compatibility): পুরনো সিপিইউ-র জন্য তৈরি সফটওয়্যার নতুন প্রজন্মের সিপিইউ-তে নির্বিঘ্নে চলে।',
      'ডাউনওয়ার্ড সামঞ্জস্য (Downward Compatibility): একটি নতুন প্রসেসর বা সিস্টেম পুরনো সফটওয়্যারকে সমর্থন করে।',
      'কো-প্রসেসর (Co-processor) হলো বিশেষ গণিতবিদ যা জটিল ত্রিকোণমিতি ও দশমিক হিসাবের ভার নিজের কাঁধে নেয়।',
    ],
    contentSections: [
      {
        heading: 'What is Processing? (The Kitchen Chef Analogy)',
        headingBn: 'প্রসেসিং কী? (রান্নাঘরের প্রধান শেফের উপমা)',
        bodyEn: `In computer science, **Processing** is the procedure that transforms raw, unorganized data into useful, understandable information.
- The **Processor (CPU)** is the beating heart and brain of the computer system.
- It is mounted on the **Motherboard** (the central circuit board), connected tightly with high-speed memory.

**Think of a Master Chef:**
- Raw potatoes, onions, and spices (**Data**) sit on the prep counter.
- The chef peels, cuts, seasons, and cooks them according to a recipe (**Processing**).
- A steaming, delicious curry is served on the dining table (**Information**)!
- The chef's hands and frying pan represent the **ALU**, the chef's eyes and recipe book represent the **Control Unit**, and the small cutting board right next to their knife is the **Register**!`,
        bodyBn: `কম্পিউটার বিজ্ঞানে **প্রসেসিং (Processing)** হলো এমন এক প্রক্রিয়া যা এলোমেলো কাঁচা ডাটাকে অর্থপূর্ণ তথ্যে রূপান্তর করে।
- **প্রসেসর (CPU)** হলো পুরো কম্পিউটার সিস্টেমের হৃৎপিণ্ড ও মস্তিষ্ক।
- এটি কম্পিউটারের প্রধান সার্কিট বোর্ড **মাদারবোর্ড (Motherboard)**-এ উচ্চগতির মেমোরির সাথে শক্তভাবে যুক্ত থাকে।

**একজন প্রধান শেফের উদাহরণ ভাবুন:**
- কাঁচা আলু, পেঁয়াজ ও মশলাপাতি হলো কাঁচা উপাদান (**ডাটা**)।
- শেফ সেগুলো কাটেন, মশলা মেশান এবং নির্দিষ্ট রেসিপি অনুযায়ী রান্না করেন (**প্রসেসিং**)।
- টেবিলে পরিবেশন করা সুস্বাদু গরম খাবার হলো চূড়ান্ত ফলাফল (**ইনফরমেশন**)!
- শেফের হাত ও কড়াই হলো **ALU**, শেফের চোখ ও রেসিপি বই হলো **কন্ট্রোল ইউনিট**, আর হাতের কাছে থাকা ক্ষুদ্র চপিং বোর্ডটি হলো **রেজিস্টার**!`,
      },
      {
        heading: 'Upward vs. Downward Compatibility: The Movie Player Rule',
        headingBn: 'আপওয়ার্ড বনাম ডাউনওয়ার্ড সামঞ্জস্য (Compatibility): সহজ নিয়ম',
        bodyEn: `When buying computers or writing code, you will constantly hear about **Compatibility**:

| Type | Definition | Simple Real-World Analogy |
| :--- | :--- | :--- |
| **Upward (Forward) Compatibility** | Software designed for an older CPU or OS runs successfully on newer, future machines of the same family. | An old 1990 classic audio cassette working in a 2005 tape deck. You upgrade your PC to Intel Core i9, and your old Minecraft game still launches perfectly! |
| **Downward (Backward) Compatibility** | A brand new CPU, console, or OS is built with the capability to run older programs written for its predecessors. | A modern PlayStation 5 being able to insert and play older PlayStation 4 game discs. |

**Major CPU Titans:** Intel, AMD, and historically Motorola (which powered early Apple Macintosh and Amiga computers).`,
        bodyBn: `নতুন কম্পিউটার কেনা বা সফটওয়্যার ব্যবহারের ক্ষেত্রে **সামঞ্জস্যতা (Compatibility)** অত্যন্ত গুরুত্বপূর্ণ:

| ধরণ | সংজ্ঞা | বাস্তব জীবনের উপমা |
| :--- | :--- | :--- |
| **আপওয়ার্ড সামঞ্জস্য (Forward Compatibility)** | পুরনো প্রসেসর বা সিস্টেমের জন্য তৈরি সফটওয়্যার ভবিষ্যতে আসা নতুন ও আধুনিক প্রসেসরেও সফলভাবে চলে। | পুরনো দিনের অডিও ক্যাসেট নতুন ডেকের মধ্যে সুন্দরভাবে বাজা। আপনি পুরনো পিসি বদলে নতুন কোর আই-৯ নিলেন, কিন্তু আপনার পুরনো গেমটি আগের মতোই চমৎকার চলছে! |
| **ডাউনওয়ার্ড সামঞ্জস্য (Backward Compatibility)** | নতুন আবিষ্কৃত কোনো হার্ডওয়্যার বা ওএস তার পূর্বসূরিদের জন্য তৈরি পুরনো সফটওয়্যার চালাতে সক্ষম হয়। | নতুন প্লেস্টেশন ৫ (PS5) কনসোলে পুরনো প্লেস্টেশন ৪-এর গেম সিডি ঢুকিয়ে অনায়াসে খেলতে পারা। |

**বিশ্বখ্যাত সিপিইউ নির্মাতা প্রতিষ্ঠান:** ইন্টেল (Intel), এএমডি (AMD) এবং অতীতে মটোরোলা (Motorola—যা অ্যাপলের আদি ম্যাকিন্টশ কম্পিউটার চালাত)।`,
      },
      {
        heading: 'The Co-processor: The Math Superhero',
        headingBn: 'কো-প্রসেসর (Co-processor): জটিল গণিতের সুপারহিরো',
        bodyEn: `What is a **Coprocessor**?
- A separate, specialized instruction-set processor closely coupled to the CPU.
- **Why was it invented?** The main CPU was great at basic integer math (like \`5 + 5\`), but struggled with complex floating-point decimals, exponentiation (\`2.718^{3.14}\`), and trigonometry (\`sin, cos, tan\`).
- The **Math Coprocessor (FPU - Floating Point Unit)** takes these monstrous equations off the CPU's hands, solves them at lightning speed, and hands the answer back.
- **Modern Era:** In early PCs (like Intel 8086 / 80386), you had to buy a separate coprocessor chip (80387) and plug it into a motherboard socket. Today, powerful math coprocessors and graphics FPUs are **built directly into the main silicon CPU die**!`,
        bodyBn: `**কো-প্রসেসর (Co-processor)** আসলে কী?
- মূল সিপিইউ-র সাথে ঘনিষ্ঠভাবে যুক্ত একটি বিশেষ সহায়ক প্রসেসর।
- **কেন এটি তৈরি করা হয়েছিল?** সাধারণ সিপিইউ পূর্ণসংখ্যার যোগ-বিয়োগে পারদর্শী হলেও জটিল দশমিক ভগ্নাংশ, পাওয়ার এবং ত্রিকোণমিতিক সমীকরণে সময় বেশি নিত।
- **ম্যাথ কো-প্রসেসর (FPU)** এই জটিল হিসাবগুলো নিজের দায়িত্বে নিয়ে চোখের পলকে সমাধান করে সিপিইউ-কে দেয়।
- **আধুনিক রূপ:** আশির দশকে আলাদা সকেটে কো-প্রসেসর চিপ লাগাতে হতো। আজকের আধুনিক প্রসেসরে শক্তিশালী এফপিইউ (FPU) ও জিপিইউ **সরাসরি মূল সিলিকন চিপের ভেতরেই বিল্ট-ইন থাকে**!`,
      },
    ],
    interactiveType: 'lesson2-suite',
  },

  // ========================================================
  // LESSON 10: RISC vs. CISC Architectures
  // ========================================================
  {
    id: 'cb-risc-vs-cisc',
    track: 'computer-basics',
    order: 10,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '10. RISC vs. CISC Architectures',
      bn: '১০. রিস্ক বনাম সিস্ক আর্কিটেকচার (RISC vs. CISC)',
    },
    subtitle: {
      en: 'The nimble sprinter vs the heavy Swiss Army knife: instruction sets, pipelining, and silicon design.',
      bn: 'দ্রুতগতির অ্যাথলেট বনাম ভারী সুইস ছুরি: নির্দেশনা সেট, পাইপলাইনিং এবং প্রসেসর ডিজাইন।',
    },
    keyTakeaways: [
      'RISC stands for Reduced Instruction Set Computer (< 200 simple, fixed-length instructions).',
      'CISC stands for Complex Instruction Set Computer (200 to 300+ variable-length instructions).',
      'RISC executes instructions in a single uniform clock cycle using streamlined hardware pipelining.',
      'CISC uses complex microcode decoders inside the silicon; one command can take 5 to 10+ clock cycles.',
      'RISC chips (ARM, Apple Silicon M-series) dominate smartphones, tablets, and lightweight laptops due to ultra-low battery drain.',
      'CISC chips (Intel x86 Core, AMD Ryzen) dominate high-performance gaming PCs, heavy workstation renderers, and legacy servers.',
    ],
    keyTakeawaysBn: [
      'রিস্ক (RISC) মানে Reduced Instruction Set Computer (২০০টিরও কম সহজ এবং নির্দিষ্ট দৈর্ঘ্যের নির্দেশনা)।',
      'সিস্ক (CISC) মানে Complex Instruction Set Computer (২০০ থেকে ৩০০টির বেশি বিভিন্ন দৈর্ঘ্যের জটিল নির্দেশনা)।',
      'রিস্ক প্রসেসর প্রতিটি সহজ নির্দেশনা মাত্র ১টি ক্লক সাইকেলে সম্পন্ন করে।',
      'সিস্ক প্রসেসর সিলিকনের ভেতরের মাইক্রোকোড ব্যবহার করে একটি জটিল কাজ ৫ থেকে ১০+ সাইকেলে সম্পন্ন করে।',
      'কম ব্যাটারি খরচ ও কম তাপের কারণে স্মার্টফোন ও ট্যাবলেটে রিস্ক (ARM, Apple Silicon) রাজত্ব করছে।',
      'ভারী গেমিং ও হাই-পারফরম্যান্স কম্পিউটিংয়ে ইন্টেল ও এএমডি-র সিস্ক (x86) প্রসেসর এগিয়ে।',
    ],
    contentSections: [
      {
        heading: 'The Great Philosophy Clash: Sprinter vs. Swiss Army Knife',
        headingBn: 'প্রসেসর দর্শনের লড়াই: অ্যাথলেট বনাম সুইস আর্মি ছুরি',
        bodyEn: `How should a chip be designed? For decades, two computer engineering philosophies fought:

1. **The CISC Philosophy (The Swiss Army Knife):**
   - *"Let's give the programmer a single powerful tool for everything!"*
   - A single CISC instruction can say: *"Go to memory address 50, multiply it with address 60, and store the answer in address 70 in one shot!"*
   - Sounds amazing, right? But the chip needs massive, complicated internal hardware decoders to untangle that command. It runs hot, consumes heavy battery power, and takes multiple clock ticks.

2. **The RISC Philosophy (The Olympic Sprinter):**
   - *"Keep the chip simple and light! Do one tiny thing per step, but do it at supersonic speed!"*
   - Instead of one big instruction, RISC breaks it into 4 tiny steps: \`LOAD\`, \`LOAD\`, \`MULTIPLY\`, \`STORE\`.
   - Because every instruction is the exact same length (32 bits), the CPU can line them up on a conveyor belt (**Pipelining**) and finish one instruction on **every single tick of the clock**!`,
        bodyBn: `একটি মাইক্রোপ্রসেসর কীভাবে তৈরি করা উচিত? এই নিয়ে প্রকৌশলীদের দুটি ভিন্ন দল ছিল:

১. **সিস্ক দর্শন (CISC - বহুমুখী সুইস ছুরি):**
   - *"প্রোগ্রামারকে এমন কমান্ড দাও যা এক লাইনেই বিশাল কাজ করে ফেলবে!"*
   - একটি সিস্ক কমান্ড বলতে পারে: *"মেমোরির ৫০ নম্বর ঘর থেকে ডাটা নাও, ৬০ নম্বরের সাথে গুণ করো এবং ৭০ নম্বরে সংরক্ষণ করো!"*
   - শুনতে দারুণ লাগলেও এই জটিল নির্দেশ বুঝতে প্রসেসরের ভেতরে শত শত জটিল ট্রানজিস্টর ও মাইক্রোকোড লাগে। এতে প্রচুর বিদ্যুৎ খরচ হয় ও চিপ গরম হয়ে যায়।

২. **রিস্ক দর্শন (RISC - ক্ষিপ্রগতির দৌড়বিদ):**
   - *"চিপকে জটিল বানিও না! প্রতি ধাপে একটি সহজ কাজ করো, কিন্তু বিদ্যুতের গতিতে করো!"*
   - বিশাল একটি আদেশের বদলে রিস্ক কাজটিকে ৪টি অতি সহজ ধাপে ভাগ করে: \`LOAD\`, \`LOAD\`, \`MULTIPLY\`, \`STORE\`।
   - সব নির্দেশনার দৈর্ঘ্য সমান (৩২-বিট) হওয়ায় প্রসেসর কনভেয়ার বেল্টের মতো সাজিয়ে (**পাইপলাইনিং**) **প্রতিটি ক্লক টাস টাস করে মাত্র ১ সাইকেলেই** শেষ করে ফেলে!`,
      },
      {
        heading: 'RISC vs. CISC: The Definitive Exam Comparison Table',
        headingBn: 'রিস্ক বনাম সিস্ক: পরীক্ষার জন্য সম্পূর্ণ তুলনামূলক ছক',
        bodyEn: `Here is the core summary table you must know for your Web-101 diploma exams:

| Feature / Attribute | RISC (Reduced Instruction Set) | CISC (Complex Instruction Set) |
| :--- | :--- | :--- |
| **Instruction Count** | Less than 200 instructions | 200 to 300+ instructions |
| **Instruction Length** | **Fixed** uniform length (e.g., 32-bit) | **Variable** length (e.g., 8 to 120 bits) |
| **Hardware Complexity** | Simple, streamlined silicon | Complex internal microcode logic |
| **Execution Cycles** | Almost all run in **1 clock cycle** | Varies widely (1 to 10+ clock cycles) |
| **Addressing Modes** | Fixed and limited modes | Variable, complex addressing modes |
| **Power & Heat** | Very low power, minimal heat | Higher power draw, generates more heat |
| **Cost** | Lower manufacturing cost per chip | Higher manufacturing cost |
| **Prominent Examples** | **ARM** (Snapdragon, MediaTek), **Apple Silicon** (M1/M2/M3/M4), **PowerPC** | **x86** (Intel Core i3/i5/i7/i9, AMD Ryzen), **Motorola 680x0** |`,
        bodyBn: `পরীক্ষার খাতায় সর্বোচ্চ নম্বর পেতে নিচের ছকটি মুখস্থ রাখা অত্যন্ত জরুরি:

| বৈশিষ্ট্য | RISC (রিস্ক) | CISC (সিস্ক) |
| :--- | :--- | :--- |
| **নির্দেশনার সংখ্যা** | ২০০-এর কম সাধারণ নির্দেশনা | ২০০ থেকে ৩০০টির বেশি জটিল নির্দেশনা |
| **নির্দেশনার দৈর্ঘ্য** | **নির্দিষ্ট ও সমান** (যেমন: ৩২-বিট) | **পরিবর্তনশীল** (যেমন: ৮ থেকে ১২০ বিট) |
| **হার্ডওয়্যারের গঠন** | সহজ, সুসংগঠিত সিলিকন চিপ | জটিল মাইক্রোকোড ও ডিকোডার সমন্বিত |
| **এক্সিকিউশন সময়** | প্রায় প্রতিটি নির্দেশ **১ ক্লক সাইকেলে** শেষ | নির্দেশভেদে ১ থেকে ১০+ সাইকেল লাগে |
| **এড্রেসিং মোড** | নির্দিষ্ট ও সীমিত এড্রেসিং মোড | বহুবিধ জটিল এড্রেসিং মোড |
| **শক্তি ও তাপমাত্রা** | অত্যন্ত কম বিদ্যুৎ খরচ ও কম তাপ | বেশি বিদ্যুৎ খরচ ও উচ্চ তাপ উৎপন্ন করে |
| **উৎপাদন খরচ** | তুলনামূলক কম উৎপাদন খরচ | জটিল গঠনের কারণে বেশি উৎপাদন খরচ |
| **বাস্তব উদাহরণ** | **ARM** (স্মার্টফোন), **Apple Silicon** (M1-M4), **PowerPC** | **x86** (Intel Core, AMD Ryzen), **Motorola 680x0** |`,
      },
    ],
    interactiveType: 'lesson10-suite',
  },

  // ========================================================
  // LESSON 11: The Computer Bus System: Address, Data & Control Highways
  // ========================================================
  {
    id: 'cb-computer-bus-system',
    track: 'computer-basics',
    order: 11,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '11. The Computer Bus System: Address, Data & Control Highways',
      bn: '১১. কম্পিউটার বাস সিস্টেম: এড্রেস, ডাটা ও কন্ট্রোল হাইওয়ে',
    },
    subtitle: {
      en: 'The 3-lane copper highway connecting CPU, memory, and expansion ports.',
      bn: 'সিপিইউ, মেমোরি ও পোর্টের মধ্যকার ৩ লেনের ইলেকট্রিক্যাল বাস হাইওয়ে।',
    },
    keyTakeaways: [
      'A Bus is a shared set of microscopic conductive electrical lines transmitting binary signals between components.',
      'Bus Clock Speed is measured in MHz and GHz, determining how frequently bits are sent down the wires.',
      'Address Bus (Unidirectional): Carries target memory/device addresses away from CPU. Formula: 2ⁿ = Max Memory bytes.',
      'Data Bus (Bidirectional): Carries the actual data bytes between CPU, RAM, and storage controllers.',
      'Data Bus width (8, 16, 32, 64 bits) determines the data throughput or bandwidth per clock cycle.',
      'Control Bus: Carries timing, clock synchronization pulses, and supervisory signals (READ, WRITE, IRQ).',
    ],
    keyTakeawaysBn: [
      'বাস (Bus) হলো কম্পিউটারের ভেতরে বিভিন্ন অংশের মধ্যে বাইনারি সিগন্যাল পরিবহনের ধাতব সংযোগ পথ।',
      'বাসের ক্লক গতি মেগাহার্টজ (MHz) ও গিগাহার্টজে (GHz) মাপা হয়, যা প্রতি সেকেন্ডে সিগন্যাল পাঠানোর হার নির্দেশ করে।',
      'এড্রেস বাস (একমুখী): সিপিইউ থেকে মেমোরি ঠিকানাকে বহন করে। সূত্র: ২ⁿ = সর্বোচ্চ মেমোরি ধারণ ক্ষমতা।',
      'ডাটা বাস (দ্বিমুখী): প্রকৃত ফাইল, সংখ্যা ও কোড সিপিইউ এবং মেমোরির মধ্যে আদান-প্রদান করে।',
      'ডাটা বাসের প্রস্থ (৮, ১৬, ৩২, ৬৪ বিট) নির্ধারণ করে প্রতি সেকেন্ডে কত বাইট ডাটা চলাচল করতে পারবে।',
      'কন্ট্রোল বাস: টাইমিং, ক্লক পালস এবং তদারকি সংকেত (READ, WRITE, Interrupt) প্রেরণ করে।',
    ],
    contentSections: [
      {
        heading: 'What is a Computer Bus? (The 3-Lane Highway Analogy)',
        headingBn: 'কম্পিউটার বাস কী? (৩ লেনের মহাসড়কের উপমা)',
        bodyEn: `Inside your computer, components are connected by millions of tiny printed copper wires called a **Bus System**.
Think of a busy delivery highway with 3 dedicated lanes:

1. **Lane 1: The Address Bus (Unidirectional):**
   - Only flows **ONE WAY** (From CPU outwards to RAM and Peripherals).
   - Tells the system: *"Hey! Open mailbox number #0x4F2A!"*
   - It carries **NO DATA**, only postal coordinates.
   - **The Golden Math Rule:** A 16-bit address bus can address $2^{16} = 65,536$ unique locations (**64 KB**). A 32-bit bus addresses $2^{32} = 4,294,967,296$ bytes (**4 GB**). A modern 64-bit bus can address $2^{64}$ bytes (**16 Exabytes**)!

2. **Lane 2: The Data Bus (Bidirectional):**
   - Flows **BOTH WAYS** (CPU ↔ RAM ↔ Storage).
   - Transports the actual cargo (numbers, photos, music samples).
   - If your data bus is 64-bit wide, it transfers **8 full bytes (64 bits)** in a single clock tick!

3. **Lane 3: The Control Bus:**
   - Carries coordination whistles and timing pulses.
   - Signals: *"READ NOW!"*, *"WRITE NOW!"*, *"WAIT!"*, *"INTERRUPT!"*. Without the control bus, components would crash into each other!`,
        bodyBn: `কম্পিউটারের ভেতরে মাদারবোর্ডে কোটি কোটি অতি সূক্ষ্ম তামার তারের সংযোগ পথকে বলা হয় **বাস সিস্টেম (Bus System)**।
একটি ৩ লেনের ডেলিভারি হাইওয়ের কথা কল্পনা করুন:

১. **১ম লেন: এড্রেস বাস (Address Bus - একমুখী):**
   - এটি কেবল **একমুখী (Unidirectional)**—সিপিইউ থেকে মেমোরি ও পোর্টের দিকে যায়।
   - এটি নির্দেশ করে: *"মেমোরির অমুক নির্দিষ্ট ঠিকানায় যাও!"*
   - এতে কোনো ডাটা থাকে না, শুধুই ডাকঘরের মতো ঠিকানা বা কোঅর্ডিনেট থাকে।
   - **সোনালী গাণিতিক সূত্র:** ১৬-বিট এড্রেস বাস ২¹⁶ = ৬৫,৫৩৬টি ঘর (**৬৪ কিলোবাইট**) নিয়ন্ত্রণ করতে পারে। ৩২-বিট বাস ২³² = ৪ গিগাবাইট নিয়ন্ত্রণ করে। আর ৬৪-বিট বাস ১৬ এক্সাবাইট পর্যন্ত মেমোরি হ্যান্ডেল করতে পারে!

২. **২য় লেন: ডাটা বাস (Data Bus - দ্বিমুখী):**
   - এটি **দ্বিমুখী (Bidirectional)**—সিপিইউ থেকে মেমোরিতে যায় এবং মেমোরি থেকে সিপিইউ-তে ফেরত আসে।
   - এটি আসল মালামাল (ছবি, গান, ফাইল, কোড) বহন করে।
   - বাসের প্রস্থ যত বড় হবে (যেমন ৬৪-বিট), প্রতি মুহূর্তে তত বেশি ডাটা একসাথে পার হবে!

৩. **৩য় লেন: কন্ট্রোল বাস (Control Bus):**
   - এটি ট্রাফিক পুলিশের বাঁশি ও টাইমিং সংকেত বহন করে।
   - এর সিগন্যাল: *"এখন পড়ো (READ)!"*, *"এখন লেখো (WRITE)!"*, *"থামো!"*। কন্ট্রোল বাস ছাড়া সব ডাটা জ্যামে পড়ে ধ্বংস হয়ে যেত!`,
      },
      {
        heading: 'Why Bus Width Determines Your Maximum RAM',
        headingBn: 'বাসের প্রস্থ কীভাবে কম্পিউটারের সর্বোচ্চ র‍্যাম নির্ধারণ করে?',
        bodyEn: `Have you ever wondered why old Windows XP 32-bit computers could only use **4 GB of RAM**, even if you plugged in an 8 GB stick?
Here is the mathematical secret:
- With a 32-bit Address Bus, the CPU has 32 physical pins to output electrical 0s and 1s.
- Total unique binary combinations = $2^{32} = 4,294,967,296$ addresses.
- Since each address holds 1 Byte, the maximum memory the CPU could physically point to was **4,294,967,296 Bytes = 4 Gigabytes**! Any extra RAM was completely invisible!
- Modern **64-bit CPUs** have $2^{64}$ combinations, allowing them to support millions of gigabytes of RAM seamlessly!`,
        bodyBn: `আপনি কি কখনো ভেবে দেখেছেন পুরনো ৩২-বিট উইন্ডোজে ৮ জিবি র‍্যাম লাগালেও কেন মাত্র **৪ জিবি** দেখাত?
এর পেছনে রয়েছে চমৎকার গাণিতিক ব্যাখ্যা:
- ৩২-বিট এড্রেস বাসে সিপিইউ-র ৩২টি পিন থাকে ০ বা ১ সিগন্যাল পাঠানোর জন্য।
- এর মোট অনন্য কম্বিনেশন সংখ্যা = ২³² = ৪,২৯,৪৯,৬৭,২৯৬টি ঠিকানা।
- প্রতিটি ঠিকানায় ১ বাইট জমা থাকলে সিপিইউ সর্বোচ্চ **৪ গিগাবাইট** মেমোরির ঠিকানা মনে রাখতে পারে! এর বেশি র‍্যাম থাকলে সিপিইউ তা খুঁজেই পেত না!
- আজকের **৬৪-বিট প্রসেসর** ২⁶⁴ পরিমাণের ঠিকানা মনে রাখতে পারে, যার ফলে যত খুশি বিশাল র‍্যাম লাগানো সম্ভব!`,
      },
    ],
    interactiveType: 'lesson11-suite',
  },

  // ========================================================
  // LESSON 12: Bus Standards (ISA to USB) & Expansion Ports
  // ========================================================
  {
    id: 'cb-bus-standards-and-ports',
    track: 'computer-basics',
    order: 12,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '12. Bus Standards (ISA to USB) & Expansion Ports',
      bn: '১২. বাস স্ট্যান্ডার্ড (ISA থেকে USB) ও এক্সপ্যানশন পোর্টসমূহ',
    },
    subtitle: {
      en: 'From slow 8-bit ISA cards to blazing PCI and universal hot-swappable USB ports.',
      bn: 'ধীরগতির ৮-বিট আইএসএ কার্ড থেকে আধুনিক দ্রুতগতির পিসিআই এবং হট-সোয়াপ ইউএসবি।',
    },
    keyTakeaways: [
      'Bus Standards define physical dimensions, pin counts, voltage, and transmission protocols for add-on cards.',
      'ISA (Industry Standard Architecture): The classic IBM PC 8-bit to 16-bit expansion slot (8 MHz).',
      'PCI (Peripheral Component Interconnect): Intel 32/64-bit standard revolutionizing high-speed sound and video cards.',
      'USB (Universal Serial Bus): Co-invented by Intel (Ajay Bhatt); hot-swappable, daisy-chains up to 127 devices.',
      'PCMCIA: 32-bit credit-card-sized expansion standard engineered for laptops and mobile devices.',
      'Standard Ports: Serial (COM - 1 bit at a time), Parallel (LPT - 8 bits parallel), PS/2, Ethernet RJ-45, VGA/HDMI.',
    ],
    keyTakeawaysBn: [
      'বাস স্ট্যান্ডার্ড মাদারবোর্ডে কার্ড লাগানোর পিন সংখ্যা, ভোল্টেজ এবং ডাটা আদান-প্রদানের নিয়ম ঠিক করে।',
      'আইএসএ (ISA): আদি আইবিএম পিসির ৮-বিট থেকে ১৬-বিট স্লট (৮ মেগাহার্টজ গতি)।',
      'পিসিআই (PCI): ইন্টেলের ৩২/৬৪-বিট উচ্চগতির ওপেন স্ট্যান্ডার্ড যা অডিও ও ভিডিও কার্ডকে দ্রুতগতির করেছিল।',
      'ইউএসবি (USB): অজয় ভাট ও কনসোর্টিয়াম উদ্ভাবিত; কম্পিউটার চালু অবস্থাতেই লাগানো যায় (Hot-swappable) এবং ১২৭টি ডিভাইস যুক্ত করা যায়।',
      'পিসিএমসিআইএ (PCMCIA): ল্যাপটপ ও নোটবুকের জন্য ক্রেডিট কার্ড সাইজের স্লট স্ট্যান্ডার্ড।',
      'স্ট্যান্ডার্ড পোর্ট: সিরিয়াল (COM - ১ বিট করে), প্যারালাল (LPT - একসাথে ৮ বিট), PS/2, ইথারনেট RJ-45, VGA ও HDMI।',
    ],
    contentSections: [
      {
        heading: 'The Evolution of Internal Bus Standards: ISA to PCI',
        headingBn: 'অভ্যন্তরীণ বাস স্ট্যান্ডার্ডের বিবর্তন: আইএসএ থেকে পিসিআই',
        bodyEn: `When personal computers exploded in popularity, companies needed a standardized way to plug in graphics cards, modems, and sound cards:

1. **ISA (Industry Standard Architecture):**
   - Created in 1981 for the original IBM PC.
   - Started as an 8-bit slot running at a sluggish 8 MHz, later expanded to 16-bit with the IBM PC/AT.
2. **MCA (Micro Channel Architecture):**
   - IBM's 1987 proprietary 32-bit bus for PS/2 computers. Failed in the open market because it was **not backward-compatible** with older ISA cards and charged hefty royalties.
3. **EISA (Extended ISA):**
   - An open 32-bit standard formed by a consortium of 9 computer makers (Compaq, HP, etc.) that **remained backward-compatible** with existing 16-bit ISA cards!
4. **PCI (Peripheral Component Interconnect):**
   - Introduced by Intel in 1993. Operated at 33/66 MHz in 32-bit and 64-bit configurations.
   - Truly open, lightning-fast, and powered the 3D gaming revolution (sound cards, network cards, GPUs). Modern computers use **PCIe (PCI Express)** lanes today!`,
        bodyBn: `কম্পিউটারের মাদারবোর্ডে নতুন নতুন গ্রাফিক্স কার্ড বা সাউন্ড কার্ড লাগানোর জন্য তৈরি হয়েছিল বাস স্ট্যান্ডার্ড:

১. **আইএসএ (ISA - Industry Standard Architecture):**
   - ১৯৮১ সালে আদি আইবিএম পিসির জন্য তৈরি।
   - শুরুতে ৮-বিট এবং পরে ১৬-বিটে উন্নীত করা হয়, যার গতি ছিল মাত্র ৮ মেগাহার্টজ।
২. **এমসিএ (MCA - Micro Channel Architecture):**
   - ১৯৮৭ সালে আইবিএম-এর নিজস্ব ৩২-বিট বাস। কিন্তু পুরনো কার্ডের সাথে সামঞ্জস্যহীন (Backward-incompatible) হওয়ায় এটি বাজারে টিকতে পারেনি।
৩. **ই-আইএসএ (EISA):**
   - ৯টি প্রতিযোগী কোম্পানি মিলে তৈরি করে। এটি ৩২-বিট হওয়া সত্ত্বেও পুরনো ১৬-বিট কার্ডও সমর্থন করত।
৪. **পিসিআই (PCI - Peripheral Component Interconnect):**
   - ১৯৯৩ সালে ইন্টেল এটি উন্মুক্ত করে। ৩২ ও ৬৪-বিটের এই উচ্চগতির বাস মাল্টিমিডিয়া ও থ্রিডি গেমিংয়ে বৈপ্লবিক পরিবর্তন আনে। আজকের আধুনিক পিসি এর উন্নত রূপ **PCIe** ব্যবহার করে!`,
      },
      {
        heading: 'USB: The Universal Hero Co-Invented by Ajay Bhatt',
        headingBn: 'ইউএসবি (USB): অজয় ভাটের যুগান্তকারী সার্বজনীন উদ্ভাবন',
        bodyEn: `Before 1996, plugging in peripherals was a nightmare! You had giant 25-pin parallel cables, tiny fragile serial pins, and if you plugged in a mouse while the PC was on, your computer crashed!
Then came **Universal Serial Bus (USB)**:
- Co-invented by Intel team architect **Ajay Bhatt** and the USB-IF consortium.
- **Hot-Swappable:** Plug or unplug anytime without rebooting your computer!
- **Daisy Chaining:** A single USB host controller can link up to **127 daisy-chained devices** through hubs!
- Delivers both high-speed data **and electrical power** to charge phones and power keyboards.`,
        bodyBn: `১৯৯৬ সালের আগে কম্পিউটারে মাউস বা প্রিন্টার লাগানো ছিল এক মহা যন্ত্রণা! একেক ডিভাইসের জন্য একেক রকম বড় বড় পিন ও ক্যাবল লাগত, আর পিসি চালু অবস্থায় প্লাগ লাগালেই কম্পিউটার ক্র্যাশ করত!
এরপর এলো **ইউএসবি (USB - Universal Serial Bus)**:
- ইন্টেলের ভারতীয় বংশোদ্ভূত স্থপতি **অজয় ভাট** ও কনসোর্টিয়াম এটি উদ্ভাবন করেন।
- **হট-সোয়াপ্যাবল (Hot-Swappable):** কম্পিউটার রিস্টার্ট না করেই চালু অবস্থায় যেকোনো সময় প্লাগ লাগানো বা খোলা যায়!
- **১২৭টি ডিভাইস:** একটি মাত্র ইউএসবি কন্ট্রোলারের সাথে হাবের মাধ্যমে সর্বোচ্চ **১২৭টি ডিভাইস** একত্রে যুক্ত করা সম্ভব!
- এটি একই সাথে দ্রুতগতির ডাটা চলাচল এবং মোবাইল চার্জ দেওয়ার মতো প্রয়োজনীয় বিদ্যুৎ শক্তি সরবরাহ করে।`,
      },
      {
        heading: 'Standard vs. Specialized Computer Ports',
        headingBn: 'স্ট্যান্ডার্ড বনাম বিশেষায়িত কম্পিউটার পোর্টসমূহ',
        bodyEn: `Look at the back of a desktop PC:
- **Serial Port (COM):** Sends 1 bit at a time down a single wire (ancient mice and dial-up modems).
- **Parallel Port (LPT):** Sends 8 bits (1 Byte) simultaneously across 8 parallel copper wires (older printers).
- **PS/2 Ports:** Dedicated mini-DIN circular ports (Purple for keyboard, Green for mouse).
- **Ethernet (RJ-45):** Connects to your local Wi-Fi router for broadband internet.
- **Video Ports:** Analog **VGA** (blue 15-pin) evolved into crisp digital **HDMI** and **DisplayPort**.
- **Specialized Ports:** **SCSI** (Small Computer System Interface for high-end server disks), **FireWire (IEEE 1394)** for real-time digital camcorder video transfers, and modern **USB Type-C / Thunderbolt**!`,
        bodyBn: `কম্পিউটারের পেছনের প্যানেলে তাকালে দেখা যায়:
- **সিরিয়াল পোর্ট (Serial / COM):** একটি তার দিয়ে একবারে মাত্র ১ বিট করে ডাটা পাঠায় (আদি মাউস ও মডেম)।
- **প্যারালাল পোর্ট (Parallel / LPT):** ৮টি তার দিয়ে একসাথে পুরো ১ বাইট ডাটা পাঠায় (পুরনো প্রিন্টার)।
- **পিএস/২ পোর্ট (PS/2):** গোল মিনি-ডিন পোর্ট (বেগুনি রঙের কীবোর্ডের জন্য এবং সবুজ রঙের মাউসের জন্য)।
- **ইথারনেট পোর্ট (RJ-45):** ইন্টারনেটের তার সংযুক্ত করার পোর্ট।
- **ভিডিও পোর্ট:** পুরনো এনালগ **VGA** পোর্ট আধুনিক যুগের ডিজিটাল **HDMI** ও **DisplayPort**-এ রূপান্তরিত হয়েছে।
- **বিশেষায়িত পোর্ট:** **SCSI** (সার্ভার ডিস্কের জন্য), **FireWire (IEEE 1394)** (ডিজিটাল ভিডিও ক্যামেরার জন্য), এবং সর্বাধুনিক **USB Type-C**!`,
      },
    ],
    interactiveType: 'lesson11-suite',
  },

  // ========================================================
  // LESSON 13: Measuring Processing Speed: Clock Cycles, MIPS, BIPS & FLOPS
  // ========================================================
  {
    id: 'cb-measuring-cpu-speed',
    track: 'computer-basics',
    order: 13,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '13. Measuring Processing Speed: Clock Cycles, MIPS, BIPS & FLOPS',
      bn: '১৩. প্রসেসিং গতি পরিমাপ: ক্লক সাইকেল, MIPS, BIPS ও FLOPS',
    },
    subtitle: {
      en: 'Nanoseconds, MIPS vs FLOPS, and the 7 golden factors affecting your CPU performance.',
      bn: 'ন্যানোসেকেন্ড, মিপস ও ফ্লপস এবং সিপিইউ-র গতি নিয়ন্ত্রণকারী ৭টি মূল নিয়ামক।',
    },
    keyTakeaways: [
      'Instruction execution time is measured in Milliseconds (10⁻³ s), Microseconds (10⁻⁶ s), Nanoseconds (10⁻⁹ s), and Picoseconds (10⁻¹² s).',
      'MIPS stands for Million Instructions Per Second; BIPS stands for Billion Instructions Per Second.',
      'FLOPS (Floating-Point Operations Per Second) measures raw scientific decimal math power (GFLOPS, TFLOPS).',
      'Supercomputers and modern AI training clusters are ranked globally by their PetaFLOPS and ExaFLOPS performance.',
      'The 7 Factors Governing Speed: Register word size, RAM size, Cache size, Clock speed, Data bus width, Address bus width, and Coprocessor presence.',
    ],
    keyTakeawaysBn: [
      'নির্দেশনা সম্পন্ন হওয়ার সময় মিলি-সেকেন্ড (১০⁻³ s), মাইক্রো-সেকেন্ড (১০⁻⁶ s), ন্যানো-সেকেন্ড (১০⁻⁹ s) এবং পিকো-সেকেন্ডে (১০⁻¹² s) মাপা হয়।',
      'MIPS হলো Million Instructions Per Second (প্রতি সেকেন্ডে ১০ লক্ষ নির্দেশ); BIPS হলো Billion Instructions Per Second।',
      'FLOPS হলো দশমিক ও বৈজ্ঞানিক হিসাবের গতি মাপার একক (GFLOPS, TFLOPS)।',
      'সুপারকম্পিউটার এবং আধুনিক এআই সার্ভারের ক্ষমতা পেটাফ্লপস (PetaFLOPS) ও এক্সাফ্লপসে মাপা হয়।',
      'সিপিইউ গতির ৭টি মূল নিয়ামক: রেজিস্টারের আকার, র‍্যামের পরিমাণ, ক্যাশ মেমোরি, ক্লক স্পিড, ডাটা বাসের প্রস্থ, এড্রেস বাসের প্রস্থ এবং কো-প্রসেসর।',
    ],
    contentSections: [
      {
        heading: 'The Time Scale of Modern Processors',
        headingBn: 'আধুনিক প্রসেসরের সময়ের পরিমাপ',
        bodyEn: `When a human blinks, about **300 Milliseconds** pass. In that single blink, what does a modern CPU do?

| Unit of Time | Fraction of a Second | Scientific Notation | Real-World Context |
| :--- | :--- | :--- | :--- |
| **Millisecond (ms)** | 1 thousandth of a second | $10^{-3}$ s | Hard drive mechanical head seeking a sector (~8 ms) |
| **Microsecond (µs)** | 1 millionth of a second | $10^{-6}$ s | Fast NVMe SSD read access latency (~10–30 µs) |
| **Nanosecond (ns)** | 1 billionth of a second | $10^{-9}$ s | Modern DDR5 RAM read cycle (~15 ns); CPU Cache L1 (~0.8 ns) |
| **Picosecond (ps)** | 1 trillionth of a second | $10^{-12}$ s | High-frequency laser pulses; microscopic transistor gate switching |`,
        bodyBn: `মানুষ চোখের একটি পলক ফেলতে প্রায় **৩০০ মিলি-সেকেন্ড** সময় নেয়। এই একটি পলকের মধ্যে প্রসেসর কী পরিমাণ সময় অতিক্রম করে দেখুন:

| সময়ের একক | সেকেন্ডের ভগ্নাংশ | বৈজ্ঞানিক রূপ | বাস্তব কম্পিউটিং প্রেক্ষাপট |
| :--- | :--- | :--- | :--- |
| **মিলি-সেকেন্ড (ms)** | ১ সেকেন্ডের ১ হাজার ভাগের ১ ভাগ | $১০^{-৩}$ সেকেন্ড | মেকানিক্যাল হার্ডডিস্কের হেড মুভমেন্ট (~৮ মিলি-সেকেন্ড) |
| **মাইক্রো-সেকেন্ড (µs)** | ১ সেকেন্ডের ১০ লক্ষ ভাগের ১ ভাগ | $১০^{-৬}$ সেকেন্ড | দ্রুতগতির NVMe এসএসডি থেকে ডাটা পড়া (~১০-৩০ মাইক্রো-সেকেন্ড) |
| **ন্যানো-সেকেন্ড (ns)** | ১ সেকেন্ডের ১০০ কোটি ভাগের ১ ভাগ | $১০^{-৯}$ সেকেন্ড | আধুনিক DDR5 র‍্যামের রেসপন্স (~১৫ ন্যানো-সেকেন্ড); ক্যাশ মেমোরি (~০.৮ ন্যানো-সেকেন্ড) |
| **পিকো-সেকেন্ড (ps)** | ১ সেকেন্ডের ১ লক্ষ কোটি ভাগের ১ ভাগ | $১০^{-১২}$ সেকেন্ড | আধুনিক প্রসেসরে ট্রানজিস্টরের অন-অফ সুইচিং সময় |`,
      },
      {
        heading: 'MIPS vs. FLOPS: Everyday Instructions vs. Scientific Muscle',
        headingBn: 'MIPS বনাম FLOPS: সাধারণ নির্দেশনা বনাম বৈজ্ঞানিক শক্তি',
        bodyEn: `How do computer scientists rank processor speed?
- **MIPS (Million Instructions Per Second):**
  - Measures general instruction rate (moving numbers, jumps, comparisons).
  - Modern CPUs do hundreds of **BIPS (Billion Instructions Per Second)**!
- **FLOPS (Floating-Point Operations Per Second):**
  - Measures pure mathematical muscle handling decimal numbers with exponents (e.g., \`3.14159 × 10^{-8}\`).
  - Essential for 3D physics engines (Ray Tracing in Unreal Engine 5), weather prediction simulations, rocket orbital trajectories, and training Generative AI neural networks!
  - **Scale:** MegaFLOPS ($10^6$) → GigaFLOPS ($10^9$) → TeraFLOPS ($10^{12}$) → PetaFLOPS ($10^{15}$) → ExaFLOPS ($10^{18}$)!`,
        bodyBn: `কম্পিউটার বিজ্ঞানীরা কীভাবে প্রসেসরের গতি মূল্যায়ন করেন?
- **MIPS (প্রতি সেকেন্ডে ১০ লক্ষ নির্দেশ):**
  - এটি সাধারণ প্রোগ্রাম নির্বাহের হার মাপে। আজকের প্রসেসরগুলো প্রতি সেকেন্ডে শত শত কোটি নির্দেশ বা **BIPS (Billion Instructions)** সম্পন্ন করে!
- **FLOPS (Floating-Point Operations Per Second):**
  - এটি জটিল দশমিক ও বৈজ্ঞানিক হিসাব করার ক্ষমতা নির্দেশ করে।
  - থ্রিডি গেমিং (রে-ট্রেসিং), আবহাওয়ার পূর্বাভাস, মহাকাশ গবেষণা এবং এআই (AI) মডেল প্রশিক্ষণে ফ্লপস (FLOPS) সবচেয়ে গুরুত্বপূর্ণ একক!
  - **স্কেল:** মেগাফ্লপস ($১০^৬$) → গিগাফলপস ($১০^৯$) → টেরাফলপস ($১০^{১২}$) → পেটাফলপস ($১০^{১৫}$) → এক্সাফ্লপস ($১০^{১৮}$)!`,
      },
      {
        heading: 'The 7 Golden Factors Governing Processing Speed',
        headingBn: 'সিপিইউ-র প্রসেসিং গতি নিয়ন্ত্রণকারী ৭টি মূল নিয়ামক',
        bodyEn: `Why is one computer faster than another? Here are the 7 factors from Professor Akkas Ali's lecture:
1. **Register Word Size:** A 64-bit register crunches twice as much data in one chunk as a 32-bit register.
2. **RAM Size:** More RAM avoids running out of memory and prevents slow disk paging.
3. **Cache Memory:** Having large L1/L2/L3 caches keeps hot instructions right next to the execution core.
4. **Clock Speed:** The master quartz crystal pulse (e.g., 4.5 GHz = 4.5 billion ticks every second).
5. **Data Bus Width:** Wider data buses (64 bits) transfer more bytes per clock tick.
6. **Address Bus Width:** Allows the CPU to directly address massive amounts of high-speed physical RAM.
7. **Coprocessor Presence:** Built-in floating-point coprocessors (FPUs) accelerate graphics and math equations.`,
        bodyBn: `একটি কম্পিউটার অন্যটির চেয়ে দ্রুত চলে কেন? প্রফেসর আক্কাস আলীর লেকচার অনুসারে ৭টি মূল নিয়ামক:
১. **রেজিস্টারের ওয়ার্ড সাইজ (Word Size):** ৩২-বিটের চেয়ে ৬৪-বিট রেজিস্টার একবারে দ্বিগুণ ডাটা প্রসেস করতে পারে।
২. **র‍্যামের আকার (RAM Size):** পর্যাপ্ত র‍্যাম থাকলে কম্পিউটার হ্যাং করে না এবং দ্রুত কাজ সম্পন্ন হয়।
৩. **ক্যাশ মেমোরি (Cache Memory):** সিপিইউ কোরের ঠিক কাছে দ্রুতগতির L1, L2, L3 ক্যাশ থাকলে কাজের গতি বহুগুণ বাড়ে।
৪. **ক্লক স্পিড (Clock Speed):** প্রসেসরের প্রধান টাইমিং পালস (যেমন: ৪.৫ GHz মানে প্রতি সেকেন্ডে ৪৫০ কোটি টিক)।
৫. **ডাটা বাসের প্রস্থ (Data Bus Width):** চওড়া ডাটা বাস প্রতি সাইকেলে বেশি বাইট ডাটা পরিবহন করতে পারে।
৬. **এড্রেস বাসের প্রস্থ (Address Bus Width):** বেশি এড্রেস বাস লাইন বিশাল আকারের র‍্যামকে সরাসরি হ্যান্ডেল করতে পারে।
৭. **কো-প্রসেসরের উপস্থিতি (Coprocessor):** বিল্ট-ইন ম্যাথ কো-প্রসেসর ও জিপিইউ গ্রাফিক্স ও জটিল হিসাবের গতি বাড়ায়।`,
      },
    ],
    interactiveType: 'lesson10-suite',
  },
];
