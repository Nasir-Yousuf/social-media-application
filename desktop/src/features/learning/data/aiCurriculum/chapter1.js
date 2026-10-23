// Chapter 1: Understanding Artificial Intelligence (Lessons 1-10)
// Designed with the Feynman Technique, First Principles, and interactive activities.

export const CHAPTER_1_LESSONS = [
  {
    id: 'ai-1',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 1,
    difficulty: 'Beginner',
    title: {
      en: '1. What Is Artificial Intelligence? Understanding AI Through Everyday Life',
      bn: '১. কৃত্রিম বুদ্ধিমত্তা (AI) কী? দৈনন্দিন জীবনের মাধ্যমে AI বোঝা',
    },
    subtitle: {
      en: 'Discover how machines perceive, learn, and make decisions in your daily life.',
      bn: 'যন্ত্র কীভাবে শেখে এবং সিদ্ধান্ত নেয় তা সহজ উদাহরণের মাধ্যমে জানুন।',
    },
    duration: '15 mins',
    objectives: [
      'Define Artificial Intelligence in plain, beginner-friendly language.',
      'Identify 5 everyday examples of AI in smartphone apps, recommendations, and search.',
      'Explain the core difference between human intelligence and machine prediction.',
      'Use the Feynman Technique to explain AI to a non-technical friend.',
    ],
    prerequisites: 'No prior math or coding experience required!',
    explanation: {
      simple: {
        en: 'Artificial Intelligence (AI) is when a computer system is designed to perform tasks that normally require human intelligence—such as recognizing faces, understanding spoken words, learning from past experiences, and making smart decisions.',
        bn: 'কৃত্রিম বুদ্ধিমত্তা (AI) হলো কম্পিউটারের এমন এক প্রযুক্তি যা মানুষের চিন্তাশক্তি, মুখমণ্ডল চেনা, ভাষা বোঝা এবং অভিজ্ঞতা থেকে শেখার ক্ষমতাকে অনুকরণ করে।',
      },
      analogy: {
        en: 'Imagine teaching a puppy to sit. You don’t open up the puppy’s brain and rewrite its nerve cells. Instead, you show it treats, repeat the command "Sit", and reward it when it gets it right. Over time, the puppy recognizes the pattern. AI systems learn in a similar way—by seeing millions of examples and adjusting until they recognize the pattern!',
        bn: 'একটি পোষা কুকুরছানাকে বসতে শেখানোর কথা ভাবুন। আপনি কিন্তু তার মগজ খুলে স্নায়ু বদলে দেন না। আপনি তাকে বারবার নির্দেশ দেন এবং সঠিক কাজ করলে পুরস্কার দেন। কুকুরটি ধীরে ধীরে প্যাটার্ন বুঝে যায়। AI ঠিক একইভাবে লাখ লাখ উদাহরণ দেখে শেখে।',
      },
      technical: {
        en: 'Technically, modern AI relies on algorithms that take inputs (such as numbers, pixels, or words), process them through mathematical functions with adjustable parameters (weights and biases), and produce predictions or classifications as outputs. When feedback is provided, the parameters update to minimize prediction errors.',
        bn: 'কারিগরি ভাষায়, আধুনিক AI গানিতিক অ্যালগরিদম ও প্যারামিটার (weights & biases) ব্যবহার করে ডেটা বিশ্লেষণ করে নির্ভুল পূর্বাভাস তৈরি করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'AI systems are conscious and think like human beings.',
        correction: 'Modern AI does not have feelings, consciousness, or self-awareness. It performs complex mathematical pattern matching at lightning speed.',
      },
      {
        misconception: 'AI can never make mistakes because it is run on computers.',
        correction: 'AI models predict outputs based on data patterns. If the data is noisy, incomplete, or biased, the AI will make mistakes.',
      },
    ],
    feynmanChallenge: {
      prompt: 'In 2-3 sentences, explain to a 10-year-old child what Artificial Intelligence is without using the words "algorithm" or "computation".',
      modelAnswer: 'Artificial Intelligence is like giving a computer a super-trained brain that learns by looking at thousands of pictures or examples. Just like you learned to spot a cat after seeing many cats, the computer learns to recognize things and help people solve problems!',
      checklist: [
        'Used a clear, simple real-world analogy.',
        'Avoided technical jargon like "algorithm" or "parameters".',
        'Explained that AI learns from examples.',
      ],
    },
    quiz: {
      question: 'Which of the following best describes how modern AI systems learn?',
      options: [
        'A human programmer manually writes a rule for every single scenario.',
        'The computer analyzes thousands of examples and adjusts its internal numbers to recognize patterns.',
        'The computer becomes self-aware and thinks like a human brain.',
        'The computer guesses randomly until it gets lucky every time.',
      ],
      correctAnswer: 1,
      explanation: 'Modern AI learns by analyzing large datasets of examples and iteratively refining its internal numerical weights to minimize prediction errors.',
    },
    simulationType: 'ai-intro-demo',
    codeLab: {
      title: 'Python Rule-Based vs AI Predictor Simulation',
      language: 'python',
      starterCode: `# Traditional Rule vs Simple AI Predictor
def predict_weather_rule(temp, humidity):
    if temp > 30 and humidity > 70:
        return "Hot & Humid Rain Risk"
    return "Pleasant"

# Test prediction
result = predict_weather_rule(32, 85)
print("Rule Output:", result)
`,
      expectedOutput: 'Rule Output: Hot & Humid Rain Risk',
      explanation: 'Traditional code uses fixed IF/ELSE conditions written by humans. AI models learn these decision patterns automatically from data!',
    },
    summary: [
      'AI enables machines to learn patterns and make intelligent predictions.',
      'Everyday apps like Netflix, Google Maps, and FaceID use narrow AI.',
      'AI is not magic or consciousness; it is mathematical pattern recognition on data.',
      'Traditional programming requires handwritten rules; AI learns rules from data.',
    ],
    glossary: [
      { term: 'Artificial Intelligence (AI)', definition: 'Software systems designed to perform tasks that typically require human cognition.' },
      { term: 'Pattern Recognition', definition: 'The ability of an algorithm to identify recurring features or structures in data.' },
      { term: 'Prediction', definition: 'The output generated by an AI model when given new, unseen input data.' },
    ],
    nextLessonId: 'ai-2',
  },
  {
    id: 'ai-2',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 2,
    difficulty: 'Beginner',
    title: {
      en: '2. AI vs. Traditional Programming: How Are They Different?',
      bn: '২. AI বনাম ট্র্যাডিশনাল প্রোগ্রামিং: পার্থক্য কোথায়?',
    },
    subtitle: {
      en: 'Shift your mindset from writing explicit rules to training models with data.',
      bn: 'হাতে কোড লিখে রুল দেওয়া বনাম ডেটা দিয়ে মডেল ট্রেইন করার পার্থক্য জানুন।',
    },
    duration: '15 mins',
    objectives: [
      'Compare the paradigm shift from Traditional Code (Data + Rules = Output) to Machine Learning (Data + Output = Rules).',
      'Understand why tasks like spam detection or image recognition are nearly impossible with handwritten IF/ELSE statements.',
      'Identify when to use traditional software vs when to use AI.',
    ],
    prerequisites: 'Lesson 1: What is AI?',
    explanation: {
      simple: {
        en: 'In traditional programming, a developer writes exact step-by-step instructions (rules). In Artificial Intelligence, we give the computer data and desired answers, and the computer writes the rules for us!',
        bn: 'ট্র্যাডিশনাল প্রোগ্রামিংয়ে প্রোগ্রামার নিজে হাতে সব নিয়ম বা শর্ত লিখে দেয়। কিন্তু AI-তে আমরা ডেটা ও উত্তর দিয়ে দিই, আর কম্পিউটার নিজে থেকেই নিয়ম তৈরি করে নেয়।',
      },
      analogy: {
        en: 'Traditional programming is like following a printed recipe to bake a cake. AI is like tasting 100 delicious cakes, analyzing the ingredients, and figuring out the secret recipe yourself!',
        bn: 'ট্র্যাডিশনাল প্রোগ্রামিং হলো রেসিপি বই দেখে হুবহু রান্না করা। আর AI হলো ১০০টি কেক খেয়ে পরীক্ষা করে নিজেই সেই গোপন রেসিপি আবিষ্কার করা!',
      },
      technical: {
        en: 'Classical paradigm: Input Data + Handcrafted Rules -> Output. Machine Learning paradigm: Input Data + Target Labels -> Learned Parameters (Model). The learned model can then accept new Input Data -> Predicted Output.',
        bn: 'ক্লাসিক্যাল প্যারাডাইম: ডেটা + নিয়ম -> আউটপুট। মেশিন লার্নিং প্যারাডাইম: ডেটা + টার্গেট লেবেল -> মডেল প্যারামিটার (নিয়ম)।',
      },
    },
    misconceptions: [
      {
        misconception: 'AI will replace all traditional software development.',
        correction: 'Traditional software is faster, 100% deterministic, and ideal for banking, accounting, and precise calculations. AI is best for perceptual and probabilistic tasks.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the difference between traditional code and AI using an example of a spam email filter.',
      modelAnswer: 'A traditional spam filter checks if an email contains specific hardcoded words like "WIN FREE MONEY". An AI spam filter reads millions of emails, notices subtle patterns of suspicious phrasing, sender behavior, and formatting, and learns automatically how to spot spam even if new trick words are used!',
      checklist: [
        'Contrasted handwritten keyword rules with automated pattern learning.',
        'Explained how AI adapts to new examples without rewriting code.',
      ],
    },
    quiz: {
      question: 'What is the primary input required to create a Machine Learning model?',
      options: [
        'Thousands of handwritten IF/ELSE statements.',
        'Quality data along with example targets or signals.',
        'A quantum supercomputer chip.',
        'A pre-written manual with step-by-step answers.',
      ],
      correctAnswer: 1,
      explanation: 'Machine Learning requires quality data (inputs) and target signals/labels so the algorithm can discover statistical patterns.',
    },
    simulationType: 'ai-paradigm-demo',
    codeLab: {
      title: 'Comparing Rule-Based vs Learned Decision',
      language: 'python',
      starterCode: `# Traditional Rules vs Learned Probability
def classify_email_rules(text):
    text = text.lower()
    if "win cash" in text or "free prize" in text:
        return "Spam"
    return "Inbox"

print("Traditional Result:", classify_email_rules("Claim your free prize now!"))
`,
      expectedOutput: 'Traditional Result: Spam',
      explanation: 'Rules break when spammers spell it "FR33 PR!ZE". Machine learning models look at numerical word relationships instead of exact string matches!',
    },
    summary: [
      'Traditional programming: Developers write explicit rules for data.',
      'Machine Learning: Computers derive rules automatically from data.',
      'AI excels at complex, messy tasks like image recognition, translation, and speech.',
      'Deterministic tasks (like tax calculation) should still use traditional code.',
    ],
    glossary: [
      { term: 'Deterministic', definition: 'A system that always produces the exact same output for a given input.' },
      { term: 'Probabilistic', definition: 'A system that operates on likelihoods and probabilities rather than absolute guarantees.' },
    ],
    nextLessonId: 'ai-3',
  },
  {
    id: 'ai-3',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 3,
    difficulty: 'Beginner',
    title: {
      en: '3. Narrow AI, General AI, and Superintelligence',
      bn: '৩. ন্যারো AI, জেনারেল AI (AGI) এবং সুপার-ইন্টেলিজেন্স',
    },
    subtitle: {
      en: 'Understand the three major levels of Artificial Intelligence capability.',
      bn: 'কৃত্রিম বুদ্ধিমত্তার ৩টি প্রধান পর্যায় ও তাদের ক্ষমতা সম্পর্কে জানুন।',
    },
    duration: '15 mins',
    objectives: [
      'Define Artificial Narrow Intelligence (ANI), Artificial General Intelligence (AGI), and Artificial Superintelligence (ASI).',
      'Recognize that all existing real-world AI systems today are Narrow AI.',
      'Analyze the technical hurdles preventing Narrow AI from becoming AGI.',
    ],
    prerequisites: 'Lesson 2: AI vs Traditional Programming',
    explanation: {
      simple: {
        en: 'AI is categorized into three levels: 1) Narrow AI (spends its entire life excelling at one specific task), 2) General AI (has human-like versatility across any field), and 3) Superintelligence (surpasses all combined human capabilities).',
        bn: 'AI ৩টি পর্যায়ে বিভক্ত: ১) Narrow AI (নির্দিষ্ট একটি কাজে পারদর্শী), ২) General AI বা AGI (মানুষের মতো বহুমুখী ক্ষমতাসম্পন্ন), এবং ৩) Superintelligence (মানুষের চেয়ে বহুগুণ বুদ্ধিমান)।',
      },
      analogy: {
        en: 'A world-champion chess AI (Narrow AI) can crush any human in chess, but it cannot write an essay, drive a car, or make a cup of tea. A human (General AI) can learn to play chess, drive, write stories, and adapt to new situations easily.',
        bn: 'একটি বিশ্বজয়ী চেস AI দাবা খেলায় মানুষকে হারাতে পারলেও সে গাড়ি চালাতে বা চা বানাতে পারে না। কিন্তু একজন মানুষ (AGI) দাবা খেলা, গাড়ি চালানো এবং গল্প লেখা—সবই শিখতে পারে।',
      },
      technical: {
        en: 'ANI models optimize a specialized loss function for a single distribution. AGI implies cross-domain transfer learning, reasoning, planning, and zero-shot adaptation comparable to human cognition. ASI represents hypothetical systems exceeding human performance across all cognitive tasks.',
        bn: 'ANI একটি নির্দিষ্ট কাজের জন্য তৈরি। AGI স্বয়ংক্রিয়ভাবে যেকোনো নতুন কাজে মানিয়ে নিতে পারে।',
      },
    },
    misconceptions: [
      {
        misconception: 'ChatGPT and Gemini are General AIs (AGI).',
        correction: 'No, Large Language Models are advanced Narrow AI systems trained to predict text tokens. They do not possess general reasoning, human agency, or multi-domain real-world embodiment.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain why a chess computer that beats the world champion is still considered "Narrow AI".',
      modelAnswer: 'Because it is a specialist that only understands chess rules and chess board states! If you ask it to translate a sentence, diagnose an illness, or recognize a dog photo, it completely fails because its program cannot adapt outside its single narrow domain.',
      checklist: [
        'Highlighted domain specificity.',
        'Explained inability to transfer knowledge to other tasks.',
      ],
    },
    quiz: {
      question: 'Which type of AI represents ALL current operational AI systems on Earth today?',
      options: [
        'Artificial General Intelligence (AGI)',
        'Artificial Narrow Intelligence (ANI)',
        'Artificial Superintelligence (ASI)',
        'Conscious Mechanical Intelligence',
      ],
      correctAnswer: 1,
      explanation: '100% of currently existing AI applications—from facial recognition to LLMs—are Narrow AI (ANI) systems specialized for specific data domains.',
    },
    simulationType: 'ai-levels-demo',
    codeLab: {
      title: 'Domain-Specific AI Capability Test',
      language: 'python',
      starterCode: `# Simulating Narrow AI vs General Capability
class NarrowChessAI:
    def evaluate_board(self, board_state):
        return "Best Move: e4"

ai = NarrowChessAI()
print("Chess Test:", ai.evaluate_board("start"))
# What happens if we ask for weather forecast?
try:
    print(ai.predict_weather())
except AttributeError:
    print("Error: Narrow AI cannot perform tasks outside its domain!")
`,
      expectedOutput: 'Chess Test: Best Move: e4\nError: Narrow AI cannot perform tasks outside its domain!',
      explanation: 'Narrow AI lacks multi-domain transfer learning without explicit retraining.',
    },
    summary: [
      'Narrow AI (ANI): Specialized for one task (spam filter, medical image scanner, chess bot).',
      'General AI (AGI): Hypothetical AI with human-level cognitive flexibility across all fields.',
      'Superintelligence (ASI): Hypothetical AI far smarter than all human minds combined.',
      'All AI today is Narrow AI.',
    ],
    glossary: [
      { term: 'ANI (Narrow AI)', definition: 'AI designed and trained for a specific, focused task.' },
      { term: 'AGI (General AI)', definition: 'Hypothetical AI capable of understanding and learning any intellectual task a human can.' },
      { term: 'Transfer Learning', definition: 'Applying knowledge gained from one problem domain to a different problem domain.' },
    ],
    nextLessonId: 'ai-4',
  },
  {
    id: 'ai-4',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 4,
    difficulty: 'Beginner',
    title: {
      en: '4. How AI Already Exists in Search, Maps, Recommendations, and Phones',
      bn: '৪. সার্চ, ম্যাপ, রেকমেন্ডেশন ও ফোনে AI যেভাবে কাজ করছে',
    },
    subtitle: {
      en: 'Explore the invisible AI algorithms powering your everyday digital life.',
      bn: 'আপনার স্মার্টফোন ও প্রিয় অ্যাপে লুকিয়ে থাকা AI প্রযুক্তির গোপন রহস্য।',
    },
    duration: '15 mins',
    objectives: [
      'Identify how Search (RankBrain), Maps (traffic prediction), and Social Media feeds use AI.',
      'Understand how recommendation engines predict your preferences.',
      'Examine on-device AI hardware (NPUs) in modern smartphones.',
    ],
    prerequisites: 'Lesson 1: What is AI?',
    explanation: {
      simple: {
        en: 'You use AI dozens of times every day without noticing! When YouTube suggests a video, when Google Maps re-routes you around traffic, or when your phone camera enhances a photo—AI is working silently behind the scenes.',
        bn: 'প্রতিদিন আপনি না বুঝেই বহুবার AI ব্যবহার করছেন! ইউটিউবের ভিডিও সাজেশন, গুগল ম্যাপসের ট্রাফিক পূর্বাভাস কিংবা ফোনের ক্যামেরা টিউনিং—সবই AI করে থাকে।',
      },
      analogy: {
        en: 'A recommendation engine is like a friendly local librarian who observes every book you check out. Over time, the librarian notices you love sci-fi novels and hands you a new book you’ve never heard of—predicting with 95% accuracy that you will love it!',
        bn: 'রেকমেন্ডেশন ইঞ্জিন হলো একজন দক্ষ লাইব্রেরিয়ানের মতো যিনি আপনার পছন্দের বই দেখে সঠিক পূর্বাভাস দিয়ে নতুন বই বেছে দেন।',
      },
      technical: {
        en: 'Recommendation systems use collaborative filtering and matrix factorization to find patterns among millions of users and items. Map routing uses graph search combined with real-time speed predictions trained on historical GPS telemetry.',
        bn: 'রেকমেন্ডেশন সিস্টেম কোলাবোরেটিভ ফিল্টারিং ও ম্যাট্রিক্স মেথড দিয়ে ব্যবহারকারীর পছন্দ অনুমান করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Social media algorithms read your mind or listen to your thoughts.',
        correction: 'Algorithms don’t read minds; they calculate mathematical similarity based on millions of user actions (watch time, clicks, pauses, scrolls).',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain how Google Maps predicts your arrival time (ETA) using historical and real-world data.',
      modelAnswer: 'Google Maps collects anonymous speed and location data from thousands of drivers on the road right now. It compares current speed with historical patterns for that exact time of day to predict traffic flow and calculate your estimated arrival time!',
      checklist: [
        'Mentioned real-time user data signals.',
        'Explained historical pattern matching.',
      ],
    },
    quiz: {
      question: 'How does a recommendation algorithm predict which video you might want to watch next?',
      options: [
        'It selects videos completely at random to test your patience.',
        'It compares your watch history with millions of other users with similar viewing habits.',
        'A human editor selects videos specifically for your account every morning.',
        'It reads your thoughts through the smartphone screen.',
      ],
      correctAnswer: 1,
      explanation: 'Collaborative filtering algorithms compare your past actions with pattern clusters from millions of other users.',
    },
    simulationType: 'ai-apps-demo',
    codeLab: {
      title: 'Simple Collaborative Filtering Predictor',
      language: 'python',
      starterCode: `# Simple Recommendation Matching Engine
users_likes = {
    "Alice": ["Python", "AI", "Gaming"],
    "Bob": ["Python", "AI", "Design"],
    "Charlie": ["Cooking", "Gardening"]
}

def recommend_for_user(target_user, current_user="Alice"):
    shared = set(users_likes[target_user]).intersection(set(users_likes[current_user]))
    similarity_score = len(shared) / len(users_likes[current_user])
    return similarity_score

print("Similarity with Bob:", recommend_for_user("Bob"))
print("Similarity with Charlie:", recommend_for_user("Charlie"))
`,
      expectedOutput: 'Similarity with Bob: 0.6666666666666666\nSimilarity with Charlie: 0.0',
      explanation: 'Similarity scores help recommend content from users with matching interest patterns.',
    },
    summary: [
      'Search engines use AI (RankBrain) to understand search intent beyond keywords.',
      'Navigation apps use predictive models trained on live GPS speed streams.',
      'Recommendation engines use collaborative filtering to predict user affinity.',
      'Smartphones use Neural Processing Units (NPUs) for local face recognition and photo enhancement.',
    ],
    glossary: [
      { term: 'Collaborative Filtering', definition: 'A recommendation technique based on matching user behavior patterns across large user groups.' },
      { term: 'NPU (Neural Processing Unit)', definition: 'Specialized hardware designed to accelerate machine learning tasks directly on mobile devices.' },
    ],
    nextLessonId: 'ai-5',
  },
  {
    id: 'ai-5',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 5,
    difficulty: 'Beginner',
    title: {
      en: '5. A Brief History of Human Attempts to Create Intelligent Machines',
      bn: '৫. বুদ্ধিমান যন্ত্র তৈরির মানব ইতিহাসের সংক্ষিপ্ত যাত্রাপথ',
    },
    subtitle: {
      en: 'From ancient Greek automata myths to 20th-century computing breakthroughs.',
      bn: 'প্রাচীনকালের চিন্তা থেকে আধুনিক কম্পিউটারের জনক টিউরিংয়ের আবিষ্কার।',
    },
    duration: '15 mins',
    objectives: [
      'Trace humanity’s fascination with mechanical intelligence from automata to Charles Babbage.',
      'Explain Ada Lovelace’s vision as the first computer programmer.',
      'Understand how formal logic created the foundation for modern electronic computation.',
    ],
    prerequisites: 'Lesson 1: What is AI?',
    explanation: {
      simple: {
        en: 'For thousands of years, humans dreamed of building mechanical creatures. In the 1800s, Charles Babbage and Ada Lovelace designed the first mechanical computer, realizing that machines could manipulate symbols, not just numbers.',
        bn: 'হাজার বছর ধরে মানুষ যন্ত্রের মধ্যে প্রাণ সঞ্চারের স্বপ্ন দেখেছে। ১৮০০ শতকে চার্লস ব্যাবেজ ও অ্যাডা লাভলেস প্রথম যান্ত্রিক কম্পিউটারের ধারণা তৈরি করেন।',
      },
      analogy: {
        en: 'Think of early mechanical computing like a music box that plays songs when a metal drum rotates. Ada Lovelace realized that if you could change the patterns on the drum, the box could play any song or calculate anything!',
        bn: 'এটি একটি মিউজিক বক্সের মতো যার ড্রাম ঘুরালে গান বাজে। অ্যাডা লাভলেস বুঝেছিলেন মিউজিক বক্সে নতুন প্যাটার্ন বসালে যেকোনো গান বা গাণিতিক হিসাব করা সম্ভব।',
      },
      technical: {
        en: 'Ada Lovelace noted in 1843 that the Analytical Engine could act upon symbols according to rules. Gottfried Wilhelm Leibniz developed binary logic, while George Boole formalized Boolean Algebra (1s and 0s), providing the mathematical foundation for digital logic gates.',
        bn: 'অ্যাডা লাভলেস প্রথম চিহ্ন ও নিয়মের ওপর ভিত্তি করে গণনা করার প্রোগ্রামিং ধারণা ব্যক্ত করেন।',
      },
    },
    misconceptions: [
      {
        misconception: 'Artificial Intelligence was invented in the 21st century by Silicon Valley companies.',
        correction: 'AI is built on centuries of mathematical logic, statistics, and mechanical computing foundations spanning Leibniz, Lovelace, Turing, and Dartmouth pioneers.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why is Ada Lovelace considered the world’s first computer programmer?',
      modelAnswer: 'Because she recognized that Charles Babbage’s mechanical Analytical Engine was not just a calculator for numbers, but could process any symbols or music according to instructions (algorithms) she wrote!',
      checklist: [
        'Mentioned Charles Babbage’s Analytical Engine.',
        'Explained symbol manipulation beyond basic arithmetic.',
      ],
    },
    quiz: {
      question: 'Who is recognized as writing the first computer algorithm in the 1840s?',
      options: [
        'Alan Turing',
        'Ada Lovelace',
        'Charles Babbage',
        'Albert Einstein',
      ],
      correctAnswer: 1,
      explanation: 'Ada Lovelace published the first algorithm designed to be processed by Babbage’s Analytical Engine in 1843.',
    },
    simulationType: 'ai-history-demo',
    codeLab: {
      title: 'Simulating Lovelace Binary Operations',
      language: 'python',
      starterCode: `# Simulating Symbolic Logic Gates (Boole & Lovelace)
def AND_gate(a, b):
    return a and b

def OR_gate(a, b):
    return a or b

print("Binary AND (1, 1):", AND_gate(1, 1))
print("Binary OR (1, 0):", OR_gate(1, 0))
`,
      expectedOutput: 'Binary AND (1, 1): 1\nBinary OR (1, 0): 1',
      explanation: 'Boolean logic gates form the fundamental building blocks of all computer hardware and digital AI chips.',
    },
    summary: [
      'Human attempts to build thinking machines stretch back thousands of years.',
      'Charles Babbage designed the mechanical Analytical Engine.',
      'Ada Lovelace created the first algorithm and foresaw computers manipulating symbols.',
      'Boolean algebra transformed formal logic into binary arithmetic (0s and 1s).',
    ],
    glossary: [
      { term: 'Automata', definition: 'Self-operating mechanical devices built to imitate human or animal movements.' },
      { term: 'Boolean Algebra', definition: 'A branch of algebra in which values are true or false (1 or 0).' },
    ],
    nextLessonId: 'ai-6',
  },
  {
    id: 'ai-6',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 6,
    difficulty: 'Beginner',
    title: {
      en: '6. Alan Turing, the Turing Test, and Machine Intelligence',
      bn: '৬. অ্যালান টিউরিং, টিউরিং টেস্ট এবং মেশিন ইন্টেলিজেন্স',
    },
    subtitle: {
      en: 'Explore the landmark 1950 question: "Can machines think?"',
      bn: '১৯৫০ সালে টিউরিংয়ের বিখ্যাত প্রশ্ন: "যন্ত্র কি চিন্তা করতে পারে?"',
    },
    duration: '15 mins',
    objectives: [
      'Understand Alan Turing’s contributions to codebreaking and computer science.',
      'Explain how the Turing Test (The Imitation Game) measures machine conversational capability.',
      'Identify the strengths and flaws of using conversation to measure intelligence.',
    ],
    prerequisites: 'Lesson 5: History of AI',
    explanation: {
      simple: {
        en: 'Alan Turing was a British mathematician who helped defeat enigma codes in World War II. In 1950, he proposed a famous test: if a human judge chats with a computer and a human, and cannot tell which is which—the computer passes the Turing Test!',
        bn: 'অ্যালান টিউরিং ছিলেন একজন ব্রিটিশ গণিতবিদ। ১৯৫০ সালে তিনি একটি টেস্ট প্রস্তাব করেন: যদি একজন বিচারক কম্পিউটার ও মানুষের সাথে মেসেজে কথা বলে তাদের পার্থক্য বুঝতে না পারে, তবে কম্পিউটার টিউরিং টেস্টে পাস করবে।',
      },
      analogy: {
        en: 'Imagine texting a new friend behind a curtain. If you chat for 30 minutes about movies, jokes, and school, and you are 100% convinced you’re texting a human—but it turns out to be a computer script—the script successfully fooled you!',
        bn: 'মনে করুন পর্দার আড়ালে নতুন কারোর সাথে টেক্সট করছেন। আধা ঘণ্টা কথা বলার পর মনে হলো মানুষ, কিন্তু পরে জানা গেল সে কম্পিউটার! এটাই টিউরিং টেস্ট।',
      },
      technical: {
        en: 'Turing called it "The Imitation Game". A human evaluator (C) engages in natural language text conversations with a human (B) and a machine (A). If the evaluator cannot reliably distinguish the machine from the human, the machine exhibits conversational equivalence.',
        bn: 'টিউরিং গেমটিতে মানুষ ও কম্পিউটারের কথোপকথনের মাধ্যমে যন্ত্রের অনুকরণ করার ক্ষমতা পরীক্ষা করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Passing the Turing Test proves a machine is conscious and genuinely understands life.',
        correction: 'No. A machine can pass the Turing Test simply by tricking the judge with persuasive text generation, without having true understanding or consciousness.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what the Turing Test is and one criticism of using it to define true machine intelligence.',
      modelAnswer: 'The Turing Test checks if a computer can talk so convincingly that a human judge thinks it is a person. A major criticism is that a computer can trick a judge by repeating clever phrases without actually understanding what it is saying!',
      checklist: [
        'Described the judge, human, and machine setup.',
        'Mentioned a valid criticism (e.g. imitation vs genuine comprehension).',
      ],
    },
    quiz: {
      question: 'What is the goal of a computer in the classic Turing Test?',
      options: [
        'To solve 10,000 complex calculus problems in one second.',
        'To convince a human judge through text conversation that it is human.',
        'To defeat a grandmaster in a game of chess.',
        'To physically walk and move like a human robot.',
      ],
      correctAnswer: 1,
      explanation: 'The Turing Test measures conversational imitation: convincing a human judge through text dialogue that the machine is a human.',
    },
    simulationType: 'turing-test-demo',
    codeLab: {
      title: 'Simple Eliza-style Chat Script',
      language: 'python',
      starterCode: `# Simple Eliza Chatter Simulator
def eliza_response(user_input):
    user_input = user_input.lower()
    if "sad" in user_input or "upset" in user_input:
        return "Why do you feel that way?"
    elif "computer" in user_input:
        return "Does it bother you that I am a machine?"
    return "Tell me more about that."

print("User: I feel sad today.")
print("Eliza:", eliza_response("I feel sad today."))
`,
      expectedOutput: 'User: I feel sad today.\nEliza: Why do you feel that way?',
      explanation: 'Early chatbots like ELIZA (1966) tricked people into thinking they were real therapists using basic keyword reflections.',
    },
    summary: [
      'Alan Turing pioneered modern computer science and early AI philosophy.',
      'The Turing Test evaluates if a machine can imitate human text conversation.',
      'Passing the Turing Test measures imitation ability, not consciousness.',
      'Modern LLMs easily pass basic Turing-style chats, shifting focus to reasoning benchmarks.',
    ],
    glossary: [
      { term: 'Turing Test', definition: 'A test proposed by Alan Turing to evaluate a machine’s ability to exhibit intelligent behavior equivalent to a human.' },
      { term: 'ELIZA', definition: 'An early 1966 natural language processing program that simulated a Rogerian psychotherapist.' },
    ],
    nextLessonId: 'ai-7',
  },
  {
    id: 'ai-7',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 7,
    difficulty: 'Beginner',
    title: {
      en: '7. Intelligence, Learning, Reasoning, and Prediction',
      bn: '৭. বুদ্ধিমত্তা, শিক্ষা, যুক্তি ও পূর্বাভাসের পার্থক্য',
    },
    subtitle: {
      en: 'Dissect the core cognitive components that make up intelligent behavior.',
      bn: 'বুদ্ধিমত্তা তৈরি করা মূল উপাদানগুলো বিশ্লেষণ করে বুঝুন।',
    },
    duration: '15 mins',
    objectives: [
      'Differentiate between Intelligence, Learning, Reasoning, and Prediction.',
      'Explain why prediction is the foundation of statistical machine learning.',
      'Identify where modern AI excels (Prediction) and where it struggles (Deep Logical Reasoning).',
    ],
    prerequisites: 'Lesson 1: What is AI?',
    explanation: {
      simple: {
        en: 'People often lump "Intelligence" into one big word, but it consists of 4 parts: 1) Learning (storing experiences), 2) Reasoning (connecting facts to solve a puzzle), 3) Prediction (guessing what happens next), and 4) Intelligence (combining all three to reach goals!).',
        bn: 'বুদ্ধিমত্তা ৪টি উপাদানের সমন্বয়: ১) লার্নিং (অভিজ্ঞতা সঞ্চয়), ২) রিজননিং (যুক্তির মেলাকোপ), ৩) প্রেডিকশন (ভবিষ্যদ্বাণী করা) এবং ৪) সার্বিক বুদ্ধিমত্তা।',
      },
      analogy: {
        en: 'Learning is studying 50 practice math tests. Reasoning is figuring out why a formula works. Prediction is guessing which question will be on tomorrow’s exam. Intelligence is getting an A+ on the exam by combining study, logic, and smart strategy!',
        bn: 'লার্নিং হলো ৫০টি টেস্ট পেপার পড়া। রিজননিং হলো ফর্মুলা কেন কাজ করে তা বোঝা। প্রেডিকশন হলো পরীক্ষায় কোন প্রশ্ন আসবে তার অনুমিত ধারণা দেওয়া।',
      },
      technical: {
        en: 'Statistical AI relies primarily on statistical prediction: finding conditional probabilities P(Y|X). Reasoning requires multi-step planning, symbolic logic, and causal inference. True cognitive intelligence balances pattern recognition with causal reasoning.',
        bn: 'আধুনিক AI পরিসংখ্যানিক প্রেডিকশনের ওপর নির্ভর করে কাজ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'If an AI can predict words accurately, it understands causal logic like a scientist.',
        correction: 'Prediction uses correlation (what items co-occur). True reasoning requires causal inference (understanding WHY A causes B).',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the difference between Prediction and Reasoning using a weather forecast example.',
      modelAnswer: 'Prediction is seeing dark clouds and guessing 80% chance of rain because it rained last time clouds looked like this. Reasoning is understanding that warm humid air rose, cooled, condensed into water droplets, and grew too heavy for the updraft to support!',
      checklist: [
        'Used a clear weather analogy.',
        'Distinguished correlation pattern matching from physical cause-and-effect reasoning.',
      ],
    },
    quiz: {
      question: 'Which cognitive capability forms the primary basis of modern statistical AI models?',
      options: [
        'Causal Logical Reasoning',
        'Statistical Prediction',
        'Emotional Empathy',
        'Physical Intuition',
      ],
      correctAnswer: 1,
      explanation: 'Modern machine learning and neural networks are built fundamentally on statistical prediction from data distributions.',
    },
    simulationType: 'ai-cognition-demo',
    codeLab: {
      title: 'Correlation vs Cause Predictor',
      language: 'python',
      starterCode: `# Ice Cream Sales vs Drowning Rate (Correlation vs Causation)
data = [
    {"temp": 35, "ice_cream": 500, "swimming": 200},
    {"temp": 15, "ice_cream": 50, "swimming": 10},
]

# High correlation does NOT mean ice cream causes drowning!
print("Temperature is the hidden causal factor driving both trends.")
`,
      expectedOutput: 'Temperature is the hidden causal factor driving both trends.',
      explanation: 'Statistical AI notices correlation (ice cream & swimming rise together), but human reasoning understands the causal factor (hot weather).',
    },
    summary: [
      'Learning: Extracting patterns from past data.',
      'Reasoning: Applying logic step-by-step to arrive at valid conclusions.',
      'Prediction: Estimating likelihoods of unknown outcomes.',
      'Modern AI is ultra-strong at Prediction, but still developing multi-step Reasoning.',
    ],
    glossary: [
      { term: 'Correlation', definition: 'A statistical relationship between two variables moving together.' },
      { term: 'Causation', definition: 'A direct relationship where one event causes another event to occur.' },
    ],
    nextLessonId: 'ai-8',
  },
  {
    id: 'ai-8',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 8,
    difficulty: 'Beginner',
    title: {
      en: '8. Can Machines Actually Think? Understanding the Debate',
      bn: '৮. যন্ত্র কি আসলেও চিন্তা করতে পারে? দার্শনিক বিতর্ক',
    },
    subtitle: {
      en: 'Explore John Searle’s Chinese Room Argument and the philosophy of mind.',
      bn: 'জন সার্লের চায়নিজ রুম থট এক্সপেরিমেন্ট ও অনুভূতির দর্শন।',
    },
    duration: '15 mins',
    objectives: [
      'Explain John Searle’s Chinese Room thought experiment.',
      'Distinguish Functionalism (behavioral simulation) from Intentionality (genuine understanding).',
      'Analyze why symbol manipulation is different from conscious comprehension.',
    ],
    prerequisites: 'Lesson 6: Alan Turing & Turing Test',
    explanation: {
      simple: {
        en: 'In 1980, philosopher John Searle proposed a thought experiment: Imagine a person locked in a room who doesn’t speak Chinese, but has a giant rulebook. People pass Chinese notes under the door, the person follows the rulebook, and writes back perfect Chinese answers! To people outside, the room "knows" Chinese—but inside, nobody understands a single word!',
        bn: '১৯৮০ সালে দার্শনিক জন সার্ল একটি থট এক্সপেরিমেন্ট প্রস্তাব করেন: চায়নিজ রুম। ঘরের ভেতরে একজন লোক রুলবুক দেখে চায়নিজ উত্তরের চিরকুট লিখছেন। বাইরে থেকে মনে হয় তিনি চায়নিজ জানেন, কিন্তু ভেতরে তিনি একটি শব্দও বোঝেন না!',
      },
      analogy: {
        en: 'A calculator multiplies 49,382 × 8,391 in a millisecond and gives the correct answer. But the calculator does not know what a "number" is, does not feel proud of the answer, and does not experience mathematics!',
        bn: 'ক্যালকুলেটর মুহূর্তে বড় সংখ্যা গুণ করে উত্তর দেয়। কিন্তু সে বোঝে না "সংখ্যা" কী জিনিস বা তার কোনো অনুভূতি নেই।',
      },
      technical: {
        en: 'Searle argued that syntax (symbol manipulation) does not equal semantics (meaning and understanding). A computer processes syntax via formal rules, but lacks intentionality—the intrinsic connection between thoughts and the real world.',
        bn: 'সিনট্যাক্স (চিহ্ন মেলানো) কখনোই সিম্যান্টিক্স (আসল অর্থ ও অনুভূতি) এর সমান নয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'If a computer generates poetic essays about love, it must feel love.',
        correction: 'Generating statistical word combinations that mimic human love letters is syntactic generation, not subjective experience (qualia).',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the Chinese Room thought experiment to a classmate.',
      modelAnswer: 'Imagine someone inside a room who doesn’t speak Chinese, but uses an English rulebook to swap Chinese symbols. People outside think the room understands Chinese, but the person is just matching rules without understanding any meaning. That’s how computers process text!',
      checklist: [
        'Mentioned the person, rulebook, and Chinese notes.',
        'Concluded that symbol matching is not the same as real understanding.',
      ],
    },
    quiz: {
      question: 'What is the main conclusion of John Searle’s Chinese Room thought experiment?',
      options: [
        'Computers will achieve human consciousness by 2030.',
        'Following rules to manipulate symbols (syntax) is NOT the same as genuine understanding (semantics).',
        'Chinese is the hardest language for AI to translate.',
        'Computers are physically incapable of storing text dictionaries.',
      ],
      correctAnswer: 1,
      explanation: 'Searle argued that symbol processing (syntax) lacks intrinsic meaning/understanding (semantics).',
    },
    simulationType: 'chinese-room-demo',
    codeLab: {
      title: 'Symbol Substitution Demo',
      language: 'python',
      starterCode: `# Symbol Translator without Understanding
dictionary = {"hello": "কী খবর", "cat": "বিড়াল"}

def translate(word):
    # The script matches keys to values without knowing what a cat or hello feels like
    return dictionary.get(word, "Unknown")

print("Output:", translate("cat"))
`,
      expectedOutput: 'Output: বিড়াল',
      explanation: 'Key-value dictionary lookups simulate syntax matching without underlying semantic awareness.',
    },
    summary: [
      'Functionalism argues that if a machine acts intelligent, it IS intelligent.',
      'Searle’s Chinese Room argues that symbol matching (syntax) lacks real meaning (semantics).',
      'Computers execute algorithms without subjective experience or qualia.',
      'The debate continues among computer scientists, neuroscientists, and philosophers.',
    ],
    glossary: [
      { term: 'Syntax', definition: 'The formal rules and structural arrangement of symbols or code.' },
      { term: 'Semantics', definition: 'The actual meaning and intent behind symbols, words, or concepts.' },
      { term: 'Qualia', definition: 'Individual instances of subjective, conscious experience.' },
    ],
    nextLessonId: 'ai-9',
  },
  {
    id: 'ai-9',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 9,
    difficulty: 'Beginner',
    title: {
      en: '9. AI Benefits, Risks, Bias, Privacy, and Responsible AI',
      bn: '৯. AI-এর সুবিধা, ঝুঁকি, বায়াস বা পক্ষপাতিত্ব এবং নিরাপদ ব্যবহার',
    },
    subtitle: {
      en: 'Learn how training data bias can lead to unfair outcomes and how to use AI ethically.',
      bn: 'ডেটার পক্ষপাতিত্বের কারণে AI কীভাবে ভুল সিদ্ধান্ত নিতে পারে এবং এর দায়িত্বশীল ব্যবহার।',
    },
    duration: '15 mins',
    objectives: [
      'Define algorithmic bias and explain how biased datasets cause unfair predictions.',
      'Identify privacy risks associated with AI training data and web scraping.',
      'Understand core Responsible AI principles: Fairness, Transparency, Accountability, and Privacy.',
    ],
    prerequisites: 'Lesson 1: What is AI?',
    explanation: {
      simple: {
        en: 'AI is like a mirror—it reflects the data we feed it. If historical data contains human prejudice or inequality, the AI will learn and amplify those exact mistakes! Responsible AI means designing tools that are fair, safe, transparent, and respectful of privacy.',
        bn: 'AI একটি আয়নার মতো—একে যে ডেটা দেওয়া হয় এটি সেটাই প্রতিফলিত করে। ডেটায় যদি কোনো বৈষম্য থাকে, AI-ও সেই ভুল সিদ্ধান্ত নেবে।',
      },
      analogy: {
        en: 'If a company hired only tall people for 50 years, and you train an AI on those hiring records, the AI will predict that short candidates are "unqualified"—not because height matters, but because the historical data was biased!',
        bn: 'যদি ৫০ বছর ধরে শুধু লম্বা মানুষদের চাকরিতে নেওয়া হয়ে থাকে, তবে AI শর্ট ক্যান্ডিডেটদের বাদ দেবে—কারণ সে বিকেলের পুরোনো ডেটা দেখে ভুল শিখেছে।',
      },
      technical: {
        en: 'Algorithmic bias occurs when training data distributions do not represent target populations, or reflect historical systemic skew. Mitigation techniques include dataset auditing, re-weighting sampling, counterfactual fairness constraints, and differential privacy.',
        bn: 'অ্যালগরিদমিক বায়াস ঘটে যখন ট্রেনিং ডেটায় বৈষম্য থাকে। ডেটা অডিট ও অ্যালগরিদম টিউনিংয়ের মাধ্যমে এটি সমাধান করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Computers are purely mathematical, so AI predictions are always 100% objective and unbiased.',
        correction: 'AI models learn from human data. If human data contains bias, the mathematical model will codify and automate that bias.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain how a loan approval AI could accidentally discriminate against certain neighborhoods.',
      modelAnswer: 'If the AI is trained on historical bank records from times when certain neighborhoods were unfairly denied loans, the AI will notice the pattern and keep rejecting applicants from those zip codes, repeating past unfairness!',
      checklist: [
        'Identified historical data as the source of bias.',
        'Explained how AI automates past patterns without understanding fairness.',
      ],
    },
    quiz: {
      question: 'What is the main cause of algorithmic bias in Machine Learning models?',
      options: [
        'Computer processors overheating during model training.',
        'Training datasets that contain historical inequalities, missing groups, or human prejudices.',
        'Using Python instead of C++ to code the algorithm.',
        'Running models on cloud servers instead of personal computers.',
      ],
      correctAnswer: 1,
      explanation: 'Biased training data is the primary root cause of algorithmic bias in AI predictions.',
    },
    simulationType: 'ai-bias-demo',
    codeLab: {
      title: 'Dataset Skew Auditor',
      language: 'python',
      starterCode: `# Auditing Training Dataset Skew
dataset = [
    {"role": "Engineer", "gender": "Male"},
    {"role": "Engineer", "gender": "Male"},
    {"role": "Engineer", "gender": "Male"},
    {"role": "Engineer", "gender": "Female"},
]

males = sum(1 for d in dataset if d["gender"] == "Male")
females = sum(1 for d in dataset if d["gender"] == "Female")

print(f"Dataset Ratio - Male: {males/len(dataset)*100}%, Female: {females/len(dataset)*100}%")
if males > 70:
    print("Warning: Dataset is heavily skewed! Model may exhibit bias.")
`,
      expectedOutput: 'Dataset Ratio - Male: 75.0%, Female: 25.0%\nWarning: Dataset is heavily skewed! Model may exhibit bias.',
      explanation: 'Auditing dataset ratios helps AI engineers detect and rebalance data before model training.',
    },
    summary: [
      'Garbage in, garbage out: Biased data creates biased AI.',
      'AI privacy issues arise when personal data is collected without consent.',
      'Transparency (Explainable AI) helps users understand why an AI made a decision.',
      'Responsible AI requires human oversight and ethical safeguards.',
    ],
    glossary: [
      { term: 'Algorithmic Bias', definition: 'Systematic and repeatable errors in a computer system that create unfair outcomes.' },
      { term: 'Explainability (XAI)', definition: 'The ability to explain the rationale behind an AI model’s prediction in human-understandable terms.' },
    ],
    nextLessonId: 'ai-10',
  },
  {
    id: 'ai-10',
    track: 'ai',
    chapter: 1,
    chapterTitle: 'Chapter 1: Understanding Artificial Intelligence',
    order: 10,
    difficulty: 'Beginner',
    title: {
      en: '10. Chapter 1 Project: Investigate an AI System Used in Everyday Life',
      bn: '১০. ১ম অধ্যায়ের প্রজেক্ট: দৈনন্দিন জীবনে ব্যবহৃত একটি AI সিস্টেমের বিস্তারিত বিশ্লেষণ',
    },
    subtitle: {
      en: 'Apply First Principles to analyze a real-world AI application of your choice.',
      bn: 'ফার্স্ট প্রিন্সিপালস ব্যবহার করে আপনার পছন্দের একটি বাস্তব AI সিস্টেম বিশ্লেষণ করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Choose a real-world AI application (e.g. Spotify Recommendations, FaceID, Spam Detection, Speech Assistants).',
      'Document its Inputs, Output Predictions, Learning Data, Benefits, and Potential Risks.',
      'Complete Chapter 1 milestone assessment and earn your Chapter 1 Badge!',
    ],
    prerequisites: 'Lessons 1 to 9 of Chapter 1',
    explanation: {
      simple: {
        en: 'Congratulations on reaching Lesson 10! Now it’s time to put your Chapter 1 knowledge into action. You will analyze a real AI system from First Principles: What problem does it solve? What data goes in? What prediction comes out? Where could it fail?',
        bn: '১ম অধ্যায়ের শেষ পাঠে স্বাগতম! এখন একটি রিয়েল-ওয়ার্ল্ড AI অ্যাপ বেছে নিয়ে ফার্স্ট প্রিন্সিপালস দিয়ে সেটির বিশ্লেষণ ও রিভিউ তৈরি করুন।',
      },
      analogy: {
        en: 'An architectural breakdown is like taking apart a bicycle to see how the gears, chain, and pedals work together. Breaking down an AI application helps you see past the hype and understand the engine inside!',
        bn: 'সাইকেলের গিয়ার ও চেইন খুলে যেভাবে কাজ পরীক্ষা করা হয়, AI প্রজেক্টকে ভেঙে দেখলে তার আসল রূপ ধরা পড়ে।',
      },
      technical: {
        en: 'System Audit Framework: 1) Problem Specification, 2) Input Modality, 3) Model Architecture Type, 4) Training Target/Labels, 5) Inference Output, 6) Edge-case Failure Modes & Ethical Audits.',
        bn: 'সিস্টেম অডিট ফ্রেমওয়ার্ক: প্রবলেম, ইনপুট, মডেল টাইপ, ট্রেনিং লেবেল, আউটপুট ও বায়াস অডিট।',
      },
    },
    misconceptions: [
      {
        misconception: 'Analyzing an AI system requires reading thousands of lines of source code.',
        correction: 'You can accurately analyze AI systems by understanding data flows, model types, inputs, outputs, and system constraints from First Principles.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Summarize your Chapter 1 project investigation in 3 bullet points.',
      modelAnswer: '1. App Analyzed: Smartphone Face Recognition (FaceID).\n2. Inputs/Outputs: Input is 3D infra-red depth pixel map; Output is binary match (Unlock Yes/No).\n3. Risk/Bias: Might fail if facial features are obscured or if training data lacked diverse illumination angles.',
      checklist: [
        'Named specific AI system.',
        'Identified inputs and output predictions.',
        'Highlighted a potential failure mode or bias risk.',
      ],
    },
    quiz: {
      question: 'In your Chapter 1 System Audit, what is the primary role of the "Inference Output"?',
      options: [
        'To store backup files in hard drives.',
        'The final prediction or action produced when new data passes through the trained model.',
        'The cooling system inside the GPU data center.',
        'The monetary cost of purchasing software licenses.',
      ],
      correctAnswer: 1,
      explanation: 'Inference output is the model’s prediction when evaluated on live incoming input data.',
    },
    simulationType: 'chapter1-capstone-demo',
    codeLab: {
      title: 'Chapter 1 System Audit Validator Script',
      language: 'python',
      starterCode: `# Chapter 1 AI Audit Template
system_name = "Spotify Discover Weekly"
input_data = "User listening history, playlist saves, skipped tracks"
output_prediction = "Recommended 30-song playlist every Monday"
potential_bias = "Favors mainstream artists over new indie musicians"

print("--- AI SYSTEM AUDIT CARD ---")
print(f"System: {system_name}")
print(f"Inputs: {input_data}")
print(f"Output: {output_prediction}")
print(f"Ethical Audit: {potential_bias}")
`,
      expectedOutput: '--- AI SYSTEM AUDIT CARD ---\nSystem: Spotify Discover Weekly\nInputs: User listening history, playlist saves, skipped tracks\nOutput: Recommended 30-song playlist every Monday\nEthical Audit: Favors mainstream artists over new indie musicians',
      explanation: 'Congratulations! Completing this system audit finishes Chapter 1 of the AI Academy!',
    },
    summary: [
      'Chapter 1 Complete! You now understand what AI is, how it differs from traditional code, and its levels.',
      'You know how AI exists in search, maps, and recommendations.',
      'You explored AI history from Lovelace & Turing to modern machine learning.',
      'You can analyze real-world AI systems from First Principles!',
    ],
    glossary: [
      { term: 'System Audit', definition: 'A structured evaluation of an AI system’s architecture, inputs, outputs, and risks.' },
      { term: 'Inference', definition: 'The process of using a trained model to make predictions on new data.' },
    ],
    nextLessonId: 'ai-11',
  },
];
