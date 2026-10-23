// Chapter 6: Modern AI Models and Large Language Models (Lessons 51-60)

export const CHAPTER_6_LESSONS = [
  {
    id: 'ai-51',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 51,
    difficulty: 'Beginner',
    title: {
      en: '51. What Is a Model? Parameters, Weights, Checkpoints, and Model Size',
      bn: '৫১. মডেল কী? প্যারামিটার, ওয়েটস, চেকপয়েন্ট ও মডেল সাইজ',
    },
    subtitle: {
      en: 'Understand how a trained model is stored as a binary checkpoint file.',
      bn: 'ট্রেইন করা মডেলের চেকপয়েন্ট ফাইল ও মেমরি সাইজের পরিচিতি।',
    },
    duration: '15 mins',
    objectives: [
      'Define a Model as a static file containing learned numerical weights and architecture configuration.',
      'Understand Parameter count (7B, 70B, 405B) and model checkpoint files (.bin, .safetensors, .pth).',
      'Explain the difference between a Model, an API, and a Chat Interface.',
    ],
    prerequisites: 'Chapter 5 Complete',
    explanation: {
      simple: {
        en: 'A "Model" is not a physical robot or a living brain. It is simply a frozen digital file on a hard drive containing billions of trained numbers (weights)! When you prompt an AI, the server loads these numbers into GPU memory to calculate the answer.',
        bn: 'মডেল কোনো রোবট নয়। এটি হার্ডড্রাইভে থাকা একটি ডিজিটাল ফাইল যাতে ট্রেইন করা কোটি কোটি সংখ্যা (ওয়েটস) সংরক্ষিত থাকে।',
      },
      analogy: {
        en: 'A Model file is like a saved game file (.sav) on your PlayStation. It records your exact level, skills, and progress so you can load it up instantly and play!',
        bn: 'মডেল ফাইল হলো গেমের সেভ ফাইলের মতো, যা লোড করে যেকোনো সময় খেলা শুরু করা যায়।',
      },
      technical: {
        en: 'Model Checkpoints (Safetensors / PyTorch .pt) store tensors: Weight Matrices W^(l) and Bias Vectors b^(l) along with hyperparameter configs (JSON). The architecture defines computational graph execution; the checkpoint supplies trained parameter values.',
        bn: 'চেকপয়েন্ট ফাইল স্লেফটেনসর/PyTorch বিন্যাসে টেনসর ও ওয়েট ব্যাকআপ রাখে।',
      },
    },
    misconceptions: [
      {
        misconception: 'When you chat with ChatGPT, the AI searches its hard drive to read Wikipedia articles live.',
        correction: 'Parametric Memory: The model generates text from knowledge compressed into its numerical weights, not by live web searches (unless a search tool is explicitly invoked).',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what an AI "Model File" actually contains.',
      modelAnswer: 'An AI model file is a static binary file containing billions of trained numbers (weights and biases) arranged in layers, along with a configuration recipe telling the computer how to load those numbers into memory!',
      checklist: ['Described static binary file.', 'Mentioned trained weights and layer configuration.'],
    },
    quiz: {
      question: 'What is stored inside a model checkpoint file (e.g. model.safetensors)?',
      options: [
        'A collection of video files and audio recordings',
        'Trained numerical weight matrices and bias vectors',
        'Raw uncleaned web pages downloaded from the internet',
        'The source code of the operating system',
      ],
      correctAnswer: 1,
      explanation: 'Model checkpoints store the trained numerical parameter weight matrices and biases.',
    },
    simulationType: 'model-size-demo',
    codeLab: {
      title: 'Model Parameter Size to Disk Estimator',
      language: 'python',
      starterCode: `# Estimating Model Checkpoint File Size on Disk
def checkpoint_size_gb(params_billions, precision_bytes=2):
    raw_size_gb = params_billions * precision_bytes
    return raw_size_gb

print("Llama-3-8B Checkpoint Size:", checkpoint_size_gb(8, 2), "GB (.safetensors)")
print("Llama-3-70B Checkpoint Size:", checkpoint_size_gb(70, 2), "GB (.safetensors)")
`,
      expectedOutput: 'Llama-3-8B Checkpoint Size: 16 GB (.safetensors)\nLlama-3-70B Checkpoint Size: 140 GB (.safetensors)',
      explanation: 'A 70B parameter model in 16-bit precision creates a ~140 GB checkpoint file.',
    },
    summary: ['An AI model is a file of trained parameter weights loaded into memory to execute predictions.'],
    glossary: [
      { term: 'Safetensors', definition: 'A safe, fast file format for storing and loading numerical tensors safely.' },
      { term: 'Parametric Memory', definition: 'Knowledge encoded directly into the parameter weights of a neural network.' },
    ],
    nextLessonId: 'ai-52',
  },
  {
    id: 'ai-52',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 52,
    difficulty: 'Beginner',
    title: {
      en: '52. Language Models: Predicting the Next Token',
      bn: '৫২. ল্যাঙ্গুয়েজ মডেল: পরের টোকেন বা শব্দ অনুমানের মেকানিজম',
    },
    subtitle: {
      en: 'Understand autoregressive generation: P(Next Token | Previous Tokens).',
      bn: 'অটোরিগ্রেসিভ টেক্সট জেনারেশন ও পরের টোকেনের সম্ভাবনা।',
    },
    duration: '15 mins',
    objectives: [
      'Understand Autoregressive Generation as predicting 1 token at a time.',
      'Explain how LLMs process input prompts and generate output word-by-word.',
      'Understand Temperature and Top-P sampling parameters.',
    ],
    prerequisites: 'Lesson 51',
    explanation: {
      simple: {
        en: 'At its core, a Large Language Model (LLM) is an ultra-smart Next-Token Predictor! Given a prompt like "The capital of France is...", the model calculates probabilities for every possible next word and selects "Paris"!',
        bn: 'ল্যাঙ্গুয়েজ মডেলের মূল কাজ হলো একটি বাক্যের পরের সম্ভাব্য শব্দ বা টোকেন অনুমান করা।',
      },
      analogy: {
        en: 'It’s like the super-advanced autocomplete keyboard on your phone. When you type "See you...", your keyboard suggests "later" or "tomorrow". An LLM does this across millions of words with deep contextual understanding!',
        bn: 'মোবাইলের কিবোর্ডের অটো-কমপ্লিট সাজেশনের মতো, যা পরের সম্ভাব্য শব্দ অনুমান করে।',
      },
      technical: {
        en: 'Autoregressive Probability: P(w_1, w_2, ..., w_N) = ∏ P(w_i | w_1, ..., w_{i-1}). Temperature T controls output probability entropy: P_i = exp(z_i / T) / ∑ exp(z_j / T).',
        bn: 'অটোরিগ্রেসিভ ল্যাঙ্গুয়েজ মডেল পূর্বের সব শব্দ বিবেচনা করে পরের শব্দের সম্ভাবনা নির্ণয় করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'LLMs plan out an entire 500-word essay instantly before writing a single word.',
        correction: 'No! Autoregressive models generate text 1 token at a time, feeding each newly generated token back into the input context for the next token prediction.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what happens step-by-step when an LLM receives the prompt "Once upon a...".',
      modelAnswer: '1. Model reads "Once upon a...".\n2. Calculates next token probabilities and picks "time".\n3. Adds "time" to prompt: "Once upon a time...".\n4. Repeats the process to pick the next word, one token at a time!',
      checklist: ['Explained 1-token-at-a-time generation.', 'Mentioned feeding generated tokens back into input.'],
    },
    quiz: {
      question: 'What parameter controls the randomness/creativity of token selection during LLM text generation?',
      options: ['CPU Fan Speed', 'Temperature', 'PCIe Bus Width', 'Hard Drive Partition'],
      correctAnswer: 1,
      explanation: 'Temperature controls the randomness/entropy of the probability distribution during sampling.',
    },
    simulationType: 'next-token-prediction-demo',
    codeLab: {
      title: 'Autoregressive Loop Simulator',
      language: 'python',
      starterCode: `# Autoregressive Token Generation Simulation
prompt = ["The", "sky", "is"]
vocab_probabilities = {"blue": 0.85, "clear": 0.10, "green": 0.05}

# Pick highest probability token (Greedy Sampling)
next_token = max(vocab_probabilities, key=vocab_probabilities.get)
prompt.append(next_token)

print("Generated Sequence:", " ".join(prompt))
`,
      expectedOutput: 'Generated Sequence: The sky is blue',
      explanation: 'Autoregressive models append predicted tokens to the prompt and repeat generation.',
    },
    summary: ['LLMs generate text autoregressively by predicting the most likely next token one step at a time.'],
    glossary: [
      { term: 'Autoregressive', definition: 'A process where a model predicts future values based on its own past outputs.' },
      { term: 'Temperature', definition: 'A sampling hyperparameter that adjusts randomness in next-token prediction probabilities.' },
    ],
    nextLessonId: 'ai-53',
  },
  {
    id: 'ai-53',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 53,
    difficulty: 'Beginner',
    title: {
      en: '53. Tokenization: How Text Becomes Tokens and Numbers',
      bn: '৫৩. টোকেনাইজেশন: লেখা কীভাবে টোকেন ও সংখ্যায় পরিণত হয়',
    },
    subtitle: {
      en: 'Understand Byte-Pair Encoding (BPE), subwords, and vocabulary size.',
      bn: 'বাইট-পেয়ার এনকোডিং (BPE) ও সাব-ওয়ার্ড টোকেনাইজেশনের মেকানিজম।',
    },
    duration: '15 mins',
    objectives: [
      'Define Tokenization as breaking text into subword units.',
      'Explain Byte-Pair Encoding (BPE) algorithm.',
      'Understand Vocabulary Size (e.g. 32,000 to 128,000 tokens) and token efficiency.',
    ],
    prerequisites: 'Lesson 52',
    explanation: {
      simple: {
        en: 'Computers don’t read full words or individual letters. They use "Tokens"—common character chunks like "ing", "un", or "apple". On average, 1 token equals about 4 characters or 0.75 words in English!',
        bn: 'কম্পিউটার শব্দ বা অক্ষর দিয়ে পড়ে না, পড়ে টোকেন দিয়ে। ১টি টোকেন গড়ে ৪টি অক্ষরের সমান।',
      },
      analogy: {
        en: 'Think of Lego bricks. Instead of manufacturing a whole pre-made house (full words) or molding individual plastic atoms (single letters), Lego gives you standard block bricks (subword tokens) that can construct any building!',
        bn: 'লেগো ব্লকের মতো যা দিয়ে বিভিন্ন বাড়ি বানানো সম্ভব। সাব-ওয়ার্ড টোকেন হলো স্ট্যান্ডার্ড লেগো ব্লক।',
      },
      technical: {
        en: 'Byte-Pair Encoding (BPE) iteratively merges the most frequent adjacent character pairs in a corpus into subword tokens until reaching vocabulary size V (e.g. Tiktoken, SentencePiece).',
        bn: 'BPE অ্যালগরিদম বারবার ব্যবহৃত চরিত্র জোড়া একত্র করে সাব-ওয়ার্ড টোকেন তৈরি করে।',
      },
    },
    misconceptions: [
      {
        misconception: '1 Token is always exactly equal to 1 Word.',
        correction: 'No! Common words like "the" are 1 token. Complex words like "unbelievable" break into 3 tokens: ["un", "believ", "able"].',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why do LLMs use subword tokens (like BPE) instead of whole words or single letters?',
      modelAnswer: 'Using whole words would require a huge dictionary of millions of words and fail on new words. Using single letters is too slow. Subword tokens provide the perfect balance—handling any word efficiently with a vocabulary of ~100,000 tokens!',
      checklist: ['Noted drawbacks of whole words and single letters.', 'Explained subword efficiency.'],
    },
    quiz: {
      question: 'Approximately how many words in English equal 100 Tokens?',
      options: ['10 words', '75 words', '300 words', '1,000 words'],
      correctAnswer: 1,
      explanation: 'As a rule of thumb, 100 Tokens equals approximately 75 English words.',
    },
    simulationType: 'tokenizer-inspector-demo',
    codeLab: {
      title: 'Simple BPE Subword Splitter Simulation',
      language: 'python',
      starterCode: `# BPE Subword Tokenization Concept
vocab = ["un", "believ", "able", "ing", "play"]

def tokenize(word):
    tokens = []
    for sub in vocab:
        if sub in word:
            tokens.append(sub)
    return tokens

text = "unbelievable"
print(f"Word '{text}' Tokenized into Subwords:", tokenize(text))
`,
      expectedOutput: "Word 'unbelievable' Tokenized into Subwords: ['un', 'believ', 'able']",
      explanation: 'Subword tokenizers decompose complex words into reusable token components.',
    },
    summary: ['Tokenization breaks text into subword tokens (BPE) mapping characters to numerical token IDs.'],
    glossary: [
      { term: 'Byte-Pair Encoding (BPE)', definition: 'A data compression algorithm adapted to create subword token vocabularies for LLMs.' },
      { term: 'Vocabulary Size', definition: 'The total number of unique tokens an LLM tokenizer recognizes.' },
    ],
    nextLessonId: 'ai-54',
  },
  {
    id: 'ai-54',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 54,
    difficulty: 'Beginner',
    title: {
      en: '54. Embeddings: Representing Meaning and Relationships Numerically',
      bn: '৫৪. এমবেডিংস: শব্দ ও ধারণার সম্পর্ক সংখ্যায় রূপান্তর',
    },
    subtitle: {
      en: 'Master Word2Vec concepts: Vector closeness, Cosine Similarity, and king - man + woman = queen.',
      bn: 'ভেক্টর দূরত্ব, কোসাইন সিমিলারিটি ও রাজা - পুরুষ + নারী = রানী সমীকরণ।',
    },
    duration: '15 mins',
    objectives: [
      'Define Embeddings as dense numerical vectors encoding semantic meaning.',
      'Understand Vector Distance and Cosine Similarity.',
      'Explain famous vector arithmetic: Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen").',
    ],
    prerequisites: 'Lesson 53',
    explanation: {
      simple: {
        en: 'An Embedding turns a token ID into a list of numbers (a vector) that captures its MEANING. Words with similar meanings (like "king" and "queen", or "happy" and "joyful") are placed close together in vector space!',
        bn: 'এমবেডিং একটি টোকেন আইডিকে এমন একগুচ্ছ সংখ্যায় (ভেক্টর) রূপান্তর করে যা তার আসল অর্থ নির্দেশ করে। একই জাতীয় শব্দ পাশাপাশি অবস্থান করে।',
      },
      analogy: {
        en: 'Imagine a 3D map of grocery items. Fruits are in the produce aisle, milks are in the dairy aisle. If you search near "Apple", you find "Pear" and "Banana" right next to it!',
        bn: 'সুপারশপের ফ্রুটস কর্নারের মতো যেখানে আপেলের পাশেই নাশপাতি ও কলা খুঁজে পাওয়া যায়।',
      },
      technical: {
        en: 'Embeddings map discrete token IDs to dense vectors e_i ∈ ℝ^d (e.g. d=4096). Cosine Similarity measures vector angle: cos(θ) = (A · B) / (||A|| ||B||). Semantic relationships correspond to directional vector offsets.',
        bn: 'কোসাইন সিমিলারিটি দুটি ভেক্টরের অন্তর্বর্তী কোণের মাধ্যমে মিল পরিমাপ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Embeddings are created manually by linguists typing in numbers for every word.',
        correction: 'Embeddings are learned automatically during neural network pretraining based on context co-occurrence patterns!',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what Cosine Similarity measures between two word embedding vectors.',
      modelAnswer: 'Cosine Similarity measures the angle between two word vectors in space. If two words have very similar meanings (like "cat" and "kitten"), their vectors point in nearly the exact same direction, giving a similarity score close to 1.0!',
      checklist: ['Mentioned vector angle in space.', 'Connected similarity score to 1.0 for close meanings.'],
    },
    quiz: {
      question: 'In embedding space, what famous vector arithmetic equation demonstrated semantic relationship offsets?',
      options: [
        'Vector("Apple") + Vector("Orange") = Vector("Juice")',
        'Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen")',
        'Vector("CPU") + Vector("GPU") = Vector("NPU")',
        'Vector("Python") * 2 = Vector("C++")',
      ],
      correctAnswer: 1,
      explanation: 'Mikolov et al. (Word2Vec) demonstrated that directional vector subtractions preserve semantic relationships.',
    },
    simulationType: 'vector-embedding-demo',
    codeLab: {
      title: 'Cosine Similarity Calculator',
      language: 'python',
      starterCode: `import math

# Simulated 3D Embeddings for [Royalty, Female, Technology]
v_king  = [0.9, 0.1, 0.0]
v_queen = [0.9, 0.9, 0.0]
v_apple = [0.0, 0.0, 0.95]

def cosine_sim(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x ** 2 for x in a))
    norm_b = math.sqrt(sum(y ** 2 for y in b))
    return dot / (norm_a * norm_b)

print(f"Similarity (King, Queen): {cosine_sim(v_king, v_queen):.4f}")
print(f"Similarity (King, Apple): {cosine_sim(v_king, v_apple):.4f}")
`,
      expectedOutput: 'Similarity (King, Queen): 0.7148\nSimilarity (King, Apple): 0.0000',
      explanation: 'Higher cosine similarity values indicate semantic closeness in embedding space.',
    },
    summary: ['Embeddings map tokens into high-dimensional vector space where distance and angle measure semantic relationships.'],
    glossary: [
      { term: 'Embedding', definition: 'A learned dense vector representation of data where semantically similar items are close in vector space.' },
      { term: 'Cosine Similarity', definition: 'A metric measuring the cosine of the angle between two multi-dimensional vectors.' },
    ],
    nextLessonId: 'ai-55',
  },
  {
    id: 'ai-55',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 55,
    difficulty: 'Beginner',
    title: {
      en: '55. Attention: How Models Relate Different Parts of an Input',
      bn: '৫৫. এটেনশন (Attention): মডেল যেভাবে শব্দগুলোর পারস্পরিক সম্পর্ক বোঝে',
    },
    subtitle: {
      en: 'Master Query (Q), Key (K), and Value (V) matrices intuitively.',
      bn: 'কুয়েরি (Q), কি (K) ও ভ্যালু (V) দিয়ে শব্দ সংযোগের চমৎকার মেকানিজম।',
    },
    duration: '15 mins',
    objectives: [
      'Understand why pronouns ("it", "they") require context-aware attention.',
      'Explain the Query (Q), Key (K), and Value (V) database lookup analogy.',
      'Calculate self-attention weights connecting related words in a sentence.',
    ],
    prerequisites: 'Lesson 54',
    explanation: {
      simple: {
        en: 'Consider the sentence: "The animal didn’t cross the street because IT was too tired." What does "it" refer to—the animal or the street? Attention is the mechanism that allows the model to connect "it" back to "animal"!',
        bn: 'বাক্যে "it" বলতে কাকে বোঝানো হয়েছে? এটেনশন মেকানিজম দিয়ে AI "it" শব্দটিকে "animal" এর সাথে যুক্ত করতে সক্ষম হয়।',
      },
      analogy: {
        en: 'Attention works like a YouTube search: 1) Query (Q) = What you type in the search bar ("funny cat video"), 2) Key (K) = Titles of videos on YouTube, 3) Value (V) = The actual video content played when keys match your query!',
        bn: 'ইউটিউব সার্চের মতো: Query (সার্চ বার), Key (ভিডিও টাইটেল) ও Value (আসল ভিডিও)।',
      },
      technical: {
        en: 'Self-Attention computes compatibility between Query Q = XW_Q and Key K = XW_K: Similarity = Q · K^T / sqrt(d_k). Softmax converts scores into attention weights multiplied by Value V = XW_V.',
        bn: 'এটেনশন সমীকরণ: Attention(Q, K, V) = softmax((QK^T)/sqrt(d_k)) * V।',
      },
    },
    misconceptions: [
      {
        misconception: 'Attention looks at every word in a sentence with equal, uniform importance.',
        correction: 'Self-attention dynamically assigns higher weight percentages to relevant words while ignoring irrelevant words.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the Query, Key, Value (Q, K, V) analogy of Attention.',
      modelAnswer: 'Query is the question a word is asking ("What does \'it\' refer to?"). Keys are the labels on other words in the sentence. Value is the meaning content passed along when Query matches a Key!',
      checklist: ['Defined Query as the search question.', 'Defined Key as the label to match.', 'Defined Value as the payload content.'],
    },
    quiz: {
      question: 'In the sentence "The bank of the river was muddy", which word should the word "bank" pay the highest attention weight to for context?',
      options: ['the', 'was', 'river', 'muddy'],
      correctAnswer: 2,
      explanation: 'The word "river" clarifies that "bank" refers to a riverbank rather than a financial institution.',
    },
    simulationType: 'attention-heatmap-demo',
    codeLab: {
      title: 'Self-Attention Weight Score Simulation',
      language: 'python',
      starterCode: `# Self-Attention Relevance Weight Simulation
words = ["The", "animal", "was", "tired"]
query_word = "tired"

# Scores representing semantic compatibility with "tired"
attention_scores = {"The": 0.05, "animal": 0.80, "was": 0.10, "tired": 0.05}

print(f"Word '{query_word}' pays highest attention to:")
for word, score in attention_scores.items():
    print(f"  -> '{word}': {score:.0%}")
`,
      expectedOutput: "Word 'tired' pays highest attention to:\n  -> 'The': 5%\n  -> 'animal': 80%\n  -> 'was': 10%\n  -> 'tired': 5%",
      explanation: 'Attention weights determine how much context information is gathered from surrounding words.',
    },
    summary: ['Self-Attention dynamically computes relationships between words using Query, Key, and Value matrices.'],
    glossary: [
      { term: 'Query (Q)', definition: 'The vector representing what a token is searching for in the sequence.' },
      { term: 'Key (K)', definition: 'The vector representing the index or label of each token in the sequence.' },
      { term: 'Value (V)', definition: 'The vector representing the actual content features passed forward once matched.' },
    ],
    nextLessonId: 'ai-56',
  },
  {
    id: 'ai-56',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 56,
    difficulty: 'Beginner',
    title: {
      en: '56. Transformers: The Architecture Behind Modern Language Models',
      bn: '৫৬. ট্রান্সফরমার আর্কিটেকচার: আধুনিক ল্যাঙ্গুয়েজ মডেলের মূল ভিত্তি',
    },
    subtitle: {
      en: 'Understand Encoders, Decoders, Multi-Head Attention, and Residual Connections.',
      bn: 'এনকোডার, ডিকোডার, মাল্টি-হেড এটেনশন ও রেসিডুয়াল কানেকশনের গঠন।',
    },
    duration: '15 mins',
    objectives: [
      'Understand the full Transformer architecture (Encoder-Decoder vs Decoder-Only).',
      'Explain Multi-Head Attention (running multiple attention mechanisms in parallel).',
      'Understand Feed-Forward Networks, Layer Normalization, and Residual Connections.',
    ],
    prerequisites: 'Lesson 55',
    explanation: {
      simple: {
        en: 'A Transformer is built by stacking blocks of 2 main ingredients: 1) Multi-Head Attention (focusing on different word relationships), and 2) Feed-Forward Neural Networks (processing the gathered information). Decoder-only transformers (like GPT-4) repeat this block dozens of times!',
        bn: 'ট্রান্সফরমার আর্কিটেকচার তৈরি হয় মাল্টি-হেড এটেনশন এবং ফিড-ফরওয়ার্ড নিউরাল নেটওয়ার্কের লেয়ার স্ট্যাক করে।',
      },
      analogy: {
        en: 'Multi-Head Attention is like having 8 different experts analyze a document at once: Expert 1 checks grammar relationships, Expert 2 checks pronoun references, Expert 3 checks subject-verb agreement! Then they combine their findings.',
        bn: '৮ জন বিশেষজ্ঞ দিয়ে একই সাথে লেখার আলাদা আলাদা গ্রামার ও ব্যাকরণগত সম্পর্ক বিশ্লেষণ করার মতো।',
      },
      technical: {
        en: 'Transformer Block: x_1 = LayerNorm(x + MultiHeadAttention(x)), x_2 = LayerNorm(x_1 + FFN(x_1)). Residual Connections (x + Sublayer(x)) allow gradients to flow directly during backprop without vanishing.',
        bn: 'রেসিডুয়াল কানেকশন গ্র্যাডিয়েন্ট সহজে প্রবাহিত হতে সাহায্য করে ভ্যানিশিং গ্র্যাডিয়েন্ট সমস্যা রোধ করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'GPT, BERT, and T5 all use the exact same decoder-only architecture.',
        correction: 'BERT is Encoder-Only (understanding/embeddings), GPT is Decoder-Only (autoregressive generation), and T5 is Encoder-Decoder (translation).',
      },
    ],
    feynmanChallenge: {
      prompt: 'What is "Multi-Head Attention" and why is having multiple "heads" helpful?',
      modelAnswer: 'Multi-Head Attention runs several attention mechanisms in parallel. Having multiple heads allows the model to pay attention to different relationships simultaneously—for example, one head tracks who did the action while another head tracks when it happened!',
      checklist: ['Explained parallel attention heads.', 'Noted tracking different semantic relationships simultaneously.'],
    },
    quiz: {
      question: 'Which Transformer architecture variant powers autoregressive Large Language Models like GPT-4 and Llama-3?',
      options: ['Encoder-Only Architecture', 'Decoder-Only Architecture', 'CNN-Only Architecture', 'RNN Sequential Loop'],
      correctAnswer: 1,
      explanation: 'Decoder-Only Transformer architectures power autoregressive text generation models like GPT-4 and Llama-3.',
    },
    simulationType: 'transformer-block-demo',
    codeLab: {
      title: 'Residual Connection Simulation',
      language: 'python',
      starterCode: `# Residual Connection (Skip Connection) Simulation
def sublayer_ffn(x):
    return [val * 0.1 for val in x] # Transformations

x_input = [1.0, 2.0, 3.0]
# Residual Addition: x + Sublayer(x)
x_output = [orig + trans for orig, trans in zip(x_input, sublayer_ffn(x_input))]

print("Input Features:", x_input)
print("Residual Output Features:", x_output)
`,
      expectedOutput: 'Input Features: [1.0, 2.0, 3.0]\nResidual Output Features: [1.1, 2.2, 3.3]',
      explanation: 'Residual connections add original inputs directly to sublayer outputs to preserve signal flow.',
    },
    summary: ['Transformers stack Multi-Head Attention, Feed-Forward Networks, and Residual Connections into deep blocks.'],
    glossary: [
      { term: 'Multi-Head Attention', definition: 'Computing attention multiple times in parallel with different projection matrices.' },
      { term: 'Residual Connection', definition: 'A skip connection that adds a layer’s input directly to its output tensor.' },
    ],
    nextLessonId: 'ai-57',
  },
  {
    id: 'ai-57',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 57,
    difficulty: 'Beginner',
    title: {
      en: '57. Context Windows, Positional Encoding, and Long Inputs',
      bn: '৫৭. কনটেক্সট উইন্ডো, পজিশনাল এনকোডিং ও দীর্ঘ ইনপুট',
    },
    subtitle: {
      en: 'Understand context limits (4k, 32k, 128k, 1M tokens) and RoPE (Rotary Position Embeddings).',
      bn: '১২৮K ও ১M পর্যন্ত কনটেক্সট উইন্ডোর ধারণক্ষমতা ও পজিশনাল এনকোডিং।',
    },
    duration: '15 mins',
    objectives: [
      'Define Context Window as the maximum token RAM memory an LLM can process at once.',
      'Explain Positional Encoding (RoPE) so models know word order.',
      'Understand Quadratic Computational Complexity O(N^2) of self-attention.',
    ],
    prerequisites: 'Lesson 56',
    explanation: {
      simple: {
        en: 'The Context Window is the LLM’s short-term memory during a chat conversation! If a model has a 128,000 token context window, it can read and remember an entire 300-page book in a single prompt.',
        bn: 'কনটেক্সট উইন্ডো হলো LLM-এর শর্ট-টার্ম মেমরি। ১২৮,০০০ টোকেন উইন্ডো দিয়ে একটি পুরো বই একবারে পড়ে উত্তর দেওয়া সম্ভব।',
      },
      analogy: {
        en: 'Think of a teacher’s whiteboard. A 4K context window is a tiny desk notepad. A 1M context window is a giant stadium scoreboard where you can paste entire text books at once!',
        bn: 'ছোট নোটপ্যাডের বদলে স্টেডিয়ামের বিশাল ডিজিটাল স্কোরবোর্ডের মতো যাতে পুরো বই পেস্ট করা যায়।',
      },
      technical: {
        en: 'Without Positional Encoding (e.g. RoPE: Rotary Position Embeddings), self-attention is permutation invariant (sees "Dog bites man" as identical to "Man bites dog"). Attention memory grows quadratically O(N^2) with context length N.',
        bn: 'পজিশনাল এনকোডিং ছাড়া বাক্য এলোমেলো মনে হয়। পজিশনাল এনকোডিং শব্দের ক্রম মনে রাখতে সাহায্য করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Increasing the Context Window from 4k to 128k requires 0 extra GPU memory.',
        correction: 'Self-attention KV Cache grows significantly with context length, requiring specialized attention optimizations (FlashAttention).',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why does an AI need "Positional Encoding" if it already knows word meanings?',
      modelAnswer: 'Because self-attention compares all words at once regardless of order! Without Positional Encoding, "Dog bites man" and "Man bites dog" would look identical to the AI because it wouldn’t know which word came first!',
      checklist: ['Explained that self-attention has no inherent word order.', 'Showed why word position changes meaning.'],
    },
    quiz: {
      question: 'What is the term for the maximum number of tokens an LLM can read and hold in active memory at one time?',
      options: ['Hard Drive Storage', 'Context Window', 'Clock Speed', 'Thermal Limit'],
      correctAnswer: 1,
      explanation: 'Context Window defines the maximum token capacity an LLM can process in a single prompt session.',
    },
    simulationType: 'context-window-demo',
    codeLab: {
      title: 'Context Window Usage Tracker',
      language: 'python',
      starterCode: `# Context Window Limit Checker
max_context_window = 32768 # 32k tokens
prompt_text_words = 15000
approx_tokens = int(prompt_text_words * 1.3)

remaining_tokens = max_context_window - approx_tokens

print(f"Prompt Tokens: {approx_tokens} / {max_context_window}")
print(f"Remaining Capacity for Output Response: {remaining_tokens} tokens")
`,
      expectedOutput: 'Prompt Tokens: 19500 / 32768\nRemaining Capacity for Output Response: 13268 tokens',
      explanation: 'Prompt tokens consume space within the available maximum context window capacity.',
    },
    summary: ['Context Window dictates maximum working token memory; Positional Encoding (RoPE) preserves word order.'],
    glossary: [
      { term: 'Context Window', definition: 'The maximum length of tokens a model can process in a single inference pass.' },
      { term: 'RoPE', definition: 'Rotary Position Embedding: a method of encoding positional information into self-attention.' },
    ],
    nextLessonId: 'ai-58',
  },
  {
    id: 'ai-58',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 58,
    difficulty: 'Beginner',
    title: {
      en: '58. Pretraining, Fine-Tuning, Instruction Tuning, and RLHF',
      bn: '৫৮. প্রি-ট্রেনিং, ফাইন-টিউনিং, ইন্সট্রাকশন টিউনিং এবং RLHF',
    },
    subtitle: {
      en: 'Understand the 3 stages: Base Model -> Instruct Model -> RLHF Aligned Model.',
      bn: 'বেস মডেল থেকে ইন্সট্রাক্ট এবং RLHF দিয়ে নিরাপদ চ্যাটবট বানানোর ধাপসমূহ।',
    },
    duration: '15 mins',
    objectives: [
      'Distinguish Pretraining (unsupervised next-token prediction on trillions of words) from Fine-Tuning.',
      'Explain Instruction Tuning (SFT: Supervised Fine-Tuning) for chatbot behavior.',
      'Understand Reinforcement Learning from Human Feedback (RLHF) and DPO for alignment.',
    ],
    prerequisites: 'Lesson 57',
    explanation: {
      simple: {
        en: 'Building ChatGPT happens in 3 stages: 1) Pretraining: Read the entire internet to learn language patterns (Base Model). 2) Instruction Tuning: Teach the model how to answer questions politely (Instruct Model). 3) RLHF: Human raters score answers to make the chatbot helpful, honest, and harmless!',
        bn: 'চ্যাটজিপিটি তৈরির ৩টি ধাপ: ১) প্রি-ট্রেনিং (ইন্টারনেট পড়ে ভাষা শেখা), ২) ইন্সট্রাকশন টিউনিং (প্রশ্নোত্তর উত্তর শেখা), ৩) RLHF (মানুষের রেটিং দিয়ে সাহায্যকারী ও নিরাপদ করা)।',
      },
      analogy: {
        en: 'Pretraining is graduating from college (possessing vast general knowledge). Instruction Tuning is attending customer service training. RLHF is getting weekly performance reviews from senior managers!',
        bn: 'প্রি-ট্রেনিং হলো কলেজ পাস করা। ইন্সট্রাকশন টিউনিং হলো কাস্টমার কেয়ার ট্রেনিং। আর RLHF হলো প্রতি সপ্তাহের কাজের ফিডব্যাক রিভিউ।',
      },
      technical: {
        en: 'Pretraining minimizes Next-Token Perplexity on trillions of tokens. Supervised Fine-Tuning (SFT) trains on (Prompt, Response) pairs. RLHF uses a Reward Model R(x, y) to optimize policy parameters via PPO (Proximal Policy Optimization) or DPO.',
        bn: 'RLHF-এ রিওয়ার্ড মডেল ও PPO/DPO অ্যালগরিদম দিয়ে আউটপুট হিউম্যান অ্যালাইনমেন্ট নিশ্চিত করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'RLHF is where the AI learns 99% of its factual knowledge about history and science.',
        correction: '99% of factual knowledge is learned during Pretraining. RLHF merely tunes the model’s tone, format, and alignment safety rules.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what RLHF (Reinforcement Learning from Human Feedback) does.',
      modelAnswer: 'RLHF is the final tuning stage where humans rate different AI responses to teach the model which answers are helpful, accurate, and safe, turning a raw text generator into a polite chatbot!',
      checklist: ['Mentioned human rating of AI responses.', 'Explained aligning outputs to be helpful and safe.'],
    },
    quiz: {
      question: 'Which training stage imparts 99% of the core world knowledge and grammar into a Large Language Model?',
      options: ['Reinforcement Learning (RLHF)', 'Pretraining on Trillions of Tokens', 'Prompt System Instruction', 'Installing User Plugins'],
      correctAnswer: 1,
      explanation: 'Pretraining on massive text corpora imparts the primary world knowledge and linguistic grammar.',
    },
    simulationType: 'training-stages-demo',
    codeLab: {
      title: 'Model Alignment Stage Tracker',
      language: 'python',
      starterCode: `# 3-Stage Model Pipeline Output Simulator
def generate_response(prompt, stage):
    if stage == "Base Model":
        return prompt + " is a document format created in 1990..." # Just continues text
    elif stage == "Instruct Model":
        return "Here is the answer to your question about PDF."
    elif stage == "RLHF Aligned":
        return "I would be happy to help! Here is a safe and detailed explanation of PDF."

print("Base ->", generate_response("Explain PDF", "Base Model"))
print("RLHF ->", generate_response("Explain PDF", "RLHF Aligned"))
`,
      expectedOutput: 'Base -> Explain PDF is a document format created in 1990...\nRLHF -> I would be happy to help! Here is a safe and detailed explanation of PDF.',
      explanation: 'Pretrained Base models complete text; RLHF aligned models respond as helpful assistants.',
    },
    summary: ['LLMs progress from Pretrained Base models -> Supervised Instruction Tuning -> RLHF Human Feedback Alignment.'],
    glossary: [
      { term: 'Pretraining', definition: 'The initial self-supervised training phase of an LLM on vast text datasets.' },
      { term: 'RLHF', definition: 'Reinforcement Learning from Human Feedback: optimizing model responses based on human preference ratings.' },
    ],
    nextLessonId: 'ai-59',
  },
  {
    id: 'ai-59',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 59,
    difficulty: 'Beginner',
    title: {
      en: '59. How ChatGPT Generates an Answer: From Prompt to Output',
      bn: '৫৯. চ্যাটজিপিটি কীভাবে উত্তর তৈরি করে: প্রম্পট থেকে আউটপুটের ভেতরের ঘটনা',
    },
    subtitle: {
      en: 'Trace System Prompts, Tokenization, GPU KV-Cache, Sampling, and Streaming.',
      bn: 'সিস্টেম প্রম্পট, টোকেনাইজার, KV-ক্যাশ ও স্ট্রিমিং উত্তরের ভেতরের সিস্টেম।',
    },
    duration: '15 mins',
    objectives: [
      'Trace the complete life of a user query from UI input to streamed output.',
      'Understand System Prompts ("You are a helpful assistant").',
      'Explain KV-Caching for accelerating autoregressive token generation.',
    ],
    prerequisites: 'Lesson 58',
    explanation: {
      simple: {
        en: 'When you press Send in ChatGPT: 1) App attaches a hidden System Prompt, 2) Tokenizer converts text to token numbers, 3) GPU calculates next token using KV-Cache, 4) Token is decoded to word text, 5) Word streams character-by-character to your screen!',
        bn: 'মেসেজ সেন্ড করলে: ১) হিডেন সিস্টেম প্রম্পট যুক্ত হয়, ২) টোকেনাইজার কোড করে, ৩) জিপিউ KV-ক্যাশ দিয়ে পরের শব্দ গণনা করে, ৪) ব্রাউজারে ওয়ার্ড স্ট্রিম হিসেবে ভেসে ওঠে।',
      },
      analogy: {
        en: 'It’s like an instant news reporter dictating a breaking story word-by-word over a live satellite phone call straight to a live television broadcast banner!',
        bn: 'স্যাটেলাইট টিভি সংবাদের মতো এক এক শব্দ লাইভ অন-স্ক্রিন ভেসে ওঠার দৃশ্য।',
      },
      technical: {
        en: 'Generation Pipeline: System Prompt Prep -> BPE Tokenization -> Embedding + RoPE -> Transformer Layer Pass -> KV-Cache Fetch/Update -> Logit Softmax Sampling (Temp/Top-P) -> SSE Text Streaming (Server-Sent Events).',
        bn: 'জেনারেশন লাইন: প্রম্পট প্যাক -> টোকেনাইজার -> টেনসর মেমরি -> KV-ক্যাশ -> SSE স্ট্রিমিং।',
      },
    },
    misconceptions: [
      {
        misconception: 'The server waits until the entire 1,000-word response is finished before sending any text to your browser.',
        correction: 'Responses use Server-Sent Events (SSE) streaming, sending each token to your screen as soon as it is generated.',
      },
    ],
    feynmanChallenge: {
      prompt: 'What is the role of a "System Prompt" in a chatbot API request?',
      modelAnswer: 'A System Prompt is a hidden instruction sent before the user’s message that sets the chatbot’s persona, tone, rules, and boundaries (e.g. "You are a helpful programming tutor").',
      checklist: ['Explained hidden instruction.', 'Mentioned setting persona, tone, and rules.'],
    },
    quiz: {
      question: 'Which technology enables ChatGPT to display generated words one by one on your screen in real time?',
      options: ['Server-Sent Events (SSE) / WebSockets Streaming', 'Downloading a ZIP File', 'Refreshing the Web Page', 'Bluetooth 5.0 Transfer'],
      correctAnswer: 0,
      explanation: 'Token streaming via Server-Sent Events (SSE) streams generated text tokens to the client UI as they are sampled.',
    },
    simulationType: 'chat-generation-pipeline-demo',
    codeLab: {
      title: 'Full Chat Generation Simulator with System Prompt',
      language: 'python',
      starterCode: `# Chat Generation Pipeline Simulation
system_prompt = "System: You are an expert AI tutor. Be concise."
user_prompt = "User: What is a token?"

full_input_context = f"{system_prompt}\\n{user_prompt}"
simulated_tokens = [102, 45, 881, 12] # Numerical token IDs

print("--- FULL INPUT CONTEXT SENT TO GPU ---")
print(full_input_context)
print(f"\\nTokenized IDs ({len(simulated_tokens)} tokens):", simulated_tokens)
print("Streaming Output: A token is a subword numerical unit.")
`,
      expectedOutput: '--- FULL INPUT CONTEXT SENT TO GPU ---\nSystem: You are an expert AI tutor. Be concise.\nUser: What is a token?\n\nTokenized IDs (4 tokens): [102, 45, 881, 12]\nStreaming Output: A token is a subword numerical unit.',
      explanation: 'Chat completions combine system prompts and user inputs into a unified token stream.',
    },
    summary: ['ChatGPT generation combines System Prompts, Tokenization, GPU KV-Caching, and Token Streaming via SSE.'],
    glossary: [
      { term: 'System Prompt', definition: 'Initial instructions provided to a language model to define persona and behavioral rules.' },
      { term: 'KV Cache', definition: 'Key-Value Cache: storing previously computed attention keys/values in GPU memory to speed up inference.' },
    ],
    nextLessonId: 'ai-60',
  },
  {
    id: 'ai-60',
    track: 'ai',
    chapter: 6,
    chapterTitle: 'Chapter 6: Modern AI Models and Large Language Models',
    order: 60,
    difficulty: 'Beginner',
    title: {
      en: '60. Chapter 6 Project: Inspect Tokenization and Build a Tiny Language Model',
      bn: '৬০. ৬ষ্ঠ অধ্যায়ের প্রজেক্ট: টোকেনাইজেশন পরীক্ষা ও একটি ক্ষুদ্র ল্যাঙ্গুয়েজ মডেল সিমুলেটর',
    },
    subtitle: {
      en: 'Synthesize Tokens, Embeddings, Attention, and Next-Token Generation.',
      bn: 'টোকেন, এমবেডিং, এটেনশন ও জেনারেশন মিলিয়ে ৬ষ্ঠ অধ্যায় সম্পন্ন করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Inspect token counts and BPE subwords across different text samples.',
      'Build a working N-gram Next-Token Predictor simulation in Python.',
      'Complete Chapter 6 milestone assessment and earn your Chapter 6 Badge!',
    ],
    prerequisites: 'Lessons 51 to 59 of Chapter 6',
    explanation: {
      simple: {
        en: 'Welcome to the Chapter 6 Capstone! You have learned the secrets behind modern Large Language Models. In this project, you will build a mini Next-Token Predictor in Python and inspect tokenization statistics.',
        bn: '৬ষ্ঠ অধ্যায়ের সমাপনী প্রজেক্টে স্বাগতম! এখানে আপনি পাইথনে একটি মিনি ল্যাঙ্গুয়েজ মডেল তৈরি করে টেস্ট করবেন।',
      },
      analogy: {
        en: 'Building a mini language model is like making a toy car model before driving a real sports car. It teaches you how the steering, engine, and wheels fit together!',
        bn: 'আসল গাড়ি চালানোর আগে খেলনা গাড়ি তৈরি করে ইঞ্জিনের কাজ শেখার মতো।',
      },
      technical: {
        en: 'N-gram Language Model: Computes conditional token transition probabilities P(w_t | w_{t-1}) from a text corpus using frequency counts normalized by vocabulary sums.',
        bn: 'N-গ্রাম মডেল পূর্বের শব্দের ওপর ভিত্তি করে পরবর্তী শব্দের সম্ভাবনা হিসাব করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Small N-gram models understand the world in the exact same way as 70B parameter Transformers.',
        correction: 'N-gram models only look at adjacent 1-2 words using frequency counts. Transformers use multi-head self-attention across 128k context windows.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Summarize the journey of a text prompt from user typing to LLM output.',
      modelAnswer: '1. Text -> Tokens: Tokenizer splits text into subword token IDs.\n2. Tokens -> Vectors: Embedding layer turns IDs into dense numerical vectors.\n3. Vectors -> Attention: Transformer layers compute self-attention context.\n4. Output -> Text: Model predicts next token ID, decodes to text, and streams it back!',
      checklist: ['1. Tokenization', '2. Embeddings', '3. Transformer Attention', '4. Token Prediction & Streaming'],
    },
    quiz: {
      question: 'Which component in the LLM architecture converts numerical Token IDs into dense semantic vectors?',
      options: ['Tokenizer BPE', 'Embedding Layer', 'SSD Flash Storage', 'PCIe Bus Cable'],
      correctAnswer: 1,
      explanation: 'The Embedding Layer maps discrete Token IDs into dense semantic vector representations.',
    },
    simulationType: 'chapter6-capstone-demo',
    codeLab: {
      title: 'Mini N-Gram Next-Token Predictor Generator',
      language: 'python',
      starterCode: `# Mini N-Gram Language Model Simulator
corpus = "artificial intelligence is powerful artificial intelligence is revolutionary"
words = corpus.split()

# Build bigram transition frequency dictionary
transitions = {}
for i in range(len(words) - 1):
    current, next_word = words[i], words[i+1]
    transitions.setdefault(current, []).append(next_word)

def predict_next(current_word):
    options = transitions.get(current_word, [])
    if not options:
        return "End"
    return options[0] # Pick top transition

print("Corpus Vocabulary Loaded!")
print("Predict next after 'artificial':", predict_next("artificial"))
print("Predict next after 'intelligence':", predict_next("intelligence"))
`,
      expectedOutput: "Corpus Vocabulary Loaded!\nPredict next after 'artificial': intelligence\nPredict next after 'intelligence': is",
      explanation: 'Congratulations! You have completed Chapter 6 of the AI Academy!',
    },
    summary: [
      'Chapter 6 Complete! You learned Model Checkpoints, Parameters, and Autoregressive Next-Token Prediction.',
      'You mastered Tokenization (BPE), Embeddings (Vector closeness), and Self-Attention (Q, K, V).',
      'You understand Transformers, Context Windows (RoPE), and RLHF Alignment.',
      'You built a working Mini Language Model simulator!',
    ],
    glossary: [{ term: 'N-Gram', definition: 'A contiguous sequence of n items from a given sample of text or speech.' }],
    nextLessonId: 'ai-61',
  },
];
