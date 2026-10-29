// Module 5: Output Devices & Display Technologies (Lecture File 05)
// Lessons 23 to 26: Hard vs Soft Copy, Printers & Spooling, Monitors (CRT vs LCD), and Audio Subsystems.

export const MODULE_5_LESSONS = [
  // ========================================================
  // LESSON 23: Hard Copy vs. Soft Copy & Hybrid I/O Devices
  // ========================================================
  {
    id: 'cb-hard-copy-vs-soft-copy-io',
    track: 'computer-basics',
    order: 23,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '23. Hard Copy vs. Soft Copy & Hybrid I/O Devices',
      bn: '২৩. হার্ড কপি বনাম সফট কপি এবং হাইব্রিড আই/ও ডিভাইস',
    },
    subtitle: {
      en: 'Permanent ink on paper vs fleeting light on screen, and dual-personality I/O hardware.',
      bn: 'কাগজে স্থায়ী ছাপা বনাম স্ক্রিনের ক্ষণস্থায়ী আলো, এবং দ্বিমুখী ইনপুট/আউটপুট যন্ত্র।',
    },
    keyTakeaways: [
      'An Output Device is a machine-to-man interface translating digital binary results into human sight and sound.',
      'Hard Copy: Permanent physical tangible output (paper printouts, plotters) that survives power outages.',
      'Soft Copy: Transient virtual visual display or audio wave that disappears the instant power is switched off.',
      'Hybrid I/O Devices perform both input and output functions through a single unified hardware unit.',
      'Touchscreens detect touch coordinates (Input) while simultaneously displaying illuminated pixels (Output).',
      'Modems, Network Interface Cards (NIC), Sound Cards, and Audio Headsets are classic dual-role I/O devices.',
    ],
    keyTakeawaysBn: [
      'আউটপুট ডিভাইস হলো কম্পিউটার থেকে মানুষের মধ্যে যোগাযোগের মাধ্যম যা ডিজিটাল বাইনারি কোডকে দৃশ্য ও শব্দে রূপান্তর করে।',
      'হার্ড কপি (Hard Copy): কাগজে স্থায়ী মুদ্রিত রূপ (যেমন প্রিন্টার বা প্লটার প্রিন্ট) যা বিদ্যুৎ চলে গেলেও নষ্ট হয় না।',
      'সফট কপি (Soft Copy): ক্ষণস্থায়ী ভার্চুয়াল প্রদর্শন বা শব্দ যা বিদ্যুৎ বন্ধ করার সাথে সাথেই বিলীন হয়ে যায়।',
      'হাইব্রিড আই/ও ডিভাইস (I/O Devices): একই যন্ত্র যা একই সাথে তথ্য গ্রহণ (Input) এবং তথ্য প্রদান (Output) উভয় কাজ করতে পারে।',
      'টাচস্ক্রিন স্পর্শের অবস্থান মেপে ইনপুট নেয় এবং একই সাথে ছবি ও লেখা ফুটিয়ে তুলে আউটপুট দেখায়।',
      'মডেম, নেটওয়ার্ক কার্ড (NIC), সাউন্ড কার্ড এবং মাইক্রোফোনযুক্ত হেডসেট হলো বহুল ব্যবহৃত দ্বিমুখী আই/ও যন্ত্র।',
    ],
    contentSections: [
      {
        heading: 'Hard Copy vs. Soft Copy: The Permanent vs. The Fleeting',
        headingBn: 'হার্ড কপি বনাম সফট কপি: স্থায়ী বনাম ক্ষণস্থায়ী',
        bodyEn: `When a computer gives you an answer, it comes in two fundamental formats:

1. **Hard Copy (Physical & Permanent):**
   - Tangible, touchable output printed onto paper, transparencies, or 3D plastic objects.
   - *Devices:* Laser printers, inkjet printers, mechanical engineering plotters.
   - **Superpowers:** You can fold it, carry it in your backpack, sign it with a legal ink pen, and read it during a power blackout without batteries!

2. **Soft Copy (Virtual & Transient):**
   - Intangible display of pixels or sound waves vibrating through the air.
   - *Devices:* Computer monitors, smartphone displays, multimedia projectors, audio speakers.
   - **Superpowers:** Instantaneous updates, dynamic 144 FPS video games, animated websites, and zero paper waste! But turn off the power switch, and it vanishes into thin air!`,
        bodyBn: `কম্পিউটার যখন কোনো ফলাফল মানুষের সামনে প্রকাশ করে, তখন তা দুটি প্রধান রূপে আসে:

১. **হার্ড কপি (Hard Copy - স্থায়ী ও স্পর্শযোগ্য):**
   - যা কাগজের ওপর কালিতে ছাপা হয় এবং বাস্তবে হাতে ধরা ও স্পর্শ করা যায়।
   - *যন্ত্রসমূহ:* লেজার প্রিন্টার, ইনকজেট প্রিন্টার, ইঞ্জিনিয়ারিং ড্রয়িংয়ের প্লটার।
   - **সুবিধা:** ব্যাগের ভেতর নেওয়া যায়, কলম দিয়ে স্বাক্ষর করা যায় এবং বিদ্যুৎ চলে গেলেও আলোতে যেকোনো সময় পড়া যায়!

২. **সফট কপি (Soft Copy - ক্ষণস্থায়ী ও ভার্চুয়াল):**
   - স্ক্রিনের উজ্জ্বল পিক্সেল কিংবা বাতাসে স্পিকারের শব্দতরঙ্গ।
   - *যন্ত্রসমূহ:* কম্পিউটার মনিটর, স্মার্টফোন ডিসপ্লে, মাল্টিমিডিয়া প্রজেক্টর, স্পিকার।
   - **সুবিধা:** তাৎক্ষণিক পরিবর্তন করা যায়, রঙিন ভিডিও দেখা যায় এবং কোনো কাগজ নষ্ট হয় না! কিন্তু বিদ্যুৎ বন্ধ করার সাথে সাথে এটি গায়েব হয়ে যায়!`,
      },
      {
        heading: 'Hybrid I/O Devices: The Two-Way Bridges',
        headingBn: 'হাইব্রিড আই/ও ডিভাইস: দ্বিমুখী যোগাযোগের সেতু',
        bodyEn: `Some devices do not fit neatly into "just input" or "just output". They perform **both roles**:

- **Touchscreen:** When your finger taps an app icon, it is an **Input device**. When the panel lights up displaying the webpage, it is an **Output device**!
- **Modem (Modulator-Demodulator):** Encodes outgoing computer bits into analog phone/cable frequencies (Output) and decodes incoming signals into binary bytes (Input).
- **Network Interface Card (NIC):** Transmits your uploaded chat messages onto the Ethernet cable (Output) and receives incoming YouTube video packets (Input).
- **Audio Headset:** Combines a microphone (Audio Input) and stereo speakers (Audio Output) onto a single comfortable headband.`,
        bodyBn: `কিছু কিছু যন্ত্র শুধু ইনপুট বা শুধু আউটপুট হিসেবে আলাদা করা যায় না। তারা **উভয় কাজই সমানভাবে করে**:

- **টাচস্ক্রিন (Touchscreen):** আঙুল দিয়ে যখন বাটনে চাপ দেন তখন এটি **ইনপুট**; আর যখন ডিসপ্লেতে ভিডিও বা ছবি ভেসে ওঠে তখন এটি **আউটপুট**!
- **মডেম (Modem):** কম্পিউটার থেকে ডাটা বাইরে পাঠানোর সময় এনালগ সিগন্যালে রূপান্তর করে (আউটপুট) এবং ইন্টারনেট থেকে আসা সিগন্যাল বাইনারিতে রূপান্তর করে (ইনপুট)।
- **নেটওয়ার্ক ইন্টারফেস কার্ড (NIC):** তারের মাধ্যমে আপনার পাঠানো মেসেজ ইন্টারনেটে ছাড়ে (আউটপুট) এবং বন্ধুদের মেসেজ কম্পিউটারে রিসিভ করে (ইনপুট)।
- **হেডসেট (Headset):** এতে একই সাথে মাইক্রোফোন (অডিও ইনপুট) এবং দুই কানের স্পিকার (অডিও আউটপুট) যুক্ত থাকে।`,
      },
    ],
    interactiveType: 'lesson1-suite',
  },

  // ========================================================
  // LESSON 24: Printers: Impact vs. Non-Impact, DPI, PPM & The Magic of Print Spooling (SPOOL)
  // ========================================================
  {
    id: 'cb-printers-and-spooling-magic',
    track: 'computer-basics',
    order: 24,
    difficulty: 'Intermediate',
    estimatedMinutes: 16,
    title: {
      en: '24. Printers: Impact vs. Non-Impact, DPI, PPM & The Magic of Print Spooling (SPOOL)',
      bn: '২৪. প্রিন্টার: ইমপ্যাক্ট বনাম নন-ইমপ্যাক্ট, DPI, PPM ও প্রিন্ট স্পুলিং (SPOOL)',
    },
    subtitle: {
      en: 'Dot-matrix vs laser toner, print resolution, and why background SPOOLing prevents computer freezes.',
      bn: 'ডট-ম্যাট্রিক্স বনাম লেজার প্রিন্টার, প্রিন্ট রেজোলিউশন এবং স্পুলিং প্রযুক্তির জাদু।',
    },
    keyTakeaways: [
      'Charles Babbage originally designed a mechanical printing mechanism for his 1800s Difference Engine.',
      'Impact Printers physically strike inked ribbons against paper (Dot-matrix, Daisy-wheel); loud, continuous carbon forms, low cost.',
      'Non-Impact Printers use electrostatic toner or ink droplets without touching paper (Laser, Inkjet); silent, ultra-sharp.',
      'Printer metrics: DPI (Dots Per Inch: resolution sharpness), PPM (Pages Per Minute: speed), CPS (Characters Per Second).',
      'Printer Drivers translate OS graphic commands into printer languages like PCL or Adobe PostScript.',
      'SPOOL stands for Simultaneous Peripheral Operations On-Line; buffers jobs onto disk so your CPU never freezes!',
    ],
    keyTakeawaysBn: [
      'চার্লস ব্যাবেজ উনবিংশ শতাব্দীতে তার ডিফারেন্স ইঞ্জিনের ফলাফলের জন্য প্রথম মেকানিক্যাল প্রিন্টার ডিজাইন করেছিলেন।',
      'ইমপ্যাক্ট প্রিন্টার কালির রিবনে পিন বা হাতুড়ি দিয়ে আঘাত করে লেখে (ডট-ম্যাট্রিক্স); প্রচণ্ড শব্দ হয়, কার্বন কপি করা যায়, খরচ খুব কম।',
      'নন-ইমপ্যাক্ট প্রিন্টার কাগজে স্পর্শ না করে কালি বা লেজার পাউডার ছিটিয়ে লেখে (লেজার, ইনকজেট); সম্পূর্ণ নিঃশব্দ ও নিখুঁত।',
      'প্রিন্টারের পরিমাপ: DPI (Dots Per Inch: রেজোলিউশনের স্বচ্ছতা), PPM (Pages Per Minute: প্রতি মিনিটে পৃষ্ঠার সংখ্যা)।',
      'প্রিন্টার ড্রাইভার অপারেটিং সিস্টেমের পেজকে প্রিন্টারের নিজস্ব ভাষা PCL বা পোস্টস্ক্রিপ্টে রূপান্তর করে।',
      'স্পুলিং (SPOOL: Simultaneous Peripheral Operations On-Line) প্রিন্টের ফাইল ডিস্কে জমা রেখে প্রসেসরকে মুক্ত রাখে।',
    ],
    contentSections: [
      {
        heading: 'Impact vs. Non-Impact Printers: The Mechanical Hammer vs. The Laser',
        headingBn: 'ইমপ্যাক্ট বনাম নন-ইমপ্যাক্ট প্রিন্টার: হাতুড়ির আঘাত বনাম লেজার',
        bodyEn: `Printers are categorized by how they put marks onto paper:

| Feature / Attribute | Impact Printers | Non-Impact Printers |
| :--- | :--- | :--- |
| **Mechanism** | Physical pins or type hammers strike an inked cloth ribbon against paper. | Sprays liquid ink droplets (Inkjet) or melts dry plastic toner with a laser drum (Laser). |
| **Print Quality** | Low to medium resolution; visible dot patterns. | High to ultra-high photographic resolution (1200+ DPI). |
| **Noise Level** | **Very loud and clattery** during printing. | Virtually silent and smooth. |
| **Multipart / Carbon Forms?** | **YES!** Can press through 3 layers of carbon copy paper (invoices, receipts, shipping manifests). | **NO!** Can only print on one single sheet at a time. |
| **Cost per Page** | Extremely cheap ribbons (fractions of a cent). | Higher toner and ink cartridge costs. |
| **Examples** | Dot-matrix, Daisy-wheel, Line printer. | Laser printer, Inkjet printer, Thermal receipt printer. |`,
        bodyBn: `কাগজে কীভাবে লেখা ফোটে তার ওপর ভিত্তি করে প্রিন্টারের শ্রেণিবিভাগ:

| বৈশিষ্ট্য | ইমপ্যাক্ট প্রিন্টার (Impact) | নন-ইমপ্যাক্ট প্রিন্টার (Non-Impact) |
| :--- | :--- | :--- |
| **কাজের পদ্ধতি** | ধাতব পিন বা হাতুড়ি দিয়ে কালির ফিতার ওপর সজোরে আঘাত করে। | তরল কালি ছিটিয়ে (ইনকজেট) অথবা লেজার ড্রাম দিয়ে পাউডার টোনার গলিয়ে (লেজার)। |
| **প্রিন্টের মান** | সাধারণ ও ডট ডট দাগযুক্ত; রেজোলিউশন কম। | ফটোগ্রাফিক মানের অতীব চমৎকার ও নিখুঁত (১২০০+ DPI)। |
| **শব্দের মাত্রা** | চলার সময় প্রচণ্ড খটখট শব্দ হয়। | অত্যন্ত শান্ত ও নিঃশব্দে চলে। |
| **কার্বন কপি সুবিধা?** | **হ্যাঁ!** আঘাতের কারণে নিচে থাকা কার্বন পেপারেও ছাপ পড়ে (ব্যাংকের রসিদ, চালান)। | **না!** একবারে শুধুমাত্র একটি কাগজের ওপরই প্রিন্ট হতে পারে। |
| **প্রতি পৃষ্ঠায় খরচ** | রিবনের দাম নামমাত্র হওয়ায় খরচ সবচেয়ে কম। | টোনার ও কালির কার্টিজের দাম তুলনামূলক বেশি। |
| **বাস্তব উদাহরণ** | ডট-ম্যাট্রিক্স, ডেইজি-হুইল, লাইন প্রিন্টার। | লেজার প্রিন্টার, ইনকজেট প্রিন্টার, থার্মাল প্রিন্টার। |`,
      },
      {
        heading: 'Print Spooling (SPOOL): Why Your PC Doesn\'t Freeze When Printing',
        headingBn: 'প্রিন্ট স্পুলিং (SPOOL): প্রিন্ট দিলে কম্পিউটার হ্যাং হয় না কেন?',
        bodyEn: `What does **SPOOL** stand for?
**S**imultaneous **P**eripheral **O**perations **O**n-**L**ine.

**The Nightmare Without Spooling:**
- The CPU runs at 3.5 GHz (billions of calculations/sec).
- A mechanical printer prints at only **15 pages per minute** (very slow mechanical rollers).
- In old operating systems without spooling, the CPU had to feed each letter to the printer one-by-one. Your entire screen froze for 4 minutes while waiting for the printer to finish!

**The Spooling Revolution:**
- When you click "Print 50 Pages", the operating system immediately copies the entire print file into a special temporary directory on your fast hard drive or RAM (**The Spooler Queue**).
- This takes **less than 0.5 seconds**!
- The CPU immediately unfreezes and hands control back to you. You can play games or browse the web while a background system thread quietly feeds pages to the physical printer at its own mechanical pace!`,
        bodyBn: `**SPOOL**-এর পূর্ণরূপ কী?
**S**imultaneous **P**eripheral **O**perations **O**n-**L**ine।

**স্পুলিং না থাকলে কী বিপর্যয় ঘটত?**
- প্রসেসরের গতি সেকেন্ডে শত কোটি হিসাব।
- কিন্তু প্রিন্টার প্রতি মিনিটে মাত্র **১৫টি পৃষ্ঠা** প্রিন্ট করতে পারে (ধীরগতির মোটর ও রোলার)।
- পুরনো সিস্টেমে স্পুলিং না থাকায় প্রসেসরকে নিজে বসে থেকে প্রিন্টারের কাগজে অক্ষর পাঠাতে হতো। ফলে পুরো কম্পিউটার ৪-৫ মিনিট সম্পূর্ণ হ্যাং হয়ে বসে থাকত!

**স্পুলিংয়ের যুগান্তকারী সমাধান:**
- আপনি যখন ৫০ পৃষ্ঠার ডকুমেন্টে "Print" চাপেন, অপারেটিং সিস্টেম চোখের পলকে পুরো ফাইলটি হার্ডডিস্কের একটি অস্থায়ী ফোল্ডারে (**স্পুলার কিউ**) জমা করে ফেলে।
- এতে সময় লাগে **মাত্র আধা সেকেন্ড**!
- প্রসেসর সাথে সাথে আপনাকে মুক্ত করে দেয়। আপনি আপনার গেম বা ব্রাউজিং চালিয়ে যেতে পারেন, আর ব্যাকগ্রাউন্ডে স্পুলার ধীরে ধীরে প্রিন্টারে পৃষ্ঠা পাঠাতে থাকে!`,
      },
    ],
    interactiveType: 'lesson24-suite',
  },

  // ========================================================
  // LESSON 25: Display Technologies: CRT vs. LCD, Resolution, Refresh Rates & Dot Pitch
  // ========================================================
  {
    id: 'cb-monitors-and-display-physics',
    track: 'computer-basics',
    order: 25,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '25. Display Technologies: CRT vs. LCD, Resolution, Refresh Rates & Dot Pitch',
      bn: '২৫. ডিসপ্লে প্রযুক্তি: সিআরটি বনাম এলসিডি, রেজোলিউশন, রিফ্রেশ রেট ও ডট পিচ',
    },
    subtitle: {
      en: 'Electron guns vs liquid crystal shutters, and the 3 golden rules of razor-sharp screen clarity.',
      bn: 'ইলেকট্রন গান বনাম লিকুইড ক্রিস্টাল এবং স্বচ্ছ ও নিখুঁত মনিটরের ৩টি প্রধান পরিমাপ।',
    },
    keyTakeaways: [
      'The display subsystem consists of the Monitor hardware and the Video Controller (GPU graphics card).',
      'CRT (Cathode Ray Tube): Heavy vacuum bottle where electron guns shoot beams onto glowing RGB phosphor triads.',
      'LCD (Liquid Crystal Display): Flat panel using electric voltage to untwist liquid crystal molecules, modulating backlight.',
      'Resolution: Expressed as horizontal × vertical pixels (e.g., 1920 × 1080); higher resolution displays sharper detail.',
      'Refresh Rate (Hz): Number of times per second the screen is fully redrawn; requires ≥ 72 Hz to prevent visible flicker and eyestrain.',
      'Dot Pitch: Distance in millimeters between like-colored phosphor dots; recommended ≤ 0.28 mm for clear reading.',
    ],
    keyTakeawaysBn: [
      'ডিসপ্লে সাবসিস্টেম মূলত দুটি অংশ নিয়ে গঠিত: মনিটর হার্ডওয়্যার এবং ভিডিও কন্ট্রোলার (গ্রাফিক্স কার্ড/GPU)।',
      'সিআরটি (CRT): ভারী ভ্যাকুয়াম টিউব যার ভেতরের ইলেকট্রন গান ফসফরাস পর্দায় আঘাত করে ছবি আঁকে।',
      'এলসিডি (LCD): পাতলা প্যানেল যা তরল স্ফটিকের অণুর মোড় পরিবর্তন করে পেছনের আলোকে নিয়ন্ত্রণ করে।',
      'রেজোলিউশন: আনুভূমিক ও উলম্ব পিক্সেলের গুণফল (যেমন: ১৯২০ × ১০৮০); বেশি রেজোলিউশনে ছবি পরিষ্কার ও সূক্ষ্ম দেখায়।',
      'রিফ্রেশ রেট (Hz): প্রতি সেকেন্ডে কতবার পর্দা নতুন করে আঁকা হয়; চোখের ক্লান্তি এড়াতে অন্তত ৭২ হার্টজ (Hz) হওয়া প্রয়োজন।',
      'ডট পিচ (Dot Pitch): একই রঙের দুটি পিক্সেলের মধ্যকার দূরত্ব; স্পষ্ট দেখার জন্য এটি ০.২৮ মিলিমিটার বা তার কম হওয়া উচিত।',
    ],
    contentSections: [
      {
        heading: 'CRT vs. LCD: The Heavy Vacuum Tube vs. The Slim Crystals',
        headingBn: 'সিআরটি বনাম এলসিডি: ভারী কাঁচের বোতল বনাম পাতলা স্ফটিক',
        bodyEn: `Look at how monitor physics revolutionized computing:

1. **CRT (Cathode Ray Tube - The Classic Giant):**
   - A sealed glass vacuum bottle. At the back, an **Electron Gun** shoots 3 tight streams of high-speed electrons (Red, Green, Blue).
   - Magnetic deflection yoke coils sweep the beams back and forth across the front glass screen coated with glowing chemical **phosphor dots**.
   - **Why it died:** Enormously heavy (25 kg), bulky (2 feet deep), generated high heat, consumed 150+ Watts of power, and emitted low levels of X-ray radiation.

2. **LCD (Liquid Crystal Display - The Modern Flat Screen):**
   - Uses a flat white LED backlight passing through a sandwich of glass sheets, polarizing filters, and a layer of **liquid crystal molecules**.
   - When electrical voltage is applied, the liquid crystal molecules twist or untwist like microscopic window shutters, precisely passing or blocking light through Red, Green, and Blue subpixels!
   - **Superpowers:** Razor-thin (5 mm), lightweight, zero radiation, ultra-low battery consumption!`,
        bodyBn: `মনিটরের প্রযুক্তির বৈপ্লবিক পরিবর্তন:

১. **সিআরটি (Cathode Ray Tube - পুরনো যুগের দানব):**
   - একটি বায়ুশূন্য ভারী কাঁচের বোতল। এর পেছনের **ইলেকট্রন গান** থেকে তীব্র গতিতে ৩টি ইলেকট্রন রশ্মি (লাল, সবুজ, নীল) সামনের পর্দায় ছোটাছুটি করত।
   - সামনের কাঁচের ভেতরে ফসফরাস প্রলেপ থাকত, যাতে ইলেকট্রন লাগলেই আলো জ্বলে উঠত।
   - **কেন বিলুপ্ত হলো:** ওজনে প্রচণ্ড ভারী (২০-২৫ কেজি), বিশাল জায়গা দখল করত, প্রচুর বিদ্যুৎ খরচ হতো, ঘর গরম করে ফেলত এবং সামান্য ক্ষতিকর রশ্মি ছড়াত।

২. **এলসিডি (Liquid Crystal Display - আধুনিক স্লিম মনিটর):**
   - পেছনের এলইডি ব্যাকলাইটের সামনে দুটি পোলারাইজিং কাঁচের মাঝে **লিকুইড ক্রিস্টাল বা তরল স্ফটিকের স্তর** থাকে।
   - বিদ্যুৎ প্রবাহের তারতম্যে এই অণুগুলো জানালার খড়খড়ির মতো বাঁকা হয়ে আলোকে ঢুকতে দেয় বা আটকে দেয়।
   - **সুবিধা:** কাগজের মতো পাতলা (৫ মিমি), সহজে বহনযোগ্য, কোনো ক্ষতিকর বিকিরণ নেই এবং অতি সামান্য বিদ্যুৎ খরচ করে!`,
      },
      {
        heading: 'The 3 Golden Metrics of Screen Clarity',
        headingBn: 'স্ক্রিনের স্বচ্ছতা ও নিখুঁত দৃশ্যমানতার ৩টি মূল মাপকাঠি',
        bodyEn: `When evaluating any computer monitor, check these 3 specifications:

1. **Resolution (Pixel Density):**
   - The sharpness of an image, expressed as **Horizontal × Vertical pixels** (e.g., $1920 \times 1080$ Full HD, $3840 \times 2160$ 4K).
   - Higher resolution means smaller individual pixels, allowing more windows on screen and eliminating jagged edges!

2. **Refresh Rate (Flicker Prevention):**
   - The number of times per second the display hardware sweeps and redraws all pixels on screen, measured in **Hertz (Hz)**.
   - On older CRT monitors, if the refresh rate was below **72 Hz**, the human eye could perceive the pulsing phosphors (**Flicker**), leading to severe headaches and eyestrain!
   - Modern gaming monitors run at 120 Hz, 144 Hz, or 240 Hz for buttery-smooth animations.

3. **Dot Pitch (Pixel Sharpness):**
   - The distance in millimeters between like-colored phosphor dots of adjacent pixels (e.g., from Red dot to adjacent Red dot).
   - **The Golden Rule:** The smaller the dot pitch, the crisper the image! A dot pitch of **$\le 0.28\text{ mm}$** is recommended for sharp, readable text.`,
        bodyBn: `যেকোনো মনিটর কেনার আগে ৩টি বিষয় যাচাই করা আবশ্যক:

১. **রেজোলিউশন (Resolution - পিক্সেলের সংখ্যা):**
   - স্ক্রিনের ছবির স্বচ্ছতা, যা **আনুভূমিক × উলম্ব পিক্সেল** হিসেবে লেখা হয় (যেমন: ১৯২০ × ১০৮০ ফুল এইচডি, ৩৮৪০ × ২১৬০ ফোর-কে)।
   - রেজোলিউশন যত বেশি হবে, স্ক্রিনের লেখা ও ছবি তত বেশি ধারালো ও নিখুঁত দেখাবে!

২. **রিফ্রেশ রেট (Refresh Rate - চোখের আরাম):**
   - প্রতি সেকেন্ডে মনিটরটি কতবার পুরো স্ক্রিন নতুন করে রিড্র করে, যা **হার্টজ (Hz)** এককে মাপা হয়।
   - সিআরটি মনিটরে রিফ্রেশ রেট **৭২ হার্টজের কম** হলে স্ক্রিন কাঁপত (Flicker), যা চোখে ব্যথা ও মাথা ঘোরার কারণ হতো!
   - আজকের গেমিং মনিটর ১২০, ১৪৪ বা ২৪০ হার্টজে চলে, যার ফলে গেম অত্যন্ত মসৃণ দেখায়।

৩. **ডট পিচ (Dot Pitch - বিন্দুর দূরত্ব):**
   - দুটি পাশাপাশি পিক্সেলের একই রঙের বিন্দুর মধ্যকার মিলিমিটার দূরত্ব।
   - **সোনালী নিয়ম:** ডট পিচ যত কম হবে, ছবি তত স্পষ্ট হবে! পরীক্ষার স্ট্যান্ডার্ড অনুযায়ী স্পষ্ট পড়ার জন্য ডট পিচ **০.২৮ মিলিমিটার বা তার কম** হওয়া উচিত।`,
      },
    ],
    interactiveType: 'lesson25-suite',
  },

  // ========================================================
  // LESSON 26: Audio Output Devices: Sound Cards (DAC), Speakers, Headphones & Headsets
  // ========================================================
  {
    id: 'cb-audio-output-subsystems',
    track: 'computer-basics',
    order: 26,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '26. Audio Output Devices: Sound Cards (DAC), Speakers, Headphones & Headsets',
      bn: '২৬. অডিও আউটপুট ডিভাইস: সাউন্ড কার্ড (DAC), স্পিকার, হেডফোন ও হেডসেট',
    },
    subtitle: {
      en: 'From binary bits to vibrating air: digital-to-analog converters, speaker cones, and VoIP headsets.',
      bn: 'বাইনারি কোড থেকে বাতাসে শব্দতরঙ্গ: ডিজিটাল-টু-এনালগ রূপান্তর, স্পিকার ও হেডসেট।',
    },
    keyTakeaways: [
      'Audio Output converts digital binary sound files (MP3, WAV) into audible acoustic sound pressure waves.',
      'The DAC (Digital-to-Analog Converter) on your sound card transforms binary 0s and 1s into continuous electrical voltage waves.',
      'Speakers use an electromagnet and permanent magnet to vibrate a flexible paper/plastic cone, moving the air.',
      'Human Hearing Range: Vibrations between 20 Hz (deep bass) and 20,000 Hz (high treble).',
      'Headphones provide private listening via miniature speakers resting against the ears.',
      'Headsets integrate stereo headphones with a noise-canceling microphone, powering online classes, gaming, and VoIP calls.',
    ],
    keyTakeawaysBn: [
      'অডিও আউটপুট ডিজিটাল বাইনারি ফাইলকে মানুষের শ্রবণযোগ্য শব্দতরঙ্গে রূপান্তর করে।',
      'সাউন্ড কার্ডের DAC (Digital-to-Analog Converter) বাইনারি ০ ও ১-কে অবিচ্ছিন্ন এনালগ বৈদ্যুতিক ভোল্টেজে পরিণত করে।',
      'স্পিকারের ভেতরের তড়িৎ-চৌম্বক ও স্থায়ী চুম্বকের আকর্ষণে কাগজের পর্দা কেঁপে ওঠে এবং বাতাসে শব্দ তৈরি করে।',
      'মানুষের শ্রবণসীমা: প্রতি সেকেন্ডে ২০ হার্টজ (গভীর খাদ) থেকে ২০,০০০ হার্টজ (তীক্ষ্ণ সুর)।',
      'হেডফোন কানের কাছে ছোট স্পিকারের সাহায্যে ব্যক্তিগতভাবে গান বা শব্দ শোনার সুবিধা দেয়।',
      'হেডসেট (Headset) হলো হেডফোন ও মাইক্রোফোনের যৌথ রূপ, যা অনলাইন ক্লাস ও কথা বলার জন্য উপযুক্ত।',
    ],
    contentSections: [
      {
        heading: 'How Computers Create Sound: The DAC & The Speaker Cone',
        headingBn: 'কম্পিউটার কীভাবে শব্দ তৈরি করে: ডিএসি (DAC) ও স্পিকার কোণ',
        bodyEn: `How does a digital file on your SSD become music you can dance to?
1. **The Digital Audio Stream:** A Spotify song is stored as millions of binary numbers (0s and 1s).
2. **The DAC (Digital-to-Analog Converter):**
   - The sound card's DAC reads those numbers and draws a smooth, undulating **Analog Voltage Wave**.
3. **The Amplifier:** Boosts the tiny voltage wave into a powerful electrical signal.
4. **The Speaker Electromagnet:**
   - The amplified electrical current flows through a wire coil attached to a flexible cone.
   - As the electric polarity reverses thousands of times per second, the coil is pushed and pulled by a fixed permanent magnet.
   - The cone vibrates violently back and forth, pushing air molecules to create **sound pressure waves** that hit your eardrums!`,
        bodyBn: `কম্পিউটারের ডিজিটাল ফাইল কীভাবে বাস্তব শব্দে রূপ নেয়?
১. **ডিজিটাল অডিও স্ট্রিম:** একটি গানের ফাইল মূলত কোটি কোটি বাইনারি সংখ্যা (০ ও ১)।
২. **ডিএসি (Digital-to-Analog Converter - DAC):**
   - সাউন্ড কার্ডের এই চিপটি বাইনারি সংখ্যাগুলোকে মসৃণ এনালগ বৈদ্যুতিক ভোল্টেজ তরঙ্গে রূপান্তর করে।
3. **অ্যামপ্লিফায়ার (Amplifier):** দুর্বল বৈদ্যুতিক সংকেতটিকে শক্তিশালী করে তোলে।
৪. **স্পিকারের পর্দা ও চুম্বক:**
   - শক্তিশালী কারেন্ট স্পিকারের কয়েলে গিয়ে তড়িৎ-চুম্বক তৈরি করে।
   - পেছনে থাকা স্থায়ী চুম্বকের সাথে আকর্ষণে ও বিকর্ষণে কয়েলযুক্ত কাগজের বা প্লাস্টিকের পর্দাটি সেকেন্ডে হাজার বার কাঁপতে থাকে।
   - এই কম্পন বাতাসের অণুতে ঢেউ তৈরি করে সোজা আপনার কানের পর্দায় আঘাত করে শ্রুতিমধুর শব্দ সৃষ্টি করে!`,
      },
      {
        heading: 'Speakers vs. Headphones vs. Headsets',
        headingBn: 'স্পিকার বনাম হেডফোন বনাম হেডসেট: পার্থক্য কী?',
        bodyEn: `Choose the right audio output for your needs:
- **Speaker:** Radiates audio out into the room. Great for movies, parties, and room audio, but can disturb neighbors or reveal private conversations.
- **Headphone:** Two miniature speaker drivers mounted on a headband or earbuds. Channels sound directly into the ear canal, providing intense stereo immersion and total privacy.
- **Headset:** The professional hybrid! Integrates high-fidelity stereo headphones with a flexible, noise-canceling **boom microphone**. Indispensable for diplomatic interpreters, remote programmers on Zoom, call centers, and multiplayer gaming teams!`,
        bodyBn: `প্রয়োজন অনুযায়ী সঠিক অডিও ডিভাইস নির্বাচন:
- **স্পিকার (Speaker):** পুরো ঘরে শব্দ ছড়িয়ে দেয়। সিনেমা দেখা বা গান শোনার জন্য দারুণ, তবে এতে অন্যদের পড়াশোনায় ব্যাঘাত ঘটতে পারে।
- **হেডফোন (Headphone):** কানের ওপর লাগানো ক্ষুদ্র স্পিকার। বাইরের কাউকে বিরক্ত না করে সম্পূর্ণ ব্যক্তিগতভাবে গান বা লেকচার শোনার জন্য সেরা।
- **হেডসেট (Headset):** পেশাদারদের প্রিয় হাইব্রিড যন্ত্র! এতে ভালো মানের হেডফোনের সাথে একটি পরিষ্কার **নয়েজ-ক্যানসেলিং মাইক্রোফোন** যুক্ত থাকে। জুম মিটিং, অনলাইন ক্লাস ও বন্ধুদের সাথে গেম খেলার সময় কথা বলার জন্য এটি আদর্শ!`,
      },
    ],
    interactiveType: 'lesson1-suite',
  },
];
