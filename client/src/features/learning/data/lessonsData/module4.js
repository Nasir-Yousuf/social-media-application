// Module 4: Input Devices & Human-Machine Interfaces (Lecture File 04)
// Lessons 19 to 22: Keyboard & IRQ Interrupts, Mouse & Pointing, Optical Scanning (OMR, OCR, MICR), and Speech Technologies.

export const MODULE_4_LESSONS = [
  // ========================================================
  // LESSON 19: The Keyboard Demystified: Layout, Modifier Keys & The IRQ Interrupt
  // ========================================================
  {
    id: 'cb-keyboard-and-irq-mechanics',
    track: 'computer-basics',
    order: 19,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '19. The Keyboard Demystified: Layout, Modifier Keys & The IRQ Interrupt',
      bn: '১৯. কীবোর্ডের খুটিনাটি: লেআউট, মডিফায়ার কি এবং IRQ ইন্টারাপ্ট',
    },
    subtitle: {
      en: 'The 5 key groups, scan codes, the 16-byte buffer, and the hardware interrupt (IRQ 1).',
      bn: '৫টি কি-গ্রুপ, স্ক্যান কোড, ১৬-বাইটের বাফার এবং হার্ডওয়্যার ইন্টারাপ্ট (IRQ 1)।',
    },
    keyTakeaways: [
      'The IBM Enhanced Keyboard standard has 101+ keys arranged into 5 logical groups.',
      'Alphanumeric (QWERTY), Numeric Keypad (Num Lock), Function Keys (F1-F12), Cursor Movement, and Special Purpose.',
      'Modifier Keys (Shift, Ctrl, Alt) do not output letters alone; they alter the behavior of other keys.',
      'Non-Printable Keys (Enter, Tab, Backspace, Delete) control formatting and navigation without producing glyphs.',
      'When you press a key, the keyboard controller produces a hexadecimal Scan Code (Make Code).',
      'The controller signals the CPU using Hardware Interrupt line IRQ 1, pausing the CPU for a microsecond to read the buffer.',
    ],
    keyTakeawaysBn: [
      'আইবিএম এনহ্যান্সড কীবোর্ডে ১০১টিরও বেশি কি থাকে যা ৫টি যৌক্তিক গ্রুপে বিভক্ত।',
      'আলফানিউমেরিক (QWERTY), নিউমেরিক কিপ্যাড (Num Lock), ফাংশন কি (F1-F12), কার্সর মুভমেন্ট এবং স্পেশাল পারপাস কি।',
      'মডিফায়ার কি (Shift, Ctrl, Alt) একা কোনো অক্ষর তৈরি করে না; অন্য কি-র আচরণ পরিবর্তন করে।',
      'নন-প্রিন্টেবল কি (Enter, Tab, Backspace, Delete) কোনো দৃশ্যমান অক্ষর ছাড়াই নেভিগেশন ও ফরম্যাটিং নিয়ন্ত্রণ করে।',
      'বাটন চাপলে কীবোর্ড কন্ট্রোলার হেক্সাডেসিমেল স্ক্যান কোড (Scan Code) তৈরি করে।',
      'কন্ট্রোলার হার্ডওয়্যার ইন্টারাপ্ট লাইন IRQ 1 ব্যবহার করে সিপিইউ-র দৃষ্টি আকর্ষণ করে বাফার থেকে ডাটা পড়তে পাঠায়।',
    ],
    contentSections: [
      {
        heading: 'The 5 Groups of the Enhanced 101-Key Keyboard',
        headingBn: '১০১+ কি যুক্ত কীবোর্ডের ৫টি প্রধান গ্রুপ',
        bodyEn: `Look at your desktop keyboard. It is divided into 5 distinct zones:

1. **Alphanumeric Keys:** The main typewriter layout containing the English alphabet, numbers 0-9, and standard punctuation (arranged in the famous **QWERTY** layout).
2. **Numeric Keypad:** Grouped on the far right like a desktop calculator for rapid data entry. Toggled ON and OFF with the **Num Lock** key!
3. **Function Keys (F1 through F12):** Arranged across the top row. Executes program-specific shortcuts (e.g., \`F1\` for Help, \`F5\` for Webpage Refresh).
4. **Cursor Movement Keys:** Arrow keys (Up, Down, Left, Right), along with **Home**, **End**, **Page Up**, and **Page Down** for navigating documents without touching a mouse.
5. **Special Purpose Keys:** **Esc** (cancel/exit), **Print Screen** (capture snapshot), **Scroll Lock**, **Pause/Break**, **Windows key**, and **Application key** (context menu).`,
        bodyBn: `একটি সাধারণ পূর্ণাঙ্গ কীবোর্ড ৫টি নির্দিষ্ট অঞ্চলে বিভক্ত:

১. **আলফানিউমেরিক কি (Alphanumeric):** টাইপরাইটারের মতো বর্ণমালা, সংখ্যা এবং বিরামচিহ্ন সংবলিত মূল অংশ (যা বিখ্যাত **QWERTY** লেআউটে সাজানো)।
২. **নিউমেরিক কিপ্যাড (Numeric Keypad):** ডানপাশে ক্যালকুলেটরের মতো সাজানো যাতে দ্রুত হিসাব টাইপ করা যায়। এটি **Num Lock** বাটন দিয়ে চালু বা বন্ধ করা যায়!
৩. **ফাংশন কি (Function Keys - F1 থেকে F12):** ওপরের সারির বাটন যা এক ক্লিকে বিশেষ কাজ করে (যেমন: সাহায্য পেতে \`F1\`, ব্রাউজার রিফ্রেশ করতে \`F5\`)।
৪. **কার্সর মুভমেন্ট কি (Cursor Movement):** চারদিকের অ্যারো কি (তীর চিহ্ন), এবং ডকুমেন্টে দ্রুত চলাচলের জন্য **Home**, **End**, **Page Up**, **Page Down**।
৫. **স্পেশাল পারপাস কি (Special Purpose):** **Esc** (বাতিল করা), **Print Screen** (স্ক্রিনশট নেওয়া), **Windows key** এবং মাউসের ডান ক্লিকের মতো **Application key**।`,
      },
      {
        heading: 'How a Keystroke Reaches Your Screen: The IRQ 1 Movie',
        headingBn: 'কীবোর্ডের বাটন থেকে স্ক্রিনের লেখা: IRQ 1-এর গল্প',
        bodyEn: `What happens when you press the letter **"A"**?
- **Step 1:** The key plunger hits the circuit membrane, closing an electrical matrix switch.
- **Step 2:** The onboard **Keyboard Controller chip** identifies the row and column and generates a **Scan Code** (e.g., \`0x1E\` for "A").
- **Step 3:** The scan code is dropped into a temporary **16-byte circular Keyboard Buffer** in RAM.
- **Step 4 (The Interrupt):** The keyboard controller fires a pulse along dedicated hardware line **IRQ 1 (Interrupt Request 1)** to the CPU!
- **Step 5:** The CPU pauses its current math for a microsecond, runs the **Interrupt Service Routine (ISR)**, reads the scan code from the buffer, maps it to ASCII code 65, and commands the video card to light up the letter **"A"** on your screen!`,
        bodyBn: `কীবোর্ডে **"A"** বাটন চাপলে ভেতরে যা ঘটে:
- **ধাপ ১:** বাটনের নিচের রাবার সুইচ চেপে সার্কিটের সংযোগ পূর্ণ করে।
- **ধাপ ২:** কীবোর্ডের ভেতরের মাইক্রোচিপ কন্ট্রোলার গ্রিড শনাক্ত করে হেক্সাডেসিমেল **স্ক্যান কোড** (যেমন "A"-এর জন্য \`0x1E\`) তৈরি করে।
- **ধাপ ৩:** কোডটি র‍্যামের **১৬-বাইটের সার্কুলার কীবোর্ড বাফারে** জমা হয়।
- **ধাপ ৪ (ইন্টারাপ্ট সিগন্যাল):** কন্ট্রোলার ডেডিকেটেড তার **IRQ 1 (Interrupt Request 1)** দিয়ে সিপিইউ-কে বলে: *"মাস্টার, কীবোর্ডে বাটন টেপা হয়েছে!"*
- **ধাপ ৫:** সিপিইউ চোখের পলকে তার বর্তমান কাজ থামিয়ে **ইন্টারাপ্ট সার্ভিস রুটিন (ISR)** চালু করে, বাফার থেকে কোড পড়ে আসকি (ASCII 65) বের করে এবং মনিটরে চকচকে **"A"** ফুটিয়ে তোলে!`,
      },
    ],
    interactiveType: 'lesson19-suite',
  },

  // ========================================================
  // LESSON 20: The Mouse & Pointing Devices: Optical Sensors, Trackballs & The 5 Hand Techniques
  // ========================================================
  {
    id: 'cb-mouse-and-pointing-devices',
    track: 'computer-basics',
    order: 20,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    title: {
      en: '20. The Mouse & Pointing Devices: Optical Sensors, Trackballs & The 5 Hand Techniques',
      bn: '২০. মাউস ও পয়েন্টার ডিভাইস: অপটিক্যাল সেন্সর, ট্র্যাকবল ও ৫টি কৌশল',
    },
    subtitle: {
      en: 'Mechanical vs optical mice, the 5 mouse actions, trackballs, touchpads, and CAD joysticks.',
      bn: 'মেকানিক্যাল বনাম অপটিক্যাল মাউস, মাউসের ৫টি কৌশল, ট্র্যাকবল, টাচপ্যাড ও জয়স্টিক।',
    },
    keyTakeaways: [
      'The mouse was invented by Douglas Engelbart in 1964 as a wooden block with 2 wheels.',
      'Mechanical mice rolled a rubber ball against X and Y internal encoder wheels; easily clogged by desk dust.',
      'Optical mice bounce a red LED or laser into a microscopic camera taking 1,500+ photos/sec to track motion.',
      'The 5 Essential Mouse Techniques: Pointing, Clicking, Double-Clicking, Dragging (drag-and-drop), and Right-Clicking.',
      'Trackballs keep the base stationary while fingers rotate the ball (ideal for ships, radar, and cramped desks).',
      'Joysticks provide 360-degree omnidirectional levers used heavily in gaming, flight simulation, and CAD.',
    ],
    keyTakeawaysBn: [
      '১৯৬৪ সালে ডগলাস এঙ্গেলবার্ট দুটি চাকাযুক্ত কাঠের তৈরি প্রথম কম্পিউটার মাউস উদ্ভাবন করেন।',
      'মেকানিক্যাল মাউসের পেটে রাবারের বল থাকত যা ঘুরত; কিন্তু ধুলোবালি জমে প্রায়ই জ্যাম হয়ে যেত।',
      'অপটিক্যাল মাউস লাল এলইডি বা লেজার আলো ফেলে প্রতি সেকেন্ডে ১৫০০-এর বেশি ছবি তুলে নিখুঁত গতি শনাক্ত করে।',
      'মাউসের ৫টি মূল কৌশল: পয়েন্ট করা, ক্লিক, ডাবল-ক্লিক, ড্র্যাগ (টেনে নেওয়া) এবং রাইট-ক্লিক (মেনু দেখা)।',
      'ট্র্যাকবল (Trackball) একই জায়গায় স্থির থাকে এবং আঙুল দিয়ে বল ঘুরিয়ে কার্সর চালানো যায় (জাহাজ ও রাডার স্টেশনে জনপ্রিয়)।',
      'জয়স্টিক (Joystick) হলো চারদিকে ঘোরানো যায় এমন লিভার যা গেমিং, ফ্লাইট সিমুলেটর ও ক্যাড (CAD) ডিজাইনে অপরিহার্য।',
    ],
    contentSections: [
      {
        heading: 'Mechanical vs. Optical Mice: The Ball vs. The Camera',
        headingBn: 'মেকানিক্যাল বনাম অপটিক্যাল মাউস: রাবার বল বনাম ক্যামেরা',
        bodyEn: `How did pointing devices evolve?

1. **The Mechanical Mouse (The Rubber Ball Era):**
   - Had a heavy, rubber-coated steel ball inside its belly.
   - When rolled across a mousepad, the ball turned two perpendicular plastic rollers: one for the **X-axis (Horizontal)** and one for the **Y-axis (Vertical)**.
   - Slotted wheels pulsed infrared light through phototransistors.
   - **The Big Flaw:** Desk lint, hair, and dust wrapped around the rollers, requiring you to pop open the hatch and scrape off gross gray grime with a toothpick!

2. **The Optical Mouse (The Microscopic Camera):**
   - Introduced a tiny red LED or invisible infrared laser beam.
   - Light bounces off microscopic surface imperfections into an onboard optical sensor (a miniature camera).
   - A digital signal processor (DSP) analyzes **1,500 to 10,000 photos every second**, comparing images to see which direction the microscopic peaks moved! Zero moving parts, zero dirt clogging!`,
        bodyBn: `পয়েন্টিং ডিভাইসের বিস্ময়কর বিবর্তন:

১. **মেকানিক্যাল মাউস (রাবারের বলের যুগ):**
   - এর পেটের নিচে একটি ভারী রাবার প্রলেপযুক্ত স্টিলের বল থাকত।
   - মাউসপ্যাডে চালালে বলটি দুটি রোলার ঘোরাত—একটি **X-অক্ষ (ডানে-বামে)** এবং অন্যটি **Y-অক্ষ (উপরে-নিচে)**।
   - **সবচেয়ে বড় সমস্যা:** টেবিলের ধুলোবালি ও ময়লা রোলারে আটকে চাকা জ্যাম হয়ে যেত, ফলে কিছুদিন পর পর ঢাকনা খুলে কাঠি দিয়ে ময়লা পরিষ্কার করতে হতো!

২. **অপটিক্যাল মাউস (ক্ষুদ্র ক্যামেরার জাদু):**
   - এর নিচে থাকে একটি লাল এলইডি বা অদৃশ্য লেজার লাইট।
   - আলো টেবিলের খাঁজে প্রতিফলিত হয়ে মাউসের ভেতরের এক অতি ক্ষুদ্র ক্যামেরায় পড়ে।
   - ভেতরের প্রসেসর **প্রতি সেকেন্ডে ১৫০০ থেকে ১০,০০০টি ছবি তোলে** এবং ছবিগুলোর অবস্থান তুলনা করে কার্সরের গতি নিখুঁতভাবে নির্ধারণ করে! কোনো ঘূর্ণনশীল অংশ নেই, ফলে ময়লা জমার কোনো সুযোগ নেই!`,
      },
      {
        heading: 'Mastering the 5 Mouse Techniques',
        headingBn: 'মাউস ব্যবহারের ৫টি মৌলিক কৌশল',
        bodyEn: `Every computer user must master these 5 actions:
1. **Pointing:** Moving the on-screen cursor arrow so its tip hovers over an icon or button.
2. **Clicking (Left-Click):** Pressing and releasing the primary mouse button once. Selects a file or activates a link.
3. **Double-Clicking:** Rapidly clicking the left button twice within a third of a second. Opens programs, folders, and documents.
4. **Dragging (Drag-and-Drop):** Pointing to an object, holding down the left button, moving the cursor across the screen, and letting go. Used to move files into folders or rearrange windows!
5. **Right-Clicking:** Clicking the secondary button. Pops open a **Context / Shortcut Menu** with actions relevant to that exact object (Copy, Paste, Rename, Delete)!`,
        bodyBn: `কম্পিউটার পরিচালনায় মাউসের এই ৫টি কৌশল অপরিহার্য:
১. **পয়েন্টিং (Pointing):** মাউস ঘুরিয়ে স্ক্রিনের তীর চিহ্নটিকে কোনো নির্দিষ্ট আইকন বা ফাইলের ওপর রাখা।
২. **ক্লিক (Clicking / Left-Click):** বাম বাটনটি একবার চেপে ছেড়ে দেওয়া। এর মাধ্যমে ফাইল নির্বাচন বা বাটনে চাপ দেওয়া হয়।
৩. **ডাবল-ক্লিক (Double-Clicking):** সেকেন্ডের এক-তৃতীয়াংশের মধ্যে পরপর দুইবার দ্রুত ক্লিক করা। ফোল্ডার ও সফটওয়্যার ওপেন করতে ব্যবহৃত হয়।
৪. **ড্র্যাগ বা ড্র্যাগ-অ্যান্ড-ড্রপ (Dragging):** ফাইলের ওপর বাটন চেপে ধরে রেখে টেনে অন্য জায়গায় নিয়ে ছেড়ে দেওয়া। ফাইল মুভ করতে বা উইন্ডো সরাতে কাজে লাগে।
৫. **রাইট-ক্লিক (Right-Clicking):** ডান বাটন ক্লিক করা। সাথে সাথে একটি **শর্টকাট মেনু (Context Menu)** ভেসে ওঠে, যাতে কাট, কপি, পেস্ট, ডিলিট ইত্যাদি অপশন পাওয়া যায়!`,
      },
      {
        heading: 'Trackballs, Touchpads & Joysticks',
        headingBn: 'ট্র্যাকবল, টাচপ্যাড ও জয়স্টিক',
        bodyEn: `Other brilliant pointing variations:
- **Trackball:** An upside-down mouse! The plastic housing stays stationary on your desk. You spin a large smooth ball with your thumb or palm. **Why use it?** Perfect for crowded workstations, air traffic control towers, radar screens, and preventing wrist strain!
- **Trackpad / Touchpad:** A flat touch-sensitive capacitive surface on laptops. Measures the tiny electrical disruption caused by your conductive fingertip.
- **Joystick:** A vertical lever pivoting on a base, sending 360-degree X-Y coordinates to the computer. Indispensable for flight simulators, drone piloting, and Computer-Aided Design (CAD)!`,
        bodyBn: `মাউসের অন্যান্য চমৎকার বিকল্পসমূহ:
- **ট্র্যাকবল (Trackball):** উল্টানো মাউসের মতো! মাউসের বডি নড়বে না, টেবিলের এক কোণায় স্থির থাকবে। আপনি হাতের বৃদ্ধাঙ্গুলি দিয়ে ওপরের বলটি ঘুরিয়ে কার্সর চালাবেন। **সুবিধা:** ছোট টেবিল, জাহাজের ব্রিজ, রাডার কন্ট্রোল রুম এবং কবজির ব্যথা কমাতে অতুলনীয়!
- **টাচপ্যাড (Trackpad / Touchpad):** ল্যাপটপের কিবোর্ডের নিচের স্পর্শকাতর প্যাড। আঙুলের স্পর্শের সূক্ষ্ম বৈদ্যুতিক পরিবর্তন মেপে কার্সর চালায়।
- **জয়স্টিক (Joystick):** চারদিকে ঘোরানো যায় এমন খাড়া লিভার। কম্পিউটার গেম, বিমানের ফ্লাইট সিমুলেটর এবং ক্যাড (CAD) ইঞ্জিনিয়ারিংয়ে এর ব্যবহার সবচেয়ে বেশি!`,
      },
    ],
    interactiveType: 'lesson2-suite',
  },

  // ========================================================
  // LESSON 21: Scanning, Recognition & Data Capture: Barcode, OMR, OCR & MICR
  // ========================================================
  {
    id: 'cb-scanning-and-optical-recognition',
    track: 'computer-basics',
    order: 21,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    title: {
      en: '21. Scanning, Recognition & Data Capture: Barcode, OMR, OCR & MICR',
      bn: '২১. স্ক্যানিং ও অপটিক্যাল রিকগনিশন: বারকোড, OMR, OCR ও MICR',
    },
    subtitle: {
      en: 'How computers see and parse the physical world: exam sheets, grocery barcodes, and bank checks.',
      bn: 'কম্পিউটার কীভাবে বাস্তব কাগজ পড়ে: পরীক্ষার ওএমআর শিট, পণ্যের বারকোড এবং ব্যাংকের চেক।',
    },
    keyTakeaways: [
      'Scanners use optical arrays (CCD / CIS) to convert physical photos and paper into digital bitmap pixels.',
      'Barcode Readers use photoelectric sensors to decode alternating black and white bars into product numbers (UPC/EAN).',
      'OMR (Optical Mark Reader) detects pencil/pen bubble marks based on light reflectivity differences; grades 100 exams in seconds.',
      'OCR (Optical Character Recognition) translates scanned character shapes into editable digital ASCII/Unicode text.',
      'MICR (Magnetic Ink Character Recognition) reads routing numbers printed in magnetized iron oxide ink on bank checks.',
      'MICR is impervious to coffee stains, pen smudges, and forgery because it reads magnetic polarity, not optical ink!',
    ],
    keyTakeawaysBn: [
      'স্ক্যানার অপটিক্যাল সেন্সর (CCD/CIS) দিয়ে বাস্তব ছবি বা কাগজকে ডিজিটাল পিক্সেল বিটম্যাপে রূপান্তর করে।',
      'বারকোড রিডার আলোর প্রতিফলন মেপে সাদা-কালো দাগের প্যাটার্ন থেকে পণ্যের নম্বর (UPC/EAN) উদ্ধার করে।',
      'ওএমআর (OMR): পেন্সিল বা বলপেনের ভরাট বৃত্তের আলোর শোষণ মেপে চোখের পলকে শত শত পরীক্ষার খাতা মূল্যায়ন করে।',
      'ওসিআর (OCR): স্ক্যান করা কাগজের অক্ষরের ছবি চিনে নিয়ে সম্পাদনযোগ্য ডিজিটাল টেক্সটে (ASCII/Unicode) রূপান্তর করে।',
      'এমআইসিআর (MICR): ব্যাংকের চেকের নিচে আয়রন অক্সাইড মিশ্রিত চৌম্বকীয় কালির বিশেষ কোড পড়ে।',
      'চেকের ওপর কফির দাগ লাগলেও বা ময়লা হলেও MICR নিখুঁতভাবে পড়তে পারে, কারণ এটি অপটিক্যাল আলো নয় বরং চুম্বকত্ব দিয়ে পড়ে!',
    ],
    contentSections: [
      {
        heading: 'The 4 Direct-Entry Recognition Technologies',
        headingBn: 'ডাটা ক্যাপচারের ৪টি বিখ্যাত অপটিক্যাল প্রযুক্তি',
        bodyEn: `How do computers automatically capture data without humans typing?

1. **Barcode Readers (Supermarket Checkout):**
   - The striped pattern represents binary 0s and 1s through alternating black vertical bars and white gaps.
   - A laser sweep reflects light back into a photoelectric cell. White areas bounce high light; black bars absorb it. Decodes the Universal Product Code (UPC) in 0.05 seconds!

2. **OMR (Optical Mark Reader - Exam Sheets):**
   - Standardized multiple-choice tests use OMR answer sheets.
   - The scanner shines a beam of light onto the bubble grid. A dark pencil or pen mark reflects drastically **less light** than clean white paper. The computer instantly grades 1,000 student exams without human fatigue or bias!

3. **OCR (Optical Character Recognition - Book Digitization):**
   - Standard scanners only produce a "dumb" picture of a document (you can't search words or edit typos).
   - **OCR software** analyzes the curves and strokes of glyphs, matching them against known letter templates. Turns a scanned PDF into an editable Word document!

4. **MICR (Magnetic Ink Character Recognition - Bank Checks):**
   - Look at the bottom line of any bank check. Those futuristic robotic numbers are printed with special ink containing **magnetized iron oxide powder**.
   - As the check passes through the bank sorter, a magnetic read-head excites the ink. Even if someone spills coffee or scratches ink over the numbers, the magnetic signature remains 100% readable, completely preventing bank fraud!`,
        bodyBn: `কীবোর্ডে টাইপ না করে কম্পিউটার কীভাবে দ্রুত হাজার হাজার তথ্য সংগ্রহ করে?

১. **বারকোড রিডার (সুপারমার্কেটের ক্যাশ কাউন্টার):**
   - পণ্যের গায়ে থাকা সাদা ও কালো দাগের প্যাটার্ন দিয়ে সংখ্যা বোঝানো হয়।
   - লেজার রশ্মি ফেললে সাদা অংশ আলো ফিরিয়ে দেয় আর কালো দাগ আলো শুষে নেয়। ফটোইলেকট্রিক সেন্সর নিমেষেই পণ্যের দাম ও নাম জেনে ফেলে!

২. **ওএমআর (Optical Mark Reader - পরীক্ষার ওএমআর শিট):**
   - বোর্ড পরীক্ষা বা চাকরির এমসিকিউ পরীক্ষার খাতা মূল্যায়নে ব্যবহৃত হয়।
   - কাগজটিতে আলো ফেললে যে বৃত্তটি পেন্সিল বা কালো কালিতে ভরাট থাকে, সেখান থেকে আলো কম প্রতিফলিত হয়। কম্পিউটার চোখের পলকে শত শত শিক্ষার্থীর নির্ভুল ফলাফল তৈরি করে!

৩. **ওসিআর (Optical Character Recognition - বই ডিজিটাইজেশন):**
   - সাধারণ স্ক্যানার কেবল একটি ছবি তৈরি করে (যাতে কোনো শব্দ এডিট করা যায় না)।
   - **OCR সফটওয়্যার** ছবির প্রতিটি অক্ষরের দাগ ও বক্ররেখা চিনে সেগুলোকে এডিটেবল ওয়ার্ড ফাইলের টেক্সটে রূপান্তর করে!

৪. **এমআইসিআর (Magnetic Ink Character Recognition - ব্যাংকের চেক):**
   - যেকোনো ব্যাংক চেকের নিচের সারির অদ্ভুত রোবটিক লেখা লক্ষ্য করেছেন? এগুলো সাধারণ কালি নয়, বরং **চৌম্বকীয় আয়রন অক্সাইড পাউডারযুক্ত কালি** দিয়ে ছাপা।
   - ব্যাংকের মেশিনে চেক ঢোকালে মেশিনটি কালিটির চুম্বকত্ব মেপে একাউন্ট নম্বর পড়ে ফেলে। চেকের ওপর চা-কফি পড়লেও বা দাগ কাটলেও চুম্বকীয় সিগন্যাল নষ্ট হয় না, ফলে জালিয়াতি পুরোপুরি রোধ করা যায়!`,
      },
    ],
    interactiveType: 'lesson19-suite',
  },

  // ========================================================
  // LESSON 22: Audio, Video & Speech Technologies: Speech-to-Text (STT) vs. Speech Synthesis (TTS)
  // ========================================================
  {
    id: 'cb-speech-and-multimedia-input',
    track: 'computer-basics',
    order: 22,
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    title: {
      en: '22. Audio, Video & Speech Technologies: Speech-to-Text (STT) vs. Speech Synthesis (TTS)',
      bn: '২২. অডিও, ভিডিও ও স্পিচ প্রযুক্তি: স্পিচ-টু-টেক্সট (STT) বনাম স্পিচ সিন্থেসিস (TTS)',
    },
    subtitle: {
      en: 'Acoustic transducers, sound card ADCs, webcams, and the AI revolution of voice recognition.',
      bn: 'অ্যাকোস্টিক ট্রান্সডিউসার, সাউন্ড কার্ড এডিসি, ওয়েবক্যাম এবং কৃত্রিম বুদ্ধিমত্তার ভয়েস প্রযুক্তি।',
    },
    keyTakeaways: [
      'A Microphone is an acoustic transducer converting air sound pressure waves into analog electrical voltages.',
      'The Sound Card ADC (Analog-to-Digital Converter) samples analog waves thousands of times per second (e.g., 44.1 kHz PCM).',
      'Web Cameras use CMOS or CCD image sensors to capture digital video frames for streaming and conferencing.',
      'Speech Recognition (STT - Speech-to-Text) translates spoken human words into editable computer text.',
      'Speech Synthesis (TTS - Text-to-Speech) artificially speaks digital text aloud using phonetic voice synthesis.',
      'TTS is a vital accessibility lifeline, enabling visually impaired learners to navigate computers using screen readers.',
    ],
    keyTakeawaysBn: [
      'মাইক্রোফোন হলো অ্যাকোস্টিক ট্রান্সডিউসার যা বাতাসের শব্দতরঙ্গকে এনালগ বৈদ্যুতিক ভোল্টেজে রূপান্তর করে।',
      'সাউন্ড কার্ডের ADC (Analog-to-Digital Converter) এনালগ সিগন্যালকে প্রতি সেকেন্ডে ৪৪,১০০ বার মেপে ডিজিটাল বাইনারি অডিও তৈরি করে।',
      'ওয়েবক্যামে CMOS বা CCD ইমেজ সেন্সর থাকে যা ভিডিও কনফারেন্সের জন্য ফ্রেম ধারণ করে।',
      'স্পিচ রিকগনিশন (STT): মানুষের মুখের কণ্ঠস্বর শুনে তাকে লিখিত টেক্সটে রূপান্তর করে।',
      'স্পিচ সিন্থেসিস (TTS): কম্পিউটারের যেকোনো লেখাকে কৃত্রিম মানব কণ্ঠে উচ্চস্বরে পড়ে শোনায়।',
      'টিটিএস (TTS) দৃষ্টিপ্রতিবন্ধী মানুষের জন্য এক মহান আশীর্বাদ, যা স্ক্রিন রিডারের মাধ্যমে তাদের কম্পিউটার ব্যবহারে সক্ষম করে।',
    ],
    contentSections: [
      {
        heading: 'How Computers Hear Sound: Microphone & The ADC',
        headingBn: 'কম্পিউটার কীভাবে শব্দ শোনে: মাইক্রোফোন ও এডিসি (ADC)',
        bodyEn: `When you speak into your phone or headset:
1. **The Diaphragm Vibrates:** Your vocal cords vibrate air molecules, which hit a flexible diaphragm inside the **Microphone**.
2. **The Transducer:** A tiny coil inside a magnetic field converts those physical vibrations into an undulating **Analog Electrical Voltage Wave**.
3. **The Sound Card ADC (Analog-to-Digital Converter):**
   - The computer cannot store wavy voltages; it only understands binary 0s and 1s.
   - The ADC measures (samples) the voltage level **44,100 times every second** (CD quality standard - 44.1 kHz).
   - Each sample is turned into a 16-bit binary number, creating crystal-clear digital PCM audio!`,
        bodyBn: `আপনি যখন ফোন বা হেডফোনে কথা বলেন:
১. **ডায়াফ্রাম কাঁপে:** আপনার কণ্ঠের শব্দতরঙ্গ মাইক্রোফোনের ভেতরের পাতলা পর্দায় (ডায়াফ্রাম) আঘাত করে।
২. **ট্রান্সডিউসার:** চুম্বকের ভেতর থাকা কয়েল এই নড়াচড়াকে **এনালগ বৈদ্যুতিক ভোল্টেজ তরঙ্গে** রূপান্তর করে।
৩. **সাউন্ড কার্ডের এডিসি (Analog-to-Digital Converter):**
   - কম্পিউটার কোনো ঢেউ বোঝে না; সে শুধু ০ ও ১ বোঝে।
   - এডিসি চিপ প্রতি সেকেন্ডে **৪৪,১০০ বার** ভোল্টেজের উচ্চতা মেপে তাকে বাইনারি সংখ্যায় রূপান্তর করে (যাকে বলে ৪৪.১ kHz স্যাম্পলিং)।
   - ফলে তৈরি হয় ডিজিটাল শব্দ যা কম্পিউটারে নিরাপদে সংরক্ষণ ও প্লে করা যায়!`,
      },
      {
        heading: 'Speech Recognition (STT) vs. Speech Synthesis (TTS)',
        headingBn: 'স্পিচ রিকগনিশন বনাম স্পিচ সিন্থেসিস: কান বনাম কণ্ঠস্বর',
        bodyEn: `These two technologies are the twin pillars of conversational computing:

| Feature | Speech Recognition (STT: Speech-to-Text) | Speech Synthesis (TTS: Text-to-Speech) |
| :--- | :--- | :--- |
| **Direction** | **Human Voice In → Digital Text Out** | **Digital Text In → Synthesized Voice Out** |
| **Anatomical Role** | Acts like the **Human Ear & Brain** | Acts like the **Human Vocal Cords** |
| **Core Process** | Audio waveforms broken into acoustic phonemes; language AI decodes sentence context. | Text parsed into syllables; phonetic voice engine concatenates natural speech audio. |
| **Everyday Uses** | Siri/Google voice search, typing WhatsApp messages with voice, automated courtroom transcription. | Screen readers for the blind (JAWS, NVDA), GPS navigation voice (*"In 200 meters, turn left"*), audiobooks. |`,
        bodyBn: `কণ্ঠস্বরের দুটি বিপরীতমুখী প্রযুক্তি:

| বৈশিষ্ট্য | স্পিচ রিকগনিশন (STT - Speech to Text) | স্পিচ সিন্থেসিস (TTS - Text to Speech) |
| :--- | :--- | :--- |
| **দিক** | **মানুষের কণ্ঠস্বর ইনপুট → লিখিত টেক্সট আউটপুট** | **লিখিত টেক্সট ইনপুট → কৃত্রিম কণ্ঠস্বর আউটপুট** |
| **উপমা** | মানুষের **কান ও শ্রবণশক্তি** | মানুষের **কণ্ঠনালী ও বাচনভঙ্গি** |
| **কাজের ধরণ** | শব্দের ফ্রিকোয়েন্সি বিশ্লেষণ করে ফনিমস (ধ্বনি) বের করে এবং বাক্যের অর্থ সাজায়। | লিখিত শব্দগুলোকে ধ্বনি অনুযায়ী সাজিয়ে স্পিকারে প্রাকৃতিক কণ্ঠ তৈরি করে। |
| **বাস্তব ব্যবহার** | সিরি/গুগল ভয়েস টাইপিং, মুখে কথা বলে মেসেজ লেখা, ট্রানজেকশন কল সেন্টার। | দৃষ্টিপ্রতিবন্ধীদের জন্য স্ক্রিন রিডার, জিপিএস ম্যাপের দিকনির্দেশনা, অডিওবুক পাঠ। |`,
      },
    ],
    interactiveType: 'lesson19-suite',
  },
];
