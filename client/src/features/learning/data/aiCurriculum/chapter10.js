// Chapter 10: Build Your Own AI and Become an AI Creator (Lessons 91-100)

export const CHAPTER_10_LESSONS = [
  {
    id: 'ai-91',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 91,
    difficulty: 'Advanced',
    title: {
      en: '91. Choose an AI Problem Worth Solving',
      bn: '৯১. সমাধানের জন্য উপযুক্ত একটি বাস্তব এআই সমস্যা বেছে নেওয়া',
    },
    subtitle: {
      en: 'Identify domain bottlenecks, assess feasibility, and formulate clear problem statements.',
      bn: 'বাস্তব জীবনের সমস্যা শনাক্ত করা এবং সেটির এআই সমাধান নির্ধারণের ফ্রেমওয়ার্ক।',
    },
    duration: '15 mins',
    objectives: [
      'Define a practical, domain-specific problem statement suitable for an AI project.',
      'Assess AI feasibility based on data availability, technical complexity, and ROI.',
      'Differentiate meaningful utility projects from gimmick demonstrations.',
    ],
    prerequisites: 'Chapter 9 Complete',
    explanation: {
      simple: {
        en: 'The first step to becoming an AI creator is choosing a real problem! Don’t just build "yet another generic chatbot". Solve a specific problem: e.g. helping students summarize medical lecture notes, detecting plant diseases in local crops, or sorting study materials.',
        bn: 'একজন এআই ক্রিয়েটর হওয়ার প্রথম ধাপ হলো সত্যিকারের একটি বাস্তব সমস্যা নির্বাচন করা। উদাহরণ: ফসল রোগের স্ক্যানার বা মেডিকেল নোট সারসংক্ষেপক।',
      },
      analogy: {
        en: 'Choosing an AI project problem is like placing an order at a custom workshop. If you ask the carpenter "Build me something cool!", you get a useless gadget. If you ask "Build a shoe rack that fits my small hallway corner", you get a valuable solution!',
        bn: 'সমস্যা বেছে নেওয়া হলো কাঠের দোকানে মাপ বুঝিয়ে অর্ডার করার মতো—নির্দিষ্ট সমস্যা নির্দিষ্ট সমাধানের নিশ্চয়তা দেয়।',
      },
      technical: {
        en: 'Project Scoping Matrix: Evaluate Problem Intensity x Data Availability x Technical Feasibility. Ensure objective metric Y can be mathematically modeled from features X.',
        bn: 'প্রজেক্ট স্কোপিং ম্যাট্রিক্স: ডেটার সহজলভ্যতা এবং Feasibility মেপে অবজেক্টিভ নির্ধারণ।',
      },
    },
    misconceptions: [
      'Thinking a project must be as massive as ChatGPT to be impressive and useful.',
    ],
    feynmanChallenge: {
      question: 'Why is a highly focused domain project (e.g., detecting leaf disease in tomato crops) usually better for a student portfolio than a generic clone chatbot?',
      sampleAnswer: 'Because focused domain projects showcase end-to-end data curation, specialized evaluation, real utility, and domain engineering depth rather than standard API wrapping.',
    },
    quiz: [
      {
        question: 'What is the most critical first step before writing any code for a custom AI capstone project?',
        options: [
          'Formulating a clear problem statement and validating data availability',
          'Buying 10 GPUs',
          'Writing a press release',
          'Designing a shiny logo',
        ],
        correctAnswer: 0,
        explanation: 'Clearly defining the problem statement and ensuring data availability is the prerequisite for any AI project.',
      },
    ],
    summary: [
      'Target real-world bottlenecks in specific domains (healthcare, education, local business).',
      'Validate that input features X contain predictive signal for target outcome Y.',
      'Focus on high feasibility and clear utility over vague gimmicks.',
    ],
    glossary: [
      { term: 'Problem Statement', definition: 'A clear concise description of the issue that needs to be addressed by an AI system.' },
    ],
    nextLessonId: 'ai-92',
  },
  {
    id: 'ai-92',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 92,
    difficulty: 'Advanced',
    title: {
      en: '92. Design a Dataset and Define What Success Means',
      bn: '৯২. ডেটাসেট ডিজাইন করা এবং সফলতার মানদণ্ড নির্ধারণ',
    },
    subtitle: {
      en: 'Curate high-quality data, establish labeling standards, split data, and pick evaluation metrics (F1-score, MAE).',
      bn: 'উচ্চমানের ডেটা সংগ্রহ, লেবেলিং নির্দেশিকা এবং F1-স্কোর বা MAE দিয়ে পারফর্ম্যান্স পরিমাপ।',
    },
    duration: '20 mins',
    objectives: [
      'Curate and format custom datasets for training and evaluation.',
      'Establish annotation guidelines to prevent noisy or ambiguous labels.',
      'Select appropriate domain metrics (Accuracy, Precision, Recall, F1-score, RMSE).',
    ],
    prerequisites: 'Lesson 91 Complete',
    explanation: {
      simple: {
        en: 'Data is the food of AI! If you feed it junk, your model outputs junk. Designing a dataset means gathering clean examples, labeling them accurately, and defining your target grade (e.g. "We want 90%+ F1-score on medical text classification").',
        bn: 'ডেটা হলো এআই-এর খাবার। ডেটাসেট ডিজাইনের অর্থ হলো সঠিক ডেটা সংগ্রহ করা এবং কাঙ্ক্ষিত F1-স্কোর লক্ষ্য হিসেবে স্থির করা।',
      },
      analogy: {
        en: 'Designing a dataset is like preparing ingredients for a 5-star restaurant. You wash the vegetables, chop them into uniform sizes, and discard spoiled pieces before cooking starts.',
        bn: 'ডেটাসেট তৈরি করা হলো রান্নার আগে সবজি ধুয়ে পরিষ্কার করে কেটে রেডি করার মতো।',
      },
      technical: {
        en: 'Dataset curation: Maintain strict schema, eliminate duplicate records, check label distribution skewness, and split using stratified train/val/test splits to preserve class ratios.',
        bn: 'স্ট্র্যাটিফাইড ট্রেন/ভাল/টেস্ট স্প্লিট ব্যবহার করে ডেটার ক্লাস মেট্রিকে ভারসাম্য রাখা আবশ্যক।',
      },
    },
    misconceptions: [
      'Using pure accuracy as your success metric when working with imbalanced datasets (e.g. 99% negative fraud cases).',
    ],
    feynmanChallenge: {
      question: 'Why is Precision and Recall better than Accuracy for evaluating a rare disease detection AI?',
      sampleAnswer: 'In rare disease detection (where 99% of patients are healthy), a dumb model predicting "Healthy" for everyone gets 99% accuracy but fails 100% of sick patients. Precision and Recall measure actual true positive detection performance.',
    },
    quiz: [
      {
        question: 'Which evaluation metric balances both Precision and Recall into a single harmonic mean score?',
        options: ['F1-Score', 'Raw Accuracy', 'Loss Function', 'Epoch Count'],
        correctAnswer: 0,
        explanation: 'F1-Score is the harmonic mean of Precision and Recall, ideal for imbalanced classification tasks.',
      },
    ],
    summary: [
      'Curate clean, well-annotated datasets with clear guidelines.',
      'Use stratified splits to prevent class ratio imbalance leakages.',
      'Pick domain metrics (F1-score, Precision, Recall, MAE) matching real risk tolerance.',
    ],
    glossary: [
      { term: 'F1-Score', definition: 'Harmonic mean of Precision and Recall providing a balanced metric for classification.' },
      { term: 'Stratified Sampling', definition: 'Sampling method ensuring sub-groups are proportionally represented.' },
    ],
    nextLessonId: 'ai-93',
  },
  {
    id: 'ai-93',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 93,
    difficulty: 'Advanced',
    title: {
      en: '93. Select an Approach: Train From Scratch, Fine-Tune, Use a Pretrained Model, or Use an API',
      bn: '৯৩. মডেলের পথ নির্বাচন: স্ক্র্যাচ থেকে ট্রেইন, ফাইন-টিউন, প্রি-ট্রেইনড মডেল নাকি এপিআই',
    },
    subtitle: {
      en: 'Map your compute budget and dataset size to the optimal engineering quadrant.',
      bn: 'বাজেট এবং ডেটার পরিমাণের উপর নির্ভর করে মডেল তৈরির সেরা পদ্ধতি বেছে নেওয়ার কৌশল।',
    },
    duration: '20 mins',
    objectives: [
      'Evaluate the 4 core AI engineering pathways based on dataset size and GPU budget.',
      'Understand LoRA (Low-Rank Adaptation) and PEFT for fine-tuning LLMs on single GPUs.',
      'Choose the most cost-effective approach for your capstone project.',
    ],
    prerequisites: 'Lesson 92 Complete',
    explanation: {
      simple: {
        en: 'How should you build your AI? 1. API: fast, zero GPU needed. 2. Pretrained Model: free open-weights, run locally. 3. Fine-Tuning (LoRA): customize an open LLM on your dataset for \$5. 4. Train from Scratch: requires millions of dollars in GPUs!',
        bn: 'আপনার এআই বানানোর ৪টি রাস্তা: ১. এপিআই, ২. প্রি-ট্রেইনড মডেল, ৩. ফাইন-টিউন (LoRA দিয়ে অল্প খরচে), ৪. স্ক্র্যাচ থেকে ট্রেইনিং।',
      },
      analogy: {
        en: '1. API is buying a suit off the rack. 2. Pretrained model is inheriting your dad’s suit. 3. Fine-tuning is taking that inherited suit to a tailor for custom adjustments (LoRA). 4. Training from scratch is buying a sheep farm to weave yarn into custom fabric!',
        bn: 'এপিআই রেডিমেড কোটের মতো, আর ফাইন-টিউনিং হলো দর্জির কাছে সাইজ টিউন করে ফিট করে নেওয়ার মতো।',
      },
      technical: {
        en: 'LoRA freezes base weights W_0 and injects trainable rank decomposition matrices A and B (W = W_0 + B x A), reducing trainable parameter count by 99% while preserving model capability.',
        bn: 'LoRA মূল ওজন W_0 ফ্রিজ রেখে কম র্যাঙ্কের ট্রেইনেবল এ এবং বি ম্যাট্রিক্স দিয়ে ৯৯% কম খরচে ফাইন-টিউন করে।',
      },
    },
    misconceptions: [
      'Assuming you must train a base LLM from scratch to build a specialized domain AI assistant.',
    ],
    feynmanChallenge: {
      question: 'How does LoRA (Low-Rank Adaptation) make LLM fine-tuning possible on consumer GPUs?',
      sampleAnswer: 'LoRA freezes the original massive weight matrices and only trains tiny low-rank adapter matrices alongside them, reducing memory requirements and trainable parameters by over 99%.',
    },
    quiz: [
      {
        question: 'Which Parameter-Efficient Fine-Tuning (PEFT) technique trains small low-rank adapter matrices while freezing base model weights?',
        options: ['LoRA', 'Full Retrain', 'Kernel Panic', 'Overfitting'],
        correctAnswer: 0,
        explanation: 'LoRA (Low-Rank Adaptation) enables efficient fine-tuning by injecting small rank-decomposition matrices.',
      },
    ],
    summary: [
      'Select building approach based on compute budget and domain data size.',
      'Fine-tuning with LoRA offers deep customization without massive hardware costs.',
      'APIs offer the fastest prototyping speed for natural language capabilities.',
    ],
    glossary: [
      { term: 'LoRA', definition: 'Low-Rank Adaptation: efficient fine-tuning technique freezing pretrained model weights.' },
      { term: 'PEFT', definition: 'Parameter-Efficient Fine-Tuning techniques for customizing large models.' },
    ],
    nextLessonId: 'ai-94',
  },
  {
    id: 'ai-94',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 94,
    difficulty: 'Advanced',
    title: {
      en: '94. Build a Baseline and Compare It Against a Better Model',
      bn: '৯৪. প্রাথমিক বেসলাইন তৈরি এবং উন্নত মডেলের সাথে তুলনা',
    },
    subtitle: {
      en: 'Always establish a simple benchmark first (dummy baseline or simple rule) before adding complexity.',
      bn: 'জটিল মডেল বানানোর আগে সহজ ডামি রুলস বেসলাইন বানিয়ে তুলনা করার নিয়ম।',
    },
    duration: '20 mins',
    objectives: [
      'Build a simple Heuristic or Dummy Baseline model first.',
      'Compare complex model metrics against baseline scores to prove actual added value.',
      'Avoid the trap of over-complexifying models without benchmark validation.',
    ],
    prerequisites: 'Lesson 93 Complete',
    explanation: {
      simple: {
        en: 'Never build a complex neural network without building a simple Baseline first! A Baseline is the simplest possible solution (e.g. predicting the most frequent class or using a basic rule). If your 100M parameter model gets 75% accuracy while a 2-line baseline gets 74%, your complex model isn’t actually working!',
        bn: 'বেসলাইন হলো সবচেয়ে সাধারণ সমাধান। জটিল নিউরাল নেটওয়ার্ক যদি সাধারণ বেসলাইনের চেয়ে ভালো স্কোর না দেয় তবে তা ব্যর্থ।',
      },
      analogy: {
        en: 'Building a baseline is like testing your running speed against a walking pace before buying \$500 carbon-fiber marathon shoes to verify if the shoes actually make you faster.',
        bn: 'বেসলাইন হলো খালি পায়ে দৌড়ে দেখা আর তারপর দামী রানিং জুতো পরে পার্থক্য যাচাই করার মতো।',
      },
      technical: {
        en: 'Baseline protocol: Implement DummyClassifier(strategy="most_frequent") or simple LogisticRegression. Measure baseline F1/RMSE score as benchmark baseline minimum performance floor.',
        bn: 'DummyClassifier দিয়ে নূন্যতম বেসলাইন পারফর্ম্যান্স ফ্লোর মেজার করে জটিল মডেলের যথার্থতা প্রমাণ করুন।',
      },
    },
    misconceptions: [
      'Assuming that a deep learning model is working great simply because it outputs a high score, without comparing it against a zero-effort baseline.',
    ],
    feynmanChallenge: {
      question: 'Why is creating a simple baseline model the first technical step in model development?',
      sampleAnswer: 'To establish a minimum performance benchmark that proves whether a more complex model provides genuine statistical improvement over trivial guessing or simple rules.',
    },
    quiz: [
      {
        question: 'What is the purpose of establishing a simple Dummy or Heuristic Baseline model in machine learning?',
        options: [
          'To set a minimum benchmark score to verify if complex models add true value',
          'To replace the test dataset',
          'To slow down training speed',
          'To consume cloud storage',
        ],
        correctAnswer: 0,
        explanation: 'A baseline sets a benchmark floor ensuring complex model investments deliver real performance gains.',
      },
    ],
    summary: [
      'Always start with the simplest baseline (DummyClassifier or basic heuristic).',
      'Compare complex neural networks against baseline scores.',
      'Empirically justify every added hyperparameter and layer complexity.',
    ],
    glossary: [
      { term: 'Baseline Model', definition: 'A simple model used as a reference point for comparing performance of more sophisticated models.' },
    ],
    nextLessonId: 'ai-95',
  },
  {
    id: 'ai-95',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 95,
    difficulty: 'Advanced',
    title: {
      en: '95. Improve Performance Through Data, Experiments, Evaluation, and Error Analysis',
      bn: '৯৫. ডেটা, পরীক্ষা ও এরর অ্যানালাইসিসের মাধ্যমে পারফর্ম্যান্সের উন্নতি',
    },
    subtitle: {
      en: 'Adopt Data-Centric AI: inspect misclassified samples, fix noisy labels, and tune hyperparameters systematically.',
      bn: 'এরর অ্যানালাইসিস করে ভুল হওয়া স্যাম্পলগুলো ঠিক করার মাধ্যমে মডেলের গুণগত উন্নতি সাধন।',
    },
    duration: '25 mins',
    objectives: [
      'Perform Error Analysis by manually inspecting misclassified validation samples.',
      'Apply Data-Centric AI principles (cleaning bad labels beats tweaking hyperparameters).',
      'Use systematic experiment tracking tools (Weights & Biases, MLflow).',
    ],
    prerequisites: 'Lesson 94 Complete',
    explanation: {
      simple: {
        en: 'When your model makes mistakes, don’t just randomly change code! Open the test set and look at the exact 20 samples your model failed on. Often, you will find mislabeled data, poor lighting, or missing context. Fix the data, and your model performance instantly jumps!',
        bn: 'মডেল ভুল করলে কোড না বদলে ভুল হওয়া ২০টি স্যাম্পল খুলে দেখুন। ডেটা পরিষ্কার করলে মডেলের পারফর্ম্যান্স এক লাফেই বেড়ে যায়।',
      },
      analogy: {
        en: 'Error Analysis is like reviewing wrong answers on your marked exam paper. Instead of re-reading the entire textbook blindly, you focus exclusively on why you missed Question 4 and Question 9!',
        bn: 'এরর অ্যানালাইসিস হলো পরীক্ষার খাতায় লাল দাগ দেওয়া ভুল উত্তরগুলো দেখে কেবল সেগুলো শুধরে নেওয়ার মতো।',
      },
      technical: {
        en: 'Error Analysis workflow: Create Confusion Matrix -> Extract False Positives and False Negatives -> Categorize failure root causes (Label Noise 35%, Ambiguous Syntax 45%, Missing Feature 20%) -> Remediate dataset.',
        bn: 'কনফিউশন ম্যাট্রিক্স থেকে ফলস পজিটিভ স্যাম্পল চিহ্নিত করে মূল কারণ চিহ্নিতকরণ ও সলভ।',
      },
    },
    misconceptions: [
      'Spending 80% of your time tweaking model architecture hyperparameters rather than fixing dataset quality errors.',
    ],
    feynmanChallenge: {
      question: 'What is the difference between Model-Centric AI and Data-Centric AI?',
      sampleAnswer: 'Model-Centric AI holds data fixed and tries to improve results by tweaking code/architectures. Data-Centric AI holds architecture fixed and systematically cleans, enriches, and fixes the training dataset.',
    },
    codeLab: {
      initialCode: '# Error Analysis Simulation\nmisclassified_samples = [\n    {"text": "Service was not bad!", "true": "Positive", "pred": "Negative", "cause": "Negation phrasing"},\n    {"text": "Great... broken item", "true": "Negative", "pred": "Positive", "cause": "Sarcasm"}\n]\n\nprint("Found", len(misclassified_samples), "error patterns to fix in dataset!")\nfor sample in misclassified_samples:\n    print(f"- Text: \'{sample[\'text\']}\' | Root Cause: {sample[\'cause\']}")\n',
      expectedOutput: "Found 2 error patterns to fix in dataset!\n- Text: 'Service was not bad!' | Root Cause: Negation phrasing\n- Text: 'Great... broken item' | Root Cause: Sarcasm",
      explanation: 'Error analysis uncovers actionable edge-case patterns to improve training data quality.',
    },
    quiz: [
      {
        question: 'Which engineering philosophy focuses on systematically improving dataset quality while holding model code fixed?',
        options: ['Data-Centric AI', 'Model-Centric AI', 'Hardware Overclocking', 'Brute Force Tuning'],
        correctAnswer: 0,
        explanation: 'Data-Centric AI prioritizes iteratively enhancing data quality, labeling accuracy, and coverage.',
      },
    ],
    summary: [
      'Manually inspect misclassified False Positives and False Negatives.',
      'Data-Centric AI improves results faster than tuning hyperparameter knobs.',
      'Use experiment tracking (MLflow, WandB) to record metrics and model artifacts.',
    ],
    glossary: [
      { term: 'Error Analysis', definition: 'The process of inspecting misclassified validation samples to diagnose failure modes.' },
      { term: 'Confusion Matrix', definition: 'Table layout visualizing algorithm performance across true vs predicted classes.' },
    ],
    nextLessonId: 'ai-96',
  },
  {
    id: 'ai-96',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 96,
    difficulty: 'Advanced',
    title: {
      en: '96. Understand Compute Budgets, Model Licensing, Privacy, and Deployment Costs',
      bn: '৯৬. কম্পিউটিং বাজেট, মডেল লাইসেন্স, ডেটা প্রাইভেসি এবং ডিপ্লয়মেন্ট খরচ',
    },
    subtitle: {
      en: 'Navigate open-source licenses (MIT, Apache 2.0, Llama Community License), hosting costs, and compliance.',
      bn: 'ওপেন সোর্স লাইসেন্স (MIT, Apache 2.0), হোস্টিং বিল এবং প্রাইভেসি আইন মেনে চলার উপায়।',
    },
    duration: '20 mins',
    objectives: [
      'Understand open-source software and model weight licenses (MIT, Apache 2.0, Llama 3 Community).',
      'Calculate model inference host costs (Serverless endpoints vs Dedicated GPU instances).',
      'Ensure data privacy compliance (GDPR, HIPAA, zero data retention policies).',
    ],
    prerequisites: 'Lesson 95 Complete',
    explanation: {
      simple: {
        en: 'Before launching an AI app, check the rules and bill! 1. License: MIT/Apache 2.0 allows commercial use; some licenses restrict commercial sales. 2. Hosting Cost: running a dedicated GPU server 24/7 costs \$500+/month; serverless APIs charge only when users click!',
        bn: 'অ্যাপ চালুর আগে হোস্টিং বিল এবং লাইসেন্স চেক করুন। MIT/Apache ২.০ বাণিজ্যিক ব্যবহারের অনুমতি দেয়, আর সার্ভারলেস এপিআই খরচে সাশ্রয়ী।',
      },
      analogy: {
        en: 'Checking AI licenses and deployment costs is like reading lease terms before opening a store. If you sign a lease for a giant palace (dedicated GPU) when you only sell 2 coffees a day, you will go bankrupt!',
        bn: 'লাইসেন্স ও খরচ চেক করা হলো দোকান ভাড়ার শর্ত পড়ার মতো—বিক্রি না থাকলে বড় দোকান দেউলিয়া বানাতে পারে।',
      },
      technical: {
        en: 'License matrix: MIT/Apache 2.0 (Permissive commercial). Llama 3 Community (Commercial up to 700M MAU). GPU hosting: AWS g5.xlarge (~$1.00/hr) vs RunPod / Modal Serverless scale-to-zero per-second billing.',
        bn: 'MIT/Apache Permissive; Llama 3 700M ব্যবহারকারী অনুমতি দেয়। সার্ভারলেস স্কেল-টু-জিরো খরচ বাঁচায়।',
      },
    },
    misconceptions: [
      'Assuming all open-source models downloaded from Hugging Face allow unrestricted commercial sub-licensing without checking original license terms.',
    ],
    feynmanChallenge: {
      question: 'Why is Serverless GPU hosting (scale-to-zero) more cost-effective for a student project than renting a 24/7 dedicated AWS GPU instance?',
      sampleAnswer: 'Serverless GPU hosting charges per millisecond only when requests arrive and scales down to zero cost when idle, whereas dedicated GPUs charge continuously 24/7 regardless of traffic.',
    },
    quiz: [
      {
        question: 'Which open-source license allows completely free commercial use, modification, and distribution with minimal restrictions?',
        options: ['MIT / Apache 2.0', 'GPL v3 strict', 'Non-Commercial Research Only', 'Closed Proprietary'],
        correctAnswer: 0,
        explanation: 'MIT and Apache 2.0 are permissive open-source licenses granting commercial usage and modification rights.',
      },
    ],
    summary: [
      'Review model weight licenses (MIT, Apache 2.0, Llama license terms).',
      'Serverless GPU hosting reduces idle costs via scale-to-zero pricing.',
      'Maintain strict data privacy and compliance (GDPR zero-data retention).',
    ],
    glossary: [
      { term: 'Apache 2.0', definition: 'A permissive open-source license allowing commercial use and modification with patent grants.' },
      { term: 'Serverless GPU', definition: 'On-demand GPU cloud infrastructure billing strictly per millisecond of execution.' },
    ],
    nextLessonId: 'ai-97',
  },
  {
    id: 'ai-97',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 97,
    difficulty: 'Advanced',
    title: {
      en: '97. Turn Your Model Into an Application With an API and User Interface',
      bn: '৯৭. মডেলকে এপিআই এবং ফ্রন্টএন্ড ইউআই যুক্ত ওয়েব অ্যাপ্লিকেশনে রূপান্তর',
    },
    subtitle: {
      en: 'Wrap Python inference in FastAPI or Flask and build a responsive frontend using React, HTML, and CSS.',
      bn: 'ফাস্ট-এপিআই (FastAPI) এবং রিঅ্যাক্ট (React) ব্যবহার করে এআই মডেলের সাথে সুন্দর ফ্রন্টএন্ড যুক্ত করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Wrap a Python ML model in a high-performance REST API using FastAPI.',
      'Connect a React web interface to fetch predictions from FastAPI endpoints.',
      'Implement async request handlers, CORS settings, and Pydantic request models.',
    ],
    prerequisites: 'Lesson 96 Complete',
    explanation: {
      simple: {
        en: 'A model sitting in a Jupyter Notebook cannot be used by real people! In this lesson, you turn your Python code into a web server using FastAPI, and build a beautiful web form in React where users submit data and view AI predictions instantly.',
        bn: 'নোটবুকের কোড কেউ সরাসরি ব্যবহার করতে পারে না। FastAPI দিয়ে ওয়েব সার্ভার বানিয়ে রিঅ্যাক্ট ইন্টারফেসে আসল এআই অ্যাপ চালু করার নিয়ম।',
      },
      analogy: {
        en: 'FastAPI is like putting a glass ordering window on your kitchen wall. React is the sleek customer counter in front. Customers walk up to the counter, place an order through the window, and receive hot food!',
        bn: 'FastAPI হলো কাঁচের গ্লাস অর্ডারিং উইন্ডো, আর React হলো সামনের কাউন্টার যেখানে কাস্টমার এসে সার্ভিস নেয়।',
      },
      technical: {
        en: 'FastAPI relies on Starlette and Pydantic for input data validation. `@app.post("/predict")` receives JSON payload, executes `model.predict()`, and returns typed JSON responses with async event loops.',
        bn: 'FastAPI Pydantic ডাটা মডেল ভ্যালিডেট করে async রিকুয়েস্টে `model.predict()` রান করে ফলাফল ব্যাক করে।',
      },
    },
    misconceptions: [
      'Forgetting to enable CORS (Cross-Origin Resource Sharing) headers on your FastAPI server, causing browser fetch errors on frontend requests.',
    ],
    feynmanChallenge: {
      question: 'What is the role of FastAPI when turning a Python machine learning model into a web service?',
      sampleAnswer: 'FastAPI acts as the HTTP web server framework, converting incoming client web requests into JSON data, passing features to the Python model, and returning predictions to the UI.',
    },
    codeLab: {
      initialCode: '# FastAPI Model Server Endpoint Simulation\nfrom pydantic import BaseModel\n\nclass InputData(BaseModel):\n    text: str\n\ndef predict_endpoint(data: InputData):\n    # Simulate model prediction logic\n    sentiment = "Positive" if "love" in data.text.lower() else "Neutral"\n    return {"input": data.text, "prediction": sentiment, "status": 200}\n\nres = predict_endpoint(InputData(text="I love learning AI!"))\nprint("FastAPI Response JSON:", res)\n',
      expectedOutput: "FastAPI Response JSON: {'input': 'I love learning AI!', 'prediction': 'Positive', 'status': 200}",
      explanation: 'FastAPI validates incoming JSON payloads and serves predictions via standard web HTTP endpoints.',
    },
    quiz: [
      {
        question: 'Which modern Python web framework is celebrated for ultra-fast asynchronous performance and automatic OpenAPI documentation for ML serving?',
        options: ['FastAPI', 'WordPress', 'jQuery', 'Tkinter'],
        correctAnswer: 0,
        explanation: 'FastAPI is a high-performance Python web framework ideal for building production ML model REST APIs.',
      },
    ],
    summary: [
      'FastAPI wraps Python model inference into high-speed REST endpoints.',
      'Pydantic validates input request payload schemas automatically.',
      'Connect React or Vanilla JavaScript frontends via fetch API requests.',
    ],
    glossary: [
      { term: 'FastAPI', definition: 'Modern, fast (high-performance) web framework for building APIs with Python.' },
      { term: 'CORS', definition: 'Cross-Origin Resource Sharing: security mechanism allowing restricted resources to be requested from another domain.' },
    ],
    nextLessonId: 'ai-98',
  },
  {
    id: 'ai-98',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 98,
    difficulty: 'Advanced',
    title: {
      en: '98. Deploy, Monitor, Test, and Maintain Your AI Project',
      bn: '৯৮. এআই প্রজেক্ট ডিপ্লয়, মনিটর, টেস্ট এবং রক্ষণাবেক্ষণ',
    },
    subtitle: {
      en: 'Deploy using Docker, Render/Vercel, monitor Data Drift, latency spikes, and automated integration tests.',
      bn: 'ডকার (Docker), রেন্ডার/ভার্সেল এ অ্যাপ হোস্টিং এবং ডেটা ড্রিফট (Data Drift) পর্যবেক্ষণ।',
    },
    duration: '25 mins',
    objectives: [
      'Package AI apps into reproducible Docker container images.',
      'Deploy full-stack AI services to platforms like Render, Vercel, or Hugging Face Spaces.',
      'Monitor Data Drift and Model Performance Decay over time in production.',
    ],
    prerequisites: 'Lesson 97 Complete',
    explanation: {
      simple: {
        en: 'Deploying means publishing your AI app to the internet so anyone around the world can open your link! We containerize the app using Docker so it runs identically on any cloud server. We also set up monitoring to alert us if the model performance drifts over time.',
        bn: 'ডিপ্লয় করার মাধ্যমে পৃথিবীর যেকোনো স্থান থেকে আপনার এআই অ্যাপ ব্যবহার করা যায়। ডকার অ্যাপটিকে একটি বক্সে প্যাক করে সার্ভারে চালু করে।',
      },
      analogy: {
        en: 'Docker is like a standardized shipping container. Whether it travels on a cargo ship, a train, or a semi-truck, the box fits perfectly without altering the goods inside!',
        bn: 'ডকার হলো কনটেইনারের মতো—জাহাজ, ট্রেন বা ট্রাক যেখানেই যাক ভেতরে মালপত্র একইভাবে সুরক্ষিত থাকে।',
      },
      technical: {
        en: 'Dockerfile multi-stage build packages Python dependencies. Deploy to Render/Cloud Run. Monitor Data Drift (Kolmogorov-Smirnov test on input distribution changes P(X)) to trigger automated retraining pipelines.',
        bn: 'ডকারফাইল বিল্ড করে ক্লাউড রানে ডিপ্লয় করা হয় এবং Kolmogorov-Smirnov টেস্ট দিয়ে ডেটা ড্রিফট মনিটর করা হয়।',
      },
    },
    misconceptions: [
      'Assuming that once a model is deployed to production, it will run accurately forever without maintenance or retraining.',
    ],
    feynmanChallenge: {
      question: 'What is "Data Drift" and why does it degrade deployed production model accuracy?',
      sampleAnswer: 'Data Drift occurs when real-world production input data changes over time away from the original training distribution, causing model accuracy to decay.',
    },
    quiz: [
      {
        question: 'Which tool packages code, runtime dependencies, and libraries into isolated, reproducible container images?',
        options: ['Docker', 'Photoshop', 'Excel', 'FTP Client'],
        correctAnswer: 0,
        explanation: 'Docker packages software into standard container images guaranteeing identical execution across servers.',
      },
    ],
    summary: [
      'Docker containerizes applications for consistent cloud deployment.',
      'Deploy backend to Render/Modal/Cloud Run and frontend to Vercel/Netlify.',
      'Monitor Data Drift to detect when production models require retraining.',
    ],
    glossary: [
      { term: 'Docker', definition: 'Platform for developing, shipping, and running applications in lightweight containers.' },
      { term: 'Data Drift', definition: 'The variation in model input data over time compared to training baseline data.' },
    ],
    nextLessonId: 'ai-99',
  },
  {
    id: 'ai-99',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 99,
    difficulty: 'Advanced',
    title: {
      en: '99. Document Your Work, Explain Your Design Decisions, and Build a Portfolio',
      bn: '৯৯. ডকুমেন্টস তৈরি, ডিজাইন সিদ্ধান্ত প্রকাশ এবং পোর্টফোলিও গঠন',
    },
    subtitle: {
      en: 'Craft professional GitHub READMEs, architecture diagrams, Model Cards, and trade-off write-ups.',
      bn: 'গিটহাব রিডমি (README), আর্কিটেকচার ডায়াগ্রাম ও মডেল কার্ড লিখে নিজের কাজের পোর্টফোলিও সাজানো।',
    },
    duration: '20 mins',
    objectives: [
      'Write comprehensive GitHub README documentation with architecture diagrams.',
      'Create standardized Model Cards outlining model capabilities, limitations, and ethical considerations.',
      'Present your AI portfolio to tech recruiters, open-source communities, and potential employers.',
    ],
    prerequisites: 'Lesson 98 Complete',
    explanation: {
      simple: {
        en: 'If nobody can read your documentation, your amazing project remains invisible! A great AI creator documents their work: explaining the problem solved, showing a live demo GIF, publishing a Model Card detailing limitations, and listing engineering design trade-offs.',
        bn: 'ডকুমেন্টেশন ছাড়া ভালো প্রজেক্টও মানুষের চোখে পড়ে না। গিটহাব রিডমিতে আর্কিটেকচার, ডেমো জিআইএফ ও মডেল কার্ড থাকা পোর্টফোলিওর প্রাণ।',
      },
      analogy: {
        en: 'Documenting your project is like putting a clear museum display sign next to an artwork. Without the sign, visitors see an odd stone carving. With the sign, visitors understand the masterpiece’s history, materials, and creation technique!',
        bn: 'ডকুমেন্টেশন হলো মিউজিয়ামে প্রদর্শনীর তথ্য তুলে ধরার নামফলকের মতো, যা দর্শনার্থীদের স্পেসিফাইড তথ্য জানায়।',
      },
      technical: {
        en: 'Model Card specification (Mitchell et al.): Model Details, Intended Use, Factors, Metrics, Training Data, Evaluation Data, Quantitative Analyses, Ethical Considerations, Caveats & Recommendations.',
        bn: 'মডেল কার্ড স্ট্যান্ডার্ড (Mitchell et al.): ইনটেন্ডেড ইউজ, ট্রেনিং মেট্রিক্স, এভালুয়েশন ডেটা এবং এথিক্যাল গুডবাইসের সম্পূর্ণ তালিকা।',
      },
    },
    misconceptions: [
      'Publishing a bare GitHub repository with no README file, no setup instructions, and no live demo link.',
    ],
    feynmanChallenge: {
      question: 'What key information should be included in a standardized AI Model Card?',
      sampleAnswer: 'Intended usage, training data sources, evaluation metrics, known performance limitations, bias disclosures, and ethical safety boundaries.',
    },
    quiz: [
      {
        question: 'What document provides a standardized summary of an AI model’s performance, limitations, training data, and intended use cases?',
        options: ['Model Card', 'License Agreement', 'Log File', 'Compiled Binary'],
        correctAnswer: 0,
        explanation: 'A Model Card is a standardized document detailing model capabilities, limitations, and evaluation metrics.',
      },
    ],
    summary: [
      'Write rich GitHub README files featuring live demos and setup steps.',
      'Include Model Cards documenting training data, metrics, and limitations.',
      'A polished portfolio showcases your first-principles AI engineering mastery.',
    ],
    glossary: [
      { term: 'Model Card', definition: 'A short document providing benchmarked evaluation and context for a machine learning model.' },
    ],
    nextLessonId: 'ai-100',
  },
  {
    id: 'ai-100',
    track: 'ai',
    chapter: 10,
    chapterTitle: 'Chapter 10: Build Your Own AI and Become an AI Creator',
    order: 100,
    difficulty: 'Advanced',
    title: {
      en: '100. Final Capstone: Present an Original AI Project and Explain How It Works From First Principles',
      bn: '১০০. চূড়ান্ত ক্যাপস্টোন: নিজস্ব এআই প্রজেক্ট উপস্থাপন ও ফার্স্ট প্রিন্সিপল ব্যাখ্যা',
    },
    subtitle: {
      en: 'Congratulations! Synthesize your 100-lesson AI journey into an original capstone presentation.',
      bn: 'অভিনন্দন! ১০০টি লেসনের এই সফর সম্পন্ন করে নিজের এআই প্রজেক্ট ফার্স্ট প্রিন্সিপল থেকে সুন্দরভাবে পরিবেশন করুন।',
    },
    duration: '30 mins',
    objectives: [
      'Synthesize concepts across all 10 chapters (Data -> Math -> Architecture -> Training -> Fine-tuning -> App Deployment -> Ethics).',
      'Explain your original capstone project from First Principles without jargon reliance.',
      'Graduate from beginner to confident AI Creator and continuous learner.',
    ],
    prerequisites: 'Lessons 1-99 Complete',
    explanation: {
      simple: {
        en: 'CONGRATULATIONS! You have completed all 100 lessons of the AI Academy! You started from "What is AI?" and progressed through hardware, mathematics, neural networks, LLMs, RAG, agents, and full-stack development. You now hold the mental model and practical skill to build the future of AI!',
        bn: 'অভিনন্দন! আপনি এআই একাডেমির ১০০টি লেসন সম্পূর্ণ করেছেন! শূন্য থেকে শুরু করে আপনি এআই-এর জটিল কারিগরি কৌশল ও আর্কিটেকচার গভীরভাবে আয়ত্ত করেছেন।',
      },
      analogy: {
        en: 'You began this course as an admiring passenger in a high-tech vehicle. Today, you understand every nut, bolt, V12 engine, GPU pipeline, and steering mechanism—and you can build your own flying vehicle from scratch!',
        bn: 'আপনি যাত্রী হিসেবে শুরু করেছিলেন, কিন্তু আজ আপনি নিজেই গাড়ি তৈরি করার মতো কারিগরি সক্ষম একজন এআই ইঞ্জিনিয়ার ও ক্রিয়েটর!',
      },
      technical: {
        en: 'First Principles Master Checklist: Data vectorization -> Loss minimization via SGD/AdamW -> Transformer attention weights -> Deployment inference optimization -> Guardrail alignment -> Autonomous System Creation.',
        bn: 'ফার্স্ট প্রিন্সিপলস মাস্টার চেকপ্রসেস: ডেটা ভেক্টরাইজেশন, গ্র্যাডিয়েন্ট ডিসেন্ট, ট্র্যান্সফরমার এটেনশন, ডিপ্লয়মেন্ট ও সেফটি অ্যালাইনমেন্ট।',
      },
    },
    misconceptions: [
      'Believing your learning ends here (AI evolves continuously; stay curious and keep building!).',
    ],
    feynmanChallenge: {
      question: 'Explain the complete end-to-end journey of data becoming a real-world AI prediction from First Principles in 4 sentences.',
      sampleAnswer: '1. Real-world information is collected and vectorized into numerical tensors. 2. A neural network passes tensors through weighted matrix layers, calculating a loss error against target targets. 3. Backpropagation adjusts weight parameters using gradient descent to minimize loss over training. 4. The frozen trained model checkpoint is deployed via an API backend to serve real-time predictions to end users.',
    },
    codeLab: {
      initialCode: '# Final Graduation Script\ndef graduation_check(lessons_completed):\n    if lessons_completed == 100:\n        return "STATUS: GRADUATED! You are now a certified AI Creator."\n    return "Keep going!"\n\nprint(graduation_check(100))\n',
      expectedOutput: 'STATUS: GRADUATED! You are now a certified AI Creator.',
      explanation: '🎉 CONGRATULATIONS ON COMPLETING THE 100-LESSON INTERACTIVE AI ACADEMY! 🎉',
    },
    quiz: [
      {
        question: 'What is the fundamental learning pipeline behind all modern machine learning models?',
        options: [
          'Data -> Numerical Vectors -> Neural Network -> Loss Function -> Gradient Descent Parameter Updates -> Evaluation -> Application',
          'Magic -> Code -> Web Page',
          'Database -> Copy Paste -> Print',
          'HTML -> CSS -> Font Size',
        ],
        correctAnswer: 0,
        explanation: 'This complete pipeline represents the first-principles foundation of modern Machine Learning.',
      },
    ],
    summary: [
      'Mastered the complete 100-lesson AI Academy curriculum.',
      'Understood hardware, math, data, neural networks, transformers, RAG, agents, and full-stack deployment.',
      'Equipped to independently design, build, evaluate, and explain original AI applications from First Principles.',
    ],
    glossary: [
      { term: 'AI Creator', definition: 'An engineer capable of conceptualizing, building, evaluating, and deploying AI systems from first principles.' },
    ],
    nextLessonId: null,
  },
];
