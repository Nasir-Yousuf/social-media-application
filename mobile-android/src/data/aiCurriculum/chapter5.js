// Chapter 5: Data, Machine Learning, and Neural Networks (Lessons 41-50)

export const CHAPTER_5_LESSONS = [
  {
    id: 'ai-41',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 41,
    difficulty: 'Beginner',
    title: {
      en: '41. What Is Data? Text, Numbers, Images, Audio, and Video',
      bn: '৪১. ডেটা কী? টেক্সট, নম্বর, ইমেজ, অডিও ও ভিডিও কীভাবে ডেটায় পরিণত হয়',
    },
    subtitle: {
      en: 'Explore structured tabular data vs unstructured multimodal data.',
      bn: 'স্ট্রাকচার্ড ও আনস্ট্রাকচার্ড ডেটার সহজ ও প্রাঞ্জল পরিচিতি।',
    },
    duration: '15 mins',
    objectives: [
      'Distinguish Structured Data (tables/spreadsheets) from Unstructured Data (text, images, audio, video).',
      'Understand how unstructured data modalities are converted into numerical tensors.',
      'Explain why 80%+ of real-world data is unstructured.',
    ],
    prerequisites: 'Chapter 4 Complete',
    explanation: {
      simple: {
        en: 'Data is the raw fuel for AI! Structured data fits neatly in a spreadsheet table (age, salary, status). Unstructured data (photos, songs, articles, videos) has no columns—so AI converts it into high-dimensional numerical arrays first.',
        bn: 'ডেটা হলো AI-এর জ্বালানি। স্প্রেডশিটের গুছানো ছক হলো স্ট্রাকচার্ড ডেটা। আর ছবি, গান ও ভিডিও হলো আনস্ট্রাকচার্ড ডেটা।',
      },
      analogy: {
        en: 'Structured data is like egg cartons with individual compartments for each egg. Unstructured data is like scrambled eggs in a bowl—you have to process it before you can count individual items!',
        bn: 'স্ট্রাকচার্ড ডেটা ডিমের ট্রে-র মতো যেখানে সব আলাদা থাকে। আর আনস্ট্রাকচার্ড হলো বাটিতে রাখা স্ক্র্যাম্বলড এগস।',
      },
      technical: {
        en: 'Structured Data uses Relational Schema / DataFrames (Tabular: N × D). Unstructured Data Modalities: Images (H × W × C tensor), Audio (Spectrogram frequency matrix), Text (Token sequence IDs).',
        bn: 'টেক্সট, ছবি ও অডিও ম্যাট্রিক্স ও টেনসরে পরিবর্তিত হয়ে প্রসেস করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'AI can only process structured Excel spreadsheets.',
        correction: 'Modern Deep Learning excels specifically at unstructured data like natural language, images, and audio streams.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the difference between Structured and Unstructured data with real examples.',
      modelAnswer: 'Structured data is organized in neat tables with rows and columns (like a bank account spreadsheet). Unstructured data has no fixed table format (like a selfie photo or a voice recording)!',
      checklist: ['Defined structured data with table example.', 'Defined unstructured data with photo/audio example.'],
    },
    quiz: {
      question: 'Which of the following is an example of Unstructured Data?',
      options: [
        'An Excel file with Customer Name, Age, and Zip Code',
        'A JPEG photograph of a dog',
        'A SQL Database Table of Product Prices',
        'A CSV file of temperature readings',
      ],
      correctAnswer: 1,
      explanation: 'A JPEG photograph is unstructured visual pixel data.',
    },
    simulationType: 'data-types-demo',
    codeLab: {
      title: 'Image to Tensor Conversion Simulation',
      language: 'python',
      starterCode: `# Simulating Image to Numerical Tensor
image_2x2_grayscale = [
    [0, 255],   # Black, White
    [128, 200]  # Gray, Light Gray
]

print("Visual Grid as Numerical Matrix:")
for row in image_2x2_grayscale:
    print(row)
`,
      expectedOutput: 'Visual Grid as Numerical Matrix:\n[0, 255]\n[128, 200]',
      explanation: 'Grayscale pixels map to 0-255 numbers for neural network input tensors.',
    },
    summary: ['Data fuels AI; structured data is tabular while unstructured data (text/images/audio) requires numerical tensor conversion.'],
    glossary: [
      { term: 'Structured Data', definition: 'Information formatted into a repository with defined rows and columns.' },
      { term: 'Unstructured Data', definition: 'Information that lacks a predefined data model or organizational format.' },
    ],
    nextLessonId: 'ai-42',
  },
  {
    id: 'ai-42',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 42,
    difficulty: 'Beginner',
    title: {
      en: '42. Datasets, Features, Labels, Examples, and Data Quality',
      bn: '৪২. ডেটাসেট, ফিচার, লেবেল, এক্সাম্পল ও ডেটার গুণগত মান',
    },
    subtitle: {
      en: 'Master dataset terminology: Features (X), Labels (y), and Examples.',
      bn: 'ফিচার (X) ও লেবেল (y)-এর সহজ ধারণা।',
    },
    duration: '15 mins',
    objectives: [
      'Define Features (X) as input measurements and Labels (y) as target predictions.',
      'Understand Example / Instance as a single row in a dataset.',
      'Explain the "Garbage In, Garbage Out" rule in AI data quality.',
    ],
    prerequisites: 'Lesson 41',
    explanation: {
      simple: {
        en: 'In machine learning: 1) Features (X) are the clues or inputs (e.g. house size, location), 2) Labels (y) are the answers we want to predict (e.g. house price), 3) Examples are individual rows in our dataset!',
        bn: 'মেশিন লার্নিংয়ে: ফিচার (X) হলো সব তথ্য বা ক্লু, লেবেল (y) হলো কাঙ্ক্ষিত উত্তর, আর এক্সাম্পল হলো ডেটাসেটের প্রতিটা তথ্য সারি।',
      },
      analogy: {
        en: 'Think of a medical exam: Patient Symptoms (fever, cough, blood pressure) are Features X. The Doctor’s Final Diagnosis (Flu, Asthma) is the Label y!',
        bn: 'রোগীর সব উপসর্গ হলো ফিচার X। আর ডাক্তারের রোগ শনাক্তকরণের ফাইল হলো লেবেল y।',
      },
      technical: {
        en: 'Dataset D = {(x_1, y_1), (x_2, y_2), ..., (x_N, y_N)}, where x_i ∈ ℝ^d is a feature vector and y_i is the scalar or categorical label target.',
        bn: 'ডেটাসেটে N সংখক ইনপুট ফিচার এবং কাঙ্ক্ষিত আউটপুট লেবেল অন্তর্ভুক্ত থাকে।',
      },
    },
    misconceptions: [
      {
        misconception: 'More data always guarantees a better model, even if 90% of the data is corrupt or labeled incorrectly.',
        correction: 'Garbage In, Garbage Out! Low-quality, mislabeled data degrades model accuracy. Quality data beats raw quantity.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Identify the Features (X) and Label (y) in a spam email dataset.',
      modelAnswer: 'Features (X) are email properties like word count, presence of links, sender address, and uppercase words. Label (y) is the answer: "Spam" or "Not Spam"!',
      checklist: ['Identified input attributes as Features X.', 'Identified target category as Label y.'],
    },
    quiz: {
      question: 'In a real estate prediction model estimating house prices, what is the "Label (y)"?',
      options: ['The number of bathrooms', 'The square footage size', 'The actual selling price of the house', 'The zip code location'],
      correctAnswer: 2,
      explanation: 'The target value to be predicted (house selling price) is the Label (y).',
    },
    simulationType: 'features-labels-demo',
    codeLab: {
      title: 'Dataset Feature & Label Separator',
      language: 'python',
      starterCode: `# Dataset Table Representation
dataset = [
    {"size_sqft": 1000, "bedrooms": 2, "price": 150000},
    {"size_sqft": 2000, "bedrooms": 3, "price": 300000},
]

# Separate Features X from Label y
X_features = [[d["size_sqft"], d["bedrooms"]] for d in dataset]
y_labels = [d["price"] for d in dataset]

print("Features (X):", X_features)
print("Labels (y):", y_labels)
`,
      expectedOutput: 'Features (X): [[1000, 2], [2000, 3]]\nLabels (y): [150000, 300000]',
      explanation: 'Machine learning separates input feature matrices X from target label vectors y.',
    },
    summary: ['Features (X) are input properties; Labels (y) are ground-truth target outputs; quality data is essential.'],
    glossary: [
      { term: 'Feature', definition: 'An individual measurable property or characteristic of a phenomenon being observed.' },
      { term: 'Label', definition: 'The target answer or outcome variable we want the machine learning model to predict.' },
    ],
    nextLessonId: 'ai-43',
  },
  {
    id: 'ai-43',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 43,
    difficulty: 'Beginner',
    title: {
      en: '43. Collecting, Cleaning, Transforming, and Preparing Data',
      bn: '৪৩. ডেটা সংগ্রহ, পরিচ্ছন্নকরণ, রূপান্তর ও প্রস্তুত করার ধাপসমূহ',
    },
    subtitle: {
      en: 'Master Data Preprocessing: Handling missing values, scaling, and deduplication.',
      bn: 'মিসিং ভ্যালু হ্যান্ডলিং, ফিচার স্কেলিং ও ডেটা প্রিপসেসিং।',
    },
    duration: '15 mins',
    objectives: [
      'Understand the Data Preprocessing Pipeline.',
      'Handle missing values (Imputation) and duplicates.',
      'Perform Feature Scaling (Min-Max Normalization and Standardization).',
    ],
    prerequisites: 'Lesson 42',
    explanation: {
      simple: {
        en: 'Raw data is almost always messy, incomplete, and full of errors! Before feeding data to AI, developers clean it: filling missing numbers, removing duplicate rows, and scaling large numbers so all features are on a fair scale.',
        bn: 'আসল ডেটা ভুল ও অসম্পূর্ণ থাকে। AI-তে দেওয়ার আগে ডেটা ওয়াশ বা পরিচ্ছন্ন করে স্কেল করতে হয়।',
      },
      analogy: {
        en: 'Data cleaning is like washing, peeling, and chopping vegetables before cooking a soup. You don’t throw unwashed vegetables with dirt into the soup pot!',
        bn: 'রান্না করার আগে সবজি ভালো করে ধুয়ে কেটে রেডি করার মতো। নোংরা সবজি যেমন কড়াইয়ে দেওয়া যায় না, কাঁচা ডেটাও নয়।',
      },
      technical: {
        en: 'Min-Max Scaling transforms features to [0, 1] range: x_norm = (x - x_min) / (x_max - x_min). Imputation replaces NaN missing values using mean/median or KNN imputation.',
        bn: 'মিন-ম্যাক্স স্কেলিং ফিচারকে ০ থেকে ১ সীমার মধ্যে নিয়ে আসে।',
      },
    },
    misconceptions: [
      {
        misconception: 'AI engineers spend 90% of their time designing cool neural network architectures.',
        correction: 'In reality, AI engineers spend 70-80% of their time collecting, cleaning, and preparing quality datasets.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why is Min-Max Scaling important when one feature is House Size (1,000–5,000 sqft) and another is Bedrooms (1–5)?',
      modelAnswer: 'Because 5,000 is huge compared to 5! Without scaling, the AI model will think House Size is 1,000 times more important than Bedrooms simply because its raw numbers are larger. Scaling puts both features on a fair 0 to 1 scale!',
      checklist: ['Noted raw number magnitude discrepancy.', 'Explained scaling levels the playing field.'],
    },
    quiz: {
      question: 'What is Min-Max Normalization used for during data preprocessing?',
      options: [
        'To delete all data rows from disk.',
        'To scale feature values to a uniform range between 0.0 and 1.0.',
        'To encrypt passwords stored in database tables.',
        'To speed up CPU fan rotation.',
      ],
      correctAnswer: 1,
      explanation: 'Min-Max Normalization scales numerical feature values to a normalized [0, 1] range.',
    },
    simulationType: 'data-cleaning-demo',
    codeLab: {
      title: 'Min-Max Normalizer Implementation',
      language: 'python',
      starterCode: `# Min-Max Normalization Implementation
sizes = [1000, 1500, 2500, 5000]

min_val = min(sizes)
max_val = max(sizes)

normalized_sizes = [(x - min_val) / (max_val - min_val) for x in sizes]

print("Raw House Sizes:", sizes)
print("Normalized [0, 1] Sizes:", [round(n, 2) for n in normalized_sizes])
`,
      expectedOutput: 'Raw House Sizes: [1000, 1500, 2500, 5000]\nNormalized [0, 1] Sizes: [0.0, 0.12, 0.38, 1.0]',
      explanation: 'Min-Max scaling keeps all feature ranges proportional between 0.0 and 1.0.',
    },
    summary: ['Data preprocessing (cleaning, handling missing values, scaling) occupies 70%+ of an AI engineer’s workflow.'],
    glossary: [
      { term: 'Min-Max Normalization', definition: 'Rescaling features to a fixed range, usually 0 to 1.' },
      { term: 'Imputation', definition: 'The process of replacing missing data with substituted numerical values.' },
    ],
    nextLessonId: 'ai-44',
  },
  {
    id: 'ai-44',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 44,
    difficulty: 'Beginner',
    title: {
      en: '44. Supervised, Unsupervised, and Self-Supervised Learning',
      bn: '৪৪. সুপারভাইজড, আনসুপারভাইজড ও সেলফ-সুপারভাইজড লার্নিং',
    },
    subtitle: {
      en: 'Compare the three major learning paradigms powering modern AI.',
      bn: 'মেশিন লার্নিংয়ের প্রধান ৩টি শিক্ষাদান পদ্ধতির তুলনামূলক বিশ্লেষণ।',
    },
    duration: '15 mins',
    objectives: [
      'Define Supervised Learning (Learning with labeled target answers).',
      'Define Unsupervised Learning (Clustering & pattern discovery without labels).',
      'Define Self-Supervised Learning (Masking parts of data to create automatic labels).',
    ],
    prerequisites: 'Lesson 43',
    explanation: {
      simple: {
        en: '1) Supervised Learning: Learning with a teacher (data has labels like "Cat" or "Dog"). 2) Unsupervised Learning: Learning without a teacher (finding clusters in unlabeled data). 3) Self-Supervised Learning: Hiding a word in a sentence and forcing the AI to guess the missing word!',
        bn: '১) সুপারভাইজড: শিক্ষকের সাথে শেখা (লেবেলসহ ডেটা)। ২) আনসুপারভাইজড: নিজের মতো প্যাটার্ন ও ক্লাস্টার খোঁজা। ৩) সেলফ-সুপারভাইজড: শূন্যস্থান পূরণ করে একা একা শেখা।',
      },
      analogy: {
        en: 'Supervised = Studying flashcards with answers on the back. Unsupervised = Sorting a giant pile of lego bricks by color without being told how. Self-Supervised = Playing Mad Libs by guessing missing words in a sentence!',
        bn: 'সুপারভাইজড হলো উত্তরের কার্ড দেখে পড়া। আনসুপারভাইজড হলো লেগো ব্লক সাজানো। সেলফ-সুপারভাইজড হলো বাক্যের শূন্যস্থান পূরণ করা।',
      },
      technical: {
        en: 'Supervised: Models P(Y|X) with explicit ground truth Y. Unsupervised: Models data distribution P(X) via Clustering (K-Means, PCA). Self-Supervised: Generates pseudo-labels from input structure (e.g. Masked Language Modeling in BERT/GPT).',
        bn: 'সেলফ-সুপারভাইজড লার্নিং ওয়েব ডেটা ব্যবহার করে মাস্কড টোকেন প্রেডিকশন দিয়ে শেখে।',
      },
    },
    misconceptions: [
      {
        misconception: 'LLMs like ChatGPT are trained using traditional Supervised Learning with human-labeled flashcards for trillions of sentences.',
        correction: 'No! LLMs are pretrained using Self-Supervised Learning on raw internet text by predicting the next token in sentences automatically.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain Self-Supervised Learning using the "fill-in-the-blank" sentence game.',
      modelAnswer: 'Self-Supervised Learning takes raw text like "The cat sat on the mat", hides the word "mat", and asks the AI to guess the hidden word. Because the data creates its own answers, we can train on billions of web pages without needing humans to label them!',
      checklist: ['Explained hiding/masking words.', 'Noted automatic label creation without human annotators.'],
    },
    quiz: {
      question: 'Which learning paradigm allows Large Language Models (LLMs) to pretrain on billions of un-labeled web pages?',
      options: ['Supervised Learning', 'Unsupervised K-Means', 'Self-Supervised Learning', 'Reinforcement Manual Scripting'],
      correctAnswer: 2,
      explanation: 'Self-Supervised Learning automatically creates learning signals (e.g., next-token prediction) from unannotated raw text.',
    },
    simulationType: 'ml-paradigms-demo',
    codeLab: {
      title: 'K-Means Clustering Simulation (Unsupervised)',
      language: 'python',
      starterCode: `# Simple Unsupervised Cluster Separator
points = [1, 2, 3, 100, 102, 105]

# Finding 2 natural clusters without labels
cluster_1 = [p for p in points if p < 50]
cluster_2 = [p for p in points if p >= 50]

print("Cluster 1 (Low values):", cluster_1)
print("Cluster 2 (High values):", cluster_2)
`,
      expectedOutput: 'Cluster 1 (Low values): [1, 2, 3]\nCluster 2 (High values): [100, 102, 105]',
      explanation: 'Unsupervised algorithms group items based on intrinsic numerical proximity.',
    },
    summary: ['Supervised uses labeled targets; Unsupervised finds clusters; Self-Supervised generates targets from raw data structure.'],
    glossary: [
      { term: 'Supervised Learning', definition: 'Training a model using input data along with corresponding target ground-truth labels.' },
      { term: 'Self-Supervised Learning', definition: 'A paradigm where training labels are automatically generated from the input data itself.' },
    ],
    nextLessonId: 'ai-45',
  },
  {
    id: 'ai-45',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 45,
    difficulty: 'Beginner',
    title: {
      en: '45. Classification vs. Regression: Different Types of Prediction',
      bn: '৪৫. ক্লাসিফিকেশন বনাম রিগ্রেশন: প্রেডিকশনের ২ প্রকারভেদ',
    },
    subtitle: {
      en: 'Distinguish discrete category outputs vs continuous numerical outputs.',
      bn: 'ক্যাটাগরি আউটপুট বনাম কন্টিনিউয়াস সংখ্যা আউটপুট।',
    },
    duration: '15 mins',
    objectives: [
      'Define Classification (Predicting discrete categories like Spam / Not Spam, Cat / Dog).',
      'Define Regression (Predicting continuous quantities like House Price, Temperature).',
      'Select the appropriate algorithm and loss function for classification vs regression tasks.',
    ],
    prerequisites: 'Lesson 44',
    explanation: {
      simple: {
        en: 'Prediction tasks come in two flavors: 1) Classification asks "WHICH CATEGORY?" (Is this email Spam or Not Spam?), 2) Regression asks "HOW MUCH?" (What will this house sell for in dollars?).',
        bn: 'প্রেডিকশন ২ ধরণের: ১) ক্লাসিফিকেশন (কোন ক্যাটাগরি? যেমন স্প্যাম না ইনবক্স?), ২) রিগ্রেশন (কত দাম? যেমন বাড়ির দাম কত হতে পারে?)।',
      },
      analogy: {
        en: 'Sorting mail into boxes (Personal, Bills, Junk) is Classification. Measuring a child’s height growth in centimeters is Regression!',
        bn: 'চিঠি সর্টিং করে বক্সে রাখা ক্লাসিফিকেশন। আর বাচ্চার উচ্চতা মাপা হলো রিগ্রেশন।',
      },
      technical: {
        en: 'Classification outputs discrete target classes y ∈ {0, 1, ..., K-1} using Cross-Entropy Loss. Regression outputs continuous values y ∈ ℝ using MSE/MAE Loss.',
        bn: 'ক্লাসিফিকেশনে ডিসক্রিট লেবেল এবং রিগ্রেশনে কন্টিনিউয়াস রিয়েল নাম্বার পাওয়া যায়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Predicting a person’s age is always a Classification task.',
        correction: 'Age is a continuous numerical quantity (e.g. 24.5 years), making it naturally a Regression task unless grouped into discrete age brackets.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Classify whether predicting tomorrow’s temperature is Classification or Regression.',
      modelAnswer: 'It is a Regression task because temperature is a continuous number (e.g. 28.4°C). If we instead predicted "Hot" vs "Cold", it would be Classification!',
      checklist: ['Identified Regression as continuous number prediction.', 'Contrasted with discrete category classification.'],
    },
    quiz: {
      question: 'Which of the following is a Classification task?',
      options: [
        'Predicting the stock price of Apple in dollars next week',
        'Determining whether a medical X-ray scan shows a Bone Fracture (Yes/No)',
        'Estimating the total rainfall in millimeters for next month',
        'Calculating the exact weight of a shipping container',
      ],
      correctAnswer: 1,
      explanation: 'Determining Bone Fracture (Yes/No) is a binary discrete Classification task.',
    },
    simulationType: 'classification-regression-demo',
    codeLab: {
      title: 'Task Type Identifier Script',
      language: 'python',
      starterCode: `# Task Type Logic Selector
def identify_task_type(target_output):
    if isinstance(target_output, str):
        return "Classification (Category Target)"
    elif isinstance(target_output, float) or isinstance(target_output, int):
        return "Regression (Continuous Number Target)"

print("Task 1 ('Spam'):", identify_task_type("Spam"))
print("Task 2 (345000.50):", identify_task_type(345000.50))
`,
      expectedOutput: "Task 1 ('Spam'): Classification (Category Target)\nTask 2 (345000.50): Regression (Continuous Number Target)",
      explanation: 'Target output types dictate loss functions and evaluation metrics.',
    },
    summary: ['Classification predicts discrete labels/categories; Regression predicts continuous numbers.'],
    glossary: [
      { term: 'Classification', definition: 'The task of predicting a discrete class label for a given input.' },
      { term: 'Regression', definition: 'The task of predicting a continuous numerical value for a given input.' },
    ],
    nextLessonId: 'ai-46',
  },
  {
    id: 'ai-46',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 46,
    difficulty: 'Beginner',
    title: {
      en: '46. Training, Validation, and Test Sets: How to Test Model Learning',
      bn: '৪৬. ট্রেনিং, ভ্যালিডেশন ও টেস্ট সেট: মডেল পরীক্ষা করার নিয়ম',
    },
    subtitle: {
      en: 'Understand the 70/15/15 data split to prevent cheating and memorization.',
      bn: '৭০/১৫/১৫ ডেটা স্প্লিটের মাধ্যমে সঠিক ট্রেইনিং ও নিরপেক্ষ পরীক্ষা।',
    },
    duration: '15 mins',
    objectives: [
      'Explain the purpose of splitting data into Training (70%), Validation (15%), and Test (15%) sets.',
      'Understand Data Leakage and why evaluating on training data leads to false confidence.',
      'Explain how the Validation set tunes hyperparameters while the Test set provides unbiased final scoring.',
    ],
    prerequisites: 'Lesson 45',
    explanation: {
      simple: {
        en: 'Never test a student using the exact same questions from their homework! We split data into 3 parts: 1) Training Set (Homework to study), 2) Validation Set (Practice quizzes to tune strategy), 3) Test Set (Final exam kept secret until the very end!).',
        bn: 'ক্লাসের হোমওয়ার্কের হুবহু প্রশ্ন দিয়ে কি ফাইনাল পরীক্ষা নেওয়া যায়? না! তাই ডেটা ৩ ভাগে ভাগ করা হয়: ট্রেইনিং সেট (হোমওয়ার্ক), ভ্যালিডেশন সেট (ক্লাস টেস্ট) ও টেস্ট সেট (ফাইনাল এক্সাম)।',
      },
      analogy: {
        en: 'If a teacher gives students the final exam answers the day before the test, everyone gets 100%, but nobody actually learned anything! That is called Data Leakage.',
        bn: 'পরীক্ষার আগের দিন প্রশ্ন ফাঁস হয়ে ১০০ তে ১০০ পাওয়ার মতো। একে ডাটা লিকেজ বলে।',
      },
      technical: {
        en: 'Data Split: 1) Training Set (fits model weights W), 2) Validation Set (tunes hyperparameters α, hidden units, regularization), 3) Holdout Test Set (evaluates final generalization error without data leakage).',
        bn: 'ট্রেনিং সেট মডেল ওয়েট ট্রেইন করে, ভ্যালিডেশন সেট হাইপারপ্যারামিটার টিউন করে এবং টেস্ট সেট ফাইনাল স্কোর দেয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Achieving 100% accuracy on the Training Set proves your AI model will work perfectly in the real world.',
        correction: '100% training accuracy usually means the model simply MEMORIZED the training questions (Overfitting) and will fail on new real-world data.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why must the Test Set be kept completely hidden from the model during training?',
      modelAnswer: 'Because if the model sees the test set during training, it can cheat by memorizing the answers instead of learning true general patterns. The test set must remain unseen to give an honest, unbiased score of real-world performance!',
      checklist: ['Explained memorization / cheating risk.', 'Emphasized unbiased real-world performance scoring.'],
    },
    quiz: {
      question: 'Which dataset split is used to evaluate final, unbiased model performance after all hyperparameter tuning is complete?',
      options: ['Training Set', 'Holdout Test Set', 'Validation Set', 'Raw Data Archive'],
      correctAnswer: 1,
      explanation: 'The Holdout Test Set is evaluated once at the very end to measure unbiased generalization.',
    },
    simulationType: 'data-split-demo',
    codeLab: {
      title: 'Dataset Splitter Implementation (70/15/15)',
      language: 'python',
      starterCode: `# Dataset 70/15/15 Split Simulation
dataset = list(range(100)) # 100 sample items

train_end = int(len(dataset) * 0.70)
val_end = int(len(dataset) * 0.85)

train_set = dataset[:train_end]
val_set = dataset[train_end:val_end]
test_set = dataset[val_end:]

print(f"Training Samples: {len(train_set)}")
print(f"Validation Samples: {len(val_set)}")
print(f"Holdout Test Samples: {len(test_set)}")
`,
      expectedOutput: 'Training Samples: 70\nValidation Samples: 15\nHoldout Test Samples: 15',
      explanation: 'Splitting datasets prevents data leakage and validates real-world generalization.',
    },
    summary: ['Data is split into Train (70%), Validation (15%), and Test (15%) to prevent memorization and measure true generalization.'],
    glossary: [
      { term: 'Data Leakage', definition: 'When information from outside the training dataset is accidentally used to train the model.' },
      { term: 'Holdout Test Set', definition: 'A portion of data kept strictly hidden until final model evaluation.' },
    ],
    nextLessonId: 'ai-47',
  },
  {
    id: 'ai-47',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 47,
    difficulty: 'Beginner',
    title: {
      en: '47. Overfitting, Underfitting, and Generalization',
      bn: '৪৭. ওভারফিটিং, আন্ডারফিটিং এবং জেনারেলাইজেশন',
    },
    subtitle: {
      en: 'Understand the Goldilocks balance in machine learning model training.',
      bn: 'মেমোরাইজেশন বনাম জেনুইন প্যাটার্ন শেখার গোল্ডিলকস ব্যালেন্স।',
    },
    duration: '15 mins',
    objectives: [
      'Define Overfitting (high training accuracy, terrible test accuracy due to memorization).',
      'Define Underfitting (poor performance on both training and test data due to model simplicity).',
      'Understand Generalization and techniques to prevent overfitting (Regularization, Dropout, Early Stopping).',
    ],
    prerequisites: 'Lesson 46',
    explanation: {
      simple: {
        en: '1) Underfitting: The model is too simple and misses the trend (Low accuracy everywhere). 2) Overfitting: The model is overly complex and memorizes every noise detail in homework (100% homework score, 40% exam score). 3) Generalization: Just right!',
        bn: '১) আন্ডারফিটিং: মডেল খুব সহজ হওয়ায় মূল ট্রেন্ড মিস করে। ২) ওভারফিটিং: মডেল অতিরিক্ত জটিল হয়ে ডেটার নয়েজ মুখস্থ করে ফেলে। ৩) জেনারেলাইজেশন: পারফেক্ট ব্যালেন্স।',
      },
      analogy: {
        en: 'Underfitting = A student who only studied 1 page. Overfitting = A student who memorized the exact page numbers and coffee stain spots on the textbook. Generalization = A student who understood the concepts and aces new questions!',
        bn: 'আন্ডারফিটিং হলো ১ পৃষ্ঠা পড়ে পরীক্ষা দেওয়া। ওভারফিটিং হলো বইয়ের কফির দাগসহ মুখস্থ করা। আর জেনারেলাইজেশন হলো মূল নিয়ম বুঝে পরীক্ষা দেওয়া।',
      },
      technical: {
        en: 'Bias-Variance Tradeoff: Underfitting has High Bias and Low Variance. Overfitting has Low Bias and High Variance. Regularization (L1/L2 penalty λ||W||^2) and Dropout constrain model complexity.',
        bn: 'বায়াস-ভ্যারিয়েন্স ট্রেডঅফ: আন্ডারফিটিং হাই বায়াস এবং ওভারফিটিং হাই ভ্যারিয়েন্স নির্দেশ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Training a neural network for 100,000 extra iterations will always make it smarter.',
        correction: 'Over-training causes the model to overfit on noise. Early Stopping stops training when Validation Loss begins rising.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what Overfitting means using a student studying for an exam.',
      modelAnswer: 'Overfitting is like a student who memorizes the exact answer options (A, B, C) of practice tests instead of learning the math formula. When they take the real exam with new numbers, they fail because they only memorized, not generalized!',
      checklist: ['Explained memorization of specific details.', 'Explained failure on new unseen data.'],
    },
    quiz: {
      question: 'A model achieves 99.8% accuracy on Training Data but drops to 52.1% accuracy on Validation Data. What is occurring?',
      options: ['Underfitting', 'Overfitting', 'Perfect Generalization', 'Data Encryption'],
      correctAnswer: 1,
      explanation: 'A huge gap between high training accuracy and low validation accuracy is the classic sign of Overfitting.',
    },
    simulationType: 'overfitting-curve-demo',
    codeLab: {
      title: 'Overfitting & Early Stopping Simulator',
      language: 'python',
      starterCode: `# Simulating Training vs Validation Loss Curves
epochs = list(range(1, 7))
train_loss = [0.8, 0.5, 0.3, 0.2, 0.1, 0.05]
val_loss =   [0.85, 0.55, 0.35, 0.36, 0.45, 0.65] # Val loss starts rising at Epoch 4!

print("Epoch | Train Loss | Val Loss | Status")
for e, t, v in zip(epochs, train_loss, val_loss):
    status = "STOP (Overfitting Starts!)" if v > 0.35 and e > 3 else "Good Progress"
    print(f"  {e}   |    {t:.2f}    |   {v:.2f}   | {status}")
`,
      expectedOutput: 'Epoch | Train Loss | Val Loss | Status\n  1   |    0.80    |   0.85   | Good Progress\n  2   |    0.50    |   0.55   | Good Progress\n  3   |    0.30    |   0.35   | Good Progress\n  4   |    0.20    |   0.36   | STOP (Overfitting Starts!)\n  5   |    0.10    |   0.45   | STOP (Overfitting Starts!)\n  6   |    0.05    |   0.65   | STOP (Overfitting Starts!)',
      explanation: 'Early stopping halts training when validation loss stops improving to prevent overfitting.',
    },
    summary: ['The goal of ML is Generalization: performing accurately on unseen data by avoiding both Underfitting and Overfitting.'],
    glossary: [
      { term: 'Overfitting', definition: 'When a model learns training data details and noise so well that it negatively impacts performance on new data.' },
      { term: 'Generalization', definition: 'A model’s ability to react to new, unseen data drawn from the same distribution.' },
    ],
    nextLessonId: 'ai-48',
  },
  {
    id: 'ai-48',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 48,
    difficulty: 'Beginner',
    title: {
      en: '48. Neural Networks: Neurons, Weights, Biases, and Layers',
      bn: '৪৮. নিউরাল নেটওয়ার্ক: নিউরন, ওয়েটস, বায়াস এবং লেয়ারস',
    },
    subtitle: {
      en: 'Understand Input Layers, Hidden Layers, Output Layers, and Activation Functions (ReLU, Sigmoid).',
      bn: 'ইনপুট, হিডেন ও আউটপুট লেয়ার এবং অ্যাক্টিভেশন ফাংশনের কাজ।',
    },
    duration: '15 mins',
    objectives: [
      'Understand Artificial Neurons (Perceptrons) as mathematical sum-and-activate units.',
      'Explain Layer structures: Input Layer, Hidden Layers (deep feature extractors), Output Layer.',
      'Explain Activation Functions (ReLU, Sigmoid, Tanh) for introducing non-linearity.',
    ],
    prerequisites: 'Lesson 47',
    explanation: {
      simple: {
        en: 'An Artificial Neural Network is built of stacked layers of mini mathematical calculators called Neurons. Each neuron takes incoming numbers, multiplies them by Weights (w), adds a Bias (b), and passes the result through an Activation Function (like ReLU) to decide whether to fire!',
        bn: 'নিউরাল নেটওয়ার্ক গঠিত হয় অনেক স্তরের নিউরন দিয়ে। প্রতি নিউরন ইনপুটকে Weight দিয়ে গুণ করে, Bias যোগ করে এবং ReLU অ্যাক্টিভেশন দিয়ে আউটপুট পাঠায়।',
      },
      analogy: {
        en: 'Think of a committee evaluating a job applicant. Layer 1 checks basic skills (education, experience). Layer 2 evaluates leadership and teamwork. Layer 3 makes the final hiring decision!',
        bn: 'একটি ইন্টারভিউ বোর্ডের মতো: ১ম স্তর ডিগ্রি দেখে, ২য় স্তর দক্ষতা ও অভিজ্ঞতা পরীক্ষা করে এবং ৩য় স্তর নিয়োগের সিদ্ধান্ত দেয়।',
      },
      technical: {
        en: 'Neuron Equation: z = ∑ (w_i * x_i) + b; Output a = σ(z), where σ(z) is a non-linear activation function. Without non-linear activations (like ReLU: max(0, z)), a multi-layer neural network collapses into a simple linear model.',
        bn: 'অ্যাক্টিভেশন ফাংশন (যেমন ReLU: max(0, z)) ছাড়া গভীর নেটওয়ার্ক জটিল অ-রৈখিক প্যাটার্ন শিখতে পারে না।',
      },
    },
    misconceptions: [
      {
        misconception: 'Neural networks don’t need activation functions if you just stack 100 hidden layers.',
        correction: 'Without non-linear activation functions, stacking 100 linear layers is mathematically equivalent to 1 single linear layer!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why are non-linear activation functions (like ReLU) necessary in deep neural networks?',
      modelAnswer: 'Because real-world problems (like recognizing a face or understanding language) are complex and non-linear. Without activation functions like ReLU, stacking 100 layers would just simplify down to 1 straight line equation!',
      checklist: ['Explained non-linear real-world problem complexity.', 'Explained that linear layers without activations collapse to a single straight line.'],
    },
    quiz: {
      question: 'What is the mathematical output of the ReLU (Rectified Linear Unit) activation function for an input z = -4.5?',
      options: ['-4.5', '0.0', '1.0', '4.5'],
      correctAnswer: 1,
      explanation: 'ReLU returns max(0, z). For any negative input like -4.5, ReLU returns 0.0.',
    },
    simulationType: 'neural-net-playground-demo',
    codeLab: {
      title: 'Single Artificial Neuron Simulator with ReLU',
      language: 'python',
      starterCode: `# Single Neuron Calculation
inputs = [1.5, 2.0, -0.5]
weights = [0.8, -0.5, 1.2]
bias = 0.2

# 1. Weighted Sum (z = w*x + b)
z = sum(x * w for x, w in zip(inputs, weights)) + bias

# 2. Non-linear Activation (ReLU: max(0, z))
def relu(z):
    return max(0.0, z)

output = relu(z)

print(f"Weighted Sum z: {z:.2f}")
print(f"Neuron Output Activation (ReLU): {output:.2f}")
`,
      expectedOutput: 'Weighted Sum z: 0.00\nNeuron Output Activation (ReLU): 0.00',
      explanation: 'Artificial neurons compute weighted sums and apply non-linear activations.',
    },
    summary: ['Neural networks combine Input, Hidden, and Output layers using weights, biases, and non-linear activation functions (ReLU).'],
    glossary: [
      { term: 'Neuron', definition: 'The basic node unit of a neural network that calculates a weighted sum of inputs and applies an activation function.' },
      { term: 'ReLU', definition: 'Rectified Linear Unit: a non-linear activation function defined as f(x) = max(0, x).' },
    ],
    nextLessonId: 'ai-49',
  },
  {
    id: 'ai-49',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 49,
    difficulty: 'Beginner',
    title: {
      en: '49. Backpropagation and the Learning Process Behind Neural Networks',
      bn: '৪৯. ব্যাকপ্রোপাগেশন ও নিউরাল নেটওয়ার্কের শেখার সম্পূর্ণ সাইকেল',
    },
    subtitle: {
      en: 'Understand Forward Pass, Loss Computation, Backward Pass, and Weight Updates.',
      bn: 'ফরওয়ার্ড পাস, লস হিসাব, ব্যাকওয়ার্ড পাস ও ওয়েট আপডেটের সম্পূর্ণ ট্রেনিং লুপ।',
    },
    duration: '15 mins',
    objectives: [
      'Trace the 4-step Neural Network Training Cycle.',
      'Understand how the Calculus Chain Rule propogates error gradients backward.',
      'Explain Epochs, Batches, and Iterations in deep learning training.',
    ],
    prerequisites: 'Lesson 48',
    explanation: {
      simple: {
        en: 'Learning in a neural network happens in 4 continuous steps: 1) Forward Pass (Make a guess), 2) Loss Calculation (Score the error), 3) Backward Pass (Send error feedback backward through layers), 4) Weight Update (Tweak weights slightly using Gradient Descent)!',
        bn: 'নিউরাল নেটওয়ার্কের শেখার সাইকেল: ১) ফরওয়ার্ড পাস (অনুমান), ২) লস হিসাব (ভুল স্কোর), ৩) ব্যাকওয়ার্ড পাস (পেছনে ফিডব্যাক পাঠানো), ৪) ওয়েট আপডেট (প্যারামিটার টিউনিং)।',
      },
      analogy: {
        en: 'It’s like learning to shoot basketball free throws in the dark. 1) Throw ball, 2) Hear rim clank 4 inches right, 3) Calculate wrist adjustment, 4) Adjust wrist angle for next shot. Repeat 1,000 times until swish!',
        bn: 'অন্ধকারে বাস্কেটবল শট দেওয়া এবং রিমে লাগার আওয়াজ শুনে কব্জি সামান্য ঘুরিয়ে নিখুঁত শট শেখার মতো।',
      },
      technical: {
        en: 'Backpropagation applies the calculus Chain Rule: ∂L/∂W^(l) = ∂L/∂a^(l) * ∂a^(l)/∂z^(l) * ∂z^(l)/∂W^(l) to compute gradients backward from output layer to input layer.',
        bn: 'ক্যালকুলাসের চেইন রুল ব্যবহার করে শেষ স্তর থেকে প্রথম স্তর পর্যন্ত ডেরিভেটিভস ছড়িয়ে দেওয়া হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Weights are updated randomly during backpropagation until the network happens to get the right answer.',
        correction: 'Gradients calculate the exact mathematical slope and direction required to lower loss deterministically using Gradient Descent.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the 4 steps of a Neural Network training cycle to a beginner.',
      modelAnswer: '1. Forward Pass: Input data flows forward through layers to make a guess.\n2. Loss: We measure how wrong the guess was.\n3. Backward Pass: Backprop sends error gradients backward through each layer.\n4. Weight Update: Weights are adjusted using gradient descent, and we repeat!',
      checklist: ['Listed 4 steps in order.', 'Explained backward error feedback.'],
    },
    quiz: {
      question: 'Which mathematical rule allows Backpropagation to calculate gradients backward through chained neural network layers?',
      options: ['Pythagorean Theorem', 'Calculus Chain Rule', 'Binary Addition Rule', 'Kepler’s Third Law'],
      correctAnswer: 1,
      explanation: 'The Calculus Chain Rule computes partial derivatives across nested/chained functions in deep networks.',
    },
    simulationType: 'backprop-cycle-demo',
    codeLab: {
      title: 'Full 4-Step Neural Training Epoch Simulation',
      language: 'python',
      starterCode: `# 4-Step Neural Training Epoch Loop
w = 0.5
x = 2.0
y_true = 4.0
learning_rate = 0.1

print("--- STARTING NEURAL TRAINING CYCLE ---")
for epoch in range(3):
    # Step 1: Forward Pass
    y_pred = w * x
    # Step 2: Loss (MSE)
    loss = (y_pred - y_true) ** 2
    # Step 3: Backward Pass (Gradient dw)
    dw = 2 * (y_pred - y_true) * x
    # Step 4: Weight Update
    w = w - (learning_rate * dw)
    print(f"Epoch {epoch+1}: Guess = {y_pred:.2f}, Loss = {loss:.2f}, Updated Weight = {w:.2f}")
`,
      expectedOutput: '--- STARTING NEURAL TRAINING CYCLE ---\nEpoch 1: Guess = 1.00, Loss = 9.00, Updated Weight = 1.70\nEpoch 2: Guess = 3.40, Loss = 0.36, Updated Weight = 1.94\nEpoch 3: Guess = 3.88, Loss = 0.01, Updated Weight = 1.99',
      explanation: 'In 3 epochs, the weight converges from 0.5 to 1.99 (target weight 2.0).',
    },
    summary: ['Neural network training iteratively repeats Forward Pass -> Loss Computation -> Backward Pass (Chain Rule) -> Weight Update.'],
    glossary: [
      { term: 'Forward Pass', definition: 'The calculation of output predictions by passing inputs through neural network layers.' },
      { term: 'Chain Rule', definition: 'A calculus formula for computing the derivative of a composite or nested function.' },
    ],
    nextLessonId: 'ai-50',
  },
  {
    id: 'ai-50',
    track: 'ai',
    chapter: 5,
    chapterTitle: 'Chapter 5: Data, Machine Learning, and Neural Networks',
    order: 50,
    difficulty: 'Beginner',
    title: {
      en: '50. Chapter 5 Project: Build a Classifier and Evaluate Performance',
      bn: '৫০. ৫ম অধ্যায়ের প্রজেক্ট: একটি ক্লাসিফায়ার মডেল তৈরি ও পারফরম্যান্স মূল্যায়ন',
    },
    subtitle: {
      en: 'Synthesize data preparation, neural network layers, evaluation metrics, and decision boundaries.',
      bn: 'ডেটা প্রেপ, নিউরাল নেটওয়ার্ক ও মেট্রিকে ম্যাপ করে ৫ম অধ্যায় সম্পন্ন করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Build a complete 2-class Neural Classifier in Python.',
      'Evaluate model using Accuracy, Precision, Recall, and Confusion Matrix.',
      'Complete Chapter 5 milestone assessment and earn your Chapter 5 Badge!',
    ],
    prerequisites: 'Lessons 41 to 49 of Chapter 5',
    explanation: {
      simple: {
        en: 'Congratulations on reaching the halfway milestone of the AI Academy! In this Chapter 5 Capstone, you will construct a complete Classifier, train it on dataset features, and evaluate its performance using a Confusion Matrix.',
        bn: 'এআই একাডেমির ৫০তম পাঠ ও অর্ধেক যাত্রায় অভিনন্দন! ৫ম অধ্যায়ের ফাইনাল প্রজেক্টে একটি ক্লাসিফায়ার তৈরি করে পারফরম্যান্স অডিট করুন।',
      },
      analogy: {
        en: 'A Confusion Matrix is like a medical test report card showing: 1) True Positives (correctly spotted illness), 2) False Positives (false alarms), 3) True Negatives (correctly healthy), 4) False Negatives (missed illness)!',
        bn: 'কনফিউশন ম্যাট্রিক্স হলো ডাক্তারদের টেস্ট রিপোর্টের মতো: সঠিক শনাক্তকরণ (True Positive) এবং ভুল অ্যালার্ম (False Positive)-এর খতিয়ান।',
      },
      technical: {
        en: 'Classification Metrics: 1) Accuracy = (TP + TN) / Total, 2) Precision = TP / (TP + FP), 3) Recall = TP / (TP + FN), 4) F1-Score = 2 * (Precision * Recall) / (Precision + Recall).',
        bn: 'মেট্রিক্স: অ্যাক্যুরেসি, প্রিসিশন, রিকল এবং F1-স্কোর।',
      },
    },
    misconceptions: [
      {
        misconception: 'Accuracy is the only metric you ever need to evaluate a classifier.',
        correction: 'In imbalanced datasets (e.g. 99 healthy patients, 1 sick patient), a model that predicts "Healthy" 100% of the time gets 99% accuracy but misses the sick patient! Recall and Precision are essential.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain why Precision and Recall matter in cancer detection models.',
      modelAnswer: 'High Recall means the model rarely misses a real cancer case (low false negatives). High Precision means when it flags a patient, it is usually right (low false alarms). In cancer screening, high Recall is critical so no sick patient goes undetected!',
      checklist: ['Defined Precision vs Recall in medical context.', 'Emphasized why high Recall is critical for disease screening.'],
    },
    quiz: {
      question: 'What classification evaluation metric measures the proportion of actual positive cases that were correctly identified (TP / (TP + FN))?',
      options: ['Accuracy', 'Recall (Sensitivity)', 'Learning Rate', 'Bias Parameter'],
      correctAnswer: 1,
      explanation: 'Recall (Sensitivity) measures the fraction of actual positive cases correctly identified by the model.',
    },
    simulationType: 'chapter5-capstone-demo',
    codeLab: {
      title: 'Classifier Confusion Matrix & Metric Evaluator',
      language: 'python',
      starterCode: `# Confusion Matrix & Metric Evaluator
# TP: True Positive, FP: False Positive, TN: True Negative, FN: False Negative
TP, FP, TN, FN = 85, 10, 90, 5

accuracy = (TP + TN) / (TP + FP + TN + FN)
precision = TP / (TP + FP)
recall = TP / (TP + FN)
f1_score = 2 * (precision * recall) / (precision + recall)

print("--- CLASSIFIER EVALUATION REPORT ---")
print(f"Accuracy:  {accuracy:.2%}")
print(f"Precision: {precision:.2%}")
print(f"Recall:    {recall:.2%}")
print(f"F1-Score:  {f1_score:.2%}")
`,
      expectedOutput: '--- CLASSIFIER EVALUATION REPORT ---\nAccuracy:  92.11%\nPrecision: 89.47%\nRecall:    94.44%\nF1-Score:  91.89%',
      explanation: 'Congratulations! You have completed Chapter 5 and reached the halfway milestone of the AI Academy!',
    },
    summary: [
      'Chapter 5 Complete! You learned Data Types, Features (X), Labels (y), and Min-Max Preprocessing.',
      'You mastered Supervised, Unsupervised, and Self-Supervised Learning.',
      'You understand Overfitting vs Generalization and Data Splitting (70/15/15).',
      'You built Neural Networks with Neurons, ReLU, Backprop, and evaluated with Confusion Matrices!',
    ],
    glossary: [
      { term: 'Confusion Matrix', definition: 'A table used to describe the performance of a classification model on test data.' },
      { term: 'F1-Score', definition: 'The harmonic mean of Precision and Recall, providing a balanced single evaluation metric.' },
    ],
    nextLessonId: 'ai-51',
  },
];
