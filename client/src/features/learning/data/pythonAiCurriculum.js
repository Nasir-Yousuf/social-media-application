// Clearfeed Learn & Practice - Python for AI & Machine Learning Curriculum (30 Lessons)

export const PYTHON_AI_LESSONS = Array.from({ length: 30 }, (_, index) => {
  const order = index + 1;
  let chapter = 'Chapter 1: Data & Scientific Python';
  if (order > 10 && order <= 20) chapter = 'Chapter 2: Machine Learning';
  if (order > 20) chapter = 'Chapter 3: Deep Learning & Modern AI';

  const topics = [
    'How Python Powers AI & ML Pipelines',
    'AI Development Environments (Jupyter, Colab, PyCharm)',
    'NumPy Arrays: Creation, Shapes & Dimensions',
    'Indexing, Slicing & Vectorized Operations',
    'Matrix Mathematics & Linear Algebra in NumPy',
    'Pandas DataFrames: Loading & Inspecting Tabular Data',
    'Cleaning Real-World Data: Handling Nulls & Duplicates',
    'Data Visualization with Matplotlib & Seaborn',
    'Exploratory Data Analysis (EDA) & Descriptive Stats',
    'Data Project: Complete Exploratory Data Pipeline',
    'Machine Learning Fundamentals: Features, Labels & Predictions',
    'The 6-Step Machine Learning Workflow',
    'Linear Regression: Predicting Continuous Numbers',
    'Logistic Regression: Classification & Probabilities',
    'Decision Trees & Random Forests',
    'Training, Validation & Testing Data Splits',
    'Model Evaluation Metrics: Accuracy, Precision, Recall, F1',
    'Overfitting, Underfitting & Regularization',
    'Feature Engineering & Scikit-Learn Pipelines',
    'Machine Learning Project: Train & Evaluate Classifier',
    'PyTorch Fundamentals: Tensors & Computational Devices',
    'Automatic Differentiation & PyTorch Autograd',
    'Building Neural Network Architectures with torch.nn',
    'The Training Loop: Forward Pass, Loss & Backprop',
    'Model Evaluation, Checkpoints & Saving Weights',
    'Computer Vision with Pretrained Convolutional Networks',
    'Text Processing, Tokenization & Word Embeddings',
    'Hugging Face Transformers & Model Hub Overview',
    'Building an AI Application with APIs & Pretrained Models',
    'Final AI Capstone Project: End-to-End AI Prototype',
  ];

  const titleText = topics[index] || `AI Lesson ${order}`;

  return {
    id: `pyai-${String(order).padStart(2, '0')}`,
    track: 'python-ai',
    order: order,
    chapter: chapter,
    difficulty: order <= 10 ? 'Intermediate' : order <= 20 ? 'Advanced' : 'Expert',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Master ${titleText} with hands-on code examples and data pipelines.`,
      bn: `প্রাকটিক্যাল কোড ও উদাহরণ দিয়ে শিখুন।`,
    },
    explanation: {
      simple: {
        en: `Learn how ${titleText} forms the core of modern machine learning and artificial intelligence systems.`,
        bn: `এই লেসনে ${titleText} কীভাবে কাজ করে তা সহজভাবে আলোচনা করা হয়েছে।`,
      },
      analogy: {
        en: `Think of data preprocessing and ML model training like refining raw oil into rocket fuel!`,
        bn: `র ডেটাকে মডেলে ট্রেইন করার মতো প্রক্রিয়া।`,
      },
      technical: {
        en: `Covers mathematical foundations, matrix representations, vectorization, loss functions, and optimization algorithms.`,
        bn: `ম্যাট্রিক্স, ভেক্টরাইজেশন, অপটিমাইজেশন ও লস ফাংশন।`,
      },
    },
    outcomes: [
      `Understand ${titleText}`,
      'Run interactive data science and ML code snippets',
      'Test your understanding with quizzes',
    ],
    starterCode: {
      python: `# Python for AI & ML - Lesson ${order}: ${titleText}\nimport math\n\nprint("AI Data Pipeline Running...")\ndata = [1, 2, 3, 4, 5]\nprint("Mean:", sum(data) / len(data))\n`,
    },
    exercise: {
      instructions: {
        en: `Run the Python code to compute basic statistical metrics for a dataset.`,
        bn: `পাইথন কোড রান করে স্ট্যাটিস্টিক্যাল হিসাব দেখুন।`,
      },
      hint: {
        en: 'Click Run Code to execute Python code.',
        bn: 'Run Code বাটন চাপুন।',
      },
      solution: {
        python: `data = [10, 20, 30]\nprint("Average:", sum(data)/len(data))`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'print',
      },
    },
  };
});
