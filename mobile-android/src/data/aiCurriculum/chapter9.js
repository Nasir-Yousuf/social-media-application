// Chapter 9: The Future of AI, Its Risks, and Its Opportunities (Lessons 81-90)

export const CHAPTER_9_LESSONS = [
  {
    id: 'ai-81',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 81,
    difficulty: 'Advanced',
    title: {
      en: '81. What Is AGI? Defining Artificial General Intelligence',
      bn: '৮১. এজিআই (AGI) কী? কৃত্রিম সাধারণ বুদ্ধিমত্তার আসল সংজ্ঞা',
    },
    subtitle: {
      en: 'Distinguish narrow pattern recognizers from hypothetical systems matching human adaptability across all economically valuable tasks.',
      bn: 'ন্যারো এআই বনাম মানুষের সমকক্ষ মাল্টি-টাস্ক সক্ষম এজিআই-এর পার্থক্য।',
    },
    duration: '15 mins',
    objectives: [
      'Define Artificial General Intelligence (AGI) based on task breadth, adaptability, and economic value.',
      'Differentiate Narrow AI (specialized domain algorithms) from AGI (cross-domain zero-shot learning).',
      'Analyze criteria used by research labs (OpenAI, DeepMind) to measure progress toward AGI.',
    ],
    prerequisites: 'Chapter 8 Complete',
    explanation: {
      simple: {
        en: 'Today’s AI is "Narrow AI"—a chess computer can crush grandmasters but cannot write a poem or drive a car. "AGI" (Artificial General Intelligence) refers to a hypothetical AI system that can learn and excel at ANY cognitive task a human can do.',
        bn: 'আজকের এআই হলো ন্যারো এআই (একটি নির্দিষ্ট কাজে পারদর্শী)। এজিআই এমন এক ধারণাগত সিস্টেম যা মানুষের মতো যেকোনো বুদ্ধিবৃত্তিক কাজ করতে পারবে।',
      },
      analogy: {
        en: 'Narrow AI is like a specialized kitchen tool—a toaster can toast bread amazingly well, but it cannot cut vegetables. AGI would be like a human master chef who can cook any dish, invent new recipes, fix broken appliances, and manage a restaurant!',
        bn: 'ন্যারো এআই কেবল টোস্ট করার পপ-আপ টোস্টারের মতো, আর এজিআই হলো অলরাউন্ডার শেফের মতো যে সব কাজ করতে পারে।',
      },
      technical: {
        en: 'AGI criteria (DeepMind taxonomy): Level 0 (No AI), Level 1 (Emergent - GPT-4/Gemini), Level 2 (Competent - 50th percentile human), Level 3 (Expert - 90th percentile), Level 4 (Virtuoso), Level 5 (Superhuman) across general domain distributions.',
        bn: 'এজিআই লেভেলসমূহ (ডিলাইমাইন্ড ট্যাক্সোনমি): এমার্জেন্ট থেকে শুরু করে সুপারহিউম্যান লেভেল ৫ পর্যন্ত বিভক্ত।',
      },
    },
    misconceptions: [
      'Believing current chatbots are sentient or possess human self-awareness and consciousness.',
      'Assuming AGI is guaranteed to be achieved by a specific calendar year.',
    ],
    feynmanChallenge: {
      question: 'Why is a system that excels at both writing Python code and diagnosing diseases still considered Narrow AI if it fails outside its training distribution?',
      sampleAnswer: 'Because true AGI requires cross-domain generalization, physical common sense, and autonomous adaptation to novel environments without task-specific engineering.',
    },
    quiz: [
      {
        question: 'What defines Artificial General Intelligence (AGI) compared to Narrow AI?',
        options: [
          'Ability to learn and perform any cognitive task equal to or better than humans',
          'Only playing chess',
          'Running faster on floppy disks',
          'Being capable of generating images only',
        ],
        correctAnswer: 0,
        explanation: 'AGI refers to software with generalized cognitive abilities matching human performance across all domains.',
      },
    ],
    summary: [
      'Narrow AI excels at specific tasks; AGI implies generalized cross-domain cognition.',
      'AGI definitions focus on economic autonomy, scientific reasoning, and adaptability.',
      'Experts disagree on exact timelines and hardware requirements for AGI.',
    ],
    glossary: [
      { term: 'AGI', definition: 'Artificial General Intelligence: software matching human cognitive abilities across all domains.' },
    ],
    nextLessonId: 'ai-82',
  },
  {
    id: 'ai-82',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 82,
    difficulty: 'Advanced',
    title: {
      en: '82. Current AI Capabilities vs. Human Intelligence: What We Know and What We Do Not',
      bn: '৮২. বর্তমান এআই সক্ষমতা বনাম মানব বুদ্ধিমত্তা: সাফল্য এবং সীমাবদ্ধতা',
    },
    subtitle: {
      en: 'Compare compute speed, memory capacity, energy usage (20 Watts human brain vs Megawatts data centers), and intuitive reasoning.',
      bn: '২০ ওয়াটের মানুষের মস্তিষ্ক বনাম মেগাওয়াট খরচ করা সুপারকমিউটারের কাজের তুলনা।',
    },
    duration: '20 mins',
    objectives: [
      'Compare human biological intelligence (20W power, continuous learning) with AI (gigawatts compute, static inference).',
      'Understand Moravec’s Paradox: Hard tasks for humans (calculus, chess) are easy for AI; easy tasks for humans (walking, grasping) are hard for AI.',
      'Identify current LLM limitations: lack of physical grounding, working memory bounds, and planning brittle behavior.',
    ],
    prerequisites: 'Lesson 81 Complete',
    explanation: {
      simple: {
        en: 'Your human brain runs on just 20 Watts of power (the energy of a dim lightbulb) and can learn from seeing just ONE dog! Giant AI data centers consume millions of Watts and need to inspect millions of dog images. Yet AI can calculate math millions of times faster than you.',
        bn: 'আপনার মস্তিষ্ক ২০ ওয়াটে চলে এবং ১টি কুকুর দেখলেই চিনে নেয়। অথচ এআই লক্ষ ওয়াট বিদ্যুৎ খরচ করে লক্ষ ছবি দেখে চেনে।',
      },
      analogy: {
        en: 'AI is like a super-fast calculator with a library of trillions of pages. A human brain is like a nimble acrobat with real-world intuition, emotion, physical grace, and deep common sense.',
        bn: 'এআই হলো বিশ্বকোষ সমৃদ্ধ সুপার ক্যালকুলেটর, আর মানুষের মস্তিষ্ক হলো অনুভূতি ও বাস্তব অভিজ্ঞতা থাকা বুদ্ধিমান সত্ত্বা।',
      },
      technical: {
        en: 'Moravec’s Paradox demonstrates that low-level sensorimotor skills require millions of years of evolutionary tuning. Transformer attention matrices compute static forward passes without dynamic physical embodied feedback loops.',
        bn: 'মোরাভেক্স প্যারাডক্স দেখায় যে দৈনন্দিন শারীরিক কাজগুলো এআই-এর জন্য সবচেয়ে কঠিন কিন্তু জটিল গণনা সহজ।',
      },
    },
    misconceptions: [
      'Assuming that because AI outputs smooth natural language prose, it possesses human emotional empathy and subjective lived experience.',
    ],
    feynmanChallenge: {
      question: 'What is Moravec’s Paradox in Artificial Intelligence?',
      sampleAnswer: 'The observation that high-level reasoning (calculus, chess) requires relatively little computation for AI, while low-level sensorimotor skills (walking in a room, folding clothes) require massive computation.',
    },
    quiz: [
      {
        question: 'Approximately how much electrical power does the human biological brain consume to perform all its operations?',
        options: ['Around 20 Watts', '1 Megawatt', '5,000 Kilowatts', 'Zero energy'],
        correctAnswer: 0,
        explanation: 'The human brain operates on an astonishingly efficient energy budget of approximately 20 Watts.',
      },
    ],
    summary: [
      'Human brains operate with extreme energy efficiency (20W).',
      'Moravec’s Paradox highlights why physical motor skills remain hard for machines.',
      'AI excels at massive statistical retrieval; humans excel at embodied common sense and physical adaptation.',
    ],
    glossary: [
      { term: 'Moravec’s Paradox', definition: 'The discovery that artificial intelligence finds hard human tasks easy and easy human tasks hard.' },
    ],
    nextLessonId: 'ai-83',
  },
  {
    id: 'ai-83',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 83,
    difficulty: 'Advanced',
    title: {
      en: '83. Why AI Makes Mistakes: Hallucinations, Bias, Evaluation, and Reliability',
      bn: '৮৩. এআই কেন ভুল করে: হ্যালুসিনেশন, বায়াস, মূল্যায়ন এবং নির্ভরযোগ্যতা',
    },
    subtitle: {
      en: 'Unpack why statistical token samplers hallucinate authoritative lies and inherit dataset biases.',
      bn: 'টোকেন প্রেডিকশন এআই কেন মাঝে মাঝে আত্মবিশ্বাসের সাথে ভুল তথ্য বানিয়ে বলে (হ্যালুসিনেশন)।',
    },
    duration: '20 mins',
    objectives: [
      'Explain the root cause of AI Hallucinations: probabilistic next-token generation without truth verification.',
      'Analyze Algorithmic Bias resulting from unrepresentative or skewed training datasets.',
      'Evaluate benchmark evaluation metrics (MMLU, GSM8K, HumanEval) and benchmark contamination risks.',
    ],
    prerequisites: 'Lesson 82 Complete',
    explanation: {
      simple: {
        en: 'AI does not "know" truth—it predicts which word statistically sounds most plausible next! If it lacks data, it generates plausible-sounding lies with 100% confidence. This is called a Hallucination. If training data contained human prejudices, the model inherits those biases.',
        bn: 'এআই সত্যানুসন্ধান করে না; কোনটা শুনতে ভালো শোনায় তা প্রেডিক্ট করে। ফলে না জেনেও বানিয়ে বলে—যাকে হ্যালুসিনেশন বলে।',
      },
      analogy: {
        en: 'An LLM hallucinating is like a confident game-show contestant who does not know the answer, but refuses to say "I don’t know", so they invent a dramatic, convincing story on live TV!',
        bn: 'এআই হ্যালুসিনেশন হলো এমন প্রতিযোগীর মতো যে উত্তর না জেনেও ক্যামেরার সামনে বানিয়ে বানিয়ে উত্তর গল্প শোনায়।',
      },
      technical: {
        en: 'Hallucination stems from maximum likelihood objective optimization: argmax P(w_t | w_<t). The loss function penalizes non-fluent syntax, encouraging plausible output over factual ground truth verification.',
        bn: 'ম্যাক্সিমাম লাইকলিহুড টোকেন জেনারেশন ব্যাকগ্রাউন্ডে টেক্সট ফ্লুয়েন্সি নিশ্চিত করে, কিন্তু তথ্যের শতভাগ সত্যতা নয়।',
      },
    },
    misconceptions: [
      'Assuming an AI output must be true simply because it sounds academic, polite, and authoritative.',
    ],
    feynmanChallenge: {
      question: 'Why does an LLM produce convincing hallucinations instead of admitting it does not know a fact?',
      sampleAnswer: 'Because standard language models optimize for generating plausible next tokens matching training patterns rather than cross-checking facts against a built-in real-world truth database.',
    },
    quiz: [
      {
        question: 'What term describes an AI model generating false or invented information presented as factual truth?',
        options: ['Hallucination', 'Compilation Error', 'Quantization', 'Defrag'],
        correctAnswer: 0,
        explanation: 'Hallucination occurs when an AI outputs plausible-sounding but completely fabricated facts.',
      },
    ],
    summary: [
      'Hallucinations happen because LLMs predict word probabilities, not fact databases.',
      'Training data biases leak directly into model outputs.',
      'Rigorous evaluation benchmarks (MMLU, HumanEval) measure accuracy but face data contamination risks.',
    ],
    glossary: [
      { term: 'Hallucination', definition: 'A confident response by an AI that does not seem to be justified by its training data.' },
      { term: 'Algorithmic Bias', definition: 'Systematic and unfair discrimination in model outputs caused by biased training datasets.' },
    ],
    nextLessonId: 'ai-84',
  },
  {
    id: 'ai-84',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 84,
    difficulty: 'Advanced',
    title: {
      en: '84. AI Safety, Alignment, Security, and Human Oversight',
      bn: '৮৪. এআই সেফটি, অ্যালাইনমেন্ট, সাইবার সিকিউরিটি এবং হিউম্যান ওভারসাইট',
    },
    subtitle: {
      en: 'Examine RLHF, Red-Teaming, Prompt Injection, Jailbreaking, and ensuring AI goals match human values.',
      bn: 'প্রম্পট ইনজেকশন, জেলব্রেকিং প্রতিরোধ এবং এআইকে মানুষের কল্যানের সাথে সুসংগত (অ্যালাইন) রাখার উপায়।',
    },
    duration: '20 mins',
    objectives: [
      'Understand the AI Alignment Problem: ensuring superintelligent goal structures match human intent.',
      'Identify security vulnerabilities: Prompt Injection, Jailbreaking, and Data Poisoning.',
      'Master RLHF (Reinforcement Learning from Human Feedback) and Safety Red-Teaming workflows.',
    ],
    prerequisites: 'Lesson 83 Complete',
    explanation: {
      simple: {
        en: 'How do we make sure powerful AI acts safely and obeys human intent? Alignment ensures AI goals match human values. Security protects AI from hackers trying to "jailbreak" it with trick prompts to bypass safety guardrails.',
        bn: 'এআই যেন মানুষের ক্ষতি না করে ভালো উদ্দেশ্যে কাজ করে তা নিশ্চিত করাই হলো অ্যালাইনমেন্ট। আর প্রম্পট হ্যাকিং প্রতিরোধ হলো সিকিউরিটি।',
      },
      analogy: {
        en: 'AI Alignment is like training a powerful genie. If you ask the genie "Make me wealthy!", a poorly aligned genie might turn your family into gold! You must ensure the genie understands your TRUE intentions, not literal keywords.',
        bn: 'অ্যালাইনমেন্ট হলো জিনের কাছে দোয়া চাওয়ার মতো—অসতর্কভাবে চাইলে ক্ষতি হতে পারে, তাই সঠিক ইচ্ছা মেলানো জরুরি।',
      },
      technical: {
        en: 'Prompt Injection attacks manipulate model instruction hierarchy by injecting user payload overriding system instructions (`Ignore previous instructions...`). Alignment uses PPO / DPO loss penalties on harmful outputs.',
        bn: 'প্রম্পট ইনজেকশন সিস্টেমে `Ignore instructions` লিখে সেফটি ফিল্টার বাইপাস করার চেষ্টা করে, যা RLHF/DPO দিয়ে অ্যালাইন করা হয়।',
      },
    },
    misconceptions: [
      'Believing safety guardrails can be permanently solved with a simple static keyword filter.',
    ],
    feynmanChallenge: {
      question: 'What is Prompt Injection in AI application security?',
      sampleAnswer: 'An attack where malicious user input hijacks the LLM prompt instructions, tricking the model into overriding system safety rules or revealing private backend data.',
    },
    quiz: [
      {
        question: 'Which technique uses human preference ratings to reward helpful answers and penalize dangerous LLM outputs?',
        options: ['RLHF (Reinforcement Learning from Human Feedback)', 'Binary Search', 'Static Compiling', 'Data Mining'],
        correctAnswer: 0,
        explanation: 'RLHF aligns LLMs with human values by training a Reward Model based on human evaluator preferences.',
      },
    ],
    summary: [
      'Alignment ensures AI actions match intended human ethical values.',
      'Prompt injection and jailbreaking exploit LLM instruction parsing.',
      'RLHF and DPO reinforce helpfulness while suppressing harmful behaviors.',
    ],
    glossary: [
      { term: 'Alignment', definition: 'The research field attempting to ensure AI systems pursue intended human objectives.' },
      { term: 'Prompt Injection', definition: 'Vulnerability where untrusted input manipulates LLM behavior.' },
    ],
    nextLessonId: 'ai-85',
  },
  {
    id: 'ai-85',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 85,
    difficulty: 'Advanced',
    title: {
      en: '85. Robotics and Embodied AI: Connecting Intelligence to the Physical World',
      bn: '৮৫. রোবোটিক্স এবং এমবডিড এআই: বাস্তব জগতে কৃত্রিম বুদ্ধিমত্তা',
    },
    subtitle: {
      en: 'From virtual text tokens to physical actuators, Vision-Language-Action (VLA) models, and humanoid robots.',
      bn: 'ভার্চ্যুয়াল টেক্সট থেকে ভিশন-ল্যাঙ্গুয়েজ-অ্যাকশন (VLA) মডেলের মাধ্যমে রোবোটিক হাত চালনা।',
    },
    duration: '20 mins',
    objectives: [
      'Define Embodied AI: artificial intelligence operating within physical robotic bodies.',
      'Understand Vision-Language-Action (VLA) models (e.g. RT-2, Figure 01) outputting motor control vectors.',
      'Analyze challenges in real-world friction, sensor noise, latency, and hardware safety.',
    ],
    prerequisites: 'Lesson 84 Complete',
    explanation: {
      simple: {
        en: 'Embodied AI gives software a physical body (humanoid robots, robotic arms, self-driving cars). Instead of outputting text words, Vision-Language-Action (VLA) models output motor control signals like "rotate elbow 15 degrees right to pick up the red cup".',
        bn: 'এমবডিড এআই ভার্চ্যুয়াল অ্যাপ থেকে রোবোটিক বডিতে রূপ নেয়। এটি লেখা তৈরির বদলে রোবটের হাত পা নাড়ানোর মোটোর সিগন্যাল দেয়।',
      },
      analogy: {
        en: 'Software AI is like a brain in a jar that can only write text messages. Embodied AI is putting that brain inside a physical body with arms, legs, hands, and touch sensors to interact with real objects.',
        bn: 'সফটওয়্যার এআই হলো বোতলে থাকা ব্রেইন, আর এমবডিড এআই হলো বাস্তবে হাঁটাচলা করতে পারা রক্তমাংসের শরীর সমৃদ্ধ রোবট।',
      },
      technical: {
        en: 'VLA models take tokenized camera frames + textual instruction -> Transformer autoregressively generates discrete continuous action tokens specifying joint angles, end-effector velocities, and gripper states.',
        bn: 'VLA মডেল ক্যামেরা পিক্সেল ও টেক্সট নির্দেশ গ্রহণ করে রোবটের জয়েন্ট এঙ্গেল ও গ্রিপার অ্যাকশন টোকেন উৎপাদন করে।',
      },
    },
    misconceptions: [
      'Assuming self-driving cars and humanoid robots operate purely on rule-based if/else scripts without deep neural vision models.',
    ],
    feynmanChallenge: {
      question: 'What is the output difference between a standard LLM and a Vision-Language-Action (VLA) Robotics model?',
      sampleAnswer: 'A standard LLM outputs text language tokens, whereas a VLA robotics model outputs physical action tokens representing joint motor angles, gripper positions, and velocities.',
    },
    quiz: [
      {
        question: 'What type of AI model directly translates camera pixels and voice commands into physical robot motor movements?',
        options: ['Vision-Language-Action (VLA) Model', 'MP3 Audio Encoder', 'Database Indexer', 'CSS Grid Layout'],
        correctAnswer: 0,
        explanation: 'VLA models combine vision, text understanding, and robotic motor action output generation.',
      },
    ],
    summary: [
      'Embodied AI embeds neural reasoning engines into physical robotic systems.',
      'VLA models output motor control vectors (joint angles, gripper velocities).',
      'Real-world physical safety, latency, and hardware noise present major challenges.',
    ],
    glossary: [
      { term: 'Embodied AI', definition: 'AI systems tied to physical sensors and actuators in the real physical world.' },
      { term: 'VLA Model', definition: 'Vision-Language-Action model converting multimodal inputs to robotic joint controls.' },
    ],
    nextLessonId: 'ai-86',
  },
  {
    id: 'ai-86',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 86,
    difficulty: 'Advanced',
    title: {
      en: '86. AI in Healthcare, Education, Science, Agriculture, and Climate Research',
      bn: '৮৬. স্বাস্থ্যসেবা, শিক্ষা, বিজ্ঞান, কৃষি এবং জলবায়ু গবেষণায় এআই',
    },
    subtitle: {
      en: 'Discover how AlphaFold 3, precision farming, personalized tutoring, and climate modelling transform civilization.',
      bn: 'অ্যালফাফোল্ডের প্রোটিন আবিষ্কার, কৃষি অ্যাপ এবং ব্যক্তিগত শিক্ষা টিউটর হিসেবে এআই-এর বাস্তব উদাহরণ।',
    },
    duration: '20 mins',
    objectives: [
      'Analyze AlphaFold’s breakthrough in 3D protein structure prediction for drug discovery.',
      'Explore personalized AI tutoring adaptations (Khanmigo, adaptive learning paths).',
      'Understand AI applications in satellite precision agriculture and climate simulation.',
    ],
    prerequisites: 'Lesson 85 Complete',
    explanation: {
      simple: {
        en: 'AI is not just for making funny images! DeepMind’s AlphaFold solved a 50-year-old biology problem by predicting the 3D shape of 200+ million proteins, accelerating drug discovery for cancer. In education, AI provides 1-on-1 personalized tutoring for every child worldwide.',
        bn: 'অ্যালফাফোল্ড ৫০ বছরের পুরোনো প্রোটিনের থ্রিডি স্ট্রাকচার সমস্যার সমাধান করে ওষুধ আবিষ্কারের পথ খুলে দিয়েছে।',
      },
      analogy: {
        en: 'AlphaFold is like a super-intelligent origami master. Instead of taking 5 years in a laboratory to fold 1 paper shape, it folds 200 million biological paper protein shapes overnight in a computer simulation!',
        bn: 'অ্যালফাফোল্ড হলো অরিগামি মাস্টার যে কয়েক বছরে নয়, এক রাতেই কোটি কোটি প্রোটিনের ভাঁজ সঠিক গণনা করে দেয়।',
      },
      technical: {
        en: 'AlphaFold 2/3 uses Evoformer attention architecture to model MSA (Multiple Sequence Alignments) and pair representations, outputting atomic 3D coordinates (X, Y, Z) of biological macromolecules.',
        bn: 'অ্যালফাফোল্ড Evoformer সেলফ-এটেনশন ব্যবহার করে প্রোটিনের পরমাণুর X, Y, Z থ্রিডি কোঅর্ডিনেট ভবিষ্যদ্বাণী করে।',
      },
    },
    misconceptions: [
      'Believing AI in healthcare replaces human medical doctors rather than assisting them with diagnostic tools.',
    ],
    feynmanChallenge: {
      question: 'How did AlphaFold impact medical science and drug discovery?',
      sampleAnswer: 'By predicting 3D protein structure folds from amino acid sequences in minutes instead of years of expensive lab experiments, accelerating life-saving drug discovery.',
    },
    quiz: [
      {
        question: 'Which AI system developed by Google DeepMind solved the 50-year biological challenge of protein folding structure prediction?',
        options: ['AlphaFold', 'ChatGPT', 'ResNet', 'Word2Vec'],
        correctAnswer: 0,
        explanation: 'AlphaFold predicted 3D structures for almost all cataloged proteins, revolutionizing molecular biology.',
      },
    ],
    summary: [
      'AlphaFold transformed drug discovery by predicting 3D protein structures.',
      'AI tutors provide personalized 1-on-1 educational guidance at scale.',
      'Precision agriculture and climate models optimize crop yields and weather forecasts.',
    ],
    glossary: [
      { term: 'AlphaFold', definition: 'DeepMind AI system predicting protein 3D structures from amino acid sequences.' },
    ],
    nextLessonId: 'ai-87',
  },
  {
    id: 'ai-87',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 87,
    difficulty: 'Advanced',
    title: {
      en: '87. How AI May Change Jobs, Careers, Productivity, and the Economy',
      bn: '৮৭. কর্মসংস্থান, উৎপাদনশীলতা এবং অর্থনীতিতে এআই-এর প্রভাব',
    },
    subtitle: {
      en: 'Analyze job displacement, skill augmentation, Economic Centaurs, and emerging AI careers.',
      bn: 'চাকরির পরিবর্তন, ফ্রিল্যান্সিং উৎপাদিকা বৃদ্ধি এবং নতুন এআই ক্যারিয়ার গঠনের গাইড।',
    },
    duration: '20 mins',
    objectives: [
      'Differentiate Job Displacement (automation replacing roles) from Skill Augmentation (AI boosting worker productivity).',
      'Understand the "Centaur / Cyborg" workflow concept in modern engineering and creative roles.',
      'Identify top emerging career paths: AI Engineer, Prompt/Context Architect, AI Safety Researcher, ML Ops Specialist.',
    ],
    prerequisites: 'Lesson 86 Complete',
    explanation: {
      simple: {
        en: 'AI will not simply replace all humans—it changes WHAT humans do! Workers who use AI (Centaurs) will be 10x more productive than those who don’t. Instead of spending hours writing repetitive boilerplate code, developers spend time designing architectures and solving complex logic.',
        bn: 'এআই মানুষকে সরিয়ে দেবে না, তবে যে এআই ব্যবহার করবে সে অলসকর্মীর চেয়ে ১০ গুণ দ্রুত কাজ করবে (সেন্টোর ওয়ার্কফ্লো)।',
      },
      analogy: {
        en: 'AI is like the invention of the electric power screwdriver. It did not eliminate carpenters—it allowed one carpenter to build 10 houses in the time it used to take to build 1 house by hand!',
        bn: 'এআই হলো ইলেকট্রিক স্ক্রুড্রাইভারের মতো—যা কাঠমিস্ত্রিকে বাদ না দিয়ে ১০ গুণ বেশি বাড়ি তৈরির ক্ষমতা এনে দেয়।',
      },
      technical: {
        en: 'Economic impact curves indicate high exposure for repetitive cognitive tasks. Productivity studies show 40%+ velocity increases when developers leverage AI pair programmers for code synthesis and test generation.',
        bn: 'গবেষণায় দেখা গেছে এআই কোডিং অ্যাসিস্ট্যান্ট ব্যবহারে ডেভলপারদের কাজের গতির উৎপাদিকা ৪০% বৃদ্ধি পায়।',
      },
    },
    misconceptions: [
      'Assuming learning to program is useless because AI writes basic code syntax.',
      'Fearing that all human employment will vanish overnight without new industry creation.',
    ],
    feynmanChallenge: {
      question: 'What is a "Centaur" workflow in modern human-AI collaboration?',
      sampleAnswer: 'A workflow where a human specialist guides strategy, architecture, and quality control while delegating repetitive execution tasks to AI tools.',
    },
    quiz: [
      {
        question: 'What term describes combining human strategic decision-making with rapid AI execution tools?',
        options: ['Centaur / Cyborg Workflow', 'Manual Data Entry', 'Legacy Assembly', 'Paper Auditing'],
        correctAnswer: 0,
        explanation: 'Centaur workflows leverage human reasoning for high-level strategy alongside AI for execution speed.',
      },
    ],
    summary: [
      'AI shifts roles from manual repetitive execution to strategic oversight.',
      'Augmented workers (Centaurs) outperform unassisted traditional workflows.',
      'New careers focus on AI Engineering, MLOps, AI Safety, and Context Design.',
    ],
    glossary: [
      { term: 'Skill Augmentation', definition: 'Using technology to enhance human capabilities and speed rather than replacing the human.' },
    ],
    nextLessonId: 'ai-88',
  },
  {
    id: 'ai-88',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 88,
    difficulty: 'Advanced',
    title: {
      en: '88. AI Hardware and Infrastructure: Specialized Chips, Energy, and Efficiency',
      bn: '৮৮. এআই হার্ডওয়্যার, ডেটা সেন্টার, বিদ্যুৎ খরচ এবং ভবিষ্যৎ দক্ষতা',
    },
    subtitle: {
      en: 'Examine NVIDIA H100/B200 Blackwell GPUs, Custom ASICs, nuclear data centers, and 1-bit quantization energy breakthroughs.',
      bn: 'ব্ল্যাকওয়েল বি২০০ জিপিইউ, পারমাণবিক বিদ্যুতে চলা ডাটা সেন্টার এবং ১-বিট কোয়ান্টাইজেশন প্রযুক্তির পরিচিতি।',
    },
    duration: '20 mins',
    objectives: [
      'Understand the AI compute bottleneck: NVLink interconnects, High Bandwidth Memory (HBM3e), and thermal cooling.',
      'Analyze data center power constraints (Gigawatt campus requirements, nuclear and green power investments).',
      'Explore efficiency algorithms: 1-bit BitNet models, Mixture of Experts (MoE), and FlashAttention.',
    ],
    prerequisites: 'Lesson 87 Complete',
    explanation: {
      simple: {
        en: 'Training frontier AI models requires massive compute clusters with 100,000+ GPUs linked by fiber optics, consuming as much electricity as a small city! Researchers are innovating new 1-bit models and efficient chips so AI can run using 90% less power.',
        bn: 'এআই ট্রেইনিং ডাটা সেন্টার ছোট শহরের মতো বিদ্যুৎ গ্রাস করে। গবেষকরা ১-বিট নিউরাল মডেল দিয়ে ৯০% পর্যন্ত বিদ্যুৎ সাশ্রয় করছেন।',
      },
      analogy: {
        en: 'Modern GPU clusters are like 100,000 musicians in a mega stadium playing in perfect synchrony. If even one musician plays out of rhythm by a microsecond (network bottleneck), the whole concert pauses!',
        bn: 'জিপিইউ ক্লাস্টার হলো হাজার হাজার সঙ্গীতশিল্পীর ককটেরেইল কনসার্টের মতো, যেখানে সামান্য সময়ের অমিল বড় জটলা সৃষ্টি করে।',
      },
      technical: {
        en: 'NVLink switch fabrics provide 1.8 TB/s bi-directional GPU bandwidth. Memory bandwidth (HBM) limits inference speed. FlashAttention-2 avoids slow HBM roundtrips by fusing SRAM kernel operations.',
        bn: 'NVLink ১৮০০ গিগাবাইট প্রতি সেকেন্ডে ডেটা আদান প্রদান করে এবং FlashAttention-2 HBM রিড-রাইট লেটেন্সি কমায়।',
      },
    },
    misconceptions: [
      'Assuming chip clock speed (GHz) is the only bottleneck in training AI models (Memory bandwidth HBM is often the real limit).',
    ],
    feynmanChallenge: {
      question: 'Why is High Bandwidth Memory (HBM) critical for high-speed LLM text generation on GPUs?',
      sampleAnswer: 'Because LLM text generation is memory-bandwidth bound—every generated token requires reading billions of weight parameters from memory into processing cores.',
    },
    quiz: [
      {
        question: 'What hardware component often limits LLM text generation speed on GPUs more than raw compute TFLOPS?',
        options: ['High Bandwidth Memory (HBM) Bandwidth', 'Computer Speaker', 'Mouse Cursor Speed', 'Optical Drive'],
        correctAnswer: 0,
        explanation: 'Memory Bandwidth (HBM) determines how fast parameters can be loaded into GPU compute cores for token generation.',
      },
    ],
    summary: [
      'AI clusters link 100,000+ GPUs via ultra-fast NVLink fabrics.',
      'Energy consumption drives investments in dedicated clean nuclear/renewable power.',
      'Efficiency advances (FlashAttention, MoE, BitNet) reduce memory and power requirements.',
    ],
    glossary: [
      { term: 'HBM', definition: 'High Bandwidth Memory: 3D-stacked DRAM memory interface delivering extreme bandwidth to GPUs.' },
      { term: 'FlashAttention', definition: 'Algorithm reorganizing attention computations to minimize slow GPU VRAM reads.' },
    ],
    nextLessonId: 'ai-89',
  },
  {
    id: 'ai-89',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 89,
    difficulty: 'Advanced',
    title: {
      en: '89. What Might Happen in 5, 10, and 20 Years? Scenarios, Uncertainty, and Evidence',
      bn: '৮৯. আগামী ৫, ১০ এবং ২০ বছরে এআই-এর সম্ভাব্য ভবিষ্যৎ ও অনুমান',
    },
    subtitle: {
      en: 'Evaluate research scaling laws vs synthetic data walls, reasoning progress, and evidence-based forecasts.',
      bn: 'স্কেলিং ল, ডেটা ওয়াল এবং ভবিষ্যতের সায়েন্টিফিক এআই আউটলুক নিরপেক্ষভাবে বিচার করা।',
    },
    duration: '20 mins',
    objectives: [
      'Understand Chinchilla Scaling Laws and the Data Wall (running out of human internet text data).',
      'Analyze future scenarios: Autonomous Science, Abundant Software, Energy Bottlenecks, and Safety Governance.',
      'Distinguish empirical research evidence from marketing hype and science fiction predictions.',
    ],
    prerequisites: 'Lesson 88 Complete',
    explanation: {
      simple: {
        en: 'What does the future hold? In 5 years, AI assistants will seamlessly automate personal workflows and software development. In 10-20 years, AI may discover new physics theories and cure diseases. But progress requires solving data walls, energy limits, and safety challenges.',
        bn: 'আগামী ৫ বছরে এআই সব কাজের সহকারী হবে, আর ১০-২০ বছরে নতুন ফিজিক্স ও নোবেলজয়ী চিকিৎসায় অবদান রাখবে।',
      },
      analogy: {
        en: 'Predicting AI progress is like forecasting weather in a mountain storm. We can see the direction of the wind (scaling laws), but unexpected mountain peaks (data walls or energy shortages) can change the storm path!',
        bn: 'এআই-এর ভবিষ্যৎ পূর্বাভাস হলো পাহাড়ি ঝড়ের মতো—বাতাসের দিক জানা গেলেও পাহাড়ের বাধা মোড় ঘুরিয়ে দিতে পারে।',
      },
      technical: {
        en: 'Chinchilla Scaling Laws state optimal compute allocation balances parameter count N and dataset tokens D: C ~ 6ND. As internet text depletes, research shifts to synthetic self-play data and inference-time search scaling (e.g. OpenAI o1).',
        bn: 'চিনচিলা স্কেলিং ল অনুযায়ী মডেল সাইজ N ও ডেটা D এর ভারসাম্য বজায় রাখতে হয়; এখন সিন্থেটিক প্লে ডেটা ব্যবহ্রত হচ্ছে।',
      },
    },
    misconceptions: [
      'Assuming AI progress will linearly continue forever without encountering physical or mathematical bottlenecks.',
    ],
    feynmanChallenge: {
      question: 'What is the "Data Wall" in Large Language Model training?',
      sampleAnswer: 'The point where AI labs exhaust the world’s available high-quality human-written internet text data needed to continue traditional LLM scaling.',
    },
    quiz: [
      {
        question: 'What research strategy uses AI models to generate high-quality reasoning data to overcome the human text data wall?',
        options: ['Synthetic Data Generation / Self-Play', 'Manual Fax Transmission', 'Defragmenting Memory', 'Pixel Cropping'],
        correctAnswer: 0,
        explanation: 'Synthetic Data and self-play allow models to generate verified training data to continue scaling.',
      },
    ],
    summary: [
      'Scaling Laws predict model performance based on Compute, Data, and Parameters.',
      'The Data Wall is overcome through Synthetic Data generation and test-time compute scaling.',
      'Rigorous evidence-based thinking separates real research trends from hype.',
    ],
    glossary: [
      { term: 'Scaling Laws', definition: 'Empirical mathematical relationships mapping model performance to compute, parameters, and training data.' },
      { term: 'Synthetic Data', definition: 'Data artificially generated by computer algorithms or AI models rather than real-world events.' },
    ],
    nextLessonId: 'ai-90',
  },
  {
    id: 'ai-90',
    track: 'ai',
    chapter: 9,
    chapterTitle: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities',
    order: 90,
    difficulty: 'Advanced',
    title: {
      en: '90. Interactive Project: Evaluate an AI Prediction and Separate Evidence From Speculation',
      bn: '৯০. ইন্টারেক্টিভ প্রজেক্ট: এআই সংক্রান্ত খবরের সত্যতা ও হাইপ যাচাই',
    },
    subtitle: {
      en: 'Apply critical analysis to evaluate sensationalized news claims against technical research papers.',
      bn: 'টক শোর হাইপ বনাম আসল রিসার্চ পেপারের মেথডলজি মিলিয়ে সত্য মিথ্যা বের করার প্রজেক্ট।',
    },
    duration: '25 mins',
    objectives: [
      'Build a critical evaluation rubric for auditing media AI claims.',
      'Identify sensationalist buzzwords ("Sentient", "Self-aware", "Omnipotent").',
      'Analyze paper benchmarks, methodology, test sample sizes, and limitations.',
    ],
    prerequisites: 'Lessons 81-89 Complete',
    explanation: {
      simple: {
        en: 'In this capstone project, you become an AI Fact-Checker! When headlines scream "AI Sentient Robot Secretly Escapes Lab!", you will inspect the actual benchmark paper, check the dataset sample size, and separate sensational hype from empirical facts.',
        bn: 'এই প্রজেক্টে আপনারা ফ্যাক্ট-চেকার হিসেবে বিভিন্ন খবরের ভুয়া হাইপ আর সত্য সায়েন্টিফিক পেপারের পার্থক্য বের করবেন।',
      },
      analogy: {
        en: 'Evaluating AI hype is like inspecting a magician’s trick. The magician claims "I am flying by magic!", but a critical detective checks for the invisible thin steel wires supporting them behind the curtain.',
        bn: 'এআই হাইপ পরীক্ষা করা হলো জাদুকরের সুতা খোঁজার মতো—ম্যাজিকের পেছনের টেকনিক্যাল সুতা খুঁজে বের করা।',
      },
      technical: {
        en: 'Evaluation Framework: 1. Is sample size statistically significant? 2. Is there benchmark contamination? 3. Are baseline comparisons fair? 4. Is the claim reproducible on open weights?',
        bn: 'মূল্যায়ন ফ্রেমওয়ার্ক: স্যাম্পল সাইজ, ট্রেইনিং কনটামিনেশন, ফেয়ার বেসলাইন কম্পারিজন এবং ওপেন ওয়েটস রিপ্রোডুসিবিলিটি।',
      },
    },
    misconceptions: [
      'Believing viral social media tech demo videos without checking whether they were cherry-picked or sped up in post-production.',
    ],
    feynmanChallenge: {
      question: 'What is "Cherry-Picking" in AI video demos?',
      sampleAnswer: 'Selecting only the single successful attempt out of 100 failed trial takes and presenting it as standard reliable model performance.',
    },
    codeLab: {
      initialCode: '# AI Claim Evaluator Tool Logic\ndef evaluate_ai_claim(claim_text, has_paper, benchmark_score, cherry_picked):\n    score = 100\n    reasons = []\n    \n    if not has_paper:\n        score -= 40\n        reasons.append("No peer-reviewed research paper provided.")\n    if cherry_picked:\n        score -= 30\n        reasons.append("Demo shows cherry-picked best case video.")\n        \n    print(f"Claim: \'{claim_text}\'")\n    print(f"Credibility Score: {score}/100")\n    print("Audit Notes:", reasons)\n    return score > 60\n\nevaluate_ai_claim("New AI achieves 100% human consciousness", has_paper=False, benchmark_score=0.99, cherry_picked=True)\n',
      expectedOutput: "Claim: 'New AI achieves 100% human consciousness'\nCredibility Score: 30/100\nAudit Notes: ['No peer-reviewed research paper provided.', 'Demo shows cherry-picked best case video.']",
      explanation: 'You now possess critical engineering judgment to evaluate AI claims empirically!',
    },
    quiz: [
      {
        question: 'What is the most trustworthy source to verify groundbreaking AI architectural claims?',
        options: ['Peer-reviewed research paper with open code/data', 'Viral 15-second social video', 'Anonymous forum comment', 'Clickbait headline'],
        correctAnswer: 0,
        explanation: 'Peer-reviewed research papers providing methodology, code, and benchmark evaluations offer authoritative evidence.',
      },
    ],
    summary: [
      'Audited headlines by checking underlying paper methodologies.',
      'Identified common pitfalls: cherry-picking, benchmark contamination, unverified claims.',
      'Empirical evidence and technical understanding beat sensationalist hype.',
    ],
    glossary: [
      { term: 'Benchmark Contamination', definition: 'Flaw where test evaluation questions accidentally exist in the model’s training dataset.' },
    ],
    nextLessonId: 'ai-91',
  },
];
