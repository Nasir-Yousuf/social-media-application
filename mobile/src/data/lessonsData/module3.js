// Module 3: Memory Fundamentals (Lecture File 03)
// Lessons 14 to 18: Capacity Units, Classifications, RAM/ROM Subtypes, Registers & Cache, and Read/Write Cycles.

export const MODULE_3_LESSONS = [
  // ========================================================
  // LESSON 14: Units of Digital Memory: From Bits to Exabytes
  // ========================================================
  {
    id: 'cb-measuring-digital-memory',
    track: 'computer-basics',
    order: 14,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '14. Units of Digital Memory: From Bits to Exabytes',
      bn: '১৪. ডিজিটাল মেমোরির একক: বিট থেকে এক্সাবাইট',
    },
    subtitle: {
      en: 'Bit, nibble, byte, powers of 2 (1024 multiplier), and mind-blowing real-world scales.',
      bn: 'বিট, নিবল, বাইট, ২-এর ঘাত (১০২৪ গুণক) এবং বাস্তব জীবনের বিস্ময়কর পরিমাপ।',
    },
    keyTakeaways: [
      '1 Bit is the smallest unit of digital memory (a single binary 0 or 1).',
      '1 Nibble = 4 bits (half a byte); 1 Byte = 8 bits (stores 1 typed English character like "A").',
      'In computers, memory multiplies by 1,024 (2¹⁰), NOT by 1,000! 1 KB = 1024 Bytes.',
      'The Memory Staircase: Byte → KB (1024 B) → MB (1024 KB) → GB (1024 MB) → TB (1024 GB) → PB (1024 TB) → EB (1024 PB).',
      '1 Petabyte (PB) can store 58 years of non-stop 4K video; 1 Exabyte (EB) holds roughly 50% of all words spoken by mankind!',
    ],
    keyTakeawaysBn: [
      '১ বিট (Bit) হলো ডিজিটাল মেমোরির ক্ষুদ্রতম একক (একটি বাইনারি ০ বা ১)।',
      '১ নিবল (Nibble) = ৪ বিট (অর্ধেক বাইট); ১ বাইট (Byte) = ৮ বিট (কীবোর্ডের ১টি অক্ষর যেমন "A")।',
      'কম্পিউটারে মেমোরির গুণক ১,০০০ নয়, বরং ১,০২৪ (২¹⁰)! অর্থাৎ ১ KB = ১০২৪ বাইট।',
      'মেমোরির সিঁড়ি: বাইট → KB (১০২৪ B) → MB (১০২৪ KB) → GB (১০২৪ MB) → TB (১০২৪ GB) → PB (১০২৪ TB) → EB (১০২৪ PB)।',
      '১ পেটাবাইট (PB) মেমোরিতে একটানা ৫৮ বছরের ৪কে ভিডিও রাখা যায়; ১ এক্সাবাইটে মানব ইতিহাসের প্রায় অর্ধেক কথ্য শব্দ জমা করা সম্ভব!',
    ],
    contentSections: [
      {
        heading: 'The Secret of 1024: Why Isn\'t 1 KB Equal to 1000 Bytes?',
        headingBn: '১০২৪-এর গোপন রহস্য: ১ কিলোবাইট কেন ১০০০ বাইট নয়?',
        bodyEn: `In ordinary human math, the prefix "kilo" means 1,000 (like 1 kilometer = 1,000 meters).
**Why do computers use 1,024 instead of 1,000?**
- Computers cannot think in base-10 decimals because transistors only have two states: **0 (Off)** and **1 (On)**.
- Therefore, all computer memory works in **powers of 2**:
  - $2^1 = 2$, $2^2 = 4$, $2^3 = 8$, $2^4 = 16$, $2^5 = 32$, $2^6 = 64$, $2^7 = 128$, $2^8 = 256$, $2^9 = 512$, $2^{10} = 1024$!
- $1,024$ is the closest power of 2 to human $1,000$. Computer scientists decided that **1 Kilobyte (KB) = $2^{10} = 1,024\text{ Bytes}$**!`,
        bodyBn: `সাধারণ মানুষের গণিতে "কিলো" মানে ১,০০০ (যেমন ১ কিলোমিটার = ১,০০০ মিটার)।
**কিন্তু কম্পিউটারে ১ কিলোবাইট কেন ১০০০ বাইট নয়, বরং ১০২৪ বাইট?**
- কম্পিউটার মানুষের মতো দশমিক পদ্ধতিতে চিন্তা করে না; কম্পিউটারের ট্রানজিস্টরে কেবল দুটি অবস্থা থাকে: **০ (বন্ধ)** এবং **১ (চালু)**।
- ফলে মেমোরির সমস্ত হিসাব চলে **২-এর ঘাত বা পাওয়ার (Powers of 2)** অনুযায়ী:
  - ২¹ = ২, ২² = ৪, ২³ = ৮, ..., ২⁸ = ২৫৬, ২⁹ = ৫১২, ২¹⁰ = ১০২৪!
- মানুষের ১০০০-এর সবচেয়ে কাছাকাছি ২-এর ঘাত হলো ১০২৪। তাই কম্পিউটার বিজ্ঞানীরা নির্ধারণ করেন: **১ কিলোবাইট (KB) = ২¹⁰ = ১,০২৪ বাইট**!`,
      },
      {
        heading: 'The Complete Memory Hierarchy Ladder Table',
        headingBn: 'মেমোরির পূর্ণাঙ্গ পরিমাপ ছক ও বাস্তব তুলনা',
        bodyEn: `Here is the official capacity chart from Professor Akkas Ali's course:

| Unit Name | Exact Multiplier | Mathematical Power | Real-World Content Analogy |
| :--- | :--- | :--- | :--- |
| **Bit (b)** | 0 or 1 | Base unit | A single microscopic electrical switch |
| **Nibble** | 4 Bits | Half byte | Single hexadecimal digit (0 to F) |
| **Byte (B)** | 8 Bits | 1 Byte | A single typed character: \`"Z"\` |
| **Kilobyte (KB)** | 1,024 Bytes | $2^{10}$ Bytes | A 1-page typed plain text essay |
| **Megabyte (MB)** | 1,024 KB | $2^{20}$ Bytes | A 3-minute MP3 song or crisp smartphone photo |
| **Gigabyte (GB)** | 1,024 MB | $2^{30}$ Bytes | An entire movie or 250 Spotify music tracks |
| **Terabyte (TB)** | 1,024 GB | $2^{40}$ Bytes | An entire university library of books |
| **Petabyte (PB)** | 1,024 TB | $2^{50}$ Bytes | 500 million floppy disks or 58 years of HD video |
| **Exabyte (EB)** | 1,024 PB | $2^{60}$ Bytes | 50% of all words ever spoken by all humans! |`,
        bodyBn: `প্রফেসর আক্কাস আলীর লেকচারের মূল পরিমাপ ছক:

| এককের নাম | সঠিক গুণক | গাণিতিক পাওয়ার | বাস্তব জীবনের উপমা |
| :--- | :--- | :--- | :--- |
| **বিট (Bit)** | ০ অথবা ১ | মৌলিক ভিত্তি | একটি একক ক্ষুদ্রাতিক্ষুদ্র সুইচ |
| **নিবল (Nibble)** | ৪ বিট | ১/২ বাইট | হেক্সাডেসিমেলের একটি অক্ষর |
| **বাইট (Byte)** | ৮ বিট | ১ বাইট | কীবোর্ডের একটি একক অক্ষর: \`"Z"\` |
| **কিলোবাইট (KB)** | ১,০২৪ বাইট | ২¹⁰ বাইট | টাইপ করা ১ পৃষ্ঠার সাধারণ প্রবন্ধ |
| **মেগাবাইট (MB)** | ১,০২৪ KB | ২²⁰ বাইট | একটি ৩ মিনিটের গান বা চমৎকার সেলফি ছবি |
| **গিগাবাইট (GB)** | ১,০২৪ MB | ২³⁰ বাইট | একটি পূর্ণাঙ্গ সিনেমা বা বইয়ে ঠাসা একটি পিকআপ ভ্যান |
| **টেরাবাইট (TB)** | ১,০২৪ GB | ২⁴⁰ বাইট | একটি সম্পূর্ণ বিশ্ববিদ্যালয়ের লাইব্রেরির সব বই |
| **পেটাবাইট (PB)** | ১,০২৪ TB | ২⁵⁰ বাইট | ৫০ কোটি ফ্লপি ডিস্ক বা ৫৮ বছরের বিরতিহীন এইচডি ভিডিও |
| **এক্সাবাইট (EB)** | ১,০২৪ PB | ২⁶⁰ বাইট | মানব ইতিহাসের সব মানুষের বলা মোট কথার অর্ধেকাংশ! |`,
      },
    ],
    interactiveType: 'lesson14-suite',
  },

  // ========================================================
  // LESSON 15: Memory Classifications: Primary, Secondary, Magnetic & Optical
  // ========================================================
  {
    id: 'cb-memory-classifications',
    track: 'computer-basics',
    order: 15,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '15. Memory Classifications: Primary, Secondary, Magnetic & Optical',
      bn: '১৫. মেমোরির শ্রেণিবিভাগ: প্রাইমারি, সেকেন্ডারি, ম্যাগনেটিক ও অপটিক্যাল',
    },
    subtitle: {
      en: '5 classification dimensions: CPU connection, volatility, access methods, and storage media physics.',
      bn: '৫টি শ্রেণিবিন্যাস মাত্রা: সিপিইউ সংযোগ, স্থায়িত্ব, এক্সেস পদ্ধতি এবং স্টোরেজ মিডিয়ার পদার্থবিজ্ঞান।',
    },
    keyTakeaways: [
      'Primary Memory connects directly to CPU buses; Secondary Storage connects indirectly via controllers and cables.',
      'Volatile Memory loses contents when power drops; Non-Volatile Memory retains files indefinitely.',
      'Random Access (RAM/ROM) has constant O(1) access time anywhere; Sequential Access (SAM/Tape) must rewind/fast-forward.',
      'Semiconductor Storage stores electric charge in silicon transistors/capacitors (RAM, ROM, Flash).',
      'Magnetic Storage arranges microscopic iron oxide magnetic dipoles on spinning platters (Hard Disks, Magnetic Tape).',
      'Optical Storage uses laser beams reflecting off microscopic pits and lands pressed into polycarbonate plastic (CD, DVD, Blu-ray).',
    ],
    keyTakeawaysBn: [
      'প্রাইমারি মেমোরি সিপিইউ বাসের সাথে সরাসরি যুক্ত থাকে; সেকেন্ডারি স্টোরেজ কন্ট্রোলার ও তারের মাধ্যমে পরোক্ষভাবে যুক্ত থাকে।',
      'ভলাটাইল মেমোরি বিদ্যুৎ চলে গেলে ফাঁকা হয়ে যায়; নন-ভলাটাইল মেমোরি বিদ্যুৎ ছাড়াই আজীবন ফাইল ধরে রাখে।',
      'র‍্যান্ডম এক্সেস (RAM/ROM) মেমোরির যেকোনো ঠিকানায় সমান দ্রুতগতিতে পৌঁছায়; সিকোয়েন্সিয়াল এক্সেস (টেপ) আগের সব গান পার হয়ে যেতে হয়।',
      'সেমিকন্ডাক্টর মেমোরি সিলিকন ট্রানজিস্টরে চার্জ জমা রাখে (RAM, ROM, SSD)।',
      'ম্যাগনেটিক মেমোরি চুম্বকীয় দিকবিন্যাসের মাধ্যমে তথ্য ধারণ করে (হার্ডডিস্ক, ম্যাগনেটিক টেপ)।',
      'অপটিক্যাল মেমোরিতে লেজার রশ্মি প্লাস্টিক ডিস্কের পিট ও ল্যান্ড থেকে প্রতিফলিত হয়ে বাইনারি কোড পড়ে (CD, DVD)।',
    ],
    contentSections: [
      {
        heading: 'The 5 Fundamental Classifications of Memory',
        headingBn: 'মেমোরি শ্রেণিবিভাগের ৫টি মূল মানদণ্ড',
        bodyEn: `Computer engineers classify memory across 5 major dimensions:

1. **Connection to CPU:**
   - **Primary Memory:** Directly wired to the CPU memory bus (RAM, ROM, Cache, Registers). Blazing fast.
   - **Secondary Memory:** Connected through I/O controllers and SATA/NVMe cables (SSD, Hard Disk, Pen Drive).
2. **Volatility:**
   - **Volatile:** Needs electricity to maintain data (RAM).
   - **Non-Volatile:** Safe without electricity (ROM, SSD, Hard Drive, Flash memory).
3. **Access Method:**
   - **Random Access (RAM, ROM):** Access time is constant regardless of where the data is stored in memory.
   - **Sequential Access (SAM - Magnetic Tape):** Like an old cassette tape; to listen to song #5, you must fast-forward through songs #1 to #4!
4. **Physical Media:** Semiconductor (Silicon charge) vs. Magnetic (Iron oxide dipoles) vs. Optical (Laser reflection).
5. **Cost & Capacity:** High speed / high cost per bit (RAM) vs. Low speed / low cost per bit (Terabyte Hard Disks).`,
        bodyBn: `কম্পিউটার বিজ্ঞানীরা ৫টি প্রধান মানদণ্ডে মেমোরির শ্রেণিবিভাগ করেন:

১. **সিপিইউ-র সাথে সংযোগ:**
   - **প্রাইমারি মেমোরি:** সরাসরি সিপিইউ বাসের সাথে যুক্ত থাকে (RAM, ROM, Cache, Registers)। সুপারফাস্ট।
   - **সেকেন্ডারি মেমোরি:** কন্ট্রোলার ও ক্যাবলের মাধ্যমে পরোক্ষভাবে যুক্ত থাকে (হার্ডডিস্ক, এসএসডি, পেনড্রাইভ)।
২. **স্থায়িত্ব বা ভলাটিলিটি:**
   - **ভলাটাইল (অস্থায়ী):** বিদ্যুৎ চলে গেলেই তথ্য মুছে যায় (র‍্যাম)।
   - **নন-ভলাটাইল (স্থায়ী):** বিদ্যুৎ বন্ধ থাকলেও আজীবন ফাইল নিরাপদ থাকে (রম, এসএসডি, হার্ডডিস্ক)।
৩. **এক্সেস করার পদ্ধতি:**
   - **র‍্যান্ডম এক্সেস (Random Access):** মেমোরির যেকোনো কোণায় সমান দ্রুত সময়ে পৌঁছানো যায়।
   - **সিকোয়েন্সিয়াল এক্সেস (Sequential Access):** পুরনো অডিও ক্যাসেটের মতো; ৫ নম্বর গান শুনতে হলে আগের ৪টি গান ফাস্ট-ফরোয়ার্ড করে পার হতে হয়!
৪. **ভৌত উপাদান:** সেমিকন্ডাক্টর (সিলিকন চিপ) বনাম ম্যাগনেটিক (চুম্বকীয় প্রলেপ) বনাম অপটিক্যাল (লেজার রশ্মি)।
৫. **খরচ ও ধারণক্ষমতা:** উচ্চগতি ও বেশি খরচ (র‍্যাম) বনাম ধীরগতি ও সুলভ মূল্যে বিশাল স্টোরেজ (হার্ডডিস্ক)।`,
      },
      {
        heading: 'Primary vs. Secondary Memory: The Head-to-Head Exam Table',
        headingBn: 'প্রাইমারি বনাম সেকেন্ডারি মেমোরি: পরীক্ষার তুলনামূলক ছক',
        bodyEn: `Here is the core summary table from the lecture slides:

| Feature | Primary Memory | Secondary Memory |
| :--- | :--- | :--- |
| **CPU Connection** | Directly connected via CPU bus | Indirectly connected via controllers/cables |
| **Volatility** | Mostly volatile (RAM); exception: ROM | Strictly non-volatile (permanent vault) |
| **Role & Purpose** | Holds currently running programs & active data | Stores inactive apps, user files, and OS installer |
| **Access Speed** | Extremely fast (5 to 20 nanoseconds) | Slower (micro-seconds to milliseconds) |
| **Cost per Bit** | High cost per gigabyte | Very low cost per gigabyte |
| **Capacity** | Limited (8 GB to 64 GB typical) | Massive (512 GB to 16+ Terabytes) |
| **Examples** | RAM, CPU Cache, Registers, BIOS ROM | SSD, Hard Disk Drive, USB Flash Drive, CD/DVD |`,
        bodyBn: `লেকচার স্লাইডের মূল তুলনামূলক ছক:

| বৈশিষ্ট্য | প্রাইমারি মেমোরি (Primary) | সেকেন্ডারি মেমোরি (Secondary) |
| :--- | :--- | :--- |
| **সিপিইউ সংযোগ** | বাসের মাধ্যমে সিপিইউ-র সাথে সরাসরি যুক্ত | কন্ট্রোলারের মাধ্যমে পরোক্ষভাবে যুক্ত |
| **স্থায়িত্ব** | বেশিরভাগই অস্থায়ী (র‍্যাম); ব্যতিক্রম: রম | সম্পূর্ণরূপে স্থায়ী (নন-ভলাটাইল) |
| **কাজের উদ্দেশ্য** | চলমান প্রোগ্রাম ও সাময়িক হিসাব ধরে রাখা | সংরক্ষিত ফাইল, সিনেমা ও ওএস আজীবন রাখা |
| **কাজের গতি** | অবিশ্বাস্য দ্রুতগতি (৫ থেকে ২০ ন্যানো-সেকেন্ড) | তুলনামূলক ধীরগতি (মাইক্রো থেকে মিলি-সেকেন্ড) |
| **প্রতি বিটে খরচ** | বেশি খরচ per গিগাবাইট | অত্যন্ত সুলভ খরচ per গিগাবাইট |
| **ধারণক্ষমতা** | সীমিত (সাধারণত ৮ জিবি থেকে ৬৪ জিবি) | সুবিশাল (৫১২ জিবি থেকে ১৬+ টেরাবাইট) |
| **বাস্তব উদাহরণ** | RAM, Cache, Registers, BIOS ROM | SSD, Hard Disk, Pen Drive, CD/DVD |`,
      },
    ],
    interactiveType: 'lesson5-suite',
  },

  // ========================================================
  // LESSON 16: RAM vs. ROM Deep Dive: SRAM, DRAM, PROM, EPROM & EEPROM / Flash
  // ========================================================
  {
    id: 'cb-ram-vs-rom-subtypes',
    track: 'computer-basics',
    order: 16,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '16. RAM vs. ROM Deep Dive: SRAM, DRAM, PROM, EPROM & EEPROM / Flash',
      bn: '১৬. র‍্যাম বনাম রম বিস্তারিত: SRAM, DRAM, PROM, EPROM ও EEPROM / ফ্ল্যাশ',
    },
    subtitle: {
      en: 'The leaky bucket (DRAM) vs flip-flop (SRAM), and the evolution of ROM from UV light to Flash.',
      bn: 'ছিদ্রযুক্ত বালতি (DRAM) বনাম ফ্লিপ-ফ্লপ (SRAM), এবং আল্ট্রাভায়োলেট আলো থেকে আধুনিক ফ্ল্যাশ রম।',
    },
    keyTakeaways: [
      'SRAM (Static RAM): Built from 6-transistor flip-flops; needs NO electrical refreshing; superfast; used in CPU Cache.',
      'DRAM (Dynamic RAM): Built from 1 transistor + 1 tiny capacitor; leaks electrical charge; must be refreshed thousands of times per second; used for Main RAM.',
      'MROM (Mask ROM): Permanently hardwired at factory during fabrication; impossible to alter.',
      'PROM (Programmable ROM): Shipped blank with tiny microscopic fuses; programmed once by user using a PROM burner.',
      'EPROM (Erasable PROM): Features a transparent quartz window; erased by shining Ultraviolet (UV) light for 20 minutes.',
      'EEPROM: Electrically erased block-by-block in milliseconds without UV light; the foundation of USB Flash Drives and SSDs!',
    ],
    keyTakeawaysBn: [
      'এস-র‍্যাম (SRAM): ৬টি ট্রানজিস্টরের ফ্লিপ-ফ্লপ দিয়ে তৈরি; কোনো রিফ্রেশিং লাগে না; অতি দ্রুত; সিপিইউ ক্যাশে ব্যবহৃত হয়।',
      'ডি-র‍্যাম (DRAM): ১টি ট্রানজিস্টর ও ১টি ক্যাপাসিটর দিয়ে তৈরি; চার্জ লিক করে; প্রতি সেকেন্ডে হাজার বার রিফ্রেশ করতে হয়; প্রধান র‍্যামে ব্যবহৃত।',
      'এম-রম (Mask ROM): ফ্যাক্টরিতে চিপ তৈরির সময়ই স্থায়ীভাবে কোড লিখে সিল করে দেওয়া হয়।',
      'পি-রম (PROM): খালি চিপ; পি-রম বার্নার মেশিনের মাধ্যমে ফিউজ পুড়িয়ে মাত্র একবার কোড লেখা যায়।',
      'ই-পি-রম (EPROM): চিপের ওপর কোয়ার্টজ কাঁচের জানালা থাকে; ২০ মিনিট আল্ট্রাভায়োলেট (UV) আলো ফেলে ডাটা মুছে ফেলা যায়।',
      'ইই-পি-রম (EEPROM): ইউভি আলো ছাড়াই বৈদ্যুতিকভাবে মিলি-সেকেন্ডে মুছে ফেলা যায়; যা আজকের পেনড্রাইভ ও এসএসডি-র ভিত্তি!',
    ],
    contentSections: [
      {
        heading: 'SRAM vs. DRAM: The Flip-Flop vs. The Leaky Bucket',
        headingBn: 'SRAM বনাম DRAM: ফ্লিপ-ফ্লপ বনাম ছিদ্রযুক্ত বালতি',
        bodyEn: `Why does your PC have both SRAM and DRAM?

1. **DRAM (Dynamic RAM - The Leaky Bucket):**
   - Each memory cell is just **1 single transistor and 1 microscopic capacitor**.
   - Because capacitors leak electrical charge naturally, the data starts fading away within milliseconds!
   - The memory controller must constantly recharge (**refresh**) every single cell thousands of times every second.
   - **Why we love it:** Because each cell needs only 1 transistor, you can pack **16 Billion bits** onto a tiny stick of RAM for very cheap!

2. **SRAM (Static RAM - The Sturdy Light Switch):**
   - Each memory cell is made of a **4 to 6-transistor flip-flop circuit**.
   - As long as power is on, it holds its 0 or 1 rock-solid **without any refreshing needed**!
   - It is 5 to 10 times faster than DRAM.
   - **Why don't we use it for all RAM?** 6 transistors take up huge silicon space and generate massive heat. It is expensive, so we only use small amounts (16 MB - 64 MB) for **CPU Cache Memory**!`,
        bodyBn: `কম্পিউটারে কেন দুই ধরনের র‍্যাম থাকে?

১. **ডি-র‍্যাম (DRAM - ছিদ্রযুক্ত পানির বালতি):**
   - প্রতিটি সেলে থাকে মাত্র **১টি ট্রানজিস্টর ও ১টি ক্যাপাসিটর**।
   - ক্যাপাসিটর থেকে বিদ্যুৎ চুইয়ে পড়ে, ফলে মিলি-সেকেন্ডের মধ্যে চার্জ শেষ হয়ে ডাটা মুছে যেতে চায়!
   - তাই মেমোরি কন্ট্রোলারকে প্রতি সেকেন্ডে হাজার হাজার বার বিদ্যুৎ পাঠিয়ে রিফ্রেশ (**Refresh**) করতে হয়।
   - **কেন ব্যবহার করি:** মাত্র ১টি ট্রানজিস্টর লাগায় অল্প জায়গায় ১৬০০ কোটি বিট বসানো যায় এবং দাম অনেক কম!

২. **এস-র‍্যাম (SRAM - মজবুত বৈদ্যুতিক সুইচ):**
   - প্রতিটি সেল তৈরি হয় **৪ থেকে ৬টি ট্রানজিস্টরের ফ্লিপ-ফ্লপ সার্কিট** দিয়ে।
   - বিদ্যুৎ থাকা পর্যন্ত এটি শক্তভাবে ডাটা ধরে রাখে; **কোনো রিফ্রেশ লাগে না**!
   - এটি ডি-র‍্যামের চেয়ে ৫ থেকে ১০ গুণ বেশি দ্রুতগতির।
   - **সবখানে কেন ব্যবহার করি না:** ৬টি ট্রানজিস্টর বেশি জায়গা নেয় এবং প্রচুর তাপ তৈরি করে। উৎপাদন খরচ অনেক বেশি হওয়ায় এটি শুধু প্রসেসরের **ক্যাশ মেমোরি (Cache)** হিসেবে অল্প পরিমাণে ব্যবহৃত হয়!`,
      },
      {
        heading: 'The 5 Generations of ROM: From Mask ROM to Flash',
        headingBn: 'রমের ৫টি ঐতিহাসিক প্রজন্ম: মাস্ক রম থেকে আধুনিক ফ্ল্যাশ',
        bodyEn: `ROM stands for **Read-Only Memory**. How did it evolve over computer history?

1. **MROM (Mask ROM):** The oldest type. Hardwired permanently with photo-masks at the factory during chip fabrication. If there was a software bug, the entire chip had to be thrown into the trash!
2. **PROM (Programmable ROM):** Purchased completely blank. The engineer used a special machine called a **PROM Burner** to send high electrical current to blow tiny microscopic fuses inside the chip, locking in the code forever (write-once only).
3. **EPROM (Erasable Programmable ROM):** A breakthrough! Features a transparent **quartz glass window** on top of the ceramic chip. To erase it, engineers placed it under an intense Ultraviolet (UV) light box for 20 to 30 minutes, which wiped out all stored charges so it could be reprogrammed!
4. **EEPROM (Electrically Erasable PROM):** Eliminated the clumsy UV box! Can be erased and rewritten electrically byte-by-byte in milliseconds while remaining soldered onto the motherboard.
5. **Flash Memory:** The modern king! An advanced derivative of EEPROM that erases and writes data in large high-speed blocks. Powers your USB pen drives, phone storage, and blazing-fast NVMe SSDs!`,
        bodyBn: `রম (ROM) মানে **Read-Only Memory**। এর বিবর্তনের ৫টি ধাপ:

১. **এম-রম (Mask ROM):** সবচেয়ে পুরনো রম। চিপ তৈরির সময় কারখানাতেই স্থায়ীভাবে লিখে দেওয়া হতো। কোনো ভুল কোড থাকলে পুরো চিপ ড্রেনে ফেলতে হতো!
২. **পি-রম (PROM):** সম্পূর্ণ খালি চিপ কেনা হতো। প্রকৌশলীরা **পি-রম বার্নার** দিয়ে উচ্চ ভোল্টেজ পাঠিয়ে ভেতরের ফিউজ পুড়িয়ে কোড লিখতেন। এটি মাত্র একবারই লেখা যেত।
৩. **ই-পি-রম (EPROM - যুগান্তকারী চিপ):** চিপের মাথার ওপর ছোট **স্বচ্ছ কোয়ার্টজ কাঁচের জানালা** থাকত! লেখা মুছতে হলে চিপটি খুলে ২০-৩০ মিনিট অতিবেগুনি (UV) আলোর নিচে রাখতে হতো। আলো পড়লেই সব ডাটা মুছে আবার নতুন করে লেখা যেত!
৪. **ইই-পি-রম (EEPROM):** ইউভি আলোর ঝামেলা চিরতরে শেষ! মাদারবোর্ডে লাগানো অবস্থাতেই কম্পিউটার থেকে বৈদ্যুতিক সংকেত পাঠিয়ে মিলি-সেকেন্ডে এর কোড মুছে নতুন করে লেখা যায়।
৫. **ফ্ল্যাশ মেমোরি (Flash Memory):** আধুনিক যুগের রাজা! এটি ইই-পি-রমের উন্নত রূপ যা ব্লকে ব্লকে চোখের পলকে ডাটা লিখতে ও মুছতে পারে। আজকের সমস্ত পেনড্রাইভ, মেমোরি কার্ড ও এসএসডি এই প্রযুক্তিতে চলে!`,
      },
    ],
    interactiveType: 'lesson5-suite',
  },

  // ========================================================
  // LESSON 17: CPU Internal Registers & Cache Memory: The Speed Demons
  // ========================================================
  {
    id: 'cb-registers-and-cache-demons',
    track: 'computer-basics',
    order: 17,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '17. CPU Internal Registers & Cache Memory: The Speed Demons',
      bn: '১৭. সিপিইউ রেজিস্টার ও ক্যাশ মেমোরি: অতি দ্রুতগতির জাদুকর',
    },
    subtitle: {
      en: 'MAR, MBR, PC, Accumulator, and the multi-level L1, L2, L3 cache hierarchy bridging the speed gap.',
      bn: 'মার, এমবিআর, পিসি, একুমুলেটর এবং গতি ব্যবধান দূরকারী L1, L2, L3 ক্যাশ মেমোরি।',
    },
    keyTakeaways: [
      'MAR (Memory Address Register) holds the target memory location being read or written.',
      'MBR (Memory Buffer Register) holds the data byte transferred to or from main memory.',
      'PC (Program Counter) holds the memory address of the NEXT instruction waiting to be executed.',
      'AC (Accumulator) holds intermediate mathematical and logical calculation results directly from the ALU.',
      'IR (Instruction Register) holds the current active instruction while the Control Unit decodes it.',
      'Cache Memory bridges the severe speed bottleneck between the 4 GHz CPU core and 20 ns RAM.',
    ],
    keyTakeawaysBn: [
      'মার (MAR): মেমোরির কোন ঘর থেকে ডাটা আনা বা নেওয়া হবে সেই নির্দিষ্ট ঠিকানাটি ধরে রাখে।',
      'এমবিআর (MBR): মেমোরিতে পাঠানো বা মেমোরি থেকে আসা প্রকৃত ডাটা বা ফলাফল সাময়িকভাবে ধরে রাখে।',
      'পিসি (PC / Program Counter): পরবর্তীতে কোন নির্দেশটি চালু হবে তার মেমোরি ঠিকানা মনে রাখে।',
      'একুমুলেটর (AC / Accumulator): এএলইউ-র হিসাব করা তাৎক্ষণিক গাণিতিক ফলাফল জমা রাখে।',
      'আইআর (IR / Instruction Register): বর্তমানে চলমান নির্দেশটি ডিকোড করার সময় ধারণ করে।',
      'ক্যাশ মেমোরি (Cache): ৪ গিগাহার্টজ প্রসেসর এবং তুলনামূলক ধীরগতির র‍্যামের মধ্যকার গতির ব্যবধান দূর করে।',
    ],
    contentSections: [
      {
        heading: 'Meet the 5 Famous CPU Registers',
        headingBn: 'সিপিইউ-র বিখ্যাত ৫টি অভ্যন্তরীণ রেজিস্টার',
        bodyEn: `Inside the CPU execution core, there are tiny high-speed scratchpads called **Registers**:

| Register Name | Abbreviation | Core Function |
| :--- | :--- | :--- |
| **Program Counter** | **PC** | Points to the memory address of the **very next instruction** in line to be executed. |
| **Memory Address Register** | **MAR** | Holds the memory address that the CPU is currently reading from or writing to via the Address Bus. |
| **Memory Buffer Register** | **MBR / MDR** | Acts as the gateway buffer holding the actual data byte traveling on the Data Bus into or out of RAM. |
| **Accumulator** | **AC** | The ALU's personal scratchpad. When adding \`10 + 20\`, the partial sum sits in the Accumulator. |
| **Instruction Register** | **IR** | Holds the machine code instruction while the Control Unit breaks it down and decodes what to do. |`,
        bodyBn: `সিপিইউ-র একেবারে ভেতরে অতি দ্রুতগতির যে মেমোরি স্লটগুলো থাকে তাদের বলে **রেজিস্টার (Registers)**:

| রেজিস্টারের নাম | সংক্ষিপ্ত রূপ | প্রধান দায়িত্ব ও কাজ |
| :--- | :--- | :--- |
| **প্রোগ্রাম কাউন্টার** | **PC** | পরবর্তীতে মেমোরির কোন নির্দেশটি চালু হবে তার ঠিকানাকে নির্দেশ করে। |
| **মেমোরি এড্রেস রেজিস্টার** | **MAR** | বর্তমানে মেমোরির কোন ঘরটিতে কাজ হচ্ছে সেই ঠিকানাটি ধরে রাখে। |
| **মেমোরি বাফার রেজিস্টার** | **MBR / MDR** | ডাটা বাস দিয়ে মেমোরি থেকে আসা বা মেমোরিতে যাওয়ার ডাটা সাময়িকভাবে ধরে রাখে। |
| **একুমুলেটর** | **AC** | এএলইউ-র নিজস্ব খাতা। যেমন \`১০ + ২০\` যোগ করার পর সাময়িক ফলাফলটি একুমুলেটরে জমা থাকে। |
| **ইনস্ট্রাকশন রেজিস্টার** | **IR** | বর্তমানে প্রসেসর যে নির্দেশটি নিয়ে কাজ করছে তা ডিকোড করার সময় ধরে রাখে। |`,
      },
      {
        heading: 'Why Cache Memory is Essential: The Speed Mismatch Story',
        headingBn: 'ক্যাশ মেমোরি কেন এতো জরুরি: গতির অমিলের গল্প',
        bodyEn: `Why can't the CPU just read from RAM directly?
- **The Speed Mismatch:** A modern CPU runs at **4.0 GHz** (does a cycle every **0.25 nanoseconds**).
- But standard RAM takes about **15 to 20 nanoseconds** to find and return a byte.
- That means without Cache, the CPU would sit completely idle for **80 clock cycles** on every single memory request, tapping its foot in frustration!
- **Enter Cache Memory:**
  - Ultra-fast SRAM sitting right next to (or inside) the CPU core.
  - Predicts and keeps copies of the instructions and data the CPU will need next.
  - **L1 Cache:** Inside each core. Smallest (32-64 KB), blazing fast (~0.8 ns).
  - **L2 Cache:** Dedicated per core (512 KB - 1 MB), speed ~3 ns.
  - **L3 Cache:** Shared across all cores on the chip (16 MB - 64+ MB), speed ~10 ns.
  - When data is found in Cache (**Cache Hit**), the CPU zooms at 100% speed!`,
        bodyBn: `সিপিইউ কেন সরাসরি র‍্যাম থেকেই সব কাজ করে না?
- **গতির বিশাল ব্যবধান:** একটি আধুনিক প্রসেসর প্রতি সেকেন্ডে ৪০০ কোটি সাইকেল সম্পন্ন করে (প্রতি সাইকেলে মাত্র **০.২৫ ন্যানো-সেকেন্ড** সময় লাগে)।
- কিন্তু সাধারণ র‍্যাম থেকে একটি ডাটা খুঁজে আনতে সময় লাগে **১৫ থেকে ২০ ন্যানো-সেকেন্ড**।
- এর মানে ক্যাশ মেমোরি না থাকলে প্রসেসরকে প্রতিটি তথ্যের জন্য **৮০ সাইকেল অলস বসে অপেক্ষা করতে হতো**!
- **ত্রাতা হিসেবে ক্যাশ মেমোরি (Cache):**
  - অতি দ্রুতগতির এস-র‍্যাম যা সিপিইউ কোরের ভেতরেই বসানো থাকে।
  - প্রসেসর ভবিষ্যতে কী ডাটা চাইতে পারে তা আগেই র‍্যাম থেকে এনে নিজের কাছে জমা রাখে।
  - **L1 ক্যাশ:** প্রতিটি কোরের ভেতরে থাকে। সবচেয়ে দ্রুত (~০.৮ ন্যানো-সেকেন্ড)।
  - **L2 ক্যাশ:** কোরের ঠিক পাশে থাকে (~৩ ন্যানো-সেকেন্ড)।
  - **L3 ক্যাশ:** প্রসেসরের সব কোর মিলে শেয়ার করে (~১০ ন্যানো-সেকেন্ড)।
  - প্রসেসর যখন ক্যাশের মধ্যেই প্রয়োজনীয় তথ্য পেয়ে যায় (**Cache Hit**), তখন এক মুহূর্তও দেরি না করে রকেটের গতিতে কাজ চলতে থাকে!`,
      },
    ],
    interactiveType: 'lesson5-suite',
  },

  // ========================================================
  // LESSON 18: The CPU Read & Write Cycle: A Data Packet's Step-by-Step Journey
  // ========================================================
  {
    id: 'cb-cpu-read-write-cycle',
    track: 'computer-basics',
    order: 18,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '18. The CPU Read & Write Cycle: A Data Packet\'s Step-by-Step Journey',
      bn: '১৮. সিপিইউ রিড ও রাইট সাইকেল: ডাটা প্যাকেটের পূর্ণাঙ্গ যাত্রা',
    },
    subtitle: {
      en: 'The microsecond bus dance: how numbers are fetched from RAM and committed back to memory cells.',
      bn: 'মাইক্রোসেকেন্ডের বাস নৃত্য: কীভাবে র‍্যাম থেকে ডাটা পড়া হয় এবং নতুন ফলাফল মেমোরিতে লেখা হয়।',
    },
    keyTakeaways: [
      'A Read Operation fetches data from a RAM address into a CPU internal register.',
      'A Write Operation latches a calculated result from a CPU register into a destination RAM cell.',
      'Read Step 1: CPU places target address on Address Bus; Step 2: Activates READ on Control Bus.',
      'Read Step 3: RAM address decoder activates target cell; Step 4: Places byte onto Data Bus.',
      'Write Step 1: Target address onto Address Bus; Step 2: Result byte onto Data Bus.',
      'Write Step 3: CPU activates WRITE pulse on Control Bus; Step 4: Memory decodes and latches byte.',
    ],
    keyTakeawaysBn: [
      'রিড অপারেশন (Read): র‍্যামের নির্দিষ্ট ঠিকানা থেকে ডাটা এনে সিপিইউ-র রেজিস্টারে লোড করা।',
      'রাইট অপারেশন (Write): সিপিইউ-র তৈরি ফলাফল বা সংখ্যা র‍্যামের নির্দিষ্ট ঠিকানায় স্থায়ীভাবে সংরক্ষণ করা।',
      'রিড ধাপ ১: সিপিইউ এড্রেস বাসে ঠিকানা দেয়; ধাপ ২: কন্ট্রোল বাসে READ সিগন্যাল পাঠায়।',
      'রিড ধাপ ৩: র‍্যামের ডিকোডার নির্দিষ্ট সেল খুঁজে বের করে; ধাপ ৪: ডাটা বাসে তথ্য ছেড়ে দেয়।',
      'রাইট ধাপ ১: এড্রেস বাসে ঠিকানা দেওয়া হয়; ধাপ ২: ডাটা বাসে নতুন ডাটা তুলে দেওয়া হয়।',
      'রাইট ধাপ ৩: কন্ট্রোল বাসে WRITE পালস পাঠায়; ধাপ ৪: র‍্যাম মেমোরি কোষে নতুন ডাটা লিখে নেয়।',
    ],
    contentSections: [
      {
        heading: 'The 5-Step Memory READ Operation',
        headingBn: 'মেমোরি থেকে ডাটা পড়ার ৫টি সুনির্দিষ্ট ধাপ (READ Cycle)',
        bodyEn: `When your software asks to read a variable (like \`score = 90\`) from RAM, here is the exact movie inside:

- **Step 1:** The CPU places the memory address (e.g., \`0x2040\`) into the **MAR (Memory Address Register)**.
- **Step 2:** The address bits travel down the **Address Bus** straight to the RAM chip.
- **Step 3:** The **Control Unit** activates the **READ** signal line on the Control Bus.
- **Step 4:** The RAM internal address decoder energizes the specific row and column holding cell \`0x2040\`.
- **Step 5:** The stored byte (\`90\`) is released onto the bidirectional **Data Bus**, travels into the CPU, and is captured safely by the **MBR (Memory Buffer Register)**!`,
        bodyBn: `সফটওয়্যার যখন মেমোরি থেকে কোনো মান (যেমন \`score = 90\`) পড়তে চায়, তখন যেভাবে কাজটি সম্পন্ন হয়:

- **ধাপ ১:** সিপিইউ মেমোরির নির্দিষ্ট ঠিকানাটি (যেমন \`0x2040\`) **MAR রেজিস্টারে** বসায়।
- **ধাপ ২:** ঠিকানাটি **এড্রেস বাস** দিয়ে সোজা র‍্যাম চিপের ঠিকানায় পৌঁছায়।
- **ধাপ ৩:** **কন্ট্রোল ইউনিট** কন্ট্রোল বাসে **READ সিগন্যাল** পাঠায়।
- **ধাপ ৪:** র‍্যামের অভ্যন্তরীণ ডিকোডার নির্দিষ্ট \`0x2040\` নম্বর সেলটিকে সক্রিয় করে।
- **ধাপ ৫:** সেলে সংরক্ষিত সংখ্যাটি (\`৯০\`) **ডাটা বাসে** ছেড়ে দেওয়া হয়, যা দ্রুতগতিতে সিপিইউ-তে ঢুকে **MBR রেজিস্টারে** সুরক্ষিতভাবে জমা হয়!`,
      },
      {
        heading: 'The 5-Step Memory WRITE Operation',
        headingBn: 'মেমোরিতে ডাটা লেখার ৫টি সুনির্দিষ্ট ধাপ (WRITE Cycle)',
        bodyEn: `When you calculate an answer (\`10 + 20 = 30\`) and save it to RAM, here is the write cycle:

- **Step 1:** The CPU loads the target destination address (\`0x3010\`) into the **MAR**.
- **Step 2:** The CPU places the calculated answer (\`30\`) into the **MBR**.
- **Step 3:** The address bits drive down the **Address Bus**, and the data bits drive down the **Data Bus**.
- **Step 4:** The Control Unit fires an electrical **WRITE** pulse along the Control Bus.
- **Step 5:** The RAM address decoder opens the gates to memory cell \`0x3010\`, and the byte \`30\` is latched securely into the storage capacitors! The CPU then removes the WRITE pulse, and the memory is safely updated!`,
        bodyBn: `যখন কোনো হিসাব শেষে নতুন ফলাফল (\`১০ + ২০ = ৩০\`) মেমোরিতে সংরক্ষণ করতে হয়, তখন যেভাবে কাজটি সম্পন্ন হয়:

- **ধাপ ১:** সিপিইউ লক্ষ্য ঠিকানাটি (\`0x3010\`) **MAR রেজিস্টারে** লোড করে।
- **ধাপ ২:** হিসাব করা উত্তরটি (\`৩০\`) **MBR রেজিস্টারে** বসায়।
- **ধাপ ৩:** ঠিকানাটি যায় **এড্রেস বাস** দিয়ে, আর সংখ্যাটি ওঠে **ডাটা বাসে**।
- **ধাপ ৪:** কন্ট্রোল ইউনিট কন্ট্রোল বাসে একটি শক্তিশালী **WRITE পালস** পাঠায়।
- **ধাপ ৫:** র‍্যামের মেমোরি গেট খুলে যায় এবং সংখ্যা \`৩০\` নির্দিষ্ট সেলে শক্তভাবে সংরক্ষিত হয়! এরপর সিগন্যাল বন্ধ হয় এবং মেমোরি আপডেট সম্পন্ন হয়!`,
      },
    ],
    interactiveType: 'lesson18-suite',
  },
];
