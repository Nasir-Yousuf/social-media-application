// Chapter 7: AI Tools, Programming, and the Technology Stack (Lessons 61-70)

export const CHAPTER_7_LESSONS = [
  {
    id: 'ai-61',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 61,
    difficulty: 'Intermediate',
    title: {
      en: '61. Why Python Is Popular in AI and Machine Learning',
      bn: '৬১. এআই এবং মেশিন লার্নিংয়ে পাইথন কেন এতো জনপ্রিয়',
    },
    subtitle: {
      en: 'Discover how English-like syntax and C-powered high-performance math libraries made Python the universal language of AI.',
      bn: 'সহজ সিনট্যাক্স এবং C-চালিত হাই-পারফরম্যান্স ম্যাথ লাইব্রেরির কারণে পাইথন কীভাবে এআই-এর প্রধান ভাষা হয়ে উঠলো।',
    },
    duration: '15 mins',
    objectives: [
      'Understand why Python became the dominant language for data science and deep learning.',
      'Differentiate Python binding glue code from fast underlying C/C++/CUDA execution engines.',
      'Identify key Python libraries (NumPy, PyTorch, Pandas, Scikit-Learn) used by AI engineers.',
    ],
    prerequisites: 'Chapter 6 Complete',
    explanation: {
      simple: {
        en: 'Python reads almost like human English, making complex math easy to express. While Python itself is slow at looping, AI libraries wrap high-speed C and CUDA code under the hood. So you get simple writing speed AND blazing fast computer speed!',
        bn: 'পাইথনের সিনট্যাক্স ইংরেজির মতো সহজ। যদিও পাইথন নিজে ধীরগতির, এর এআই লাইব্রেরিগুলো পেছনে C এবং CUDA দিয়ে অত্যন্ত দ্রুত চলে।',
      },
      analogy: {
        en: 'Python is like the steering wheel and dashboard of a Ferrari. The dashboard is clean and easy for a human driver, while the heavy V12 engine underneath does all the high-speed heavy work.',
        bn: 'পাইথন হলো ফেরারি গাড়ির স্টিয়ারিং বা ড্যাশবোর্ডের মতো—যা চালানো সহজ, আর ইঞ্জিনের শক্তিশালী ক্ষমতা গাড়িকে দ্রুত চালায়।',
      },
      technical: {
        en: 'Python acts as an orchestration language. High-level API calls instantiate C++/CUDA pointers (e.g. PyTorch Tensor operations). Heavy linear algebra routines execute natively on GPUs via cuBLAS/cuDNN with zero Python interpreter overhead.',
        bn: 'পাইথন অর্কেস্ট্রেশন ল্যাঙ্গুয়েজ হিসেবে কাজ করে এবং ব্যাকএন্ডে মেমোরিতে সরাসরি cuBLAS/cuDNN রান করে।',
      },
    },
    misconceptions: [
      'Thinking Python is too slow for AI. (False: the heavy mathematical calculations execute in optimized C/C++ or CUDA assembly).',
      'Believing you must write raw low-level C++ to train neural networks.',
    ],
    feynmanChallenge: {
      question: 'Explain why AI researchers prefer Python over languages like C++ or Java despite Python being slower on standard benchmarks.',
      sampleAnswer: 'Python provides simple English-like syntax allowing rapid research iteration, while under the hood it calls ultra-fast C/C++/CUDA code to execute heavy matrix operations on GPUs.',
    },
    codeLab: {
      initialCode: '# Simple Python vector math demo\nimport numpy as np\n\n# Create two vector arrays\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\n\n# Fast vector dot product\nresult = np.dot(a, b)\nprint("Dot product result:", result)\n',
      expectedOutput: 'Dot product result: 32',
      explanation: 'In Python, np.dot executes native C-level vector operations instantly!',
    },
    quiz: [
      {
        question: 'Why is Python exceptionally fast when executing AI mathematical operations using libraries like NumPy or PyTorch?',
        options: [
          'Python compiles directly into hardware machine code',
          'Python uses C, C++, and CUDA under the hood for array operations',
          'Python does not use memory for numbers',
          'Python bypasses CPU instructions completely',
        ],
        correctAnswer: 1,
        explanation: 'Python libraries bind high-performance compiled C/C++ and CUDA binaries to perform matrix calculations.',
      },
    ],
    summary: [
      'Python is readable, expressive, and supported by a massive AI ecosystem.',
      'C/C++ and CUDA backends perform heavy matrix math.',
      'Key libraries include NumPy, Pandas, Scikit-Learn, PyTorch, and TensorFlow.',
    ],
    glossary: [
      { term: 'Binding', definition: 'A wrapper allowing Python code to invoke functions written in compiled languages like C/C++.' },
      { term: 'CUDA', definition: 'NVIDIA platform enabling GPUs to execute parallel computing calculations for AI.' },
    ],
    nextLessonId: 'ai-62',
  },
  {
    id: 'ai-62',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 62,
    difficulty: 'Intermediate',
    title: {
      en: '62. Setting Up a Python Environment: Installing Python, Packages, and Virtual Environments',
      bn: '৬২. পাইথন এনভায়রনমেন্ট সেটআপ: পাইথন ইনস্টল, প্যাকেজ এবং ভার্চুয়াল এনভায়রনমেন্ট',
    },
    subtitle: {
      en: 'Learn how python version management, venv, and pip isolate project dependencies cleanly.',
      bn: 'পাইথন প্যাকেজ, venv এবং pip দিয়ে কীভাবে আপনার প্রজেক্টের নির্ভরতাগুলো আলাদা রাখবেন।',
    },
    duration: '15 mins',
    objectives: [
      'Understand why virtual environments prevent conflicting package versions.',
      'Use pip and requirements.txt to install AI libraries.',
      'Distinguish global system Python from project-isolated virtual environments.',
    ],
    prerequisites: 'Lesson 61 Complete',
    explanation: {
      simple: {
        en: 'Different AI projects require different library versions. A virtual environment is an isolated folder containing its own copy of Python and installed libraries, preventing version conflicts.',
        bn: 'ভার্চুয়াল এনভায়রনমেন্ট হলো আলাদা একটি ফোল্ডার যেখানে একটি প্রজেক্টের নিজস্ব পাইথন ফাইল ও প্যাকেজ জমা থাকে।',
      },
      analogy: {
        en: 'A virtual environment is like having separate toolboxes for plumbing, electrical work, and woodworking. You take only the specific tools required for that single job without cluttering your room.',
        bn: 'ভার্চুয়াল এনভায়রনমেন্ট হলো আলাদা আলাদা টুলবক্সের মতো যা প্রজেক্টের লাইব্রেরিগুলোকে গুলিয়ে ফেলা থেকে রক্ষা করে।',
      },
      technical: {
        en: 'python -m venv env creates an isolated environment directory. Activating it updates the PATH environment variable so that running python or pip targets the local site-packages directory rather than the system global environment.',
        bn: 'python -m venv env লোকাল site-packages ডিরেক্টরি তৈরি করে সিস্টেম লেভেল দ্বন্দ্ব এড়ায়।',
      },
    },
    misconceptions: [
      'Installing all Python packages globally on your operating system without venv.',
      'Confusing pip (the package installer) with python (the interpreter language).',
    ],
    feynmanChallenge: {
      question: 'Why should you create a fresh virtual environment before starting a new AI project?',
      sampleAnswer: 'To isolate dependencies and ensure library version changes in one project do not break other installed projects on the machine.',
    },
    codeLab: {
      initialCode: '# Shell commands to set up environment\n# python -m venv my_ai_env\n# source my_ai_env/bin/activate  # Mac/Linux\n# pip install numpy torch pandas\nprint("Virtual environment workflow ready!")\n',
      expectedOutput: 'Virtual environment workflow ready!',
      explanation: 'Using virtual environments keeps your system clean and builds reproducible projects.',
    },
    quiz: [
      {
        question: 'What command creates a virtual environment named "env" in Python 3?',
        options: ['pip create env', 'python -m venv env', 'install python env', 'make env --python'],
        correctAnswer: 1,
        explanation: 'python -m venv env creates an isolated directory containing the local Python runtime.',
      },
    ],
    summary: [
      'Virtual environments isolate Python packages per project.',
      'pip installs packages from PyPI (Python Package Index).',
      'requirements.txt lists exact dependency versions for sharing code.',
    ],
    glossary: [
      { term: 'pip', definition: 'The official package manager for installing Python libraries.' },
      { term: 'venv', definition: 'Python module that creates lightweight virtual environments.' },
    ],
    nextLessonId: 'ai-63',
  },
  {
    id: 'ai-63',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 63,
    difficulty: 'Intermediate',
    title: {
      en: '63. Choosing an Editor: VS Code, PyCharm, and Jupyter Notebook',
      bn: '৬৩. এডিটরের ভূমিকা: ভিএস কোড, পাইচার্ম এবং জুপিটার নোটবুক',
    },
    subtitle: {
      en: 'Master code execution styles: interactive cell-by-cell exploratory data analysis vs modular software engineering.',
      bn: 'জুপিটার নোটবুকের সেসভিত্তিক কোডিং বনাম ভিএস কোডের মডিউলার সফটওয়্যার ইঞ্জিনিয়ারিংয়ের পার্থক্য শিখুন।',
    },
    duration: '15 mins',
    objectives: [
      'Compare interactive cell execution (Jupyter) with traditional IDE files (.py script files in VS Code).',
      'Understand the power of inline data visualizations in notebook environments.',
      'Know when to transition from prototype notebooks to structured Python codebases.',
    ],
    prerequisites: 'Lesson 62 Complete',
    explanation: {
      simple: {
        en: 'Jupyter Notebooks let you run code in small blocks (cells) and view graphs immediately below. It is perfect for experimenting! IDEs like VS Code or PyCharm help you build large, production-ready applications.',
        bn: 'জুপিটার নোটবুক টুকরো টুকরো কোড ব্লক বা সেল রান করে গ্রাফ দেখতে সাহায্য করে। আর ভিএস কোড বড় প্রোডাকশন প্রজেক্ট লেখার জন্য সেরা।',
      },
      analogy: {
        en: 'Jupyter Notebook is a scientist’s lab notebook—full of quick sketches, notes, and trial results. VS Code is the factory floor where finished inventions are manufactured into commercial products.',
        bn: 'জুপিটার নোটবুক ল্যাবরেটরি খাতার মতো, আর ভিএস কোড হলো কারখানার মতো যেখানে চূড়ান্ত পণ্য উৎপাদন করা হয়।',
      },
      technical: {
        en: 'Jupyter uses an IPython kernel communicating over WebSockets via JSON messages. It retains global variable state across interactive cell executions, enabling rapid iterative data processing without re-reading datasets.',
        bn: 'জুপিটার IPython কার্নেল দিয়ে ব্রাউজারে ভ্যারিয়েবলের স্টেট ধরে রেখে সেসভিত্তিক আউটপুট দেয়।',
      },
    },
    misconceptions: [
      'Assuming notebooks are only for beginners. (Top AI researchers build early prototypes in notebooks).',
      'Using out-of-order cell executions in Jupyter, which causes confusing state bugs.',
    ],
    feynmanChallenge: {
      question: 'What is the main benefit of Jupyter Notebooks for data analysis compared to running standard Python scripts?',
      sampleAnswer: 'Jupyter retains memory state between code cells, letting you load data once and instantly tweak visualizations or calculations without reloading the full dataset every time.',
    },
    quiz: [
      {
        question: 'Which tool allows you to run code in interactive blocks and view inline charts immediately below?',
        options: ['C++ Compiler', 'Jupyter Notebook', 'Command Prompt', 'Notepad'],
        correctAnswer: 1,
        explanation: 'Jupyter Notebooks render Markdown text, execution output, and visual charts directly inline in the browser.',
      },
    ],
    summary: [
      'Jupyter Notebooks (.ipynb) are ideal for research and visual data exploration.',
      'VS Code and PyCharm (.py) are essential for building production AI applications.',
      'Always restart and re-run notebooks sequentially to ensure reproducible results.',
    ],
    glossary: [
      { term: 'IPython Kernel', definition: 'The backend process executing Python code cells in Jupyter.' },
      { term: 'Cell', definition: 'An isolated input region in Jupyter for executable code or formatted Markdown text.' },
    ],
    nextLessonId: 'ai-64',
  },
  {
    id: 'ai-64',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 64,
    difficulty: 'Intermediate',
    title: {
      en: '64. NumPy and Pandas: Working With Numbers and Data',
      bn: '৬৪. নামপাই এবং পান্ডাস: সংখ্যা ও ডেটা নিয়ে কাজ করা',
    },
    subtitle: {
      en: 'Manipulate multidimensional arrays with NumPy and clean tabular DataFrames using Pandas.',
      bn: 'নামপাই দিয়ে মাল্টি-ডাইমেনশনাল অ্যারেই এবং পান্ডাস দিয়ে টেবিল ডেটাসেট প্রক্রিয়াকরণ শিখুন।',
    },
    duration: '20 mins',
    objectives: [
      'Master N-dimensional arrays (ndarray) in NumPy for numerical vectorized operations.',
      'Use Pandas DataFrames for filtering, cleaning, and transforming tabular datasets.',
      'Understand how NumPy vectorization replaces slow Python for-loops.',
    ],
    prerequisites: 'Lesson 63 Complete',
    explanation: {
      simple: {
        en: 'NumPy gives you supercharged numerical lists called arrays. Pandas acts like Excel inside Python—handling columns, rows, missing values, and filtering millions of data rows in milliseconds.',
        bn: 'নামপাই আপনাকে সুপারফাস্ট ম্যাট্রিক্স অ্যারে দেয়। পান্ডাস পাইথনের ভেতরের এক্সেল শিটের মতো কাজ করে।',
      },
      analogy: {
        en: 'NumPy is a grid of pure mathematical bricks. Pandas is an organized spreadsheet with row numbers and column labels like "Age", "Price", and "Location".',
        bn: 'নামপাই হলো গাণিতিক ইট, আর পান্ডাস হলো স্প্রেডশিটের টেবিল যেখানে কলাম ও সারির নাম থাকে।',
      },
      technical: {
        en: 'NumPy ndarrays store homogeneous elements in contiguous memory blocks. Pandas DataFrame wraps NumPy arrays with index and column metadata, allowing alignment, slicing, and SQL-like merging.',
        bn: 'NumPy অ্যারে মেমোরিতে সরাসরি থাকে বলে ভেক্টরাইজড ক্যালকুলেশন অত্যন্ত দ্রুত সম্পন্ন হয়।',
      },
    },
    misconceptions: [
      'Writing Python for-loops to multiply array elements instead of using NumPy vectorized math.',
      'Confusing Pandas Series (1D column) with Pandas DataFrame (2D table).',
    ],
    feynmanChallenge: {
      question: 'Why is multiplying two NumPy arrays significantly faster than iterating over a Python list with a for-loop?',
      sampleAnswer: 'NumPy stores elements in contiguous memory blocks and executes vectorized operations using compiled C loops and CPU SIMD instructions.',
    },
    codeLab: {
      initialCode: '# Pandas DataFrame demo\nimport pandas as pd\n\ndata = {\n    "House_Size": [1200, 1800, 2400],\n    "Price": [250000, 350000, 480000]\n}\ndf = pd.DataFrame(data)\nprint(df.describe())\n',
      expectedOutput: '        House_Size          Price\ncount     3.000000       3.000000\nmean   1800.000000  360000.000000\nstd     600.000000  115325.625946\nmin    1200.000000  250000.000000\n25%    1500.000000  300000.000000\n50%    1800.000000  350000.000000\n75%    2100.000000  415000.000000\nmax    2400.000000  480000.000000',
      explanation: 'Pandas automatically calculates statistical summaries for numerical columns!',
    },
    quiz: [
      {
        question: 'Which Pandas object represents a 2-dimensional table with labeled rows and columns?',
        options: ['Series', 'DataFrame', 'ndarray', 'Tensor'],
        correctAnswer: 1,
        explanation: 'A DataFrame represents a tabular 2D data structure with rows and columns.',
      },
    ],
    summary: [
      'NumPy handles high-performance N-dimensional array math.',
      'Pandas cleans and manipulates tabular datasets efficiently.',
      'Vectorization avoids slow Python loops when preparing AI data.',
    ],
    glossary: [
      { term: 'ndarray', definition: 'NumPy multidimensional array data structure.' },
      { term: 'DataFrame', definition: 'Pandas 2-dimensional labeled data structure with columns of potentially different types.' },
    ],
    nextLessonId: 'ai-65',
  },
  {
    id: 'ai-65',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 65,
    difficulty: 'Intermediate',
    title: {
      en: '65. Matplotlib: Visualizing Data and Model Performance',
      bn: '৬৫. ম্যাটপ্লটলিব: ডেটা ভিজ্যুয়ালাইজেশন এবং মডেল পারফরম্যান্স',
    },
    subtitle: {
      en: 'Plot loss curves, histograms, decision boundaries, and scatter plots to inspect your AI.',
      bn: 'লস কার্ভ, হিস্টোগ্রাম এবং স্ক্যাটার প্লট দিয়ে এআই মডেলের কাজের অগ্রগতি পর্যালোচনা করুন।',
    },
    duration: '15 mins',
    objectives: [
      'Create scatter plots, line graphs, and bar charts using Matplotlib.',
      'Plot training loss curves to diagnose overfitting vs underfitting.',
      'Understand how visual graphs reveal hidden patterns in datasets.',
    ],
    prerequisites: 'Lesson 64 Complete',
    explanation: {
      simple: {
        en: 'Matplotlib is Python’s drawing brush! It turns plain tables of numbers into colorful charts. In AI, we plot a line graph of Loss over Time—if the line moves downward, our model is learning!',
        bn: 'ম্যাটপ্লটলিব দিয়ে সংখ্যাগুলোকে রঙিন গ্রাফে রূপান্তর করা হয়। লস কমে গেলে বুঝতে পারবেন মডেলটি ট্রেইন হচ্ছে।',
      },
      analogy: {
        en: 'Matplotlib is like a doctor’s heart monitor screen. Instead of reading raw blood pressure numbers, the doctor watches the visual wave line to evaluate health instantly.',
        bn: 'ম্যাটপ্লটলিব হলো হার্ট মনিটর স্ক্রিনের মতো, যা দেখে সহজেই উন্নতি বুঝতে পারা যায়।',
      },
      technical: {
        en: 'Matplotlib uses an object-oriented API (Figure and Axes). Training loops call plt.plot(epochs, losses) to visually monitor loss decay and epoch divergence.',
        bn: 'Matplotlib Figure এবং Axes ব্যবহারের মাধ্যমে এপোচ চলাকালীন লস ডিকেই গ্রাফ প্লট করে।',
      },
    },
    misconceptions: [
      'Thinking data visualization is just for presentation slides, rather than a critical AI debugging tool.',
    ],
    feynmanChallenge: {
      question: 'What does a plot showing Training Loss decreasing while Validation Loss rises indicate?',
      sampleAnswer: 'It indicates Overfitting—the model is memorizing training data details but losing the ability to generalize to new validation data.',
    },
    codeLab: {
      initialCode: '# Matplotlib plot simulation\nimport matplotlib.pyplot as plt\n\nepochs = [1, 2, 3, 4, 5]\nloss = [0.9, 0.6, 0.3, 0.15, 0.05]\n\nprint("Epochs:", epochs)\nprint("Losses:", loss)\nprint("Visual chart ready for plotting!")\n',
      expectedOutput: 'Epochs: [1, 2, 3, 4, 5]\nLosses: [0.9, 0.6, 0.3, 0.15, 0.05]\nVisual chart ready for plotting!',
      explanation: 'Plotting loss over epochs shows how well your network converges.',
    },
    quiz: [
      {
        question: 'Which visual chart is most helpful for observing how model loss changes over training epochs?',
        options: ['Pie chart', 'Line graph (Loss curve)', '3D CAD rendering', 'Venn diagram'],
        correctAnswer: 1,
        explanation: 'A line graph plotting loss on the vertical axis against training epoch on the horizontal axis clearly displays learning progress.',
      },
    ],
    summary: [
      'Matplotlib renders static, animated, and interactive visualizations.',
      'Plotting loss curves lets engineers diagnose training health.',
      'Scatter plots show feature distributions before feeding data to models.',
    ],
    glossary: [
      { term: 'Loss Curve', definition: 'A graph plotting model error value across training epochs.' },
      { term: 'Scatter Plot', definition: 'A diagram using Cartesian coordinates to display values for two variables for a set of data.' },
    ],
    nextLessonId: 'ai-66',
  },
  {
    id: 'ai-66',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 66,
    difficulty: 'Intermediate',
    title: {
      en: '66. PyTorch and TensorFlow: Frameworks for Building Neural Networks',
      bn: '৬৬. পাইটর্চ এবং টেনসরফ্লো: নিউরাল নেটওয়ার্ক তৈরির ফ্রেমওয়ার্ক',
    },
    subtitle: {
      en: 'Compare the two giant deep learning engines powering modern industry and research.',
      bn: 'আধুনিক ইন্ডাস্ট্রি ও গবেষণায় ব্যবহৃত দুটি বিখ্যাত ডিপ লার্নিং ইঞ্জিন তুলনা করুন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand the role of Deep Learning Frameworks in automatic differentiation (Autograd).',
      'Compare PyTorch (dynamic computational graph, pythonic) with TensorFlow/Keras (static production graphs).',
      'Construct a basic neural network layer in PyTorch code syntax.',
    ],
    prerequisites: 'Lesson 65 Complete',
    explanation: {
      simple: {
        en: 'Instead of writing raw calculus for backpropagation, PyTorch and TensorFlow calculate gradients automatically! PyTorch (backed by Meta) is favored in top research, while TensorFlow (backed by Google) is heavily used in production.',
        bn: 'পাইটর্চ এবং টেনসরফ্লো অটোমেটিক গ্র্যাডিয়েন্ট গণনাকারী ফ্রেমওয়ার্ক। গবেষণায় পাইটর্চ এবং বড় প্রোডাকশনে টেনসরফ্লো ব্যবহৃত হয়।',
      },
      analogy: {
        en: 'PyTorch and TensorFlow are like high-tech construction toolkits. Rather than manufacturing every screw and wire yourself, you snap pre-built neural network blocks together like Lego bricks!',
        bn: 'পাইটর্চ ও টেনসরফ্লো হলো লেগো ব্লকের মতো—প্রস্তুতকৃত ব্লক জুড়ে দিয়ে জটিল নিউরাল নেটওয়ার্ক দাঁড় করানো যায়।',
      },
      technical: {
        en: 'PyTorch uses dynamic computational graphs (eager execution), rebuilding graph edges on every forward pass. PyTorch autograd engine tracks tensor operations in a Directed Acyclic Graph (DAG) for instant backward pass computations.',
        bn: 'PyTorch ডায়নামিক গ্রাফ এবং autograd এর মাধ্যমে ইগার এক্সিকিউশনে সহজে ডিব্যাগিং ও গ্র্যাডিয়েন্ট ট্র্যাক করে।',
      },
    },
    misconceptions: [
      'Thinking you must learn both frameworks simultaneously as a beginner. (Master PyTorch first).',
    ],
    feynmanChallenge: {
      question: 'What crucial job does Autograd perform in frameworks like PyTorch?',
      sampleAnswer: 'Autograd automatically tracks mathematical operations on tensors and calculates exact derivatives (gradients) during backpropagation without manual calculus code.',
    },
    codeLab: {
      initialCode: '# PyTorch basic tensor and layer syntax concept\nimport torch\nimport torch.nn as nn\n\n# Define a simple Linear layer (3 inputs, 1 output)\nlayer = nn.Linear(in_features=3, out_features=1)\nx = torch.tensor([[1.0, 2.0, 3.0]])\noutput = layer(x)\n\nprint("Input Tensor:", x)\nprint("Layer Output:", output)\n',
      expectedOutput: 'Input Tensor: tensor([[1., 2., 3.]])\nLayer Output: tensor([[...]], grad_fn=<AddmmBackward0>)',
      explanation: 'PyTorch nn.Linear automatically initializes weight matrices and handles matrix multiplication!',
    },
    quiz: [
      {
        question: 'Which PyTorch engine automatically calculates mathematical derivatives for backpropagation?',
        options: ['Autograd', 'CUDA', 'Pip', 'Numpy'],
        correctAnswer: 0,
        explanation: 'Autograd is PyTorch’s automatic differentiation engine powering backpropagation.',
      },
    ],
    summary: [
      'PyTorch and TensorFlow provide pre-built neural layers and autograd tools.',
      'PyTorch dominates academic AI research due to dynamic debugging ease.',
      'Tensors are the fundamental data structures passed through framework layers.',
    ],
    glossary: [
      { term: 'Autograd', definition: 'Automatic differentiation feature calculating gradients for tensor operations.' },
      { term: 'nn.Module', definition: 'Base class for all neural network modules in PyTorch.' },
    ],
    nextLessonId: 'ai-67',
  },
  {
    id: 'ai-67',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 67,
    difficulty: 'Intermediate',
    title: {
      en: '67. Google Colab and Cloud Notebooks: Experimenting Without a Powerful Computer',
      bn: '৬৭. গুগল কোল্যাব এবং ক্লাউড নোটবুক: শক্তিশালী পিসি ছাড়াই ট্রেইনিং',
    },
    subtitle: {
      en: 'Leverage free cloud T4/V100 GPUs and Jupyter environments directly in your browser.',
      bn: 'ব্রাউজার থেকে বিনামূল্যে ক্লাউড জিপিইউ ব্যবহার করে বড় এআই মডেল ট্রেইন করুন।',
    },
    duration: '15 mins',
    objectives: [
      'Run PyTorch code on cloud GPUs using Google Colab.',
      'Connect Colab sessions to Google Drive for dataset storage.',
      'Understand session runtime limits and GPU allocation queues.',
    ],
    prerequisites: 'Lesson 66 Complete',
    explanation: {
      simple: {
        en: 'You do not need a \$3,000 gaming laptop to learn deep learning! Google Colab provides free cloud Jupyter notebooks connected to powerful NVIDIA GPUs right inside your browser.',
        bn: 'দামী পিসি ছাড়াই গুগল কোল্যাবের সাহায্যে ক্লাউডে ফ্রিতে NVIDIA GPU ব্যবহার করে এআই মডেল রান করতে পারবেন।',
      },
      analogy: {
        en: 'Google Colab is like renting a supercar over cloud Wi-Fi. You drive it from your cheap smartphone screen, while the actual V12 GPU engine runs in a massive Google data center thousands of miles away.',
        bn: 'গুগল কোল্যাব হলো ক্লাউডের মাধ্যমে সুপারকার ড্রাইভ করার মতো—আপনার পিসি সাধারণ হলেও ব্যাকএন্ডে চলবে রিয়েল GPU!',
      },
      technical: {
        en: 'Google Colab provisions a Linux virtual machine container with preinstalled PyTorch, CUDA drivers, and a Jupyter frontend. Session runtimes persist temporarily, allocating free T4 or L4 GPU acceleration.',
        bn: 'কোল্যাব ব্যাকএন্ডে লিনাক্স কন্টেইনার তৈরি করে ফ্রি T4 জিপিইউ ও পাইটর্চ এনভায়রনমেন্ট বরাদ্দ করে।',
      },
    },
    misconceptions: [
      'Believing you cannot train AI because your personal laptop has no dedicated GPU.',
    ],
    feynmanChallenge: {
      question: 'How does Google Colab make AI development accessible to students worldwide?',
      sampleAnswer: 'By hosting Jupyter Notebooks in the cloud and offering free GPU hardware via the web browser, eliminating the need to buy expensive computer hardware.',
    },
    quiz: [
      {
        question: 'What hardware hardware accelerator can be enabled for free inside Google Colab notebook settings?',
        options: ['NVIDIA GPU / TPU', 'Floppy Disk Drive', 'Audio Sound Card', 'Dial-up Modem'],
        correctAnswer: 0,
        explanation: 'Google Colab offers free NVIDIA GPU and TPU hardware accelerators for model training.',
      },
    ],
    summary: [
      'Google Colab runs Jupyter notebooks in cloud Linux containers.',
      'Provides free access to NVIDIA GPUs (T4, V100, A100 tiers).',
      'Ideal for training deep learning models without buying expensive hardware.',
    ],
    glossary: [
      { term: 'Colab Runtime', definition: 'The cloud virtual machine hosting your interactive notebook session.' },
    ],
    nextLessonId: 'ai-68',
  },
  {
    id: 'ai-68',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 68,
    difficulty: 'Intermediate',
    title: {
      en: '68. Hugging Face: Discovering Models, Datasets, and Libraries',
      bn: '৬৮. হাগিং ফেস: মডেল, ডেটাসেট এবং লাইব্রেরির মেগা হাব',
    },
    subtitle: {
      en: 'Explore the GitHub of AI—download open-source LLMs, vision transformers, and datasets in lines of code.',
      bn: 'ওপেন সোর্স মডেল, ডেটাসেট এবং ট্র্যান্সফরমার হাব থেকে কোড ডাউনলোডের নিয়ম জানুন।',
    },
    duration: '20 mins',
    objectives: [
      'Navigate Hugging Face Model Hub, Datasets, and Spaces.',
      'Use the `transformers` Python library pipeline API to load pretrained LLMs and Vision models.',
      'Understand how open-source model sharing accelerates AI innovation.',
    ],
    prerequisites: 'Lesson 67 Complete',
    explanation: {
      simple: {
        en: 'Hugging Face is the central app store and GitHub for open-source AI! Developers around the world upload trained LLMs, vision models, and datasets. You can download state-of-the-art models in 3 lines of Python code!',
        bn: 'হাগিং ফেস হলো এআই-এর অ্যাপ স্টোর। এখান থেকে ৩ লাইন পাইথন কোড লিখেই যেকোনো ট্রেইনড মডেল ডাউনলোড করে ব্যবহার করা যায়।',
      },
      analogy: {
        en: 'Hugging Face is a public library of pre-cooked gourmet meals. Instead of spending 6 months farming wheat and cooking from scratch, you pull a delicious 5-star AI model right off the shelf!',
        bn: 'হাগিং ফেস হলো ওপেন কিচেনের মতো, যেখানে তৈরি রান্না করা খাবার ফ্রিতে নিয়ে ব্যবহার করা যায়।',
      },
      technical: {
        en: 'Hugging Face `transformers` library abstracts model architecture, weights download, and tokenization. AutoModelForCausalLM and AutoTokenizer fetch model weights from Git LFS repositories automatically.',
        bn: 'হাগিং ফেস transformers লাইব্রেরি AutoModel এবং AutoTokenizer দিয়ে Git LFS থেকে মডেল ওয়েটস লোড করে।',
      },
    },
    misconceptions: [
      'Thinking every AI model must be trained from scratch by your company.',
    ],
    feynmanChallenge: {
      question: 'What is the role of Hugging Face in the modern open-source AI ecosystem?',
      sampleAnswer: 'It acts as the central hub hosting open-source model weights, datasets, and standard Python libraries (`transformers`) to easily load and fine-tune state-of-the-art models.',
    },
    codeLab: {
      initialCode: '# Hugging Face Transformers pipeline concept\n# from transformers import pipeline\n# classifier = pipeline("sentiment-analysis")\n# result = classifier("I love building AI applications!")\nprint("Hugging Face pipeline initialized successfully!")\nprint("Sentiment: POSITIVE (Score: 0.9998)")\n',
      expectedOutput: 'Hugging Face pipeline initialized successfully!\nSentiment: POSITIVE (Score: 0.9998)',
      explanation: 'Hugging Face pipelines hide tokenization and model inference into one simple call!',
    },
    quiz: [
      {
        question: 'Which platform is widely recognized as the primary open-source hub for AI model weights and datasets?',
        options: ['Hugging Face', 'WordPress', 'Photoshop', 'Excel'],
        correctAnswer: 0,
        explanation: 'Hugging Face Hub hosts over hundreds of thousands of open-source models, datasets, and web demos.',
      },
    ],
    summary: [
      'Hugging Face hosts open-source pretrained models, datasets, and demos.',
      'The `transformers` library provides simple APIs for PyTorch/TensorFlow.',
      'Pretrained models save millions of dollars in compute time.',
    ],
    glossary: [
      { term: 'Model Hub', definition: 'Git-based repository hosting trained model weight files.' },
      { term: 'Pipeline', definition: 'High-level Hugging Face API combining pre-processing, inference, and post-processing.' },
    ],
    nextLessonId: 'ai-69',
  },
  {
    id: 'ai-69',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 69,
    difficulty: 'Intermediate',
    title: {
      en: '69. AI APIs, Model Serving, GPUs, and the Difference Between Local and Cloud Inference',
      bn: '৬৯. এআই এপিআই, মডেল সার্ভিং এবং লোকাল বনাম ক্লাউড ইনফারেন্স',
    },
    subtitle: {
      en: 'Evaluate trade-offs between local open-weight inference (privacy, zero API cost) vs cloud APIs (scalability, ultra-fast latency).',
      bn: 'লোকাল ওপেন সোর্স ইনফারেন্স (গোপনীয়তা) বনাম ক্লাউড এপিআই ব্যবহারের সুবিধা ও খরচের পার্থক্য বুঝুন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand cloud REST/gRPC AI APIs (OpenAI, Anthropic, Google Gemini).',
      'Distinguish Cloud Inference from Local Model Execution (Ollama, vLLM).',
      'Evaluate latency, data privacy, rate limits, and per-token pricing trade-offs.',
    ],
    prerequisites: 'Lesson 68 Complete',
    explanation: {
      simple: {
        en: 'You can run AI in two ways: Cloud APIs (sending HTTP requests to giant cloud servers like OpenAI or Gemini) OR Local Inference (running open models directly on your own computer via tools like Ollama). APIs require zero GPU hardware, but cost money per token.',
        bn: 'এআই দুটি উপায়ে চালানো যায়: ক্লাউড এপিআই (অনলাইনে মেসেজ পাঠিয়ে উত্তর নেওয়া) অথবা লোকাল ইনফারেন্স (ওলামা দিয়ে নিজের পিসিতে রান করা)।',
      },
      analogy: {
        en: 'Cloud API is like ordering food from UberEats—fast, no kitchen needed, but costs money per order. Local inference is cooking in your home kitchen—you need your own appliances, but once bought, meals are free!',
        bn: 'ক্লাউড এপিআই হলো রেস্তোরাঁ থেকে খাবার অর্ডার করার মতো, আর লোকাল ইনফারেন্স হলো নিজের রান্নাঘরে রেঁধে খাওয়ার মতো।',
      },
      technical: {
        en: 'Cloud APIs expose HTTPS endpoint endpoints returning JSON payloads with token stream SSE (Server-Sent Events). Local model engines (vLLM, Ollama, llama.cpp) quantize weights (4-bit/8-bit GGML/GGUF) to fit consumer VRAM.',
        bn: 'ক্লাউড এপিআই JSON SSE স্ট্রিমিং ব্যবহার করে। লোকাল ইঞ্জিনে GGUF/Ollama কুয়ান্টাইজেশন দিয়ে GPU VRAM-এ মডেল ফিট করানো হয়।',
      },
    },
    misconceptions: [
      'Assuming your local laptop can easily run a 405B parameter model without giant hardware.',
      'Fearing that cloud APIs always store and train on your private user data without enterprise opt-out policies.',
    ],
    feynmanChallenge: {
      question: 'When would a bank choose Local Model Inference over calling a public Cloud AI API?',
      sampleAnswer: 'When strict data privacy regulation prohibits sending confidential financial client data across external third-party cloud networks.',
    },
    codeLab: {
      initialCode: '# Simulated API Request call pattern\nimport json\n\ndef call_ai_api(prompt):\n    # Simulate sending POST request with API key in header\n    response = {"status": 200, "content": f"AI Response to: {prompt}"}\n    return response\n\nres = call_ai_api("Explain API serving")\nprint("Status:", res["status"])\nprint("Output:", res["content"])\n',
      expectedOutput: 'Status: 200\nOutput: AI Response to: Explain API serving',
      explanation: 'APIs use standard HTTP POST requests returning structured JSON responses.',
    },
    quiz: [
      {
        question: 'What is a major advantage of using Cloud AI APIs over running local models on a standard laptop?',
        options: [
          'No requirement for expensive local GPU hardware',
          'It works without internet connectivity',
          'Zero latency guaranteed always',
          'No API keys needed',
        ],
        correctAnswer: 0,
        explanation: 'Cloud APIs run heavy model inference on cloud GPU clusters, requiring only a simple internet HTTP call.',
      },
    ],
    summary: [
      'Cloud APIs provide fast access to massive models via HTTP requests.',
      'Local inference (Ollama/llama.cpp) ensures privacy and offline availability.',
      'Quantization reduces model memory footprint to run on consumer GPUs.',
    ],
    glossary: [
      { term: 'Inference Engine', definition: 'Software optimized for executing forward pass predictions on trained models.' },
      { term: 'Quantization', definition: 'Technique converting weights from 16-bit floating numbers to 4-bit or 8-bit integers.' },
    ],
    nextLessonId: 'ai-70',
  },
  {
    id: 'ai-70',
    track: 'ai',
    chapter: 7,
    chapterTitle: 'Chapter 7: AI Tools, Programming, and the Technology Stack',
    order: 70,
    difficulty: 'Intermediate',
    title: {
      en: '70. Interactive Project: Build and Run a Small Machine Learning Model in Python',
      bn: '৭০. ইন্টারেক্টিভ প্রজেক্ট: পাইথনে নিজের প্রথম মেশিন লার্নিং মডেল তৈরি ও রান',
    },
    subtitle: {
      en: 'Hands-on practice: load data, train a Scikit-Learn Decision Tree, evaluate accuracy, and make live predictions.',
      bn: 'ডেটা লোড, স্কিকিট-লার্ন মডেল ট্রেইনিং, অ্যাক্যুরেসি টেস্ট এবং প্রেডিকশন করার সম্পূর্ণ প্রজেক্ট।',
    },
    duration: '25 mins',
    objectives: [
      'Build an end-to-end Python machine learning pipeline using Scikit-Learn.',
      'Split synthetic dataset into Training and Testing sets (train_test_split).',
      'Train a DecisionTreeClassifier model and compute test accuracy score.',
    ],
    prerequisites: 'Lessons 61-69 Complete',
    explanation: {
      simple: {
        en: 'In this chapter capstone project, you will build a complete classification model! We generate data samples, train a Decision Tree algorithm, evaluate accuracy on hidden test data, and predict unseen inputs.',
        bn: 'এই প্রজেক্টে আপনারা স্কিকিট-লার্ন ব্যবহার করে একটি ডিসিশন ট্রি ক্লাসিফায়ার মডেল তৈরি করবেন।',
      },
      analogy: {
        en: 'Building this model is like teaching a child to identify apples and oranges. You show them 80 practice fruits (Training Set), test them on 20 hidden fruits (Test Set), and grade their final exam score!',
        bn: 'এটি নতুন ফল চেনার প্রশিক্ষণের মতো—৮০টি দিয়ে প্র্যাকটিস করিয়ে ২০টিতে পরীক্ষা নিয়ে নম্বর দেওয়া হয়।',
      },
      technical: {
        en: 'The project executes train_test_split(X, y, test_size=0.2). DecisionTreeClassifier splits feature nodes based on Gini Impurity reduction. model.predict(X_test) measures generalization accuracy.',
        bn: 'ডিসিশন ট্রি মডেল Gini Impurity এর উপর ভিত্তি করে নোড ভাগ করে accurate prediction দেয়।',
      },
    },
    misconceptions: [
      'Testing your model on the exact same data used for training (causes artificially inflated 100% fake accuracy scores).',
    ],
    feynmanChallenge: {
      question: 'Why must we keep the Test dataset hidden from the model during the training phase?',
      sampleAnswer: 'To measure true generalization performance on unseen real-world data and detect whether the model overfitted or memorized training examples.',
    },
    codeLab: {
      initialCode: '# Complete Python ML Pipeline Project\nfrom sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\n\n# 1. Generate synthetic dataset (100 samples, 4 features)\nX, y = make_classification(n_samples=100, n_features=4, random_state=42)\n\n# 2. Split train/test\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 3. Initialize and train model\nclf = DecisionTreeClassifier()\nclf.fit(X_train, y_train)\n\n# 4. Predict test set and calculate accuracy\npreds = clf.predict(X_test)\nacc = accuracy_score(y_test, preds)\nprint(f"Model Training Complete! Test Accuracy: {acc * 100:.1f}%")\n',
      expectedOutput: 'Model Training Complete! Test Accuracy: 100.0%',
      explanation: 'Congratulations! You built, trained, and evaluated your first Machine Learning model in Python!',
    },
    quiz: [
      {
        question: 'What function in Scikit-Learn fits the model parameters to the training dataset?',
        options: ['clf.fit(X_train, y_train)', 'clf.predict()', 'clf.evaluate()', 'clf.download()'],
        correctAnswer: 0,
        explanation: 'The fit() method trains the algorithm by fitting model parameters to the features (X) and labels (y).',
      },
    ],
    summary: [
      'Built a complete ML pipeline: data generation, split, model fit, evaluation.',
      'Scikit-Learn provides clean standard fit() and predict() interfaces.',
      'Test accuracy confirms model performance on unseen data.',
    ],
    glossary: [
      { term: 'fit()', definition: 'Method used in Scikit-Learn to train a model on dataset features and target labels.' },
      { term: 'accuracy_score', definition: 'Metric computing the fraction of correct predictions made by a model.' },
    ],
    nextLessonId: 'ai-71',
  },
];
