// Chapter 2: The Evolution of AI and Why It Is Booming Now (Lessons 11-20)

export const CHAPTER_2_LESSONS = [
  {
    id: 'ai-11',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 11,
    difficulty: 'Beginner',
    title: {
      en: '11. Before Modern Computers: Early Ideas About Mechanical Intelligence',
      bn: '১১. আধুনিক কম্পিউটারের পূর্বে: যান্ত্রিক বুদ্ধিমত্তার আদি ভাবনা',
    },
    subtitle: {
      en: 'Explore early automata, Pascal’s Pascaline, and mechanical calculators.',
      bn: 'পাস্কালের প্রথম গাণিতিক যন্ত্র ও শুরুর দিকের চিন্তা।',
    },
    duration: '15 mins',
    objectives: [
      'Understand early mechanical calculation tools created by Blaise Pascal and Gottfried Leibniz.',
      'Explain how mechanical clockwork inspired early ideas of automated reasoning.',
      'Contrast mechanical arithmetic with true programmable computation.',
    ],
    prerequisites: 'Chapter 1 Complete',
    explanation: {
      simple: {
        en: 'Before electricity existed, inventors used gears, levers, and clockwork to build machines that could add, subtract, and calculate tables automatically.',
        bn: 'বিদ্যুৎ আবিষ্কারের আগে গিয়ার ও মেকানিকাল সিস্টেম দিয়ে গণনাকারী যন্ত্র তৈরি করা হতো।',
      },
      analogy: {
        en: 'Think of an odometer in a bicycle wheel that ticks up by 1 mile every time the tire rotates 1,000 times. That is mechanical counting in action!',
        bn: 'সাইকেলের চাকা ঘুরলে মিটারে কিলোমিটার ওঠার মতো এটি মেকানিকাল কাউন্টিং।',
      },
      technical: {
        en: 'Blaise Pascal invented the Pascaline in 1642 for addition/subtraction. Leibniz expanded this with the Stepped Reckoner in 1673 for multiplication.',
        bn: 'পাস্কাল ও লাইবনিজ প্রথম মেকানিকাল ক্যালকুলেটর তৈরি করেন।',
      },
    },
    misconceptions: [
      {
        misconception: 'Mechanical calculators could learn from data like modern AI.',
        correction: 'They were single-function mechanical arithmetic tools with fixed gear ratios.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why were early mechanical calculators important steps toward electronic computers?',
      modelAnswer: 'They proved that numerical calculation could be automated using physical machinery according to deterministic mathematical rules.',
      checklist: ['Mentioned physical machinery and automated arithmetic.'],
    },
    quiz: {
      question: 'What device did Blaise Pascal invent in 1642 to help with tax calculation?',
      options: ['The Abacus', 'The Pascaline', 'The Transistor', 'The Analytical Engine'],
      correctAnswer: 1,
      explanation: 'Blaise Pascal invented the Pascaline, one of the earliest mechanical adding machines.',
    },
    simulationType: 'ai-history-timeline',
    codeLab: {
      title: 'Simulating Gear Adder',
      language: 'python',
      starterCode: `def mechanical_adder(a, b):
    # Simulating gear carry over
    return a + b

print("Gear Calculation 25 + 47 =", mechanical_adder(25, 47))
`,
      expectedOutput: 'Gear Calculation 25 + 47 = 72',
      explanation: 'Early mechanical gears carried values over digits when a wheel completed 10 rotations.',
    },
    summary: ['Early AI concepts originated in mechanical clockwork and binary logic.'],
    glossary: [{ term: 'Pascaline', definition: 'Early mechanical calculator invented by Blaise Pascal.' }],
    nextLessonId: 'ai-12',
  },
  {
    id: 'ai-12',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 12,
    difficulty: 'Beginner',
    title: {
      en: '12. The Birth of AI: The Dartmouth Workshop and the 1950s',
      bn: '১২. AI-এর জন্ম: ডার্টমাউথ ওয়ার্কশপ ও ১৯৫০-এর দশক',
    },
    subtitle: {
      en: 'Learn how John McCarthy, Marvin Minsky, and Claude Shannon coined the term "Artificial Intelligence".',
      bn: '১৯৫৬ সালে জন ম্যাককার্থি ও সহকর্মীদের হাত ধরে AI নামের জন্মকাহিনি।',
    },
    duration: '15 mins',
    objectives: [
      'Explain the significance of the 1956 Dartmouth Summer Research Project.',
      'Identify key AI founding figures: McCarthy, Minsky, Shannon, and Rochester.',
      'Understand the optimistic early vision of 1950s computer science pioneers.',
    ],
    prerequisites: 'Lesson 11',
    explanation: {
      simple: {
        en: 'In the summer of 1956, a small group of brilliant scientists gathered at Dartmouth College. John McCarthy proposed the name "Artificial Intelligence" for the brand-new field of making machines use language and form concepts.',
        bn: '১৯৫৬ সালে ডার্টমাউথ কলেজে বিজ্ঞানীরা একত্র হন এবং জন ম্যাককার্থি প্রথম "Artificial Intelligence" শব্দটি ব্যবহার করেন।',
      },
      analogy: {
        en: 'It was like the founding conference of a new sport. Before Dartmouth, people had individual ideas; after Dartmouth, AI became an official scientific discipline!',
        bn: 'এটি একটি নতুন খেলার অফিসিয়াল কমিটি তৈরির মতো ছিল। এর মাধ্যমে AI এক নতুন বৈজ্ঞানিক শাখা হিসেবে আত্মপ্রকাশ করে।',
      },
      technical: {
        en: 'The 1956 Dartmouth proposal stated: "Every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it."',
        bn: 'ডার্টমাউথ প্রস্তাবনায় বলা হয়: বুদ্ধিমত্তার প্রতিটি দিককে গণিতে সুনির্দিষ্ট করে যন্ত্রে অনুকরণ করা সম্ভব।',
      },
    },
    misconceptions: [
      {
        misconception: 'The pioneers at Dartmouth expected AI to take 100 years to reach human levels.',
        correction: 'They were overly optimistic, believing a small group of researchers could make significant progress in a single summer!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Who coined the phrase "Artificial Intelligence" and in what year?',
      modelAnswer: 'John McCarthy coined the term "Artificial Intelligence" in 1955 when organizing the landmark 1956 Dartmouth Conference.',
      checklist: ['Mentioned John McCarthy and 1956 Dartmouth.'],
    },
    quiz: {
      question: 'In which year did the famous Dartmouth Workshop take place, officially launching AI as a field?',
      options: ['1942', '1956', '1974', '1997'],
      correctAnswer: 1,
      explanation: 'The Dartmouth Summer Research Project took place in 1956.',
    },
    simulationType: 'dartmouth-1956-demo',
    codeLab: {
      title: 'First Logic Theorist Proof Simulation',
      language: 'python',
      starterCode: `# Simulating Newell & Simon's Logic Theorist (1956)
# Prove that A AND B implies A
def prove_logic(a, b):
    statement = a and b
    conclusion = a
    return statement <= conclusion

print("Proof Validated:", prove_logic(True, False))
`,
      expectedOutput: 'Proof Validated: True',
      explanation: 'The Logic Theorist (1956) was the first AI program capable of proving mathematical theorems.',
    },
    summary: ['The 1956 Dartmouth conference officially birthed Artificial Intelligence as a scientific field.'],
    glossary: [{ term: 'Dartmouth Workshop', definition: 'The 1956 summer conference where the field of Artificial Intelligence was founded.' }],
    nextLessonId: 'ai-13',
  },
  {
    id: 'ai-13',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 13,
    difficulty: 'Beginner',
    title: {
      en: '13. Early Symbolic AI: Rules, Logic, Search, and Expert Systems',
      bn: '১৩. প্রারম্ভিক সিম্বলিক AI: রুলস, লজিক ও এক্সপার্ট সিস্টেমস',
    },
    subtitle: {
      en: 'Understand how IF/THEN rules and decision trees powered 1970s and 80s AI.',
      bn: '১৯৭০ ও ৮০-র দশকে হাতে লেখা রুলস ও এক্সপার্ট সিস্টেমের উত্থান।',
    },
    duration: '15 mins',
    objectives: [
      'Define Symbolic AI (Good Old-Fashioned AI / GOFAI).',
      'Explain how Expert Systems used Knowledge Bases and Inference Engines.',
      'Identify the advantages and brittleness of rule-based systems.',
    ],
    prerequisites: 'Lesson 12',
    explanation: {
      simple: {
        en: 'Symbolic AI tried to create intelligence by interviewing human experts (doctors, engineers) and encoding thousands of IF/THEN rules into a computer knowledge base.',
        bn: 'সিম্বলিক AI-তে ডাক্তার বা ইঞ্জিনিয়ারদের অভিজ্ঞতা ইন্টারভিউ নিয়ে হাজার হাজার IF/THEN নিয়ম কোড করে তৈরি করা হতো।',
      },
      analogy: {
        en: 'An Expert System is like a giant flow chart in a medical clinic: "IF fever > 101 AND cough == True THEN test for flu."',
        bn: 'এক্সপার্ট সিস্টেম হলো মেডিকেল গাইডবুকের সিদ্ধান্ত ফ্লো-চার্টের মতো।',
      },
      technical: {
        en: 'Symbolic AI consists of: 1) Knowledge Base (facts & rules), and 2) Inference Engine (forward/backward chaining logic to evaluate rules).',
        bn: 'এক্সপার্ট সিস্টেমে থাকে নলেজ বেস এবং ইনফারেঞ্চ ইঞ্জিন।',
      },
    },
    misconceptions: [
      {
        misconception: 'Expert Systems learned automatically from new patient files without human coders.',
        correction: 'Every rule had to be manually written and updated by knowledge engineers.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what an "Expert System" is and its main drawback.',
      modelAnswer: 'An Expert System is a program filled with thousands of handwritten IF/THEN rules from human experts. Its main drawback is brittleness—it breaks down if it encounters something slightly outside its written rules!',
      checklist: ['Mentioned handwritten IF/THEN rules and brittleness.'],
    },
    quiz: {
      question: 'What are the two main components of a classic Expert System?',
      options: [
        'Graphics Card and Video Memory',
        'Knowledge Base and Inference Engine',
        'Neural Network and Backpropagation',
        'Cloud Server and Microcontroller',
      ],
      correctAnswer: 1,
      explanation: 'Expert systems consist of a Knowledge Base (facts/rules) and an Inference Engine (logical solver).',
    },
    simulationType: 'expert-system-demo',
    codeLab: {
      title: 'Medical Expert System Simulation',
      language: 'python',
      starterCode: `# Mini Medical Expert System (MYCIN Style)
def diagnose(fever, rash, headache):
    if fever and rash:
        return "Possible Measles / Chickenpox"
    elif fever and headache:
        return "Possible Flu or Viral Infection"
    return "Checkup Recommended"

print("Diagnosis:", diagnose(fever=True, rash=False, headache=True))
`,
      expectedOutput: 'Diagnosis: Possible Flu or Viral Infection',
      explanation: 'MYCIN (1970s) used 600 rules to diagnose blood infections with high accuracy within its specific rule domain.',
    },
    summary: ['Symbolic AI relied on handcrafted rules and knowledge bases before machine learning took over.'],
    glossary: [{ term: 'Expert System', definition: 'A computer system that emulates the decision-making ability of a human expert using rules.' }],
    nextLessonId: 'ai-14',
  },
  {
    id: 'ai-14',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 14,
    difficulty: 'Beginner',
    title: {
      en: '14. Why Early AI Struggled: Limits of Computing, Data, and Expectations',
      bn: '১৪. প্রথম দিকের AI কেন হোঁচট খেয়েছিল: কম্পিউটিং ও ডেটার সীমাবদ্ধতা',
    },
    subtitle: {
      en: 'Discover the Combinatorial Explosion problem and hardware bottlenecks.',
      bn: 'কম্পিউটেশনের ধীরগতি ও অতিরিক্ত প্রত্যাশার কারণে থমকে যাওয়া।',
    },
    duration: '15 mins',
    objectives: [
      'Explain the Combinatorial Explosion problem in search trees.',
      'Understand the Moravec Paradox: Hard problems are easy, easy problems are hard.',
      'Identify hardware and memory limits of 1970s mainframe computers.',
    ],
    prerequisites: 'Lesson 13',
    explanation: {
      simple: {
        en: 'Early AI failed to live up to the hype because computers in the 1970s were millions of times weaker than a modern smartphone, and writing rules for real-life edge cases became impossible!',
        bn: '১৯৭০-এর দশকের কম্পিউটার ছিল বর্তমান ফোন থেকে লাখ গুণ ধীরগতির। বাস্তবে সব সম্ভাব্য নিয়ম লিখে কভার করা অসম্ভব ছিল।',
      },
      analogy: {
        en: 'Imagine trying to write down every single rule for walking. "Lift left leg 10 degrees, balance ankle, adjust for wind..." If a sudden pebble appears, the robot falls because no rule was written for that exact pebble!',
        bn: 'হাঁটার সময় প্রতি পদে নিয়ম লেখা অসম্ভব। একটু উঁচু পাথর পেলেই রোবট পড়ে যেত কারণ তার নিয়ম সিস্টেমে লেখা ছিল না।',
      },
      technical: {
        en: 'Moravec’s Paradox states that high-level reasoning (chess) requires very little compute, while low-level sensory-motor skills (recognizing a face, walking) require immense computational capacity.',
        bn: 'মোর্যাভেক্স প্যারাডক্স: যে কাজ মানুষের কাছে কঠিন (দাবা) তা কম্পিউটারের জন্য সহজ, আর যা মানুষের কাছে সহজ (মুখ চেনা) তা কম্পিউটারের জন্য কঠিন।',
      },
    },
    misconceptions: [
      {
        misconception: 'Early AI failed because the math of logic was completely wrong.',
        correction: 'The logic was sound, but computing power, memory, and training data were insufficient to process complex real-world environments.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain Moravec’s Paradox in your own words.',
      modelAnswer: 'Moravec’s Paradox means that things humans find hard (like playing grandmaster chess) are easy for computers, but things toddlers do effortlessly (like walking across a room or spotting a dog) are extremely difficult for computers!',
      checklist: ['Compared high-level logic (chess) with sensory-motor tasks (walking).'],
    },
    quiz: {
      question: 'What is Moravec’s Paradox?',
      options: [
        'AI can never process numbers as fast as humans.',
        'Hard reasoning tasks (like chess) are easy for AI, while easy human tasks (like walking or face recognition) are extremely difficult for AI.',
        'Computers become slower as data increases.',
        'Robots will always obey human commands.',
      ],
      correctAnswer: 1,
      explanation: 'Moravec’s Paradox highlighted that perceptual and motor skills require massive hidden computation.',
    },
    simulationType: 'combinatorial-demo',
    codeLab: {
      title: 'Combinatorial Explosion Simulation',
      language: 'python',
      starterCode: `# Demonstrating Combinatorial Explosion in Search Trees
moves_per_turn = 10
depth = 6
possible_outcomes = moves_per_turn ** depth
print(f"Possible Board States at Depth {depth}: {possible_outcomes:,}")
`,
      expectedOutput: 'Possible Board States at Depth 6: 1,000,000',
      explanation: 'At depth 20, possibilities exceed the number of atoms in the universe, causing search algorithms to choke without heuristic pruning.',
    },
    summary: ['Early AI hit walls due to lack of compute, memory bottlenecks, and the complexity of real-world edge cases.'],
    glossary: [{ term: 'Combinatorial Explosion', definition: 'Rapid growth in complexity when possibilities multiply exponentially.' }],
    nextLessonId: 'ai-15',
  },
  {
    id: 'ai-15',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 15,
    difficulty: 'Beginner',
    title: {
      en: '15. AI Winters: Why Interest and Funding Declined',
      bn: '১৫. AI উইন্টার বা শীতকাল: কেন বাজেট ও আগ্রহ কমে গিয়েছিল',
    },
    subtitle: {
      en: 'Examine the two major periods (1974-1980 & 1987-1993) when AI hype collapsed.',
      bn: 'অতিরিক্ত হাইপ এবং হাইপ ভাঙার পর ১৯৭৪-১৯৮০ ও ১৯৮৭-১৯৯৩ এর স্থবিরতা।',
    },
    duration: '15 mins',
    objectives: [
      'Define an "AI Winter".',
      'Identify the causes of the 1st (1974–1980) and 2nd (1987–1993) AI Winters.',
      'Learn how overpromising and underdelivering leads to funding freezes.',
    ],
    prerequisites: 'Lesson 14',
    explanation: {
      simple: {
        en: 'An "AI Winter" is a period of time when government and corporate funding for AI research dramatically dried up because early researchers promised revolutionary results that they could not deliver.',
        bn: 'AI উইন্টার হলো এমন একটি সময় যখন অতিরিক্ত প্রত্যাশা ও কাজের ব্যর্থতার কারণে গবেষণার জন্য সব সরকারি ও বেসরকারি বাজেট বন্ধ হয়ে যায়।',
      },
      analogy: {
        en: 'Imagine a startup promising flying cars next year. Investors give them $100 million. Five years later, they only built a slightly better bicycle. Investors get angry, pull out all money, and refuse to invest in cars for a decade!',
        bn: 'বাজেটে তৈরি উড়ন্ত গাড়ির প্রতিশ্রুতি ব্যর্থ হওয়ার পর ইনভেস্টরদের মুখ ফিরিয়ে নেওয়ার মতো।',
      },
      technical: {
        en: 'The Lighthill Report (1973 in UK) and DARPA budget cuts triggered the 1st AI Winter. The collapse of the specialized Lisp Machine market in 1987 triggered the 2nd AI Winter.',
        bn: 'লাইটহিল রিপোর্ট ও লিস্প মেশিনের বাজার ধ্বংসের ফলে প্রথম ও দ্বিতীয় AI উইন্টার শুরু হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'All AI research completely stopped during AI Winters.',
        correction: 'Dedicated scientists continued foundational research quietly in background labs, laying the groundwork for neural network backpropagation.',
      },
    ],
    feynmanChallenge: {
      prompt: 'What is an "AI Winter" and what causes it?',
      modelAnswer: 'An AI Winter is a period when interest and funding for AI drop sharply. It is caused by overhyping what AI can do, leading to disappointment when technology fails to meet impossible promises.',
      checklist: ['Defined funding drop.', 'Attributed cause to overpromising and unmet expectations.'],
    },
    quiz: {
      question: 'What primarily triggered the AI Winters of 1974 and 1987?',
      options: [
        'A solar flare destroyed all early computers.',
        'Over-promising capability followed by inability to deliver, leading to budget cuts.',
        'Governments banned AI software development.',
        'Scientists decided computers were no longer interesting.',
      ],
      correctAnswer: 1,
      explanation: 'Overhyped promises failing to materialize caused funding cutbacks and research freezes.',
    },
    simulationType: 'ai-winter-timeline',
    codeLab: {
      title: 'Hype Cycle Simulator',
      language: 'python',
      starterCode: `# Simulating Hype vs Delivery Cycle
def simulate_cycle(hype, delivery):
    if hype > delivery * 3:
        return "AI Winter Risk: High (Expectations unfulfilled)"
    return "Sustainable Growth"

print("1970 Status:", simulate_cycle(hype=90, delivery=15))
print("2026 Status:", simulate_cycle(hype=80, delivery=75))
`,
      expectedOutput: '1970 Status: AI Winter Risk: High (Expectations unfulfilled)\n2026 Status: Sustainable Growth',
      explanation: 'When delivery catches up to expectations, growth becomes sustainable.',
    },
    summary: ['AI has experienced two major "Winters" due to overpromising and hardware limitations.'],
    glossary: [{ term: 'AI Winter', definition: 'A period of reduced funding and interest in artificial intelligence research.' }],
    nextLessonId: 'ai-16',
  },
  {
    id: 'ai-16',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 16,
    difficulty: 'Beginner',
    title: {
      en: '16. Machine Learning: Shift From Handwritten Rules to Learning From Data',
      bn: '১৬. মেশিন লার্নিং: হাতে লেখা রুলস থেকে ডেটা ভিত্তিক শিক্ষার বিপ্লব',
    },
    subtitle: {
      en: 'Discover how statistics transformed AI in the 1990s and 2000s.',
      bn: '১৯৯০-এর দশকে স্ট্যাটিসটিক্স ও ডাটার সংযোগে মেশিন লার্নিংয়ের যুগান্তকারী পরিবর্তন।',
    },
    duration: '15 mins',
    objectives: [
      'Explain why Machine Learning succeeded where Symbolic AI failed.',
      'Understand statistical pattern recognition on large datasets.',
      'Distinguish Machine Learning as a subfield of Artificial Intelligence.',
    ],
    prerequisites: 'Lesson 15',
    explanation: {
      simple: {
        en: 'In the late 1990s, researchers stopped trying to code every rule manually. Instead, they used statistical math to let algorithms look at historical data and figure out probability patterns on their own!',
        bn: '১৯৯০-এর দশকের শেষের দিকে গবেষকরা রুলস লেখা বন্ধ করে দিয়ে পরিসংখ্যান ব্যবহার করে কম্পিউটারকে নিজেই প্যাটার্ন খুঁজতে দেন।',
      },
      analogy: {
        en: 'Instead of teaching a child 5,000 grammar rules, you let the child read 1,000 storybooks. The child naturally learns how sentences sound right!',
        bn: 'শিশুকে ব্যাকরণের নিয়ম মুখস্থ না করিয়ে ১০০০টি গল্পের বই পড়তে দিলে সে স্বয়ংক্রিয়ভাবে সঠিক বাক্য লিখতে শেখে।',
      },
      technical: {
        en: 'Machine Learning (ML) replaces hardcoded conditionals with parameterized probability models (e.g. Decision Trees, Support Vector Machines, Naive Bayes) optimized via loss minimization.',
        bn: 'মেশিন লার্নিং স্ট্যাটিসটিক্যাল মডেল (Decision Trees, SVM, Naive Bayes) ব্যবহার করে লস মিনিমাইজ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Machine Learning and AI are two completely different, unrelated technologies.',
        correction: 'Machine Learning is a specific SUBSET of AI that focuses on learning from data.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain to a friend why Machine Learning was a major breakthrough compared to expert systems.',
      modelAnswer: 'Because experts don’t have to manually write thousands of rules! Instead, you give the computer data, and it discovers its own rules automatically through statistics, handling unexpected cases much better.',
      checklist: ['Highlighted statistical rule discovery from data.'],
    },
    quiz: {
      question: 'What is the relationship between AI and Machine Learning (ML)?',
      options: [
        'ML is a subfield of AI that focuses on algorithms that learn from data.',
        'AI and ML are completely identical in every way.',
        'AI is a subfield of ML.',
        'ML replaces hardware while AI replaces software.',
      ],
      correctAnswer: 0,
      explanation: 'Machine Learning is a specialized branch/technique within the broader field of Artificial Intelligence.',
    },
    simulationType: 'ml-shift-demo',
    codeLab: {
      title: 'Simple Naive Bayes Probability Classifier',
      language: 'python',
      starterCode: `# Statistical Probability Learning Simulation
spam_words = {"free": 0.9, "winner": 0.85, "meeting": 0.05}

def predict_spam_prob(words):
    probs = [spam_words.get(w, 0.1) for w in words]
    return sum(probs) / len(probs)

print("Spam Prob for ['free', 'winner']:", predict_spam_prob(["free", "winner"]))
print("Spam Prob for ['meeting']:", predict_spam_prob(["meeting"]))
`,
      expectedOutput: "Spam Prob for ['free', 'winner']: 0.875\nSpam Prob for ['meeting']: 0.05",
      explanation: 'Statistical probabilities calculated from training data determine spam likelihood.',
    },
    summary: ['Machine Learning shifted AI from handcrafted rules to statistical pattern learning from datasets.'],
    glossary: [{ term: 'Machine Learning (ML)', definition: 'A branch of AI focused on building applications that learn and improve from data.' }],
    nextLessonId: 'ai-17',
  },
  {
    id: 'ai-17',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 17,
    difficulty: 'Beginner',
    title: {
      en: '17. Deep Learning, Backpropagation, and Breakthroughs of the 2010s',
      bn: '১৭. ডিপ লার্নিং, ব্যাকপ্রোপাগেশন এবং ২০১০-এর দশকের ঐতিহাসিক সাফল্য',
    },
    subtitle: {
      en: 'Understand multi-layered artificial neural networks and error correction.',
      bn: 'মাল্টি-লেয়ার নিউরাল নেটওয়ার্ক ও ব্যাকপ্রোপাগেশনের মাধ্যমে ভুল শুধরে নেওয়ার বিজ্ঞান।',
    },
    duration: '15 mins',
    objectives: [
      'Define Deep Learning as machine learning using deep neural networks.',
      'Explain Backpropagation intuitively as learning from prediction mistakes.',
      'Understand Geoffrey Hinton, Yann LeCun, and Yoshua Bengio’s pioneering contributions.',
    ],
    prerequisites: 'Lesson 16',
    explanation: {
      simple: {
        en: 'Deep Learning uses artificial neural networks with many layers ("deep"). Backpropagation is the algorithm that calculates how wrong a prediction was and sends correction signals backward through the layers to adjust parameters!',
        bn: 'ডিপ লার্নিং হলো অনেক স্তরের নিউরাল নেটওয়ার্ক। ব্যাকপ্রোপাগেশন হলো ভুল হিসাব করে পেছনের স্তরে সংকেত পাঠিয়ে নেটওয়ার্ককে শুধরে নেওয়ার পদ্ধতি।',
      },
      analogy: {
        en: 'Imagine an archery team standing in a line passing arrows forward. The shooter misses the target by 5 inches to the left. The shooter tells the person behind them, who tells the person behind them, so everyone slightly adjusts their stance for the next shot!',
        bn: 'তীরন্দাজদের লাইনে দাঁড়িয়ে লক্ষ্যভ্রষ্ট হলে পেছনের সবাইকে জানিয়ে অবস্থান কিছুটা শুধরে নেওয়ার মতো।',
      },
      technical: {
        en: 'Backpropagation applies the calculus Chain Rule to calculate partial derivatives of the loss function with respect to each weight (∂L/∂W), allowing Gradient Descent to update weights efficiently across deep hidden layers.',
        bn: 'ব্যাকপ্রোপাগেশন ক্যালকুলাসের চেইন রুল ব্যবহার করে নেটওয়ার্কের প্রতিটি ওয়েটের গ্রেডিয়েন্ট হিসাব করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Deep Neural Networks work exactly like biological human brain neurons.',
        correction: 'Artificial neurons are simplified mathematical abstractions (dot products + activation functions), far simpler than real biological synapses.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what "Backpropagation" does in a deep neural network.',
      modelAnswer: 'Backpropagation measures how wrong the network’s guess was at the end, and sends error feedback backwards through every layer, tweaking the weights so the network guesses better next time!',
      checklist: ['Mentioned error calculation at output.', 'Explained sending feedback backwards to adjust weights.'],
    },
    quiz: {
      question: 'What is the primary function of the Backpropagation algorithm in neural networks?',
      options: [
        'To speed up CPU clock speed.',
        'To calculate prediction error gradients and adjust weights backwards through the network.',
        'To compress images before saving them to disk.',
        'To convert text strings into binary code.',
      ],
      correctAnswer: 1,
      explanation: 'Backpropagation computes the error gradient for each weight to update the model.',
    },
    simulationType: 'backprop-demo',
    codeLab: {
      title: 'Simple Weight Update Simulation',
      language: 'python',
      starterCode: `# Weight Update via Gradient Error
weight = 3.0
target = 10.0
input_val = 2.0
learning_rate = 0.05

for step in range(5):
    prediction = weight * input_val
    error = prediction - target
    weight = weight - (learning_rate * error * input_val)
    print(f"Step {step+1}: Pred = {prediction:.2f}, Updated Weight = {weight:.2f}")
`,
      expectedOutput: 'Step 1: Pred = 6.00, Updated Weight = 3.40\nStep 2: Pred = 6.80, Updated Weight = 3.72\nStep 3: Pred = 7.44, Updated Weight = 3.98\nStep 4: Pred = 7.95, Updated Weight = 4.18\nStep 5: Pred = 8.36, Updated Weight = 4.35',
      explanation: 'Each step moves the weight closer to the target value 5.0 (since 5.0 * 2.0 = 10.0).',
    },
    summary: ['Deep Learning stacks multiple neural network layers; Backpropagation tunes their weights based on error gradients.'],
    glossary: [
      { term: 'Deep Learning', definition: 'A subset of Machine Learning using artificial neural networks with multiple hidden layers.' },
      { term: 'Backpropagation', definition: 'The fundamental algorithm used to calculate error gradients and update neural network weights.' },
    ],
    nextLessonId: 'ai-18',
  },
  {
    id: 'ai-18',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 18,
    difficulty: 'Beginner',
    title: {
      en: '18. ImageNet, AlexNet, and Why GPUs Changed Deep Learning',
      bn: '১৮. ইমেজনেট, অ্যালেক্সনেট এবং জিপিউ (GPU) যেভাবে ডিপ লার্নিং বদলে দিল',
    },
    subtitle: {
      en: 'The 2012 watershed moment that ignited the modern AI revolution.',
      bn: '২০১২ সালের সেই ঐতিহাসিক মুহূর্ত যা বিশ্বজুড়ে নতুন AI বিপ্লবের সূচনা করেছিল।',
    },
    duration: '15 mins',
    objectives: [
      'Explain Fei-Fei Li’s creation of the ImageNet dataset (1 million+ labeled images).',
      'Understand Alex Krizhevsky and Geoffrey Hinton’s AlexNet architecture (2012).',
      'Explain why GPUs (Graphics Processing Units) outperformed CPUs for matrix math.',
    ],
    prerequisites: 'Lesson 17',
    explanation: {
      simple: {
        en: 'In 2012, a Convolutional Neural Network called AlexNet crushed all competitors in the ImageNet image recognition contest by a massive 10.8% margin! The secret? AlexNet was trained on NVIDIA graphics cards (GPUs), proving deep learning could scale rapidly.',
        bn: '২০১২ সালে অ্যালেক্সনেট নামের একটি নিউরাল নেটওয়ার্ক ইমেজনেট প্রতিযোগিতায় সবাইকে হারিয়ে জয়ী হয়। এর রহস্য ছিল NVIDIA জিপিউ-এর ব্যবহার।',
      },
      analogy: {
        en: 'A CPU is like a genius math professor who solves 1 complex problem at a time. A GPU is like 3,000 high school students solving 3,000 simple addition problems at the exact same instant! Neural networks need parallel simple additions.',
        bn: 'সিপিইউ হলো একজন গণিত অধ্যাপক যিনি একবারে ১টি জটিল অঙ্ক করেন। আর জিপিউ হলো ৩০০০ শিক্ষার্থী যারা একই সেকেন্ডে ৩০০০টি সহজ যোগ করতে পারে।',
      },
      technical: {
        en: 'AlexNet used 60 million parameters across 5 Convolutional layers and 3 Fully Connected layers. Training on 2 NVIDIA GTX 580 GPUs accelerated matrix multiplications by over 50x compared to CPUs.',
        bn: 'অ্যালেক্সনেট ৬০ মিলিয়ন প্যারামিটার জিপিউ-এর সমান্তরাল প্রক্রিয়াকরণের মাধ্যমে দ্রুত ট্রেইন করেছিল।',
      },
    },
    misconceptions: [
      {
        misconception: 'GPUs were originally designed specifically for AI research.',
        correction: 'GPUs were originally invented for 3D video game graphics rendering (pixels/triangles), but researchers realized graphics math is identical to neural network matrix math!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why did graphics cards (GPUs) become the engine of the AI boom in 2012?',
      modelAnswer: 'Because 3D video games require calculating thousands of pixel colors simultaneously, which uses the exact same parallel matrix math that neural networks need to process millions of weights at once!',
      checklist: ['Mentioned 3D video games.', 'Connected parallel graphics math to neural network matrix operations.'],
    },
    quiz: {
      question: 'Why did the 2012 AlexNet victory in ImageNet mark a turning point for AI?',
      options: [
        'It was the first time AI wrote a complete novel.',
        'It proved that Deep Learning trained on GPUs dramatically outperforms traditional computer vision.',
        'It allowed computers to operate without electricity.',
        'It proved CPUs are superior to GPUs for AI training.',
      ],
      correctAnswer: 1,
      explanation: 'AlexNet demonstrated that GPU-accelerated deep neural networks drastically beat existing algorithms in computer vision.',
    },
    simulationType: 'alexnet-gpu-demo',
    codeLab: {
      title: 'CPU vs Parallel Execution Time Demo',
      language: 'python',
      starterCode: `import time

# Sequential CPU style loop
start = time.time()
seq_sum = sum([i * 2 for i in range(1000000)])
cpu_time = time.time() - start

print(f"Sequential Computation Time: {cpu_time:.4f} seconds")
print("Parallel GPU execution completes thousands of these instantly!")
`,
      expectedOutput: 'Sequential Computation Time: 0.0',
      explanation: 'Parallel GPU execution performs thousands of array operations simultaneously.',
    },
    summary: ['Fei-Fei Li’s ImageNet dataset + AlexNet + NVIDIA GPUs launched the modern AI era in 2012.'],
    glossary: [
      { term: 'ImageNet', definition: 'A massive visual dataset of over 14 million labeled images used in AI benchmarking.' },
      { term: 'GPU', definition: 'Graphics Processing Unit designed for fast parallel mathematical computations.' },
    ],
    nextLessonId: 'ai-19',
  },
  {
    id: 'ai-19',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 19,
    difficulty: 'Beginner',
    title: {
      en: '19. Attention Is All You Need: Transformers and the Modern AI Era',
      bn: '১৯. "Attention Is All You Need": ট্রান্সফরমার ও আধুনিক AI যুগ',
    },
    subtitle: {
      en: 'Discover the groundbreaking 2017 Google paper behind ChatGPT, Claude, and Gemini.',
      bn: '২০১৭ সালের গুগলের সেই গবেষণা পত্র যা চ্যাটজিপিটি ও আধুনিক এআই মডেলের ভিত্তি।',
    },
    duration: '15 mins',
    objectives: [
      'Understand the significance of the 2017 "Attention Is All You Need" paper by Vaswani et al.',
      'Explain how the Self-Attention mechanism allows models to process entire sequences in parallel.',
      'Contrast Transformers with sequential Recurrent Neural Networks (RNNs).',
    ],
    prerequisites: 'Lesson 18',
    explanation: {
      simple: {
        en: 'Before 2017, AI processed text one word at a time (like reading with a finger). The Transformer architecture introduced "Self-Attention", allowing the AI to look at ALL words in a document simultaneously and connect related ideas instantly!',
        bn: '২০১৭ সালের আগে AI এক এক শব্দ ধরে পড়ত। ট্রান্সফরমার প্রযুক্তি আসার পর AI একবারে একটি ডকুমেন্টের সব শব্দ দেখে সম্পর্ক স্থাপন করতে সক্ষম হয়।',
      },
      analogy: {
        en: 'Imagine reading a mystery novel word by word vs having a superhero vision that highlights how the word "bank" in chapter 1 relates to "river" in chapter 10 at a single glance!',
        bn: 'ওয়ার্ড বাই ওয়ার্ড পড়ার বদলে স্পেশাল দৃষ্টি দিয়ে পুরো অধ্যায়ের বাক্যের সাথে সম্পর্ক এক পলকে দেখার মতো।',
      },
      technical: {
        en: 'Transformers eliminate sequential RNN recurrence by using Multi-Head Self-Attention layers: Attention(Q, K, V) = softmax((QK^T) / sqrt(d_k)) * V. This enables massive GPU parallelization across long token contexts.',
        bn: 'ট্রান্সফরমার সেলফ-এটেনশনের মাধ্যমে Q, K, V ম্যাট্রিক্স রূপান্তর করে পুরো টেক্সট সমান্তরালে প্রসেস করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Transformers are only used for text translation and text generation.',
        correction: 'Transformer architectures now power Vision Transformers (images), Whisper (speech), AlphaFold (protein folding), and multimodal models.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why were Transformers a giant leap forward compared to older recurrent networks (RNNs)?',
      modelAnswer: 'Older RNNs read text word-by-word sequentially, which was slow and forgot early words. Transformers process all words at once using self-attention, making training massively faster on GPUs and allowing models to understand long context!',
      checklist: ['Compared word-by-word reading with parallel self-attention.', 'Mentioned speed on GPUs and long context.'],
    },
    quiz: {
      question: 'What key innovation was introduced in the 2017 "Attention Is All You Need" paper?',
      options: [
        'The Mechanical Babbage Engine',
        'The Transformer Architecture and Self-Attention Mechanism',
        'The Transistor Microchip',
        'The Floppy Disk Storage Drive',
      ],
      correctAnswer: 1,
      explanation: 'The paper introduced the Transformer architecture, which powers nearly all modern Large Language Models.',
    },
    simulationType: 'transformer-attention-demo',
    codeLab: {
      title: 'Attention Matrix Weight Calculator',
      language: 'python',
      starterCode: `# Simple Dot Product Attention Concept
import math

query = [1.0, 2.0]
key1 = [1.0, 2.0]  # Related word
key2 = [-1.0, 0.5] # Unrelated word

def dot_product(a, b):
    return sum(x * y for x, y in zip(a, b))

score1 = dot_product(query, key1) / math.sqrt(len(query))
score2 = dot_product(query, key2) / math.sqrt(len(query))

print(f"Attention Score (Word 1 Related): {score1:.2f}")
print(f"Attention Score (Word 2 Unrelated): {score2:.2f}")
`,
      expectedOutput: 'Attention Score (Word 1 Related): 3.54\nAttention Score (Word 2 Unrelated): 0.00',
      explanation: 'Higher dot-product scores mean the Transformer focuses more attention on related words.',
    },
    summary: ['The 2017 Transformer architecture introduced parallel self-attention, unlocking today’s LLM boom.'],
    glossary: [
      { term: 'Transformer', definition: 'A deep learning architecture relying on self-attention mechanisms.' },
      { term: 'Self-Attention', definition: 'A mechanism relating different positions of a single sequence to compute a representation.' },
    ],
    nextLessonId: 'ai-20',
  },
  {
    id: 'ai-20',
    track: 'ai',
    chapter: 2,
    chapterTitle: 'Chapter 2: The Evolution of AI and Why It Is Booming Now',
    order: 20,
    difficulty: 'Beginner',
    title: {
      en: '20. Chapter 2 Project: The Convergence of Data, Compute, and Algorithms',
      bn: '২০. ২য় অধ্যায়ের প্রজেক্ট: ডেটা, কম্পিউট, অ্যালগরিদম ও বিনিয়োগের ত্রিমুখী মিলন',
    },
    subtitle: {
      en: 'Synthesize the historical forces that created the modern 2020s AI boom.',
      bn: 'কেন এই ২০২০-র দশকেই AI-এর মহাবিকাশ ঘটলো তা বিশ্লেষণ করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Examine the 4 pillars of the AI boom: Massive Data, Scalable Compute (GPUs/TPUs), Transformer Algorithms, and Capital Investment.',
      'Analyze an interactive historical timeline from 1950 to the present.',
      'Complete Chapter 2 milestone assessment and earn your Chapter 2 Badge!',
    ],
    prerequisites: 'Lessons 11 to 19 of Chapter 2',
    explanation: {
      simple: {
        en: 'AI is not booming today simply because "computers got faster." It is booming because four massive streams collided at the exact same time: 1) Billions of web documents (Data), 2) GPU Clusters (Compute), 3) Transformers (Algorithms), and 4) Billions in Investment!',
        bn: 'AI আজ শুধু ফাস্ট কম্পিউটারের জন্য নয়, বরং ৪টি মূল বিষয়ের মিলনে বিপ্লব ঘটিয়েছে: ডেটা, জিপিউ কম্পিউট, ট্রান্সফরমার অ্যালগরিদম ও ইনভেস্টমেন্ট।',
      },
      analogy: {
        en: 'Think of launching a rocket. You need: 1) Fuel (Data), 2) Engine (Compute), 3) Aerodynamic Design (Algorithms), and 4) Mission Funding (Capital). Without any one of these 4, the rocket stays on the ground!',
        bn: 'রকেট লঞ্চ করার মতো: জ্বালানি (ডেটা), ইঞ্জিন (কম্পিউট), ডিজাইন (অ্যালগরিদম) ও ফান্ডিং। যেকোনো একটি বাদ পড়লে রকেট উড়বে না।',
      },
      technical: {
        en: 'The 4-factor convergence matrix: Web-scale digitization (petabytes of tokenized text) + Massive GPU parallel clusters + O(N^2) Self-Attention Transformer scaling laws + Multi-billion dollar infrastructure investment.',
        bn: '৪টি মূল ড্রাইভার: ওয়েব স্কেল ডেটা + জিপিউ ক্লাস্টার + ট্রান্সফরমার স্কেলিং ল + বড় মূলধন।',
      },
    },
    misconceptions: [
      {
        misconception: 'Generative AI happened suddenly overnight in late 2022 with no prior history.',
        correction: 'ChatGPT was the result of 70 years of progressive research, from Turing and Dartmouth to Backprop, AlexNet, and Transformers.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the 4 main reasons why the AI boom happened now rather than in 1990.',
      modelAnswer: '1. Data: The internet provided billions of digitized texts and images.\n2. Compute: Modern GPUs process billions of calculations simultaneously.\n3. Algorithms: Transformers allow parallel processing of long contexts.\n4. Investment: Capital allowed building massive GPU data centers.',
      checklist: ['Mentioned Data, Compute, Algorithms (Transformers), and Investment.'],
    },
    quiz: {
      question: 'Which 4 factors converged to create the modern 2020s Artificial Intelligence boom?',
      options: [
        'Floppy disks, dial-up internet, basic calculators, and printed manuals.',
        'Big Data, GPU/TPU Compute, Transformer Algorithms, and High Investment.',
        'Nuclear energy, quantum chips, steam engines, and paper archives.',
        'Monochrome screens, mechanical gears, assembly code, and landline phones.',
      ],
      correctAnswer: 1,
      explanation: 'The 4 pillars of the modern AI boom are Big Data, High-Performance GPU Compute, Transformer Architectures, and Capital Investment.',
    },
    simulationType: 'chapter2-capstone-demo',
    codeLab: {
      title: 'Chapter 2 Four-Pillar Convergence Calculator',
      language: 'python',
      starterCode: `# 4-Pillar AI Boom Readiness Evaluation
pillars = {
    "Data (Internet Tokens)": 10,
    "Compute (GPU Clusters)": 10,
    "Algorithm (Transformers)": 10,
    "Capital Investment": 10
}

score = sum(pillars.values()) / 40 * 100
print(f"AI Boom Readiness Score: {score:.0f}%")
if score == 100:
    print("All 4 pillars active! Era of Generative AI unlocked.")
`,
      expectedOutput: 'AI Boom Readiness Score: 100%\nAll 4 pillars active! Era of Generative AI unlocked.',
      explanation: 'Congratulations! You have completed Chapter 2 of the AI Academy!',
    },
    summary: [
      'Chapter 2 Complete! You traced AI from 17th-century calculators to 2020s Generative AI.',
      'You learned about Dartmouth 1956, Expert Systems, and AI Winters.',
      'You understand why AlexNet (2012) and Transformers (2017) changed everything.',
      'You can explain the 4-factor convergence powering modern AI.',
    ],
    glossary: [{ term: 'Scaling Laws', definition: 'Empirical relationships showing model performance improves predictably with compute, data, and parameters.' }],
    nextLessonId: 'ai-21',
  },
];
