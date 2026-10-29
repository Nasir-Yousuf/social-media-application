// Chapter 4: The Mathematics Behind AI, Without Fear (Lessons 31-40)

export const CHAPTER_4_LESSONS = [
  {
    id: 'ai-31',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 31,
    difficulty: 'Beginner',
    title: {
      en: '31. Why AI Needs Mathematics: Turning Real-World Problems Into Numbers',
      bn: '৩১. AI-তে কেন গণিত প্রয়োজন: বাস্তব বিশ্বকে সংখ্যায় রূপান্তর',
    },
    subtitle: {
      en: 'Discover how text, images, and audio become mathematical coordinates.',
      bn: 'ছবি, শব্দ ও বাক্য কীভাবে গাণিতিক স্থানাঙ্কে পরিবর্তিত হয়।',
    },
    duration: '15 mins',
    objectives: [
      'Understand why machines can only process numbers, not raw words or raw pixels.',
      'Explain Vectorization as turning real-world features into mathematical points in space.',
      'Identify how mathematical distance measures similarity between real-world concepts.',
    ],
    prerequisites: 'Chapter 3 Complete',
    explanation: {
      simple: {
        en: 'Computers cannot read or feel. To help a computer understand the difference between a "cat" and a "dog", or a "happy review" and an "angry review", we turn every feature into numbers and place them on a mathematical map!',
        bn: 'কম্পিউটার কোনো অনুভূতি বোঝে না। এটি ছবি বা বাক্যকে গাণিতিক স্থানাঙ্ক হিসেবে ম্যাপে উপস্থাপন করে শেখে।',
      },
      analogy: {
        en: 'Imagine plotting house prices on a 2D graph: X-axis = House Size, Y-axis = Price. Once points are plotted, you can draw a line to predict the price of any new house!',
        bn: 'গ্রাফ পেপারে বাড়ির সাইজ ও দামের পয়েন্ট বসিয়ে একটি লাইন একে নতুন বাড়ির সম্ভাব্য দাম জানার মতো।',
      },
      technical: {
        en: 'Feature Mapping transforms real-world objects into d-dimensional Feature Vectors x ∈ ℝ^d. Machine learning algorithms find hyperplanes or decision boundaries in vector space.',
        bn: 'ফিচার ম্যাপিং দ্বারা বাস্তব বস্তুকে d-ডাইমেনশনাল ভেক্টরে রূপান্তর করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'You need a PhD in advanced calculus to start learning AI concepts.',
        correction: 'Intuitive AI math is simple high-school geometry, basic vectors, and measuring distances between points!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain why we must turn words into numbers before an AI can process them.',
      modelAnswer: 'Because computer processors (CPUs/GPUs) can only execute math calculations (addition and multiplication). Turning words into numbers allows the computer to measure how close in meaning two words are!',
      checklist: ['Mentioned CPU/GPU mathematical execution.', 'Explained measuring word closeness in numbers.'],
    },
    quiz: {
      question: 'What is a "Feature Vector" in AI data representation?',
      options: [
        'A virus that infects computer RAM.',
        'A list of numbers representing measurable properties or features of an item.',
        'A special type of GPU cooling liquid.',
        'A text comment written inside Python code.',
      ],
      correctAnswer: 1,
      explanation: 'A Feature Vector is a list of numerical values representing the attributes of a data sample.',
    },
    simulationType: 'vector-space-demo',
    codeLab: {
      title: 'Simple 2D Feature Vector Plotter',
      language: 'python',
      starterCode: `# Representing House Features as Numerical Vectors
# Vector format: [Size in SqFt, Bedrooms]
house_A = [1200, 2]
house_B = [2500, 4]

price_A = 200000
price_B = 450000

print("House A Feature Vector:", house_A)
print("House B Feature Vector:", house_B)
`,
      expectedOutput: 'House A Feature Vector: [1200, 2]\nHouse B Feature Vector: [2500, 4]',
      explanation: 'Numerical feature vectors enable algorithms to compute distances and predictions.',
    },
    summary: ['AI turns real-world objects into numerical feature vectors placed in mathematical space.'],
    glossary: [
      { term: 'Feature Vector', definition: 'An n-dimensional vector of numerical features that represents an object.' },
      { term: 'Vector Space', definition: 'A mathematical space formed by a collection of vectors.' },
    ],
    nextLessonId: 'ai-32',
  },
  {
    id: 'ai-32',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 32,
    difficulty: 'Beginner',
    title: {
      en: '32. Variables, Functions, Equations, and Mathematical Relationships',
      bn: '৩২. ভ্যারিয়েবল, ফাংশন, ইকুয়েশন ও গাণিতিক সম্পর্ক',
    },
    subtitle: {
      en: 'Master the equation y = wx + b (Line of Best Fit).',
      bn: 'সরলরেখার সমীকরণ y = wx + b-এর সহজ ধারণা।',
    },
    duration: '15 mins',
    objectives: [
      'Understand mathematical functions as Input-to-Output mapping machines: f(x) = y.',
      'Master the slope-intercept equation: y = wx + b (Weight w, Bias b).',
      'Understand how changing weight (w) rotates the line and bias (b) shifts it up/down.',
    ],
    prerequisites: 'Lesson 31',
    explanation: {
      simple: {
        en: 'A mathematical function is just a factory machine: you drop an input x into the top, it multiplies by a Weight (w) and adds a Bias (b), and out pops your prediction y! Equation: y = wx + b.',
        bn: 'ফাংশন হলো একটি মেশিনের মতো: ইনপুট x দিলে তা Weight (w) দিয়ে গুণ হয়ে এবং Bias (b) যোগ হয়ে আউটপুট y বের হয়। সমীকরণ: y = wx + b।',
      },
      analogy: {
        en: 'Think of a taxi meter. The base fare is $3.00 (Bias b). Every mile costs $2.00 (Weight w). If you travel x miles, Total Price y = 2x + 3!',
        bn: 'ট্যাক্সি মিটারের মতো: বেস ফেয়ার ৩ টাকা (Bias)। প্রতি কিলোমিটার ২ টাকা (Weight)। x কিলোমিটার গেলে মোট ভাড়া y = 2x + 3।',
      },
      technical: {
        en: 'Linear Regression model: y_hat = w · x + b, where w represents the weight/slope parameter, b represents the bias/intercept parameter, and x represents the feature input vector.',
        bn: 'লিনিয়ার রিগ্রেশন মডেল: y_hat = w · x + b, যেখানে w স্লোপ এবং b ইন্টারসেপ্ট।',
      },
    },
    misconceptions: [
      {
        misconception: 'Weight (w) and Bias (b) are fixed numbers that never change during AI training.',
        correction: 'Weight and Bias are adjustable parameters. Training IS the process of adjusting w and b until predictions match real data!',
      },
    ],
    feynmanChallenge: {
      prompt: 'In the formula y = wx + b, explain what "w" and "b" do to a line on a graph.',
      modelAnswer: '"w" is the weight (or slope) that controls how steep the line tilts. "b" is the bias (or intercept) that slides the line up or down on the vertical axis!',
      checklist: ['Explained w controls tilt/steepness.', 'Explained b shifts the line up/down.'],
    },
    quiz: {
      question: 'In the linear prediction model y = 4x + 10, what is the predicted output when input x = 5?',
      options: ['19', '30', '45', '54'],
      correctAnswer: 1,
      explanation: 'y = 4(5) + 10 = 20 + 10 = 30.',
    },
    simulationType: 'line-of-best-fit-demo',
    codeLab: {
      title: 'Linear Predictor Function y = wx + b',
      language: 'python',
      starterCode: `# Linear Predictor: y = wx + b
weight = 2.5
bias = 10.0

def predict(x):
    return (weight * x) + bias

print("Prediction for x=4:", predict(4))
print("Prediction for x=10:", predict(10))
`,
      expectedOutput: 'Prediction for x=4: 20.0\nPrediction for x=10: 35.0',
      explanation: 'Adjusting weight and bias changes the output predictions for any input x.',
    },
    summary: ['Functions map inputs to outputs; y = wx + b is the foundation of linear machine learning models.'],
    glossary: [
      { term: 'Weight (w)', definition: 'The multiplier parameter in a linear model controlling feature importance and slope.' },
      { term: 'Bias (b)', definition: 'An additive parameter allowing the model to shift predictions up or down.' },
    ],
    nextLessonId: 'ai-33',
  },
  {
    id: 'ai-33',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 33,
    difficulty: 'Beginner',
    title: {
      en: '33. Linear Algebra: Vectors, Matrices, and Multidimensional Data',
      bn: '৩৩. লিনিয়ার অ্যালজেব্রা: ভেক্টর, ম্যাট্রিক্স ও বহুমুখী ডেটা',
    },
    subtitle: {
      en: 'Master scalars, 1D vectors, 2D matrices, and 3D+ tensors.',
      bn: 'স্কেলার, ১D ভেক্টর, ২D ম্যাট্রিক্স ও ৩D টেনসরের সহজ পরিচিতি।',
    },
    duration: '15 mins',
    objectives: [
      'Define Scalar (0D), Vector (1D), Matrix (2D), and Tensor (3D+).',
      'Understand how images (Height x Width x Channels) are 3D tensors.',
      'Explain how word embeddings store semantic coordinates in high-dimensional vector spaces (e.g. 512 dimensions).',
    ],
    prerequisites: 'Lesson 32',
    explanation: {
      simple: {
        en: 'Data comes in different dimensions: 1) Scalar = Single Number (e.g. 25°C), 2) Vector = 1D List of Numbers ([25, 60, 1013]), 3) Matrix = 2D Table of Numbers (Spreadsheet), 4) Tensor = 3D+ Cube of Numbers (Color Image)!',
        bn: 'ডেটার প্রকারভেদ: ১) স্কেলার (১টি সংখ্যা), ২) ভেক্টর (সংখ্যার তালিকা), ৩) ম্যাট্রিক্স (২D টেবিল), ৪) টেনসর (৩D+ কিউব)।',
      },
      analogy: {
        en: '1 dot = Scalar (0D point). 1 line of dots = Vector (1D list). 1 sheet of graph paper = Matrix (2D table). A stack of 100 sheets of graph paper = Tensor (3D block)!',
        bn: 'বিন্দু = স্কেলার। বিন্দুর লাইন = ভেক্টর। গ্রাফ পেপার = ম্যাট্রিক্স। ১০০টি গ্রাফ পেপারের বান্ডিল = টেনসর।',
      },
      technical: {
        en: 'Data Dimensions: Scalar (rank 0 tensor) ∈ ℝ, Vector (rank 1 tensor) ∈ ℝ^n, Matrix (rank 2 tensor) ∈ ℝ^(m×n), Tensor (rank k tensor) ∈ ℝ^(n1 × n2 × ... × nk). PyTorch/TensorFlow process multidimensional Tensors.',
        bn: 'পাইটর্চ ও টেনসরফ্লো ডেটা প্রসেস করতে বহুমাত্রিক টেনসর ব্যবহার করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'A 512-dimensional vector is impossible to work with because humans can only visualize 3 dimensions.',
        correction: 'While humans cannot visualize past 3D, math works identically across 512 or 4,096 dimensions!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the difference between a Vector and a Matrix using a grocery store receipt example.',
      modelAnswer: 'A Vector is a single column list of items and prices (1D). A Matrix is a 2D table showing the purchases of 100 different customers over 30 days!',
      checklist: ['Explained Vector as 1D list.', 'Explained Matrix as 2D table.'],
    },
    quiz: {
      question: 'What is a 3D grid of numbers representing a color RGB image (Height × Width × 3 Color Channels) called in machine learning?',
      options: ['Scalar', '1D Vector', '3D Tensor', 'Binary Bit'],
      correctAnswer: 2,
      explanation: 'A 3D grid of numbers (Height × Width × Color Channels) is a Rank-3 Tensor.',
    },
    simulationType: 'tensor-dimension-demo',
    codeLab: {
      title: 'PyTorch/NumPy Tensor Dimension Inspector',
      language: 'python',
      starterCode: `# Tensor Dimensions
scalar = 42
vector = [1.0, 2.0, 3.0]
matrix = [[1, 2], [3, 4]]
tensor_3d = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]

print("Scalar Value:", scalar)
print("Vector Length:", len(vector))
print("Matrix Rows x Cols:", len(matrix), "x", len(matrix[0]))
print("3D Tensor Depth x Rows x Cols:", len(tensor_3d), "x", len(tensor_3d[0]), "x", len(tensor_3d[0][0]))
`,
      expectedOutput: 'Scalar Value: 42\nVector Length: 3\nMatrix Rows x Cols: 2 x 2\n3D Tensor Depth x Rows x Cols: 2 x 2 x 2',
      explanation: 'Tensors store multidimensional numerical datasets for AI processing.',
    },
    summary: ['Data is organized into Scalars (0D), Vectors (1D), Matrices (2D), and Tensors (3D+).'],
    glossary: [
      { term: 'Tensor', definition: 'A mathematical object representing a multidimensional array of numerical values.' },
      { term: 'Embedding Space', definition: 'A high-dimensional vector space where semantically similar items are positioned near each other.' },
    ],
    nextLessonId: 'ai-34',
  },
  {
    id: 'ai-34',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 34,
    difficulty: 'Beginner',
    title: {
      en: '34. Matrix Operations and Why AI Uses Them',
      bn: '৩৪. ম্যাট্রিক্স অপারেশন এবং AI-তে কেন এর ব্যবহার এত বেশি',
    },
    subtitle: {
      en: 'Master Matrix Addition, Scalar Multiplication, and Dot Product Matrix Multiplication.',
      bn: 'ম্যাট্রিক্স যোগ, গুণ ও ডট প্রোডাক্টের সহজ প্রয়োগ।',
    },
    duration: '15 mins',
    objectives: [
      'Understand Matrix Addition and Element-wise Operations.',
      'Master Matrix Multiplication (Row × Column Dot Product).',
      'Explain why neural network layers execute matrix-vector multiplications W · x + b.',
    ],
    prerequisites: 'Lesson 33',
    explanation: {
      simple: {
        en: 'Why does AI love matrices? Because a single neural network layer has to apply 1,000 weights to 1,000 inputs. Instead of writing 1,000 separate multiplication lines, Matrix Multiplication does ALL of them in 1 clean mathematical step!',
        bn: 'নিউরাল নেটওয়ার্কের ১০০০টি ইনপুট ও ১০০০টি ওয়েটের গুণ আলাদা আলাদা না করে ম্যাট্রিক্স গুণের মাধ্যমে ১ ধাপে সম্পন্ন করা যায়।',
      },
      analogy: {
        en: 'Imagine calculating a bill for 3 friends buying apples and bananas. Matrix multiplication multiplies each quantity by its price and sums them up automatically for all 3 friends at once!',
        bn: '৩ বন্ধুর ফল কেনার বিল এক ধাপে ম্যাট্রিক্স গুণ করে হিসাব করার মতো।',
      },
      technical: {
        en: 'Matrix multiplication C = A · B requires inner dimensions to match: (m × n) · (n × p) = (m × p). Each element C_ij is the dot product of Row i in A and Column j in B.',
        bn: 'ম্যাট্রিক্স গুণ C = A · B-এর জন্য ভেতরের ডাইমেনশন মিলতে হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Matrix multiplication A · B is the exact same as B · A.',
        correction: 'Matrix multiplication is NON-commutative! Order matters: A · B ≠ B · A in general.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what a Dot Product is using a simple price × quantity example.',
      modelAnswer: 'A Dot Product takes two lists of numbers (like [2 apples, 3 oranges] and [$1.50, $2.00]), multiplies matching pairs (2×1.50 + 3×2.00), and adds them up to get 1 final number ($9.00)!',
      checklist: ['Multiplied matching vector elements.', 'Added the results together into a single sum.'],
    },
    quiz: {
      question: 'What is the result of the dot product between Vector A = [2, 3] and Vector B = [4, 5]?',
      options: ['[8, 15]', '23', '40', '14'],
      correctAnswer: 1,
      explanation: 'Dot Product = (2 × 4) + (3 × 5) = 8 + 15 = 23.',
    },
    simulationType: 'matrix-multiply-demo',
    codeLab: {
      title: 'Vector Dot Product Calculator',
      language: 'python',
      starterCode: `# Vector Dot Product: A dot B = sum(A_i * B_i)
vector_inputs = [0.5, 0.8, -0.2]
vector_weights = [2.0, 1.5, 3.0]

dot_product = sum(x * w for x, w in zip(vector_inputs, vector_weights))
bias = 0.5
output = dot_product + bias

print(f"Neuron Calculation Output (w*x + b): {output:.2f}")
`,
      expectedOutput: 'Neuron Calculation Output (w*x + b): 2.10',
      explanation: 'Artificial neurons compute dot products of inputs and weights plus a bias term.',
    },
    summary: ['Matrix multiplication computes multiple dot products simultaneously, executing entire neural network layers in parallel.'],
    glossary: [
      { term: 'Dot Product', definition: 'The sum of the products of corresponding entries of two numerical sequences.' },
      { term: 'Matrix Multiplication', definition: 'An operation producing a new matrix from two matrices by computing row-column dot products.' },
    ],
    nextLessonId: 'ai-35',
  },
  {
    id: 'ai-35',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 35,
    difficulty: 'Beginner',
    title: {
      en: '35. Probability: Representing Uncertainty and Making Predictions',
      bn: '৩৫. প্রবাবিলিটি বা সম্ভাবনা: অনিশ্চয়তা ও সম্ভাবনার পূর্বাভাস',
    },
    subtitle: {
      en: 'Understand probabilities (0.0 to 1.0) and Softmax activation functions.',
      bn: 'সফ্টম্যাক্স (Softmax) ফাংশন দিয়ে সম্ভাবনা শতকরায় রূপান্তর।',
    },
    duration: '15 mins',
    objectives: [
      'Understand probabilities expressed between 0.0 (impossible) and 1.0 (certainty).',
      'Explain how AI models convert raw score outputs (logits) into probabilities using Softmax.',
      'Understand Confidence Scores and why models express uncertainty.',
    ],
    prerequisites: 'Lesson 34',
    explanation: {
      simple: {
        en: 'AI models don’t say "This IS a cat." They calculate probabilities: "There is an 88% probability (0.88) this photo is a cat, an 11% probability it is a dog, and a 1% probability it is a car."',
        bn: 'AI সরাসরি উত্তর দেয় না। এটি সম্ভাবনার হিসাব করে: ৮৮% ক্যাটের ছবি, ১১% ডগের ছবি।',
      },
      analogy: {
        en: 'Softmax is like a pie chart generator. Whatever raw score points competitors get, Softmax converts all of them so the total pie slices equal exactly 100% (1.0)!',
        bn: 'সফ্টম্যাক্স হলো পাই চার্ট বানানোর মতো যা সব প্রাপ্ত নম্বরকে শতকরায় প্রকাশ করে মোট ১০০% মিলিয়ে দেয়।',
      },
      technical: {
        en: 'Softmax formula: P(y_i) = e^(z_i) / ∑ e^(z_j), transforming a vector of real-valued logits z into a normalized probability distribution where ∑ P(y_i) = 1.0.',
        bn: 'সফ্টম্যাক্স সমীকরণ লজিকসকে সম্ভাবনা বিন্যাসে রূপান্তরিত করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'If an AI prediction has 99% probability, it is guaranteed to be factually correct.',
        correction: 'A model can be 99% confident and still be completely wrong if it hallucinated or misclassified a tricky image.',
      },
    ],
    feynmanChallenge: {
      prompt: 'What does the Softmax function do to raw AI output scores?',
      modelAnswer: 'Softmax takes raw, unscaled AI output scores (logits) and converts them into positive percentage probabilities that all add up to 100% (1.0)!',
      checklist: ['Mentioned converting raw scores to probabilities.', 'Noted probabilities sum to 100% / 1.0.'],
    },
    quiz: {
      question: 'What is the sum of all probability outputs generated by a Softmax activation function?',
      options: ['0.0', '0.5', '1.0 (100%)', '100.0'],
      correctAnswer: 2,
      explanation: 'Softmax normalizes outputs so the sum of all probabilities equals exactly 1.0 (100%).',
    },
    simulationType: 'softmax-visualizer-demo',
    codeLab: {
      title: 'Softmax Probability Converter in Python',
      language: 'python',
      starterCode: `import math

logits = [2.0, 1.0, 0.1] # Raw score outputs for [Cat, Dog, Car]

exp_scores = [math.exp(z) for z in logits]
sum_exp = sum(exp_scores)
probabilities = [exp / sum_exp for exp in exp_scores]

print("Raw Logits:", logits)
print(f"Probabilities -> Cat: {probabilities[0]:.2%}, Dog: {probabilities[1]:.2%}, Car: {probabilities[2]:.2%}")
print("Total Sum of Probabilities:", sum(probabilities))
`,
      expectedOutput: 'Raw Logits: [2.0, 1.0, 0.1]\nProbabilities -> Cat: 65.90%, Dog: 24.24%, Car: 9.86%\nTotal Sum of Probabilities: 1.0',
      explanation: 'Softmax maps raw logits to normalized probability distributions.',
    },
    summary: ['AI expresses predictions as probability distributions between 0.0 and 1.0 using functions like Softmax.'],
    glossary: [
      { term: 'Logits', definition: 'The unnormalized raw numerical prediction outputs of a neural network before activation.' },
      { term: 'Softmax', definition: 'A function that turns a vector of numbers into a vector of probabilities summing to 1.' },
    ],
    nextLessonId: 'ai-36',
  },
  {
    id: 'ai-36',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 36,
    difficulty: 'Beginner',
    title: {
      en: '36. Statistics: Patterns, Distributions, Averages, and Variance',
      bn: '৩৬. পরিসংখ্যান: প্যাটার্ন, ডিস্ট্রিবিউশন, গড় ও ভ্যারিয়েন্স',
    },
    subtitle: {
      en: 'Understand Mean, Median, Variance, Standard Deviation, and Normal Distributions.',
      bn: 'মিন, মিডিয়ান, ভ্যারিয়েন্স ও নরমাল ডিস্ট্রিবিউশনের ব্যবহার।',
    },
    duration: '15 mins',
    objectives: [
      'Calculate Mean (Average) and Variance in datasets.',
      'Understand the Normal (Bell Curve) Distribution in data features.',
      'Explain how Outliers and Noise affect AI training dataset health.',
    ],
    prerequisites: 'Lesson 35',
    explanation: {
      simple: {
        en: 'Statistics helps AI understand what "normal" data looks like versus what "unusual" data (outliers) looks like. The Mean gives the center average, while Variance measures how spread out the data points are!',
        bn: 'পরিসংখ্যান দিয়ে AI স্বাভাবিক তথ্য ও অস্বাভাবিক আউটলাইয়ারের পার্থক্য বোঝে। মিন (গড়) ও ভ্যারিয়েন্স দিয়ে ডেটার বিস্তৃতি মাপা হয়।',
      },
      analogy: {
        en: 'Think of 2 dartboards. Target A has all darts clustered close to the bullseye (Low Variance). Target B has darts scattered all over the wall (High Variance). AI models train best on clean, low-variance patterns!',
        bn: 'টার্গেট বোর্ডের এক জায়গায় সব তীর পড়লে ভ্যারিয়েন্স কম, আর দেওয়ালে চারদিকে ছড়িয়ে পড়লে ভ্যারিয়েন্স বেশি।',
      },
      technical: {
        en: 'Gaussian/Normal Distribution: N(μ, σ^2), defined by Mean μ and Variance σ^2. Feature Standardization (Z-score normalization) transforms raw features to zero mean and unit variance: z = (x - μ) / σ.',
        bn: 'ফিচার নরমালাইজেশনের জন্য জেন-স্কোর z = (x - μ) / σ ব্যবহার করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'If a dataset has a high mean, it means all individual data points are high.',
        correction: 'One extreme outlier (e.g. 1 billionaire in a room of 10 people) can drastically inflate the mean average while most values remain low.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what Variance measures in a dataset using a classroom test score example.',
      modelAnswer: 'Variance measures how spread out the scores are. If everyone scored between 82 and 86, variance is low. If half the class got 100 and half got 20, variance is very high!',
      checklist: ['Explained variance as spread of data points.', 'Used classroom test score example.'],
    },
    quiz: {
      question: 'What statistical measure indicates how widely data points are spread out from their average mean?',
      options: ['Mode', 'Variance', 'Integer', 'Binary Bit'],
      correctAnswer: 1,
      explanation: 'Variance measures the dispersion/spread of data values relative to the mean.',
    },
    simulationType: 'normal-distribution-demo',
    codeLab: {
      title: 'Mean, Variance & Z-Score Normalizer',
      language: 'python',
      starterCode: `import math

data = [10, 12, 14, 16, 18, 100] # 100 is an outlier!

mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print(f"Data Mean: {mean:.2f}")
print(f"Data Variance: {variance:.2f}")
print(f"Standard Deviation: {std_dev:.2f}")
`,
      expectedOutput: 'Data Mean: 28.33\nData Variance: 1032.22\nStandard Deviation: 32.13',
      explanation: 'Outliers like 100 inflate the mean and standard deviation, requiring data cleaning.',
    },
    summary: ['Statistics provides the tools (Mean, Variance, Distributions) to analyze and normalize data for AI.'],
    glossary: [
      { term: 'Mean', definition: 'The sum of all values divided by the total count of values (the average).' },
      { term: 'Variance', definition: 'A measurement of the spread between numbers in a data set.' },
    ],
    nextLessonId: 'ai-37',
  },
  {
    id: 'ai-37',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 37,
    difficulty: 'Beginner',
    title: {
      en: '37. Calculus Intuition: Slopes, Derivatives, and How Things Change',
      bn: '৩৭. ক্যালকুলাস ভিজ্যুয়াল ধারণা: স্লোপ, ডেরিভেটিভস ও পরিবর্তনের হার',
    },
    subtitle: {
      en: 'Understand derivatives as the "rate of change" or slope of a hill.',
      bn: 'ডেরিভেটিভস বা পরিবর্তনের হার বোঝার সহজ উপায়।',
    },
    duration: '15 mins',
    objectives: [
      'Understand Calculus as the study of how things change continuously.',
      'Explain Derivatives (dy/dx) as the slope or steepness of a curve at a single point.',
      'Understand how derivatives tell an AI model which direction to adjust weights.',
    ],
    prerequisites: 'Lesson 36',
    explanation: {
      simple: {
        en: 'Calculus sounds intimidating, but its core concept is simple: a Derivative is just measuring the steepness (slope) of a hill! If you step to the right, does your height go UP or DOWN? Calculus tells the AI which way to step to lower its error!',
        bn: 'ক্যালকুলাসের ডেরিভেটিভস হলো পাহাড়ের ঢাল বা পরিবর্তনের হার। ডানের দিকে এক পা বাড়ালে উচ্চতা কমবে না বাড়বে তা ডেরিভেটিভস বলে দেয়।',
      },
      analogy: {
        en: 'Imagine hiking down a foggy mountain in total darkness. You can’t see the bottom. But you can feel the slope under your feet! If the slope tilts downward to the left, you step left. That slope under your feet is a Derivative!',
        bn: 'ঘন কুয়াশায় পাহাড় থেকে নিচে নামার মতো। আপনার পায়ের নিচে মাটির ঢাল কোন দিকে নেমেছে তা অনুভব করে পথ চলাই হলো ডেরিভেটিভস।',
      },
      technical: {
        en: 'The Derivative f\'(x) = lim(h->0) [f(x+h) - f(x)] / h represents the instantaneous rate of change. In neural networks, partial derivatives ∂L/∂w compute the gradient slope of the loss function with respect to weight w.',
        bn: 'ডেরিভেটিভস f\'(x) ইন্সট্যান্টেনিয়াস রেট অফ চেঞ্জ এবং লস ফাংশনের ঢাল পরিমাপ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Calculus in AI requires solving complex integrals by hand.',
        correction: 'AI frameworks (PyTorch/TensorFlow) use Automatic Differentiation (AutoGrad) to compute exact derivatives instantly in the background.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what a Derivative tells an AI model during training using the blindfolded hiker analogy.',
      modelAnswer: 'A derivative is like feeling the slope of the ground under your feet. It tells the AI whether errors are going UP or DOWN if it changes a weight, so it knows which direction to step to reach the bottom of the error hill!',
      checklist: ['Used slope / rate of change concept.', 'Explained using slope direction to lower prediction error.'],
    },
    quiz: {
      question: 'What does a derivative measure on a mathematical curve?',
      options: [
        'The total volume of 3D objects.',
        'The instantaneous rate of change or steepness (slope) at a specific point.',
        'The number of pixels in a digital image.',
        'The power consumption of GPU cooling fans.',
      ],
      correctAnswer: 1,
      explanation: 'A derivative measures the instantaneous rate of change (slope) of a function at a given point.',
    },
    simulationType: 'calculus-slope-demo',
    codeLab: {
      title: 'Numerical Derivative Calculator',
      language: 'python',
      starterCode: `# Numerical Derivative Approximation: f(x) = x^2
def f(x):
    return x ** 2

def derivative(x, h=0.0001):
    return (f(x + h) - f(x)) / h

point = 3.0
slope = derivative(point)
print(f"Slope of f(x) = x^2 at x={point}: {slope:.2f}")
print("Exact calculus derivative (2x) = 6.0")
`,
      expectedOutput: 'Slope of f(x) = x^2 at x=3.0: 6.00\nExact calculus derivative (2x) = 6.0',
      explanation: 'Numerical derivatives approximate the instantaneous slope of a function at any point.',
    },
    summary: ['Derivatives measure the slope of a curve, telling AI models which direction to adjust weights to reduce error.'],
    glossary: [
      { term: 'Derivative', definition: 'A measurement of how a function changes as its input changes (the slope).' },
      { term: 'Autograd', definition: 'Automatic differentiation engines in frameworks like PyTorch that compute gradients automatically.' },
    ],
    nextLessonId: 'ai-38',
  },
  {
    id: 'ai-38',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 38,
    difficulty: 'Beginner',
    title: {
      en: '38. Loss Functions: Measuring How Wrong a Model Is',
      bn: '৩৮. লস ফাংশন: মডেলের ভুল পরিমাপ করার পদ্ধতি',
    },
    subtitle: {
      en: 'Master Mean Squared Error (MSE) and Cross-Entropy Loss.',
      bn: 'মিন স্কয়ার্ড এরর (MSE) ও ক্রস-এন্ট্রপি লসের প্রয়োগ।',
    },
    duration: '15 mins',
    objectives: [
      'Define Loss Function (Cost Function) as a score measuring model prediction error.',
      'Calculate Mean Squared Error (MSE) for regression tasks.',
      'Understand Cross-Entropy Loss for classification tasks.',
    ],
    prerequisites: 'Lesson 37',
    explanation: {
      simple: {
        en: 'A Loss Function is the AI’s report card score! It measures how far off the AI’s guess was from the real answer. A Loss score of 0.0 means a perfect score; a high Loss score means the model was very wrong!',
        bn: 'লস ফাংশন হলো AI-এর রিপোর্ট কার্ড। মডেলের উত্তর আর আসল উত্তরের মধ্যে কতটা পার্থক্য রয়েছে তা লস স্কোর দিয়ে মাপা হয়। লস ০.০ মানে পারফেক্ট।',
      },
      analogy: {
        en: 'Imagine playing darts blindfolded. Someone tells you: "You missed 12 inches to the right!" That distance (12 inches) is your Loss. The bigger the distance, the higher your Loss score!',
        bn: 'অন্ধের মতো ডার্ট বোর্ডে তীর মারার পর মিস হওয়ার দূরত্ব পরিমাপ করাই হলো লস স্কোর।',
      },
      technical: {
        en: 'Mean Squared Error (MSE) for regression: L = (1/N) * ∑ (y_true - y_pred)^2. Cross-Entropy Loss for classification: L = - ∑ y_true * log(y_pred).',
        bn: 'রিগ্রেশনের জন্য MSE এবং ক্লাসিফিকেশনের জন্য Cross-Entropy Loss ব্যবহার করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'The goal of AI training is to increase the Loss Function score as high as possible.',
        correction: 'No! The goal of AI training is to MINIMIZE (lower) the Loss Function score toward 0.0.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why do we square the errors in Mean Squared Error (MSE)?',
      modelAnswer: 'Squaring does two important things: 1) It makes negative errors positive so they don’t cancel out positive errors, and 2) It heavily penalizes large mistakes compared to small mistakes!',
      checklist: ['Explained making negative values positive.', 'Explained penalizing large errors heavily.'],
    },
    quiz: {
      question: 'What is the primary objective of model optimization during AI training?',
      options: [
        'To maximize the Loss Function score.',
        'To minimize (reduce) the Loss Function score toward zero.',
        'To increase the size of the computer screen.',
        'To convert all floating point numbers into integers.',
      ],
      correctAnswer: 1,
      explanation: 'Training optimizes model parameters to minimize the Loss Function value toward zero.',
    },
    simulationType: 'loss-function-demo',
    codeLab: {
      title: 'Mean Squared Error (MSE) Calculator',
      language: 'python',
      starterCode: `# Calculating Mean Squared Error (MSE)
y_true = [100, 200, 300]
y_pred = [110, 190, 315] # Model predictions

errors = [(t - p) ** 2 for t, p in zip(y_true, y_pred)]
mse_loss = sum(errors) / len(errors)

print("Individual Squared Errors:", errors)
print(f"Mean Squared Error (MSE Loss): {mse_loss:.2f}")
`,
      expectedOutput: 'Individual Squared Errors: [100, 100, 225]\nMean Squared Error (MSE Loss): 141.67',
      explanation: 'MSE squares prediction differences and averages them to score overall model error.',
    },
    summary: ['Loss functions quantify model error; training minimizes the loss score toward zero.'],
    glossary: [
      { term: 'Loss Function', definition: 'A mathematical function evaluating how well a model’s predictions match target labels.' },
      { term: 'MSE', definition: 'Mean Squared Error: a common loss metric for continuous regression tasks.' },
    ],
    nextLessonId: 'ai-39',
  },
  {
    id: 'ai-39',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 39,
    difficulty: 'Beginner',
    title: {
      en: '39. Gradient Descent: How a Model Improves Its Parameters',
      bn: '৩৯. গ্রেডিয়েন্ট ডিসেন্ট: মডেল যেভাবে তার প্যারামিটার উন্নত করে',
    },
    subtitle: {
      en: 'Master learning rates, steps, gradients, and loss landscape optimization.',
      bn: 'লার্নিং রেট ও লস ল্যান্ডস্কেপে সেরা পথ খুঁজে নেওয়ার নিয়ম।',
    },
    duration: '15 mins',
    objectives: [
      'Understand Gradient Descent as the optimization algorithm that minimizes loss.',
      'Explain Learning Rate (alpha) and the risk of learning rates being too high or too low.',
      'Understand Stochastic Gradient Descent (SGD) and Mini-batch optimization.',
    ],
    prerequisites: 'Lesson 38',
    explanation: {
      simple: {
        en: 'Gradient Descent is the engine of AI training. Imagine walking down a bowl-shaped mountain in the dark. At each step, you feel the slope (gradient) and take a small step downward (descent) until you reach the lowest valley (minimum loss)!',
        bn: 'গ্রেডিয়েন্ট ডিসেন্ট হলো ঢাল নেমে সবচেয়ে নিচু উপত্যকায় (সর্বনিম্ন লস) পৌঁছানোর পদ্ধতি।',
      },
      analogy: {
        en: 'Learning Rate is your stride length while walking down the foggy mountain. If your stride is too small, you take 100 years to reach the bottom. If your stride is too big, you accidentally jump across the valley and land on the opposite mountain peak!',
        bn: 'লার্নিং রেট হলো পায়ের ধাপের দৈর্ঘ্য। খুব ছোট হলে পৌঁছাতে বছর লাগবে, অতিরিক্ত বড় হলে উপত্যকা ডিঙিয়ে উল্টো পাহাড়ে গিয়ে পড়বেন।',
      },
      technical: {
        en: 'Weight Update Rule: W_new = W_old - (α × ∂L/∂W), where α is the Learning Rate hyperparameter and ∂L/∂W is the gradient vector. Stochastic Gradient Descent (SGD) computes gradients over mini-batches.',
        bn: 'ওয়েট আপডেট সমীকরণ: W_new = W_old - (α × ∂L/∂W)।',
      },
    },
    misconceptions: [
      {
        misconception: 'Setting a huge learning rate (e.g. α = 100.0) is always best because it trains faster.',
        correction: 'A learning rate that is too high causes the model to overshoot the minimum, causing loss to diverge to infinity!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what happens if an AI model’s Learning Rate is set too high vs too low.',
      modelAnswer: 'If the learning rate is too low, the model takes tiny baby steps and takes forever to train. If it is too high, the model takes giant leaps, overshoots the target minimum, and gets wilder, higher errors!',
      checklist: ['Explained too low = overly slow training.', 'Explained too high = overshooting and divergence.'],
    },
    quiz: {
      question: 'In the Gradient Descent weight update formula (W_new = W_old - α * Gradient), what does α represent?',
      options: ['The GPU Fan Speed', 'The Learning Rate hyperparameter', 'The Hard Drive Capacity', 'The Screen Resolution'],
      correctAnswer: 1,
      explanation: 'Alpha (α) represents the Learning Rate hyperparameter controlling step size during gradient descent.',
    },
    simulationType: 'gradient-descent-demo',
    codeLab: {
      title: 'Gradient Descent Loop Simulation',
      language: 'python',
      starterCode: `# 1D Gradient Descent Optimization on f(w) = w^2
w = 10.0 # Initial bad weight
learning_rate = 0.2

print(f"Initial Weight: {w:.2f}, Loss: {w**2:.2f}")

for step in range(6):
    gradient = 2 * w # Derivative of w^2 is 2w
    w = w - (learning_rate * gradient)
    loss = w ** 2
    print(f"Step {step+1}: Weight = {w:.4f}, Loss = {loss:.4f}")
`,
      expectedOutput: 'Initial Weight: 10.00, Loss: 100.00\nStep 1: Weight = 6.0000, Loss = 36.0000\nStep 2: Weight = 3.6000, Loss = 12.9600\nStep 3: Weight = 2.1600, Loss = 4.6656\nStep 4: Weight = 1.2960, Loss = 1.6796\nStep 5: Weight = 0.7776, Loss = 0.6047\nStep 6: Weight = 0.4666, Loss = 0.2177',
      explanation: 'Gradient descent iteratively updates the weight down the slope to minimize loss toward zero.',
    },
    summary: ['Gradient descent adjusts parameters in the opposite direction of the gradient slope to minimize loss.'],
    glossary: [
      { term: 'Gradient Descent', definition: 'An optimization algorithm that iteratively updates model parameters to minimize a loss function.' },
      { term: 'Learning Rate', definition: 'A tuning hyperparameter that determines the step size at each iteration while moving toward a minimum.' },
    ],
    nextLessonId: 'ai-40',
  },
  {
    id: 'ai-40',
    track: 'ai',
    chapter: 4,
    chapterTitle: 'Chapter 4: The Mathematics Behind AI, Without Fear',
    order: 40,
    difficulty: 'Beginner',
    title: {
      en: '40. Chapter 4 Project: Train a Simple Predictive Model by Adjusting Parameters',
      bn: '৪০. ৪র্থ অধ্যায়ের প্রজেক্ট: ম্যাথমেটিক্যাল প্যারামিটার টিউন করে প্রথম প্রেডিক্টিভ মডেল তৈরি',
    },
    subtitle: {
      en: 'Synthesize vectors, loss functions, derivatives, and gradient descent in a working model.',
      bn: 'ভেক্টর, লস ফাংশন ও গ্রেডিয়েন্ট ডিসেন্ট মিলিয়ে একটি কাজ করার মডেল তৈরি করে ৪র্থ অধ্যায় শেষ করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Build a complete end-to-end Linear Regression trainer from scratch in Python.',
      'Track loss reduction across 20 training epochs.',
      'Complete Chapter 4 milestone assessment and earn your Chapter 4 Badge!',
    ],
    prerequisites: 'Lessons 31 to 39 of Chapter 4',
    explanation: {
      simple: {
        en: 'Congratulations! You have mastered the core mathematics of AI without fear! In this milestone project, you will combine Vectors, Loss Functions, Derivatives, and Gradient Descent into a working predictive training loop.',
        bn: '৪র্থ অধ্যায়ের প্রজেক্টে স্বাগতম! আপনি ভয় ছাড়া AI-এর সমস্ত মূল গণিত শিখে ফেলেছেন। এখন কোডে মডেল ট্রেইন করে ব্যাজ অর্জন করুন।',
      },
      analogy: {
        en: 'Putting these math tools together is like building your first bicycle: Vectors are the wheels, Loss Function is the speedometer, Derivative is the steering handlebar, and Gradient Descent is the pedals pushing forward!',
        bn: 'ভেক্টর চাকা, লস স্পিডোমিটার, ডেরিভেটিভস হ্যান্ডেলবার এবং গ্রেডিয়েন্ট ডিসেন্ট হলো প্যাডেল।',
      },
      technical: {
        en: 'Training Loop Mechanics: 1) Forward Pass: y_hat = w*x + b, 2) Loss Computation: MSE = mean((y_hat - y)^2), 3) Backward Pass: dw = mean(2*x*(y_hat - y)), db = mean(2*(y_hat - y)), 4) Parameter Update: w -= α*dw, b -= α*db.',
        bn: 'ট্রেনিং লুপ: ফরওয়ার্ড পাস -> লস কম্পিউটার -> ব্যাকওয়ার্ড পাস -> প্যারামিটার আপডেট।',
      },
    },
    misconceptions: [
      {
        misconception: 'Machine learning training code requires thousands of lines of complex math libraries.',
        correction: 'Core linear gradient descent training can be implemented in less than 20 lines of basic Python math code!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Describe the 4 repeating steps of an AI training loop.',
      modelAnswer: '1. Predict: Calculate outputs using current weights (Forward Pass).\n2. Score: Measure error using a Loss Function.\n3. Calculate Slope: Find gradients using derivatives (Backward Pass).\n4. Update: Adjust weights using Gradient Descent and repeat!',
      checklist: ['1. Predict / Forward', '2. Score / Loss', '3. Gradients / Backward', '4. Update & Repeat'],
    },
    quiz: {
      question: 'In a standard neural network training loop, what happens immediately AFTER calculating the Loss Function score?',
      options: [
        'The computer reboots.',
        'Gradients are calculated (Backward Pass) to determine how to update weights.',
        'All data is deleted from storage.',
        'The user receives a email receipt.',
      ],
      correctAnswer: 1,
      explanation: 'After computing loss, the backward pass calculates gradients for parameter updating.',
    },
    simulationType: 'chapter4-capstone-demo',
    codeLab: {
      title: 'Complete Linear Regression Trainer From Scratch',
      language: 'python',
      starterCode: `# Complete Linear Trainer from Scratch
x_data = [1.0, 2.0, 3.0, 4.0]
y_data = [3.0, 5.0, 7.0, 9.0] # True relation: y = 2x + 1

w = 0.0 # Start with wrong weight
b = 0.0 # Start with wrong bias
alpha = 0.05 # Learning rate

for epoch in range(15):
    # 1. Forward Pass
    preds = [w * x + b for x in x_data]
    
    # 2. Loss (MSE)
    loss = sum((p - y) ** 2 for p, y in zip(preds, y_data)) / len(x_data)
    
    # 3. Gradients
    dw = sum(2 * x * (p - y) for x, p, y in zip(x_data, preds, y_data)) / len(x_data)
    db = sum(2 * (p - y) for p, y in zip(preds, y_data)) / len(x_data)
    
    # 4. Update
    w -= alpha * dw
    b -= alpha * db
    
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}: Loss = {loss:.4f}, w = {w:.2f}, b = {b:.2f}")

print(f"Final Model: y = {w:.2f}x + {b:.2f} (Target was 2.0x + 1.0)")
`,
      expectedOutput: 'Epoch 5: Loss = 0.4074, w = 1.94, b = 0.74\nEpoch 10: Loss = 0.0637, w = 2.04, b = 0.86\nEpoch 15: Loss = 0.0152, w = 2.03, b = 0.93\nFinal Model: y = 2.03x + 0.93 (Target was 2.0x + 1.0)',
      explanation: 'Congratulations! You have completed Chapter 4 of the AI Academy!',
    },
    summary: [
      'Chapter 4 Complete! You learned Vectors, Matrices, Tensors, Functions, and Softmax.',
      'You understand Statistics (Mean, Variance) and Calculus (Derivatives, Slopes).',
      'You mastered Loss Functions (MSE) and Gradient Descent parameter tuning.',
      'You built a complete training loop from scratch!',
    ],
    glossary: [{ term: 'Epoch', definition: 'One complete pass of the entire training dataset through the machine learning model.' }],
    nextLessonId: 'ai-41',
  },
];
